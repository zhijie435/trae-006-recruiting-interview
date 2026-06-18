import {
  InterviewType,
  InterviewStatus,
  EvaluationStatus,
  RecommendationType,
  CommunicationType,
  CommunicationDirection,
  UserRoleType,
  COMMUNICATION_TYPE_OPTIONS,
  DIRECTION_OPTIONS,
  OPERATOR_ROLE_OPTIONS,
  ScoreDimensionMeta
} from '../constants';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  interviewCount?: number;
  latestInterviewTime?: string;
  latestInterviewStatus?: InterviewStatus;
  latestEvaluationStatus?: EvaluationStatus;
  communicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationTypeAlias = CommunicationType;
export type CommunicationDirectionAlias = CommunicationDirection;
export type OperatorRole = UserRoleType;

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
  interviewType: InterviewType;
  round: number;
  status: InterviewStatus;
  evaluationStatus: EvaluationStatus;
  evaluationDeadline: string;
  interviewerName: string;
  interviewerRole?: string;
  evaluations?: {
    id: string;
    overallScore?: number;
    recommendation?: RecommendationType;
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

export {
  COMMUNICATION_TYPE_OPTIONS,
  DIRECTION_OPTIONS,
  OPERATOR_ROLE_OPTIONS
};

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
