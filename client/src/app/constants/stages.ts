// ============================================
// 候选人招聘流程阶段枚举
// ============================================

export enum CandidateStage {
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  EVALUATION = 'evaluation',
  OFFER = 'offer',
  ONBOARDING = 'onboarding',
  CLOSED = 'closed'
}

export const CANDIDATE_STAGE_OPTIONS: Array<{ value: CandidateStage; label: string; color: string }> = [
  { value: CandidateStage.SCREENING, label: '简历筛选', color: 'default' },
  { value: CandidateStage.INTERVIEW, label: '面试阶段', color: 'blue' },
  { value: CandidateStage.EVALUATION, label: '评价阶段', color: 'purple' },
  { value: CandidateStage.OFFER, label: 'Offer 阶段', color: 'cyan' },
  { value: CandidateStage.ONBOARDING, label: '待入职', color: 'green' },
  { value: CandidateStage.CLOSED, label: '已结束', color: 'default' }
];

// ============================================
// 面试类型枚举
// ============================================

export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
  FINAL = 'final'
}

export const INTERVIEW_TYPE_MAP: Record<InterviewType, string> = {
  [InterviewType.PHONE]: '电话面',
  [InterviewType.VIDEO]: '视频面',
  [InterviewType.ONSITE]: '现场面',
  [InterviewType.FINAL]: '终面'
};

export const INTERVIEW_TYPE_OPTIONS: Array<{ value: InterviewType; label: string; color: string }> = [
  { value: InterviewType.PHONE, label: '电话面', color: 'green' },
  { value: InterviewType.VIDEO, label: '视频面', color: 'blue' },
  { value: InterviewType.ONSITE, label: '现场面', color: 'cyan' },
  { value: InterviewType.FINAL, label: '终面', color: 'purple' }
];

// ============================================
// 面试状态枚举
// ============================================

export enum InterviewStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export const INTERVIEW_STATUS_MAP: Record<InterviewStatus, { label: string; color: string }> = {
  [InterviewStatus.PENDING]: { label: '待面试', color: 'blue' },
  [InterviewStatus.COMPLETED]: { label: '已完成', color: 'green' },
  [InterviewStatus.CANCELLED]: { label: '已取消', color: 'default' }
};

// ============================================
// 评价状态枚举
// ============================================

export enum EvaluationStatus {
  PENDING = 'pending',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  OVERDUE = 'overdue'
}

export const EVALUATION_STATUS_MAP: Record<EvaluationStatus, { label: string; color: string }> = {
  [EvaluationStatus.PENDING]: { label: '待评价', color: 'gold' },
  [EvaluationStatus.DRAFT]: { label: '草稿中', color: 'blue' },
  [EvaluationStatus.SUBMITTED]: { label: '已评价', color: 'green' },
  [EvaluationStatus.OVERDUE]: { label: '已逾期', color: 'red' }
};

// ============================================
// 录用建议枚举
// ============================================

export enum RecommendationType {
  STRONG_HIRE = 'strong_hire',
  HIRE = 'hire',
  BORDERLINE = 'borderline',
  NO_HIRE = 'no_hire',
  PENDING = 'pending'
}

export const RECOMMENDATION_MAP: Record<RecommendationType, string> = {
  [RecommendationType.STRONG_HIRE]: '强烈推荐',
  [RecommendationType.HIRE]: '推荐',
  [RecommendationType.BORDERLINE]: '待定',
  [RecommendationType.NO_HIRE]: '不推荐',
  [RecommendationType.PENDING]: '待评估'
};

export const RECOMMENDATION_CLASS_MAP: Record<RecommendationType, string> = {
  [RecommendationType.STRONG_HIRE]: 'recommend-strong',
  [RecommendationType.HIRE]: 'recommend-hire',
  [RecommendationType.BORDERLINE]: 'recommend-borderline',
  [RecommendationType.NO_HIRE]: 'recommend-nohire',
  [RecommendationType.PENDING]: 'recommend-pending'
};

export const RECOMMENDATION_OPTIONS: Array<{ value: RecommendationType; label: string }> = [
  { value: RecommendationType.STRONG_HIRE, label: '强烈推荐录用' },
  { value: RecommendationType.HIRE, label: '建议录用' },
  { value: RecommendationType.BORDERLINE, label: '待定考虑' },
  { value: RecommendationType.NO_HIRE, label: '不建议录用' },
  { value: RecommendationType.PENDING, label: '待决定' }
];

// ============================================
// 评价维度枚举
// ============================================

export interface ScoreDimensionMeta {
  code: string;
  name: string;
}

