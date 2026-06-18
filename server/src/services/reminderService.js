const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const { sendEvaluationReminderEmail } = require('./emailService');

async function getReminderList(query) {
  const {
    keyword,
    evaluationStatus,
    department,
    overdueDays,
    page = 1,
    pageSize = 10
  } = query;

  const matchStage = {};

  matchStage.evaluationStatus = { $in: ['pending', 'overdue'] };

  if (evaluationStatus) {
    matchStage.evaluationStatus = evaluationStatus;
  }

  if (department) {
    matchStage['candidate.department'] = department;
  }

  if (keyword) {
    matchStage.$or = [
      { 'candidate.name': { $regex: keyword, $options: 'i' } },
      { 'interviewer.name': { $regex: keyword, $options: 'i' } }
    ];
  }

  if (overdueDays) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - parseInt(overdueDays));
    matchStage.evaluationDeadline = { $lte: thresholdDate };
    matchStage.evaluationStatus = 'overdue';
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { evaluationDeadline: 1 } },
    {
      $lookup: {
        from: 'reminders',
        localField: '_id',
        foreignField: 'interviewId',
        as: 'reminders'
      }
    },
    {
      $addFields: {
        reminderCount: { $size: '$reminders' }
      }
    },
    { $project: { reminders: 0 } }
  ];

  const countPipeline = [...pipeline];
  countPipeline.push({ $count: 'total' });

  const countResult = await Interview.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(pageSize) });
  pipeline.push({ $limit: parseInt(pageSize) });

  const interviews = await Interview.aggregate(pipeline);

  const list = interviews.map(interview => {
    const now = new Date();
    const deadline = new Date(interview.evaluationDeadline);
    const status = deadline < now && interview.evaluationStatus === 'pending' ? 'overdue' : interview.evaluationStatus;

    return {
      id: interview._id.toString(),
      interviewId: interview._id.toString(),
      interview: {
        id: interview._id.toString(),
        candidateId: interview.candidateId?.toString() || '',
        candidate: interview.candidate,
        interviewerId: interview.interviewerId?.toString() || '',
        interviewer: interview.interviewer,
        interviewTime: interview.interviewTime,
        interviewType: interview.interviewType,
        round: interview.round,
        status: interview.status,
        evaluationDeadline: interview.evaluationDeadline,
        evaluationStatus: status
      },
      type: 'evaluation',
      status: status === 'pending' ? 'pending' : 'sent',
      channel: 'email',
      createdBy: 'system',
      createdAt: interview.createdAt,
      reminderCount: interview.reminderCount || 0
    };
  });

  await updateOverdueStatus();

  return {
    list,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function updateOverdueStatus() {
  const now = new Date();
  await Interview.updateMany(
    {
      evaluationStatus: 'pending',
      evaluationDeadline: { $lt: now }
    },
    { $set: { evaluationStatus: 'overdue' } }
  );
}

async function getStatistics() {
  await updateOverdueStatus();

  const totalPending = await Interview.countDocuments({
    evaluationStatus: { $in: ['pending', 'overdue'] }
  });

  const overdueCount = await Interview.countDocuments({
    evaluationStatus: 'overdue'
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayReminderCount = await Reminder.countDocuments({
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekReminderCount = await Reminder.countDocuments({
    createdAt: { $gte: startOfWeek }
  });

  return {
    totalPending,
    overdueCount,
    todayReminderCount,
    thisWeekReminderCount
  };
}

async function sendReminder(interviewId, note) {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('面试记录不存在');
  }

  if (interview.evaluationStatus === 'submitted') {
    throw new Error('该面试评价已提交，无需催办');
  }

  const result = await sendEvaluationReminderEmail(
    interview.interviewer,
    interview.candidate,
    interview
  );

  const reminder = await Reminder.create({
    interviewId: interview._id,
    interview: interview.toObject(),
    type: 'evaluation',
    status: result.success ? 'sent' : 'failed',
    channel: 'email',
    sentAt: result.success ? new Date() : null,
    createdBy: 'admin',
    note: note || '',
    errorMessage: result.success ? null : result.error
  });

  return {
    id: reminder._id.toString(),
    interviewId: reminder.interviewId.toString(),
    interview: {
      id: interview._id.toString(),
      candidate: interview.candidate,
      interviewer: interview.interviewer,
      interviewTime: interview.interviewTime,
      interviewType: interview.interviewType,
      round: interview.round,
      evaluationDeadline: interview.evaluationDeadline,
      evaluationStatus: interview.evaluationStatus
    },
    type: reminder.type,
    status: reminder.status,
    channel: reminder.channel,
    sentAt: reminder.sentAt,
    createdBy: reminder.createdBy,
    createdAt: reminder.createdAt,
    note: reminder.note
  };
}

async function sendBatchReminders(interviewIds, note) {
  const results = [];
  let success = 0;
  let failed = 0;

  for (const id of interviewIds) {
    try {
      const result = await sendReminder(id, note);
      results.push(result);
      success++;
    } catch (error) {
      failed++;
      results.push({
        interviewId: id,
        status: 'failed',
        error: error.message
      });
    }
  }

  return { success, failed, results };
}

async function getReminderHistory(interviewId) {
  const reminders = await Reminder.find({ interviewId }).sort({ createdAt: -1 });

  return reminders.map(reminder => ({
    id: reminder._id.toString(),
    interviewId: reminder.interviewId.toString(),
    type: reminder.type,
    status: reminder.status,
    channel: reminder.channel,
    sentAt: reminder.sentAt,
    createdBy: reminder.createdBy,
    createdAt: reminder.createdAt,
    note: reminder.note
  }));
}

module.exports = {
  getReminderList,
  getStatistics,
  sendReminder,
  sendBatchReminders,
  getReminderHistory
};
