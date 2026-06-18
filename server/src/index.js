require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const reminderRoutes = require('./routes/reminderRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const offerRoutes = require('./routes/offerRoutes');

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
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
    console.log(`   数据库地址: ${MONGODB_URI}`);
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err.message);
    console.log('\n💡 提示: 请确保 MongoDB 服务已启动');
    console.log('   如未安装 MongoDB，可使用 Homebrew 安装: brew install mongodb-community');
    console.log('   启动命令: brew services start mongodb-community');
    console.log('\n⚠️  没有 MongoDB 也可以启动，但接口将无法正常工作');
  }

  app.listen(PORT, () => {
    console.log('\n🚀 招聘面试管理系统后端服务已启动');
    console.log(`   服务地址: http://localhost:${PORT}`);
    console.log(`   API 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`   催办接口: http://localhost:${PORT}/api/reminders`);
    console.log(`   评价接口: http://localhost:${PORT}/api/evaluations`);
    console.log(`   Offer接口: http://localhost:${PORT}/api/offers`);
    console.log('\n📝 使用说明:');
    console.log('   1. 如需初始化测试数据: npm run seed');
    console.log('   2. 如未配置 SMTP，邮件将以模拟方式发送（在控制台输出）');
  });
}

startServer();
