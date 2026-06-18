import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ScheduleConflictListComponent } from './schedule-conflict-list.component';
import { ScheduleConflictService } from '../../services/schedule-conflict.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import {
  ScheduleConflict,
  ScheduleConflictStatistics,
  PaginatedResult,
  SendReminderTarget
} from '../../models/schedule-conflict.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

const MOCK_STATISTICS: ScheduleConflictStatistics = {
  totalCount: 12,
  pendingCount: 5,
  communicatingCount: 4,
  resolvedCount: 2,
  highPriorityCount: 3,
  todayNewCount: 2
};

const MOCK_CONFLICTS: ScheduleConflict[] = [
  {
    id: '1',
    conflictType: 'interviewer_schedule',
    status: 'pending',
    priority: 'high',
    title: '面试官张建国时间冲突',
    interviews: [
      {
        candidateName: '李明',
        candidateEmail: 'liming@test.com',
        interviewerName: '张建国',
        interviewerEmail: 'zhang@test.com',
        interviewTime: '2026-06-20 14:00:00',
        interviewType: 'onsite',
        round: 2,
        position: '前端工程师',
        department: '技术部'
      },
      {
        candidateName: '王芳',
        candidateEmail: 'wangfang@test.com',
        interviewerName: '张建国',
        interviewerEmail: 'zhang@test.com',
        interviewTime: '2026-06-20 14:30:00',
        interviewType: 'onsite',
        round: 2,
        position: 'Java工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-小李',
    communications: [{ type: 'note', content: '系统检测', operator: 'system', createdAt: '2026-06-18 09:00:00' }],
    reminderCount: 0,
    createdBy: 'system',
    createdAt: '2026-06-18 09:00:00',
    updatedAt: '2026-06-18 09:00:00'
  },
  {
    id: '2',
    conflictType: 'candidate_schedule',
    status: 'communicating',
    priority: 'high',
    title: '候选人李四时间冲突',
    interviews: [
      {
        candidateName: '李四',
        candidateEmail: 'lisi@test.com',
        interviewerName: '林架构',
        interviewerEmail: 'lin@test.com',
        interviewTime: '2026-06-21 10:00:00',
        interviewType: 'onsite',
        round: 3,
        position: '后端工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-小王',
    communications: [],
    reminderCount: 1,
    lastReminderAt: '2026-06-18 10:30:00',
    createdBy: 'HR-小李',
    createdAt: '2026-06-17 16:00:00',
    updatedAt: '2026-06-18 11:15:00'
  },
  {
    id: '3',
    conflictType: 'interviewer_schedule',
    status: 'resolved',
    priority: 'medium',
    title: '已解决：面试官改期',
    interviews: [
      {
        candidateName: '孙丽',
        interviewerName: '陈道明',
        interviewTime: '2026-06-19 11:00:00',
        interviewType: 'video',
        round: 2,
        position: '运营专员',
        department: '运营部'
      }
    ],
    assignee: 'HR-小李',
    resolvedAt: '2026-06-18 10:00:00',
    resolvedBy: 'HR-小李',
    resolution: '已协调改期',
    communications: [],
    reminderCount: 1,
    createdBy: 'HR-小李',
    createdAt: '2026-06-17 14:00:00',
    updatedAt: '2026-06-18 10:00:00'
  }
];

describe('ScheduleConflictListComponent - 排期冲突列表组件测试', () => {
  let component: ScheduleConflictListComponent;
  let fixture: ComponentFixture<ScheduleConflictListComponent>;
  let conflictService: jasmine.SpyObj<ScheduleConflictService>;
  let messageService: jasmine.SpyObj<NzMessageService>;
  let modalService: jasmine.SpyObj<NzModalService>;

  beforeEach(async () => {
    const conflictServiceSpy = jasmine.createSpyObj('ScheduleConflictService', [
      'getConflicts', 'getStatistics', 'getConflictById',
      'createConflict', 'updateConflict', 'deleteConflict',
      'addCommunication', 'sendReminder'
    ]);
    const messageServiceSpy = jasmine.createSpyObj('NzMessageService', [
      'success', 'error', 'warning'
    ]);
    const modalServiceSpy = jasmine.createSpyObj('NzModalService', [
      'info', 'create', 'confirm'
    ]);

    conflictServiceSpy.getStatistics.and.returnValue(of(MOCK_STATISTICS));
    conflictServiceSpy.getConflicts.and.returnValue(of({
      list: MOCK_CONFLICTS,
      total: MOCK_CONFLICTS.length,
      page: 1,
      pageSize: 10
    } as PaginatedResult<ScheduleConflict>));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule
      ],
      declarations: [ScheduleConflictListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ScheduleConflictService, useValue: conflictServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    conflictService = TestBed.inject(ScheduleConflictService) as jasmine.SpyObj<ScheduleConflictService>;
    messageService = TestBed.inject(NzMessageService) as jasmine.SpyObj<NzMessageService>;
    modalService = TestBed.inject(NzModalService) as jasmine.SpyObj<NzModalService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleConflictListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初始化 - ngOnInit', () => {

    it('应创建组件实例', () => {
      expect(component).toBeTruthy();
    });

    it('初始化时应加载统计数据和列表数据', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(conflictService.getStatistics).toHaveBeenCalled();
      expect(conflictService.getConflicts).toHaveBeenCalled();
      expect(component.statistics).toEqual(MOCK_STATISTICS);
      expect(component.dataList.length).toBe(3);
      expect(component.total).toBe(3);
    }));

    it('API 失败时应使用 MOCK 数据作为降级方案', fakeAsync(() => {
      conflictService.getStatistics.and.returnValue(throwError(() => new Error('API Error')));
      conflictService.getConflicts.and.returnValue(throwError(() => new Error('API Error')));

      component.ngOnInit();
      tick();

      expect(component.statistics).toBeDefined();
      expect(component.dataList.length).toBeGreaterThan(0);
    }));
  });

  describe('搜索与筛选', () => {

    it('search() 应重置页码为 1 并重新加载数据', () => {
      component.pageIndex = 3;
      component.search();

      expect(component.pageIndex).toBe(1);
      expect(conflictService.getConflicts).toHaveBeenCalled();
    });

    it('resetSearch() 应清空所有查询条件并重新加载', () => {
      component.queryParams = {
        keyword: '测试',
        conflictType: 'interviewer_schedule',
        status: 'pending',
        priority: 'high',
        assignee: 'HR-小李'
      };
      component.pageIndex = 2;

      component.resetSearch();

      expect(component.queryParams.keyword).toBe('');
      expect(component.queryParams.conflictType).toBe('');
      expect(component.queryParams.status).toBe('');
      expect(component.queryParams.priority).toBe('');
      expect(component.queryParams.assignee).toBe('');
      expect(component.pageIndex).toBe(1);
      expect(conflictService.getConflicts).toHaveBeenCalled();
    });

    it('refresh() 应同时刷新统计和列表', () => {
      conflictService.getStatistics.calls.reset();
      conflictService.getConflicts.calls.reset();

      component.refresh();

      expect(conflictService.getStatistics).toHaveBeenCalled();
      expect(conflictService.getConflicts).toHaveBeenCalled();
    });

    it('API 失败时 MOCK 数据应支持关键词搜索', fakeAsync(() => {
      conflictService.getConflicts.and.returnValue(throwError(() => new Error('API Error')));
      component.queryParams.keyword = '张建国';

      component.loadData();
      tick();

      const hasMatch = component.dataList.some(item =>
        item.title.includes('张建国') ||
        item.interviews.some(i =>
          i.candidateName.includes('张建国') ||
          i.interviewerName.includes('张建国')
        )
      );
      expect(hasMatch).toBe(true);
    }));

    it('API 失败时 MOCK 数据应支持按冲突类型筛选', fakeAsync(() => {
      conflictService.getConflicts.and.returnValue(throwError(() => new Error('API Error')));
      component.queryParams.conflictType = 'candidate_schedule';

      component.loadData();
      tick();

      component.dataList.forEach(item => {
        expect(item.conflictType).toBe('candidate_schedule');
      });
    }));

    it('API 失败时 MOCK 数据应支持按状态筛选', fakeAsync(() => {
      conflictService.getConflicts.and.returnValue(throwError(() => new Error('API Error')));
      component.queryParams.status = 'resolved';

      component.loadData();
      tick();

      component.dataList.forEach(item => {
        expect(item.status).toBe('resolved');
      });
    }));

    it('API 失败时 MOCK 数据应支持按优先级筛选', fakeAsync(() => {
      conflictService.getConflicts.and.returnValue(throwError(() => new Error('API Error')));
      component.queryParams.priority = 'high';

      component.loadData();
      tick();

      component.dataList.forEach(item => {
        expect(item.priority).toBe('high');
      });
    }));
  });

  describe('复选框与批量操作', () => {

    it('onAllCheckedChange(true) 应勾选全部数据', () => {
      component.dataList = MOCK_CONFLICTS.map(c => ({ ...c, checked: false }));

      component.onAllCheckedChange(true);

      component.dataList.forEach(item => {
        expect(item.checked).toBe(true);
      });
      expect(component.allChecked).toBe(true);
      expect(component.indeterminate).toBe(false);
      expect(component.selectedIds.length).toBe(MOCK_CONFLICTS.length);
    });

    it('onAllCheckedChange(false) 应取消全部勾选', () => {
      component.dataList = MOCK_CONFLICTS.map(c => ({ ...c, checked: true }));

      component.onAllCheckedChange(false);

      component.dataList.forEach(item => {
        expect(item.checked).toBe(false);
      });
      expect(component.allChecked).toBe(false);
      expect(component.selectedIds.length).toBe(0);
    });

    it('部分勾选时 indeterminate 应为 true', () => {
      component.dataList = MOCK_CONFLICTS.map((c, idx) => ({
        ...c,
        checked: idx === 0
      }));

      component.refreshCheckedStatus();

      expect(component.allChecked).toBe(false);
      expect(component.indeterminate).toBe(true);
      expect(component.selectedIds.length).toBe(1);
    });

    it('clearSelection() 应清空所有选中项', () => {
      component.dataList = MOCK_CONFLICTS.map(c => ({ ...c, checked: true }));
      component.selectedIds = MOCK_CONFLICTS.map(c => c.id);

      component.clearSelection();

      component.dataList.forEach(item => {
        expect(item.checked).toBe(false);
      });
      expect(component.selectedIds.length).toBe(0);
    });

    it('batchSendReminder() 无选中项时应给出警告', () => {
      component.selectedIds = [];

      component.batchSendReminder();

      expect(messageService.warning).toHaveBeenCalledWith('请先选择要催办的冲突');
    });

    it('batchSendReminder() 有选中项时应弹出确认对话框', () => {
      component.selectedIds = ['1', '2'];
      modalService.confirm.and.returnValue({} as NzModalRef);

      component.batchSendReminder();

      expect(modalService.confirm).toHaveBeenCalled();
    });
  });

  describe('工具方法', () => {

    it('getConflictTypeLabel() 应返回正确的类型标签', () => {
      expect(component.getConflictTypeLabel('interviewer_schedule')).toBe('面试官日程冲突');
      expect(component.getConflictTypeLabel('candidate_schedule')).toBe('候选人人程冲突');
      expect(component.getConflictTypeLabel('room_conflict')).toBe('会议室冲突');
      expect(component.getConflictTypeLabel('unknown')).toBe('unknown');
    });

    it('getConflictTypeColor() 应返回正确的颜色', () => {
      expect(component.getConflictTypeColor('interviewer_schedule')).toBe('orange');
      expect(component.getConflictTypeColor('candidate_schedule')).toBe('red');
    });

    it('getStatusLabel() 应返回正确的状态标签', () => {
      expect(component.getStatusLabel('pending')).toBe('待处理');
      expect(component.getStatusLabel('communicating')).toBe('沟通中');
      expect(component.getStatusLabel('resolved')).toBe('已解决');
      expect(component.getStatusLabel('cancelled')).toBe('已取消');
    });

    it('getPriorityLabel() 应返回正确的优先级标签', () => {
      expect(component.getPriorityLabel('high')).toBe('高');
      expect(component.getPriorityLabel('medium')).toBe('中');
      expect(component.getPriorityLabel('low')).toBe('低');
    });

    it('formatDateTime() 应正确格式化日期时间字符串', () => {
      const result = component.formatDateTime('2026-06-20 14:30:00');
      expect(result).toBe('2026-06-20 14:30');
    });

    it('formatDateTime() 空值应返回 -', () => {
      expect(component.formatDateTime('')).toBe('-');
    });

    it('collectTargetsFromConflict() 应从冲突中收集催办目标并去重', () => {
      const conflict: ScheduleConflict = {
        ...MOCK_CONFLICTS[0],
        interviews: [
          {
            candidateName: '候选人A',
            candidateEmail: 'same@test.com',
            interviewerName: '面试官A',
            interviewerEmail: 'ia@test.com',
            interviewTime: '2026-06-20 14:00:00'
          },
          {
            candidateName: '候选人B',
            candidateEmail: 'same@test.com',
            interviewerName: '面试官B',
            interviewerEmail: 'ib@test.com',
            interviewTime: '2026-06-20 14:30:00'
          }
        ]
      };

      const targets = component.collectTargetsFromConflict(conflict);

      expect(targets.length).toBe(3);
      const emails = targets.map(t => t.email);
      expect(emails.filter(e => e === 'same@test.com').length).toBe(1);
    });

    it('collectTargetsFromConflict() 空面试列表应返回空数组', () => {
      const conflict: ScheduleConflict = {
        ...MOCK_CONFLICTS[0],
        interviews: []
      };

      const targets = component.collectTargetsFromConflict(conflict);
      expect(targets.length).toBe(0);
    });
  });

  describe('催办功能', () => {

    it('sendSingleReminder() 应弹出发送确认对话框', () => {
      modalService.create.and.returnValue({} as NzModalRef);

      component.sendSingleReminder(MOCK_CONFLICTS[0]);

      expect(modalService.create).toHaveBeenCalled();
    });

    it('viewDetail() 应弹出详情对话框', () => {
      modalService.info.and.returnValue({} as NzModalRef);

      component.viewDetail(MOCK_CONFLICTS[0]);

      expect(modalService.info).toHaveBeenCalled();
    });

    it('openAddCommunicationModal() 应弹出沟通记录对话框', () => {
      modalService.create.and.returnValue({} as NzModalRef);

      component.openAddCommunicationModal(MOCK_CONFLICTS[0]);

      expect(modalService.create).toHaveBeenCalled();
    });

    it('openCreateModal() 应弹出新建冲突对话框', () => {
      modalService.create.and.returnValue({} as NzModalRef);

      component.openCreateModal();

      expect(modalService.create).toHaveBeenCalled();
    });
  });

  describe('加载状态', () => {

    it('loadData() 期间 loading 应为 true，完成后为 false', fakeAsync(() => {
      component.loadData();
      expect(component.loading).toBe(true);

      tick();
      expect(component.loading).toBe(false);
    }));
  });
});
