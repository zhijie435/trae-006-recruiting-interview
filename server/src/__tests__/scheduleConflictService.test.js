const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Interview = require('../models/Interview');
const ScheduleConflict = require('../models/ScheduleConflict');
const scheduleConflictService = require('../services/scheduleConflictService');

jest.mock('../services/emailService', () => ({
  sendScheduleConflictEmail: jest.fn().mockResolvedValue({ success: true })
}));

const emailService = require('../services/emailService');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

function createCandidateData(overrides = {}) {
  return {
    name: '测试候选人',
    email: 'candidate@test.com',
    phone: '13800000000',
    position: '前端工程师',
    department: '技术部',
    ...overrides
  };
}

function createInterviewerData(overrides = {}) {
  return {
    name: '测试面试官',
    email: 'interviewer@test.com',
    role: '技术总监',
    ...overrides
  };
}

function createInterviewData(candidate, interviewer, overrides = {}) {
  const interviewTime = overrides.interviewTime || new Date();
  const evaluationDeadline = new Date(interviewTime.getTime() + 2 * 24 * 60 * 60 * 1000);
  return {
    candidateId: candidate._id,
    candidate: candidate.toObject(),
    interviewerId: interviewer._id,
    interviewer: interviewer.toObject(),
    interviewTime,
    interviewType: 'onsite',
    round: 1,
    status: 'pending',
    evaluationDeadline,
    evaluationStatus: 'pending',
    ...overrides
  };
}

