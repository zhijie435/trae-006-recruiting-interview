export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  interviewCount?: number;
  latestInterviewTime?: string;
  latestInterviewStatus?: string;
  latestEvaluationStatus?: string;
  communicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationType = 'email' | 'phone' | 'onsite' | 'video' | 'note' | 'system';
export type CommunicationDirection = 'outbound' | 'inbound' | 'internal';
export type OperatorRole = 'hr' | 'interviewer' | 'admin';

export interface CandidateCommunication {
  id: string;
  candidateId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  title: string;
  content: string;
  contactPerson?: string;
  contactInfo?: string;
  result?: string;
  nextStep?: string;
  operator: string;
  operatorRole: OperatorRole;
  relatedInterviewId?: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InterviewInfo {
  id: string;
  interviewTime: string;
  interviewType: 'phone' | 'onsite' | 'video' | 'final';
  round: number;
  status: 'pending' | 'completed' | 'cancelled';
  evaluationStatus: 'pending' | 'submitted' | 'overdue';
  evaluationDeadline: string;
  interviewerName: string;
  interviewerRole?: string;
  evaluations?: {
    id: string;
    overallScore?: number;
    recommendation?: string;
    status: string;
    submittedAt?: string;
  }[];
}

export interface OfferInfo {
  id: string;
  status: string;
  salaryMonthly: number;
  entryDate: string;
  createdAt: string;
}

export interface CandidateDetail extends Candidate {
  interviews: InterviewInfo[];
  offers: OfferInfo[];
  communications: CandidateCommunication[];
}

export interface CandidateStatistics {
  interviewCount: number;
  communicationCount: number;
  evaluationCount: number;
  interviewTypeCount: Record<string, number>;
  communicationTypeCount: Record<string, number>;
  avgScore: number | null;
  latestActivity: string | null;
}

export interface CandidateQueryParams {
  keyword?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface CommunicationQueryParams {
  type?: CommunicationType;
  operatorRole?: OperatorRole;
  page?: number;
  pageSize?: number;
}

export const COMMUNICATION_TYPE_OPTIONS = [
  { value: 'email', label: '邮件', color: 'blue', icon: 'mail' },
  { value: 'phone', label: '电话', color: 'green', icon: 'phone' },
  { value: 'onsite', label: '现场', color: 'purple', icon: 'home' },
  { value: 'video', label: '视频', color: 'cyan', icon: 'video-camera' },
  { value: 'note', label: '备注', color: 'orange', icon: 'file-text' },
  { value: 'system', label: '系统', color: 'default', icon: 'setting' }
];

export const DIRECTION_OPTIONS = [
  { value: 'outbound', label: '主动联系', color: 'blue' },
  { value: 'inbound', label: '候选人来电', color: 'green' },
  { value: 'internal', label: '内部沟通', color: 'orange' }
];

export const OPERATOR_ROLE_OPTIONS = [
  { value: 'hr', label: 'HR', color: 'blue' },
  { value: 'interviewer', label: '面试官', color: 'purple' },
  { value: 'admin', label: '管理员', color: 'red' }
];

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
