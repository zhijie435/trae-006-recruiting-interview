import { Component, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OfferFollowUpService } from '../../services/offer-follow-up.service';
import { FollowUpTemplateService } from '../../services/follow-up-template.service';
import {
  OfferFollowUp,
  FollowUpChannel,
  FollowUpTemplate,
  FOLLOW_UP_CHANNEL_OPTIONS,
  TEMPLATE_VARIABLES
} from '../../models/offer-follow-up.model';
import { getChannelInfo } from '../../core/mock.repository';

@Component({
  selector: 'app-follow-up-modal',
  template: `
    <nz-modal
      [(nzVisible)]="visible"
      [nzTitle]="modalTitle"
      nzOkText="提交催办记录"
      nzCancelText="取消"
      [nzOkLoading]="submitting"
      (nzOnOk)="handleSubmit()"
      (nzOnCancel)="handleCancel()"
      nzWidth="720px"
      [nzOkButtonStyle]="{ background: '#0F3D3E', borderColor: '#0F3D3E' }"
    >
      <div *ngIf="visible" style="padding: 0 8px;">
        <nz-alert
          *ngIf="isBatch"
          nzType="info"
          nzShowIcon
          nzMessage="批量催办"
          [nzDescription]="'将对选中的 ' + offerIds.length + ' 个候选人统一发送催办，模板变量将按每个 Offer 的信息自动替换'"
          style="margin-bottom: 16px;"
        />

        <div *ngIf="!isBatch && currentOffer" style="margin-bottom: 16px;">
          <nz-descriptions [nzColumn]="2" nzSize="small" nzBordered>
            <nz-descriptions-item nzTitle="候选人">{{ currentOffer.candidateName }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="岗位">{{ currentOffer.position }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="部门">{{ currentOffer.department }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="薪资">{{ currentOffer.salaryPackage }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Offer编号" style="font-family: monospace;">{{ currentOffer.offerNo }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="入职日期">{{ currentOffer.entryDate }}</nz-descriptions-item>
          </nz-descriptions>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">催办通道</label>
          <nz-radio-group [(ngModel)]="channel" (ngModelChange)="onChannelChange()">
            <label *ngFor="let opt of channelOptions" nz-radio-button [nzValue]="opt.value">
              <i nz-icon [nzType]="opt.icon" style="margin-right: 4px; color: inherit;"></i>
              {{ opt.label }}
            </label>
          </nz-radio-group>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            选择模板 <span style="color: rgba(0,0,0,0.45); font-weight: normal;">（可选，将套用模板内容）</span>
          </label>
          <div style="display: flex; gap: 8px;">
            <nz-select [(ngModel)]="templateId" (ngModelChange)="onTemplateChange()" style="flex: 1;" nzPlaceHolder="选择模板...">
              <nz-option *ngFor="let t of filteredTemplates" [nzLabel]="t.name" [nzValue]="t.id"></nz-option>
            </nz-select>
            <button nz-button (click)="templateId = ''; content = '';">
              <i nz-icon nzType="close"></i>清除
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            催办内容
            <span style="color: rgba(0,0,0,0.45); font-weight: normal;">
              （可使用变量占位符：
              <span
                *ngFor="let v of templateVariables; let last = last"
                class="var-chip"
                (click)="insertVariable(v.key)"
                title="点击插入"
              >{{ v.key }}</span>{{ last ? '' : '、' }}
              ）
            </span>
          </label>
          <textarea
            nz-input
            [(ngModel)]="content"
            rows="6"
            placeholder="请输入催办内容..."
            style="resize: vertical;"
          ></textarea>
        </div>

        <div *ngIf="!isBatch && currentOffer && content" style="margin-bottom: 16px;">
          <nz-collapse nzGhost>
            <nz-collapse-panel nzHeader="实时预览（变量已替换）">
              <div class="preview-box">
                <pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">{{ previewContent }}</pre>
              </div>
            </nz-collapse-panel>
          </nz-collapse>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">催办结果 <span style="color: #B5462F;">*</span></label>
          <textarea
            nz-input
            [(ngModel)]="result"
            rows="2"
            placeholder="请输入本次催办的结果，如：候选人表示本周五前答复..."
          ></textarea>
        </div>

        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">下次跟进时间 <span style="color: rgba(0,0,0,0.45); font-weight: normal;">（可选）</span></label>
          <nz-date-picker
            [(ngModel)]="nextFollowUpAt"
            nzShowTime
            nzPlaceHolder="选择下次跟进时间"
            style="width: 100%;"
          ></nz-date-picker>
        </div>
      </div>
    </nz-modal>
  `,
  styles: [`
    :host ::ng-deep .ant-radio-button-wrapper-checked {
      background: #0F3D3E;
      border-color: #0F3D3E;
    }
    :host ::ng-deep .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
      background: #0F3D3E;
    }
    .var-chip {
      display: inline-block;
      padding: 0 6px;
      margin: 0 2px;
      background: #F7F5F1;
      border: 1px dashed #E0A458;
      border-radius: 4px;
      color: #E0A458;
      font-family: monospace;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .var-chip:hover {
      background: #FFF7E6;
      border-style: solid;
    }
    .preview-box {
      background: #F7F5F1;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      padding: 12px 16px;
      color: rgba(0,0,0,0.88);
    }
  `]
})
export class FollowUpModalComponent {
  visible = false;
  submitting = false;
  isBatch = false;
  currentOffer: OfferFollowUp | null = null;
  offerIds: string[] = [];
  channel: FollowUpChannel = 'EMAIL';
  templateId = '';
  templates: FollowUpTemplate[] = [];
  content = '';
  result = '';
  nextFollowUpAt: Date | null = null;
  channelOptions = FOLLOW_UP_CHANNEL_OPTIONS;
  templateVariables = TEMPLATE_VARIABLES;

