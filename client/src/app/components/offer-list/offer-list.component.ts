import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfferService } from '../../services/offer.service';
import {
  Offer,
  OfferQueryParams,
  OfferStatistics,
  OFFER_STATUS_OPTIONS
} from '../../models/offer.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-offer-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>Offer 管理</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="audit" style="margin-right: 8px; color: #1890ff;"></i>
          Offer 审批管理
        </h1>
        <div>
          <button nz-button (click)="refresh()" style="margin-right: 8px;">
            <i nz-icon nzType="reload"></i>刷新
          </button>
          <button nz-button nzType="primary" (click)="createOffer()">
            <i nz-icon nzType="plus"></i>新建 Offer
          </button>
        </div>
      </div>

      <nz-row [nzGutter]="12" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff;">{{ stats?.total || 0 }}</div>
            <div class="stat-label">Offer 总数</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value warning">{{ stats?.pendingAction || 0 }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value" style="color: #722ed1;">{{ stats?.pending_approval || 0 }}</div>
            <div class="stat-label">审批中</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value normal">{{ stats?.approved || 0 }}</div>
            <div class="stat-label">审批通过</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff;">{{ stats?.sent || 0 }}</div>
            <div class="stat-label">已发出</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value normal">{{ stats?.accepted || 0 }}</div>
            <div class="stat-label">已接受</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value urgent">{{ stats?.rejected + (stats?.declined || 0) }}</div>
            <div class="stat-label">驳回/拒绝</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="3">
          <div class="stat-card">
            <div class="stat-value" style="color: #8c8c8c;">{{ stats?.withdrawn || 0 }}</div>
            <div class="stat-label">已撤回</div>
          </div>
        </nz-col>
      </nz-row>

      <div class="toolbar">
        <div class="search-form">
          <div class="search-item">
            <label class="search-label">关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="Offer编号/候选人/岗位" style="width: 220px;" />
          </div>
          <div class="search-item">
            <label class="search-label">状态</label>
            <nz-select [(ngModel)]="queryParams.status" style="width: 140px;">
              <nz-option *ngFor="let opt of statusOptions" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="search-item">
            <label class="search-label">部门</label>
            <nz-select [(ngModel)]="queryParams.department" style="width: 140px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option nzLabel="技术部" nzValue="技术部"></nz-option>
              <nz-option nzLabel="产品部" nzValue="产品部"></nz-option>
              <nz-option nzLabel="设计部" nzValue="设计部"></nz-option>
              <nz-option nzLabel="运营部" nzValue="运营部"></nz-option>
            </nz-select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button nz-button nzType="primary" (click)="search()">
              <i nz-icon nzType="search"></i>查询
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
          [nzPageSizeOptions]="[10, 20, 50]"
        >
          <thead>
            <tr>
              <th nzWidth="140px">Offer 编号</th>
              <th>候选人</th>
              <th>岗位/部门</th>
              <th>月薪</th>
              <th>入职日期</th>
              <th>状态</th>
              <th>更新时间</th>
              <th nzWidth="160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <div style="font-family: monospace; color: #1890ff; font-size: 13px;">{{ data.offerNo }}</div>
              </td>
              <td>
                <div style="font-weight: 500;">{{ data.candidateName }}</div>
                <div style="color: rgba(0,0,0,0.45); font-size: 12px;">{{ data.candidatePhone || '-' }}</div>
              </td>
              <td>
                <div>{{ data.position }}</div>
                <div style="color: rgba(0,0,0,0.45); font-size: 12px;">{{ data.department }} · {{ data.employmentTypeLabel }}</div>
              </td>
              <td>
                <div *ngIf="data.salaryMonthly" style="font-weight: 600; color: #fa541c;">
                  ¥{{ formatSalary(data.salaryMonthly) }}
                  <span style="color: rgba(0,0,0,0.45); font-size: 12px; font-weight: normal;"> × {{ data.salaryMonths }}月</span>
                </div>
                <span *ngIf="!data.salaryMonthly" style="color: rgba(0,0,0,0.25);">-</span>
              </td>
              <td>{{ data.entryDateText || '-' }}</td>
              <td>
                <nz-tag [nzColor]="data.statusColor">{{ data.statusLabel }}</nz-tag>
              </td>
              <td style="font-size: 12px; color: rgba(0,0,0,0.65);">{{ data.updatedAtText }}</td>
              <td>
                <button nz-button nzType="link" (click)="viewDetail(data)">
                  <i nz-icon nzType="eye"></i>详情
                </button>
                <button *ngIf="data.status === 'draft' || data.status === 'rejected'" nz-button nzType="link" nzType="primary" (click)="editOffer(data)">
                  <i nz-icon nzType="edit"></i>编辑
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
export class OfferListComponent implements OnInit {
  loading = false;
  dataList: Offer[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  stats: OfferStatistics | null = null;
  statusOptions = OFFER_STATUS_OPTIONS;

  queryParams: OfferQueryParams = {
    keyword: '',
    status: '',
    department: ''
  };

  constructor(
    private offerService: OfferService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadData();
  }

  loadStatistics(): void {
    this.offerService.getStatistics().subscribe({
      next: (data) => { this.stats = data; },
      error: () => {}
    });
  }

  loadData(): void {
    this.loading = true;
    const params: OfferQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    this.offerService.getOffers(params).subscribe({
      next: (res) => {
        this.dataList = res.list;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('加载 Offer 列表失败');
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  resetSearch(): void {
    this.queryParams = { keyword: '', status: '', department: '' };
    this.pageIndex = 1;
    this.loadData();
  }

  refresh(): void {
    this.loadStatistics();
    this.loadData();
  }

  viewDetail(data: Offer): void {
    this.router.navigate(['/offers', data.id]);
  }

  createOffer(): void {
    this.router.navigate(['/offers/new']);
  }

  editOffer(data: Offer): void {
    this.router.navigate(['/offers', data.id, 'edit']);
  }

  formatSalary(num: number): string {
    return num.toLocaleString('zh-CN');
  }
}
