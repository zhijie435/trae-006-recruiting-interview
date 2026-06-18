import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';
import {
  Evaluation,
  EvaluationDetailResponse,
  ScoreDimension,
  Interview,
  RecommendationType
} from '../../models/reminder.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-evaluation-form',
  template: `
    <div class="page-container" style="max-width: 1100px; margin: 0 auto;">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>
          <span style="cursor: pointer; color: #1890ff;" (click)="router.navigate(['/evaluations'])">我的评价</span>
        </nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ isNew ? '填写评价' : (isSubmitted ? '查看评价' : '编辑评价') }}</nz-breadcrumb-item>
      </nz-breadcrumb>

      <ng-container *ngIf="!loading; else loadingTpl">
        <div *ngIf="interview" style="background: #fff; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">面试评价表</h2>
                <nz-tag *ngIf="evaluationStatus === 'submitted'" nzColor="green">已提交</nz-tag>
                <nz-tag *ngIf="evaluationStatus === 'draft'" nzColor="blue">草稿</nz-tag>
                <nz-tag *ngIf="evaluationStatus === 'overdue'" nzColor="red">已逾期</nz-tag>
              </div>
              <div style="color: rgba(0,0,0,0.45); font-size: 13px;">
                最后更新时间：{{ lastUpdatedText }}
              </div>
            </div>
            <div>
              <button nz-button style="margin-right: 8px;" (click)="back()">返回列表</button>
              <button nz-button nzType="default" (click)="saveDraft()" [disabled]="saving || isSubmitted" style="margin-right: 8px;">
                <i nz-icon nzType="save"></i>
                {{ saving ? '保存中...' : '保存草稿' }}
              </button>
              <button nz-button nzType="primary" (click)="submitEvaluation()" [disabled]="submitting || isSubmitted">
                <i nz-icon nzType="check-circle"></i>
                {{ isSubmitted ? '已提交' : (submitting ? '提交中...' : '提交评价') }}
              </button>
            </div>
          </div>

          <nz-divider style="margin: 12px 0 24px;"></nz-divider>

          <nz-row [nzGutter]="24">
            <nz-col [nzSpan]="12">
              <div style="margin-bottom: 20px;">
                <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 6px;">候选人信息</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <nz-avatar [nzText]="interview.candidate.name.charAt(0)" nzSize="large" style="background: #1890ff;"></nz-avatar>
                  <div>
                    <div style="font-size: 18px; font-weight: 600;">{{ interview.candidate.name }}</div>
                    <div style="color: rgba(0,0,0,0.65);">{{ interview.candidate.position }}</div>
                  </div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 4px;">部门</div>
                  <div style="font-weight: 500;">{{ interview.candidate.department }}</div>
                </div>
                <div>
                  <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 4px;">面试轮次</div>
                  <div style="font-weight: 500;">
                    <nz-tag *ngIf="interview.interviewType === 'phone'">电话面</nz-tag>
                    <nz-tag *ngIf="interview.interviewType === 'video'" nzColor="blue">视频面</nz-tag>
                    <nz-tag *ngIf="interview.interviewType === 'onsite'" nzColor="cyan">现场面</nz-tag>
                    <nz-tag *ngIf="interview.interviewType === 'final'" nzColor="purple">终面</nz-tag>
                    第{{ interview.round }}轮
                  </div>
                </div>
              </div>
            </nz-col>
            <nz-col [nzSpan]="12">
              <div style="margin-bottom: 20px;">
                <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 6px;">面试官</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <nz-avatar [nzText]="interview.interviewer.name.charAt(0)" nzSize="large" style="background: #722ed1;"></nz-avatar>
                  <div>
                    <div style="font-size: 18px; font-weight: 600;">{{ interview.interviewer.name }}</div>
                    <div style="color: rgba(0,0,0,0.65);">{{ interview.interviewer.role }}</div>
                  </div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 4px;">面试时间</div>
                  <div style="font-weight: 500;">{{ formatDate(interview.interviewTime) }}</div>
                </div>
                <div>
                  <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 4px;">评价截止</div>
                  <div style="font-weight: 500;" [ngClass]="{'urgent': isOverdue}">
                    {{ formatDate(interview.evaluationDeadline) }}
                    <span *ngIf="isOverdue" style="color: #ff4d4f;">（已逾期）</span>
                  </div>
                </div>
              </div>
            </nz-col>
          </nz-row>
        </div>

        <div *ngIf="evaluation" style="background: #fff; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
              <i nz-icon nzType="bar-chart" style="color: #1890ff; margin-right: 8px;"></i>
              多维度评分
              <span style="font-size: 13px; color: rgba(0,0,0,0.45); margin-left: 8px;">（每项 1-10 分）</span>
            </h3>
            <div style="background: linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%); padding: 8px 20px; border-radius: 24px;">
              <span style="font-size: 13px; color: #0958d9; margin-right: 8px;">综合得分</span>
              <span style="font-size: 24px; font-weight: 700; color: #1890ff;">{{ overallScoreText }}</span>
              <span style="font-size: 13px; color: #0958d9; margin-left: 2px;">/10</span>
            </div>
          </div>

          <nz-row [nzGutter]="[24, 24]">
            <nz-col [nzSpan]="12" *ngFor="let dim of evaluation.dimensions">
              <div style="background: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #f0f0f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <label style="font-weight: 500; margin: 0;">{{ dim.name }}</label>
                  <nz-input-number
                    *ngIf="!isSubmitted"
                    [(ngModel)]="dim.score"
                    [nzMin]="1"
                    [nzMax]="10"
                    [nzStep]="1"
                    [nzSize]="'small'"
                    style="width: 90px;"
                    (ngModelChange)="updateOverallScore()"
                  ></nz-input-number>
                  <div *ngIf="isSubmitted" style="font-size: 18px; font-weight: 700; color: #1890ff;">
                    {{ dim.score }}<span style="font-size: 12px; color: rgba(0,0,0,0.45);">/10</span>
                  </div>
                </div>
                <nz-rate
                  *ngIf="!isSubmitted"
                  [(ngModel)]="dim.score"
                  [nzCount]="10"
                  nzAllowHalf
                  style="font-size: 16px; margin-bottom: 12px;"
                  (ngModelChange)="updateOverallScore()"
                ></nz-rate>
                <nz-rate
                  *ngIf="isSubmitted"
                  [ngModel]="dim.score"
                  [nzCount]="10"
                  nzAllowHalf
                  nzDisabled
                  style="font-size: 16px; margin-bottom: 12px;"
                ></nz-rate>
                <textarea
                  *ngIf="!isSubmitted"
                  nz-input
                  [(ngModel)]="dim.comment"
                  placeholder="请填写该维度的评价说明（可选）..."
                  [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                  style="resize: none;"
                ></textarea>
                <div *ngIf="isSubmitted && dim.comment" style="background: #fff; padding: 8px 12px; border-radius: 4px; color: rgba(0,0,0,0.65); font-size: 13px;">
                  {{ dim.comment }}
                </div>
                <div *ngIf="isSubmitted && !dim.comment" style="color: rgba(0,0,0,0.25); font-size: 12px;">暂无评语</div>
              </div>
            </nz-col>
          </nz-row>
        </div>

        <div *ngIf="evaluation" style="background: #fff; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 600;">
            <i nz-icon nzType="message" style="color: #52c41a; margin-right: 8px;"></i>
            综合评语
          </h3>

          <nz-row [nzGutter]="24">
            <nz-col [nzSpan]="12">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 500; margin-bottom: 8px;">
                  <span style="color: #52c41a;">●</span> 候选人优势
                </label>
                <textarea
                  *ngIf="!isSubmitted"
                  nz-input
                  [(ngModel)]="evaluation.strengths"
                  placeholder="请描述候选人在此次面试中展现出的优势..."
                  [nzAutosize]="{ minRows: 4, maxRows: 8 }"
                  style="resize: none;"
                ></textarea>
                <div *ngIf="isSubmitted" style="background: #f6ffed; padding: 12px; border-radius: 6px; border: 1px solid #b7eb8f; min-height: 80px; color: rgba(0,0,0,0.65); line-height: 1.6;">
                  {{ evaluation.strengths || '无' }}
                </div>
              </div>
            </nz-col>
            <nz-col [nzSpan]="12">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 500; margin-bottom: 8px;">
                  <span style="color: #faad14;">●</span> 待提升之处
                </label>
                <textarea
                  *ngIf="!isSubmitted"
                  nz-input
                  [(ngModel)]="evaluation.weaknesses"
                  placeholder="请描述候选人需要改进的方面..."
                  [nzAutosize]="{ minRows: 4, maxRows: 8 }"
                  style="resize: none;"
                ></textarea>
                <div *ngIf="isSubmitted" style="background: #fffbe6; padding: 12px; border-radius: 6px; border: 1px solid #ffe58f; min-height: 80px; color: rgba(0,0,0,0.65); line-height: 1.6;">
                  {{ evaluation.weaknesses || '无' }}
                </div>
              </div>
            </nz-col>
          </nz-row>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px;">
              <span style="color: #1890ff;">●</span> 综合评价 <span style="color: #ff4d4f; font-size: 12px;">（提交必填，至少10字）</span>
            </label>
            <textarea
              *ngIf="!isSubmitted"
              nz-input
              [(ngModel)]="evaluation.summary"
              placeholder="请对候选人进行整体评价，包括技术能力、沟通表达、团队协作、文化匹配等方面..."
              [nzAutosize]="{ minRows: 5, maxRows: 10 }"
              style="resize: none;"
            ></textarea>
            <div *ngIf="isSubmitted" style="background: #e6f4ff; padding: 16px; border-radius: 6px; border: 1px solid #91caff; min-height: 100px; color: rgba(0,0,0,0.75); line-height: 1.8;">
              {{ evaluation.summary }}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px;">
              <i nz-icon nzType="file-text" style="color: rgba(0,0,0,0.45);"></i> 其他备注（可选）
            </label>
            <textarea
              *ngIf="!isSubmitted"
              nz-input
              [(ngModel)]="evaluation.additionalNotes"
              placeholder="其他需要补充说明的内容..."
              [nzAutosize]="{ minRows: 2, maxRows: 5 }"
              style="resize: none;"
            ></textarea>
            <div *ngIf="isSubmitted" style="background: #fafafa; padding: 12px; border-radius: 6px; color: rgba(0,0,0,0.65);">
              {{ evaluation.additionalNotes || '无' }}
            </div>
          </div>
        </div>

        <div *ngIf="evaluation" style="background: #fff; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 600;">
            <i nz-icon nzType="audit" style="color: #722ed1; margin-right: 8px;"></i>
            录用建议 <span style="color: #ff4d4f; font-size: 12px;" *ngIf="!isSubmitted">（提交必填）</span>
          </h3>

          <nz-radio-group *ngIf="!isSubmitted" [(ngModel)]="evaluation.recommendation" nzSize="large" style="width: 100%;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <label nz-radio nzValue="strong_hire" style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;"
                [ngStyle]="evaluation.recommendation === 'strong_hire' ? {'border-color': '#52c41a', 'background': '#f6ffed'} : {}">
                <span style="font-size: 28px;">👍</span>
                <span style="font-weight: 600; color: #52c41a;">强烈推荐</span>
                <span style="font-size: 11px; color: rgba(0,0,0,0.45);">完全符合，优先录用</span>
              </label>
              <label nz-radio nzValue="hire" style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;"
                [ngStyle]="evaluation.recommendation === 'hire' ? {'border-color': '#1890ff', 'background': '#e6f4ff'} : {}">
                <span style="font-size: 28px;">✅</span>
                <span style="font-weight: 600; color: #1890ff;">建议录用</span>
                <span style="font-size: 11px; color: rgba(0,0,0,0.45);">符合要求，可以录用</span>
              </label>
              <label nz-radio nzValue="borderline" style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;"
                [ngStyle]="evaluation.recommendation === 'borderline' ? {'border-color': '#faad14', 'background': '#fffbe6'} : {}">
                <span style="font-size: 28px;">🤔</span>
                <span style="font-weight: 600; color: #faad14;">待定考虑</span>
                <span style="font-size: 11px; color: rgba(0,0,0,0.45);">需进一步面试评估</span>
              </label>
              <label nz-radio nzValue="no_hire" style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;"
                [ngStyle]="evaluation.recommendation === 'no_hire' ? {'border-color': '#ff4d4f', 'background': '#fff2f0'} : {}">
                <span style="font-size: 28px;">❌</span>
                <span style="font-weight: 600; color: #ff4d4f;">不建议录用</span>
                <span style="font-size: 11px; color: rgba(0,0,0,0.45);">不符合要求，不录用</span>
              </label>
            </div>
          </nz-radio-group>

          <div *ngIf="isSubmitted" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div *ngFor="let opt of recommendationOptions"
              style="border: 2px solid {{ evaluation.recommendation === opt.value ? (opt.value === 'strong_hire' ? '#52c41a' : opt.value === 'hire' ? '#1890ff' : opt.value === 'borderline' ? '#faad14' : '#ff4d4f') : '#f0f0f0' }};
                     border-radius: 8px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: {{ evaluation.recommendation === opt.value ? 1 : 0.4 }};
                     background: {{ evaluation.recommendation === opt.value ? (opt.value === 'strong_hire' ? '#f6ffed' : opt.value === 'hire' ? '#e6f4ff' : opt.value === 'borderline' ? '#fffbe6' : '#fff2f0') : '#fafafa' }};">
              <span style="font-size: 28px;">{{ opt.value === 'strong_hire' ? '👍' : opt.value === 'hire' ? '✅' : opt.value === 'borderline' ? '🤔' : '❌' }}</span>
              <span style="font-weight: 600; color: {{ opt.value === 'strong_hire' ? '#52c41a' : opt.value === 'hire' ? '#1890ff' : opt.value === 'borderline' ? '#faad14' : '#ff4d4f' }};">{{ opt.label }}</span>
              <nz-tag *ngIf="evaluation.recommendation === opt.value" nzColor="purple" style="margin-top: 4px;">已选择</nz-tag>
            </div>
          </div>
        </div>

        <div *ngIf="evaluation" style="text-align: center; background: #fff; padding: 24px; border-radius: 8px;">
          <div *ngIf="!isSubmitted" style="margin-bottom: 16px; color: rgba(0,0,0,0.45); font-size: 13px;">
            提交后评价将无法修改，请确认内容无误后再提交
          </div>
          <div *ngIf="isSubmitted" style="margin-bottom: 16px; color: #52c41a; font-size: 13px;">
            <i nz-icon nzType="check-circle"></i> 评价已成功提交
          </div>
          <button nz-button style="margin-right: 12px; padding: 6px 24px;" (click)="back()">{{ isSubmitted ? '返回评价列表' : '取消' }}</button>
          <button nz-button nzType="default" (click)="saveDraft()" [disabled]="saving || isSubmitted" style="margin-right: 12px; padding: 6px 24px;">
            <i nz-icon nzType="save"></i> 保存草稿
          </button>
          <button nz-button nzType="primary" (click)="submitEvaluation()" [disabled]="submitting || isSubmitted" style="padding: 6px 32px;">
            <i nz-icon nzType="check-circle"></i> {{ isSubmitted ? '已提交' : (submitting ? '提交中...' : '提交评价') }}
          </button>
        </div>
      </ng-container>

      <ng-template #loadingTpl>
        <div style="background: #fff; padding: 120px 0; border-radius: 8px; text-align: center;">
          <nz-spin nzSize="large" nzTip="加载中..."></nz-spin>
        </div>
      </ng-template>
    </div>
  `
})
export class EvaluationFormComponent implements OnInit {
  loading = true;
  saving = false;
  submitting = false;
  interviewId = '';
  interview: Interview | null = null;
  evaluation: Evaluation | null = null;
  recommendationOptions: Array<{ value: RecommendationType; label: string }> = [];
  isNew = true;
  isSubmitted = false;
  isOverdue = false;

