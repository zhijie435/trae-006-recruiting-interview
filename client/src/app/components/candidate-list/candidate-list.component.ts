import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CandidateService } from '../../services/candidate.service';
import { Candidate, CandidateQueryParams } from '../../models/candidate.model';
import { NzMessageService } from 'ng-zorro-antd/message';

const INTERVIEW_TYPE_MAP: Record<string, string> = {
  phone: '电话面',
  video: '视频面',
  onsite: '现场面',
  final: '终面'
};

const EVALUATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待评价', color: 'gold' },
  submitted: { label: '已评价', color: 'green' },
  overdue: { label: '已逾期', color: 'red' }
};

const INTERVIEW_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待面试', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'default' }
};

@Component({
  selector: 'app-candidate-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>候选人管理</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="user" style="margin-right: 8px; color: #1890ff;"></i>
          候选人管理
        </h1>
        <button nz-button (click)="refresh()">
          <i nz-icon nzType="reload"></i>
          刷新
        </button>
      </div>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="候选人姓名/邮箱/电话/岗位" style="width: 240px;" />
          </div>
          <div class="search-item">
            <label class="search-label">部门</label>
            <nz-select [(ngModel)]="queryParams.department" style="width: 150px;" nzPlaceHolder="全部" nzAllowClear>
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
              <th>部门</th>
              <th>联系方式</th>
              <th>面试轮次</th>
              <th>最新面试</th>
              <th>沟通记录</th>
              <th>创建时间</th>
              <th nzWidth="120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <nz-avatar [nzText]="data.name.charAt(0)" nzSize="small" style="margin-right: 8px; vertical-align: middle;"></nz-avatar>
                <span style="font-weight: 500; vertical-align: middle;">{{ data.name }}</span>
              </td>
              <td>{{ data.position }}</td>
              <td>
                <nz-tag>{{ data.department }}</nz-tag>
              </td>
              <td>
                <div style="font-size: 12px;">
                  <div><i nz-icon nzType="mail" style="margin-right: 4px; color: rgba(0,0,0,0.45);"></i>{{ data.email }}</div>
                  <div style="margin-top: 2px;"><i nz-icon nzType="phone" style="margin-right: 4px; color: rgba(0,0,0,0.45);"></i>{{ data.phone }}</div>
                </div>
              </td>
              <td>
                <span style="font-weight: 500;">{{ data.interviewCount || 0 }}</span> 轮
              </td>
              <td>
                <div *ngIf="data.latestInterviewTime">
                  <div style="font-size: 12px;">{{ formatDateTime(data.latestInterviewTime) }}</div>
                  <div style="margin-top: 2px;">
                    <nz-tag *ngIf="data.latestEvaluationStatus" [nzColor]="getEvaluationStatusColor(data.latestEvaluationStatus)">
                      {{ getEvaluationStatusLabel(data.latestEvaluationStatus) }}
                    </nz-tag>
                  </div>
                </div>
                <div *ngIf="!data.latestInterviewTime" style="color: rgba(0,0,0,0.25);">暂无面试</div>
              </td>
              <td>
                <nz-badge [nzCount]="data.communicationCount || 0" [nzShowZero]="true" nzSize="small">
                  <span style="font-size: 13px; color: rgba(0,0,0,0.65);">沟通记录</span>
                </nz-badge>
              </td>
              <td>{{ formatDateTime(data.createdAt) }}</td>
              <td>
                <button nz-button nzType="link" nzType="primary" (click)="goToDetail(data)">
                  <i nz-icon nzType="eye"></i>
                  查看详情
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
export class CandidateListComponent implements OnInit {
  loading = false;
  dataList: Candidate[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;

  queryParams: CandidateQueryParams = {
    keyword: '',
    department: ''
  };

  constructor(
    private candidateService: CandidateService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: CandidateQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.candidateService.getCandidates(params).subscribe({
      next: (res) => {
        this.dataList = res.list;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('加载候选人列表失败');
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
    this.loadData();
  }

  goToDetail(candidate: Candidate): void {
    this.router.navigate(['/candidates', candidate.id]);
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

  getInterviewTypeLabel(type: string): string {
    return INTERVIEW_TYPE_MAP[type] || type;
  }

  getEvaluationStatusLabel(status: string): string {
    return EVALUATION_STATUS_MAP[status]?.label || status;
  }

  getEvaluationStatusColor(status: string): string {
    return EVALUATION_STATUS_MAP[status]?.color || 'default';
  }

  getInterviewStatusLabel(status: string): string {
    return INTERVIEW_STATUS_MAP[status]?.label || status;
  }

  getInterviewStatusColor(status: string): string {
    return INTERVIEW_STATUS_MAP[status]?.color || 'default';
  }
}
