import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from '../../services/candidate.service';
import {
  CandidateDetail,
  CandidateCommunication,
  CandidateStatistics,
  CommunicationQueryParams,
  PaginatedResult,
  COMMUNICATION_TYPE_OPTIONS,
  DIRECTION_OPTIONS,
  OPERATOR_ROLE_OPTIONS
} from '../../models/candidate.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

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

const OFFER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '审批中', color: 'gold' },
  approved: { label: '已通过', color: 'green' },
  sent: { label: '已发出', color: 'blue' },
  accepted: { label: '已接受', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  declined: { label: '候选人拒绝', color: 'orange' }
};

const RECOMMENDATION_MAP: Record<string, string> = {
  strong_hire: '强烈推荐',
  hire: '推荐',
  borderline: '待定',
  no_hire: '不推荐',
  pending: '待评估'
};

@Component({
  selector: 'app-candidate-detail',
  template: `
    <div class="page-container" *ngIf="candidate">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item><a (click)="router.navigate(['/candidates'])">候选人管理</a></nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ candidate.name }} - 详情</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <nz-avatar [nzText]="candidate.name.charAt(0)" nzSize="large" style="margin-right: 12px; vertical-align: middle; background: #1890ff;"></nz-avatar>
          <span style="vertical-align: middle;">{{ candidate.name }}</span>
          <nz-tag style="margin-left: 12px; vertical-align: middle;">{{ candidate.position }}</nz-tag>
          <nz-tag nzColor="blue" style="vertical-align: middle;">{{ candidate.department }}</nz-tag>
        </h1>
        <button nz-button (click)="router.navigate(['/candidates'])">
          <i nz-icon nzType="arrow-left"></i>
          返回列表
        </button>
      </div>

      <nz-row [nzGutter]="16" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics?.interviewCount || 0 }}</div>
            <div class="stat-label">面试轮次</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff;">{{ statistics?.communicationCount || 0 }}</div>
            <div class="stat-label">沟通记录</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value" style="color: #52c41a;">{{ statistics?.evaluationCount || 0 }}</div>
            <div class="stat-label">评价数量</div>
          </div>
        </nz-col>
        <nz-col [nzSpan]="6">
          <div class="stat-card">
            <div class="stat-value" style="color: #fa8c16;">{{ statistics?.avgScore ? statistics.avgScore.toFixed(1) : '-' }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </nz-col>
      </nz-row>

      <nz-card style="margin-bottom: 16px;">
        <nz-tabset [nzSelectedIndex]="activeTab" (nzSelectedIndexChange)="onTabChange($event)">
          <nz-tab nzTitle="基本信息">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 24px;">
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">姓名</div>
                <div style="font-size: 15px; font-weight: 500;">{{ candidate.name }}</div>
              </div>
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">邮箱</div>
                <div style="font-size: 15px;">{{ candidate.email }}</div>
              </div>
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">电话</div>
                <div style="font-size: 15px;">{{ candidate.phone }}</div>
              </div>
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">应聘部门</div>
                <div style="font-size: 15px;">{{ candidate.department }}</div>
              </div>
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">应聘岗位</div>
                <div style="font-size: 15px;">{{ candidate.position }}</div>
              </div>
              <div>
                <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">创建时间</div>
                <div style="font-size: 15px;">{{ formatDateTime(candidate.createdAt) }}</div>
              </div>
            </div>
          </nz-tab>

          <nz-tab nzTitle="面试记录">
            <nz-table
              #interviewTable
              [nzData]="candidate.interviews"
              [nzFrontPagination]="false"
              nzShowPagination="false"
              nzSize="middle"
            >
              <thead>
                <tr>
                  <th>轮次</th>
                  <th>面试类型</th>
                  <th>面试时间</th>
                  <th>面试官</th>
                  <th>面试状态</th>
                  <th>评价状态</th>
                  <th>评分</th>
                  <th>面试结论</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let interview of interviewTable.data">
                  <td>第{{ interview.round }}轮</td>
                  <td><nz-tag>{{ getInterviewTypeLabel(interview.interviewType) }}</nz-tag></td>
                  <td>{{ formatDateTime(interview.interviewTime) }}</td>
                  <td>
                    <div style="font-weight: 500;">{{ interview.interviewerName }}</div>
                    <div style="font-size: 12px; color: rgba(0,0,0,0.45);">{{ interview.interviewerRole }}</div>
                  </td>
                  <td>
                    <nz-tag [nzColor]="getInterviewStatusColor(interview.status)">{{ getInterviewStatusLabel(interview.status) }}</nz-tag>
                  </td>
                  <td>
                    <nz-tag [nzColor]="getEvaluationStatusColor(interview.evaluationStatus)">{{ getEvaluationStatusLabel(interview.evaluationStatus) }}</nz-tag>
                  </td>
                  <td>
                    <ng-container *ngIf="interview.evaluations?.length; else noScore">
                      <span style="font-weight: 600; color: #1890ff;">{{ interview.evaluations[0].overallScore?.toFixed(1) || '-' }}</span>
                    </ng-container>
                    <ng-template #noScore><span style="color: rgba(0,0,0,0.25);">-</span></ng-template>
                  </td>
                  <td>
                    <ng-container *ngIf="interview.evaluations?.length; else noEval">
                      <span [ngClass]="getRecommendationClass(interview.evaluations[0].recommendation || '')">
                        {{ getRecommendationLabel(interview.evaluations[0].recommendation || '') }}
                      </span>
                    </ng-container>
                    <ng-template #noEval><span style="color: rgba(0,0,0,0.25);">-</span></ng-template>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </nz-tab>

          <nz-tab nzTitle="Offer 记录" *ngIf="candidate.offers?.length > 0">
            <nz-table
              #offerTable
              [nzData]="candidate.offers"
              [nzFrontPagination]="false"
              nzShowPagination="false"
              nzSize="middle"
            >
              <thead>
                <tr>
                  <th>状态</th>
                  <th>月薪</th>
                  <th>入职日期</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let offer of offerTable.data">
                  <td><nz-tag [nzColor]="getOfferStatusColor(offer.status)">{{ getOfferStatusLabel(offer.status) }}</nz-tag></td>
                  <td style="font-weight: 500;">¥{{ offer.salaryMonthly?.toLocaleString() }}</td>
                  <td>{{ formatDate(offer.entryDate) }}</td>
                  <td>{{ formatDateTime(offer.createdAt) }}</td>
                </tr>
              </tbody>
            </nz-table>
          </nz-tab>

          <nz-tab [nzTitle]="communicationTabTitle">
            <div style="margin-bottom: 16px;">
              <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="margin: 0; font-size: 13px; color: rgba(0,0,0,0.65);">沟通方式:</label>
                  <nz-select [(ngModel)]="commQueryParams.type" style="width: 130px;" nzPlaceHolder="全部" nzAllowClear (ngModelChange)="loadCommunications()">
                    <nz-option *ngFor="let opt of COMMUNICATION_TYPE_OPTIONS" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
                  </nz-select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="margin: 0; font-size: 13px; color: rgba(0,0,0,0.65);">记录人角色:</label>
                  <nz-select [(ngModel)]="commQueryParams.operatorRole" style="width: 130px;" nzPlaceHolder="全部" nzAllowClear (ngModelChange)="loadCommunications()">
                    <nz-option *ngFor="let opt of OPERATOR_ROLE_OPTIONS" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
                  </nz-select>
                </div>
                <button nz-button nzType="primary" style="margin-left: auto;" (click)="openAddCommunicationModal()">
                  <i nz-icon nzType="plus"></i>
                  添加沟通记录
                </button>
              </div>
            </div>

            <nz-timeline *ngIf="communications.length > 0; else noCommTpl" [nzMode]="'left'">
              <nz-timeline-item
                *ngFor="let comm of communications"
                [nzColor]="getCommTypeColor(comm.type)"
                [nzDot]="getCommIcon(comm.type)"
              >
                <div style="padding: 12px; background: #fafafa; border-radius: 6px; margin-bottom: 12px; position: relative;" [class.important-comm]="comm.isImportant">
                  <div *ngIf="comm.isImportant" style="position: absolute; top: 8px; right: 12px;">
                    <i nz-icon nzType="star" nzTheme="fill" style="color: #faad14;"></i>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                    <nz-tag [nzColor]="getCommTypeColor(comm.type)" nzSize="small">
                      <i nz-icon [nzType]="getCommIconName(comm.type)" style="margin-right: 4px;"></i>
                      {{ getCommTypeLabel(comm.type) }}
                    </nz-tag>
                    <nz-tag nzSize="small" [nzColor]="getDirectionColor(comm.direction)">{{ getDirectionLabel(comm.direction) }}</nz-tag>
                    <span style="font-size: 13px; color: rgba(0,0,0,0.88); font-weight: 500;">{{ comm.title }}</span>
                    <span style="font-size: 12px; color: rgba(0,0,0,0.45); margin-left: auto;">{{ formatDateTime(comm.createdAt) }}</span>
                  </div>
                  <div style="font-size: 13px; color: rgba(0,0,0,0.65); line-height: 1.7; margin-bottom: 8px;">{{ comm.content }}</div>
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 12px;">
                    <div *ngIf="comm.result" style="color: rgba(0,0,0,0.65);">
                      <span style="color: rgba(0,0,0,0.45);">沟通结果：</span>{{ comm.result }}
                    </div>
                    <div *ngIf="comm.nextStep" style="color: rgba(0,0,0,0.65);">
                      <span style="color: rgba(0,0,0,0.45);">下一步：</span>{{ comm.nextStep }}
                    </div>
                    <div style="color: rgba(0,0,0,0.65);">
                      <span style="color: rgba(0,0,0,0.45);">记录人：</span>
                      <nz-tag [nzColor]="getOperatorRoleColor(comm.operatorRole)" nzSize="small" style="margin: 0 4px;">
                        {{ getOperatorRoleLabel(comm.operatorRole) }}
                      </nz-tag>
                      <span style="font-weight: 500;">{{ comm.operator }}</span>
                    </div>
                    <div *ngIf="comm.contactPerson" style="color: rgba(0,0,0,0.65);">
                      <span style="color: rgba(0,0,0,0.45);">对接对象：</span>{{ comm.contactPerson }}
                      <span *ngIf="comm.contactInfo" style="margin-left: 8px;">({{ comm.contactInfo }})</span>
                    </div>
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #f0f0f0; display: flex; gap: 8px;">
                    <button nz-button nzSize="small" nzType="link" (click)="openEditCommunicationModal(comm)">
                      <i nz-icon nzType="edit"></i>编辑
                    </button>
                    <button nz-button nzSize="small" nzType="link" nzDanger (click)="deleteCommunication(comm)">
                      <i nz-icon nzType="delete"></i>删除
                    </button>
                  </div>
                </div>
              </nz-timeline-item>
            </nz-timeline>

            <ng-template #noCommTpl>
              <div class="empty-state">
                <i nz-icon nzType="message" style="font-size: 48px; color: rgba(0,0,0,0.15); margin-bottom: 12px; display: block;"></i>
                <div style="font-size: 14px; color: rgba(0,0,0,0.25); margin-bottom: 12px;">暂无沟通记录</div>
                <button nz-button nzType="primary" (click)="openAddCommunicationModal()">
                  <i nz-icon nzType="plus"></i>
                  添加第一条沟通记录
                </button>
              </div>
            </ng-template>

            <div *ngIf="commTotal > commPageSize" style="text-align: center; margin-top: 16px;">
              <button nz-button (click)="loadMoreCommunications()" [disabled]="commLoading">
                {{ commLoading ? '加载中...' : '加载更多' }}
              </button>
            </div>
          </nz-tab>
        </nz-tabset>
      </nz-card>

      <ng-template #communicationTabTitle>
        <span>
          <i nz-icon nzType="message" style="margin-right: 4px;"></i>
          沟通记录
          <nz-badge [nzCount]="candidate.communications?.length || 0" nzSize="small" style="margin-left: 4px;"></nz-badge>
        </span>
      </ng-template>
    </div>

    <div *ngIf="!candidate && !loading" class="empty-state">
      候选人不存在
    </div>

    <div *ngIf="loading" class="empty-state">
      <nz-spin nzTip="加载中..."></nz-spin>
    </div>
  `,
  styles: [`
    .important-comm { background: #fffbe6 !important; border: 1px solid #ffe58f !important; }
    .recommend-strong { color: #52c41a; font-weight: 500; }
    .recommend-hire { color: #1890ff; font-weight: 500; }
    .recommend-borderline { color: #faad14; font-weight: 500; }
    .recommend-nohire { color: #ff4d4f; font-weight: 500; }
    .recommend-pending { color: rgba(0,0,0,0.45); }
  `]
})
export class CandidateDetailComponent implements OnInit {
  readonly COMMUNICATION_TYPE_OPTIONS = COMMUNICATION_TYPE_OPTIONS;
  readonly DIRECTION_OPTIONS = DIRECTION_OPTIONS;
  readonly OPERATOR_ROLE_OPTIONS = OPERATOR_ROLE_OPTIONS;

