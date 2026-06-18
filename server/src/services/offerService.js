const Offer = require('../models/Offer');
const emailService = require('./emailService');

const STATUS_META = {
  draft: { label: '草稿', color: 'default' },
  pending_approval: { label: '审批中', color: 'processing' },
  approved: { label: '审批通过', color: 'success' },
  rejected: { label: '审批驳回', color: 'error' },
  sent: { label: '已发出', color: 'blue' },
  accepted: { label: '候选人接受', color: 'success' },
  declined: { label: '候选人拒绝', color: 'error' },
  withdrawn: { label: '已撤回', color: 'warning' }
};

const EMPLOYMENT_TYPE_MAP = {
  full_time: '全职',
  part_time: '兼职',
  contract: '外包',
  intern: '实习'
};

const ALLOWED_TRANSITIONS = {
  draft: ['pending_approval', 'withdrawn'],
  pending_approval: ['approved', 'rejected', 'draft'],
  approved: ['sent', 'withdrawn'],
  rejected: ['draft'],
  sent: ['accepted', 'declined', 'withdrawn'],
  accepted: [],
  declined: [],
  withdrawn: []
};

function canTransition(from, to) {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

async function generateOfferNo() {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const count = await Offer.countDocuments({
    offerNo: new RegExp(`^OF-${ymd}`)
  });
  return `OF-${ymd}-${String(count + 1).padStart(3, '0')}`;
}

function buildOfferNoFilter(keyword) {
  if (!keyword) return {};
  return {
    $or: [
      { offerNo: { $regex: keyword, $options: 'i' } },
      { candidateName: { $regex: keyword, $options: 'i' } },
      { position: { $regex: keyword, $options: 'i' } },
      { department: { $regex: keyword, $options: 'i' } }
    ]
  };
}

async function getOfferList(query) {
  const {
    keyword,
    status,
    department,
    page = 1,
    pageSize = 10
  } = query;

  const filter = buildOfferNoFilter(keyword);

  if (status) {
    filter.status = status;
  }

  if (department) {
    filter.department = department;
  }

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  const [list, total] = await Promise.all([
    Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Offer.countDocuments(filter)
  ]);

  const decorated = list.map(item => ({
    ...item,
    id: item._id.toString(),
    statusLabel: STATUS_META[item.status]?.label || item.status,
    statusColor: STATUS_META[item.status]?.color || 'default',
    employmentTypeLabel: EMPLOYMENT_TYPE_MAP[item.employmentType] || item.employmentType,
    entryDateText: item.entryDate ? formatDate(item.entryDate) : '',
    createdAtText: formatDate(item.createdAt),
    updatedAtText: formatDate(item.updatedAt)
  }));

  return {
    list: decorated,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function getOfferStatistics() {
  const groups = await Offer.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const stats = {
    total: 0,
    draft: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    sent: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0
  };

  groups.forEach(g => {
    stats[g._id] = g.count;
    stats.total += g.count;
  });

  stats.pendingAction = stats.draft + stats.pending_approval + stats.approved;
  return stats;
}

async function getOfferDetail(id) {
  const offer = await Offer.findById(id).lean();
  if (!offer) {
    throw new Error('Offer 不存在');
  }

  return decorateOffer(offer);
}

function decorateOffer(offer) {
  const logs = (offer.approvalLogs || []).map(log => ({
    ...log,
    operatedAtText: formatDate(log.operatedAt)
  }));

  return {
    ...offer,
    id: offer._id.toString(),
    statusLabel: STATUS_META[offer.status]?.label || offer.status,
    statusColor: STATUS_META[offer.status]?.color || 'default',
    employmentTypeLabel: EMPLOYMENT_TYPE_MAP[offer.employmentType] || offer.employmentType,
    entryDateText: offer.entryDate ? formatDate(offer.entryDate) : '',
    createdAtText: formatDate(offer.createdAt),
    updatedAtText: formatDate(offer.updatedAt),
    approvalLogs: logs,
    nextActions: getNextActions(offer)
  };
}

function getNextActions(offer) {
  const actions = [];
  switch (offer.status) {
    case 'draft':
      actions.push({ action: 'submit', label: '提交审批', type: 'primary' });
      actions.push({ action: 'withdraw', label: '撤回', type: 'default' });
      break;
    case 'pending_approval':
      actions.push({ action: 'approve', label: '审批通过', type: 'primary' });
      actions.push({ action: 'reject', label: '驳回', type: 'danger' });
      actions.push({ action: 'rollback', label: '退回修改', type: 'default' });
      break;
    case 'approved':
      actions.push({ action: 'send', label: '发出 Offer', type: 'primary' });
      actions.push({ action: 'withdraw', label: '撤回', type: 'default' });
      break;
    case 'rejected':
      actions.push({ action: 'edit', label: '修改后重提', type: 'primary' });
      break;
    case 'sent':
      actions.push({ action: 'accept', label: '标记接受', type: 'primary' });
      actions.push({ action: 'decline', label: '标记拒绝', type: 'danger' });
      actions.push({ action: 'withdraw', label: '撤回', type: 'default' });
      break;
    default:
      break;
  }
  return actions;
}

async function createOffer(data, operator = 'system') {
  const offerNo = await generateOfferNo();

  const offer = await Offer.create({
    offerNo,
    candidateName: data.candidateName,
    candidatePhone: data.candidatePhone || '',
    candidateEmail: data.candidateEmail || '',
    position: data.position,
    department: data.department,
    employmentType: data.employmentType || 'full_time',
    workLocation: data.workLocation || '',
    salaryMonthly: data.salaryMonthly || null,
    salaryMonths: data.salaryMonths || 13,
    bonus: data.bonus || '',
    probationMonths: data.probationMonths ?? 3,
    entryDate: data.entryDate || null,
    remark: data.remark || '',
    status: 'draft',
    currentStep: 0,
    approvalLogs: [],
    createdBy: operator,
    updatedBy: operator
  });

  return decorateOffer(offer.toObject());
}

async function updateOffer(id, data, operator = 'system') {
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new Error('Offer 不存在');
  }

  if (!['draft', 'rejected'].includes(offer.status)) {
    throw new Error(`当前状态「${STATUS_META[offer.status].label}」不允许修改`);
  }

  const editableFields = [
    'candidateName', 'candidatePhone', 'candidateEmail',
    'position', 'department', 'employmentType', 'workLocation',
    'salaryMonthly', 'salaryMonths', 'bonus', 'probationMonths',
    'entryDate', 'remark'
  ];

  editableFields.forEach(field => {
    if (data[field] !== undefined) {
      offer[field] = data[field];
    }
  });

  offer.updatedBy = operator;
  await offer.save();

  return decorateOffer(offer.toObject());
}

async function transition(id, action, operator, comment = '') {
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new Error('Offer 不存在');
  }

  const transitions = {
    submit: { from: 'draft', to: 'pending_approval', step: 1, stepName: '提交审批', actionText: '提交审批' },
    approve: { from: 'pending_approval', to: 'approved', step: 2, stepName: '审批通过', actionText: '审批通过' },
    reject: { from: 'pending_approval', to: 'rejected', step: 2, stepName: '审批驳回', actionText: '驳回' },
    rollback: { from: 'pending_approval', to: 'draft', step: 0, stepName: '退回修改', actionText: '退回修改' },
    send: { from: 'approved', to: 'sent', step: 3, stepName: '发出 Offer', actionText: '发出 Offer' },
    accept: { from: 'sent', to: 'accepted', step: 4, stepName: '候选人接受', actionText: '标记候选人接受' },
    decline: { from: 'sent', to: 'declined', step: 4, stepName: '候选人拒绝', actionText: '标记候选人拒绝' },
    withdraw: { from: null, to: 'withdrawn', step: 0, stepName: '撤回', actionText: '撤回' }
  };

  const rule = transitions[action];
  if (!rule) {
    throw new Error('不支持的操作类型');
  }

  if (rule.from && offer.status !== rule.from) {
    throw new Error(`当前状态「${STATUS_META[offer.status].label}」不能执行此操作`);
  }

  if (rule.from && !canTransition(rule.from, rule.to)) {
    throw new Error(`状态流转不允许：${STATUS_META[rule.from].label} -> ${STATUS_META[rule.to].label}`);
  }

  const previousStatus = offer.status;

  offer.approvalLogs.push({
    step: rule.step,
    stepName: rule.stepName,
    approverName: operator,
    approverRole: '',
    action,
    actionText: rule.actionText,
    comment: comment || '',
    operatedAt: new Date()
  });

  offer.status = rule.to;
  offer.currentStep = rule.step;
  offer.updatedBy = operator;

  await offer.save();

  return {
    ...decorateOffer(offer.toObject()),
    previousStatus,
    message: `${rule.actionText}成功`
  };
}

async function submitOffer(id, operator, comment) {
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new Error('Offer 不存在');
  }

  if (!offer.position || !offer.candidateName || !offer.department) {
    throw new Error('请补全候选人姓名、岗位、部门等必填信息后再提交');
  }

  return transition(id, 'submit', operator, comment);
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function sendApprovalReminder(id, operator, reminderNote = '') {
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new Error('Offer 不存在');
  }

  if (offer.status !== 'pending_approval') {
    throw new Error(`当前状态「${STATUS_META[offer.status].label}」不允许催办`);
  }

  const reminderInterval = 30 * 60 * 1000;
  const lastReminder = offer.reminderLogs && offer.reminderLogs.length > 0
    ? offer.reminderLogs[offer.reminderLogs.length - 1]
    : null;

  if (lastReminder) {
    const timeSinceLastReminder = Date.now() - new Date(lastReminder.remindedAt).getTime();
    if (timeSinceLastReminder < reminderInterval) {
      const remainingMinutes = Math.ceil((reminderInterval - timeSinceLastReminder) / 60000);
      throw new Error(`催办过于频繁，请在 ${remainingMinutes} 分钟后再试`);
    }
  }

  offer.reminderLogs.push({
    remindedBy: operator,
    reminderNote,
    remindedAt: new Date()
  });
  offer.reminderCount = (offer.reminderCount || 0) + 1;
  offer.updatedBy = operator;

  await offer.save();

  await emailService.sendOfferApprovalReminderEmail(offer.toObject(), reminderNote);

  return {
    ...decorateOffer(offer.toObject()),
    message: '催办通知已发送'
  };
}

module.exports = {
  getOfferList,
  getOfferStatistics,
  getOfferDetail,
  createOffer,
  updateOffer,
  transition,
  submitOffer,
  sendApprovalReminder,
  STATUS_META,
  EMPLOYMENT_TYPE_MAP
};
