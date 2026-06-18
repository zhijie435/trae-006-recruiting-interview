import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ScheduleConflictService } from '../../services/schedule-conflict.service';
import {
  ScheduleConflict,
  ScheduleConflictQueryParams,
  ScheduleConflictStatistics,
  CommunicationRecord,
  SendReminderTarget,
  ConflictInterview,
  PaginatedResult
} from '../../models/schedule-conflict.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

const CONFLICT_TYPE_OPTIONS = [
  { value: 'interviewer_schedule', label: '面试官日程冲突', color: 'orange' },
  { value: 'candidate_schedule', label: '候选人人程冲突', color: 'red' },
  { value: 'room_conflict', label: '会议室冲突', color: 'blue' },
  { value: 'multi_interview_conflict', label: '多面试安排冲突', color: 'purple' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: '待处理', color: 'gold' },
  { value: 'communicating', label: '沟通中', color: 'cyan' },
  { value: 'resolved', label: '已解决', color: 'green' },
  { value: 'cancelled', label: '已取消', color: 'default' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高', color: 'red' },
  { value: 'medium', label: '中', color: 'orange' },
  { value: 'low', label: '低', color: 'blue' }
];

const COMMUNICATION_TYPE_LABELS: Record<string, string> = {
  note: '备注',
  email_sent: '邮件',
  call: '电话',
  meeting: '面谈'
};

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
    title: '张面试官时间重叠',
    description: '张建国面试官在同一天下午有两场面试安排冲突，分别是前端开发岗和Java开发岗的二面。',
    interviews: [
      {
        interviewId: 'int001',
        candidateName: '李明',
        candidateEmail: 'liming@example.com',
        interviewerName: '张建国',
        interviewerEmail: 'zhangjianguo@company.com',
        interviewTime: '2026-06-20 14:00:00',
        interviewType: 'onsite',
        round: 2,
        position: '高级前端开发工程师',
        department: '技术部'
      },
      {
        interviewId: 'int002',
        candidateName: '王芳',
        candidateEmail: 'wangfang@example.com',
        interviewerName: '张建国',
        interviewerEmail: 'zhangjianguo@company.com',
        interviewTime: '2026-06-20 14:30:00',
        interviewType: 'onsite',
        round: 2,
        position: 'Java开发工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-小李',
    communications: [
      {
        id: 'comm001',
        type: 'note',
        content: '发现张建国面试官两场面试时间重叠，需要协调',
        operator: '系统',
        createdAt: '2026-06-18 09:00:00'
      }
    ],
    reminderCount: 0,
    createdBy: 'system',
    createdAt: '2026-06-18 09:00:00',
    updatedAt: '2026-06-18 09:00:00'
  },
  {
    id: '2',
    conflictType: 'room_conflict',
    status: 'communicating',
    priority: 'medium',
    title: '会议室A302重复预订',
    description: '会议室A302在6月21日上午被两个面试同时预订。',
    interviews: [
      {
        interviewId: 'int003',
        candidateName: '赵强',
        interviewerName: '刘总监',
        interviewTime: '2026-06-21 10:00:00',
        interviewType: 'onsite',
        round: 3,
        position: '产品经理',
        department: '产品部'
      },
      {
        interviewId: 'int004',
        candidateName: '陈静',
        interviewerName: '王经理',
        interviewTime: '2026-06-21 10:30:00',
        interviewType: 'onsite',
        round: 2,
        position: 'UI设计师',
        department: '设计部'
      }
    ],
    roomName: 'A302会议室',
    assignee: 'HR-小王',
    communications: [
      {
        id: 'comm002',
        type: 'email_sent',
        content: '已发送邮件给两位面试官，协调会议室使用',
        operator: 'HR-小王',
        target: '面试官',
        createdAt: '2026-06-18 10:30:00'
      },
      {
        id: 'comm003',
        type: 'call',
        content: '电话联系了刘总监，他表示可以调整到下午2点',
        operator: 'HR-小王',
        target: '刘总监',
        createdAt: '2026-06-18 11:15:00'
      }
    ],
    reminderCount: 1,
    lastReminderAt: '2026-06-18 10:30:00',
    createdBy: 'HR-小王',
    createdAt: '2026-06-17 16:00:00',
    updatedAt: '2026-06-18 11:15:00'
  },
  {
    id: '3',
    conflictType: 'candidate_schedule',
    status: 'pending',
    priority: 'high',
    title: '候选人时间冲突',
    description: '候选人张伟同时约了两家公司的面试，时间有冲突，需要确认是否能参加我们的面试。',
    interviews: [
      {
        interviewId: 'int005',
        candidateName: '张伟',
        candidateEmail: 'zhangwei@example.com',
        interviewerName: '李经理',
        interviewTime: '2026-06-19 15:00:00',
        interviewType: 'video',
        round: 1,
        position: '后端开发工程师',
        department: '技术部'
      }
    ],
    assignee: 'HR-小李',
    communications: [
      {
        id: 'comm004',
        type: 'note',
        content: '候选人来电说可能有时间冲突，需要进一步确认',
        operator: 'HR-小李',
        createdAt: '2026-06-18 14:00:00'
      }
    ],
    reminderCount: 0,
    createdBy: 'HR-小李',
    createdAt: '2026-06-18 14:00:00',
    updatedAt: '2026-06-18 14:00:00'
  },
  {
    id: '4',
    conflictType: 'multi_interview_conflict',
    status: 'communicating',
    priority: 'low',
    title: '同候选人多轮面试间隔过短',
    description: '候选人刘洋的初试和复试安排在同一天，间隔只有30分钟，时间可能不够。',
    interviews: [
      {
        interviewId: 'int006',
        candidateName: '刘洋',
        interviewerName: '王面试官',
        interviewTime: '2026-06-22 09:00:00',
        interviewType: 'onsite',
        round: 1,
        position: '测试工程师',
        department: '质量部'
      },
      {
        interviewId: 'int007',
        candidateName: '刘洋',
        interviewerName: '赵总监',
        interviewTime: '2026-06-22 09:30:00',
        interviewType: 'onsite',
        round: 2,
        position: '测试工程师',
        department: '质量部'
      }
    ],
    assignee: 'HR-小王',
    communications: [
      {
        id: 'comm005',
        type: 'meeting',
        content: '与两位面试官面谈，确认是否可以延长间隔时间',
        operator: 'HR-小王',
        createdAt: '2026-06-18 15:00:00'
      }
    ],
    reminderCount: 0,
    createdBy: '系统',
    createdAt: '2026-06-18 08:00:00',
    updatedAt: '2026-06-18 15:00:00'
  },
  {
    id: '5',
    conflictType: 'interviewer_schedule',
    status: 'resolved',
    priority: 'medium',
    title: '陈面试官临时有事',
    description: '陈道明面试官原定6月19日的面试需要改期，已协调至下周一。',
    interviews: [
      {
        interviewId: 'int008',
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
    resolution: '已将面试改期到6月23日上午10点，候选人已确认',
    communications: [
      {
        id: 'comm006',
        type: 'email_sent',
        content: '通知候选人面试改期',
        operator: 'HR-小李',
        target: '孙丽',
        createdAt: '2026-06-18 09:30:00'
      },
      {
        id: 'comm007',
        type: 'note',
        content: '候选人回复确认新时间没问题',
        operator: 'HR-小李',
        createdAt: '2026-06-18 10:00:00'
      }
    ],
    reminderCount: 1,
    lastReminderAt: '2026-06-18 09:30:00',
    createdBy: 'HR-小李',
    createdAt: '2026-06-17 14:00:00',
    updatedAt: '2026-06-18 10:00:00'
  },
  {
    id: '6',
    conflictType: 'room_conflict',
    status: 'cancelled',
    priority: 'low',
    title: '会议室B201冲突（已取消）',
    description: '原预订的会议室B201与部门例会冲突，后因候选人取消面试，冲突自动解除。',
    interviews: [
      {
        interviewId: 'int009',
        candidateName: '周杰',
        interviewerName: '吴经理',
        interviewTime: '2026-06-17 14:00:00',
        interviewType: 'onsite',
        round: 1,
        position: '行政专员',
        department: '行政部'
      }
    ],
    roomName: 'B201会议室',
    assignee: 'HR-小王',
    resolvedAt: '2026-06-16 16:30:00',
    resolvedBy: 'HR-小王',
    resolution: '候选人放弃面试，冲突自动解除',
    communications: [
      {
        id: 'comm008',
        type: 'call',
        content: '接到候选人电话，说找到其他工作了，放弃本次面试',
        operator: 'HR-小王',
        target: '周杰',
        createdAt: '2026-06-16 16:00:00'
      }
    ],
    reminderCount: 0,
    createdBy: '系统',
    createdAt: '2026-06-16 10:00:00',
    updatedAt: '2026-06-16 16:30:00'
  }
];

@Component({
  selector: 'app-schedule-conflict-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>日程冲突沟通催办</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="warning" style="margin-right: 8px; color: #fa8c16;"></i>
          日程冲突沟通催办
        </h1>
        <div style="display: flex; gap: 8px;">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <i nz-icon nzType="plus"></i>
            新建冲突
          </button>
          <button nz-button (click)="refresh()">
            <i nz-icon nzType="reload"></i>
            刷新
          </button>
        </div>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value">{{ statistics?.totalCount || 0 }}</div>
            <div class="stat-label">冲突总数</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value urgent">{{ statistics?.pendingCount || 0 }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value warning">{{ statistics?.communicatingCount || 0 }}</div>
            <div class="stat-label">沟通中</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value normal">{{ statistics?.resolvedCount || 0 }}</div>
            <div class="stat-label">已解决</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value" style="color: #ff4d4f;">{{ statistics?.highPriorityCount || 0 }}</div>
            <div class="stat-label">高优先级</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff;">{{ statistics?.todayNewCount || 0 }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </nz-col>
      </nz-row>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="冲突标题/候选人/面试官" style="width: 220px;" />
          </div>
          <div class="search-item">
            <label class="search-label">冲突类型</label>
            <nz-select [(ngModel)]="queryParams.conflictType" style="width: 150px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option *ngFor="let opt of CONFLICT_TYPE_OPTIONS" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">处理状态</label>
            <nz-select [(ngModel)]="queryParams.status" style="width: 130px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option *ngFor="let opt of STATUS_OPTIONS" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">优先级</label>
            <nz-select [(ngModel)]="queryParams.priority" style="width: 110px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option *ngFor="let opt of PRIORITY_OPTIONS" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">处理人</label>
            <nz-select [(ngModel)]="queryParams.assignee" style="width: 130px;" nzPlaceHolder="全部" nzAllowClear>
              <nz-option nzLabel="HR-小李" nzValue="HR-小李"></nz-option>
              <nz-option nzLabel="HR-小王" nzValue="HR-小王"></nz-option>
              <nz-option nzLabel="HR" nzValue="HR"></nz-option>
            </nz-select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button nz-button nzType="primary" (click)="search()">
              <i nz-icon nzType="search"></i>
              查询
            </button>
            <button nz-button (click)="resetSearch()">重置</button>
          </div>
        </div>
      </div>

      <div class="batch-bar" *ngIf="selectedIds.length > 0">
        <label nz-checkbox [(ngModel)]="allChecked" (ngModelChange)="onAllCheckedChange($event)">全选</label>
        <span style="color: rgba(0, 0, 0, 0.65);">已选 {{ selectedIds.length }} 项</span>
        <button nz-button nzType="primary" [disabled]="loading" (click)="batchSendReminder()">
          <i nz-icon nzType="send"></i>
          批量催办
        </button>
        <button nz-button (click)="clearSelection()">取消选择</button>
      </div>

      <div class="table-container" *ngIf="!loading; else loadingTpl">
        <nz-table
          #basicTable
          [nzData]="dataList"
          [nzFrontPagination]="false"
          [nzTotal]="total"
          [(nzPageIndex)]="pageIndex"
          [(nzPageSize)]="pageSize"
          (nzPageIndexChange)="loadData()"
          (nzPageSizeChange)="loadData()"
          nzShowSizeChanger
          [nzPageSizeOptions]="[10, 20, 50, 100]"
        >
          <thead>
            <tr>
              <th nzWidth="50px">
                <label nz-checkbox [(ngModel)]="allChecked" (ngModelChange)="onAllCheckedChange($event)" [nzIndeterminate]="indeterminate"></label>
              </th>
              <th>优先级</th>
              <th>冲突类型</th>
              <th>冲突标题</th>
              <th>涉及面试</th>
              <th>处理人</th>
              <th>催办次数</th>
              <th>状态</th>
              <th>创建时间</th>
              <th nzWidth="280px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <label nz-checkbox [(ngModel)]="data.checked" (ngModelChange)="refreshCheckedStatus()"></label>
              </td>
              <td>
                <nz-tag [nzColor]="getPriorityColor(data.priority)">{{ getPriorityLabel(data.priority) }}</nz-tag>
              </td>
              <td>
                <nz-tag [nzColor]="getConflictTypeColor(data.conflictType)">{{ getConflictTypeLabel(data.conflictType) }}</nz-tag>
              </td>
              <td>
                <div style="font-weight: 500;">{{ data.title }}</div>
                <div *ngIf="data.description" style="color: rgba(0, 0, 0, 0.45); font-size: 12px; margin-top: 2px;">{{ data.description }}</div>
                <div *ngIf="data.roomName" style="color: #1890ff; font-size: 12px; margin-top: 2px;">
                  <i nz-icon nzType="home" style="margin-right: 2px;"></i>{{ data.roomName }}
                </div>
              </td>
              <td>
                <div *ngFor="let it of data.interviews.slice(0, 2)" style="font-size: 12px; line-height: 1.8;">
                  <span style="color: rgba(0, 0, 0, 0.88);">{{ it.candidateName }}</span>
                  <span style="color: rgba(0, 0, 0, 0.45);"> / </span>
                  <span style="color: rgba(0, 0, 0, 0.65);">{{ it.interviewerName }}</span>
                  <span style="color: rgba(0, 0, 0, 0.45);"> · </span>
                  <span style="color: rgba(0, 0, 0, 0.45);">{{ formatDateTime(it.interviewTime) }}</span>
                </div>
                <div *ngIf="data.interviews.length > 2" style="font-size: 12px; color: #1890ff; cursor: pointer;" (click)="viewDetail(data)">
                  等共 {{ data.interviews.length }} 场面试...
                </div>
              </td>
              <td>{{ data.assignee }}</td>
              <td>
                {{ data.reminderCount || 0 }}
                <span *ngIf="data.lastReminderAt" style="color: rgba(0, 0, 0, 0.45); font-size: 12px; display: block;">
                  {{ formatDateTime(data.lastReminderAt) }}
                </span>
              </td>
              <td>
                <nz-tag [nzColor]="getStatusColor(data.status)">{{ getStatusLabel(data.status) }}</nz-tag>
                <div *ngIf="data.status === 'resolved' && data.resolvedAt" style="color: rgba(0, 0, 0, 0.45); font-size: 12px;">
                  {{ formatDateTime(data.resolvedAt) }}
                </div>
              </td>
              <td>{{ formatDateTime(data.createdAt) }}</td>
              <td>
                <button nz-button nzType="link" nzType="primary" (click)="viewDetail(data)">
                  <i nz-icon nzType="eye"></i>
                  详情
                </button>
                <button nz-button nzType="link" (click)="openAddCommunicationModal(data)">
                  <i nz-icon nzType="message"></i>
                  沟通记录
                </button>
                <button nz-button nzType="link" nzDanger (click)="sendSingleReminder(data)" [disabled]="data.status === 'resolved' || data.status === 'cancelled'">
                  <i nz-icon nzType="send"></i>
                  催办
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <ng-template #loadingTpl>
        <div class="table-container" style="text-align: center; padding: 80px 0;">
          <nz-spin nzTip="加载中..."></nz-spin>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .stat-card { cursor: pointer; transition: all 0.3s; }
    .stat-card:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09); transform: translateY(-1px); }
  `]
})
export class ScheduleConflictListComponent implements OnInit {
  readonly CONFLICT_TYPE_OPTIONS = CONFLICT_TYPE_OPTIONS;
  readonly STATUS_OPTIONS = STATUS_OPTIONS;
  readonly PRIORITY_OPTIONS = PRIORITY_OPTIONS;
  readonly COMMUNICATION_TYPE_LABELS = COMMUNICATION_TYPE_LABELS;

  loading = false;
  dataList: (ScheduleConflict & { checked?: boolean })[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  allChecked = false;
  indeterminate = false;
  selectedIds: string[] = [];
  statistics: ScheduleConflictStatistics | null = null;

  queryParams: ScheduleConflictQueryParams = {
    keyword: '',
    conflictType: '',
    status: '',
    priority: '',
    assignee: ''
  };

  constructor(
    private scheduleConflictService: ScheduleConflictService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadData();
  }

  loadStatistics(): void {
    this.scheduleConflictService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: () => {
        this.statistics = MOCK_STATISTICS;
      }
    });
  }

  loadData(): void {
    this.loading = true;
    const params: ScheduleConflictQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.scheduleConflictService.getConflicts(params).subscribe({
      next: (res: PaginatedResult<ScheduleConflict>) => {
        this.dataList = res.list.map((item: ScheduleConflict) => ({ ...item, checked: false }));
        this.total = res.total;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: () => {
        let filtered = [...MOCK_CONFLICTS];
        if (this.queryParams.keyword) {
          const kw = this.queryParams.keyword.toLowerCase();
          filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(kw) ||
            item.interviews.some(i =>
              i.candidateName.toLowerCase().includes(kw) ||
              i.interviewerName.toLowerCase().includes(kw)
            )
          );
        }
        if (this.queryParams.conflictType) {
          filtered = filtered.filter(item => item.conflictType === this.queryParams.conflictType);
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status);
        }
        if (this.queryParams.priority) {
          filtered = filtered.filter(item => item.priority === this.queryParams.priority);
        }
        if (this.queryParams.assignee) {
          filtered = filtered.filter(item => item.assignee === this.queryParams.assignee);
        }

        const start = (this.pageIndex - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = filtered.slice(start, end);

        this.dataList = pageData.map(item => ({ ...item, checked: false }));
        this.total = filtered.length;
        this.loading = false;
        this.refreshCheckedStatus();
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  resetSearch(): void {
    this.queryParams = {
      keyword: '',
      conflictType: '',
      status: '',
      priority: '',
      assignee: ''
    };
    this.pageIndex = 1;
    this.loadData();
  }

  refresh(): void {
    this.loadStatistics();
    this.loadData();
  }

  onAllCheckedChange(checked: boolean): void {
    this.dataList.forEach(item => {
      item.checked = checked;
    });
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const checkedCount = this.dataList.filter(item => item.checked).length;
    this.allChecked = this.dataList.length > 0 && checkedCount === this.dataList.length;
    this.indeterminate = checkedCount > 0 && checkedCount < this.dataList.length;
    this.selectedIds = this.dataList.filter(item => item.checked).map(item => item.id);
  }

  clearSelection(): void {
    this.dataList.forEach(item => {
      item.checked = false;
    });
    this.refreshCheckedStatus();
  }

  getConflictTypeLabel(type: string): string {
    return CONFLICT_TYPE_OPTIONS.find(o => o.value === type)?.label || type;
  }

  getConflictTypeColor(type: string): string {
    return CONFLICT_TYPE_OPTIONS.find(o => o.value === type)?.color || 'default';
  }

  getStatusLabel(status: string): string {
    return STATUS_OPTIONS.find(o => o.value === status)?.label || status;
  }

  getStatusColor(status: string): string {
    return STATUS_OPTIONS.find(o => o.value === status)?.color || 'default';
  }

  getPriorityLabel(priority: string): string {
    return PRIORITY_OPTIONS.find(o => o.value === priority)?.label || priority;
  }

  getPriorityColor(priority: string): string {
    return PRIORITY_OPTIONS.find(o => o.value === priority)?.color || 'default';
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  collectTargetsFromConflict(conflict: ScheduleConflict): SendReminderTarget[] {
    const targets: SendReminderTarget[] = [];
    const seen = new Set<string>();

    (conflict.interviews || []).forEach(it => {
      if (it.interviewerEmail && !seen.has(it.interviewerEmail)) {
        targets.push({ name: it.interviewerName, email: it.interviewerEmail, role: 'interviewer' });
        seen.add(it.interviewerEmail);
      }
      if (it.candidateEmail && !seen.has(it.candidateEmail)) {
        targets.push({ name: it.candidateName, email: it.candidateEmail, role: 'candidate' });
        seen.add(it.candidateEmail);
      }
    });

    return targets;
  }

  viewDetail(data: ScheduleConflict): void {
    const interviewsHtml = (data.interviews || []).map((it, idx) => `
      <div style="padding: 12px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 12px;">
        <div style="font-weight: 500; margin-bottom: 8px; color: rgba(0,0,0,0.88);">面试 ${idx + 1}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px;">
          <div><span style="color: rgba(0,0,0,0.45);">候选人：</span>${it.candidateName}</div>
          <div><span style="color: rgba(0,0,0,0.45);">面试官：</span>${it.interviewerName}</div>
          <div><span style="color: rgba(0,0,0,0.45);">岗位：</span>${it.position || '-'}</div>
          <div><span style="color: rgba(0,0,0,0.45);">部门：</span>${it.department || '-'}</div>
          <div><span style="color: rgba(0,0,0,0.45);">时间：</span>${this.formatDateTime(it.interviewTime)}</div>
          <div><span style="color: rgba(0,0,0,0.45);">轮次：</span>第${it.round || '-'}轮</div>
        </div>
      </div>
    `).join('');

    const commHtml = (data.communications || []).length > 0
      ? `
        <div style="margin-top: 16px;">
          <div style="font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.88); margin-bottom: 12px;">沟通记录</div>
          <nz-timeline>
            ${(data.communications || []).map(c => `
              <nz-timeline-item>
                <div style="font-size: 13px; color: rgba(0,0,0,0.88);">
                  <span style="display: inline-block; padding: 1px 8px; background: #f0f0f0; border-radius: 4px; font-size: 12px; margin-right: 8px;">
                    ${this.COMMUNICATION_TYPE_LABELS[c.type] || c.type}
                  </span>
                  <span style="color: rgba(0,0,0,0.45);">${this.formatDateTime(c.createdAt)}</span>
                  ${c.target ? `<span style="color: rgba(0,0,0,0.45);"> · 对接: ${c.target}</span>` : ''}
                  <div style="margin-top: 4px; color: rgba(0,0,0,0.65);">${c.content}</div>
                </div>
              </nz-timeline-item>
            `).join('')}
          </nz-timeline>
        </div>
      `
      : '<div style="margin-top: 16px; color: rgba(0,0,0,0.25); text-align: center; padding: 24px;">暂无沟通记录</div>';

    const resolutionHtml = data.status === 'resolved' && data.resolution
      ? `
        <div style="margin-top: 16px; padding: 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px;">
          <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">解决方案</div>
          <div style="font-size: 14px; color: #389e0d;">${data.resolution}</div>
          ${data.resolvedBy ? `<div style="font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 4px;">处理人: ${data.resolvedBy}</div>` : ''}
        </div>
      `
      : '';

    this.modal.info({
      nzTitle: `冲突详情 - ${data.title}`,
      nzWidth: 680,
      nzContent: `
        <div style="max-height: 70vh; overflow-y: auto;">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <nz-tag nzColor="${this.getPriorityColor(data.priority)}">${this.getPriorityLabel(data.priority)}优先级</nz-tag>
            <nz-tag nzColor="${this.getConflictTypeColor(data.conflictType)}">${this.getConflictTypeLabel(data.conflictType)}</nz-tag>
            <nz-tag nzColor="${this.getStatusColor(data.status)}">${this.getStatusLabel(data.status)}</nz-tag>
            ${data.roomName ? '<nz-tag><i nz-icon nzType="home"></i> ' + data.roomName + '</nz-tag>' : ''}
          </div>
          ${data.description ? `<div style="font-size: 14px; color: rgba(0,0,0,0.65); margin-bottom: 16px;">${data.description}</div>` : ''}
          <div>
            <div style="font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.88); margin-bottom: 12px;">涉及的面试安排（共 ${data.interviews?.length || 0} 场）</div>
            ${interviewsHtml}
          </div>
          ${resolutionHtml}
          ${commHtml}
        </div>
      `,
      nzOkText: '关闭'
    });
  }

  sendSingleReminder(data: ScheduleConflict): void {
    const targets = this.collectTargetsFromConflict(data);
    const targetsHtml = targets.map(t => `
      <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
        <label style="margin: 0; flex: 1; cursor: pointer;">
          <input type="checkbox" checked style="margin-right: 8px;" data-email="${t.email}" data-name="${t.name}" data-role="${t.role}" class="target-checkbox" />
          <span style="font-weight: 500;">${t.name}</span>
          <span style="color: rgba(0,0,0,0.45); font-size: 12px; margin-left: 8px;">
            ${t.role === 'interviewer' ? '面试官' : t.role === 'candidate' ? '候选人' : 'HR'}
          </span>
          <span style="color: rgba(0,0,0,0.45); font-size: 12px; margin-left: 8px;">${t.email}</span>
        </label>
      </div>
    `).join('');

    const modal = this.modal.create({
      nzTitle: '发送催办沟通邮件',
      nzWidth: 540,
      nzContent: `
        <div>
          <div style="font-size: 14px; color: rgba(0,0,0,0.88); margin-bottom: 8px;">将向以下相关人员发送协调邮件：</div>
          <div style="max-height: 240px; overflow-y: auto; border: 1px solid #f0f0f0; border-radius: 6px; padding: 0 12px; margin-bottom: 16px;">
            ${targetsHtml || '<div style="padding: 24px; text-align: center; color: rgba(0,0,0,0.25);">暂无可用联系人</div>'}
          </div>
          <div style="margin-bottom: 8px;">
            <label style="font-size: 14px; color: rgba(0,0,0,0.88); display: block; margin-bottom: 4px;">备注说明（可选）</label>
            <textarea id="reminder-note" rows="3" placeholder="请输入要在邮件中补充的备注说明..." style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; font-family: inherit;"></textarea>
          </div>
        </div>
      `,
      nzOkText: '确认发送',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          const checkboxes = document.querySelectorAll('.target-checkbox:checked') as NodeListOf<HTMLInputElement>;
          const selectedTargets: SendReminderTarget[] = [];
          checkboxes.forEach(cb => {
            selectedTargets.push({
              name: cb.dataset['name'] || '',
              email: cb.dataset['email'] || '',
              role: (cb.dataset['role'] as 'interviewer' | 'candidate' | 'hr') || 'interviewer'
            });
          });

          if (selectedTargets.length === 0) {
            this.message.warning('请至少选择一位收件人');
            reject();
            return;
          }

          const noteEl = document.getElementById('reminder-note') as HTMLTextAreaElement;
          const note = noteEl?.value?.trim() || '';

          this.scheduleConflictService.sendReminder(data.id, selectedTargets, note).subscribe({
            next: (res) => {
              this.message.success(`催办邮件发送完成：成功 ${res.success} 封，失败 ${res.failed} 封`);
              this.loadStatistics();
              this.loadData();
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '发送失败');
              reject();
            }
          });
        });
      }
    });
  }

  batchSendReminder(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('请先选择要催办的冲突');
      return;
    }

    this.modal.confirm({
      nzTitle: '批量发送催办',
      nzContent: `确认向选中的 ${this.selectedIds.length} 个日程冲突的相关人员发送催办邮件？`,
      nzOkText: '确认发送',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          let totalSuccess = 0;
          let totalFailed = 0;
          const observables: Observable<any>[] = [];

          this.selectedIds.forEach(id => {
            observables.push(this.scheduleConflictService.sendReminder(id));
          });

          let completed = 0;
          observables.forEach((obs, idx) => {
            obs.subscribe({
              next: (res: { success: number; failed: number; results: any[] }) => {
                totalSuccess += res.success || 0;
                totalFailed += res.failed || 0;
              },
              error: () => {
                totalFailed++;
              },
              complete: () => {
                completed++;
                if (completed === observables.length) {
                  this.message.success(`批量催办完成：共 ${this.selectedIds.length} 个冲突，成功 ${totalSuccess} 封邮件，失败 ${totalFailed} 封`);
                  this.loadStatistics();
                  this.loadData();
                  resolve();
                }
              }
            });
          });
        });
      }
    });
  }

  openAddCommunicationModal(data: ScheduleConflict): void {
    const commHtml = (data.communications || []).length > 0
      ? (data.communications || []).map(c => `
          <div style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
            <div style="margin-bottom: 6px;">
              <span style="display: inline-block; padding: 1px 8px; background: #e6f4ff; color: #1677ff; border-radius: 4px; font-size: 12px; margin-right: 8px;">
                ${this.COMMUNICATION_TYPE_LABELS[c.type] || c.type}
              </span>
              <span style="font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.88);">${c.operator}</span>
              ${c.target ? `<span style="font-size: 12px; color: rgba(0,0,0,0.45);"> → ${c.target}</span>` : ''}
              <span style="font-size: 12px; color: rgba(0,0,0,0.45); float: right;">${this.formatDateTime(c.createdAt)}</span>
            </div>
            <div style="font-size: 13px; color: rgba(0,0,0,0.65); line-height: 1.6;">${c.content}</div>
          </div>
        `).join('')
      : '<div style="text-align: center; padding: 24px; color: rgba(0,0,0,0.25);">暂无沟通记录</div>';

    const modal = this.modal.create({
      nzTitle: `沟通记录 - ${data.title}`,
      nzWidth: 600,
      nzContent: `
        <div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.88); margin-bottom: 8px;">添加沟通记录</div>
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <div style="flex: 1;">
                <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通方式</label>
                <select id="comm-type" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                  <option value="note">备注</option>
                  <option value="email_sent">邮件</option>
                  <option value="call">电话</option>
                  <option value="meeting">面谈</option>
                </select>
              </div>
              <div style="flex: 1;">
                <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">对接对象（可选）</label>
                <input id="comm-target" type="text" placeholder="如：张三/陈技术" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
              </div>
            </div>
            <div>
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通内容</label>
              <textarea id="comm-content" rows="3" placeholder="请记录沟通详情..." style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; font-family: inherit;"></textarea>
            </div>
          </div>
          <nz-divider style="margin: 12px 0;"></nz-divider>
          <div style="font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.88); margin-bottom: 8px;">历史记录</div>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #f0f0f0; border-radius: 6px;">
            ${commHtml}
          </div>
        </div>
      `,
      nzOkText: '添加记录',
      nzCancelText: '关闭',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          const typeEl = document.getElementById('comm-type') as HTMLSelectElement;
          const targetEl = document.getElementById('comm-target') as HTMLInputElement;
          const contentEl = document.getElementById('comm-content') as HTMLTextAreaElement;

          const content = contentEl?.value?.trim();
          if (!content) {
            this.message.warning('请输入沟通内容');
            reject();
            return;
          }

          const commData: Partial<CommunicationRecord> = {
            type: (typeEl?.value as any) || 'note',
            target: targetEl?.value?.trim() || undefined,
            content,
            operator: 'HR'
          };

          this.scheduleConflictService.addCommunication(data.id, commData).subscribe({
            next: () => {
              this.message.success('沟通记录已添加');
              this.loadData();
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '添加失败');
              reject();
            }
          });
        });
      }
    });
  }

  openCreateModal(): void {
    const conflictTypes = CONFLICT_TYPE_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    const priorities = PRIORITY_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');

    const modal = this.modal.create({
      nzTitle: '新建日程冲突记录',
      nzWidth: 560,
      nzContent: `
        <div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">冲突类型 *</label>
              <select id="new-conflict-type" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                ${conflictTypes}
              </select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">优先级</label>
              <select id="new-priority" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                ${priorities}
              </select>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">冲突标题 *</label>
            <input id="new-title" type="text" placeholder="如：面试官陈技术时间冲突" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">详细描述</label>
            <textarea id="new-description" rows="2" placeholder="请简要描述冲突情况..." style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; font-family: inherit;"></textarea>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">处理人</label>
              <select id="new-assignee" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                <option value="HR">HR</option>
                <option value="HR-小李">HR-小李</option>
                <option value="HR-小王">HR-小王</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">会议室（可选）</label>
              <input id="new-room" type="text" placeholder="如：A301" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
          </div>
        </div>
      `,
      nzOkText: '创建',
      nzOkType: 'primary',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          const typeEl = document.getElementById('new-conflict-type') as HTMLSelectElement;
          const priorityEl = document.getElementById('new-priority') as HTMLSelectElement;
          const titleEl = document.getElementById('new-title') as HTMLInputElement;
          const descEl = document.getElementById('new-description') as HTMLTextAreaElement;
          const assigneeEl = document.getElementById('new-assignee') as HTMLSelectElement;
          const roomEl = document.getElementById('new-room') as HTMLInputElement;

          const title = titleEl?.value?.trim();
          if (!title) {
            this.message.warning('请输入冲突标题');
            reject();
            return;
          }

          this.scheduleConflictService.createConflict({
            conflictType: typeEl?.value as any,
            priority: priorityEl?.value as any,
            title,
            description: descEl?.value?.trim() || undefined,
            assignee: assigneeEl?.value || 'HR',
            roomName: roomEl?.value?.trim() || undefined,
            interviews: [],
            createdBy: 'HR'
          }).subscribe({
            next: () => {
              this.message.success('冲突记录已创建');
              this.loadStatistics();
              this.loadData();
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '创建失败');
              reject();
            }
          });
        });
      }
    });
  }
}
