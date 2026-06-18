const express = require('express');
const router = express.Router();
const candidateService = require('../services/candidateService');

router.get('/', async (req, res) => {
  try {
    const result = await candidateService.getCandidateList(req.query);
    res.json(result);
  } catch (error) {
    console.error('获取候选人列表失败:', error);
    res.status(500).json({ message: '获取候选人列表失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await candidateService.getCandidateDetail(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('获取候选人详情失败:', error);
    res.status(500).json({ message: error.message || '获取候选人详情失败' });
  }
});

router.get('/:id/statistics', async (req, res) => {
  try {
    const result = await candidateService.getCandidateStatistics(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('获取候选人统计数据失败:', error);
    res.status(500).json({ message: '获取候选人统计数据失败', error: error.message });
  }
});

router.get('/:id/communications', async (req, res) => {
  try {
    const result = await candidateService.getCommunications(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    console.error('获取沟通记录失败:', error);
    res.status(500).json({ message: '获取沟通记录失败', error: error.message });
  }
});

router.post('/:id/communications', async (req, res) => {
  try {
    const result = await candidateService.addCommunication(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('添加沟通记录失败:', error);
    res.status(500).json({ message: error.message || '添加沟通记录失败' });
  }
});

router.put('/communications/:commId', async (req, res) => {
  try {
    const result = await candidateService.updateCommunication(req.params.commId, req.body);
    res.json(result);
  } catch (error) {
    console.error('更新沟通记录失败:', error);
    res.status(500).json({ message: error.message || '更新沟通记录失败' });
  }
});

router.delete('/communications/:commId', async (req, res) => {
  try {
    const result = await candidateService.deleteCommunication(req.params.commId);
    res.json(result);
  } catch (error) {
    console.error('删除沟通记录失败:', error);
    res.status(500).json({ message: error.message || '删除沟通记录失败' });
  }
});

module.exports = router;