function createConflictData(overrides = {}) {
  return {
    conflictType: 'interviewer_schedule',
    status: 'pending',
    priority: 'medium',
    title: '测试冲突',
    description: '测试冲突描述',
    interviews: [
      {
        candidateName: '候选人A',
        candidateEmail: 'a@test.com',
        interviewerName: '面试官A',
        interviewerEmail: 'ia@test.com',
        interviewTime: new Date(),
        interviewType: 'onsite',
        round: 1,
        position: '前端工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-测试',
    createdBy: 'system',
    ...overrides
  };
}

describe('ScheduleConflictService - 排期冲突场景测试', () => {

  describe('detectConflicts - 冲突检测', () => {

    it('应检测到面试官在同一时间段的多场面试冲突', async () => {
      const candidate1 = await Candidate.create(createCandidateData({ name: '候选人1', email: 'c1@test.com' }));
      const candidate2 = await Candidate.create(createCandidateData({ name: '候选人2', email: 'c2@test.com' }));
      const interviewer = await Interviewer.create(createInterviewerData({ name: '面试官A', email: 'ia@test.com' }));

      const baseTime = new Date();
      baseTime.setHours(14, 0, 0, 0);

      await Interview.create(createInterviewData(candidate1, interviewer, { interviewTime: new Date(baseTime) }));
      await Interview.create(createInterviewData(candidate2, interviewer, { interviewTime: new Date(baseTime) }));

      const conflicts = await scheduleConflictService.detectConflicts();

      const interviewerConflict = conflicts.find(c => c.conflictType === 'interviewer_schedule');
      expect(interviewerConflict).toBeDefined();
      expect(interviewerConflict.title).toContain('面试官A');
      expect(interviewerConflict.interviews.length).toBe(2);
      expect(interviewerConflict.priority).toBe('medium');
    });

    it('应检测到候选人在同一时间段的多场面试冲突', async () => {
      const candidate = await Candidate.create(createCandidateData({ name: '候选人A', email: 'ca@test.com' }));
      const interviewer1 = await Interviewer.create(createInterviewerData({ name: '面试官1', email: 'i1@test.com' }));
      const interviewer2 = await Interviewer.create(createInterviewerData({ name: '面试官2', email: 'i2@test.com' }));

      const baseTime = new Date();
      baseTime.setHours(10, 0, 0, 0);

      await Interview.create(createInterviewData(candidate, interviewer1, { interviewTime: new Date(baseTime) }));
      await Interview.create(createInterviewData(candidate, interviewer2, { interviewTime: new Date(baseTime) }));

      const conflicts = await scheduleConflictService.detectConflicts();

      const candidateConflict = conflicts.find(c => c.conflictType === 'candidate_schedule');
      expect(candidateConflict).toBeDefined();
      expect(candidateConflict.title).toContain('候选人A');
      expect(candidateConflict.interviews.length).toBe(2);
      expect(candidateConflict.priority).toBe('high');
    });

    it('面试官3场及以上冲突应为高优先级', async () => {
      const interviewer = await Interviewer.create(createInterviewerData({ name: '面试官B', email: 'ib@test.com' }));
      const baseTime = new Date();
      baseTime.setHours(15, 0, 0, 0);

      for (let i = 1; i <= 3; i++) {
        const candidate = await Candidate.create(createCandidateData({ name: `候选人${i}`, email: `c${i}@test.com` }));
        await Interview.create(createInterviewData(candidate, interviewer, { interviewTime: new Date(baseTime) }));
      }

      const conflicts = await scheduleConflictService.detectConflicts();
      const interviewerConflict = conflicts.find(c => c.conflictType === 'interviewer_schedule');
      expect(interviewerConflict).toBeDefined();
      expect(interviewerConflict.priority).toBe('high');
      expect(interviewerConflict.description).toContain('3');
    });

    it('已完成或已取消的面试不应被检测为冲突', async () => {
      const candidate1 = await Candidate.create(createCandidateData({ name: '候选人1', email: 'c1@test.com' }));
      const candidate2 = await Candidate.create(createCandidateData({ name: '候选人2', email: 'c2@test.com' }));
      const interviewer = await Interviewer.create(createInterviewerData({ name: '面试官A', email: 'ia@test.com' }));

      const baseTime = new Date();
      baseTime.setHours(14, 0, 0, 0);

      await Interview.create(createInterviewData(candidate1, interviewer, {
        interviewTime: new Date(baseTime),
        status: 'completed'
      }));
      await Interview.create(createInterviewData(candidate2, interviewer, {
        interviewTime: new Date(baseTime),
        status: 'cancelled'
      }));

      const conflicts = await scheduleConflictService.detectConflicts();
      expect(conflicts.length).toBe(0);
    });

    it('不同时间段的面试不应产生冲突', async () => {
      const candidate1 = await Candidate.create(createCandidateData({ name: '候选人1', email: 'c1@test.com' }));
      const candidate2 = await Candidate.create(createCandidateData({ name: '候选人2', email: 'c2@test.com' }));
      const interviewer = await Interviewer.create(createInterviewerData({ name: '面试官A', email: 'ia@test.com' }));

      const time1 = new Date();
      time1.setHours(10, 0, 0, 0);
      const time2 = new Date();
      time2.setHours(14, 0, 0, 0);

      await Interview.create(createInterviewData(candidate1, interviewer, { interviewTime: time1 }));
      await Interview.create(createInterviewData(candidate2, interviewer, { interviewTime: time2 }));

      const conflicts = await scheduleConflictService.detectConflicts();
      expect(conflicts.length).toBe(0);
    });

    it('无面试数据时应返回空冲突列表', async () => {
      const conflicts = await scheduleConflictService.detectConflicts();
      expect(conflicts).toEqual([]);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('CRUD 操作', () => {

    it('createConflict - 应成功创建冲突记录', async () => {
      const data = createConflictData({ title: '新建面试官冲突' });
      const result = await scheduleConflictService.createConflict(data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.conflictType).toBe('interviewer_schedule');
      expect(result.status).toBe('pending');
      expect(result.title).toBe('新建面试官冲突');
      expect(result.assignee).toBe('HR-测试');
      expect(result.createdBy).toBe('system');
    });

    it('createConflict - 应使用默认值创建冲突', async () => {
      const result = await scheduleConflictService.createConflict({
        conflictType: 'candidate_schedule',
        title: '最小数据冲突'
      });

      expect(result.status).toBe('pending');
      expect(result.priority).toBe('medium');
      expect(result.assignee).toBe('HR');
      expect(result.createdBy).toBe('HR');
    });

    it('getConflictById - 应正确获取冲突详情', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());
      const found = await scheduleConflictService.getConflictById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.title).toBe(created.title);
      expect(found.conflictType).toBe(created.conflictType);
    });

    it('getConflictById - 获取不存在的冲突应抛出错误', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(scheduleConflictService.getConflictById(fakeId.toString()))
        .rejects
        .toThrow('冲突记录不存在');
    });

    it('getConflictList - 应支持分页查询', async () => {
      for (let i = 1; i <= 5; i++) {
        await scheduleConflictService.createConflict(createConflictData({ title: `冲突${i}` }));
      }

      const result = await scheduleConflictService.getConflictList({ page: 1, pageSize: 2 });
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.list.length).toBe(2);
    });

    it('getConflictList - 应按类型筛选', async () => {
      await scheduleConflictService.createConflict(createConflictData({ conflictType: 'interviewer_schedule' }));
      await scheduleConflictService.createConflict(createConflictData({ conflictType: 'candidate_schedule' }));
      await scheduleConflictService.createConflict(createConflictData({ conflictType: 'room_conflict' }));

      const result = await scheduleConflictService.getConflictList({ conflictType: 'candidate_schedule' });
      expect(result.total).toBe(1);
      expect(result.list[0].conflictType).toBe('candidate_schedule');
    });

    it('getConflictList - 应按状态筛选', async () => {
      await scheduleConflictService.createConflict(createConflictData({ status: 'pending' }));
      await scheduleConflictService.createConflict(createConflictData({ status: 'resolved' }));

      const result = await scheduleConflictService.getConflictList({ status: 'resolved' });
      expect(result.total).toBe(1);
      expect(result.list[0].status).toBe('resolved');
    });

    it('getConflictList - 应按优先级筛选', async () => {
      await scheduleConflictService.createConflict(createConflictData({ priority: 'high' }));
      await scheduleConflictService.createConflict(createConflictData({ priority: 'low' }));

      const result = await scheduleConflictService.getConflictList({ priority: 'high' });
      expect(result.total).toBe(1);
      expect(result.list[0].priority).toBe('high');
    });

    it('updateConflict - 应成功更新冲突信息', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());
      const updated = await scheduleConflictService.updateConflict(created.id, {
        status: 'communicating',
        priority: 'high',
        assignee: 'HR-小王',
        description: '更新后的描述'
      });

      expect(updated.status).toBe('communicating');
      expect(updated.priority).toBe('high');
      expect(updated.assignee).toBe('HR-小王');
      expect(updated.description).toBe('更新后的描述');
    });

    it('updateConflict - 标记为已解决时应自动记录解决时间和操作人', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());
      const updated = await scheduleConflictService.updateConflict(created.id, {
        status: 'resolved',
        resolution: '已协调改期',
        operator: 'HR-小李'
      });

      expect(updated.status).toBe('resolved');
      expect(updated.resolvedAt).toBeDefined();
      expect(updated.resolvedBy).toBe('HR-小李');
      expect(updated.resolution).toBe('已协调改期');
    });

    it('updateConflict - 更新不存在的冲突应抛出错误', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(scheduleConflictService.updateConflict(fakeId.toString(), { status: 'resolved' }))
        .rejects
        .toThrow('冲突记录不存在');
    });

    it('deleteConflict - 应成功删除冲突', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());
      const result = await scheduleConflictService.deleteConflict(created.id);
      expect(result.success).toBe(true);

      await expect(scheduleConflictService.getConflictById(created.id))
        .rejects
        .toThrow('冲突记录不存在');
    });

    it('deleteConflict - 删除不存在的冲突应抛出错误', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(scheduleConflictService.deleteConflict(fakeId.toString()))
        .rejects
        .toThrow('冲突记录不存在');
    });
  });

  describe('沟通记录', () => {

    it('addCommunication - 应成功添加沟通记录', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());
      const updated = await scheduleConflictService.addCommunication(created.id, {
        type: 'note',
        content: '已电话联系面试官',
        operator: 'HR-小李',
        target: '面试官A'
      });

      expect(updated.communications.length).toBe(1);
      expect(updated.communications[0].type).toBe('note');
      expect(updated.communications[0].content).toBe('已电话联系面试官');
      expect(updated.communications[0].operator).toBe('HR-小李');
      expect(updated.communications[0].createdAt).toBeDefined();
    });

    it('addCommunication - 添加沟通记录应自动将状态从 pending 改为 communicating', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData({ status: 'pending' }));
      expect(created.status).toBe('pending');

      const updated = await scheduleConflictService.addCommunication(created.id, {
        type: 'call',
        content: '电话沟通中',
        operator: 'HR-小王'
      });

      expect(updated.status).toBe('communicating');
    });

    it('addCommunication - 状态已为 communicating 时不应再改变', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData({ status: 'communicating' }));

      const updated = await scheduleConflictService.addCommunication(created.id, {
        type: 'note',
        content: '继续跟进',
        operator: 'HR-小王'
      });

      expect(updated.status).toBe('communicating');
    });
  });

  describe('催办功能', () => {

    beforeEach(() => {
      emailService.sendScheduleConflictEmail.mockClear();
    });

    it('sendReminder - 应向默认相关人员发送催办邮件', async () => {
      const baseTime = new Date();
      const conflictInterviews = [
        {
          candidateName: '候选人A',
          candidateEmail: 'ca@test.com',
          interviewerName: '面试官A',
          interviewerEmail: 'ia@test.com',
          interviewTime: baseTime,
          interviewType: 'onsite',
          round: 1,
          position: '前端工程师',
          department: '技术部'
        },
        {
          candidateName: '候选人B',
          candidateEmail: 'cb@test.com',
          interviewerName: '面试官B',
          interviewerEmail: 'ib@test.com',
          interviewTime: baseTime,
          interviewType: 'video',
          round: 2,
          position: '后端工程师',
          department: '技术部'
        }
      ];

      const created = await scheduleConflictService.createConflict(createConflictData({
        interviews: conflictInterviews
      }));

      const result = await scheduleConflictService.sendReminder(created.id, null, '请尽快处理');

      expect(result.success).toBe(4);
      expect(result.failed).toBe(0);
      expect(emailService.sendScheduleConflictEmail).toHaveBeenCalledTimes(4);
    });

    it('sendReminder - 应支持指定催办对象', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());

      const targets = [
        { name: '面试官A', email: 'ia@test.com', role: 'interviewer' },
        { name: '候选人B', email: 'cb@test.com', role: 'candidate' }
      ];

      const result = await scheduleConflictService.sendReminder(created.id, targets, '紧急催办');

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(emailService.sendScheduleConflictEmail).toHaveBeenCalledTimes(2);
    });

    it('sendReminder - 应记录催办次数和最后催办时间', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());

      await scheduleConflictService.sendReminder(created.id, [{ name: 'A', email: 'a@test.com', role: 'hr' }]);
      const firstUpdated = await scheduleConflictService.getConflictById(created.id);
      expect(firstUpdated.reminderCount).toBe(1);
      expect(firstUpdated.lastReminderAt).toBeDefined();

      await scheduleConflictService.sendReminder(created.id, [{ name: 'A', email: 'a@test.com', role: 'hr' }]);
      const secondUpdated = await scheduleConflictService.getConflictById(created.id);
      expect(secondUpdated.reminderCount).toBe(2);
    });

    it('sendReminder - 催办应自动添加沟通记录', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData());

      const result = await scheduleConflictService.sendReminder(
        created.id,
        [{ name: '面试官A', email: 'ia@test.com', role: 'interviewer' }],
        '测试备注'
      );

      const updated = await scheduleConflictService.getConflictById(created.id);
      const emailComm = updated.communications.find(c => c.type === 'email_sent');
      expect(emailComm).toBeDefined();
      expect(emailComm.content).toContain('1');
      expect(emailComm.content).toContain('测试备注');
      expect(emailComm.target).toContain('面试官A');
    });

    it('sendReminder - 催办后应将状态从 pending 改为 communicating', async () => {
      const created = await scheduleConflictService.createConflict(createConflictData({ status: 'pending' }));

      await scheduleConflictService.sendReminder(
        created.id,
        [{ name: 'A', email: 'a@test.com', role: 'hr' }]
      );

      const updated = await scheduleConflictService.getConflictById(created.id);
      expect(updated.status).toBe('communicating');
    });

    it('sendReminder - 已解决或已取消的冲突不应允许催办', async () => {
      const resolvedConflict = await scheduleConflictService.createConflict(
        createConflictData({ status: 'resolved' })
      );

      await expect(
        scheduleConflictService.sendReminder(resolvedConflict.id, [{ name: 'A', email: 'a@test.com', role: 'hr' }])
      ).rejects.toThrow('该冲突已处理完成，无需催办');

      const cancelledConflict = await scheduleConflictService.createConflict(
        createConflictData({ status: 'cancelled' })
      );

      await expect(
        scheduleConflictService.sendReminder(cancelledConflict.id, [{ name: 'A', email: 'a@test.com', role: 'hr' }])
      ).rejects.toThrow('该冲突已处理完成，无需催办');
    });

    it('sendReminder - 去重：同一邮箱不应重复发送', async () => {
      const baseTime = new Date();
      const conflictInterviews = [
        {
          candidateName: '候选人A',
          candidateEmail: 'same@test.com',
          interviewerName: '面试官A',
          interviewerEmail: 'ia@test.com',
          interviewTime: baseTime,
          interviewType: 'onsite',
          round: 1,
          position: '前端工程师',
          department: '技术部'
        },
        {
          candidateName: '候选人B',
          candidateEmail: 'same@test.com',
          interviewerName: '面试官B',
          interviewerEmail: 'ib@test.com',
          interviewTime: baseTime,
          interviewType: 'video',
          round: 2,
          position: '后端工程师',
          department: '技术部'
        }
      ];

      const created = await scheduleConflictService.createConflict(createConflictData({
        interviews: conflictInterviews
      }));

      const result = await scheduleConflictService.sendReminder(created.id, null);
      expect(result.success).toBe(3);
      expect(emailService.sendScheduleConflictEmail).toHaveBeenCalledTimes(3);
    });
  });

  describe('统计数据', () => {

    it('getConflictStatistics - 应正确统计各状态冲突数量', async () => {
      await scheduleConflictService.createConflict(createConflictData({ status: 'pending', priority: 'high' }));
      await scheduleConflictService.createConflict(createConflictData({ status: 'pending', priority: 'medium' }));
      await scheduleConflictService.createConflict(createConflictData({ status: 'communicating', priority: 'high' }));
      await scheduleConflictService.createConflict(createConflictData({ status: 'resolved' }));
      await scheduleConflictService.createConflict(createConflictData({ status: 'resolved' }));

      const stats = await scheduleConflictService.getConflictStatistics();

      expect(stats.totalCount).toBe(5);
      expect(stats.pendingCount).toBe(2);
      expect(stats.communicatingCount).toBe(1);
      expect(stats.resolvedCount).toBe(2);
      expect(stats.highPriorityCount).toBe(2);
    });

    it('getConflictStatistics - 无数据时应返回0值统计', async () => {
      const stats = await scheduleConflictService.getConflictStatistics();

      expect(stats.totalCount).toBe(0);
      expect(stats.pendingCount).toBe(0);
      expect(stats.communicatingCount).toBe(0);
      expect(stats.resolvedCount).toBe(0);
      expect(stats.highPriorityCount).toBe(0);
      expect(stats.todayNewCount).toBe(0);
    });
  });

  describe('关键词搜索', () => {

    it('getConflictList - 应按标题关键词搜索', async () => {
      await scheduleConflictService.createConflict(createConflictData({ title: '面试官陈技术时间冲突' }));
      await scheduleConflictService.createConflict(createConflictData({ title: '候选人李四时间冲突' }));
      await scheduleConflictService.createConflict(createConflictData({ title: '会议室A301占用冲突' }));

      const result = await scheduleConflictService.getConflictList({ keyword: '陈技术' });
      expect(result.total).toBe(1);
      expect(result.list[0].title).toContain('陈技术');
    });

    it('getConflictList - 应按候选人姓名关键词搜索', async () => {
      await scheduleConflictService.createConflict(createConflictData({
        interviews: [{
          candidateName: '张三',
          candidateEmail: 'zs@test.com',
          interviewerName: '面试官A',
          interviewerEmail: 'ia@test.com',
          interviewTime: new Date(),
          interviewType: 'onsite',
          round: 1,
          position: '前端工程师',
          department: '技术部'
        }]
      }));
      await scheduleConflictService.createConflict(createConflictData({
        interviews: [{
          candidateName: '李四',
          candidateEmail: 'ls@test.com',
          interviewerName: '面试官B',
          interviewerEmail: 'ib@test.com',
          interviewTime: new Date(),
          interviewType: 'video',
          round: 2,
          position: '后端工程师',
          department: '技术部'
        }]
      }));

      const result = await scheduleConflictService.getConflictList({ keyword: '张三' });
      expect(result.total).toBe(1);
      expect(result.list[0].interviews[0].candidateName).toBe('张三');
    });
  });
});
