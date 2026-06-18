import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OfferFollowUpService } from '../../services/offer-follow-up.service';
import {
  OfferFollowUp,
  FollowUpRecord,
  FollowUpChannel,
  OfferFollowUpStatus,
  OFFER_FOLLOW_UP_STATUS_OPTIONS
} from '../../models/offer-follow-up.model';
import {
  formatDateTime,
  getStatusInfo,
  getChannelInfo,
  getHoursUntil
} from '../../core/mock.repository';

@Component({
  selector: 'app-follow-up-detail',
  template: `
    <div class="detail-page" *ngIf="offer">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item (click)="router.navigate(['/follow-up-dashboard'])">催办工作台</nz-breadcrumb-item>
        <nz-breadcrumb-item (click)="router.navigate(['/offer-follow-ups'])">Offer 催办管理</nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ offer.candidateName }} 的 Offer</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="detail-header" [ngStyle]="{ 'background': getStatusInfo(offer.status).bgColor }">
        <div class="header-left">
          <div class="back-btn" (click)="goBack()">
            <i nz-icon nzType="arrow-left"></i>返回
          </div>
          <div class="candidate-info">
            <nz-avatar [nzSize]="56" style="background: #0F3D3E; font-size: 22px;">
              {{ offer.candidateName.charAt(0) }}
            </nz-avatar>
            <div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 600;">{{ offer.candidateName }}</h1>
                <nz-tag [nzColor]="getStatusInfo(offer.status).color" [nzStyle]="{ background: '#fff' }">
                  {{ getStatusInfo(offer.status).label }}
                </nz-tag>
              </div>
              <div style="margin-top: 6px; color: rgba(0,0,0,0.55); font-size: 13px;">
                <i nz-icon nzType="audit"></i>
                <span style="font-family: monospace; margin-left: 4px;">{{ offer.offerNo }}</span>
                <nz-divider nzType="vertical"></nz-divider>
                <i nz-icon nzType="solution"></i>
                <span style="margin-left: 4px;">{{ offer.position }}</span>
                <nz-divider nzType="vertical"></nz-divider>
                <i nz-icon nzType="apartment"></i>
                <span style="margin-left: 4px;">{{ offer.department }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button nz-button (click)="goBack()" style="margin-right: 8px;">
            <i nz-icon nzType="arrow-left"></i>返回列表
          </button>
          <button
            *ngIf="offer.status === 'PENDING'"
            nz-button
            style="margin-right: 8px; background: #E0A458; border-color: #E0A458;"
            nzType="primary"
            (click)="openFollowUp()"
          >
            <i nz-icon nzType="message"></i>添加催办
          </button>
          <ng-container *ngIf="offer.status === 'PENDING'">
            <button nz-button style="margin-right: 8px; background: #2E7D6B; border-color: #2E7D6B;" nzType="primary" (click)="changeStatus('ACCEPTED')">
              <i nz-icon nzType="check-circle"></i>已接受
            </button>
            <button nz-button nzDanger style="margin-right: 8px;" (click)="changeStatus('REJECTED')">
              <i nz-icon nzType="close-circle"></i>已拒绝
            </button>
            <button nz-button (click)="changeStatus('EXPIRED')">
              <i nz-icon nzType="clock-circle"></i>标记过期
            </button>
          </ng-container>
          <button *ngIf="offer.status === 'EXPIRED'" nz-button nzType="primary" (click)="changeStatus('PENDING')">
            <i nz-icon nzType="redo"></i>重新激活
          </button>
          <button *ngIf="offer.status === 'ACCEPTED'" nz-button nzType="primary" style="background: #0F3D3E; border-color: #0F3D3E;" (click)="changeStatus('ONBOARDED')">
            <i nz-icon nzType="check-circle"></i>标记入职
          </button>
        </div>
      </div>

      <nz-row [nzGutter]="16" style="margin-top: 16px;">
        <nz-col [nzSpan]="16">
          <nz-card class="section-card" [nzBordered]="false" nzTitle="Offer 基本信息">
            <nz-descriptions [nzColumn]="2" nzBordered>
              <nz-descriptions-item nzTitle="候选人姓名">{{ offer.candidateName }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="联系电话">
                <a href="tel:{{ offer.candidatePhone }}" style="color: #0F3D3E;">{{ offer.candidatePhone }}</a>
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="电子邮箱">
                <a href="mailto:{{ offer.candidateEmail }}" style="color: #0F3D3E;">{{ offer.candidateEmail }}</a>
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="岗位名称">{{ offer.position }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="所属部门">{{ offer.department }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="薪资待遇">
                <span style="font-weight: 600; color: #E0A458;">{{ offer.salaryPackage }}</span>
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="拟定入职日期">{{ offer.entryDate }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Offer 责任人">{{ offer.owner }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="创建时间">{{ formatDateTime(offer.createdAt) }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="更新时间">{{ formatDateTime(offer.updatedAt) }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="备注" [nzSpan]="2" *ngIf="offer.remark">
                <div style="background: #F7F5F1; padding: 8px 12px; border-radius: 4px; color: rgba(0,0,0,0.75);">
                  {{ offer.remark }}
                </div>
              </nz-descriptions-item>
            </nz-descriptions>
          </nz-card>

          <nz-card class="section-card" [nzBordered]="false" style="margin-top: 16px;">
            <nz-page-header class="record-header" nzTitle="催办时间线" [nzSubtitle]="'共 ' + filteredRecords.length + ' 条记录'">
              <nz-radio-group [(ngModel)]="filterChannel" (ngModelChange)="onFilterChange()" nzSize="small">
                <label nz-radio-button nzValue="">全部</label>
                <label *ngFor="let opt of channelOptions" nz-radio-button [nzValue]="opt.value">
                  <i nz-icon [nzType]="opt.icon" style="margin-right: 2px;"></i>{{ opt.label }}
                </label>
              </nz-radio-group>
            </nz-page-header>

            <nz-timeline *ngIf="filteredRecords.length > 0">
              <nz-timeline-item
                *ngFor="let record of filteredRecords"
                [nzColor]="getChannelInfo(record.channel).color"
              >
                <ng-template #nzTimelineDot>
                  <i nz-icon [nzType]="getChannelInfo(record.channel).icon" style="font-size: 14px;"></i>
                </ng-template>
                <div class="timeline-item">
                  <div class="timeline-header">
                    <span class="channel-tag" [ngStyle]="{ color: getChannelInfo(record.channel).color, borderColor: getChannelInfo(record.channel).color }">
                      <i nz-icon [nzType]="getChannelInfo(record.channel).icon"></i>
                      {{ getChannelInfo(record.channel).label }}
                    </span>
                    <span class="template-tag" *ngIf="record.templateName">
                      <i nz-icon nzType="file-text"></i>{{ record.templateName }}
                    </span>
                    <span class="operator">
                      <i nz-icon nzType="user"></i>{{ record.operator }}
                    </span>
                    <span class="time">{{ formatDateTime(record.operatedAt) }}</span>
                  </div>
                  <div class="timeline-content">
                    <div class="content-title">催办内容</div>
                    <pre class="content-text">{{ record.content }}</pre>
                  </div>
                  <div class="timeline-result">
                    <div class="result-title">
                      <i nz-icon nzType="bulb" style="color: #E0A458;"></i>催办结果
                    </div>
                    <div class="result-text">{{ record.result }}</div>
                  </div>
                  <div class="timeline-next" *ngIf="record.nextFollowUpAt">
                    <i nz-icon nzType="calendar" style="color: #0F3D3E;"></i>
                    下次跟进时间：<strong>{{ formatDateTime(record.nextFollowUpAt) }}</strong>
                  </div>
                </div>
              </nz-timeline-item>
            </nz-timeline>

            <div *ngIf="filteredRecords.length === 0" class="empty-state">
              <nz-empty [nzNotFoundDescription]="'暂无催办记录'"></nz-empty>
            </div>
          </nz-card>
        </nz-col>

        <nz-col [nzSpan]="8">
          <nz-card class="section-card" [nzBordered]="false">
            <div class="sla-header">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                <i nz-icon nzType="clock-circle" style="color: #E0A458;"></i>
                SLA 进度
              </h3>
            </div>
            <div class="sla-content">
              <div class="sla-info-row">
                <span style="color: rgba(0,0,0,0.55);">截止时间</span>
                <span style="font-weight: 500; font-family: monospace;">{{ formatDateTime(offer.expireAt) }}</span>
              </div>
              <div class="sla-info-row">
                <span style="color: rgba(0,0,0,0.55);">剩余时间</span>
                <span [ngStyle]="{ color: getSlaColor() }">
                  {{ formatRemainingTime() }}
                </span>
              </div>
              <nz-progress
                style="margin-top: 8px;"
                [nzPercent]="getSlaPercent()"
                [nzStatus]="getSlaStatus()"
                [nzStrokeColor]="getSlaColor()"
                nzShowInfo="false"
              ></nz-progress>
              <div class="sla-status-tag" [ngStyle]="{ background: getStatusInfo(offer.status).bgColor, color: getStatusInfo(offer.status).color }">
                当前状态：{{ getStatusInfo(offer.status).label }}
              </div>
            </div>
          </nz-card>

          <nz-card class="section-card" [nzBordered]="false" style="margin-top: 16px;" nzTitle="催办建议">
            <nz-alert
              *ngIf="offer.status === 'PENDING'"
              nzType="warning"
              nzShowIcon
              [nzMessage]="getSlaAdvice()"
              style="background: #FFF7E6; border: none;"
            />
            <nz-alert
              *ngIf="offer.status === 'ACCEPTED'"
              nzType="success"
              nzShowIcon
              nzMessage="恭喜！候选人已接受 Offer"
              nzDescription="请及时跟进入职准备工作，建议在入职前 3 天再次确认入职时间。"
            />
            <nz-alert
              *ngIf="offer.status === 'REJECTED'"
              nzType="info"
              nzShowIcon
              nzMessage="候选人已拒绝 Offer"
              nzDescription="建议 3 个月后可再次联系候选人，了解其职业变动情况。"
            />
            <nz-alert
              *ngIf="offer.status === 'ONBOARDED'"
              nzType="success"
              nzShowIcon
              nzMessage="候选人已入职"
              nzDescription="请持续关注新员工入职后的融入情况。"
            />
            <nz-alert
              *ngIf="offer.status === 'EXPIRED'"
              nzType="info"
              nzShowIcon
              nzMessage="Offer 已过期"
              nzDescription="可尝试重新激活，或转入人才库供后续岗位匹配。"
            />
          </nz-card>

          <nz-card class="section-card" [nzBordered]="false" style="margin-top: 16px;" nzTitle="状态流转记录">
            <nz-steps nzDirection="vertical" [nzCurrent]="statusStepIndex" nzSize="small">
              <nz-step nzTitle="待回复" [nzStatus]="offer.status === 'PENDING' ? 'process' : 'finish'"></nz-step>
              <nz-step nzTitle="已接受" [nzStatus]="['ACCEPTED', 'ONBOARDED'].includes(offer.status) ? 'finish' : (offer.status === 'REJECTED' || offer.status === 'EXPIRED' ? 'error' : 'wait')"></nz-step>
              <nz-step nzTitle="已入职" [nzStatus]="offer.status === 'ONBOARDED' ? 'finish' : 'wait'"></nz-step>
            </nz-steps>
          </nz-card>
        </nz-col>
      </nz-row>

      <app-follow-up-modal #followUpModal (onSuccess)="reload()"></app-follow-up-modal>
    </div>
  `,
  styles: [`
    .detail-page { padding: 24px; background: #F7F5F1; min-height: 100vh; }
    .detail-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-radius: 8px; margin-bottom: 0;
    }
    .header-left { display: flex; flex-direction: column; gap: 12px; }
    .back-btn { color: rgba(0,0,0,0.55); cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
    .back-btn:hover { color: #0F3D3E; }
    .candidate-info { display: flex; gap: 16px; align-items: center; }
    .header-right { display: flex; align-items: center; }
    .section-card { border-radius: 8px; }
    .record-header { padding: 0; margin-bottom: 16px; }
    .timeline-item { padding-left: 8px; }
    .timeline-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;
    }
    .channel-tag {
      display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
      border: 1px solid; border-radius: 4px; font-size: 12px; font-weight: 500;
      background: #fff;
    }
    .template-tag { color: rgba(0,0,0,0.55); font-size: 12px; display: inline-flex; align-items: center; gap: 4px; }
    .operator { color: rgba(0,0,0,0.55); font-size: 12px; display: inline-flex; align-items: center; gap: 4px; }
    .time { color: rgba(0,0,0,0.45); font-size: 12px; font-family: monospace; margin-left: auto; }
    .timeline-content { background: #F7F5F1; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
    .content-title { font-size: 12px; color: rgba(0,0,0,0.45); margin-bottom: 4px; }
    .content-text { margin: 0; white-space: pre-wrap; font-size: 13px; color: rgba(0,0,0,0.85); font-family: inherit; }
    .timeline-result { background: #E6F4EF; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
    .result-title { font-size: 12px; margin-bottom: 2px; display: inline-flex; align-items: center; gap: 4px; }
    .result-text { font-size: 13px; color: rgba(0,0,0,0.85); }
    .timeline-next { font-size: 12px; color: rgba(0,0,0,0.65); padding: 4px 0; display: inline-flex; align-items: center; gap: 4px; }
    .sla-header { margin-bottom: 12px; }
    .sla-content { padding: 4px 0; }
    .sla-info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .sla-status-tag {
      text-align: center; padding: 6px 12px; border-radius: 4px;
      font-size: 12px; font-weight: 500; margin-top: 12px;
    }
    .empty-state { padding: 32px 0; }
  `]
})
export class FollowUpDetailComponent implements OnInit {
  offer: OfferFollowUp | null = null;
  filterChannel: FollowUpChannel | '' = '';
  channelOptions = [
    { label: '电话', value: 'PHONE' as FollowUpChannel, icon: 'phone' },
    { label: '邮件', value: 'EMAIL' as FollowUpChannel, icon: 'mail' },
    { label: '短信', value: 'SMS' as FollowUpChannel, icon: 'message' },
    { label: '企业微信', value: 'WECHAT' as FollowUpChannel, icon: 'wechat' }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private followUpService: OfferFollowUpService,
    private message: NzMessageService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadData(params['id']);
      }
    });
  }

  get filteredRecords(): FollowUpRecord[] {
    if (!this.offer) return [];
    if (!this.filterChannel) return this.offer.followUpRecords || [];
    return (this.offer.followUpRecords || []).filter(r => r.channel === this.filterChannel);
  }

  get statusStepIndex(): number {
    if (!this.offer) return 0;
    switch (this.offer.status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'ONBOARDED': return 2;
      default: return 0;
    }
  }

  loadData(id: string): void {
    this.followUpService.getById(id).subscribe({
      next: (data) => {
        if (data) {
          this.offer = data;
        } else {
          this.message.error('Offer 不存在');
          this.goBack();
        }
      },
      error: () => this.message.error('加载失败')
    });
  }

  reload(): void {
    if (this.offer) this.loadData(this.offer.id);
  }

  onFilterChange(): void {}

  goBack(): void {
    this.router.navigate(['/offer-follow-ups']);
  }

  openFollowUp(): void {
    const modal = document.querySelector('app-follow-up-modal') as any;
    if (modal && modal.openForSingle && this.offer) {
      modal.openForSingle(this.offer);
    }
  }

  changeStatus(target: OfferFollowUpStatus): void {
    if (!this.offer) return;
    const actionText: Record<OfferFollowUpStatus, string> = {
      PENDING: '重新激活', ACCEPTED: '标记已接受', REJECTED: '标记已拒绝',
      EXPIRED: '标记已过期', ONBOARDED: '标记已入职'
    };
    this.modalService.confirm({
      nzTitle: `${actionText[target]} 确认`,
      nzContent: `确定要将「${this.offer.candidateName}」的 Offer ${actionText[target]} 吗？`,
      nzOkText: '确认',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.followUpService.transitionStatus(this.offer!.id, target).subscribe({
          next: (res) => {
            if (res) {
              this.message.success('状态更新成功');
              this.reload();
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
  getChannelInfo = getChannelInfo;

  getSlaPercent(): number {
    if (!this.offer) return 0;
    const total = new Date(this.offer.expireAt).getTime() - new Date(this.offer.createdAt).getTime();
    const elapsed = Date.now() - new Date(this.offer.createdAt).getTime();
    const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    return pct;
  }

  getSlaColor(): string {
    if (!this.offer) return '#8A8F98';
    if (this.offer.status !== 'PENDING') return '#2E7D6B';
    const h = getHoursUntil(this.offer.expireAt);
    if (h <= 0) return '#B5462F';
    if (h <= 24) return '#E0A458';
    return '#2E7D6B';
  }

  getSlaStatus(): 'normal' | 'active' | 'exception' | 'success' {
    if (!this.offer) return 'normal';
    if (this.offer.status !== 'PENDING') return 'success';
    const h = getHoursUntil(this.offer.expireAt);
    if (h <= 0) return 'exception';
    if (h <= 24) return 'active';
    return 'normal';
  }

  formatRemainingTime(): string {
    if (!this.offer) return '—';
    if (this.offer.status !== 'PENDING') return '已结束';
    const h = getHoursUntil(this.offer.expireAt);
    if (h <= 0) return `已超时 ${Math.abs(Math.floor(h))} 小时`;
    if (h < 24) return `${Math.floor(h)} 小时`;
    return `${Math.floor(h / 24)} 天 ${Math.floor(h % 24)} 小时`;
  }

  getSlaAdvice(): string {
    if (!this.offer) return '';
    const h = getHoursUntil(this.offer.expireAt);
    if (h <= 0) return 'Offer 已超时！建议立即电话沟通，了解候选人真实想法';
    if (h <= 24) return '距离截止不足 24 小时，建议电话 + 邮件双通道重点催办';
    if (h <= 48) return '距离截止不到 2 天，建议发送友好提醒并关注回复';
    return '时间充裕，可按常规节奏跟进';
  }
}
