const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');

router.get('/', async (req, res) => {
  try {
    const result = await reminderService.getReminderList(req.query);
    res.json(result);
  } catch (error) {
    console.error('获取催办列表失败:', error);
    res.status(500).json({ message: '获取催办列表失败', error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const result = await reminderService.getStatistics();
    res.json(result);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ message: '获取统计数据失败', error: error.message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { interviewId, note } = req.body;
    if (!interviewId) {
      return res.status(400).json({ message: '缺少 interviewId 参数' });
    }
    const result = await reminderService.sendReminder(interviewId, note);
    res.json(result);
  } catch (error) {
    console.error('发送催办失败:', error);
    res.status(500).json({ message: error.message || '发送催办失败' });
  }
});

router.post('/send-batch', async (req, res) => {
  try {
    const { interviewIds, note } = req.body;
    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return res.status(400).json({ message: '请选择要催办的面试记录' });
    }
    const result = await reminderService.sendBatchReminders(interviewIds, note);
    res.json(result);
  } catch (error) {
    console.error('批量催办失败:', error);
    res.status(500).json({ message: '批量催办失败', error: error.message });
  }
});

router.get('/history/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const result = await reminderService.getReminderHistory(interviewId);
    res.json(result);
  } catch (error) {
    console.error('获取催办记录失败:', error);
    res.status(500).json({ message: '获取催办记录失败', error: error.message });
  }
});

module.exports = router;