  get evaluationStatus(): string {
    if (this.isSubmitted) return 'submitted';
    if (this.evaluation?.status === 'draft') return 'draft';
    if (this.isOverdue) return 'overdue';
    return 'pending';
  }

  get overallScoreText(): string {
    if (!this.evaluation?.overallScore) {
      const scores = this.evaluation?.dimensions?.map(d => d.score).filter(s => s > 0) || [];
      if (scores.length === 0) return '-';
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg.toFixed(1);
    }
    return this.evaluation.overallScore.toFixed(1);
  }

  get lastUpdatedText(): string {
    const date = this.evaluation?.updatedAt || this.evaluation?.createdAt;
    return date ? this.formatDate(date) : '尚未保存';
  }

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private evaluationService: EvaluationService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.interviewId = params['interviewId'];
      if (this.interviewId) {
        this.loadEvaluation();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event): void {
    if (!this.isSubmitted && this.hasUnsavedChanges()) {
      (e as BeforeUnloadEvent).returnValue = '您有未保存的评价草稿，确定要离开吗？';
    }
  }

  hasUnsavedChanges(): boolean {
    return this.evaluation ? true : false;
  }

  loadEvaluation(): void {
    this.loading = true;
    this.evaluationService.getEvaluation(this.interviewId).subscribe({
      next: (res: EvaluationDetailResponse) => {
        this.interview = res.interview;
        this.evaluation = res.evaluation;
        this.recommendationOptions = res.recommendationOptions.filter(o => o.value !== 'pending');
        this.isNew = !!res.evaluation.isNew;
        this.isSubmitted = res.evaluation.status === 'submitted';
        this.isOverdue = new Date(res.interview.evaluationDeadline) < new Date() && !this.isSubmitted;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.message.error(err?.error?.message || '加载评价失败');
      }
    });
  }