  loading = false;
  candidate: CandidateDetail | null = null;
  statistics: CandidateStatistics | null = null;
  activeTab = 0;

  communications: CandidateCommunication[] = [];
  commPageIndex = 1;
  commPageSize = 10;
  commTotal = 0;
  commLoading = false;

  commQueryParams: CommunicationQueryParams = {
    type: undefined,
    operatorRole: undefined
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private candidateService: CandidateService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    const candidateId = this.route.snapshot.params['id'];
    if (candidateId) {
      this.loadCandidateDetail(candidateId);
      this.loadStatistics(candidateId);
    }
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 3 && this.candidate) {
      this.loadCommunications(true);
    }
  }

  loadCandidateDetail(id: string): void {
    this.loading = true;
    this.candidateService.getCandidateDetail(id).subscribe({
      next: (data) => {
        this.candidate = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('加载候选人详情失败');
      }
    });
  }

  loadStatistics(id: string): void {
    this.candidateService.getCandidateStatistics(id).subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: () => {
        console.warn('加载统计数据失败');
      }
    });
  }

  loadCommunications(reset: boolean = false): void {
    if (!this.candidate) return;

    if (reset) {
      this.commPageIndex = 1;
      this.communications = [];
    }

    this.commLoading = true;
    const params: CommunicationQueryParams = {
      ...this.commQueryParams,
      page: this.commPageIndex,
      pageSize: this.commPageSize
    };

    this.candidateService.getCommunications(this.candidate.id, params).subscribe({
      next: (res) => {
        this.communications = reset ? res.list : [...this.communications, ...res.list];
        this.commTotal = res.total;
        this.commLoading = false;
      },
      error: () => {
        this.commLoading = false;
        this.message.error('加载沟通记录失败');
      }
    });
  }

  loadMoreCommunications(): void {
    this.commPageIndex++;
    this.loadCommunications();
  }

  openAddCommunicationModal(): void {
    const typeOptions = COMMUNICATION_TYPE_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    const directionOptions = DIRECTION_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    const roleOptions = OPERATOR_ROLE_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');

    const modal = this.modal.create({
      nzTitle: '添加沟通记录',
      nzWidth: 580,
      nzContent: `
        <div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通方式 *</label>
              <select id="comm-type-add" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                ${typeOptions}
              </select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通方向</label>
              <select id="comm-direction-add" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                ${directionOptions}
              </select>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">标题 *</label>
            <input id="comm-title-add" type="text" placeholder="请输入沟通标题" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通内容 *</label>
            <textarea id="comm-content-add" rows="4" placeholder="请详细记录沟通内容..." style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; font-family: inherit;"></textarea>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通结果</label>
              <input id="comm-result-add" type="text" placeholder="如：候选人确认参加" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">下一步行动</label>
              <input id="comm-nextstep-add" type="text" placeholder="如：安排技术面试" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">记录人 *</label>
              <input id="comm-operator-add" type="text" placeholder="您的姓名" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">角色</label>
              <select id="comm-role-add" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;">
                ${roleOptions}
              </select>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="margin: 0; cursor: pointer;">
              <input type="checkbox" id="comm-important-add" style="margin-right: 6px;" />
              <span style="font-size: 13px; color: rgba(0,0,0,0.65);">标记为重要记录</span>
            </label>
          </div>
        </div>
      `,
      nzOkText: '保存',
      nzOkType: 'primary',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          const typeEl = document.getElementById('comm-type-add') as HTMLSelectElement;
          const directionEl = document.getElementById('comm-direction-add') as HTMLSelectElement;
          const titleEl = document.getElementById('comm-title-add') as HTMLInputElement;
          const contentEl = document.getElementById('comm-content-add') as HTMLTextAreaElement;
          const resultEl = document.getElementById('comm-result-add') as HTMLInputElement;
          const nextStepEl = document.getElementById('comm-nextstep-add') as HTMLInputElement;
          const operatorEl = document.getElementById('comm-operator-add') as HTMLInputElement;
          const roleEl = document.getElementById('comm-role-add') as HTMLSelectElement;
          const importantEl = document.getElementById('comm-important-add') as HTMLInputElement;

          const title = titleEl?.value?.trim();
          const content = contentEl?.value?.trim();
          const operator = operatorEl?.value?.trim();

          if (!title || !content || !operator) {
            this.message.warning('请填写标题、内容和记录人');
            reject();
            return;
          }

          if (!this.candidate) {
            reject();
            return;
          }

          this.candidateService.addCommunication(this.candidate.id, {
            type: typeEl?.value as any,
            direction: directionEl?.value as any,
            title,
            content,
            contactPerson: this.candidate.name,
            contactInfo: this.candidate.phone,
            result: resultEl?.value?.trim() || undefined,
            nextStep: nextStepEl?.value?.trim() || undefined,
            operator,
            operatorRole: roleEl?.value as any,
            isImportant: importantEl?.checked || false
          }).subscribe({
            next: () => {
              this.message.success('沟通记录已添加');
              this.loadCommunications(true);
              this.loadStatistics(this.candidate!.id);
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

  openEditCommunicationModal(comm: CandidateCommunication): void {
    const modal = this.modal.create({
      nzTitle: '编辑沟通记录',
      nzWidth: 580,
      nzContent: `
        <div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">标题 *</label>
            <input id="comm-title-edit" type="text" value="${comm.title}" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通内容 *</label>
            <textarea id="comm-content-edit" rows="4" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; font-family: inherit;">${comm.content}</textarea>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">沟通结果</label>
              <input id="comm-result-edit" type="text" value="${comm.result || ''}" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 13px; color: rgba(0,0,0,0.65); display: block; margin-bottom: 4px;">下一步行动</label>
              <input id="comm-nextstep-edit" type="text" value="${comm.nextStep || ''}" style="width: 100%; padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 6px;" />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="margin: 0; cursor: pointer;">
              <input type="checkbox" id="comm-important-edit" ${comm.isImportant ? 'checked' : ''} style="margin-right: 6px;" />
              <span style="font-size: 13px; color: rgba(0,0,0,0.65);">标记为重要记录</span>
            </label>
          </div>
        </div>
      `,
      nzOkText: '保存',
      nzOkType: 'primary',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          const titleEl = document.getElementById('comm-title-edit') as HTMLInputElement;
          const contentEl = document.getElementById('comm-content-edit') as HTMLTextAreaElement;
          const resultEl = document.getElementById('comm-result-edit') as HTMLInputElement;
          const nextStepEl = document.getElementById('comm-nextstep-edit') as HTMLInputElement;
          const importantEl = document.getElementById('comm-important-edit') as HTMLInputElement;

          const title = titleEl?.value?.trim();
          const content = contentEl?.value?.trim();

          if (!title || !content) {
            this.message.warning('请填写标题和内容');
            reject();
            return;
          }

          this.candidateService.updateCommunication(comm.id, {
            title,
            content,
            result: resultEl?.value?.trim() || undefined,
            nextStep: nextStepEl?.value?.trim() || undefined,
            isImportant: importantEl?.checked || false
          }).subscribe({
            next: () => {
              this.message.success('沟通记录已更新');
              this.loadCommunications(true);
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '更新失败');
              reject();
            }
          });
        });
      }
    });
  }

  deleteCommunication(comm: CandidateCommunication): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: '确定要删除这条沟通记录吗？此操作不可恢复。',
      nzOkText: '确认删除',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.candidateService.deleteCommunication(comm.id).subscribe({
            next: () => {
              this.message.success('沟通记录已删除');
              this.loadCommunications(true);
              if (this.candidate) {
                this.loadStatistics(this.candidate.id);
              }
              resolve();
            },
            error: (err) => {
              this.message.error(err?.error?.message || '删除失败');
              reject();
            }
          });
        });
      }
    });
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  getOfferStatusLabel(status: string): string {
    return OFFER_STATUS_MAP[status]?.label || status;
  }

  getOfferStatusColor(status: string): string {
    return OFFER_STATUS_MAP[status]?.color || 'default';
  }

  getRecommendationLabel(recommendation: string): string {
    return RECOMMENDATION_MAP[recommendation] || recommendation;
  }

  getRecommendationClass(recommendation: string): string {
    switch (recommendation) {
      case 'strong_hire': return 'recommend-strong';
      case 'hire': return 'recommend-hire';
      case 'borderline': return 'recommend-borderline';
      case 'no_hire': return 'recommend-nohire';
      default: return 'recommend-pending';
    }
  }

  getCommTypeLabel(type: string): string {
    return COMMUNICATION_TYPE_OPTIONS.find(o => o.value === type)?.label || type;
  }

  getCommTypeColor(type: string): string {
    return COMMUNICATION_TYPE_OPTIONS.find(o => o.value === type)?.color || 'default';
  }

  getCommIconName(type: string): string {
    return COMMUNICATION_TYPE_OPTIONS.find(o => o.value === type)?.icon || 'file-text';
  }

  getCommIcon(type: string) {
    const icon = this.getCommIconName(type);
    return `<i nz-icon nzType="${icon}" style="font-size: 16px;"></i>`;
  }

  getDirectionLabel(direction: string): string {
    return DIRECTION_OPTIONS.find(o => o.value === direction)?.label || direction;
  }

  getDirectionColor(direction: string): string {
    return DIRECTION_OPTIONS.find(o => o.value === direction)?.color || 'default';
  }

  getOperatorRoleLabel(role: string): string {
    return OPERATOR_ROLE_OPTIONS.find(o => o.value === role)?.label || role;
  }

  getOperatorRoleColor(role: string): string {
    return OPERATOR_ROLE_OPTIONS.find(o => o.value === role)?.color || 'default';
  }
}
