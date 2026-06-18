import { Component, OnInit } from '@angular/core';
import { ReminderService } from '../../services/reminder.service';
import { Reminder, ReminderQueryParams, Statistics } from '../../models/reminder.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-reminder-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>评价催办</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="bell" style="margin-right: 8px; color: #1890ff;"></i>
          面试评价催办
        </h1>
        <button nz-button nzType="primary" (click)="refresh()">
          <i nz-icon nzType="reload"></i>
          刷新
        </button>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics?.totalPending || 0 }}</div>
            <div class="stat-label">待评价总数</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value urgent">{{ statistics?.overdueCount || 0 }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value warning">{{ statistics?.todayReminderCount || 0 }}</div>
            <div class="stat-label">今日已催办</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value normal">{{ statistics?.thisWeekReminderCount || 0 }}</div>
            <div class="stat-label">本周已催办</div>
          </div>
        </nz-col>
      </nz-row>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="候选人/面试官姓名" style="width: 200px;" />
          </div>
          <div class="search-item">
            <label class="search-label">评价状态</label>
            <nz-select [(ngModel)]="queryParams.evaluationStatus" style="width: 150px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option nzLabel="待评价" nzValue="pending"></nz-option>
              <nz-option nzLabel="已逾期" nzValue="overdue"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">部门</label>
            <nz-select [(ngModel)]="queryParams.department" style="width: 150px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option nzLabel="技术部" nzValue="技术部"></nz-option>
              <nz-option nzLabel="产品部" nzValue="产品部"></nz-option>
              <nz-option nzLabel="设计部" nzValue="设计部"></nz-option>
              <nz-option nzLabel="运营部" nzValue="运营部"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">逾期天数</label>
            <nz-select [(ngModel)]="queryParams.overdueDays" style="width: 150px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" [nzValue]="null"></nz-option>
              <nz-option nzLabel="逾期1天以上" [nzValue]="1"></nz-option>
              <nz-option nzLabel="逾期3天以上" [nzValue]="3"></nz-option>
              <nz-option nzLabel="逾期7天以上" [nzValue]="7"></nz-option>
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
        <button nz-button nzType="primary" nzDanger [disabled]="loading" (click)="batchSendReminder()">
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
              <th>候选人</th>
              <th>应聘岗位</th>
              <th>面试官</th>
              <th>面试轮次</th>
              <th>面试时间</th>
              <th>评价截止日期</th>
              <th>状态</th>
              <th>催办次数</th>
              <th nzWidth="180px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <label nz-checkbox [(ngModel)]="data.checked" (ngModelChange)="refreshCheckedStatus()"></label>
              </td>
              <td>
                <div style="font-weight: 500;">{{ data.interview.candidate.name }}</div>
                <div style="color: rgba(0, 0, 0, 0.45); font-size: 12px;">{{ data.interview.candidate.department }}</div>
              </td>
              <td>{{ data.interview.candidate.position }}</td>
              <td>
                <div style="font-weight: 500;">{{ data.interview.interviewer.name }}</div>
                <div style="color: rgba(0, 0, 0, 0.45); font-size: 12px;">
                  <i nz-icon nzType="mail" style="margin-right: 4px;"></i>{{ data.interview.interviewer.email }}
                </div>
              </td>
              <td>
                <nz-tag *ngIf="data.interview.interviewType === 'phone'">电话面</nz-tag>
                <nz-tag *ngIf="data.interview.interviewType === 'video'" nzColor="blue">视频面</nz-tag>
                <nz-tag *ngIf="data.interview.interviewType === 'onsite'" nzColor="cyan">现场面</nz-tag>
                <nz-tag *ngIf="data.interview.interviewType === 'final'" nzColor="purple">终面</nz-tag>
                <span style="margin-left: 4px;">第{{ data.interview.round }}轮</span>
              </td>
              <td>{{ formatDate(data.interview.interviewTime) }}</td>
              <td [ngClass]="{'urgent': isOverdue(data.interview.evaluationDeadline)}">
                {{ formatDate(data.interview.evaluationDeadline) }}
                <nz-tooltip *ngIf="isOverdue(data.interview.evaluationDeadline)" [nzTitle]="'已逾期' + getOverdueDays(data.interview.evaluationDeadline) + '天'">
                  <i nz-icon nzType="exclamation-circle" class="urgent" style="margin-left: 4px;"></i>
                </nz-tooltip>
              </td>
              <td>
                <nz-tag *ngIf="data.interview.evaluationStatus === 'pending'" nzColor="gold">待评价</nz-tag>
                <nz-tag *ngIf="data.interview.evaluationStatus === 'overdue'" nzColor="red">已逾期</nz-tag>
                <nz-tag *ngIf="data.interview.evaluationStatus === 'submitted'" nzColor="green">已评价</nz-tag>
              </td>
              <td>{{ data.reminderCount || 0 }}</td>
              <td>
                <button nz-button nzType="link" (click)="viewHistory(data)">
                  <i nz-icon nzType="eye"></i>
                  催办记录
                </button>
                <button nz-button nzType="link" nzDanger (click)="sendSingleReminder(data)">
                  <i nz-icon nzType="send"></i>
                  发送催办
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
  `
})
export class ReminderListComponent implements OnInit {
  loading = false;
  dataList: (Reminder & { checked?: boolean; reminderCount?: number })[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  allChecked = false;
  indeterminate = false;
  selectedIds: string[] = [];
  statistics: Statistics | null = null;

  queryParams: ReminderQueryParams = {
    keyword: '',
    evaluationStatus: '',
    department: '',
    interviewerName: '',
    overdueDays: null as unknown as number
  };

  constructor(
    private reminderService: ReminderService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadData();
  }

  loadStatistics(): void {
    this.reminderService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: () => {
        this.message.error('加载统计数据失败');
      }
    });
  }

  loadData(): void {
    this.loading = true;
    const params: ReminderQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.reminderService.getReminders(params).subscribe({
      next: (res) => {
        this.dataList = res.list.map(item => ({ ...item, checked: false }));
        this.total = res.total;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: () => {
        this.loading = false;
        this.message.error('加载催办列表失败');
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
      evaluationStatus: '',
      department: '',
      interviewerName: '',
      overdueDays: null as unknown as number
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
    this.selectedIds = this.dataList.filter(item => item.checked).map(item => item.interviewId);
  }

  clearSelection(): void {
    this.dataList.forEach(item => {
      item.checked = false;
    });
    this.refreshCheckedStatus();
  }

  sendSingleReminder(data: Reminder): void {
    this.modal.confirm({
      nzTitle: '确认发送催办邮件',
      nzContent: `确认向面试官「${data.interview.interviewer.name}」发送评价催办邮件？候选人：${data.interview.candidate.name}`,
      nzOkText: '确认发送',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.reminderService.sendReminder(data.interviewId).subscribe({
            next: () => {
              this.message.success('催办邮件发送成功');
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
      this.message.warning('请先选择要催办的项目');
      return;
    }

    this.modal.confirm({
      nzTitle: '批量发送催办',
      nzContent: `确认向选中的 ${this.selectedIds.length} 位面试官发送催办邮件？`,
      nzOkText: '确认发送',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.reminderService.sendBatchReminders(this.selectedIds).subscribe({
            next: (res) => {
              this.message.success(`批量催办完成：成功 ${res.success} 条，失败 ${res.failed} 条`);
              this.loadStatistics();
              this.loadData();
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '批量催办失败');
              reject();
            }
          });
        });
      }
    });
  }

  viewHistory(data: Reminder): void {
    this.reminderService.getReminderHistory(data.interviewId).subscribe({
      next: (history) => {
        const content = history.length > 0
          ? history.map(h => `
              <div style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                <div style="margin-bottom: 4px;">
                  <span style="font-weight: 500;">发送时间：</span>${this.formatDate(h.sentAt || h.createdAt)}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="font-weight: 500;">状态：</span>
                  <span style="color: ${h.status === 'sent' ? '#52c41a' : '#ff4d4f'}">
                    ${h.status === 'sent' ? '发送成功' : '发送失败'}
                  </span>
                </div>
                <div>
                  <span style="font-weight: 500;">渠道：</span>邮件
                </div>
                ${h.note ? `<div style="margin-top: 4px;"><span style="font-weight: 500;">备注：</span>${h.note}</div>` : ''}
              </div>
            `).join('')
          : '<div style="text-align: center; padding: 24px; color: rgba(0, 0, 0, 0.25);">暂无催办记录</div>';

        this.modal.info({
          nzTitle: `催办记录 - ${data.interview.candidate.name}`,
          nzWidth: 500,
          nzContent: content,
          nzOkText: '关闭'
        });
      },
      error: () => {
        this.message.error('获取催办记录失败');
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }

  getOverdueDays(deadline: string): number {
    const now = new Date();
    const dead = new Date(deadline);
    const diff = now.getTime() - dead.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }
}
