const mongoose = require('mongoose');

const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const Evaluation = require('../models/Evaluation');
const Offer = require('../models/Offer');
const ScheduleConflict = require('../models/ScheduleConflict');

const candidatesData = [
  { name: '张三', email: 'zhangsan@example.com', phone: '13800138001', position: '前端工程师', department: '技术部' },
  { name: '李四', email: 'lisi@example.com', phone: '13800138002', position: '后端工程师', department: '技术部' },
  { name: '王五', email: 'wangwu@example.com', phone: '13800138003', position: '产品经理', department: '产品部' },
  { name: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', position: 'UI设计师', department: '设计部' },
  { name: '孙七', email: 'sunqi@example.com', phone: '13800138005', position: '运营专员', department: '运营部' },
  { name: '周八', email: 'zhouba@example.com', phone: '13800138006', position: '全栈工程师', department: '技术部' },
  { name: '吴九', email: 'wujiu@example.com', phone: '13800138007', position: '高级产品经理', department: '产品部' },
  { name: '郑十', email: 'zhengshi@example.com', phone: '13800138008', position: '交互设计师', department: '设计部' }
];

const interviewersData = [
  { name: '陈技术', email: 'chenjishu@company.com', role: '技术总监' },
  { name: '刘产品', email: 'liuchanpin@company.com', role: '产品总监' },
  { name: '黄设计', email: 'huangsheji@company.com', role: '设计主管' },
  { name: '杨运营', email: 'yangyunying@company.com', role: '运营总监' },
  { name: '林架构', email: 'linjiagou@company.com', role: '架构师' }
];

const interviewTypes = ['phone', 'video', 'onsite', 'final'];

function getRandomDate(daysAgo, daysLater = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo + Math.floor(Math.random() * (daysLater + daysAgo + 1)));
  date.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return date;
}

function getRandomDeadline(interviewTime) {
  const deadline = new Date(interviewTime);
  deadline.setDate(deadline.getDate() + 2);
  return deadline;
}

