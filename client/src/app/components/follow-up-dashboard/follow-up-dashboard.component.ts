import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { OfferFollowUpService } from '../../services/offer-follow-up.service';
import {
  DashboardStats,
  TrendPoint,
  OfferFollowUp,
  OfferFollowUpStatus
} from '../../models/offer-follow-up.model';
import {
  getStatusInfo,
  getChannelInfo,
  getHoursUntil,
  formatDateTime
} from '../../core/mock.repository';

@Component({
  selector: 'app-follow-up-dashboard',
  template: `
    <div class="dashboard-page">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item>催办工作台</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i nz-icon nzType="dashboard" style="margin-right: 8px; color: #0F3D3E;"></i>
            Offer 催办工作台
          </h1>
          <div class="page-subtitle">实时掌握 Offer 回复进度，高效推进候选人决策</div>
        </div>
        <div>
          <button nz-button (click)="refresh()" style="margin-right: 8px;">
            <i nz-icon nzType="reload"></i>刷新数据
          </button>
          <button nz-button nzType="primary" (click)="goToList()" style="background: #0F3D3E; border-color: #0F3D3E;">
            <i nz-icon nzType="unordered-list"></i>催办列表
          </button>
        </div>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 20px;">
        <nz-col [nzSpan]="6" *ngFor="let card of kpiCards" (click)="onKpiClick(card.key)" class="kpi-col">
          <div class="kpi-card" [style.border-left-color]="card.color">
            <div class="kpi-icon" [style.background]="card.color + '14'" [style.color]="card.color">
              <i nz-icon [nzType]="card.icon"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-value" [style.color]="card.color">{{ card.value }}</div>
              <div class="kpi-label">{{ card.label }}</div>
              <div class="kpi-sub" *ngIf="card.sub">{{ card.sub }}</div>
            </div>
          </div>
        </nz-col>
      </nz-row>

      <nz-row [nzGutter]="16">
        <nz-col [nzSpan]="16">
          <nz-card class="section-card" [nzBordered]="false">
            <div class="section-header">
              <h3 class="section-title">
                <i nz-icon nzType="clock-circle" style="color: #E0A458;"></i>
                紧急待催办 TOP 8
              </h3>
              <a nz-button nzType="link" (click)="goToList()">查看全部 →</a>
            </div>
            <nz-table
              #urgentTable
              [nzData]="urgentList"
              [nzFrontPagination]="false"
              [nzShowPagination]="false"
              nzSize="small"
            >
              <thead>
                <tr>
                  <th>候选人</th>
                  <th>岗位</th>
                  <th>SLA 截止</th>
                  <th>剩余时间</th>
                  <th>催办次数</th>
                  <th style="width: 120px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of urgentTable.data" [class.row-overdue]="isOverdue(item)">
                  <td>
                    <div class="candidate-cell">
                      <nz-avatar [nzSize]="32" style="background: #0F3D3E;">{{ item.candidateName.charAt(0) }}</nz-avatar>
                      <div>
                        <div style="font-weight: 500;">{{ item.candidateName }}</div>
                        <div style="color: rgba(0,0,0,0.45); font-size: 12px;">{{ item.offerNo }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{{ item.position }}</div>
                    <div style="color: rgba(0,0,0,0.45); font-size: 12px;">{{ item.department }}</div>
                  </td>
                  <td style="font-family: monospace; font-size: 12px;">{{ formatDateTime(item.expireAt) }}</td>
                  <td>
                    <nz-tag [nzColor]="getRemainingHoursColor(item)">
                      {{ formatRemainingHours(item) }}
                    </nz-tag>
                  </td>
                  <td>
                    <nz-badge [nzCount]="item.followUpRecords?.length || 0" [nzStyle]="{ background: '#E0A458' }"></nz-badge>
                  </td>
                  <td>
                    <button nz-button nzType="link" nzSize="small" (click)="goToDetail(item)">
                      <i nz-icon nzType="eye"></i>详情
                    </button>
                  </td>
                </tr>
              </tbody>
            </nz-table>
            <div *ngIf="urgentList.length === 0" class="empty-state">
              <nz-empty nzNotFoundDescription="暂无紧急待催办的 Offer"></nz-empty>
            </div>
          </nz-card>

          <nz-card class="section-card" [nzBordered]="false" style="margin-top: 16px;">
            <div class="section-header">
              <h3 class="section-title">
                <i nz-icon nzType="bar-chart" style="color: #0F3D3E;"></i>
                近 14 天回复趋势
              </h3>
              <div style="display: flex; gap: 16px; font-size: 12px;">
                <span><span class="legend-dot" style="background: #2E7D6B;"></span>已接受</span>
                <span><span class="legend-dot" style="background: #B5462F;"></span>已拒绝</span>
                <span><span class="legend-dot" style="background: #E0A458;"></span>待回复</span>
              </div>
            </div>
            <div class="trend-chart">
              <div class="chart-grid" *ngIf="trendData.length > 0">
                <div class="chart-row" *ngFor="let point of trendData">
                  <div class="chart-label">{{ point.date }}</div>
                  <div class="chart-bars">
                    <div
                      class="chart-bar bar-accepted"
                      [style.width]="(point.accepted / maxTrendValue * 100) + '%'"
                      [attr.title]="'已接受: ' + point.accepted"
                    >
                      <span *ngIf="point.accepted > 0">{{ point.accepted }}</span>
                    </div>
                    <div
                      class="chart-bar bar-rejected"
                      [style.width]="(point.rejected / maxTrendValue * 100) + '%'"
                      [attr.title]="'已拒绝: ' + point.rejected"
                    >
                      <span *ngIf="point.rejected > 0">{{ point.rejected }}</span>
                    </div>
                    <div
                      class="chart-bar bar-pending"
                      [style.width]="(point.pending / maxTrendValue * 100) + '%'"
                      [attr.title]="'待回复: ' + point.pending"
                    >
                      <span *ngIf="point.pending > 0">{{ point.pending }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nz-card>
        </nz-col>

        <nz-col [nzSpan]="8">
          <nz-card class="section-card" [nzBordered]="false">
            <div class="section-header">
              <h3 class="section-title">
                <i nz-icon nzType="warning" style="color: #B5462F;"></i>
                超时预警
              </h3>
              <nz-tag [nzColor]="'#B5462F'">{{ overdueList.length }} 个</nz-tag>
            </div>
            <div class="overdue-list">
              <div *ngFor="let item of overdueList" class="overdue-item" (click)="goToDetail(item)">
                <div class="overdue-item-header">
                  <span style="font-weight: 500;">{{ item.candidateName }}</span>
                  <span class="overdue-badge">已超时 {{ Math.abs(Math.floor(getHoursUntil(item.expireAt))) }} 小时</span>
                </div>
                <div class="overdue-item-sub">{{ item.position }} · {{ item.department }}</div>
                <div class="overdue-item-footer">
                  <span style="font-size: 12px; color: rgba(0,0,0,0.45);">责任人: {{ item.owner }}</span>
                  <nz-tag [nzColor]="getStatusInfo(item.status).color" nzSize="small">
                    {{ getStatusInfo(item.status).label }}
                  </nz-tag>
                </div>
              </div>
              <div *ngIf="overdueList.length === 0" class="empty-state">
                <nz-empty nzNotFoundDescription="暂无超时 Offer" [nzNotFoundImage]="'simple'"></nz-empty>
              </div>
            </div>
          </nz-card>

          <nz-card class="section-card" [nzBordered]="false" style="margin-top: 16px;">
            <div class="section-header">
              <h3 class="section-title">
                <i nz-icon nzType="bulb" style="color: #E0A458;"></i>
                催办建议
              </h3>
            </div>
            <nz-alert
              nzType="info"
              nzShowIcon
              style="margin-bottom: 12px; background: #E6EEED; border: none;"
              nzMessage="优先处理"
              nzDescription="建议优先对超时超过 24 小时的候选人进行电话催办，直接沟通决策障碍"
            />
            <nz-alert
              nzType="warning"
              nzShowIcon
              style="margin-bottom: 12px;"
              nzMessage="SLA 临近"
              nzDescription="今日到期的 Offer，建议在上午通过企业微信 + 邮件双通道提醒"
            />
            <nz-alert
              nzType="success"
              nzShowIcon
              nzMessage="最佳实践"
              nzDescription="每周五下午统一跟进本周发出的 Offer，可显著提升接受率约 15%"
            />
          </nz-card>
        </nz-col>
      </nz-row>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 24px; background: #F7F5F1; min-height: 100vh; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .page-title {
      margin: 0; font-size: 24px; font-weight: 600; color: rgba(0,0,0,0.88);
      font-family: 'Noto Serif SC', serif;
    }
    .page-subtitle {
      color: rgba(0,0,0,0.45); font-size: 13px; margin-top: 4px;
    }
    .kpi-col { cursor: pointer; }
    .kpi-card {
      background: #fff; border-radius: 8px; padding: 20px; display: flex; gap: 16px;
      align-items: center; border-left: 4px solid; transition: all 0.3s;
      border-top: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
    }
    .kpi-card:hover { box-shadow: 0 4px 16px rgba(15, 61, 62, 0.12); transform: translateY(-2px); }
    .kpi-icon {
      width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
    }
    .kpi-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
    .kpi-label { font-size: 13px; color: rgba(0,0,0,0.55); margin-top: 2px; }
    .kpi-sub { font-size: 11px; color: rgba(0,0,0,0.35); margin-top: 2px; }
    .section-card { border-radius: 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .candidate-cell { display: flex; align-items: center; gap: 10px; }
    .row-overdue { background: #FBE9E5; }
    .row-overdue:hover > td { background: #F5D6CD !important; }
    .empty-state { padding: 24px 0; }
    .trend-chart { padding: 8px 0; }
    .chart-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    }
    .chart-label {
      width: 40px; font-size: 11px; color: rgba(0,0,0,0.55); text-align: right; font-family: monospace;
    }
    .chart-bars {
      flex: 1; display: flex; flex-direction: column; gap: 2px;
    }
    .chart-bar {
      height: 14px; border-radius: 2px; min-width: 20px;
      display: flex; align-items: center; padding-left: 6px;
      font-size: 10px; color: #fff; font-weight: 500; transition: width 0.5s ease;
    }
    .bar-accepted { background: #2E7D6B; }
    .bar-rejected { background: #B5462F; }
    .bar-pending { background: #E0A458; }
    .legend-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
    }
    .overdue-list { max-height: 400px; overflow-y: auto; }
    .overdue-item {
      padding: 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s;
      border: 1px solid #f0f0f0; margin-bottom: 8px;
    }
    .overdue-item:hover { background: #FBE9E5; border-color: #F5D6CD; }
    .overdue-item-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
    }
    .overdue-badge {
      font-size: 11px; color: #B5462F; background: #FBE9E5; padding: 2px 6px; border-radius: 4px;
    }
    .overdue-item-sub {
      font-size: 12px; color: rgba(0,0,0,0.65); margin-bottom: 6px;
    }
    .overdue-item-footer {
      display: flex; justify-content: space-between; align-items: center;
    }
  `]
})
export class FollowUpDashboardComponent implements OnInit {
  stats: DashboardStats = {
    pendingCount: 0,
    todayDueCount: 0,
    overdueCount: 0,
    weekAcceptedCount: 0,
    weekRejectedCount: 0,
    avgResponseHours: 0,
    acceptanceRate: 0
  };
  urgentList: OfferFollowUp[] = [];
  overdueList: OfferFollowUp[] = [];
  trendData: TrendPoint[] = [];

