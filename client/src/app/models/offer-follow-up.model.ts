export type OfferFollowUpStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'ONBOARDED';

export type FollowUpChannel = 'PHONE' | 'EMAIL' | 'SMS' | 'WECHAT';

export type SlaRisk = '' | 'NORMAL' | 'WARNING' | 'OVERDUE';

export interface FollowUpRecord {
  id: string;
  offerId: string;
  channel: FollowUpChannel;
  templateId?: string;
  templateName?: string;
  content: string;
  result: string;
  operator: string;
  operatedAt: string;
  nextFollowUpAt?: string;
}

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
  expireAt: string;
  createdAt: string;
  updatedAt: string;
  status: OfferFollowUpStatus;
  remark?: string;
  followUpRecords?: FollowUpRecord[];
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
  slaRisk?: SlaRisk;
  owner?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedOfferFollowUps {
  list: OfferFollowUp[];
  total: number;
}

export interface FollowUpRecordInput {
  offerId: string;
  channel: FollowUpChannel;
  templateId?: string;
  templateName?: string;
  content: string;
  result: string;
  nextFollowUpAt?: string;
  operator: string;
}

export interface StatusInfo {
  label: string;
  color: string;
  bgColor: string;
}

export interface ChannelInfo {
  label: string;
  color: string;
  icon: string;
}

export interface OptionItem<T = string> {
  label: string;
  value: T;
  icon?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

export const OFFER_FOLLOW_UP_STATUS_OPTIONS: OptionItem<OfferFollowUpStatus>[] = [
  { label: '待回复', value: 'PENDING' },
  { label: '已接受', value: 'ACCEPTED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已入职', value: 'ONBOARDED' }
];

export const SLA_RISK_OPTIONS: OptionItem<SlaRisk>[] = [
  { label: '全部', value: '' },
  { label: '正常', value: 'NORMAL' },
  { label: '临期', value: 'WARNING' },
  { label: '已超时', value: 'OVERDUE' }
];

export const FOLLOW_UP_CHANNEL_OPTIONS: OptionItem<FollowUpChannel>[] = [
  { label: '电话', value: 'PHONE', icon: 'phone' },
  { label: '邮件', value: 'EMAIL', icon: 'mail' },
  { label: '短信', value: 'SMS', icon: 'message' },
  { label: '企业微信', value: 'WECHAT', icon: 'wechat' }
];

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: '${candidateName}', label: '候选人姓名', example: '张三' },
  { key: '${position}', label: '岗位名称', example: '高级前端工程师' },
  { key: '${department}', label: '所属部门', example: '技术部' },
  { key: '${salaryPackage}', label: '薪资待遇', example: '30K × 15薪' },
  { key: '${entryDate}', label: '入职日期', example: '2025-03-01' },
  { key: '${offerNo}', label: 'Offer编号', example: 'OFR-2025-0001' },
  { key: '${expireDate}', label: '截止日期', example: '2025-02-20' },
  { key: '${owner}', label: '责任人', example: '李HR' }
];
