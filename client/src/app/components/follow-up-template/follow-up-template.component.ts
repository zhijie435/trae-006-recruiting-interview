import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FollowUpTemplateService } from '../../services/follow-up-template.service';
import {
  FollowUpTemplate,
  FollowUpChannel,
  FOLLOW_UP_CHANNEL_OPTIONS,
  TEMPLATE_VARIABLES
} from '../../models/offer-follow-up.model';
import { formatDateTime, getChannelInfo } from '../../core/mock.repository';

@Component({
  selector: 'app-follow-up-template',
  template: `
    <div class="page-container">
      <nz-breadcrumb style="margin-bottom: 16px;">
        <nz-breadcrumb-item>首页</nz-breadcrumb-item>
        <nz-breadcrumb-item (click)="router.navigate(['/follow-up-dashboard'])">催办工作台</nz-breadcrumb-item>
        <nz-breadcrumb-item>催办模板</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">
          <i nz-icon nzType="file-text" style="margin-right: 8px; color: #0F3D3E;"></i>
          催办模板管理
        </h1>
        <button nz-button nzType="primary" (click)="openCreate()" style="background: #0F3D3E; border-color: #0F3D3E;">
          <i nz-icon nzType="plus"></i>新建模板
        </button>
      </div>

      <nz-row [nzGutter]="12" style="margin-bottom: 16px;">
        <nz-col [nzSpan]="6" *ngFor="let c of channelStats">
          <div class="channel-card" [ngStyle]="{ 'border-left-color': c.color }" (click)="filterChannel = c.value">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="channel-icon" [ngStyle]="{ background: c.color + '14', color: c.color }">
                <i nz-icon [nzType]="c.icon"></i>
              </div>
              <div>
                <div class="channel-value">{{ c.count }}</div>
                <div class="channel-label">{{ c.label }}模板</div>
              </div>
            </div>
          </div>
        </nz-col>
      </nz-row>

      <div class="table-panel">
        <nz-table
          #tplTable
          [nzData]="filteredTemplates"
          [nzFrontPagination]="false"
          [nzTotal]="filteredTemplates.length"
          [(nzPageIndex)]="pageIndex"
          [(nzPageSize)]="pageSize"
        >
          <thead>
            <tr>
              <th>模板名称</th>
              <th nzWidth="120px">适用通道</th>
              <th>内容预览</th>
              <th nzWidth="100px">状态</th>
              <th nzWidth="180px">更新时间</th>
              <th nzWidth="280px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tpl of tplTable.data">
              <td>
                <div style="font-weight: 500;">{{ tpl.name }}</div>
                <div style="font-size: 12px; color: rgba(0,0,0,0.45);">ID: {{ tpl.id.substring(0, 8) }}</div>
              </td>
              <td>
                <nz-tag [nzColor]="getChannelInfo(tpl.channel).color">
                  <i nz-icon [nzType]="getChannelInfo(tpl.channel).icon" style="margin-right: 4px;"></i>
                  {{ getChannelInfo(tpl.channel).label }}
                </nz-tag>
              </td>
              <td>
                <div class="preview-text">{{ tpl.content }}</div>
              </td>
              <td>
                <nz-switch
                  [(ngModel)]="tpl.enabled"
                  (ngModelChange)="toggleEnabled(tpl)"
                  nzCheckedChildren="启用"
                  nzUnCheckedChildren="停用"
                ></nz-switch>
              </td>
              <td style="font-family: monospace; font-size: 12px;">{{ formatDateTime(tpl.updatedAt) }}</td>
              <td>
                <button nz-button nzType="link" nzSize="small" (click)="openPreview(tpl)">
                  <i nz-icon nzType="eye"></i>预览
                </button>
                <button nz-button nzType="link" nzSize="small" (click)="openEdit(tpl)">
                  <i nz-icon nzType="edit"></i>编辑
                </button>
                <button nz-button nzType="link" nzSize="small" (click)="duplicate(tpl)">
                  <i nz-icon nzType="copy"></i>复制
                </button>
                <button nz-button nzType="link" nzSize="small" nzDanger (click)="remove(tpl)">
                  <i nz-icon nzType="delete"></i>删除
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <nz-modal
        [(nzVisible)]="editorVisible"
        [nzTitle]="isEditing ? '编辑模板' : '新建模板'"
        nzOkText="保存"
        nzCancelText="取消"
        [nzOkLoading]="editorSubmitting"
        (nzOnOk)="handleEditorSave()"
        (nzOnCancel)="editorVisible = false"
        nzWidth="680px"
        [nzOkButtonStyle]="{ background: '#0F3D3E', borderColor: '#0F3D3E' }"
      >
        <div *ngIf="editorVisible" style="padding: 0 8px;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">模板名称 <span style="color: #B5462F;">*</span></label>
            <input nz-input [(ngModel)]="editorForm.name" placeholder="请输入模板名称" maxlength="50" />
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">适用通道 <span style="color: #B5462F;">*</span></label>
            <nz-radio-group [(ngModel)]="editorForm.channel">
              <label *ngFor="let opt of channelOptions" nz-radio-button [nzValue]="opt.value">
                <i nz-icon [nzType]="opt.icon" style="margin-right: 4px;"></i>{{ opt.label }}
              </label>
            </nz-radio-group>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">
              模板内容 <span style="color: #B5462F;">*</span>
              <span style="color: rgba(0,0,0,0.45); font-weight: normal; margin-left: 8px;">
                可用变量：
                <span
                  *ngFor="let v of templateVariables"
                  class="var-chip"
                  (click)="insertVariable(v.key)"
                  title="点击插入"
                >{{ v.key }}</span>
              </span>
            </label>
            <textarea
              nz-input
              [(ngModel)]="editorForm.content"
              rows="8"
              placeholder="请输入模板内容，可使用上面的变量占位符..."
              style="resize: vertical;"
            ></textarea>
          </div>

          <nz-alert
            nzType="info"
            nzShowIcon
            nzMessage="变量说明"
            nzDescription="模板中的变量占位符在实际发送时会自动替换为对应 Offer 的具体信息。"
          ></nz-alert>
        </div>
      </nz-modal>

      <nz-modal
        [(nzVisible)]="previewVisible"
        nzTitle="模板预览"
        [nzFooter]="null"
        nzWidth="600px"
      >
        <div *ngIf="previewVisible && previewTemplate" style="padding: 8px;">
          <div style="margin-bottom: 12px;">
            <nz-tag [nzColor]="getChannelInfo(previewTemplate.channel).color">
              <i nz-icon [nzType]="getChannelInfo(previewTemplate.channel).icon" style="margin-right: 4px;"></i>
              {{ getChannelInfo(previewTemplate.channel).label }}
            </nz-tag>
            <span style="font-weight: 500; margin-left: 8px;">{{ previewTemplate.name }}</span>
          </div>
          <nz-descriptions [nzColumn]="1" nzSize="small" nzBordered style="margin-bottom: 12px;">
            <nz-descriptions-item *ngFor="let v of templateVariables" [nzTitle]="v.label">
              {{ v.example }}
            </nz-descriptions-item>
          </nz-descriptions>
          <div class="preview-box">
            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">{{ renderedPreview }}</pre>
          </div>
        </div>
      </nz-modal>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; background: #F7F5F1; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 22px; font-weight: 600; font-family: 'Noto Serif SC', serif; }
    .channel-card {
      background: #fff; border-radius: 8px; padding: 16px 20px; cursor: pointer;
      border-left: 4px solid; transition: all 0.3s;
      border-top: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
    }
    .channel-card:hover { box-shadow: 0 4px 12px rgba(15, 61, 62, 0.1); }
    .channel-icon {
      width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .channel-value { font-size: 24px; font-weight: 700; line-height: 1.2; color: rgba(0,0,0,0.88); }
    .channel-label { font-size: 12px; color: rgba(0,0,0,0.55); margin-top: 2px; }
    .table-panel { background: #fff; border-radius: 8px; border: 1px solid #f0f0f0; padding: 4px; }
    .preview-text {
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; color: rgba(0,0,0,0.65); font-size: 13px;
    }
    .var-chip {
      display: inline-block; padding: 0 6px; margin: 0 2px;
      background: #F7F5F1; border: 1px dashed #E0A458; border-radius: 4px;
      color: #E0A458; font-family: monospace; font-size: 12px; cursor: pointer; transition: all 0.2s;
    }
    .var-chip:hover { background: #FFF7E6; border-style: solid; }
    .preview-box {
      background: #F7F5F1; border: 1px solid #f0f0f0; border-radius: 6px;
      padding: 16px; color: rgba(0,0,0,0.88);
    }
    :host ::ng-deep .ant-radio-button-wrapper-checked {
      background: #0F3D3E; border-color: #0F3D3E;
    }
  `]
})
export class FollowUpTemplateComponent implements OnInit {
  templates: FollowUpTemplate[] = [];
  filterChannel: FollowUpChannel | '' = '';
  pageIndex = 1;
  pageSize = 10;
  channelOptions = FOLLOW_UP_CHANNEL_OPTIONS;
  templateVariables = TEMPLATE_VARIABLES;

