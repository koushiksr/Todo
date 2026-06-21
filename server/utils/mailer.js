import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendDailyReminderEmail = async (email, name, missedCount) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Skipping email send: GMAIL credentials not configured.');
    return false;
  }

  const mailOptions = {
    from: `"TodoPro Reminders" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '⚠️ You missed some daily tasks today!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0f172a;">Hi ${name},</h2>
        <p>We noticed you left <strong>${missedCount} daily task(s)</strong> incomplete today.</p>
        <p>Consistency is the key to building great habits. Don't let today's slip turn into tomorrow's habit!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://todo-pwa-app.vercel.app/" style="background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open TodoPro to Catch Up
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You are receiving this because you have Daily Reminder Emails enabled.<br/>
          To stop receiving these, visit the <strong>Settings</strong> page in your TodoPro app.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    return false;
  }
};

export const sendInstantReminderEmail = async (email, name, taskText) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Skipping email send: GMAIL credentials not configured.');
    return false;
  }

  const mailOptions = {
    from: `"TodoPro Reminders" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `🔔 Reminder: ${taskText}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0f172a;">Hi ${name},</h2>
        <p>This is a quick reminder for your task:</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 16px; font-weight: bold; margin: 20px 0;">
          ${taskText}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://todo-pwa-app.vercel.app/" style="background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open TodoPro
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You are receiving this because you have Email Notifications enabled.<br/>
          To stop receiving these, visit the <strong>Settings</strong> page in your TodoPro app.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending instant email to ${email}:`, error);
    return false;
  }
};
export const sendOTPEmail = async (email, otp) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Skipping email send: GMAIL credentials not configured. OTP is:', otp);
    return false;
  }

  const mailOptions = {
    from: `"TodoPro Auth" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your Login Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center;">Welcome to TodoPro</h2>
        <p style="text-align: center;">Here is your secure login code:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 4px; font-size: 32px; font-weight: bold; margin: 20px 0; text-align: center; letter-spacing: 5px; color: #3b82f6;">
          ${otp}
        </div>
        <p style="text-align: center; font-size: 14px; color: #666;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    return false;
  }
};
