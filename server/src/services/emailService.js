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

async function sendScheduleConflictEmail(target, conflict, note) {
  const roleMap = {
    interviewer: '面试官',
    candidate: '候选人',
    hr: 'HR'
  };

  const subject = target.role === 'candidate'
    ? `【面试安排调整】关于您的面试时间需要协调`
    : `【日程冲突提醒】请协助协调面试时间安排`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '招聘管理系统 <noreply@example.com>',
    to: target.email,
    subject,
    html: buildConflictEmailContent(target, conflict, note)
  };

  const smtpTransporter = createTransporter();

  if (!smtpTransporter) {
    console.log(`
==================== 模拟邮件发送 ====================
收件人: ${target.name} <${target.email}> (${roleMap[target.role] || target.role})
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

function buildConflictEmailContent(target, conflict, note) {
  const conflictTypeMap = {
    interviewer_schedule: '面试官日程冲突',
    candidate_schedule: '候选人人程冲突',
    room_conflict: '会议室占用冲突',
    multi_interview_conflict: '多面试安排冲突'
  };

  const roleMap = {
    interviewer: '面试官',
    candidate: '候选人',
    hr: 'HR同事'
  };

  const interviewsList = (conflict.interviews || []).map((it, idx) => {
    const time = new Date(it.interviewTime);
    const timeStr = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${idx + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${it.candidateName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${it.interviewerName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${timeStr}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${it.position || '-'}</td>
      </tr>
    `;
  }).join('');

  const isCandidate = target.role === 'candidate';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${isCandidate ? '#52c41a' : '#fa8c16'} 0%, ${isCandidate ? '#389e0d' : '#d46b08'} 100%); padding: 24px; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">${isCandidate ? '面试安排协调通知' : '面试日程冲突提醒'}</h2>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: rgba(0,0,0,0.88);">
          您好，<strong>${target.name}</strong>${roleMap[target.role] ? '（' + roleMap[target.role] + '）' : ''}：
        </p>
        <div style="background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; color: #d46b08; font-weight: 500;">
            ${isCandidate
              ? '📢 您好，您的面试安排需要调整，我们的HR同事将尽快与您联系确认新的时间'
              : '⚠️ 发现面试日程存在冲突，请您协助协调处理'}
          </p>
        </div>
        <div style="margin-bottom: 16px;">
          <div style="font-size: 14px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">冲突类型</div>
          <div style="font-size: 15px; color: rgba(0,0,0,0.88); font-weight: 500;">${conflictTypeMap[conflict.conflictType] || conflict.conflictType}</div>
        </div>
        <div style="margin-bottom: 16px;">
          <div style="font-size: 14px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">冲突说明</div>
          <div style="font-size: 15px; color: rgba(0,0,0,0.88);">${conflict.title}</div>
          ${conflict.description ? `<div style="font-size: 13px; color: rgba(0,0,0,0.65); margin-top: 4px;">${conflict.description}</div>` : ''}
        </div>
        <div style="margin-bottom: 16px;">
          <div style="font-size: 14px; color: rgba(0,0,0,0.45); margin-bottom: 8px;">涉及的面试安排</div>
          <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">序号</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">候选人</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">面试官</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">面试时间</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">岗位</th>
              </tr>
            </thead>
            <tbody>
              ${interviewsList}
            </tbody>
          </table>
        </div>
        ${note ? `
          <div style="background: #f0f5ff; border: 1px solid #adc6ff; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">HR备注</div>
            <div style="font-size: 14px; color: #1d39c4;">${note}</div>
          </div>
        ` : ''}
        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(0,0,0,0.88); font-weight: 500;">📋 请您配合以下操作：</p>
          ${isCandidate ? `
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: rgba(0,0,0,0.65); line-height: 1.8;">
              <li>请您保持电话畅通，HR将尽快与您联系确认新的面试时间</li>
              <li>如有特殊时间要求，请提前告知HR对接人</li>
              <li>确认新时间后，请准时参加面试</li>
            </ol>
          ` : `
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: rgba(0,0,0,0.65); line-height: 1.8;">
              <li>请查看上方冲突详情，确认您可参加的面试时间段</li>
              <li>请在收到邮件后2小时内回复HR，告知您方便的备选时间</li>
              <li>如需协调其他面试官，请直接联系HR对接人</li>
            </ol>
          `}
        </div>
        <p style="margin: 0; font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.6;">
          此邮件由系统自动发送，请您尽快回复HR确认。如有疑问请联系HR部门。<br />
          感谢您的配合，高效协调有助于顺利推进招聘流程。
        </p>
      </div>
      <div style="text-align: center; padding: 16px; font-size: 12px; color: rgba(0,0,0,0.25);">
        © 2026 招聘面试管理系统
      </div>
    </div>
  `;
}

function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function sendConflictReminderEmail(conflict, note) {
  const interviewer = conflict.interviewer;
  const mailOptions = {
    from: process.env.SMTP_FROM || '招聘管理系统 <noreply@example.com>',
    to: interviewer.email,
    subject: `【日程冲突】您的面试安排存在时间重叠，请尽快协调`,
    html: buildConflictReminderEmailContent(conflict, note)
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

function buildConflictReminderEmailContent(conflict, note) {
  const interviewTypeMap = {
    phone: '电话面试',
    video: '视频面试',
    onsite: '现场面试',
    final: '终面'
  };

  const interviewsList = (conflict.interviews || []).map((it, idx) => {
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${idx + 1}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88); font-weight: 500;">${it.candidate.name}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${it.candidate.position}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: rgba(0,0,0,0.88);">${interviewTypeMap[it.interviewType] || it.interviewType} 第${it.round}轮</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #d46b08; font-weight: 500;">${formatDateTime(it.interviewTime)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%); padding: 24px; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">面试日程冲突提醒</h2>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: rgba(0,0,0,0.88);">
          您好，<strong>${conflict.interviewer.name}</strong>：
        </p>
        <div style="background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; color: #d46b08; font-weight: 500;">
            ⚠️ 系统检测到您在 <strong>${formatDateTime(conflict.conflictTime)}</strong> 前后有 ${conflict.interviews.length} 场面试时间重叠，请尽快与HR协调处理
          </p>
        </div>
        <p style="margin: 0 0 12px; font-size: 14px; color: rgba(0,0,0,0.88);">
          以下是存在时间冲突的面试安排：
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px; background: #fafafa; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">序号</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">候选人</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">岗位</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">面试类型</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: rgba(0,0,0,0.45); font-weight: 500;">面试时间</th>
            </tr>
          </thead>
          <tbody>
            ${interviewsList}
          </tbody>
        </table>
        ${note ? `
          <div style="background: #f0f5ff; border: 1px solid #adc6ff; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px;">HR备注</div>
            <div style="font-size: 14px; color: #1d39c4;">${note}</div>
          </div>
        ` : ''}
        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(0,0,0,0.88); font-weight: 500;">📋 请您配合以下操作：</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: rgba(0,0,0,0.65); line-height: 1.8;">
            <li>查看上方冲突面试列表，确认您可参加的时间段</li>
            <li>请在收到邮件后尽快回复HR，告知您方便的备选时间</li>
            <li>如需协调其他面试官代替，请直接联系HR对接人</li>
          </ol>
        </div>
        <p style="margin: 0; font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.6;">
          此邮件由系统自动发送，请勿直接回复。如有问题请联系HR。<br />
          感谢您的配合，及时协调有助于顺利推进招聘流程。
        </p>
      </div>
      <div style="text-align: center; padding: 16px; font-size: 12px; color: rgba(0,0,0,0.25);">
        © 2026 招聘面试管理系统
      </div>
    </div>
  `;
}

module.exports = {
  sendEvaluationReminderEmail,
  sendScheduleConflictEmail,
  sendConflictReminderEmail
};