  editorVisible = false;
  editorSubmitting = false;
  isEditing = false;
  editorForm = {
    id: '',
    name: '',
    channel: 'EMAIL' as FollowUpChannel,
    content: ''
  };

  previewVisible = false;
  previewTemplate: FollowUpTemplate | null = null;

  constructor(
    private templateService: FollowUpTemplateService,
    private message: NzMessageService,
    private modalService: NzModalService,
    public router: any
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get filteredTemplates(): FollowUpTemplate[] {
    if (!this.filterChannel) return this.templates;
    return this.templates.filter(t => t.channel === this.filterChannel);
  }

  get channelStats() {
    const stats = this.channelOptions.map(c => ({
      ...c,
      count: this.templates.filter(t => t.channel === c.value).length
    }));
    return [
      { label: '全部', value: '' as FollowUpChannel | '', icon: 'unordered-list', color: '#0F3D3E', count: this.templates.length },
      ...stats
    ];
  }

  get renderedPreview(): string {
    if (!this.previewTemplate) return '';
    const mockOffer: any = {
      candidateName: '张三',
      position: '高级前端工程师',
      department: '技术部',
      salaryPackage: '30K × 15薪',
      entryDate: '2025-03-01',
      offerNo: 'OFR-2025-0001',
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    return this.templateService.render(this.previewTemplate.content, mockOffer);
  }

  loadData(): void {
    this.templateService.list().subscribe(templates => {
      this.templates = templates;
    });
  }

  openCreate(): void {
    this.isEditing = false;
    this.editorForm = { id: '', name: '', channel: 'EMAIL', content: '' };
    this.editorVisible = true;
  }

  openEdit(tpl: FollowUpTemplate): void {
    this.isEditing = true;
    this.editorForm = {
      id: tpl.id,
      name: tpl.name,
      channel: tpl.channel,
      content: tpl.content
    };
    this.editorVisible = true;
  }

  openPreview(tpl: FollowUpTemplate): void {
    this.previewTemplate = tpl;
    this.previewVisible = true;
  }

  insertVariable(key: string): void {
    this.editorForm.content += key;
  }

  handleEditorSave(): void {
    if (!this.editorForm.name.trim()) {
      this.message.warning('请输入模板名称');
      return;
    }
    if (!this.editorForm.content.trim()) {
      this.message.warning('请输入模板内容');
      return;
    }
    this.editorSubmitting = true;

    const request = this.isEditing
      ? this.templateService.update(this.editorForm.id, {
          name: this.editorForm.name,
          channel: this.editorForm.channel,
          content: this.editorForm.content
        })
      : this.templateService.create({
          name: this.editorForm.name,
          channel: this.editorForm.channel,
          content: this.editorForm.content
        });

    request.subscribe({
      next: () => {
        this.editorSubmitting = false;
        this.editorVisible = false;
        this.message.success(this.isEditing ? '模板已更新' : '模板已创建');
        this.loadData();
      },
      error: () => {
        this.editorSubmitting = false;
        this.message.error('保存失败');
      }
    });
  }

  toggleEnabled(tpl: FollowUpTemplate): void {
    this.templateService.toggleEnabled(tpl.id, tpl.enabled).subscribe({
      next: () => {
        this.message.success(tpl.enabled ? '模板已启用' : '模板已停用');
      },
      error: () => {
        tpl.enabled = !tpl.enabled;
        this.message.error('操作失败');
      }
    });
  }

  duplicate(tpl: FollowUpTemplate): void {
    this.templateService.duplicate(tpl.id).subscribe({
      next: (res) => {
        if (res) {
          this.message.success('模板已复制');
          this.loadData();
        }
      },
      error: () => this.message.error('复制失败')
    });
  }

  remove(tpl: FollowUpTemplate): void {
    this.modalService.confirm({
      nzTitle: '删除模板确认',
      nzContent: `确定要删除模板「${tpl.name}」吗？删除后不可恢复。`,
      nzOkText: '删除',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: () => {
        this.templateService.remove(tpl.id).subscribe({
          next: (ok) => {
            if (ok) {
              this.message.success('模板已删除');
              this.loadData();
            } else {
              this.message.error('删除失败');
            }
          },
          error: () => this.message.error('删除失败')
        });
      }
    });
  }

  formatDateTime = formatDateTime;
  getChannelInfo = getChannelInfo;
}
