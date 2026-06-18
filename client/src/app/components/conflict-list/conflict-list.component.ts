import { Component, OnInit } from '@angular/core';
import { ConflictService } from '../../services/conflict.service';
import {
  ScheduleConflict,
  ConflictQueryParams,
  ConflictStatistics
} from '../../models/conflict.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-conflict-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>日程冲突催办</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="calendar" style="margin-right: 8px; color: #fa8c16;"></i>
          日程冲突催办
        </h1>
        <button nz-button nzType="primary" (click)="refresh()">
          <i nz-icon nzType="reload"></i>
          刷新
        </button>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value" style="color: #fa8c16;">{{ statistics?.totalConflicts || 0 }}</div>
            <div class="stat-label">冲突总数</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value urgent">{{ statistics?.pendingCount || 0 }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value warning">{{ statistics?.todaySentCount || 0 }}</div>
            <div class="stat-label">今日已催办</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value normal">{{ statistics?.weekSentCount || 0 }}</div>
            <div class="stat-label">本周已催办</div>
          </div>
        </nz-col>
      </nz-row>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="面试官/候选人姓名" style="width: 200px;" />
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
          <div style="display: flex; gap: 8px;">
            <button nz-button nzType="primary" (click)="search()">
              <i nz-icon nzType="search"></i>
              查询
            </button>
            <button nz-button (click)="resetSearch()">重置</button>
          </div>
        </div>
      </div>

      <div class="batch-bar" *ngIf="selectedKeys.length > 0">
        <label nz-checkbox [(ngModel)]="allChecked" (ngModelChange)="onAllCheckedChange($event)">全选</label>
        <span style="color: rgba(0, 0, 0, 0.65);">已选 {{ selectedKeys.length }} 项</span>
        <button nz-button nzType="primary" nzDanger [disabled]="loading" (click)="batchSend()">
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
              <th>面试官</th>
              <th>冲突时间</th>
              <th>涉及候选人</th>
              <th nzWidth="80px">面试数</th>
              <th nzWidth="80px">催办次数</th>
              <th nzWidth="220px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <label nz-checkbox [(ngModel)]="data.checked" (ngModelChange)="refreshCheckedStatus()"></label>
              </td>
              <td>
                <div style="font-weight: 500;">{{ data.interviewer.name }}</div>
                <div style="color: rgba(0, 0, 0, 0.45); font-size: 12px;">
                  <i nz-icon nzType="mail" style="margin-right: 4px;"></i>{{ data.interviewer.email }}
                </div>
              </td>
              <td>
                <nz-tag nzColor="orange">{{ formatDate(data.conflictTime) }}</nz-tag>
              </td>
              <td>
                <div *ngFor="let iv of data.interviews" style="font-size: 13px; line-height: 1.8;">
                  <span style="font-weight: 500;">{{ iv.candidate.name }}</span>
                  <span style="color: rgba(0, 0, 0, 0.45);">（{{ iv.candidate.position }}）</span>
                </div>
              </td>
              <td>
                <nz-tag nzColor="red">{{ data.interviews.length }} 场</nz-tag>
              </td>
              <td>{{ data.reminderCount || 0 }}</td>
              <td>
                <button nz-button nzType="link" (click)="viewDetail(data)">
                  <i nz-icon nzType="eye"></i>
                  详情
                </button>
                <button nz-button nzType="link" (click)="viewHistory(data)">
                  <i nz-icon nzType="history"></i>
                  催办记录
                </button>
                <button nz-button nzType="link" nzDanger (click)="sendSingle(data)">
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
  `
})
export class ConflictListComponent implements OnInit {
  loading = false;
  dataList: (ScheduleConflict & { checked?: boolean; reminderCount?: number })[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  allChecked = false;
  indeterminate = false;
  selectedKeys: string[] = [];
  statistics: ConflictStatistics | null = null;

  queryParams: ConflictQueryParams = {
    keyword: '',
    department: ''
  };

  constructor(
    private conflictService: ConflictService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadData();
  }

  loadStatistics(): void {
    this.conflictService.getStatistics().subscribe({
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
    const params: ConflictQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.conflictService.getConflicts(params).subscribe({
      next: (res) => {
        this.dataList = res.list.map(item => ({ ...item, checked: false }));
        this.total = res.total;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: () => {
        this.loading = false;
        this.message.error('加载冲突列表失败');
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
      department: ''
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
    this.selectedKeys = this.dataList.filter(item => item.checked).map(item => item.conflictKey);
  }

  clearSelection(): void {
    this.dataList.forEach(item => {
      item.checked = false;
    });
    this.refreshCheckedStatus();
  }

  sendSingle(data: ScheduleConflict): void {
    this.modal.confirm({
      nzTitle: '确认发送冲突催办邮件',
      nzContent: `确认向面试官「${data.interviewer.name}」发送日程冲突协调邮件？涉及 ${data.interviews.length} 场面试时间重叠。`,
      nzOkText: '确认发送',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.conflictService.sendConflictReminder(data.conflictKey).subscribe({
            next: () => {
              this.message.success('冲突催办邮件发送成功');
              this.loadStatistics();
              this.loadData();
              resolve();
            },
            error: (err: any) => {
              this.message.error(err?.error?.message || '发送失败');
              reject();
            }
          });
        });
      }
    });
  }

  batchSend(): void {
    if (this.selectedKeys.length === 0) {
      this.message.warning('请先选择要催办的冲突记录');
      return;
    }

    this.modal.confirm({
      nzTitle: '批量发送冲突催办',
      nzContent: `确认向选中的 ${this.selectedKeys.length} 位面试官发送冲突催办邮件？`,
      nzOkText: '确认发送',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.conflictService.sendBatchConflictReminders(this.selectedKeys).subscribe({
            next: (res) => {
              this.message.success(`批量催办完成：成功 ${res.success} 条，失败 ${res.failed} 条`);
              this.loadStatistics();
              this.loadData();
              resolve();
            },
            error: (err: any) => {
              this.message.error(err?.error?.message || '批量催办失败');
              reject();
            }
          });
        });
      }
    });
  }

  viewDetail(data: ScheduleConflict): void {
    const interviewTypeMap: { [key: string]: string } = {
      phone: '电话面试',
      video: '视频面试',
      onsite: '现场面试',
      final: '终面'
    };

    const interviewsHtml = data.interviews.map((iv, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; font-weight: 500;">${iv.candidate.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${iv.candidate.position}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${iv.candidate.department}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${interviewTypeMap[iv.interviewType] || iv.interviewType} 第${iv.round}轮</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #d46b08;">${this.formatDate(iv.interviewTime)}</td>
      </tr>
    `).join('');

    const content = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px;">
        <div style="font-size: 14px; color: rgba(0,0,0,0.88); margin-bottom: 4px;">
          <strong>面试官：</strong>${data.interviewer.name}（${data.interviewer.role || ''}）
        </div>
        <div style="font-size: 13px; color: rgba(0,0,0,0.65);">
          <strong>邮箱：</strong>${data.interviewer.email}
        </div>
        <div style="font-size: 13px; color: #d46b08; margin-top: 4px;">
          <strong>冲突时间：</strong>${this.formatDate(data.conflictTime)}
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 6px; overflow: hidden;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">序号</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">候选人</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">岗位</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">部门</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">面试类型</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45);">面试时间</th>
          </tr>
        </thead>
        <tbody>
          ${interviewsHtml}
        </tbody>
      </table>
    `;

    this.modal.info({
      nzTitle: `冲突详情 - ${data.interviewer.name}`,
      nzWidth: 720,
      nzContent: content,
      nzOkText: '关闭'
    });
  }

  viewHistory(data: ScheduleConflict): void {
    this.conflictService.getConflictHistory(data.conflictKey).subscribe({
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
          nzTitle: `催办记录 - ${data.interviewer.name}`,
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
}
