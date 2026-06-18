const mongoose = require('mongoose');

const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');

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

  console.log('\n🎉 测试数据初始化完成！');
  console.log('\n📊 数据统计:');
  console.log(`   候选人: ${candidates.length}`);
  console.log(`   面试官: ${interviewers.length}`);
  console.log(`   面试记录: ${interviews.length}`);
  console.log(`   催办记录: ${reminderPromises.length}`);
  console.log(`   已逾期: ${interviews.filter(i => i.evaluationStatus === 'overdue').length}`);
  console.log(`   待评价: ${interviews.filter(i => i.evaluationStatus === 'pending').length}`);

  process.exit(0);
}

module.exports = { seed };
