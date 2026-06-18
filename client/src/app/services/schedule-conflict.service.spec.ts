import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScheduleConflictService } from './schedule-conflict.service';
import {
  ScheduleConflict,
  ScheduleConflictQueryParams,
  PaginatedResult,
  ScheduleConflictStatistics,
  CommunicationRecord,
  SendReminderTarget
} from '../models/schedule-conflict.model';

describe('ScheduleConflictService - 排期冲突服务测试', () => {
  let service: ScheduleConflictService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/schedule-conflicts';

  const mockConflict: ScheduleConflict = {
    id: '1',
    conflictType: 'interviewer_schedule',
    status: 'pending',
    priority: 'high',
    title: '面试官时间冲突',
    description: '测试描述',
    interviews: [
      {
        candidateName: '张三',
        candidateEmail: 'zhangsan@test.com',
        interviewerName: '面试官A',
        interviewerEmail: 'a@test.com',
        interviewTime: '2026-06-20 14:00:00',
        interviewType: 'onsite',
        round: 2,
        position: '前端工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-小李',
    communications: [],
    reminderCount: 0,
    createdBy: 'system',
    createdAt: '2026-06-18 09:00:00',
    updatedAt: '2026-06-18 09:00:00'
  };

  const mockPaginatedResult: PaginatedResult<ScheduleConflict> = {
    list: [mockConflict],
    total: 1,
    page: 1,
    pageSize: 10
  };

  const mockStatistics: ScheduleConflictStatistics = {
    totalCount: 10,
    pendingCount: 4,
    communicatingCount: 3,
    resolvedCount: 2,
    highPriorityCount: 3,
    todayNewCount: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScheduleConflictService]
    });
    service = TestBed.inject(ScheduleConflictService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getConflicts - 获取冲突列表', () => {

    it('应发送 GET 请求获取冲突列表并支持分页参数', () => {
      const params: ScheduleConflictQueryParams = {
        page: 1,
        pageSize: 10
      };

      service.getConflicts(params).subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('应正确拼接所有查询参数', () => {
      const params: ScheduleConflictQueryParams = {
        keyword: '测试',
        conflictType: 'interviewer_schedule',
        status: 'pending',
        priority: 'high',
        assignee: 'HR-小李',
        page: 2,
        pageSize: 20
      };

      service.getConflicts(params).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}?keyword=%E6%B5%8B%E8%AF%95&conflictType=interviewer_schedule&status=pending&priority=high&assignee=HR-%E5%B0%8F%E6%9D%8E&page=2&pageSize=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('空参数不应出现在 URL 中', () => {
      const params: ScheduleConflictQueryParams = {};

      service.getConflicts(params).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });
  });

  describe('getStatistics - 获取统计数据', () => {

    it('应发送 GET 请求到 /statistics 端点', () => {
      service.getStatistics().subscribe(result => {
        expect(result).toEqual(mockStatistics);
        expect(result.totalCount).toBe(10);
        expect(result.pendingCount).toBe(4);
        expect(result.highPriorityCount).toBe(3);
      });

      const req = httpMock.expectOne(`${apiUrl}/statistics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatistics);
    });
  });

  describe('getConflictById - 获取冲突详情', () => {

    it('应根据 ID 获取冲突详情', () => {
      service.getConflictById('1').subscribe(result => {
        expect(result).toEqual(mockConflict);
        expect(result.id).toBe('1');
        expect(result.title).toBe('面试官时间冲突');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConflict);
    });
  });

  describe('createConflict - 创建冲突', () => {

    it('应发送 POST 请求创建冲突记录', () => {
      const createData = {
        conflictType: 'interviewer_schedule' as const,
        title: '新建冲突',
        priority: 'high' as const
      };

      service.createConflict(createData).subscribe(result => {
        expect(result).toEqual(mockConflict);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockConflict);
    });
  });

  describe('updateConflict - 更新冲突', () => {

    it('应发送 PUT 请求更新冲突信息', () => {
      const updateData = {
        status: 'resolved' as const,
        resolution: '已协调改期',
        operator: 'HR-小李'
      };

      service.updateConflict('1', updateData).subscribe(result => {
        expect(result).toEqual(mockConflict);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockConflict);
    });
  });

  describe('deleteConflict - 删除冲突', () => {

    it('应发送 DELETE 请求删除冲突', () => {
      service.deleteConflict('1').subscribe(result => {
        expect(result.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('addCommunication - 添加沟通记录', () => {

    it('应发送 POST 请求到 /:id/communications 端点', () => {
      const commData: Partial<CommunicationRecord> = {
        type: 'note',
        content: '已电话联系',
        operator: 'HR-小李',
        target: '面试官A'
      };

      service.addCommunication('1', commData).subscribe(result => {
        expect(result).toEqual(mockConflict);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/communications`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(commData);
      req.flush(mockConflict);
    });
  });

  describe('sendReminder - 发送催办', () => {

    it('应发送 POST 请求到 /:id/send-reminder 并携带目标对象和备注', () => {
      const targets: SendReminderTarget[] = [
        { name: '面试官A', email: 'a@test.com', role: 'interviewer' }
      ];
      const note = '请尽快处理';

      service.sendReminder('1', targets, note).subscribe(result => {
        expect(result.success).toBe(1);
        expect(result.failed).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/send-reminder`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ targets, note });
      req.flush({ success: 1, failed: 0, results: [] });
    });

    it('不指定 targets 和 note 时应发送空值', () => {
      service.sendReminder('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1/send-reminder`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ targets: undefined, note: undefined });
      req.flush({ success: 0, failed: 0, results: [] });
    });
  });
});
