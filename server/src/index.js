require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const reminderRoutes = require('./routes/reminderRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const offerRoutes = require('./routes/offerRoutes');
const scheduleConflictRoutes = require('./routes/scheduleConflictRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '招聘面试管理系统 API 运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/reminders', reminderRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/schedule-conflicts', scheduleConflictRoutes);
app.use('/api/candidates', candidateRoutes);

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

async function startServer() {
  let connected = false;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
    console.log(`   数据库地址: ${MONGODB_URI}`);
    connected = true;
  } catch (err) {
    console.warn('⚠️  本地 MongoDB 连接失败，尝试启动内存数据库...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ 内存数据库启动成功');
      console.log(`   数据库地址: ${uri}`);
      connected = true;
    } catch (memErr) {
      console.error('❌ 内存数据库也启动失败:', memErr.message);
    }
  }

  if (connected) {
    const Candidate = require('./models/Candidate');
    const candidateCount = await Candidate.countDocuments();
    if (candidateCount === 0) {
      console.log('\n🌱 检测到数据库为空, 正在自动初始化测试数据...');
      const { seed } = require('./seed');
      await seed();
    } else {
      console.log(`   当前数据量: ${candidateCount} 名候选人`);
    }
  }

  app.listen(PORT, () => {
    console.log('\n🚀 招聘面试管理系统后端服务已启动');
    console.log(`   服务地址: http://localhost:${PORT}`);
    console.log(`   API 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`   催办接口: http://localhost:${PORT}/api/reminders`);
    console.log(`   评价接口: http://localhost:${PORT}/api/evaluations`);
    console.log(`   Offer接口: http://localhost:${PORT}/api/offers`);
    console.log(`   日程冲突接口: http://localhost:${PORT}/api/schedule-conflicts`);
    console.log(`   候选人接口: http://localhost:${PORT}/api/candidates`);
    console.log('\n📝 使用说明:');
    console.log('   1. 如需初始化测试数据: npm run seed');
    console.log('   2. 如未配置 SMTP，邮件将以模拟方式发送（在控制台输出）');
  });
}

startServer();
