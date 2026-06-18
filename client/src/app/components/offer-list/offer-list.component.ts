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
import { NzModalService } from 'ng-zorro-antd/modal';

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
          <button
            *ngIf="selectedPendingApprovalCount > 0"
            nz-button
            nzType="default"
            (click)="batchRemind()"
            style="margin-right: 8px;"
          >
            <i nz-icon nzType="bell"></i>批量催办 ({{ selectedPendingApprovalCount }})
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
            <div class="stat-value urgent">{{ (stats?.rejected || 0) + (stats?.declined || 0) }}</div>
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
              <th nzWidth="50px">
                <label nz-checkbox
                  [nzChecked]="allChecked"
                  [nzIndeterminate]="indeterminate"
                  (nzCheckedChange)="onAllChecked($event)">
                </label>
              </th>
              <th nzWidth="140px">Offer 编号</th>
              <th>候选人</th>
              <th>岗位/部门</th>
              <th>月薪</th>
              <th>入职日期</th>
              <th>状态</th>
              <th>催办</th>
              <th>更新时间</th>
              <th nzWidth="200px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <label nz-checkbox
                  [nzChecked]="checkedSet.has(data.id)"
                  (nzCheckedChange)="onItemChecked(data.id, $event, data.status)">
                </label>
              </td>
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
              <td>
                <span *ngIf="data.status === 'pending_approval'" style="display: flex; align-items: center; gap: 4px;">
                  <i nz-icon nzType="clock-circle" style="color: #fa8c16;"></i>
                  <span style="color: #fa8c16; font-size: 12px;">
                    已催办 {{ data.reminderCount || 0 }} 次
                  </span>
                </span>
                <span *ngIf="data.status !== 'pending_approval'" style="color: rgba(0,0,0,0.25);">-</span>
              </td>
              <td style="font-size: 12px; color: rgba(0,0,0,0.65);">{{ data.updatedAtText }}</td>
              <td>
                <button nz-button nzType="link" (click)="viewDetail(data)">
                  <i nz-icon nzType="eye"></i>详情
                </button>
                <button *ngIf="data.status === 'draft' || data.status === 'rejected'" nz-button nzType="link" nzType="primary" (click)="editOffer(data)">
                  <i nz-icon nzType="edit"></i>编辑
                </button>
                <button
                  *ngIf="data.status === 'pending_approval'"
                  nz-button
                  nzType="link"
                  nzDanger
                  (click)="openRemindModal(data)"
                >
                  <i nz-icon nzType="bell"></i>催办
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

      <nz-modal
        [(nzVisible)]="remindModalVisible"
        [nzTitle]="'催办审批 - ' + currentRemindOffer?.offerNo"
        [nzOkText]="'发送催办'"
        [nzCancelText]="'取消'"
        [nzOkLoading]="remindLoading"
        (nzOnOk)="handleRemindOk()"
        (nzOnCancel)="remindModalVisible = false"
        nzWidth="500px"
      >
        <div *ngIf="currentRemindOffer">
          <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i nz-icon nzType="info-circle" style="color: #faad14; font-size: 16px;"></i>
              <span style="color: #d48806; font-size: 14px;">
                即将向审批人发送催办通知，请确认以下信息
              </span>
            </div>
          </div>

          <nz-descriptions [nzColumn]="1" nzSize="small" nzBordered style="margin-bottom: 16px;">
            <nz-descriptions-item nzTitle="候选人">{{ currentRemindOffer.candidateName }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="岗位">{{ currentRemindOffer.position }} / {{ currentRemindOffer.department }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="当前状态">
              <nz-tag [nzColor]="currentRemindOffer.statusColor">{{ currentRemindOffer.statusLabel }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="已催办次数">{{ currentRemindOffer.reminderCount || 0 }} 次</nz-descriptions-item>
          </nz-descriptions>

          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: rgba(0,0,0,0.88);">
              催办备注 <span style="color: rgba(0,0,0,0.45); font-weight: normal;">（可选）</span>
            </label>
            <textarea
              nz-input
              [(ngModel)]="remindNote"
              placeholder="请输入催办备注，将显示在催办邮件中..."
              rows="3"
              maxlength="200"
              style="resize: none;"
            ></textarea>
            <div style="text-align: right; color: rgba(0,0,0,0.45); font-size: 12px; margin-top: 4px;">
              {{ remindNote.length }}/200
            </div>
          </div>

          <div *ngIf="currentRemindOffer.reminderLogs && currentRemindOffer.reminderLogs.length > 0" style="margin-top: 16px;">
            <div style="font-weight: 500; margin-bottom: 8px; color: rgba(0,0,0,0.88);">历史催办记录</div>
            <nz-timeline nzMode="left">
              <nz-timeline-item
                *ngFor="let log of currentRemindOffer.reminderLogs.slice().reverse()"
                [nzColor]="'orange'"
              >
                <div style="font-size: 13px;">
                  <span style="color: rgba(0,0,0,0.88); font-weight: 500;">{{ log.remindedBy }}</span>
                  <span style="color: rgba(0,0,0,0.45); margin: 0 8px;">发送催办</span>
                </div>
                <div style="font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 4px;">
                  {{ log.remindedAtText || log.remindedAt }}
                </div>
                <div *ngIf="log.reminderNote" style="font-size: 12px; color: #1890ff; margin-top: 4px; background: #e6f4ff; padding: 8px; border-radius: 4px;">
                  备注：{{ log.reminderNote }}
                </div>
              </nz-timeline-item>
            </nz-timeline>
          </div>
        </div>
      </nz-modal>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: rgba(0,0,0,0.88);
    }
    .stat-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s;
    }
    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .stat-value.warning { color: #fa8c16; }
    .stat-value.normal { color: #52c41a; }
    .stat-value.urgent { color: #f5222d; }
    .stat-label {
      font-size: 13px;
      color: rgba(0,0,0,0.45);
    }
    .toolbar {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #f0f0f0;
    }
    .search-form {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .search-label {
      font-size: 13px;
      color: rgba(0,0,0,0.88);
      font-weight: 500;
    }
    .table-container {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
    }
  `]
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

  checkedSet = new Set<string>();
  allChecked = false;
  indeterminate = false;
  selectedPendingApprovalCount = 0;

  remindModalVisible = false;
  remindLoading = false;
  currentRemindOffer: Offer | null = null;
  remindNote = '';

  constructor(
    private offerService: OfferService,
    private message: NzMessageService,
    private router: Router,
    private modalService: NzModalService
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
        this.refreshCheckedStatus();
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

  onAllChecked(checked: boolean): void {
    this.dataList.forEach(item => {
      if (checked) {
        this.checkedSet.add(item.id);
      } else {
        this.checkedSet.delete(item.id);
      }
    });
    this.refreshCheckedStatus();
  }

  onItemChecked(id: string, checked: boolean, status: string): void {
    if (checked) {
      this.checkedSet.add(id);
    } else {
      this.checkedSet.delete(id);
    }
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const allCount = this.dataList.length;
    const checkedCount = this.dataList.filter(item => this.checkedSet.has(item.id)).length;

    this.allChecked = allCount > 0 && checkedCount === allCount;
    this.indeterminate = checkedCount > 0 && checkedCount < allCount;

    this.selectedPendingApprovalCount = this.dataList.filter(
      item => this.checkedSet.has(item.id) && item.status === 'pending_approval'
    ).length;
  }

  openRemindModal(offer: Offer): void {
    this.currentRemindOffer = offer;
    this.remindNote = '';
    this.remindModalVisible = true;
  }

  handleRemindOk(): void {
    if (!this.currentRemindOffer) return;

    this.remindLoading = true;
    this.offerService.sendApprovalReminder(this.currentRemindOffer.id, this.remindNote).subscribe({
      next: (res: any) => {
        this.remindLoading = false;
        this.remindModalVisible = false;
        this.message.success(res.message || '催办通知已发送');
        this.refresh();
      },
      error: (err) => {
        this.remindLoading = false;
        this.message.error(err.error?.message || '催办失败，请稍后重试');
      }
    });
  }

  batchRemind(): void {
    const pendingApprovalIds = this.dataList
      .filter(item => this.checkedSet.has(item.id) && item.status === 'pending_approval')
      .map(item => item.id);

    if (pendingApprovalIds.length === 0) {
      this.message.warning('请选择审批中的 Offer 进行催办');
      return;
    }

    this.modalService.confirm({
      nzTitle: '批量催办确认',
      nzContent: `您已选择 ${pendingApprovalIds.length} 个审批中的 Offer，确定要发送催办通知吗？`,
      nzOkText: '确认催办',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzCancelText: '取消',
      nzOnOk: () => this.executeBatchRemind(pendingApprovalIds)
    });
  }

  executeBatchRemind(ids: string[]): void {
    let successCount = 0;
    let failCount = 0;
    const total = ids.length;

    const doRemind = (index: number) => {
      if (index >= total) {
        this.refresh();
        if (successCount > 0) {
          this.message.success(`批量催办完成，成功 ${successCount} 个${failCount > 0 ? `，失败 ${failCount} 个` : ''}`);
        }
        if (failCount > 0 && successCount === 0) {
          this.message.error(`批量催办失败，${failCount} 个催办未发送成功`);
        }
        return;
      }

      this.offerService.sendApprovalReminder(ids[index], '').subscribe({
        next: () => {
          successCount++;
          doRemind(index + 1);
        },
        error: (err) => {
          failCount++;
          console.error(`催办失败 ${ids[index]}:`, err);
          doRemind(index + 1);
        }
      });
    };

    doRemind(0);
  }
}
