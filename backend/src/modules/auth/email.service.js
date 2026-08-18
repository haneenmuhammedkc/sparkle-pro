/**
 * Service to send emails using Brevo (formerly Sendinblue) REST API v3
 */
export const sendOTPEmail = async ({ toEmail, toName, otpCode }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@sparklepro.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'SparklePro';

  if (!apiKey) {
    console.warn('[Brevo Warning] BREVO_API_KEY environment variable is not configured.');
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        name: toName || 'SparklePro Owner',
      },
    ],
    subject: 'Verification Code for Your SparklePro Account',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fb; margin: 0; padding: 40px 20px; color: #111827; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #111827; margin-bottom: 24px; text-align: center; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #111827; }
          .text { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .otp-box { background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; margin-bottom: 24px; font-family: monospace; border: 1px solid #e5e7eb; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; pt: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ SparklePro</div>
          <div class="title">Verify Your Email Address</div>
          <div class="text">Welcome to SparklePro! Use the 6-digit verification code below to complete your registration and activate your account:</div>
          <div class="otp-box">${otpCode}</div>
          <div class="text">This code is valid for <strong>2 minutes</strong>. If you did not register for a SparklePro account, you can safely ignore this email.</div>
          <div class="footer">&copy; ${new Date().getFullYear()} SparklePro SaaS. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Brevo Error API Response]:', errorData);
      const error = new Error(errorData.message || `Brevo Email API failed with status ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('[Brevo Email Sent Successfully]: Message ID', data.messageId);
    return data;
  } catch (err) {
    console.error('[Brevo Email Service Exception]:', err.message);
    throw err;
  }
};

/**
 * Send Password Reset Recovery OTP Email using Brevo REST API v3
 */
export const sendPasswordResetOTPEmail = async ({ toEmail, toName, otpCode }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@sparklepro.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'SparklePro';

  if (!apiKey) {
    console.warn('[Brevo Warning] BREVO_API_KEY environment variable is not configured.');
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        name: toName || 'SparklePro Owner',
      },
    ],
    subject: 'Password Reset Security Code - SparklePro',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fb; margin: 0; padding: 40px 20px; color: #111827; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #111827; margin-bottom: 24px; text-align: center; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #111827; }
          .text { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .otp-box { background: #fef2f2; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; margin-bottom: 24px; font-family: monospace; border: 1px solid #fecaca; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; pt: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ SparklePro</div>
          <div class="title">Password Reset Recovery Code</div>
          <div class="text">You recently requested to reset your SparklePro account password. Use the 6-digit recovery code below to verify your identity:</div>
          <div class="otp-box">${otpCode}</div>
          <div class="text">This recovery code is valid for <strong>2 minutes</strong>. If you did not request a password reset, please secure your account immediately.</div>
          <div class="footer">&copy; ${new Date().getFullYear()} SparklePro SaaS. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Brevo Error API Response]:', errorData);
      const error = new Error(errorData.message || `Brevo Email API failed with status ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('[Brevo Password Reset Email Sent Successfully]: Message ID', data.messageId);
    return data;
  } catch (err) {
    console.error('[Brevo Email Service Exception]:', err.message);
    throw err;
  }
};