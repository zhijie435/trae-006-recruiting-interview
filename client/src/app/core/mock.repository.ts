import { Injectable } from '@angular/core';
import {
  OfferFollowUp,
  OfferFollowUpStatus,
  FollowUpChannel,
  FollowUpRecord,
  FollowUpTemplate,
  StatusInfo,
  ChannelInfo
} from '../models/offer-follow-up.model';

export function getHoursUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  return (target - Date.now()) / (1000 * 60 * 60);
}

export function formatDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

export function getStatusInfo(status: OfferFollowUpStatus): StatusInfo {
  const map: Record<OfferFollowUpStatus, StatusInfo> = {
    PENDING: { label: '待回复', color: '#E0A458', bgColor: '#FFF7E6' },
    ACCEPTED: { label: '已接受', color: '#2E7D6B', bgColor: '#E6F4EF' },
    REJECTED: { label: '已拒绝', color: '#B5462F', bgColor: '#FBE9E5' },
    EXPIRED: { label: '已过期', color: '#8A8F98', bgColor: '#F5F5F5' },
    ONBOARDED: { label: '已入职', color: '#0F3D3E', bgColor: '#E6EEED' }
  };
  return map[status];
}

export function getChannelInfo(channel: FollowUpChannel): ChannelInfo {
  const map: Record<FollowUpChannel, ChannelInfo> = {
    PHONE: { label: '电话', color: '#0F3D3E', icon: 'phone' },
    EMAIL: { label: '邮件', color: '#2E7D6B', icon: 'mail' },
    SMS: { label: '短信', color: '#E0A458', icon: 'message' },
    WECHAT: { label: '企业微信', color: '#B5462F', icon: 'wechat' }
  };
  return map[channel];
}