  updateOverallScore(): void {
    if (!this.evaluation?.dimensions) return;
    const scores = this.evaluation.dimensions
      .map(d => d.score)
      .filter(s => typeof s === 'number' && s >= 1 && s <= 10);
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      this.evaluation.overallScore = Math.round(avg * 10) / 10;
    }
  }

  saveDraft(): void {
    if (!this.evaluation || !this.interviewId) return;
    this.saving = true;

    this.evaluationService.saveDraft(this.interviewId, this.evaluation).subscribe({
      next: (res) => {
        this.saving = false;
        this.message.success(res.message || '草稿保存成功');
        if (this.evaluation) {
          this.evaluation.status = 'draft';
          this.evaluation.updatedAt = new Date().toISOString();
        }
      },
      error: (err) => {
        this.saving = false;
        this.message.error(err?.error?.message || '保存失败');
      }
    });
  }

  submitEvaluation(): void {
    if (!this.evaluation || !this.interviewId) return;

    if (!this.validateBeforeSubmit()) return;

    this.modal.confirm({
      nzTitle: '确认提交评价',
      nzContent: '提交后评价内容将无法修改，确定要提交吗？',
      nzOkText: '确认提交',
      nzCancelText: '取消',
      nzOnOk: () => this.doSubmit()
    });
  }

  validateBeforeSubmit(): boolean {
    if (!this.evaluation) return false;

    const unscored = this.evaluation.dimensions.filter(d => !d.score || d.score < 1);
    if (unscored.length > 0) {
      this.message.error(`请完成所有维度的评分（还有 ${unscored.length} 项未评）`);
      return false;
    }

    if (!this.evaluation.summary || this.evaluation.summary.trim().length < 10) {
      this.message.error('请填写综合评价（至少10个字）');
      return false;
    }

    if (!this.evaluation.recommendation || this.evaluation.recommendation === 'pending') {
      this.message.error('请选择录用建议');
      return false;
    }

    return true;
  }

  doSubmit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.evaluation || !this.interviewId) {
        reject();
        return;
      }

      this.submitting = true;
      this.evaluationService.submitEvaluation(this.interviewId, this.evaluation).subscribe({
        next: (res) => {
          this.submitting = false;
          this.message.success(res.message || '评价提交成功');
          this.isSubmitted = true;
          if (this.evaluation) {
            this.evaluation.status = 'submitted';
            this.evaluation.submittedAt = new Date().toISOString();
          }
          resolve();
        },
        error: (err) => {
          this.submitting = false;
          this.message.error(err?.error?.message || '提交失败');
          reject();
        }
      });
    });
  }

  back(): void {
    this.router.navigate(['/evaluations']);
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
