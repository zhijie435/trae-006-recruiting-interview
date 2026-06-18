const ScheduleConflict = require('../models/ScheduleConflict');
const Interview = require('../models/Interview');
const { sendScheduleConflictEmail } = require('./emailService');

async function getConflictList(query) {
  const {
    keyword,
    conflictType,
    status,
    priority,
    assignee,
    page = 1,
    pageSize = 10
  } = query;

  const matchStage = {};

  if (conflictType) {
    matchStage.conflictType = conflictType;
  }

  if (status) {
    matchStage.status = status;
  }

  if (priority) {
    matchStage.priority = priority;
  }

  if (assignee) {
    matchStage.assignee = assignee;
  }

  if (keyword) {
    matchStage.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { 'interviews.candidateName': { $regex: keyword, $options: 'i' } },
      { 'interviews.interviewerName': { $regex: keyword, $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { priority: -1, createdAt: -1 } }
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await ScheduleConflict.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(pageSize) });
  pipeline.push({ $limit: parseInt(pageSize) });

  const conflicts = await ScheduleConflict.aggregate(pipeline);

  const list = conflicts.map(conflict => ({
    id: conflict._id.toString(),
    conflictType: conflict.conflictType,
    status: conflict.status,
    priority: conflict.priority,
    title: conflict.title,
    description: conflict.description,
    interviews: conflict.interviews || [],
    roomName: conflict.roomName,
    assignee: conflict.assignee,
    resolvedAt: conflict.resolvedAt,
    resolvedBy: conflict.resolvedBy,
    resolution: conflict.resolution,
    communications: conflict.communications || [],
    reminderCount: conflict.reminderCount || 0,
    lastReminderAt: conflict.lastReminderAt,
    createdBy: conflict.createdBy,
    createdAt: conflict.createdAt,
    updatedAt: conflict.updatedAt
  }));

  return {
    list,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function getConflictStatistics() {
  const totalCount = await ScheduleConflict.countDocuments();
  const pendingCount = await ScheduleConflict.countDocuments({ status: 'pending' });
  const communicatingCount = await ScheduleConflict.countDocuments({ status: 'communicating' });
  const resolvedCount = await ScheduleConflict.countDocuments({ status: 'resolved' });
  const highPriorityCount = await ScheduleConflict.countDocuments({ priority: 'high', status: { $in: ['pending', 'communicating'] } });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayNewCount = await ScheduleConflict.countDocuments({
    createdAt: { $gte: startOfToday }
  });

  return {
    totalCount,
    pendingCount,
    communicatingCount,
    resolvedCount,
    highPriorityCount,
    todayNewCount
  };
}

async function getConflictById(id) {
  const conflict = await ScheduleConflict.findById(id);
  if (!conflict) {
    throw new Error('冲突记录不存在');
  }

  return {
    id: conflict._id.toString(),
    conflictType: conflict.conflictType,
    status: conflict.status,
    priority: conflict.priority,
    title: conflict.title,
    description: conflict.description,
    interviews: conflict.interviews || [],
    roomName: conflict.roomName,
    assignee: conflict.assignee,
    resolvedAt: conflict.resolvedAt,
    resolvedBy: conflict.resolvedBy,
    resolution: conflict.resolution,
    communications: conflict.communications || [],
    reminderCount: conflict.reminderCount || 0,
    lastReminderAt: conflict.lastReminderAt,
    createdBy: conflict.createdBy,
    createdAt: conflict.createdAt,
    updatedAt: conflict.updatedAt
  };
}

async function createConflict(data) {
  const conflict = await ScheduleConflict.create({
    conflictType: data.conflictType,
    status: data.status || 'pending',
    priority: data.priority || 'medium',
    title: data.title,
    description: data.description,
    interviews: data.interviews || [],
    roomName: data.roomName,
    assignee: data.assignee || 'HR',
    createdBy: data.createdBy || 'HR'
  });

  return getConflictById(conflict._id);
}

async function updateConflict(id, data) {
  const conflict = await ScheduleConflict.findById(id);
  if (!conflict) {
    throw new Error('冲突记录不存在');
  }

  const allowedUpdates = [
    'conflictType', 'status', 'priority', 'title', 'description',
    'interviews', 'roomName', 'assignee', 'resolution'
  ];

  allowedUpdates.forEach(field => {
    if (data[field] !== undefined) {
      conflict[field] = data[field];
    }
  });

  if (data.status === 'resolved' && !conflict.resolvedAt) {
    conflict.resolvedAt = new Date();
    conflict.resolvedBy = data.operator || 'HR';
  }

  await conflict.save();
  return getConflictById(id);
}

async function deleteConflict(id) {
  const conflict = await ScheduleConflict.findByIdAndDelete(id);
  if (!conflict) {
    throw new Error('冲突记录不存在');
  }
  return { success: true };
}

async function addCommunication(id, data) {
  const conflict = await ScheduleConflict.findById(id);
  if (!conflict) {
    throw new Error('冲突记录不存在');
  }

  conflict.communications = conflict.communications || [];
  conflict.communications.push({
    type: data.type || 'note',
    content: data.content,
    operator: data.operator || 'HR',
    target: data.target,
    createdAt: new Date()
  });

  if (conflict.status === 'pending') {
    conflict.status = 'communicating';
  }

  await conflict.save();
  return getConflictById(id);
}

async function sendReminder(conflictId, targets, note) {
  const conflict = await ScheduleConflict.findById(conflictId);
  if (!conflict) {
    throw new Error('冲突记录不存在');
  }

  if (conflict.status === 'resolved' || conflict.status === 'cancelled') {
    throw new Error('该冲突已处理完成，无需催办');
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  const emailTargets = targets && targets.length > 0
    ? targets
    : collectDefaultTargets(conflict);

  for (const target of emailTargets) {
    try {
      const result = await sendScheduleConflictEmail(target, conflict, note);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      results.push({
        target: target.email,
        name: target.name,
        role: target.role,
        success: result.success,
        error: result.error
      });
    } catch (error) {
      failCount++;
      results.push({
        target: target.email,
        name: target.name,
        role: target.role,
        success: false,
        error: error.message
      });
    }
  }

  conflict.reminderCount = (conflict.reminderCount || 0) + 1;
  conflict.lastReminderAt = new Date();

  conflict.communications = conflict.communications || [];
  conflict.communications.push({
    type: 'email_sent',
    content: `已向 ${successCount + failCount} 位相关人员发送日程冲突催办邮件（成功 ${successCount} 封，失败 ${failCount} 封）${note ? '。备注：' + note : ''}`,
    operator: 'HR',
    target: emailTargets.map(t => `${t.name}(${t.role})`).join(', '),
    createdAt: new Date()
  });

  if (conflict.status === 'pending') {
    conflict.status = 'communicating';
  }

  await conflict.save();

  return {
    success: successCount,
    failed: failCount,
    results
  };
}

function collectDefaultTargets(conflict) {
  const targets = [];
  const seen = new Set();

  (conflict.interviews || []).forEach(interview => {
    if (interview.interviewerEmail && !seen.has(interview.interviewerEmail)) {
      targets.push({
        name: interview.interviewerName,
        email: interview.interviewerEmail,
        role: 'interviewer'
      });
      seen.add(interview.interviewerEmail);
    }
    if (interview.candidateEmail && !seen.has(interview.candidateEmail)) {
      targets.push({
        name: interview.candidateName,
        email: interview.candidateEmail,
        role: 'candidate'
      });
      seen.add(interview.candidateEmail);
    }
  });

  return targets;
}

async function detectConflicts() {
  const interviews = await Interview.find({
    status: 'pending'
  }).sort({ interviewTime: 1 });

  const conflicts = [];

  const interviewerMap = new Map();
  const candidateMap = new Map();

  interviews.forEach(interview => {
    const timeKey = new Date(interview.interviewTime).toISOString().slice(0, 16);

    const interviewerKey = `${interview.interviewerId}_${timeKey}`;
    if (!interviewerMap.has(interviewerKey)) {
      interviewerMap.set(interviewerKey, []);
    }
    interviewerMap.get(interviewerKey).push(interview);

    const candidateKey = `${interview.candidateId}_${timeKey}`;
    if (!candidateMap.has(candidateKey)) {
      candidateMap.set(candidateKey, []);
    }
    candidateMap.get(candidateKey).push(interview);
  });

  for (const [, group] of interviewerMap) {
    if (group.length > 1) {
      conflicts.push({
        conflictType: 'interviewer_schedule',
        title: `面试官「${group[0].interviewer.name}」时间冲突`,
        description: `同一时间段有 ${group.length} 场面试安排`,
        interviews: group.map(i => formatInterviewForConflict(i)),
        priority: group.length >= 3 ? 'high' : 'medium'
      });
    }
  }

  for (const [, group] of candidateMap) {
    if (group.length > 1) {
      conflicts.push({
        conflictType: 'candidate_schedule',
        title: `候选人「${group[0].candidate.name}」时间冲突`,
        description: `同一时间段有 ${group.length} 场面试安排`,
        interviews: group.map(i => formatInterviewForConflict(i)),
        priority: 'high'
      });
    }
  }

  return conflicts;
}

function formatInterviewForConflict(interview) {
  return {
    interviewId: interview._id,
    candidateName: interview.candidate.name,
    candidateEmail: interview.candidate.email,
    interviewerName: interview.interviewer.name,
    interviewerEmail: interview.interviewer.email,
    interviewTime: interview.interviewTime,
    interviewType: interview.interviewType,
    round: interview.round,
    position: interview.candidate.position,
    department: interview.candidate.department
  };
}

module.exports = {
  getConflictList,
  getConflictStatistics,
  getConflictById,
  createConflict,
  updateConflict,
  deleteConflict,
  addCommunication,
  sendReminder,
  detectConflicts
};
