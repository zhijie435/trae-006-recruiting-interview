const express = require('express');
const router = express.Router();
const offerService = require('../services/offerService');

router.get('/', async (req, res) => {
  try {
    const result = await offerService.getOfferList(req.query);
    res.json(result);
  } catch (error) {
    console.error('获取 Offer 列表失败:', error);
    res.status(500).json({ message: '获取 Offer 列表失败', error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const result = await offerService.getOfferStatistics();
    res.json(result);
  } catch (error) {
    console.error('获取 Offer 统计失败:', error);
    res.status(500).json({ message: '获取统计失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await offerService.getOfferDetail(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('获取 Offer 详情失败:', error);
    res.status(404).json({ message: error.message || 'Offer 不存在' });
  }
});

router.post('/', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const result = await offerService.createOffer(req.body, operator);
    res.json(result);
  } catch (error) {
    console.error('创建 Offer 失败:', error);
    res.status(500).json({ message: error.message || '创建 Offer 失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const result = await offerService.updateOffer(req.params.id, req.body, operator);
    res.json(result);
  } catch (error) {
    console.error('更新 Offer 失败:', error);
    res.status(500).json({ message: error.message || '更新 Offer 失败' });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const comment = req.body.comment || '';
    const result = await offerService.submitOffer(req.params.id, operator, comment);
    res.json(result);
  } catch (error) {
    console.error('提交审批失败:', error);
    res.status(500).json({ message: error.message || '提交审批失败' });
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || '审批人';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'approve', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('审批通过失败:', error);
    res.status(500).json({ message: error.message || '审批失败' });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || '审批人';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'reject', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('驳回失败:', error);
    res.status(500).json({ message: error.message || '驳回失败' });
  }
});

router.post('/:id/rollback', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || '审批人';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'rollback', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('退回失败:', error);
    res.status(500).json({ message: error.message || '退回失败' });
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'send', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('发出 Offer 失败:', error);
    res.status(500).json({ message: error.message || '发出 Offer 失败' });
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'accept', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('标记接受失败:', error);
    res.status(500).json({ message: error.message || '标记接受失败' });
  }
});

router.post('/:id/decline', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'decline', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('标记拒绝失败:', error);
    res.status(500).json({ message: error.message || '标记拒绝失败' });
  }
});

router.post('/:id/withdraw', async (req, res) => {
  try {
    const operator = req.query.operator || req.body.operator || 'system';
    const comment = req.body.comment || '';
    const result = await offerService.transition(req.params.id, 'withdraw', operator, comment);
    res.json(result);
  } catch (error) {
    console.error('撤回失败:', error);
    res.status(500).json({ message: error.message || '撤回失败' });
  }
});

module.exports = router;
