import { Component, OnInit } from '@angular/core';
import { EvaluationService } from '../../services/evaluation.service';
import { PendingEvaluationItem, PendingEvaluationQueryParams, EvaluationStatistics } from '../../models/reminder.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>我的评价</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="edit" style="margin-right: 8px; color: #1890ff;"></i>
          我的面试评价
        </h1>
        <button nz-button nzType="primary" (click)="refresh()">
          <i nz-icon nzType="reload"></i>
          刷新
        </button>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="5">
          <div class="stat-card">
            <div class="stat-value">{{ statistics?.totalPending || 0 }}</div>
            <div class="stat-label">待完成评价</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="5">
          <div class="stat-card">
            <div class="stat-value urgent">{{ statistics?.overdueCount || 0 }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="5">
          <div class="stat-card">
            <div class="stat-value warning">{{ statistics?.todaySubmitted || 0 }}</div>
            <div class="stat-label">今日已提交</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="5">
          <div class="stat-card">
            <div class="stat-value normal">{{ statistics?.weekSubmitted || 0 }}</div>
            <div class="stat-label">本周已提交</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="4">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff;">{{ statistics?.totalSubmitted || 0 }}</div>
            <div class="stat-label">累计完成</div>
          </div>
        </nz-col>
      </nz-row>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">搜索</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="候选人姓名/岗位" style="width: 200px;" />
          </div>
          <div class="search-item">
            <label class="search-label">状态</label>
            <nz-select [(ngModel)]="queryParams.status" style="width: 150px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option nzLabel="待填写" nzValue="pending"></nz-option>
              <nz-option nzLabel="草稿" nzValue="draft"></nz-option>
              <nz-option nzLabel="已提交" nzValue="submitted"></nz-option>
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
              <th>候选人</th>
              <th>应聘岗位</th>
              <th>面试轮次</th>
              <th>面试时间</th>
              <th>评价截止</th>
              <th>状态</th>
              <th>评分/建议</th>
              <th nzWidth="180px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <div style="display: flex; align-items: center;">
                  <nz-avatar [nzText]="data.candidate.name.charAt(0)" nzSize="small" style="margin-right: 8px; background: #1890ff;"></nz-avatar>
                  <div>
                    <div style="font-weight: 500;">{{ data.candidate.name }}</div>
                    <div style="color: rgba(0, 0, 0, 0.45); font-size: 12px;">{{ data.candidate.department }}</div>
                  </div>
                </div>
              </td>
              <td>{{ data.candidate.position }}</td>
              <td>
                <nz-tag *ngIf="data.interviewType === 'phone'">电话面</nz-tag>
                <nz-tag *ngIf="data.interviewType === 'video'" nzColor="blue">视频面</nz-tag>
                <nz-tag *ngIf="data.interviewType === 'onsite'" nzColor="cyan">现场面</nz-tag>
                <nz-tag *ngIf="data.interviewType === 'final'" nzColor="purple">终面</nz-tag>
                <span style="margin-left: 4px;">第{{ data.round }}轮</span>
              </td>
              <td>{{ formatDate(data.interviewTime) }}</td>
              <td [ngClass]="{'urgent': data.overdueDays > 0}">
                {{ formatDate(data.evaluationDeadline) }}
                <div *ngIf="data.overdueDays > 0" style="font-size: 12px; color: #ff4d4f;">
                  逾期 {{ data.overdueDays }} 天
                </div>
              </td>
              <td>
                <nz-tag *ngIf="data.evaluationStatus === 'pending'" nzColor="gold">待填写</nz-tag>
                <nz-tag *ngIf="data.evaluationStatus === 'overdue'" nzColor="red">已逾期</nz-tag>
                <nz-tag *ngIf="data.evaluationStatus === 'draft'" nzColor="blue">草稿中</nz-tag>
                <nz-tag *ngIf="data.evaluationStatus === 'submitted'" nzColor="green">已提交</nz-tag>
              </td>
              <td>
                <ng-container *ngIf="data.evaluationStatus === 'submitted' || data.evaluationStatus === 'draft'">
                  <div *ngIf="data.overallScore">
                    <span style="font-weight: 600; color: #1890ff;">{{ data.overallScore }}</span>
                    <span style="color: rgba(0,0,0,0.45); font-size: 12px;"> / 10</span>
                  </div>
                  <div *ngIf="data.recommendationText" style="font-size: 12px; color: rgba(0,0,0,0.65); margin-top: 2px;">
                    {{ data.recommendationText }}
                  </div>
                </ng-container>
                <span *ngIf="data.evaluationStatus === 'pending' || data.evaluationStatus === 'overdue'" style="color: rgba(0,0,0,0.25);">
                  -
                </span>
              </td>
              <td>
                <button nz-button nzType="primary" nzSize="small" (click)="goToForm(data.id)">
                  <ng-container *ngIf="data.evaluationStatus === 'submitted'">
                    <i nz-icon nzType="eye"></i>查看
                  </ng-container>
                  <ng-container *ngIf="data.evaluationStatus === 'draft'">
                    <i nz-icon nzType="edit"></i>继续填写
                  </ng-container>
                  <ng-container *ngIf="data.evaluationStatus === 'pending' || data.evaluationStatus === 'overdue'">
                    <i nz-icon nzType="edit"></i>去评价
                  </ng-container>
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
export class EvaluationListComponent implements OnInit {
  loading = false;
  dataList: PendingEvaluationItem[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  statistics: EvaluationStatistics | null = null;

  queryParams: PendingEvaluationQueryParams = {
    keyword: '',
    status: ''
  };

  constructor(
    private evaluationService: EvaluationService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadData();
  }

  loadStatistics(): void {
    this.evaluationService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: () => {}
    });
  }

  loadData(): void {
    this.loading = true;
    const params: PendingEvaluationQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.evaluationService.getPendingList(params).subscribe({
      next: (res) => {
        this.dataList = res.list;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('加载列表失败');
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  resetSearch(): void {
    this.queryParams = { keyword: '', status: '' };
    this.pageIndex = 1;
    this.loadData();
  }

  refresh(): void {
    this.loadStatistics();
    this.loadData();
  }

  goToForm(interviewId: string): void {
    this.router.navigate(['/evaluations', interviewId]);
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
