const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('⚠️  SMTP 配置不完整，将使用模拟邮件发送模式');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendEvaluationReminderEmail(interviewer, candidate, interview) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '招聘管理系统 <noreply@example.com>',
    to: interviewer.email,
    subject: `【催办】请及时完成「${candidate.name}」的面试评价`,
    html: buildReminderEmailContent(interviewer, candidate, interview)
  };

  const smtpTransporter = createTransporter();

  if (!smtpTransporter) {
    console.log(`
==================== 模拟邮件发送 ====================
收件人: ${interviewer.name} <${interviewer.email}>
主题: ${mailOptions.subject}
----------------------------------------------------
${mailOptions.html.replace(/<[^>]*>/g, '')}
====================================================
    `);
    return { success: true, mock: true };
  }

  try {
    const info = await smtpTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

function buildReminderEmailContent(interviewer, candidate, interview) {
  const interviewTypeMap = {
    phone: '电话面试',
    video: '视频面试',
    onsite: '现场面试',
    final: '终面'
  };

  const deadline = new Date(interview.evaluationDeadline);
  const now = new Date();
  const isOverdue = deadline < now;
  const deadlineStr = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); padding: 24px; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">面试评价催办通知</h2>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: rgba(0,0,0,0.88);">
          您好，<strong>${interviewer.name}</strong>：
        </p>
        <div style="background: ${isOverdue ? '#fff2f0' : '#e6f4ff'}; border: 1px solid ${isOverdue ? '#ffccc7' : '#91caff'}; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; color: ${isOverdue ? '#cf1322' : '#0958d9'}; font-weight: 500;">
            ${isOverdue ? '⚠️ 您的面试评价已逾期，请尽快完成！' : '📢 请您及时完成面试评价'}
          </p>
        </div>
        <p style="margin: 0 0 12px; font-size: 14px; color: rgba(0,0,0,0.88);">
          候选人 <strong style="font-size: 16px;">${candidate.name}</strong> 的面试评价待您填写：
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px; background: #fafafa; border-radius: 6px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; width: 100px; color: rgba(0,0,0,0.45); font-size: 13px;">应聘岗位</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: rgba(0,0,0,0.88);">${candidate.position}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; width: 100px; color: rgba(0,0,0,0.45); font-size: 13px;">应聘部门</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: rgba(0,0,0,0.88);">${candidate.department}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; width: 100px; color: rgba(0,0,0,0.45); font-size: 13px;">面试类型</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: rgba(0,0,0,0.88);">${interviewTypeMap[interview.interviewType] || interview.interviewType} 第${interview.round}轮</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; width: 100px; color: rgba(0,0,0,0.45); font-size: 13px;">评价截止</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: ${isOverdue ? '#cf1322' : 'rgba(0,0,0,0.88)'};">${deadlineStr}${isOverdue ? '（已逾期）' : ''}</td>
          </tr>
        </table>
        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(0,0,0,0.88); font-weight: 500;">📝 请您完成以下操作：</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: rgba(0,0,0,0.65); line-height: 1.8;">
            <li>登录招聘面试管理系统</li>
            <li>进入「我的面试评价」页面</li>
            <li>找到候选人「${candidate.name}」并完成评价</li>
          </ol>
        </div>
        <p style="margin: 0; font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.6;">
          此邮件由系统自动发送，请勿直接回复。如有问题请联系 HR。<br />
          感谢您的配合，及时完成面试评价有助于高效推进招聘流程。
        </p>
      </div>
      <div style="text-align: center; padding: 16px; font-size: 12px; color: rgba(0,0,0,0.25);">
        © 2026 招聘面试管理系统
      </div>
    </div>
  `;
}

module.exports = {
  sendEvaluationReminderEmail
};
