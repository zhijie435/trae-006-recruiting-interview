# 招聘面试管理系统 - 评价Offer催办功能

基于 Angular 17 + Express + MongoDB 构建的招聘面试管理系统，核心功能为面试评价催办。

## 功能特性

- 📋 **催办列表**：展示所有待评价和已逾期的面试记录
- 🔍 **多维筛选**：支持关键词搜索、评价状态、部门、逾期天数筛选
- 📊 **数据统计**：待评价总数、已逾期数、今日/本周催办统计
- ✉️ **邮件催办**：单条发送 / 批量发送催办邮件
- 📜 **催办记录**：查看每条面试的历史催办记录
- 🎨 **精美 UI**：基于 Ant Design (ng-zorro-antd) 组件库

## 技术栈

### 前端
- Angular 17
- TypeScript 5.4
- ng-zorro-antd 17 (Ant Design Angular 版本)
- RxJS 7.8

### 后端
- Node.js
- Express 4.x
- MongoDB + Mongoose 8.x
- Nodemailer (邮件发送)

## 项目结构

```
.
├── client/                 # Angular 前端项目
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # 组件
│   │   │   │   └── reminder-list/
│   │   │   ├── models/           # 数据模型
│   │   │   ├── services/         # API 服务
│   │   │   ├── app.module.ts
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.component.ts
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
├── server/                 # Express 后端项目
│   ├── src/
│   │   ├── models/         # MongoDB 数据模型
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务服务
│   │   ├── index.js        # 服务入口
│   │   ├── seed.js         # 测试数据生成
│   │   └── seed.runner.js  # 数据初始化脚本
│   ├── package.json
│   ├── .env
│   └── .env.example
└── package.json            # 根目录配置
```

## 快速开始

### 环境要求

- Node.js >= 18.0
- MongoDB >= 6.0 (本地运行或使用 MongoDB Atlas)
- npm >= 9.0

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd ../server && npm install

# 或一键安装全部依赖 (在根目录执行)
npm run install:all
```

### 2. 启动 MongoDB

确保 MongoDB 服务已启动：

```bash
# macOS 使用 Homebrew 启动
brew services start mongodb-community

# 或手动启动
mongod --dbpath /data/db
```

### 3. 配置环境变量

编辑 `server/.env` 文件，填入 MongoDB 连接信息和 SMTP 邮件配置（可选）：

```bash
cd server
cp .env.example .env
```

**邮件配置说明**：如未配置 SMTP，系统将使用**模拟发送模式**，邮件内容会在后端控制台输出。

### 4. 初始化测试数据（可选但推荐）

```bash
cd server
npm run seed
```

成功后将生成：
- 8 名候选人
- 5 名面试官
- ~15 条面试记录（包含待评价和已逾期）
- 3 条催办记录

### 5. 启动服务

**方式一：分别启动**

```bash
# 启动后端 (终端 1)
cd server && npm run dev

# 启动前端 (终端 2)
cd client && npm start
```

**方式二：一键启动**

```bash
# 在根目录执行
npm start
```

### 6. 访问系统

- 前端地址：http://localhost:4200
- 后端地址：http://localhost:3000
- API 健康检查：http://localhost:3000/api/health

## API 接口

### 催办相关接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reminders` | 获取催办列表（支持分页、筛选） |
| GET | `/api/reminders/statistics` | 获取统计数据 |
| POST | `/api/reminders/send` | 发送单条催办 |
| POST | `/api/reminders/send-batch` | 批量发送催办 |
| GET | `/api/reminders/history/:interviewId` | 获取催办历史记录 |

### 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 关键词搜索（候选人/面试官姓名） |
| evaluationStatus | string | 评价状态：pending / overdue |
| department | string | 部门筛选 |
| overdueDays | number | 逾期天数筛选（1/3/7） |
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 10 |

### 请求示例

```bash
# 获取催办列表
curl "http://localhost:3000/api/reminders?page=1&pageSize=10&evaluationStatus=overdue"

# 获取统计数据
curl "http://localhost:3000/api/reminders/statistics"

# 发送单条催办
curl -X POST "http://localhost:3000/api/reminders/send" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "xxx", "note": "请尽快完成评价"}'

# 批量催办
curl -X POST "http://localhost:3000/api/reminders/send-batch" \
  -H "Content-Type: application/json" \
  -d '{"interviewIds": ["xxx", "yyy"]}'
```

## 功能说明

### 催办列表页面

页面包含以下核心区域：

1. **统计卡片**：展示待评价总数、已逾期数、今日催办数、本周催办数
2. **筛选工具栏**：
   - 关键词搜索（候选人或面试官姓名）
   - 评价状态（全部/待评价/已逾期）
   - 部门筛选（技术部/产品部/设计部/运营部）
   - 逾期天数（1天/3天/7天以上）
3. **批量操作栏**：选中多条记录后可批量催办
4. **数据表格**：
   - 候选人信息
   - 应聘岗位、部门
   - 面试官及邮箱
   - 面试轮次和类型
   - 面试时间、评价截止日期
   - 状态标签（待评价/已逾期，带逾期天数提示）
   - 催办次数
   - 操作列（查看催办记录、发送催办）

### 邮件催办

催办邮件包含以下信息：
- 面试官称呼
- 候选人姓名和应聘岗位
- 面试类型和轮次
- 评价截止日期（逾期会特别标注）
- 操作指引

**模拟模式**：未配置 SMTP 时，邮件内容会以格式化文本打印在后端控制台，方便调试。

## 常见问题

### Q: MongoDB 连接失败？
A: 请确认 MongoDB 服务是否启动。可执行 `brew services list` 查看服务状态。

### Q: 前端启动后看不到数据？
A: 请执行 `cd server && npm run seed` 初始化测试数据。

### Q: 邮件发送后对方没收到？
A: 
1. 检查是否配置了正确的 SMTP 信息
2. 未配置 SMTP 时会使用模拟模式，邮件会输出在后端控制台
3. 查看垃圾邮件文件夹

### Q: 如何修改催办邮件模板？
A: 编辑 `server/src/services/emailService.js` 中的 `buildReminderEmailContent` 函数。

## 开发说明

### 添加新的页面路由

1. 在 `client/src/app/components/` 下创建组件
2. 在 `client/src/app/app-routing.module.ts` 中配置路由
3. 在 `client/src/app/app.module.ts` 中声明组件

### 添加新的 API 接口

1. 在 `server/src/routes/` 下创建路由文件
2. 在 `server/src/services/` 下创建对应服务
3. 在 `server/src/index.js` 中注册路由

### 数据模型扩展

- 面试模型：`server/src/models/Interview.js`
- 催办模型：`server/src/models/Reminder.js`
- 候选人模型：`server/src/models/Candidate.js`
- 面试官模型：`server/src/models/Interviewer.js`

## License

MIT
