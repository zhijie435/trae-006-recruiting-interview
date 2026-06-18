export type OfferStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export type OfferAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'rollback'
  | 'send'
  | 'accept'
  | 'decline'
  | 'withdraw'
  | 'edit';

export interface ApprovalLog {
  step: number;
  stepName: string;
  approverName: string;
  approverRole?: string;
  action: string;
  actionText: string;
  comment?: string;
  operatedAt: string;
  operatedAtText?: string;
}

export interface Offer {
  id: string;
  offerNo: string;
  candidateName: string;
  candidatePhone?: string;
  candidateEmail?: string;
  position: string;
  department: string;
  employmentType: string;
  employmentTypeLabel?: string;
  workLocation?: string;
  salaryMonthly?: number;
  salaryMonths?: number;
  bonus?: string;
  probationMonths?: number;
  entryDate?: string;
  entryDateText?: string;
  remark?: string;
  status: OfferStatus;
  statusLabel?: string;
  statusColor?: string;
  currentStep?: number;
  approvalLogs?: ApprovalLog[];
  createdAt: string;
  createdAtText?: string;
  updatedAt: string;
  updatedAtText?: string;
  nextActions?: Array<{ action: OfferAction; label: string; type: string }>;
}

export interface OfferQueryParams {
  keyword?: string;
  status?: OfferStatus | '';
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface OfferStatistics {
  total: number;
  draft: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  sent: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  pendingAction: number;
}

export interface OfferFormInput {
  candidateName: string;
  candidatePhone?: string;
  candidateEmail?: string;
  position: string;
  department: string;
  employmentType: string;
  workLocation?: string;
  salaryMonthly?: number;
  salaryMonths?: number;
  bonus?: string;
  probationMonths?: number;
  entryDate?: string;
  remark?: string;
}

export interface PaginatedOffers {
  list: Offer[];
  total: number;
  page: number;
  pageSize: number;
}

export const OFFER_STATUS_OPTIONS: Array<{ label: string; value: OfferStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '审批中', value: 'pending_approval' },
  { label: '审批通过', value: 'approved' },
  { label: '审批驳回', value: 'rejected' },
  { label: '已发出', value: 'sent' },
  { label: '候选人接受', value: 'accepted' },
  { label: '候选人拒绝', value: 'declined' },
  { label: '已撤回', value: 'withdrawn' }
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: '全职', value: 'full_time' },
  { label: '兼职', value: 'part_time' },
  { label: '外包', value: 'contract' },
  { label: '实习', value: 'intern' }
];
