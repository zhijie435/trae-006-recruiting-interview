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
  interviewType: 'phone' | 'onsite' | 'video' | 'final';
  round: number;
  status: 'pending' | 'completed' | 'cancelled';
  evaluationDeadline: string;
  evaluationStatus: 'pending' | 'submitted' | 'overdue';
}

export interface Reminder {
  id: string;
  interviewId: string;
  interview: Interview;
  type: 'evaluation';
  status: 'pending' | 'sent' | 'failed';
  channel: 'email';
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  note?: string;
}

export interface ReminderQueryParams {
  keyword?: string;
  evaluationStatus?: string;
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
