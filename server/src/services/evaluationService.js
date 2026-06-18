const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');

const DEFAULT_DIMENSIONS = [
  { code: 'technical_skill', name: '专业技能', score: 5, comment: '' },
  { code: 'problem_solving', name: '问题解决能力', score: 5, comment: '' },
  { code: 'communication', name: '沟通表达', score: 5, comment: '' },
  { code: 'teamwork', name: '团队协作', score: 5, comment: '' },
  { code: 'learning_ability', name: '学习能力', score: 5, comment: '' },
  { code: 'cultural_fit', name: '文化匹配', score: 5, comment: '' }
];

const RECOMMENDATION_MAP = {
  strong_hire: '强烈推荐录用',
  hire: '建议录用',
  borderline: '待定考虑',
  no_hire: '不建议录用',
  pending: '待决定'
};

async function getInterviewerPendingList(interviewerId, query = {}) {
  const { keyword, status, page = 1, pageSize = 10 } = query;

  const matchStage = {};

  if (interviewerId) {
    matchStage.interviewerId = new mongoose.Types.ObjectId(interviewerId);
  }

  matchStage.status = 'completed';

  if (status === 'pending') {
    matchStage.evaluationStatus = { $in: ['pending', 'overdue'] };
  } else if (status === 'submitted') {
    matchStage.evaluationStatus = 'submitted';
  } else {
    matchStage.evaluationStatus = { $in: ['pending', 'overdue', 'submitted'] };
  }

  if (keyword) {
    matchStage.$or = [
      { 'candidate.name': { $regex: keyword, $options: 'i' } },
      { 'candidate.position': { $regex: keyword, $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { evaluationDeadline: 1 } },
    {
      $lookup: {
        from: 'evaluations',
        localField: '_id',
        foreignField: 'interviewId',
        as: 'evaluation'
      }
    },
    {
      $addFields: {
        evaluationData: { $arrayElemAt: ['$evaluation', 0] }
      }
    },
    { $project: { evaluation: 0 } }
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Interview.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(pageSize) });
  pipeline.push({ $limit: parseInt(pageSize) });

  const interviews = await Interview.aggregate(pipeline);

  const now = new Date();
  const list = interviews.map(interview => {
    const deadline = new Date(interview.evaluationDeadline);
    let evalStatus = interview.evaluationStatus;
    if (deadline < now && interview.evaluationStatus === 'pending') {
      evalStatus = 'overdue';
    }
    if (interview.evaluationData) {
      evalStatus = interview.evaluationData.status === 'submitted' ? 'submitted' : 'draft';
    }

    const overdueDays = deadline < now
      ? Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: interview._id.toString(),
      candidate: interview.candidate,
      interviewer: interview.interviewer,
      interviewTime: interview.interviewTime,
      interviewType: interview.interviewType,
      round: interview.round,
      evaluationDeadline: interview.evaluationDeadline,
      evaluationStatus: evalStatus,
      overdueDays,
      hasEvaluation: !!interview.evaluationData,
      evaluationStatusText: interview.evaluationData?.status || null,
      overallScore: interview.evaluationData?.overallScore || null,
      recommendation: interview.evaluationData?.recommendation || null,
      recommendationText: interview.evaluationData?.recommendation
        ? RECOMMENDATION_MAP[interview.evaluationData.recommendation]
        : null
    };
  });

  return {
    list,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function getEvaluation(interviewId) {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('面试记录不存在');
  }

  let evaluation = await Evaluation.findOne({ interviewId });

  const isNew = !evaluation;
  if (!evaluation) {
    evaluation = {
      interviewId: interview._id,
      interviewerId: interview.interviewerId,
      candidateId: interview.candidateId,
      dimensions: DEFAULT_DIMENSIONS.map(d => ({ ...d })),
      overallScore: null,
      recommendation: 'pending',
      strengths: '',
      weaknesses: '',
      summary: '',
      additionalNotes: '',
      status: 'draft',
      isNew: true
    };
  } else {
    evaluation = evaluation.toObject();
    evaluation.isNew = false;

    if (!evaluation.dimensions || evaluation.dimensions.length === 0) {
      evaluation.dimensions = DEFAULT_DIMENSIONS.map(d => ({ ...d }));
    } else {
      const existingCodes = evaluation.dimensions.map(d => d.code);
      DEFAULT_DIMENSIONS.forEach(defaultDim => {
        if (!existingCodes.includes(defaultDim.code)) {
          evaluation.dimensions.push({ ...defaultDim });
        }
      });
    }
  }

  return {
    evaluation,
    interview: {
      id: interview._id.toString(),
      candidate: interview.candidate,
      interviewer: interview.interviewer,
      interviewTime: interview.interviewTime,
      interviewType: interview.interviewType,
      round: interview.round,
      evaluationDeadline: interview.evaluationDeadline
    },
    dimensionsMeta: DEFAULT_DIMENSIONS.map(d => ({ code: d.code, name: d.name })),
    recommendationOptions: Object.entries(RECOMMENDATION_MAP).map(([value, label]) => ({ value, label }))
  };
}

async function saveEvaluation(interviewId, data, submit = false) {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('面试记录不存在');
  }

  if (interview.evaluationStatus === 'submitted' && submit) {
    throw new Error('该评价已提交，不可重复提交');
  }

  let evaluation = await Evaluation.findOne({ interviewId });
  const isNew = !evaluation;

  const updateData = {
    dimensions: data.dimensions || [],
    strengths: data.strengths || '',
    weaknesses: data.weaknesses || '',
    summary: data.summary || '',
    additionalNotes: data.additionalNotes || '',
    updatedBy: 'interviewer'
  };

  if (updateData.dimensions.length > 0) {
    const validScores = updateData.dimensions
      .map(d => d.score)
      .filter(s => typeof s === 'number' && s >= 1 && s <= 10);
    if (validScores.length > 0) {
      updateData.overallScore = Math.round(
        validScores.reduce((a, b) => a + b, 0) / validScores.length * 10
      ) / 10;
    }
  }

  if (data.recommendation) {
    updateData.recommendation = data.recommendation;
  }

  if (submit) {
    if (!updateData.summary || updateData.summary.trim().length < 10) {
      throw new Error('请填写综合评价（至少10个字）');
    }
    if (!updateData.overallScore) {
      throw new Error('请完成各维度评分');
    }
    if (!updateData.recommendation || updateData.recommendation === 'pending') {
      throw new Error('请选择录用建议');
    }
    updateData.status = 'submitted';
    updateData.submittedAt = new Date();
  }

  if (isNew) {
    evaluation = await Evaluation.create({
      interviewId: interview._id,
      interviewerId: interview.interviewerId,
      candidateId: interview.candidateId,
      ...updateData,
      status: submit ? 'submitted' : 'draft',
      submittedAt: submit ? updateData.submittedAt : null,
      createdBy: 'interviewer'
    });
  } else {
    evaluation = await Evaluation.findByIdAndUpdate(
      evaluation._id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  if (submit) {
    await Interview.findByIdAndUpdate(interviewId, {
      evaluationStatus: 'submitted'
    });
  }

  return {
    id: evaluation._id.toString(),
    interviewId: evaluation.interviewId.toString(),
    status: evaluation.status,
    overallScore: evaluation.overallScore,
    recommendation: evaluation.recommendation,
    submittedAt: evaluation.submittedAt,
    isNew
  };
}

async function submitEvaluation(interviewId, data) {
  return saveEvaluation(interviewId, data, true);
}

async function getInterviewerStatistics(interviewerId) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const baseQuery = interviewerId
    ? { interviewerId: new mongoose.Types.ObjectId(interviewerId) }
    : {};

  const pendingQuery = {
    ...baseQuery,
    status: 'completed',
    evaluationStatus: { $in: ['pending', 'overdue'] }
  };

  const overdueQuery = {
    ...pendingQuery,
    evaluationDeadline: { $lt: now }
  };

  const totalPending = await Interview.countDocuments(pendingQuery);
  const overdueCount = await Interview.countDocuments(overdueQuery);

  const submittedQuery = interviewerId
    ? { interviewerId: new mongoose.Types.ObjectId(interviewerId), status: 'submitted' }
    : { status: 'submitted' };

  const todaySubmitted = await Evaluation.countDocuments({
    ...submittedQuery,
    submittedAt: { $gte: startOfToday }
  });

  const weekSubmitted = await Evaluation.countDocuments({
    ...submittedQuery,
    submittedAt: { $gte: startOfWeek }
  });

  const totalSubmitted = await Evaluation.countDocuments(submittedQuery);

  return {
    totalPending,
    overdueCount,
    todaySubmitted,
    weekSubmitted,
    totalSubmitted
  };
}

module.exports = {
  getInterviewerPendingList,
  getEvaluation,
  saveEvaluation,
  submitEvaluation,
  getInterviewerStatistics,
  DEFAULT_DIMENSIONS,
  RECOMMENDATION_MAP
};
