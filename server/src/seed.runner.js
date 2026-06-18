require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB 连接成功');
    const { seed } = require('./seed');
    await seed();
  })
  .catch(err => {
    console.error('❌ MongoDB 连接失败:', err.message);
    console.log('\n💡 提示: 请确保 MongoDB 服务已启动');
    console.log('   启动命令: mongod --dbpath /data/db');
    process.exit(1);
  });
