const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const testEmail = async () => {
  console.log('[Email Test] Starting live delivery test via Resend...');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.resend.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'onboarding@resend.dev',
    to: 'ovais7771@gmail.com',
    subject: 'MeetingMind Infrastructure Test',
    text: 'If you are reading this, your Resend SMTP configuration is working correctly! Background jobs can now send live reports.',
    html: '<b>Success!</b> Your MeetingMind platform is now connected to live email delivery.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Test] Success! Message sent:', info.messageId);
    console.log('[Email Test] Check your inbox at ovais7771@gmail.com');
  } catch (error: any) {
    console.error('[Email Test] Delivery failed:', error.message);
    if (error.message && error.message.includes('421')) {
      console.log('[Insight] This usually means your Resend API key is invalid or your domain is not verified.');
    }
  }
};

testEmail();
