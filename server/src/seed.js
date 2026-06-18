const mongoose = require('mongoose');

const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const Evaluation = require('../models/Evaluation');

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

  process.exit(0);
}

module.exports = { seed };
