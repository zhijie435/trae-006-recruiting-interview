export type OfferFollowUpStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'ONBOARDED';

export type FollowUpChannel = 'PHONE' | 'EMAIL' | 'SMS' | 'WECHAT';

export type SlaRiskLevel = 'NORMAL' | 'WARNING' | 'OVERDUE';

export interface OfferFollowUp {
  id: string;
  offerNo: string;
  candidateName: string;
  candidatePhone: string;
  candidateEmail: string;
  position: string;
  department: string;
  salaryPackage: string;
  entryDate: string;
  owner: string;
  ownerAvatar?: string;
  status: OfferFollowUpStatus;
  slaDeadline: string;
  expireAt: string;
  createdAt: string;
  updatedAt: string;
  followUpRecords: FollowUpRecord[];
  remark?: string;
}

export interface FollowUpRecord {
  id: string;
  offerId: string;
  channel: FollowUpChannel;
  templateId?: string;
  templateName?: string;
  content: string;
  result: string;
  nextFollowUpAt?: string;
  operator: string;
  operatedAt: string;
}

export interface FollowUpTemplate {
  id: string;
  name: string;
  channel: FollowUpChannel;
  content: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  pendingCount: number;
  todayDueCount: number;
  overdueCount: number;
  weekAcceptedCount: number;
  weekRejectedCount: number;
  avgResponseHours: number;
  acceptanceRate: number;
}

export interface TrendPoint {
  date: string;
  accepted: number;
  rejected: number;
  pending: number;
}

export interface OfferFollowUpQueryParams {
  keyword?: string;
  status?: OfferFollowUpStatus | '';
  department?: string;
  slaRisk?: SlaRiskLevel | '';
  owner?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedOfferFollowUps {
  list: OfferFollowUp[];
  total: number;
  page: number;
  pageSize: number;
}

export const OFFER_FOLLOW_UP_STATUS_OPTIONS: Array<{ label: string; value: OfferFollowUpStatus | ''; color: string }> = [
  { label: '全部', value: '', color: '' },
  { label: '待回复', value: 'PENDING', color: '#E0A458' },
  { label: '已接受', value: 'ACCEPTED', color: '#2E7D6B' },
  { label: '已拒绝', value: 'REJECTED', color: '#B5462F' },
  { label: '已过期', value: 'EXPIRED', color: '#8A8F98' },
  { label: '已入职', value: 'ONBOARDED', color: '#0F3D3E' }
];

export const FOLLOW_UP_CHANNEL_OPTIONS: Array<{ label: string; value: FollowUpChannel; icon: string; color: string }> = [
  { label: '电话', value: 'PHONE', icon: 'phone', color: '#0F3D3E' },
  { label: '邮件', value: 'EMAIL', icon: 'mail', color: '#1890ff' },
  { label: '短信', value: 'SMS', icon: 'message', color: '#E0A458' },
  { label: '企业微信', value: 'WECHAT', icon: 'wechat', color: '#2E7D6B' }
];

export const SLA_RISK_OPTIONS: Array<{ label: string; value: SlaRiskLevel | ''; color: string }> = [
  { label: '全部', value: '', color: '' },
  { label: '正常', value: 'NORMAL', color: '#2E7D6B' },
  { label: '临期', value: 'WARNING', color: '#E0A458' },
  { label: '已超时', value: 'OVERDUE', color: '#B5462F' }
];

export const TEMPLATE_VARIABLES = [
  { key: '{{候选人姓名}}', label: '候选人姓名', example: '张三' },
  { key: '{{职位名称}}', label: '职位名称', example: '高级前端工程师' },
  { key: '{{部门名称}}', label: '部门名称', example: '技术部' },
  { key: '{{薪资待遇}}', label: '薪资待遇', example: '30K × 15薪' },
  { key: '{{入职日期}}', label: '入职日期', example: '2025-03-01' },
  { key: '{{Offer编号}}', label: 'Offer编号', example: 'OFR-2025-0001' },
  { key: '{{SLA截止时间}}', label: 'SLA截止时间', example: '2025-02-28 18:00' }
];