  @Output() onSuccess = new EventEmitter<void>();

  constructor(
    private followUpService: OfferFollowUpService,
    private templateService: FollowUpTemplateService,
    private message: NzMessageService
  ) {}

  get modalTitle(): string {
    return this.isBatch
      ? `批量催办 (${this.offerIds.length} 人)`
      : '添加催办记录';
  }

  get filteredTemplates(): FollowUpTemplate[] {
    return this.templates.filter(t => t.channel === this.channel && t.enabled);
  }

  get previewContent(): string {
    if (this.currentOffer) {
      return this.templateService.render(this.content, this.currentOffer);
    }
    return this.content;
  }

  openForSingle(offer: OfferFollowUp): void {
    this.resetForm();
    this.isBatch = false;
    this.currentOffer = offer;
    this.offerIds = [offer.id];
    this.visible = true;
    this.loadTemplates();
  }

  openForBatch(ids: string[]): void {
    this.resetForm();
    this.isBatch = true;
    this.currentOffer = null;
    this.offerIds = ids;
    this.visible = true;
    this.loadTemplates();
  }

  resetForm(): void {
    this.channel = 'EMAIL';
    this.templateId = '';
    this.content = '';
    this.result = '';
    this.nextFollowUpAt = null;
    this.submitting = false;
  }

  loadTemplates(): void {
    this.templateService.list().subscribe(templates => {
      this.templates = templates;
    });
  }

  onChannelChange(): void {
    this.templateId = '';
    this.content = '';
  }

  onTemplateChange(): void {
    const tpl = this.templates.find(t => t.id === this.templateId);
    if (tpl) {
      this.content = tpl.content;
    }
  }

  insertVariable(key: string): void {
    this.content += key;
  }

  handleCancel(): void {
    this.visible = false;
  }

  handleSubmit(): void {
    if (!this.content.trim()) {
      this.message.warning('请输入催办内容');
      return;
    }
    if (!this.result.trim()) {
      this.message.warning('请输入催办结果');
      return;
    }
    this.submitting = true;

    const data = {
      channel: this.channel,
      templateId: this.templateId || undefined,
      templateName: this.templates.find(t => t.id === this.templateId)?.name,
      content: this.content,
      result: this.result,
      nextFollowUpAt: this.nextFollowUpAt?.toISOString(),
      operator: 'HR'
    };

    const request = this.isBatch
      ? this.followUpService.batchAddFollowUpRecord(this.offerIds, data)
      : this.followUpService.addFollowUpRecord({ ...data, offerId: this.offerIds[0] });

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.visible = false;
        this.message.success(this.isBatch ? `批量催办完成，共 ${this.offerIds.length} 人` : '催办记录已添加');
        this.onSuccess.emit();
      },
      error: () => {
        this.submitting = false;
        this.message.error('提交失败');
      }
    });
  }

  getChannelInfo = getChannelInfo;
}
