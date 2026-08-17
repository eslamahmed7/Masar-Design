import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP variables are not defined. Email sending skipped.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"مسار" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function getPromotionEmailTemplate(title: string, description: string, value: string, code: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1a1a1a; margin: 0;">مسار</h1>
        <p style="color: #666; margin: 5px 0 0 0;">مساحتك الخاصة، بتصميم يليق بك</p>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #2c3e50; text-align: center; margin-top: 0;">${title}</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
          ${description}
        </p>
        <div style="background-color: #1a1a1a; color: #ffffff; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">قيمة الخصم</p>
          <div style="font-size: 36px; font-weight: bold; margin: 10px 0;">${value}</div>
          ${code ? `<p style="margin: 0; font-size: 16px;">كود الخصم: <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace;">${code}</span></p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="https://masar-design.com" style="display: inline-block; background-color: #d4af37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; font-size: 16px;">
            ابدأ مشروعك الآن
          </a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>لقد استلمت هذه الرسالة لاشتراكك في نشرتنا البريدية.</p>
        <p>© ${new Date().getFullYear()} مسار. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  `;
}
