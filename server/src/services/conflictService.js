const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const { sendConflictReminderEmail } = require('./emailService');

const INTERVIEW_DURATION_MIN = 60;

async function detectConflicts() {
  const now = new Date();
  const futureInterviews = await Interview.find({
    interviewTime: { $gte: now }
  }).sort({ interviewTime: 1 });

  const byInterviewer = new Map();
  for (const iv of futureInterviews) {
    const key = iv.interviewerId.toString();
    if (!byInterviewer.has(key)) {
      byInterviewer.set(key, []);
    }
    byInterviewer.get(key).push(iv);
  }

  const conflicts = [];
  for (const [interviewerId, interviews] of byInterviewer) {
    if (interviews.length < 2) continue;

    interviews.sort((a, b) => new Date(a.interviewTime) - new Date(b.interviewTime));

    let cluster = [interviews[0]];
    let clusterEnd = addMinutes(new Date(interviews[0].interviewTime), INTERVIEW_DURATION_MIN);

    for (let i = 1; i < interviews.length; i++) {
      const iv = interviews[i];
      const ivStart = new Date(iv.interviewTime);
      if (ivStart <= clusterEnd) {
        cluster.push(iv);
        const ivEnd = addMinutes(new Date(iv.interviewTime), INTERVIEW_DURATION_MIN);
        if (ivEnd > clusterEnd) {
          clusterEnd = ivEnd;
        }
      } else {
        if (cluster.length >= 2) {
          conflicts.push(buildConflict(interviewerId, cluster));
        }
        cluster = [iv];
        clusterEnd = addMinutes(new Date(iv.interviewTime), INTERVIEW_DURATION_MIN);
      }
    }
    if (cluster.length >= 2) {
      conflicts.push(buildConflict(interviewerId, cluster));
    }
  }

  return conflicts;
}

function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function buildConflict(interviewerId, interviews) {
  const sorted = [...interviews].sort(
    (a, b) => new Date(a.interviewTime) - new Date(b.interviewTime)
  );
  const minStart = new Date(sorted[0].interviewTime);
  const conflictKey = `${interviewerId}_${minStart.toISOString()}`;
  const interviewer = sorted[0].interviewer;

  return {
    conflictKey,
    interviewerId,
    interviewer,
    conflictTime: minStart,
    interviews: sorted.map(iv => ({
      id: iv._id.toString(),
      candidateId: iv.candidateId ? iv.candidateId.toString() : '',
      candidate: iv.candidate,
      interviewerId: iv.interviewerId ? iv.interviewerId.toString() : '',
      interviewer: iv.interviewer,
      interviewTime: iv.interviewTime,
      interviewType: iv.interviewType,
      round: iv.round,
      status: iv.status
    }))
  };
}

async function getReminderCountMap(conflictKeys) {
  if (!conflictKeys || conflictKeys.length === 0) return {};
  const result = await Reminder.aggregate([
    {
      $match: {
        type: 'schedule_conflict',
        conflictKey: { $in: conflictKeys }
      }
    },
    {
      $group: {
        _id: '$conflictKey',
        count: { $sum: 1 }
      }
    }
  ]);
  const map = {};
  for (const r of result) {
    map[r._id] = r.count;
  }
  return map;
}

async function getConflictList(query) {
  const { keyword, department, page = 1, pageSize = 10 } = query;
  const conflicts = await detectConflicts();

  let filtered = conflicts;

  if (keyword) {
    filtered = filtered.filter(
      c =>
        c.interviewer.name.includes(keyword) ||
        c.interviews.some(iv => iv.candidate.name.includes(keyword))
    );
  }

  if (department) {
    filtered = filtered.filter(c =>
      c.interviews.some(iv => iv.candidate.department === department)
    );
  }

  filtered.sort(
    (a, b) => new Date(a.conflictTime) - new Date(b.conflictTime)
  );

  const conflictKeys = filtered.map(c => c.conflictKey);
  const reminderCountMap = await getReminderCountMap(conflictKeys);

  const list = filtered.map(c => ({
    ...c,
    reminderCount: reminderCountMap[c.conflictKey] || 0
  }));

  const total = list.length;
  const startIdx = (parseInt(page) - 1) * parseInt(pageSize);
  const paged = list.slice(startIdx, startIdx + parseInt(pageSize));

  return {
    list: paged,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function getConflictStatistics() {
  const conflicts = await detectConflicts();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const todaySentCount = await Reminder.countDocuments({
    type: 'schedule_conflict',
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  const weekSentCount = await Reminder.countDocuments({
    type: 'schedule_conflict',
    createdAt: { $gte: startOfWeek }
  });

  return {
    totalConflicts: conflicts.length,
    pendingCount: conflicts.length,
    todaySentCount,
    weekSentCount
  };
}

async function findConflictByKey(conflictKey) {
  const conflicts = await detectConflicts();
  return conflicts.find(c => c.conflictKey === conflictKey);
}

async function sendConflictReminder(conflictKey, note) {
  const conflict = await findConflictByKey(conflictKey);
  if (!conflict) {
    throw new Error('冲突记录不存在或已被解决');
  }

  const result = await sendConflictReminderEmail(conflict, note);

  const reminder = await Reminder.create({
    interviewId: conflict.interviews[0].id,
    interview: {
      interviewer: conflict.interviewer,
      interviews: conflict.interviews,
      conflictTime: conflict.conflictTime
    },
    type: 'schedule_conflict',
    conflictKey: conflict.conflictKey,
    status: result.success ? 'sent' : 'failed',
    channel: 'email',
    sentAt: result.success ? new Date() : null,
    createdBy: 'admin',
    note: note || '',
    errorMessage: result.success ? null : result.error
  });

  return {
    id: reminder._id.toString(),
    conflictKey: conflict.conflictKey,
    interviewer: conflict.interviewer,
    type: 'schedule_conflict',
    status: reminder.status,
    channel: reminder.channel,
    sentAt: reminder.sentAt,
    createdAt: reminder.createdAt,
    note: reminder.note
  };
}

async function sendBatchConflictReminders(conflictKeys, note) {
  const results = [];
  let success = 0;
  let failed = 0;

  for (const key of conflictKeys) {
    try {
      const result = await sendConflictReminder(key, note);
      results.push(result);
      success++;
    } catch (error) {
      failed++;
      results.push({
        conflictKey: key,
        status: 'failed',
        error: error.message
      });
    }
  }

  return { success, failed, results };
}

async function getConflictHistory(conflictKey) {
  const reminders = await Reminder.find({
    type: 'schedule_conflict',
    conflictKey
  }).sort({ createdAt: -1 });

  return reminders.map(reminder => ({
    id: reminder._id.toString(),
    conflictKey: reminder.conflictKey,
    type: reminder.type,
    status: reminder.status,
    channel: reminder.channel,
    sentAt: reminder.sentAt,
    createdBy: reminder.createdBy,
    createdAt: reminder.createdAt,
    note: reminder.note,
    errorMessage: reminder.errorMessage
  }));
}

module.exports = {
  getConflictList,
  getConflictStatistics,
  sendConflictReminder,
  sendBatchConflictReminders,
  getConflictHistory
};
