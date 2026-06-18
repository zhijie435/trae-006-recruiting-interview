import { Injectable } from '@angular/core';
import {
  OfferFollowUp,
  FollowUpRecord,
  FollowUpTemplate,
  OfferFollowUpStatus,
  FollowUpChannel,
  SlaRiskLevel
} from '../models/offer-follow-up.model';

interface DB {
  offers: OfferFollowUp[];
  records: FollowUpRecord[];
  templates: FollowUpTemplate[];
}

const STORAGE_KEY = 'offer_followup_db_v1';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDateTime(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(dateStr: string | Date): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getHoursUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return (target - now) / (1000 * 60 * 60);
}

export function getSlaRiskLevel(expireAt: string, status: OfferFollowUpStatus): SlaRiskLevel {
  if (status !== 'PENDING') return 'NORMAL';
  const hours = getHoursUntil(expireAt);
  if (hours <= 0) return 'OVERDUE';
  if (hours <= 24) return 'WARNING';
  return 'NORMAL';
}

export function getStatusInfo(status: OfferFollowUpStatus): { label: string; color: string; bgColor: string } {
  const map: Record<OfferFollowUpStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: '待回复', color: '#E0A458', bgColor: '#FFF7E6' },
    ACCEPTED: { label: '已接受', color: '#2E7D6B', bgColor: '#E6F4EF' },
    REJECTED: { label: '已拒绝', color: '#B5462F', bgColor: '#FBE9E5' },
    EXPIRED: { label: '已过期', color: '#8A8F98', bgColor: '#F0F0F0' },
    ONBOARDED: { label: '已入职', color: '#0F3D3E', bgColor: '#E6EEED' }
  };
  return map[status];
}

export function getChannelInfo(channel: FollowUpChannel): { label: string; icon: string; color: string } {
  const map: Record<FollowUpChannel, { label: string; icon: string; color: string }> = {
    PHONE: { label: '电话', icon: 'phone', color: '#0F3D3E' },
    EMAIL: { label: '邮件', icon: 'mail', color: '#1890ff' },
    SMS: { label: '短信', icon: 'message', color: '#E0A458' },
    WECHAT: { label: '企业微信', icon: 'wechat', color: '#2E7D6B' }
  };
  return map[channel];
}

