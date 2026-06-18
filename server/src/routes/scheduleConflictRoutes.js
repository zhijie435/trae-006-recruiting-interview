const express = require('express');
const router = express.Router();
const scheduleConflictService = require('../services/scheduleConflictService');

router.get('/', async (req, res) => {
  try {
    const result = await scheduleConflictService.getConflictList(req.query);
    res.json(result);
  } catch (error) {
    console.error('获取日程冲突列表失败:', error);
    res.status(500).json({ message: '获取日程冲突列表失败', error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const result = await scheduleConflictService.getConflictStatistics();
    res.json(result);
  } catch (error) {
    console.error('获取日程冲突统计数据失败:', error);
    res.status(500).json({ message: '获取日程冲突统计数据失败', error: error.message });
  }
});

router.get('/detect', async (req, res) => {
  try {
    const result = await scheduleConflictService.detectConflicts();
    res.json({ conflicts: result, count: result.length });
  } catch (error) {
    console.error('检测日程冲突失败:', error);
    res.status(500).json({ message: '检测日程冲突失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await scheduleConflictService.getConflictById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('获取日程冲突详情失败:', error);
    res.status(500).json({ message: error.message || '获取日程冲突详情失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await scheduleConflictService.createConflict(req.body);
    res.json(result);
  } catch (error) {
    console.error('创建日程冲突失败:', error);
    res.status(500).json({ message: '创建日程冲突失败', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await scheduleConflictService.updateConflict(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('更新日程冲突失败:', error);
    res.status(500).json({ message: error.message || '更新日程冲突失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await scheduleConflictService.deleteConflict(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('删除日程冲突失败:', error);
    res.status(500).json({ message: error.message || '删除日程冲突失败' });
  }
});

router.post('/:id/communications', async (req, res) => {
  try {
    const result = await scheduleConflictService.addCommunication(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('添加沟通记录失败:', error);
    res.status(500).json({ message: error.message || '添加沟通记录失败' });
  }
});

router.post('/:id/send-reminder', async (req, res) => {
  try {
    const { targets, note } = req.body;
    const result = await scheduleConflictService.sendReminder(req.params.id, targets, note);
    res.json(result);
  } catch (error) {
    console.error('发送催办失败:', error);
    res.status(500).json({ message: error.message || '发送催办失败' });
  }
});

module.exports = router;
