const Candidate = require('../models/Candidate');
const CandidateCommunication = require('../models/CandidateCommunication');
const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');
const Offer = require('../models/Offer');

async function getCandidateList(query) {
  const { keyword, department, page = 1, pageSize = 10 } = query;

  const matchStage = {};

  if (keyword) {
    matchStage.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
      { phone: { $regex: keyword, $options: 'i' } },
      { position: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (department) {
    matchStage.department = department;
  }

  const count = await Candidate.countDocuments(matchStage);
  const candidates = await Candidate.find(matchStage)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(pageSize))
    .limit(parseInt(pageSize));

  const list = await Promise.all(candidates.map(async (candidate) => {
    const interviews = await Interview.find({ candidateId: candidate._id });
    const latestInterview = interviews.length > 0
      ? interviews.sort((a, b) => new Date(b.interviewTime) - new Date(a.interviewTime))[0]
      : null;

    const communicationCount = await CandidateCommunication.countDocuments({ candidateId: candidate._id });

    return {
      id: candidate._id.toString(),
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position,
      department: candidate.department,
      interviewCount: interviews.length,
      latestInterviewTime: latestInterview?.interviewTime,
      latestInterviewStatus: latestInterview?.status,
      latestEvaluationStatus: latestInterview?.evaluationStatus,
      communicationCount,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt
    };
  }));

  return {
    list,
    total: count,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function getCandidateDetail(id) {
  const candidate = await Candidate.findById(id);
  if (!candidate) {
    throw new Error('候选人不存在');
  }

  const interviews = await Interview.find({ candidateId: id })
    .sort({ interviewTime: -1 });

  const evaluations = await Evaluation.find({ candidateId: id })
    .sort({ submittedAt: -1 });

  const offers = await Offer.find({ candidateName: candidate.name })
    .sort({ createdAt: -1 });

  const communications = await CandidateCommunication.find({ candidateId: id })
    .sort({ createdAt: -1 });

  const interviewList = interviews.map(interview => {
    const evals = evaluations.filter(e => e.interviewId.toString() === interview._id.toString());
    return {
      id: interview._id.toString(),
      interviewTime: interview.interviewTime,
      interviewType: interview.interviewType,
      round: interview.round,
      status: interview.status,
      evaluationStatus: interview.evaluationStatus,
      evaluationDeadline: interview.evaluationDeadline,
      interviewerName: interview.interviewer.name,
      interviewerRole: interview.interviewer.role,
      evaluations: evals.map(e => ({
        id: e._id.toString(),
        overallScore: e.overallScore,
        recommendation: e.recommendation,
        status: e.status,
        submittedAt: e.submittedAt
      }))
    };
  });

  return {
    id: candidate._id.toString(),
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    department: candidate.department,
    interviews: interviewList,
    offers: offers.map(o => ({
      id: o._id.toString(),
      status: o.status,
      salaryMonthly: o.salaryMonthly,
      entryDate: o.entryDate,
      createdAt: o.createdAt
    })),
    communications: communications.map(c => ({
      id: c._id.toString(),
      type: c.type,
      direction: c.direction,
      title: c.title,
      content: c.content,
      contactPerson: c.contactPerson,
      contactInfo: c.contactInfo,
      result: c.result,
      nextStep: c.nextStep,
      operator: c.operator,
      operatorRole: c.operatorRole,
      isImportant: c.isImportant,
      createdAt: c.createdAt
    })),
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt
  };
}

async function addCommunication(candidateId, data) {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new Error('候选人不存在');
  }

  const communication = await CandidateCommunication.create({
    candidateId,
    type: data.type,
    direction: data.direction || 'outbound',
    title: data.title,
    content: data.content,
    contactPerson: data.contactPerson,
    contactInfo: data.contactInfo,
    result: data.result,
    nextStep: data.nextStep,
    operator: data.operator,
    operatorRole: data.operatorRole || 'hr',
    relatedInterviewId: data.relatedInterviewId,
    isImportant: data.isImportant || false
  });

  return {
    id: communication._id.toString(),
    type: communication.type,
    direction: communication.direction,
    title: communication.title,
    content: communication.content,
    contactPerson: communication.contactPerson,
    contactInfo: communication.contactInfo,
    result: communication.result,
    nextStep: communication.nextStep,
    operator: communication.operator,
    operatorRole: communication.operatorRole,
    isImportant: communication.isImportant,
    createdAt: communication.createdAt
  };
}

async function getCommunications(candidateId, query = {}) {
  const { type, operatorRole, page = 1, pageSize = 20 } = query;

  const matchStage: any = { candidateId };
  if (type) matchStage.type = type;
  if (operatorRole) matchStage.operatorRole = operatorRole;

  const count = await CandidateCommunication.countDocuments(matchStage);
  const communications = await CandidateCommunication.find(matchStage)
    .sort({ createdAt: -1, isImportant: -1 })
    .skip((parseInt(page) - 1) * parseInt(pageSize))
    .limit(parseInt(pageSize));

  return {
    list: communications.map(c => ({
      id: c._id.toString(),
      type: c.type,
      direction: c.direction,
      title: c.title,
      content: c.content,
      contactPerson: c.contactPerson,
      contactInfo: c.contactInfo,
      result: c.result,
      nextStep: c.nextStep,
      operator: c.operator,
      operatorRole: c.operatorRole,
      isImportant: c.isImportant,
      createdAt: c.createdAt
    })),
    total: count,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function updateCommunication(communicationId, data) {
  const communication = await CandidateCommunication.findById(communicationId);
  if (!communication) {
    throw new Error('沟通记录不存在');
  }

  const allowedFields = ['type', 'direction', 'title', 'content', 'contactPerson', 'contactInfo', 'result', 'nextStep', 'isImportant'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      communication[field] = data[field];
    }
  });

  await communication.save();

  return {
    id: communication._id.toString(),
    type: communication.type,
    direction: communication.direction,
    title: communication.title,
    content: communication.content,
    contactPerson: communication.contactPerson,
    contactInfo: communication.contactInfo,
    result: communication.result,
    nextStep: communication.nextStep,
    operator: communication.operator,
    operatorRole: communication.operatorRole,
    isImportant: communication.isImportant,
    createdAt: communication.createdAt
  };
}

async function deleteCommunication(communicationId) {
  const result = await CandidateCommunication.findByIdAndDelete(communicationId);
  if (!result) {
    throw new Error('沟通记录不存在');
  }
  return { success: true };
}

async function getCandidateStatistics(candidateId) {
  const interviews = await Interview.find({ candidateId });
  const communications = await CandidateCommunication.find({ candidateId });
  const evaluations = await Evaluation.find({ candidateId });

  const interviewTypeCount: Record<string, number> = {};
  interviews.forEach(i => {
    interviewTypeCount[i.interviewType] = (interviewTypeCount[i.interviewType] || 0) + 1;
  });

  const communicationTypeCount: Record<string, number> = {};
  communications.forEach(c => {
    communicationTypeCount[c.type] = (communicationTypeCount[c.type] || 0) + 1;
  });

  const avgScore = evaluations.length > 0 && evaluations.some(e => e.overallScore)
    ? evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluations.filter(e => e.overallScore).length
    : null;

  return {
    interviewCount: interviews.length,
    communicationCount: communications.length,
    evaluationCount: evaluations.length,
    interviewTypeCount,
    communicationTypeCount,
    avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
    latestActivity: communications.length > 0 ? communications[0].createdAt : (interviews.length > 0 ? interviews[0].interviewTime : null)
  };
}

module.exports = {
  getCandidateList,
  getCandidateDetail,
  addCommunication,
  getCommunications,
  updateCommunication,
  deleteCommunication,
  getCandidateStatistics
};