  constructor(
    private dashboardService: DashboardService,
    private followUpService: OfferFollowUpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get kpiCards() {
    return [
      { key: 'pending', label: '待催办数', value: this.stats.pendingCount, icon: 'clock-circle', color: '#0F3D3E', sub: '需要跟进的 Offer' },
      { key: 'today', label: '今日到期', value: this.stats.todayDueCount, icon: 'calendar', color: '#E0A458', sub: '24小时内截止' },
      { key: 'overdue', label: '已超时', value: this.stats.overdueCount, icon: 'warning', color: '#B5462F', sub: '需立即处理' },
      { key: 'rate', label: '接受率', value: this.stats.acceptanceRate + '%', icon: 'check-circle', color: '#2E7D6B', sub: `平均响应 ${this.stats.avgResponseHours}h` }
    ];
  }

  get maxTrendValue(): number {
    let max = 1;
    this.trendData.forEach(p => {
      max = Math.max(max, p.accepted, p.rejected, p.pending);
    });
    return max;
  }

  loadAll(): void {
    this.dashboardService.getStats().subscribe(s => { this.stats = s; });
    this.dashboardService.getPendingOffersSortedByUrgency(8).subscribe(l => { this.urgentList = l; });
    this.dashboardService.getOverdueOffers(5).subscribe(l => { this.overdueList = l; });
    this.dashboardService.getTrend(14).subscribe(d => { this.trendData = d; });
  }

  refresh(): void {
    this.loadAll();
  }

  goToList(): void {
    this.router.navigate(['/offer-follow-ups']);
  }

  goToDetail(item: OfferFollowUp): void {
    this.router.navigate(['/offer-follow-ups', item.id]);
  }

  onKpiClick(key: string): void {
    const params: any = {};
    if (key === 'overdue') params.slaRisk = 'OVERDUE';
    else if (key === 'today') params.slaRisk = 'WARNING';
    else if (key === 'pending') params.status = 'PENDING';
    this.router.navigate(['/offer-follow-ups'], { queryParams: params });
  }

  formatDateTime = formatDateTime;
  getStatusInfo = getStatusInfo;
  getChannelInfo = getChannelInfo;
  getHoursUntil = getHoursUntil;
  Math = Math;

  isOverdue(item: OfferFollowUp): boolean {
    return getHoursUntil(item.expireAt) <= 0 && item.status === 'PENDING';
  }

  getRemainingHoursColor(item: OfferFollowUp): string {
    const h = getHoursUntil(item.expireAt);
    if (h <= 0) return '#B5462F';
    if (h <= 24) return '#E0A458';
    return '#2E7D6B';
  }

  formatRemainingHours(item: OfferFollowUp): string {
    const h = getHoursUntil(item.expireAt);
    if (h <= 0) return `已超时 ${Math.abs(Math.floor(h))}h`;
    if (h < 1) return `${Math.floor(h * 60)}分钟`;
    if (h < 24) return `${Math.floor(h)}小时`;
    return `${Math.floor(h / 24)}天${Math.floor(h % 24)}小时`;
  }
}
