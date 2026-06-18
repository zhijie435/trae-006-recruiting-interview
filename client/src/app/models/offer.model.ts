import {
  OfferStatus,
  OfferAction,
  EmploymentType,
  OFFER_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS
} from '../constants';

export type OfferStatusAlias = OfferStatus;
export type OfferActionAlias = OfferAction;

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

export interface ReminderLog {
  remindedBy: string;
  reminderNote?: string;
  remindedAt: string;
  remindedAtText?: string;
}

export interface Offer {
  id: string;
  offerNo: string;
  candidateName: string;
  candidatePhone?: string;
  candidateEmail?: string;
  position: string;
  department: string;
  employmentType: EmploymentType | string;
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
  reminderCount?: number;
  reminderLogs?: ReminderLog[];
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
  employmentType: EmploymentType | string;
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

export {
  OFFER_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS
};
