import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS) 
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.resend.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : null;

  static async sendMeetingSummary(to: string, meetingTitle: string, summary: string, meetingId: string) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/meetings/${meetingId}`;
    
    if (!this.transporter) {
      console.log('📝 [Email Mock] No credentials found. Logging email content:');
      console.log(`   To: ${to}`);
      console.log(`   Subject: Intelligence Ready: ${meetingTitle}`);
      console.log(`   Summary: ${summary}`);
      console.log(`   URL: ${dashboardUrl}`);
      return { messageId: 'mock-id-' + Date.now() };
    }
    const mailOptions = {
      from: 'onboarding@resend.dev',
      to,
      subject: `Intelligence Ready: ${meetingTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h1 style="color: #1e1b4b; font-size: 24px; margin-bottom: 16px;">Meeting Intelligence Ready</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Your meeting <strong>"${meetingTitle}"</strong> has been successfully analyzed. Here is a brief summary:</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="color: #334155; font-size: 14px; margin: 0; font-style: italic;">"${summary}"</p>
          </div>

          <p style="color: #475569; font-size: 16px; line-height: 1.5;">You can view the full transcript, action items, and decisions on your dashboard.</p>
          
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Full Report</a>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Sent by MeetingMind Premium Intelligence Platform</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 [Email] Summary sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ [Email] Failed to send summary:', error);
      // Don't throw, we don't want to crash the processing pipeline if email fails
    }
  }
}
