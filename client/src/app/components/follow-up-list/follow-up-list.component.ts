import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OfferFollowUpService } from '../../services/offer-follow-up.service';
import {
  OfferFollowUp,
  OfferFollowUpQueryParams,
  PaginatedOfferFollowUps,
  OFFER_FOLLOW_UP_STATUS_OPTIONS,
  SLA_RISK_OPTIONS,
  OfferFollowUpStatus
} from '../../models/offer-follow-up.model';
import {
  formatDateTime,
  getStatusInfo,
  getHoursUntil
} from '../../core/mock.repository';

@Component({
  selector: 'app-follow-up-list',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item (click)="router.navigate(['/follow-up-dashboard'])">催办工作台</nz-breadcrumb-item>
        <nz-breadcrumb-item>Offer 催办管理</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="audit" style="margin-right: 8px; color: #0F3D3E;"></i>
          Offer 催办管理
        </h1>
        <div>
          <button nz-button (click)="refresh()" style="margin-right: 8px;">
            <i nz-icon nzType="reload"></i>刷新
          </button>
          <button
            *ngIf="selectedPendingCount > 0"
            nz-button
            style="margin-right: 8px; background: #E0A458; border-color: #E0A458;"
            nzType="primary"
            (click)="openBatchFollowUp()"
          >
            <i nz-icon nzType="message"></i>批量催办 ({{ selectedPendingCount }})
          </button>
        </div>
      </div>

      <div class="filter-panel">
        <div class="filter-row">
          <div class="filter-item">
            <label>关键词</label>
            <input nz-input [(ngModel)]="queryParams.keyword" placeholder="编号/姓名/岗位/手机/邮箱" style="width: 240px;" />
          </div>
          <div class="filter-item">
            <label>状态</label>
            <nz-select [(ngModel)]="queryParams.status" style="width: 140px;">
              <nz-option *ngFor="let opt of statusOptions" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="filter-item">
            <label>部门</label>
            <nz-select [(ngModel)]="queryParams.department" style="width: 140px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option *ngFor="let d of departments" [nzLabel]="d" [nzValue]="d"></nz-option>
            </nz-select>
          </div>
        </div>
        <div class="filter-row" style="margin-top: 12px;">
          <div class="filter-item">
            <label>SLA 风险</label>
            <nz-select [(ngModel)]="queryParams.slaRisk" style="width: 140px;">
              <nz-option *ngFor="let opt of slaRiskOptions" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
            </nz-select>
          </div>
          <div class="filter-item">
            <label>责任人</label>
            <nz-select [(ngModel)]="queryParams.owner" style="width: 160px;" nzPlaceHolder="全部">
              <nz-option nzLabel="全部" nzValue=""></nz-option>
              <nz-option *ngFor="let o of owners" [nzLabel]="o" [nzValue]="o"></nz-option>
            </nz-select>
          </div>
          <div class="filter-actions">
            <button nz-button nzType="primary" (click)="search()" style="background: #0F3D3E; border-color: #0F3D3E;">
              <i nz-icon nzType="search"></i>查询
            </button>
            <button nz-button (click)="resetSearch()">重置</button>
          </div>
        </div>
      </div>

      <div class="table-panel">
        <nz-table
          #offerTable
          [nzData]="dataList"
          [nzFrontPagination]="false"
          [nzTotal]="total"
          [(nzPageIndex)]="pageIndex"
          [(nzPageSize)]="pageSize"
          (nzPageIndexChange)="loadData()"
          (nzPageSizeChange)="loadData()"
          nzShowSizeChanger
          [nzPageSizeOptions]="[10, 20, 50]"
          nzShowQuickJumper
        >
          <thead>
            <tr>
              <th nzWidth="50px">
                <label nz-checkbox
                  [nzChecked]="allChecked"
                  [nzIndeterminate]="indeterminate"
                  (nzCheckedChange)="onAllChecked($event)">
                </label>
              </th>
              <th nzWidth="130px">Offer 编号</th>
              <th>候选人</th>
              <th>岗位 / 部门</th>
              <th>薪资</th>
              <th>责任人</th>
              <th>SLA 截止</th>
              <th>SLA 风险</th>
              <th>状态</th>
              <th>催办次数</th>
              <th nzWidth="180px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of offerTable.data" [ngClass]="getRowClass(data)">
              <td>
                <label nz-checkbox
                  [nzChecked]="checkedSet.has(data.id)"
                  [nzDisabled]="data.status !== 'PENDING'"
                  (nzCheckedChange)="onItemChecked(data.id, $event)">
                </label>
              </td>
              <td>
                <span style="font-family: monospace; font-size: 12px; color: #0F3D3E;">{{ data.offerNo }}</span>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <nz-avatar [nzSize]="28" style="background: #0F3D3E;">{{ data.candidateName.charAt(0) }}</nz-avatar>
                  <div>
                    <div style="font-weight: 500;">{{ data.candidateName }}</div>
                    <div style="font-size: 11px; color: rgba(0,0,0,0.45);">{{ data.candidatePhone }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ data.position }}</div>
                <div style="font-size: 12px; color: rgba(0,0,0,0.45);">{{ data.department }}</div>
              </td>
              <td style="font-weight: 500; color: #E0A458;">{{ data.salaryPackage }}</td>
              <td>
                <nz-tag [nzColor]="'#F7F5F1'" style="color: #0F3D3E;">{{ data.owner }}</nz-tag>
              </td>
              <td style="font-family: monospace; font-size: 12px;">{{ formatDateTime(data.expireAt) }}</td>
              <td>
                <nz-tag [nzColor]="getSlaRiskTag(data).color">
                  <i nz-icon [nzType]="getSlaRiskTag(data).icon" nzTheme="outline" style="margin-right: 4px;"></i>
                  {{ getSlaRiskTag(data).label }}
                </nz-tag>
              </td>
              <td>
                <nz-tag [nzColor]="getStatusInfo(data.status).color" [nzStyle]="{ background: getStatusInfo(data.status).bgColor }">
                  {{ getStatusInfo(data.status).label }}
                </nz-tag>
              </td>
              <td style="text-align: center;">
                <nz-badge [nzCount]="data.followUpRecords?.length || 0" nzSize="small" [nzStyle]="{ background: '#E0A458' }"></nz-badge>
              </td>
              <td>
                <button nz-button nzType="link" nzSize="small" (click)="viewDetail(data)">
                  <i nz-icon nzType="eye"></i>详情
                </button>
                <button *ngIf="data.status === 'PENDING'" nz-button nzType="link" nzSize="small" (click)="openFollowUpModal(data)">
                  <i nz-icon nzType="message"></i>催办
                </button>
                <nz-dropdown *ngIf="data.status === 'PENDING'" nzTrigger="click" [nzDropdownMenu]="statusMenu">
                  <a nz-button nzType="link" nzSize="small" nz-dropdown>
                    状态 <i nz-icon nzType="down"></i>
                  </a>
                  <nz-dropdown-menu #statusMenu="nzDropdownMenu">
                    <ul nz-menu>
                      <li nz-menu-item (click)="changeStatus(data, 'ACCEPTED')">
                        <i nz-icon nzType="check-circle" style="color: #2E7D6B;"></i> 标记已接受
                      </li>
                      <li nz-menu-item (click)="changeStatus(data, 'REJECTED')">
                        <i nz-icon nzType="close-circle" style="color: #B5462F;"></i> 标记已拒绝
                      </li>
                      <li nz-menu-item (click)="changeStatus(data, 'EXPIRED')">
                        <i nz-icon nzType="clock-circle" style="color: #8A8F98;"></i> 标记已过期
                      </li>
                    </ul>
                  </nz-dropdown-menu>
                </nz-dropdown>
                <button *ngIf="data.status === 'EXPIRED'" nz-button nzType="link" nzSize="small" (click)="changeStatus(data, 'PENDING')">
                  <i nz-icon nzType="redo"></i>重新激活
                </button>
                <button *ngIf="data.status === 'ACCEPTED'" nz-button nzType="link" nzSize="small" (click)="changeStatus(data, 'ONBOARDED')">
                  <i nz-icon nzType="check-circle"></i>标记入职
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <app-follow-up-modal
        #followUpModal
        (onSuccess)="onFollowUpSuccess()"
      ></app-follow-up-modal>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; background: #F7F5F1; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-title { margin: 0; font-size: 22px; font-weight: 600; font-family: 'Noto Serif SC', serif; }
    .filter-panel { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
    .filter-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    .filter-item { display: flex; flex-direction: column; gap: 6px; }
    .filter-item label { font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.88); }
    .filter-actions { margin-left: auto; display: flex; gap: 8px; }
    .table-panel { background: #fff; border-radius: 8px; border: 1px solid #f0f0f0; padding: 4px; }
    .row-overdue { background: #FBE9E5; }
    .row-overdue:hover > td { background: #F5D6CD !important; }
    .row-warning { background: #FFF7E6; }
    .row-warning:hover > td { background: #FFE7BA !important; }
  `]
})
export class FollowUpListComponent implements OnInit {
  dataList: OfferFollowUp[] = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  departments: string[] = [];
  owners: string[] = [];
  statusOptions = OFFER_FOLLOW_UP_STATUS_OPTIONS;
  slaRiskOptions = SLA_RISK_OPTIONS;

  queryParams: OfferFollowUpQueryParams = {
    keyword: '',
    status: '',
    department: '',
    slaRisk: '',
    owner: ''
  };

  checkedSet = new Set<string>();
  allChecked = false;
  indeterminate = false;
  selectedPendingCount = 0;

  constructor(
    private followUpService: OfferFollowUpService,
    public router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) this.queryParams.status = params['status'] as any;
      if (params['slaRisk']) this.queryParams.slaRisk = params['slaRisk'] as any;
    });

    this.followUpService.getDepartments().subscribe(d => { this.departments = d; });
    this.followUpService.getOwners().subscribe(o => { this.owners = o; });
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: OfferFollowUpQueryParams = {
      ...this.queryParams,
      page: this.pageIndex,
      pageSize: this.pageSize
    };
    this.followUpService.query(params).subscribe({
      next: (res: PaginatedOfferFollowUps) => {
        this.dataList = res.list;
        this.total = res.total;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: () => {
        this.loading = false;
        this.message.error('加载失败');
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  resetSearch(): void {
    this.queryParams = { keyword: '', status: '', department: '', slaRisk: '', owner: '' };
    this.pageIndex = 1;
    this.loadData();
  }

  refresh(): void {
    this.loadData();
  }

  viewDetail(data: OfferFollowUp): void {
    this.router.navigate(['/offer-follow-ups', data.id]);
  }

  openFollowUpModal(data: OfferFollowUp): void {
    const modal = document.querySelector('app-follow-up-modal') as any;
    if (modal && modal.openForSingle) {
      modal.openForSingle(data);
    }
  }

  openBatchFollowUp(): void {
    const ids = this.dataList.filter(item =>
      this.checkedSet.has(item.id) && item.status === 'PENDING'
    ).map(item => item.id);

    if (ids.length === 0) {
      this.message.warning('请选择待催办状态的 Offer');
      return;
    }
    const modal = document.querySelector('app-follow-up-modal') as any;
    if (modal && modal.openForBatch) {
      modal.openForBatch(ids);
    }
  }

  onFollowUpSuccess(): void {
    this.loadData();
  }

  changeStatus(data: OfferFollowUp, target: OfferFollowUpStatus): void {
    const actionText: Record<OfferFollowUpStatus, string> = {
      PENDING: '重新激活',
      ACCEPTED: '标记已接受',
      REJECTED: '标记已拒绝',
      EXPIRED: '标记已过期',
      ONBOARDED: '标记已入职'
    };
    this.modalService.confirm({
      nzTitle: `${actionText[target]} 确认`,
      nzContent: `确定要将「${data.candidateName}」的 Offer ${actionText[target]} 吗？`,
      nzOkText: '确认',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.followUpService.transitionStatus(data.id, target).subscribe({
          next: (res) => {
            if (res) {
              this.message.success('状态更新成功');
              this.loadData();
            } else {
              this.message.error('状态流转不合法');
            }
          },
          error: () => this.message.error('状态更新失败')
        });
      }
    });
  }

  formatDateTime = formatDateTime;
  getStatusInfo = getStatusInfo;

  getRowClass(data: OfferFollowUp): string {
    if (data.status !== 'PENDING') return '';
    const h = getHoursUntil(data.expireAt);
    if (h <= 0) return 'row-overdue';
    if (h <= 24) return 'row-warning';
    return '';
  }

  getSlaRiskTag(data: OfferFollowUp): { label: string; color: string; icon: string } {
    if (data.status !== 'PENDING') {
      return { label: '—', color: '#d9d9d9', icon: 'minus-circle' };
    }
    const h = getHoursUntil(data.expireAt);
    if (h <= 0) return { label: '已超时', color: '#B5462F', icon: 'warning' };
    if (h <= 24) return { label: '临期', color: '#E0A458', icon: 'clock-circle' };
    return { label: '正常', color: '#2E7D6B', icon: 'check-circle' };
  }

  onAllChecked(checked: boolean): void {
    this.dataList.forEach(item => {
      if (item.status === 'PENDING') {
        if (checked) this.checkedSet.add(item.id);
        else this.checkedSet.delete(item.id);
      }
    });
    this.refreshCheckedStatus();
  }

  onItemChecked(id: string, checked: boolean): void {
    if (checked) this.checkedSet.add(id);
    else this.checkedSet.delete(id);
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const pendingList = this.dataList.filter(item => item.status === 'PENDING');
    const checkedCount = pendingList.filter(item => this.checkedSet.has(item.id)).length;
    this.allChecked = pendingList.length > 0 && checkedCount === pendingList.length;
    this.indeterminate = checkedCount > 0 && checkedCount < pendingList.length;
    this.selectedPendingCount = checkedCount;
  }
}
