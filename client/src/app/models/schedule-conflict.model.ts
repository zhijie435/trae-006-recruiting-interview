export type ConflictType = 'interviewer_schedule' | 'candidate_schedule' | 'room_conflict' | 'multi_interview_conflict';

export type ConflictStatus = 'pending' | 'communicating' | 'resolved' | 'cancelled';

export type ConflictPriority = 'high' | 'medium' | 'low';

export type CommunicationType = 'note' | 'email_sent' | 'call' | 'meeting';

export interface ConflictInterview {
  interviewId?: string;
  candidateName: string;
  candidateEmail?: string;
  interviewerName: string;
  interviewerEmail?: string;
  interviewTime: string;
  interviewType?: 'phone' | 'video' | 'onsite' | 'final';
  round?: number;
  position?: string;
  department?: string;
}

export interface CommunicationRecord {
  id?: string;
  type: CommunicationType;
  content: string;
  operator: string;
  target?: string;
  createdAt: string;
}

export interface ScheduleConflict {
  id: string;
  conflictType: ConflictType;
  status: ConflictStatus;
  priority: ConflictPriority;
  title: string;
  description?: string;
  interviews: ConflictInterview[];
  roomName?: string;
  assignee: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  communications: CommunicationRecord[];
  reminderCount: number;
  lastReminderAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  checked?: boolean;
}

export interface ScheduleConflictQueryParams {
  keyword?: string;
  conflictType?: ConflictType | '';
  status?: ConflictStatus | '';
  priority?: ConflictPriority | '';
  assignee?: string;
  page?: number;
  pageSize?: number;
}

export interface ScheduleConflictStatistics {
  totalCount: number;
  pendingCount: number;
  communicatingCount: number;
  resolvedCount: number;
  highPriorityCount: number;
  todayNewCount: number;
}

export interface SendReminderTarget {
  name: string;
  email: string;
  role: 'interviewer' | 'candidate' | 'hr';
}

export interface ConflictOption {
  value: string;
  label: string;
  color?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
