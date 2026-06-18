const express = require('express');
const router = express.Router();
const evaluationService = require('../services/evaluationService');

router.get('/pending', async (req, res) => {
  try {
    const { interviewerId } = req.query;
    const result = await evaluationService.getInterviewerPendingList(interviewerId, req.query);
    res.json(result);
  } catch (error) {
    console.error('获取待评价列表失败:', error);
    res.status(500).json({ message: '获取待评价列表失败', error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const { interviewerId } = req.query;
    const result = await evaluationService.getInterviewerStatistics(interviewerId);
    res.json(result);
  } catch (error) {
    console.error('获取评价统计失败:', error);
    res.status(500).json({ message: '获取评价统计失败', error: error.message });
  }
});

router.get('/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) {
      return res.status(400).json({ message: '缺少 interviewId 参数' });
    }
    const result = await evaluationService.getEvaluation(interviewId);
    res.json(result);
  } catch (error) {
    console.error('获取评价详情失败:', error);
    res.status(500).json({ message: error.message || '获取评价详情失败' });
  }
});

router.put('/:interviewId/save', async (req, res) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) {
      return res.status(400).json({ message: '缺少 interviewId 参数' });
    }
    const result = await evaluationService.saveEvaluation(interviewId, req.body, false);
    res.json({
      ...result,
      message: '草稿已保存'
    });
  } catch (error) {
    console.error('保存评价草稿失败:', error);
    res.status(500).json({ message: error.message || '保存评价草稿失败' });
  }
});

router.put('/:interviewId/submit', async (req, res) => {
  try {
    const { interviewId } = req.params;
    if (!interviewId) {
      return res.status(400).json({ message: '缺少 interviewId 参数' });
    }
    const result = await evaluationService.saveEvaluation(interviewId, req.body, true);
    res.json({
      ...result,
      message: '评价已提交'
    });
  } catch (error) {
    console.error('提交评价失败:', error);
    res.status(500).json({ message: error.message || '提交评价失败' });
  }
});

module.exports = router;
