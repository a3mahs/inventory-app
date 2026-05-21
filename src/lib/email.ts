import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SMTP_USER) {
    logger.warn('Email not configured, skipping send');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    logger.info({ messageId: info.messageId }, 'Email sent');
    return info;
  } catch (error) {
    logger.error(error, 'Failed to send email');
    throw error;
  }
}

export function lowStockEmailTemplate(productName: string, sku: string, currentStock: number, minStock: number) {
  return {
    subject: `⚠️ Low Stock Alert: ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">⚠️ Low Stock Alert</h1>
        </div>
        <div style="background: #F9FAFB; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB;">
          <p>The following product is running low on stock:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Product</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${productName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>SKU</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${sku}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Current Stock</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB; color: #EF4444;"><strong>${currentStock} units</strong></td></tr>
            <tr><td style="padding: 8px;"><strong>Minimum Stock</strong></td><td style="padding: 8px;">${minStock} units</td></tr>
          </table>
          <p style="margin-top: 20px;">Please reorder this product as soon as possible.</p>
          <a href="${process.env.NEXTAUTH_URL}/products" style="display: inline-block; background: #3B82F6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 10px;">View Product</a>
        </div>
      </div>
    `,
  };
}