function isoOffsetHours(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function isoOffsetDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const mockTemplates: FollowUpTemplate[] = [
  {
    id: 'tpl-001',
    name: '首次Offer发送-邮件',
    channel: 'EMAIL',
    content: '尊敬的${candidateName}女士/先生：\n\n很高兴地通知您，您已通过${position}岗位的全部面试。我们为您提供如下Offer：\n岗位：${position}\n部门：${department}\n薪资：${salaryPackage}\n入职日期：${entryDate}\n\n请在${expireDate}前回复确认。如有疑问请联系HR${owner}。',
    enabled: true,
    createdAt: isoOffsetDays(-30),
    updatedAt: isoOffsetDays(-5)
  },
  {
    id: 'tpl-002',
    name: '催办提醒-邮件',
    channel: 'EMAIL',
    content: '${candidateName}您好：\n\n温馨提示，您的Offer（编号${offerNo}）将于${expireDate}到期，请尽快回复确认是否接受。期待您的加入！',
    enabled: true,
    createdAt: isoOffsetDays(-25),
    updatedAt: isoOffsetDays(-3)
  },
  {
    id: 'tpl-003',
    name: '电话催办话术',
    channel: 'PHONE',
    content: '${candidateName}您好，我是${department}的HR${owner}。致电是想了解您对${position}岗位Offer的考虑情况，是否有顾虑我们可以沟通解决，期待您的回复。',
    enabled: true,
    createdAt: isoOffsetDays(-20),
    updatedAt: isoOffsetDays(-2)
  },
  {
    id: 'tpl-004',
    name: '短信快速提醒',
    channel: 'SMS',
    content: '${candidateName}您好，您的Offer将于${expireDate}到期，请尽快确认。详情请联系${owner}。【招聘系统】',
    enabled: true,
    createdAt: isoOffsetDays(-15),
    updatedAt: isoOffsetDays(-1)
  },
  {
    id: 'tpl-005',
    name: '企微友好跟进',
    channel: 'WECHAT',
    content: 'Hi ${candidateName}～ 关于${position}的Offer考虑得怎么样啦？有什么问题随时找我哦，期待和你成为同事！😊',
    enabled: false,
    createdAt: isoOffsetDays(-10),
    updatedAt: isoOffsetDays(-1)
  }
];

const mockOffers: OfferFollowUp[] = [
  {
    id: 'ofr-001',
    offerNo: 'OFR-2025-0001',
    candidateName: '张明',
    candidatePhone: '13800138001',
    candidateEmail: 'zhangming@example.com',
    position: '高级前端工程师',
    department: '技术部',
    salaryPackage: '30K × 15薪',
    entryDate: '2025-03-01',
    owner: '李HR',
    expireAt: isoOffsetHours(-6),
    createdAt: isoOffsetDays(-3),
    updatedAt: isoOffsetDays(-3),
    status: 'PENDING',
    remark: '候选人技术面试评价优秀，期望薪资 30K，已满足。',
    followUpRecords: [
      {
        id: 'rec-001',
        offerId: 'ofr-001',
        channel: 'EMAIL',
        templateId: 'tpl-001',
        templateName: '首次Offer发送-邮件',
        content: '尊敬的张明先生：很高兴地通知您...',
        result: '邮件已发送，等待候选人回复',
        operator: '李HR',
        operatedAt: isoOffsetDays(-3),
        nextFollowUpAt: isoOffsetDays(-1)
      },
      {
        id: 'rec-002',
        offerId: 'ofr-001',
        channel: 'PHONE',
        content: '电话沟通，候选人表示需考虑2天',
        result: '候选人考虑中，预计本周末前答复',
        operator: '李HR',
        operatedAt: isoOffsetDays(-1)
      }
    ]
  },
  {
    id: 'ofr-002',
    offerNo: 'OFR-2025-0002',
    candidateName: '王芳',
    candidatePhone: '13800138002',
    candidateEmail: 'wangfang@example.com',
    position: '产品经理',
    department: '产品部',
    salaryPackage: '28K × 14薪',
    entryDate: '2025-03-15',
    owner: '陈HR',
    expireAt: isoOffsetHours(10),
    createdAt: isoOffsetDays(-2),
    updatedAt: isoOffsetDays(-2),
    status: 'PENDING',
    remark: '候选人经验丰富，匹配度高。',
    followUpRecords: [
      {
        id: 'rec-003',
        offerId: 'ofr-002',
        channel: 'EMAIL',
        templateId: 'tpl-001',
        templateName: '首次Offer发送-邮件',
        content: '尊敬的王芳女士：...',
        result: '邮件已发送',
        operator: '陈HR',
        operatedAt: isoOffsetDays(-2)
      }
    ]
  },
  {
    id: 'ofr-003',
    offerNo: 'OFR-2025-0003',
    candidateName: '刘强',
    candidatePhone: '13800138003',
    candidateEmail: 'liuqiang@example.com',
    position: '后端工程师',
    department: '技术部',
    salaryPackage: '32K × 15薪',
    entryDate: '2025-04-01',
    owner: '李HR',
    expireAt: isoOffsetHours(48),
    createdAt: isoOffsetDays(-1),
    updatedAt: isoOffsetDays(-1),
    status: 'PENDING',
    followUpRecords: []
  },
  {
    id: 'ofr-004',
    offerNo: 'OFR-2025-0004',
    candidateName: '赵丽',
    candidatePhone: '13800138004',
    candidateEmail: 'zhaoli@example.com',
    position: 'UI设计师',
    department: '设计部',
    salaryPackage: '25K × 13薪',
    entryDate: '2025-02-20',
    owner: '陈HR',
    expireAt: isoOffsetDays(-5),
    createdAt: isoOffsetDays(-10),
    updatedAt: isoOffsetDays(-3),
    status: 'ACCEPTED',
    remark: '候选人已接受，准备入职材料。',
    followUpRecords: [
      {
        id: 'rec-004',
        offerId: 'ofr-004',
        channel: 'PHONE',
        content: '确认接受Offer',
        result: '候选人确认接受，将于2月20日入职',
        operator: '陈HR',
        operatedAt: isoOffsetDays(-3)
      }
    ]
  },
  {
    id: 'ofr-005',
    offerNo: 'OFR-2025-0005',
    candidateName: '孙伟',
    candidatePhone: '13800138005',
    candidateEmail: 'sunwei@example.com',
    position: '运营专员',
    department: '运营部',
    salaryPackage: '18K × 13薪',
    entryDate: '2025-03-10',
    owner: '李HR',
    expireAt: isoOffsetDays(-8),
    createdAt: isoOffsetDays(-15),
    updatedAt: isoOffsetDays(-8),
    status: 'REJECTED',
    remark: '候选人因个人发展选择其他公司。',
    followUpRecords: [
      {
        id: 'rec-005',
        offerId: 'ofr-005',
        channel: 'PHONE',
        content: '跟进Offer回复',
        result: '候选人表示已接受其他Offer，婉拒',
        operator: '李HR',
        operatedAt: isoOffsetDays(-8)
      }
    ]
  },
  {
    id: 'ofr-006',
    offerNo: 'OFR-2025-0006',
    candidateName: '周婷',
    candidatePhone: '13800138006',
    candidateEmail: 'zhouting@example.com',
    position: '交互设计师',
    department: '设计部',
    salaryPackage: '26K × 14薪',
    entryDate: '2025-02-15',
    owner: '陈HR',
    expireAt: isoOffsetDays(-12),
    createdAt: isoOffsetDays(-20),
    updatedAt: isoOffsetDays(-12),
    status: 'EXPIRED',
    remark: '候选人未在规定时间内回复，Offer已过期。',
    followUpRecords: [
      {
        id: 'rec-006',
        offerId: 'ofr-006',
        channel: 'EMAIL',
        templateId: 'tpl-002',
        templateName: '催办提醒-邮件',
        content: '周婷您好：温馨提示，您的Offer即将到期...',
        result: '邮件已发送，但候选人未回复',
        operator: '陈HR',
        operatedAt: isoOffsetDays(-14)
      }
    ]
  },
  {
    id: 'ofr-007',
    offerNo: 'OFR-2025-0007',
    candidateName: '吴磊',
    candidatePhone: '13800138007',
    candidateEmail: 'wulei@example.com',
    position: '高级产品经理',
    department: '产品部',
    salaryPackage: '35K × 16薪',
    entryDate: '2025-02-01',
    owner: '李HR',
    expireAt: isoOffsetDays(-15),
    createdAt: isoOffsetDays(-25),
    updatedAt: isoOffsetDays(-5),
    status: 'ONBOARDED',
    remark: '候选人已入职，融入良好。',
    followUpRecords: [
      {
        id: 'rec-007',
        offerId: 'ofr-007',
        channel: 'EMAIL',
        content: 'Offer确认',
        result: '候选人接受并完成入职',
        operator: '李HR',
        operatedAt: isoOffsetDays(-20)
      }
    ]
  },
  {
    id: 'ofr-008',
    offerNo: 'OFR-2025-0008',
    candidateName: '郑雪',
    candidatePhone: '13800138008',
    candidateEmail: 'zhengxue@example.com',
    position: '全栈工程师',
    department: '技术部',
    salaryPackage: '33K × 15薪',
    entryDate: '2025-04-10',
    owner: '陈HR',
    expireAt: isoOffsetHours(72),
    createdAt: isoOffsetHours(-12),
    updatedAt: isoOffsetHours(-12),
    status: 'PENDING',
    followUpRecords: []
  }
];

@Injectable({ providedIn: 'root' })
export class MockRepository {
  private offers: OfferFollowUp[] = JSON.parse(JSON.stringify(mockOffers));
  private templates: FollowUpTemplate[] = JSON.parse(JSON.stringify(mockTemplates));

  getOffers(): OfferFollowUp[] {
    return this.offers;
  }

  getOfferById(id: string): OfferFollowUp | null {
    return this.offers.find(o => o.id === id) || null;
  }

  updateOffer(id: string, patch: Partial<OfferFollowUp>): OfferFollowUp | null {
    const offer = this.offers.find(o => o.id === id);
    if (!offer) return null;
    Object.assign(offer, patch, { updatedAt: new Date().toISOString() });
    return offer;
  }

  addFollowUpRecord(offerId: string, record: FollowUpRecord): boolean {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer) return false;
    if (!offer.followUpRecords) offer.followUpRecords = [];
    offer.followUpRecords.unshift(record);
    offer.updatedAt = new Date().toISOString();
    return true;
  }

  getTemplates(): FollowUpTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): FollowUpTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  addTemplate(template: FollowUpTemplate): void {
    this.templates.unshift(template);
  }

  updateTemplate(id: string, patch: Partial<FollowUpTemplate>): FollowUpTemplate | null {
    const tpl = this.templates.find(t => t.id === id);
    if (!tpl) return null;
    Object.assign(tpl, patch, { updatedAt: new Date().toISOString() });
    return tpl;
  }

  removeTemplate(id: string): boolean {
    const idx = this.templates.findIndex(t => t.id === id);
    if (idx < 0) return false;
    this.templates.splice(idx, 1);
    return true;
  }

  genId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