function daysFromNow(days: number, hour = 18): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function generateSeedData(): DB {
  const now = new Date();
  const candidates = [
    { name: '张伟', position: '高级前端工程师', dept: '技术部', salary: '28K × 15薪', phone: '138****5678', email: 'zhangwei@example.com' },
    { name: '李娜', position: '产品经理', dept: '产品部', salary: '32K × 14薪', phone: '139****1234', email: 'lina@example.com' },
    { name: '王强', position: '后端工程师', dept: '技术部', salary: '30K × 15薪', phone: '137****9876', email: 'wangqiang@example.com' },
    { name: '刘芳', position: 'UI设计师', dept: '设计部', salary: '22K × 14薪', phone: '136****5432', email: 'liufang@example.com' },
    { name: '陈明', position: 'Java架构师', dept: '技术部', salary: '45K × 16薪', phone: '135****8765', email: 'chenming@example.com' },
    { name: '赵丽', position: '数据分析师', dept: '数据部', salary: '25K × 14薪', phone: '134****3210', email: 'zhaoli@example.com' },
    { name: '孙浩', position: '测试工程师', dept: '技术部', salary: '20K × 14薪', phone: '133****6543', email: 'sunhao@example.com' },
    { name: '周雪', position: '运营专员', dept: '运营部', salary: '15K × 13薪', phone: '132****7654', email: 'zhouxue@example.com' },
    { name: '吴刚', position: 'DevOps工程师', dept: '技术部', salary: '26K × 15薪', phone: '131****0987', email: 'wugang@example.com' },
    { name: '郑琳', position: 'HRBP', dept: '人力资源部', salary: '18K × 14薪', phone: '130****2345', email: 'zhenglin@example.com' },
    { name: '黄磊', position: '算法工程师', dept: 'AI实验室', salary: '40K × 16薪', phone: '158****7890', email: 'huanglei@example.com' },
    { name: '林静', position: '财务主管', dept: '财务部', salary: '28K × 14薪', phone: '159****4567', email: 'linjing@example.com' }
  ];

  const statuses: OfferFollowUpStatus[] = ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'ACCEPTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'ONBOARDED', 'PENDING'];
  const expireDays = [-2, -1, 0, 1, 2, 3, 5, 7, 10, -5, 15, -3];
  const owners = ['HR-王敏', 'HR-李华', 'HR-王敏', 'HR-张伟', 'HR-李华', 'HR-王敏', 'HR-张伟', 'HR-王敏', 'HR-李华', 'HR-张伟', 'HR-王敏', 'HR-李华'];

  const offers: OfferFollowUp[] = candidates.map((c, idx) => {
    const created = new Date(now.getTime() - (Math.random() * 20 + 1) * 24 * 60 * 60 * 1000);
    const expire = daysFromNow(expireDays[idx]);
    return {
      id: uuid(),
      offerNo: `OFR-2025-${(1000 + idx).toString()}`,
      candidateName: c.name,
      candidatePhone: c.phone,
      candidateEmail: c.email,
      position: c.position,
      department: c.dept,
      salaryPackage: c.salary,
      entryDate: formatDate(daysFromNow(30 + idx, 9))!,
      owner: owners[idx],
      status: statuses[idx],
      slaDeadline: expire.toISOString(),
      expireAt: expire.toISOString(),
      createdAt: created.toISOString(),
      updatedAt: new Date(created.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      followUpRecords: [],
      remark: idx % 3 === 0 ? '候选人表示需要与家人商量后再决定' : undefined
    };
  });

  const channels: FollowUpChannel[] = ['PHONE', 'EMAIL', 'SMS', 'WECHAT', 'PHONE', 'EMAIL'];
  const results = [
    '候选人表示正在考虑中，预计本周五前给出答复',
    '已发送邮件确认，等待回复',
    '短信已送达，暂未收到回复',
    '企业微信沟通顺畅，候选人对薪资满意',
    '电话沟通，候选人希望薪资能有5%涨幅',
    '候选人反馈还在对比其他Offer'
  ];

  const records: FollowUpRecord[] = [];
  offers.forEach((offer, oidx) => {
    if (oidx < 6) {
      const recordCount = oidx % 3 + 1;
      for (let i = 0; i < recordCount; i++) {
        const channel = channels[(oidx + i) % channels.length];
        const operated = new Date(new Date(offer.createdAt).getTime() + (i + 1) * 12 * 60 * 60 * 1000);
        records.push({
          id: uuid(),
          offerId: offer.id,
          channel,
          templateId: i === 0 ? `tpl-${(oidx % 5) + 1}` : undefined,
          templateName: i === 0 ? ['首次催办模板', '友好提醒模板', 'SLA预警模板', '最终确认模板', '节日问候模板'][oidx % 5] : undefined,
          content: channel === 'PHONE'
            ? `您好${offer.candidateName}，我是${offer.owner.split('-')[1]}，关于您的${offer.position}Offer想和您确认一下进展...`
            : `尊敬的${offer.candidateName}，您好！关于您应聘的${offer.position}岗位，特此提醒您尽快回复...`,
          result: results[(oidx + i) % results.length],
          nextFollowUpAt: i === recordCount - 1 ? daysFromNow(2 - i, 14).toISOString() : undefined,
          operator: offer.owner.split('-')[1],
          operatedAt: operated.toISOString()
        });
      }
      offer.followUpRecords = records.filter(r => r.offerId === offer.id);
    }
  });

  const templates: FollowUpTemplate[] = [
    {
      id: 'tpl-1',
      name: '首次催办模板',
      channel: 'EMAIL',
      content: '尊敬的{{候选人姓名}}，您好！\n\n感谢您对{{部门名称}}{{职位名称}}岗位的关注与信任。我们已于日前向您发送了正式Offer，特此温馨提醒您尽快确认。\n\n岗位：{{职位名称}}\n薪资：{{薪资待遇}}\n入职日期：{{入职日期}}\n\n若您有任何疑问，请随时与我联系。期待您的加入！\n\nBest regards',
      enabled: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'tpl-2',
      name: '友好提醒模板',
      channel: 'SMS',
      content: '【{{部门名称}}】{{候选人姓名}}您好，关于{{职位名称}}的Offer，我们想确认下您的决策进展。如有疑问请随时回复，感谢！',
      enabled: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'tpl-3',
      name: 'SLA预警模板',
      channel: 'PHONE',
      content: '{{候选人姓名}}您好，我是{{部门名称}}的HR。距离{{Offer编号}}的回复截止时间{{SLA截止时间}}只剩不到24小时，想和您同步一下...',
      enabled: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'tpl-4',
      name: '最终确认模板',
      channel: 'WECHAT',
      content: '{{候选人姓名}}您好👋 关于{{职位名称}}的Offer，我们非常期待您的加入。如方便的话，烦请今天内告知您的决定，感谢您的配合！',
      enabled: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'tpl-5',
      name: '节日问候模板',
      channel: 'EMAIL',
      content: '尊敬的{{候选人姓名}}，您好！\n\n值此佳节，祝您节日快乐！同时也温馨提醒您关于{{职位名称}}Offer的回复事宜，期待您早日加入我们的团队。\n\n祝好！',
      enabled: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  return { offers, records, templates };
}

@Injectable({ providedIn: 'root' })
export class MockRepository {
  private db: DB;

  constructor() {
    this.db = this.loadOrInit();
  }

  private loadOrInit(): DB {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load mock DB, reinitializing...', e);
    }
    const seed = generateSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(db: DB): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist mock DB:', e);
    }
  }

  private save(): void {
    this.persist(this.db);
  }

  reset(): void {
    const seed = generateSeedData();
    this.db = seed;
    this.save();
  }

  getOffers(): OfferFollowUp[] {
    return [...this.db.offers].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getOfferById(id: string): OfferFollowUp | undefined {
    return this.db.offers.find(o => o.id === id);
  }

  updateOffer(id: string, patch: Partial<OfferFollowUp>): OfferFollowUp | undefined {
    const idx = this.db.offers.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    this.db.offers[idx] = {
      ...this.db.offers[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.db.offers[idx];
  }

  addRecord(record: Omit<FollowUpRecord, 'id' | 'operatedAt'>): FollowUpRecord {
    const full: FollowUpRecord = {
      ...record,
      id: uuid(),
      operatedAt: new Date().toISOString()
    };
    this.db.records.push(full);

    const offer = this.db.offers.find(o => o.id === record.offerId);
    if (offer) {
      offer.followUpRecords = [...offer.followUpRecords, full];
      offer.updatedAt = new Date().toISOString();
    }
    this.save();
    return full;
  }

  getRecordsByOfferId(offerId: string): FollowUpRecord[] {
    return this.db.records
      .filter(r => r.offerId === offerId)
      .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime());
  }

  getTemplates(channel?: FollowUpChannel): FollowUpTemplate[] {
    let list = [...this.db.templates];
    if (channel) {
      list = list.filter(t => t.channel === channel);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getTemplateById(id: string): FollowUpTemplate | undefined {
    return this.db.templates.find(t => t.id === id);
  }

  createTemplate(data: Omit<FollowUpTemplate, 'id' | 'createdAt' | 'updatedAt'>): FollowUpTemplate {
    const tpl: FollowUpTemplate = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.db.templates.push(tpl);
    this.save();
    return tpl;
  }

  updateTemplate(id: string, patch: Partial<FollowUpTemplate>): FollowUpTemplate | undefined {
    const idx = this.db.templates.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.db.templates[idx] = {
      ...this.db.templates[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.db.templates[idx];
  }

  deleteTemplate(id: string): boolean {
    const idx = this.db.templates.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.db.templates.splice(idx, 1);
    this.save();
    return true;
  }

  duplicateTemplate(id: string): FollowUpTemplate | undefined {
    const original = this.getTemplateById(id);
    if (!original) return undefined;
    return this.createTemplate({
      name: `${original.name} (副本)`,
      channel: original.channel,
      content: original.content,
      enabled: false
    });
  }

  toggleTemplate(id: string, enabled: boolean): FollowUpTemplate | undefined {
    return this.updateTemplate(id, { enabled });
  }
}
