export interface ConflictCandidate {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
}

export interface ConflictInterviewer {
  name: string;
  email: string;
  role: string;
}

export interface ConflictInterview {
  id: string;
  candidateId: string;
  candidate: ConflictCandidate;
  interviewerId: string;
  interviewer: ConflictInterviewer;
  interviewTime: string;
  interviewType: 'phone' | 'video' | 'onsite' | 'final';
  round: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface ScheduleConflict {
  conflictKey: string;
  interviewerId: string;
  interviewer: ConflictInterviewer;
  conflictTime: string;
  interviews: ConflictInterview[];
  reminderCount?: number;
  checked?: boolean;
}

export interface ConflictQueryParams {
  keyword?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface ConflictStatistics {
  totalConflicts: number;
  pendingCount: number;
  todaySentCount: number;
  weekSentCount: number;
}

export interface ConflictHistoryItem {
  id: string;
  conflictKey: string;
  type: string;
  status: 'pending' | 'sent' | 'failed';
  channel: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  note?: string;
  errorMessage?: string;
}

export interface ConflictPaginatedResult {
  list: ScheduleConflict[];
  total: number;
  page: number;
  pageSize: number;
}
