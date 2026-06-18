import {
  InterviewType,
  InterviewStatus,
  EvaluationStatus,
  ReminderType,
  ReminderStatus,
  ReminderChannel,
  RecommendationType
} from '../constants';

export { InterviewType, InterviewStatus, EvaluationStatus, ReminderType, ReminderStatus, ReminderChannel, RecommendationType };

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidate: Candidate;
  interviewerId: string;
  interviewer: Interviewer;
  interviewTime: string;
  interviewType: InterviewType;
  round: number;
  status: InterviewStatus;
  evaluationDeadline: string;
  evaluationStatus: EvaluationStatus;
}

export interface Reminder {
  id: string;
  interviewId: string;
  interview: Interview;
  type: ReminderType;
  status: ReminderStatus;
  channel: ReminderChannel;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  note?: string;
}

export interface ReminderQueryParams {
  keyword?: string;
  evaluationStatus?: EvaluationStatus | string;
  department?: string;
  interviewerName?: string;
  overdueDays?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Statistics {
  totalPending: number;
  overdueCount: number;
  todayReminderCount: number;
  thisWeekReminderCount: number;
}

export interface ScoreDimension {
  code: string;
  name: string;
  score: number;
  comment?: string;
}

export interface Evaluation {
  id?: string;
  interviewId: string;
  interviewerId: string;
  candidateId: string;
  overallScore?: number;
  recommendation: RecommendationType;
  dimensions: ScoreDimension[];
  strengths: string;
  weaknesses: string;
  summary: string;
  additionalNotes?: string;
  status: 'draft' | 'submitted';
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
}

export interface EvaluationDetailResponse {
  evaluation: Evaluation;
  interview: Interview;
  dimensionsMeta: Array<{ code: string; name: string }>;
  recommendationOptions: Array<{ value: RecommendationType; label: string }>;
}

export interface PendingEvaluationItem {
  id: string;
  candidate: Candidate;
  interviewer: Interviewer;
  interviewTime: string;
  interviewType: InterviewType;
  round: number;
  evaluationDeadline: string;
  evaluationStatus: EvaluationStatus;
  overdueDays: number;
  hasEvaluation: boolean;
  evaluationStatusText?: string;
  overallScore?: number;
  recommendation?: RecommendationType;
  recommendationText?: string;
}

export interface PendingEvaluationQueryParams {
  keyword?: string;
  status?: string;
  interviewerId?: string;
  page?: number;
  pageSize?: number;
}

export interface EvaluationStatistics {
  totalPending: number;
  overdueCount: number;
  todaySubmitted: number;
  weekSubmitted: number;
  totalSubmitted: number;
}