async function seed() {
  console.log('🌱 开始初始化测试数据...');

  await Candidate.deleteMany({});
  await Interviewer.deleteMany({});
  await Interview.deleteMany({});
  await Reminder.deleteMany({});
  await Evaluation.deleteMany({});
  await Offer.deleteMany({});
  await ScheduleConflict.deleteMany({});

  const candidates = await Candidate.create(candidatesData);
  const interviewers = await Interviewer.create(interviewersData);
  console.log(`✅ 已创建 ${candidates.length} 名候选人和 ${interviewers.length} 名面试官`);

  const interviewsData = [];

  candidates.forEach((candidate, idx) => {
    const numRounds = idx % 3 + 1;
    for (let round = 1; round <= numRounds; round++) {
      const daysAgo = idx * 2 + round;
      const interviewTime = getRandomDate(daysAgo, 0);
      const evaluationDeadline = getRandomDeadline(interviewTime);
      const interviewer = interviewers[idx % interviewers.length];

      const now = new Date();
      let evaluationStatus = 'pending';
      if (evaluationDeadline < now) {
        evaluationStatus = 'overdue';
      }

      if (idx >= 6 && round === 1) {
        evaluationStatus = 'pending';
      }

      interviewsData.push({
        candidateId: candidate._id,
        candidate: candidate.toObject(),
        interviewerId: interviewer._id,
        interviewer: interviewer.toObject(),
        interviewTime,
        interviewType: interviewTypes[(idx + round - 1) % interviewTypes.length],
        round,
        status: 'completed',
        evaluationDeadline,
        evaluationStatus
      });
    }
  });

  const interviews = await Interview.create(interviewsData);
  console.log(`✅ 已创建 ${interviews.length} 条面试记录`);

  const overdueInterviews = interviews.filter(i => i.evaluationStatus === 'overdue');
  const reminderPromises = [];

  for (let i = 0; i < Math.min(3, overdueInterviews.length); i++) {
    const interview = overdueInterviews[i];
    reminderPromises.push(Reminder.create({
      interviewId: interview._id,
      interview: interview.toObject(),
      type: 'evaluation',
      status: 'sent',
      channel: 'email',
      sentAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      createdBy: 'system',
      note: '系统自动催办'
    }));
  }

  await Promise.all(reminderPromises);
  console.log(`✅ 已创建 ${reminderPromises.length} 条催办记录`);

  const defaultDimensions = [
    { code: 'technical_skill', name: '专业技能', score: 8, comment: '技术功底扎实，能够深入分析问题' },
    { code: 'problem_solving', name: '问题解决能力', score: 7, comment: '' },
    { code: 'communication', name: '沟通表达', score: 8, comment: '' },
    { code: 'teamwork', name: '团队协作', score: 7, comment: '' },
    { code: 'learning_ability', name: '学习能力', score: 8, comment: '' },
    { code: 'cultural_fit', name: '文化匹配', score: 7, comment: '' }
  ];

  const evaluationPromises = [];
  const submittedInterviews = interviews.filter(i => i.evaluationStatus !== 'submitted').slice(-3);
  const draftInterviews = interviews.filter(i => i.evaluationStatus !== 'submitted').slice(-6, -3);

  submittedInterviews.forEach((interview, idx) => {
    const dims = defaultDimensions.map(d => ({
      ...d,
      score: 6 + idx + Math.floor(Math.random() * 2)
    }));
    const scores = dims.map(d => d.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
    evaluationPromises.push(Evaluation.create({
      interviewId: interview._id,
      interviewerId: interview.interviewerId,
      candidateId: interview.candidateId,
      dimensions: dims,
      overallScore: avg,
      recommendation: idx === 0 ? 'strong_hire' : (idx === 1 ? 'hire' : 'borderline'),
      strengths: '候选人具备扎实的专业基础，沟通表达清晰，逻辑思维能力较强。学习能力好，能够快速掌握新的知识和技能。团队合作意识强，能够主动承担责任。',
      weaknesses: '在某些复杂场景下的经验还有待积累，架构设计方面可以进一步提升。',
      summary: `综合来看，${interview.candidate.name}具备良好的专业能力和职业素养，技术功底扎实，学习能力强，沟通表达清晰。虽然在部分高阶能力上还有提升空间，但整体表现优秀，符合岗位要求。`,
      additionalNotes: '',
      status: 'submitted',
      submittedAt: new Date(),
      createdBy: 'interviewer',
      updatedBy: 'interviewer'
    }));
    interview.evaluationStatus = 'submitted';
  });

  await Promise.all(submittedInterviews.map(i => i.save()));

  draftInterviews.forEach((interview, idx) => {
    const dims = defaultDimensions.map(d => ({
      ...d,
      score: 5 + Math.floor(Math.random() * 4),
      comment: idx === 0 ? d.comment : ''
    }));
    evaluationPromises.push(Evaluation.create({
      interviewId: interview._id,
      interviewerId: interview.interviewerId,
      candidateId: interview.candidateId,
      dimensions: dims,
      recommendation: 'pending',
      strengths: idx === 0 ? '技术能力较强，有相关项目经验。' : '',
      weaknesses: '',
      summary: idx === 0 ? '整体表现尚可，待进一步综合评定。' : '',
      additionalNotes: '',
      status: 'draft',
      createdBy: 'interviewer',
      updatedBy: 'interviewer'
    }));
  });

  const createdEvaluations = await Promise.all(evaluationPromises);
  console.log(`✅ 已创建 ${createdEvaluations.length} 条评价数据（${submittedInterviews.length}条已提交/${draftInterviews.length}条草稿）`);

  console.log('\n📦 初始化 Offer 审批数据...');
  const offerService = require('../services/offerService');

  const offerDraft = await offerService.createOffer({
    candidateName: '张三',
    candidatePhone: '13800138001',
    candidateEmail: 'zhangsan@example.com',
    position: '前端工程师',
    department: '技术部',
    employmentType: 'full_time',
    workLocation: '北京-总部',
    salaryMonthly: 25000,
    salaryMonths: 14,
    bonus: '年终奖2-4个月',
    probationMonths: 3,
    entryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    remark: '候选人技术评估优秀，建议尽快发出Offer'
  }, 'HR-小李');

  const offerPending = await offerService.createOffer({
    candidateName: '王五',
    candidatePhone: '13800138003',
    candidateEmail: 'wangwu@example.com',
    position: '产品经理',
    department: '产品部',
    employmentType: 'full_time',
    workLocation: '北京-总部',
    salaryMonthly: 30000,
    salaryMonths: 14,
    bonus: '年终奖3个月起',
    probationMonths: 6,
    entryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    remark: '高级产品经理，需CTO终面确认'
  }, 'HR-小李');
  await offerService.transition(offerPending.id, 'submit', 'HR-小李', '薪资较高，请领导审批');

  const offerApproved = await offerService.createOffer({
    candidateName: '李四',
    candidatePhone: '13800138002',
    candidateEmail: 'lisi@example.com',
    position: '后端工程师',
    department: '技术部',
    employmentType: 'full_time',
    workLocation: '上海-分公司',
    salaryMonthly: 28000,
    salaryMonths: 13,
    bonus: '年终奖1-3个月',
    probationMonths: 3,
    entryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    remark: '后端资深，技术匹配度高'
  }, 'HR-小李');
  await offerService.transition(offerApproved.id, 'submit', 'HR-小李', '常规岗位，请审批');
  await offerService.transition(offerApproved.id, 'approve', '技术总监-陈', '薪资合理，同意录用');

  const offerSent = await offerService.createOffer({
    candidateName: '赵六',
    candidatePhone: '13800138004',
    candidateEmail: 'zhaoliu@example.com',
    position: 'UI设计师',
    department: '设计部',
    employmentType: 'full_time',
    workLocation: '北京-总部',
    salaryMonthly: 20000,
    salaryMonths: 13,
    bonus: '年终奖2个月',
    probationMonths: 3,
    entryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    remark: '设计能力突出'
  }, 'HR-小王');
  await offerService.transition(offerSent.id, 'submit', 'HR-小王', '设计部紧急补员');
  await offerService.transition(offerSent.id, 'approve', '设计主管-黄', '同意');
  await offerService.transition(offerSent.id, 'send', 'HR-小王', '已通过邮件发送给候选人');

  const offerAccepted = await offerService.createOffer({
    candidateName: '周八',
    candidatePhone: '13800138006',
    candidateEmail: 'zhouba@example.com',
    position: '全栈工程师',
    department: '技术部',
    employmentType: 'full_time',
    workLocation: '深圳-分公司',
    salaryMonthly: 32000,
    salaryMonths: 14,
    bonus: '年终奖3个月+股票期权',
    probationMonths: 3,
    entryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    remark: '候选人已口头确认接受'
  }, 'HR-小李');
  await offerService.transition(offerAccepted.id, 'submit', 'HR-小李', '高潜候选人');
  await offerService.transition(offerAccepted.id, 'approve', 'CTO-林', '同意录用');
  await offerService.transition(offerAccepted.id, 'send', 'HR-小李', '已发offer邮件');
  await offerService.transition(offerAccepted.id, 'accept', 'HR-小李', '候选人邮件确认接受');

  const offerRejected = await offerService.createOffer({
    candidateName: '孙七',
    candidatePhone: '13800138005',
    candidateEmail: 'sunqi@example.com',
    position: '运营专员',
    department: '运营部',
    employmentType: 'full_time',
    workLocation: '北京-总部',
    salaryMonthly: 12000,
    salaryMonths: 13,
    bonus: '年终奖1个月',
    probationMonths: 3,
    entryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    remark: '运营经验丰富但薪资超出预算'
  }, 'HR-小王');
  await offerService.transition(offerRejected.id, 'submit', 'HR-小王', '请审批');
  await offerService.transition(offerRejected.id, 'reject', '运营总监-杨', '薪资超预算，建议重新评估或降薪录用');

  const offerDeclined = await offerService.createOffer({
    candidateName: '吴九',
    candidatePhone: '13800138007',
    candidateEmail: 'wujiu@example.com',
    position: '高级产品经理',
    department: '产品部',
    employmentType: 'full_time',
    workLocation: '北京-总部',
    salaryMonthly: 35000,
    salaryMonths: 14,
    bonus: '年终奖3个月+股票',
    probationMonths: 6,
    entryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    remark: '候选人考虑其他公司offer'
  }, 'HR-小李');
  await offerService.transition(offerDeclined.id, 'submit', 'HR-小李', '紧急');
  await offerService.transition(offerDeclined.id, 'approve', 'CTO-林', '同意');
  await offerService.transition(offerDeclined.id, 'send', 'HR-小李', '已发出');
  await offerService.transition(offerDeclined.id, 'decline', 'HR-小李', '候选人选择其他公司');

  const offerCount = await Offer.countDocuments();
  console.log(`✅ 已创建 ${offerCount} 条 Offer 数据（覆盖草稿/审批中/已通过/已发出/已接受/已驳回/候选人拒绝 各状态）`);

  console.log('\n📦 初始化日程冲突测试数据...');
  const baseTime = new Date();
  baseTime.setDate(baseTime.getDate() + 3);
  baseTime.setHours(14, 0, 0, 0);

  const conflictInterviews1 = [
    {
      candidateName: '张三',
      candidateEmail: 'zhangsan@example.com',
      interviewerName: '陈技术',
      interviewerEmail: 'chenjishu@company.com',
      interviewTime: new Date(baseTime.getTime()),
      interviewType: 'onsite',
      round: 2,
      position: '前端工程师',
      department: '技术部'
    },
    {
      candidateName: '周八',
      candidateEmail: 'zhouba@example.com',
      interviewerName: '陈技术',
      interviewerEmail: 'chenjishu@company.com',
      interviewTime: new Date(baseTime.getTime()),
      interviewType: 'video',
      round: 1,
      position: '全栈工程师',
      department: '技术部'
    }
  ];

  const baseTime2 = new Date();
  baseTime2.setDate(baseTime2.getDate() + 2);
  baseTime2.setHours(10, 0, 0, 0);

  const conflictInterviews2 = [
    {
      candidateName: '李四',
      candidateEmail: 'lisi@example.com',
      interviewerName: '林架构',
      interviewerEmail: 'linjiagou@company.com',
      interviewTime: new Date(baseTime2.getTime()),
      interviewType: 'onsite',
      round: 3,
      position: '后端工程师',
      department: '技术部'
    },
    {
      candidateName: '李四',
      candidateEmail: 'lisi@example.com',
      interviewerName: '陈技术',
      interviewerEmail: 'chenjishu@company.com',
      interviewTime: new Date(baseTime2.getTime()),
      interviewType: 'final',
      round: 4,
      position: '后端工程师',
      department: '技术部'
    }
  ];

  const baseTime3 = new Date();
  baseTime3.setDate(baseTime3.getDate() + 1);
  baseTime3.setHours(15, 30, 0, 0);

  const conflictInterviews3 = [
    {
      candidateName: '王五',
      candidateEmail: 'wangwu@example.com',
      interviewerName: '刘产品',
      interviewerEmail: 'liuchanpin@company.com',
      interviewTime: new Date(baseTime3.getTime()),
      interviewType: 'onsite',
      round: 2,
      position: '产品经理',
      department: '产品部'
    },
    {
      candidateName: '吴九',
      candidateEmail: 'wujiu@example.com',
      interviewerName: '刘产品',
      interviewerEmail: 'liuchanpin@company.com',
      interviewTime: new Date(baseTime3.getTime()),
      interviewType: 'phone',
      round: 1,
      position: '高级产品经理',
      department: '产品部'
    },
    {
      candidateName: '孙七',
      candidateEmail: 'sunqi@example.com',
      interviewerName: '刘产品',
      interviewerEmail: 'liuchanpin@company.com',
      interviewTime: new Date(baseTime3.getTime()),
      interviewType: 'video',
      round: 1,
      position: '运营专员',
      department: '运营部'
    }
  ];

  const scheduleConflictsData = [
    {
      conflictType: 'interviewer_schedule',
      status: 'pending',
      priority: 'high',
      title: '面试官「陈技术」下午2点双场面冲突',
      description: '陈技术总监在同一时间段被安排了两场面试，需要协调其中一场改期',
      interviews: conflictInterviews1,
      assignee: 'HR-小李',
      createdBy: 'system',
      communications: [
        {
          type: 'note',
          content: '系统检测到面试官时间冲突，请HR尽快协调处理',
          operator: 'system',
          target: 'HR-小李',
          createdAt: new Date()
        }
      ]
    },
    {
      conflictType: 'candidate_schedule',
      status: 'communicating',
      priority: 'high',
      title: '候选人「李四」时间冲突',
      description: '候选人李四在同一时间段有两场面试（终面和架构面），需要紧急协调',
      interviews: conflictInterviews2,
      assignee: 'HR-小王',
      createdBy: 'HR-小李',
      reminderCount: 1,
      lastReminderAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      communications: [
        {
          type: 'note',
          content: '已电话联系候选人李四，他表示下午3点后有空，正在协调面试官时间',
          operator: 'HR-小王',
          target: '李四',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          type: 'email_sent',
          content: '已向林架构和陈技术发送协调邮件，请求确认新的面试时间',
          operator: 'HR-小王',
          target: '林架构,陈技术',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]
    },
    {
      conflictType: 'interviewer_schedule',
      status: 'pending',
      priority: 'high',
      title: '面试官「刘产品」同时安排3场面试',
      description: '刘产品总监在下午3点半被安排了3场面试，严重冲突，需要优先处理',
      interviews: conflictInterviews3,
      assignee: 'HR-小李',
      createdBy: 'system',
      communications: [
        {
          type: 'note',
          content: '系统检测到高优先级冲突：同一面试官3场面试冲突',
          operator: 'system',
          target: 'HR-小李',
          createdAt: new Date()
        }
      ]
    },
    {
      conflictType: 'room_conflict',
      status: 'communicating',
      priority: 'medium',
      title: '会议室「A301」占用冲突',
      description: '明天上午10点A301会议室同时被两场现场面试预约',
      interviews: [
        {
          candidateName: '赵六',
          candidateEmail: 'zhaoliu@example.com',
          interviewerName: '黄设计',
          interviewerEmail: 'huangsheji@company.com',
          interviewTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
          interviewType: 'onsite',
          round: 1,
          position: 'UI设计师',
          department: '设计部'
        },
        {
          candidateName: '郑十',
          candidateEmail: 'zhengshi@example.com',
          interviewerName: '黄设计',
          interviewerEmail: 'huangsheji@company.com',
          interviewTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
          interviewType: 'onsite',
          round: 2,
          position: '交互设计师',
          department: '设计部'
        }
      ],
      roomName: 'A301-小型面试间',
      assignee: 'HR-小王',
      createdBy: 'HR-小李',
      communications: [
        {
          type: 'note',
          content: '已查看A301预约情况，下午可安排B203会议室作为替代方案',
          operator: 'HR-小王',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    },
    {
      conflictType: 'multi_interview_conflict',
      status: 'resolved',
      priority: 'low',
      title: '已解决：「杨运营」面试与部门周会冲突',
      description: '运营总监的面试时间与部门周会时间重叠，已协调改期',
      interviews: [
        {
          candidateName: '孙七',
          candidateEmail: 'sunqi@example.com',
          interviewerName: '杨运营',
          interviewerEmail: 'yangyunying@company.com',
          interviewTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          interviewType: 'onsite',
          round: 2,
          position: '运营专员',
          department: '运营部'
        }
      ],
      assignee: 'HR-小李',
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      resolvedBy: 'HR-小李',
      resolution: '已将面试时间从周一下午2点调整至周二上午10点，双方已确认',
      createdBy: 'HR-小李',
      communications: [
        {
          type: 'call',
          content: '电话联系杨运营总监，确认周二上午10点有空',
          operator: 'HR-小李',
          target: '杨运营',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'email_sent',
          content: '已向候选人孙七发送改期确认邮件',
          operator: 'HR-小李',
          target: '孙七',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
          type: 'note',
          content: '双方均已确认新时间，冲突解决',
          operator: 'HR-小李',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ]
    }
  ];

  const scheduleConflicts = await ScheduleConflict.create(scheduleConflictsData);
  console.log(`✅ 已创建 ${scheduleConflicts.length} 条日程冲突数据（覆盖待处理/沟通中/已解决 各状态）`);

  console.log('\n🎉 测试数据初始化完成！');
  console.log('\n📊 数据统计:');
  console.log(`   候选人: ${candidates.length}`);
  console.log(`   面试官: ${interviewers.length}`);
  console.log(`   面试记录: ${interviews.length}`);
  console.log(`   催办记录: ${reminderPromises.length}`);
  console.log(`   已逾期: ${interviews.filter(i => i.evaluationStatus === 'overdue').length}`);
  console.log(`   待评价: ${interviews.filter(i => i.evaluationStatus === 'pending').length}`);
  console.log(`   已提交评价: ${submittedInterviews.length}`);
  console.log(`   草稿中: ${draftInterviews.length}`);
  console.log(`   日程冲突: ${scheduleConflicts.length}`);

  process.exit(0);
}

module.exports = { seed };
