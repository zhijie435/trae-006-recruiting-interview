import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../services/offer.service';
import {
  Offer,
  OfferFormInput,
  OfferAction,
  EMPLOYMENT_TYPE_OPTIONS
} from '../../models/offer.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-offer-detail',
  template: `
    <div class="page-container" style="max-width: 1100px; margin: 0 auto;">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>
          <span style="cursor: pointer; color: #1890ff;" (click)="backToList()">Offer 管理</span>
        </nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ pageTitle }}</nz-breadcrumb-item>
      </nz-breadcrumb>

      <ng-container *ngIf="!loading; else loadingTpl">
        <!-- 状态横幅 -->
        <div *ngIf="offer && !isEditMode" style="background: #fff; padding: 20px 24px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <h2 style="margin: 0; font-size: 20px;">{{ offer.offerNo }}</h2>
                <nz-tag [nzColor]="offer.statusColor" style="font-size: 14px; padding: 2px 12px;">{{ offer.statusLabel }}</nz-tag>
              </div>
              <div style="color: rgba(0,0,0,0.45); font-size: 13px; margin-top: 4px;">
                当前步骤：第 {{ offer.currentStep }} 步 · 最后更新：{{ offer.updatedAtText }}
              </div>
            </div>
          </div>
          <button nz-button (click)="backToList()">返回列表</button>
        </div>

        <!-- 状态流转操作 -->
        <div *ngIf="offer && !isEditMode && offer.nextActions?.length" style="background: #e6f4ff; padding: 16px; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
          <i nz-icon nzType="thunderbolt" style="color: #1890ff; font-size: 18px;"></i>
          <span style="font-weight: 500; color: #0958d9; margin-right: 8px;">可执行操作：</span>
          <ng-container *ngFor="let act of offer.nextActions">
            <button
              nz-button
              [nzType]="getBtnType(act.type)"
              [nzDanger]="act.type === 'danger'"
              (click)="executeAction(act)"
            >
              <i nz-icon [nzType]="getActionIcon(act.action)"></i>
              {{ act.label }}
            </button>
          </ng-container>
        </div>

        <!-- 表单/详情 -->
        <div style="background: #fff; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 600; border-left: 3px solid #1890ff; padding-left: 12px;">
            <i nz-icon nzType="solution" style="margin-right: 8px;"></i>
            {{ isEditMode ? 'Offer 信息' : '基础信息' }}
          </h3>

          <form [formGroup]="form" *ngIf="isEditMode; else viewTpl">
            <nz-row [nzGutter]="24">
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24" nzRequired>候选人姓名</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="candidateName" placeholder="请输入候选人姓名" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">手机号</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="candidatePhone" placeholder="请输入手机号" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">邮箱</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="candidateEmail" placeholder="请输入邮箱" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24" nzRequired>岗位</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="position" placeholder="如：前端工程师" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24" nzRequired>部门</nz-form-label>
                  <nz-form-control>
                    <nz-select formControlName="department" nzPlaceHolder="请选择部门">
                      <nz-option nzLabel="技术部" nzValue="技术部"></nz-option>
                      <nz-option nzLabel="产品部" nzValue="产品部"></nz-option>
                      <nz-option nzLabel="设计部" nzValue="设计部"></nz-option>
                      <nz-option nzLabel="运营部" nzValue="运营部"></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">用工类型</nz-form-label>
                  <nz-form-control>
                    <nz-select formControlName="employmentType">
                      <nz-option *ngFor="let opt of employmentTypeOptions" [nzLabel]="opt.label" [nzValue]="opt.value"></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">工作地点</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="workLocation" placeholder="如：北京-总部" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">月薪（元）</nz-form-label>
                  <nz-form-control>
                    <nz-input-number formControlName="salaryMonthly" [nzMin]="0" [nzStep]="1000" style="width: 100%;"></nz-input-number>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">薪资月数</nz-form-label>
                  <nz-form-control>
                    <nz-input-number formControlName="salaryMonths" [nzMin]="1" [nzMax]="24" style="width: 100%;"></nz-input-number>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">试用期（月）</nz-form-label>
                  <nz-form-control>
                    <nz-input-number formControlName="probationMonths" [nzMin]="0" [nzMax]="12" style="width: 100%;"></nz-input-number>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">入职日期</nz-form-label>
                  <nz-form-control>
                    <nz-date-picker formControlName="entryDate" style="width: 100%;"></nz-date-picker>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="8">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">奖金/福利</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="bonus" placeholder="如：年终奖2-4个月" />
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
              <nz-col [nzSpan]="24">
                <nz-form-item>
                  <nz-form-label [nzSpan]="24">备注</nz-form-label>
                  <nz-form-control>
                    <textarea nz-input formControlName="remark" [nzAutosize]="{ minRows: 2, maxRows: 5 }" placeholder="补充说明..."></textarea>
                  </nz-form-control>
                </nz-form-item>
              </nz-col>
            </nz-row>

            <div style="text-align: center; padding: 12px 0;">
              <button nz-button style="margin-right: 12px;" (click)="backToList()">取消</button>
              <button nz-button nzType="primary" (click)="saveForm()">
                <i nz-icon nzType="save"></i> 保存
              </button>
            </div>
          </form>

          <ng-template #viewTpl>
            <nz-row [nzGutter]="24">
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">候选人姓名</div>
                  <div class="info-value">{{ offer?.candidateName }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">手机号</div>
                  <div class="info-value">{{ offer?.candidatePhone || '-' }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">邮箱</div>
                  <div class="info-value">{{ offer?.candidateEmail || '-' }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">岗位</div>
                  <div class="info-value">{{ offer?.position }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">部门</div>
                  <div class="info-value">{{ offer?.department }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">用工类型</div>
                  <div class="info-value">{{ offer?.employmentTypeLabel }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">工作地点</div>
                  <div class="info-value">{{ offer?.workLocation || '-' }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">月薪</div>
                  <div class="info-value" *ngIf="offer?.salaryMonthly" style="color: #fa541c; font-weight: 600;">
                    ¥{{ formatSalary(offer.salaryMonthly) }}
                    <span style="color: rgba(0,0,0,0.45); font-weight: normal; font-size: 13px;">× {{ offer.salaryMonths }}月</span>
                  </div>
                  <div class="info-value" *ngIf="!offer?.salaryMonthly">-</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">试用期</div>
                  <div class="info-value">{{ offer?.probationMonths }} 个月</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">入职日期</div>
                  <div class="info-value">{{ offer?.entryDateText || '-' }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="8">
                <div class="info-item">
                  <div class="info-label">奖金/福利</div>
                  <div class="info-value">{{ offer?.bonus || '-' }}</div>
                </div>
              </nz-col>
              <nz-col [nzSpan]="24">
                <div class="info-item">
                  <div class="info-label">备注</div>
                  <div class="info-value" style="line-height: 1.6;">{{ offer?.remark || '-' }}</div>
                </div>
              </nz-col>
            </nz-row>
          </ng-template>
        </div>

        <!-- 审批历史时间线 -->
        <div *ngIf="offer && !isEditMode" style="background: #fff; padding: 24px; border-radius: 8px;">
          <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 600; border-left: 3px solid #722ed1; padding-left: 12px;">
            <i nz-icon nzType="history" style="margin-right: 8px;"></i>
            审批历史
          </h3>

          <nz-timeline *ngIf="offer.approvalLogs?.length; else emptyHistory">
            <nz-timeline-item *ngFor="let log of offer.approvalLogs" [nzColor]="getLogColor(log.action)">
              <div style="background: #fafafa; padding: 12px 16px; border-radius: 6px; border-left: 3px solid {{ getLogColor(log.action) }};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div>
                    <span style="font-weight: 600; color: rgba(0,0,0,0.88);">{{ log.actionText }}</span>
                    <nz-tag [nzColor]="getLogColor(log.action)" style="margin-left: 8px;">{{ log.stepName }}</nz-tag>
                  </div>
                  <span style="color: rgba(0,0,0,0.45); font-size: 12px;">{{ log.operatedAtText }}</span>
                </div>
                <div style="color: rgba(0,0,0,0.65); font-size: 13px;">
                  <i nz-icon nzType="user" style="margin-right: 4px;"></i>
                  操作人：<span style="font-weight: 500;">{{ log.approverName }}</span>
                </div>
                <div *ngIf="log.comment" style="margin-top: 6px; padding: 8px 12px; background: #fff; border-radius: 4px; color: rgba(0,0,0,0.75); font-size: 13px; line-height: 1.6;">
                  💬 {{ log.comment }}
                </div>
              </div>
            </nz-timeline-item>
          </nz-timeline>

          <ng-template #emptyHistory>
            <nz-empty nzDescription="暂无审批记录"></nz-empty>
          </ng-template>
        </div>
      </ng-container>

      <ng-template #loadingTpl>
        <div style="background: #fff; padding: 120px 0; border-radius: 8px; text-align: center;">
          <nz-spin nzSize="large" nzTip="加载中..."></nz-spin>
        </div>
      </ng-template>
    </div>

    <style>
      .info-item { margin-bottom: 20px; }
      .info-label { color: rgba(0,0,0,0.45); font-size: 13px; margin-bottom: 6px; }
      .info-value { color: rgba(0,0,0,0.88); font-size: 15px; font-weight: 500; }
    </style>
  `
})
export class OfferDetailComponent implements OnInit {
  loading = true;
  isEditMode = false;
  offer: Offer | null = null;
  offerId = '';
  form!: FormGroup;
  employmentTypeOptions = EMPLOYMENT_TYPE_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private offerService: OfferService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder
  ) {}

  get pageTitle(): string {
    if (this.isEditMode && !this.offerId) return '新建 Offer';
    if (this.isEditMode) return '编辑 Offer';
    return 'Offer 详情';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      candidateName: ['', [Validators.required]],
      candidatePhone: [''],
      candidateEmail: [''],
      position: ['', [Validators.required]],
      department: ['', [Validators.required]],
      employmentType: ['full_time'],
      workLocation: [''],
      salaryMonthly: [null],
      salaryMonths: [13],
      bonus: [''],
      probationMonths: [3],
      entryDate: [null],
      remark: ['']
    });

    this.route.params.subscribe(params => {
      this.offerId = params['id'];
      const urlSegments = this.route.snapshot.url;
      this.isEditMode = urlSegments.some(s => s.path === 'edit') || this.offerId === 'new';

      if (this.offerId && this.offerId !== 'new') {
        this.loadOffer();
      } else {
        this.loading = false;
        this.isEditMode = true;
      }
    });
  }

  loadOffer(): void {
    this.loading = true;
    this.offerService.getOffer(this.offerId).subscribe({
      next: (data) => {
        this.offer = data;
        this.loading = false;
        if (this.isEditMode) {
          this.patchForm(data);
        }
      },
      error: (err) => {
        this.loading = false;
        this.message.error(err?.error?.message || '加载 Offer 失败');
      }
    });
  }

  patchForm(data: Offer): void {
    this.form.patchValue({
      candidateName: data.candidateName,
      candidatePhone: data.candidatePhone,
      candidateEmail: data.candidateEmail,
      position: data.position,
      department: data.department,
      employmentType: data.employmentType,
      workLocation: data.workLocation,
      salaryMonthly: data.salaryMonthly,
      salaryMonths: data.salaryMonths,
      bonus: data.bonus,
      probationMonths: data.probationMonths,
      entryDate: data.entryDate ? new Date(data.entryDate) : null,
      remark: data.remark
    });
  }

  saveForm(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(ctrl => {
        if (ctrl.invalid) ctrl.markAsDirty();
      });
      this.message.warning('请补全必填字段');
      return;
    }

    const data: OfferFormInput = this.form.value;

    if (this.offerId && this.offerId !== 'new') {
      this.offerService.updateOffer(this.offerId, data, 'HR-小李').subscribe({
        next: () => {
          this.message.success('保存成功');
          this.loadOffer();
          this.isEditMode = false;
        },
        error: (err) => this.message.error(err?.error?.message || '保存失败')
      });
    } else {
      this.offerService.createOffer(data, 'HR-小李').subscribe({
        next: () => {
          this.message.success('创建成功');
          this.backToList();
        },
        error: (err) => this.message.error(err?.error?.message || '创建失败')
      });
    }
  }

  executeAction(act: { action: OfferAction; label: string }): void {
    if (!this.offer) return;

    const needsComment = ['approve', 'reject', 'rollback', 'send', 'withdraw', 'submit'].includes(act.action);
    const isDanger = act.action === 'reject' || act.action === 'decline' || act.action === 'withdraw';

    this.modal.confirm({
      nzTitle: `确认${act.label}？`,
      nzContent: `Offer：${this.offer.offerNo}（${this.offer.candidateName} - ${this.offer.position}）`,
      nzOkText: `确认${act.label}`,
      nzOkDanger: isDanger,
      nzCancelText: '取消',
      nzOnOk: () => this.doAction(act.action)
    });
  }

  doAction(action: OfferAction): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.offer) { reject(); return; }
      const comment = '';
      const operator = '当前用户';

      const obs = this.callOfferAction(action, comment, operator);
      if (!obs) { reject(); return; }

      obs.subscribe({
        next: (res: any) => {
          this.message.success(res?.message || '操作成功');
          this.loadOffer();
          resolve();
        },
        error: (err) => {
          this.message.error(err?.error?.message || '操作失败');
          reject();
        }
      });
    });
  }

  callOfferAction(action: OfferAction, comment: string, operator: string): any {
    if (!this.offer) return null;
    switch (action) {
      case 'submit': return this.offerService.submitOffer(this.offer.id, comment, operator);
      case 'approve': return this.offerService.approve(this.offer.id, comment, operator);
      case 'reject': return this.offerService.reject(this.offer.id, comment, operator);
      case 'rollback': return this.offerService.rollback(this.offer.id, comment, operator);
      case 'send': return this.offerService.send(this.offer.id, comment, operator);
      case 'accept': return this.offerService.accept(this.offer.id, comment, operator);
      case 'decline': return this.offerService.decline(this.offer.id, comment, operator);
      case 'withdraw': return this.offerService.withdraw(this.offer.id, comment, operator);
      case 'edit':
        this.router.navigate(['/offers', this.offer.id, 'edit']);
        return null;
      default: return null;
    }
  }

  backToList(): void {
    this.router.navigate(['/offers']);
  }

  getBtnType(type: string): 'primary' | 'default' | 'dashed' {
    return type === 'primary' ? 'primary' : 'default';
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      submit: 'arrow-up',
      approve: 'check',
      reject: 'close',
      rollback: 'rollback',
      send: 'send',
      accept: 'check-circle',
      decline: 'stop',
      withdraw: 'undo',
      edit: 'edit'
    };
    return map[action] || 'thunderbolt';
  }

  getLogColor(action: string): string {
    const map: Record<string, string> = {
      submit: '#1890ff',
      approve: '#52c41a',
      reject: '#ff4d4f',
      rollback: '#faad14',
      send: '#1890ff',
      accept: '#52c41a',
      decline: '#ff4d4f',
      withdraw: '#faad14',
      resubmit: '#1890ff'
    };
    return map[action] || '#8c8c8c';
  }

  formatSalary(num: number): string {
    return num.toLocaleString('zh-CN');
  }
}