export const DEFAULT_DIMENSIONS: ScoreDimensionMeta[] = [
  { code: 'technical_skill', name: '专业技能' },
  { code: 'problem_solving', name: '问题解决能力' },
  { code: 'communication', name: '沟通表达' },
  { code: 'teamwork', name: '团队协作' },
  { code: 'learning_ability', name: '学习能力' },
  { code: 'cultural_fit', name: '文化匹配' }
];

// ============================================
// Offer 状态枚举
// ============================================

export enum OfferStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn'
}

export const OFFER_STATUS_MAP: Record<OfferStatus, { label: string; color: string }> = {
  [OfferStatus.DRAFT]: { label: '草稿', color: 'default' },
  [OfferStatus.PENDING_APPROVAL]: { label: '审批中', color: 'gold' },
  [OfferStatus.APPROVED]: { label: '审批通过', color: 'green' },
  [OfferStatus.REJECTED]: { label: '审批驳回', color: 'red' },
  [OfferStatus.SENT]: { label: '已发出', color: 'blue' },
  [OfferStatus.ACCEPTED]: { label: '已接受', color: 'green' },
  [OfferStatus.DECLINED]: { label: '候选人拒绝', color: 'orange' },
  [OfferStatus.WITHDRAWN]: { label: '已撤回', color: 'default' }
};

export const OFFER_STATUS_OPTIONS: Array<{ label: string; value: OfferStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '草稿', value: OfferStatus.DRAFT },
  { label: '审批中', value: OfferStatus.PENDING_APPROVAL },
  { label: '审批通过', value: OfferStatus.APPROVED },
  { label: '审批驳回', value: OfferStatus.REJECTED },
  { label: '已发出', value: OfferStatus.SENT },
  { label: '候选人接受', value: OfferStatus.ACCEPTED },
  { label: '候选人拒绝', value: OfferStatus.DECLINED },
  { label: '已撤回', value: OfferStatus.WITHDRAWN }
];

// ============================================
// Offer 审批动作枚举
// ============================================

export enum OfferAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  ROLLBACK = 'rollback',
  SEND = 'send',
  ACCEPT = 'accept',
  DECLINE = 'decline',
  WITHDRAW = 'withdraw',
  EDIT = 'edit'
}

export enum ApprovalAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  WITHDRAW = 'withdraw',
  RESUBMIT = 'resubmit',
  SEND = 'send',
  ACCEPT = 'accept',
  DECLINE = 'decline'
}

// ============================================
// 沟通记录枚举
// ============================================

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  ONSITE = 'onsite',
  VIDEO = 'video',
  NOTE = 'note',
  SYSTEM = 'system'
}

export const COMMUNICATION_TYPE_OPTIONS: Array<{ value: CommunicationType; label: string; color: string; icon: string }> = [
  { value: CommunicationType.EMAIL, label: '邮件', color: 'blue', icon: 'mail' },
  { value: CommunicationType.PHONE, label: '电话', color: 'green', icon: 'phone' },
  { value: CommunicationType.ONSITE, label: '现场', color: 'purple', icon: 'home' },
  { value: CommunicationType.VIDEO, label: '视频', color: 'cyan', icon: 'video-camera' },
  { value: CommunicationType.NOTE, label: '备注', color: 'orange', icon: 'file-text' },
  { value: CommunicationType.SYSTEM, label: '系统', color: 'default', icon: 'setting' }
];

export enum CommunicationDirection {
  OUTBOUND = 'outbound',
  INBOUND = 'inbound',
  INTERNAL = 'internal'
}

export const DIRECTION_OPTIONS: Array<{ value: CommunicationDirection; label: string; color: string }> = [
  { value: CommunicationDirection.OUTBOUND, label: '主动联系', color: 'blue' },
  { value: CommunicationDirection.INBOUND, label: '候选人来电', color: 'green' },
  { value: CommunicationDirection.INTERNAL, label: '内部沟通', color: 'orange' }
];

// ============================================
// 录用形式枚举
// ============================================

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern'
}

export const EMPLOYMENT_TYPE_OPTIONS: Array<{ label: string; value: EmploymentType }> = [
  { label: '全职', value: EmploymentType.FULL_TIME },
  { label: '兼职', value: EmploymentType.PART_TIME },
  { label: '外包', value: EmploymentType.CONTRACT },
  { label: '实习', value: EmploymentType.INTERN }
];

// ============================================
// 催办相关枚举
// ============================================

export enum ReminderType {
  EVALUATION = 'evaluation'
}

export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

export enum ReminderChannel {
  EMAIL = 'email'
}
