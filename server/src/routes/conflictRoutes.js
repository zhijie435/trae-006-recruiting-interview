const express = require('express');
const router = express.Router();
const conflictService = require('../services/conflictService');

router.get('/', async (req, res) => {
  try {
    const result = await conflictService.getConflictList(req.query);
    res.json(result);
  } catch (error) {
    console.error('获取冲突列表失败:', error);
    res.status(500).json({ message: '获取冲突列表失败', error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const result = await conflictService.getConflictStatistics();
    res.json(result);
  } catch (error) {
    console.error('获取冲突统计失败:', error);
    res.status(500).json({ message: '获取冲突统计失败', error: error.message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { conflictKey, note } = req.body;
    if (!conflictKey) {
      return res.status(400).json({ message: '缺少 conflictKey 参数' });
    }
    const result = await conflictService.sendConflictReminder(conflictKey, note);
    res.json(result);
  } catch (error) {
    console.error('发送冲突催办失败:', error);
    res.status(500).json({ message: error.message || '发送冲突催办失败' });
  }
});

router.post('/send-batch', async (req, res) => {
  try {
    const { conflictKeys, note } = req.body;
    if (!conflictKeys || !Array.isArray(conflictKeys) || conflictKeys.length === 0) {
      return res.status(400).json({ message: '请选择要催办的冲突记录' });
    }
    const result = await conflictService.sendBatchConflictReminders(conflictKeys, note);
    res.json(result);
  } catch (error) {
    console.error('批量冲突催办失败:', error);
    res.status(500).json({ message: '批量冲突催办失败', error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { conflictKey } = req.query;
    if (!conflictKey) {
      return res.status(400).json({ message: '缺少 conflictKey 参数' });
    }
    const result = await conflictService.getConflictHistory(conflictKey);
    res.json(result);
  } catch (error) {
    console.error('获取冲突催办记录失败:', error);
    res.status(500).json({ message: '获取冲突催办记录失败', error: error.message });
  }
});

module.exports = router;
