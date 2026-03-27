import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import logger from './logger';

const emailLogger = logger.child({ service: 'EmailService' });

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;
  private sesClient: SESClient | null = null;
  private isUsingSES = false;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  constructor() {
    this.initializeEmailService();
  }

  private async initializeEmailService() {
    try {
      // Check if AWS SES configuration is available
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
        this.isUsingSES = true;
        this.sesClient = new SESClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        emailLogger.info('EmailService initialized with AWS SES');
      } else if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        // Fallback to SMTP
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        
        // Verify SMTP connection
        await this.transporter.verify();
        emailLogger.info('EmailService initialized with SMTP');
      } else {
        emailLogger.warn('EmailService: No email configuration found. Email functionality will be disabled.');
      }
    } catch (error) {
      emailLogger.error('Failed to initialize EmailService:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      if (!this.isConfigured()) {
        emailLogger.warn('EmailService not configured, skipping email send');
        return { success: false, error: 'Email service not configured' };
      }

      const fromAddress = options.from || process.env.EMAIL_FROM || 'noreply@nepa.com';
      
      if (this.isUsingSES && this.sesClient) {
        return await this.sendEmailViaSES(options, fromAddress);
      } else if (this.transporter) {
        return await this.sendEmailViaSMTP(options, fromAddress);
      } else {
        return { success: false, error: 'No email transport available' };
      }
    } catch (error) {
      emailLogger.error('Failed to send email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendEmailViaSES(options: EmailOptions, fromAddress: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.sesClient) {
      return { success: false, error: 'SES client not initialized' };
    }

    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    
    const emailParams = {
      Source: fromAddress,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: options.html ? {
            Data: options.html,
            Charset: 'UTF-8',
          } : undefined,
          Text: options.text ? {
            Data: options.text,
            Charset: 'UTF-8',
          } : undefined,
        },
      },
      ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
    };

    const command = new SendEmailCommand(emailParams);
    const response = await this.sesClient.send(command);
    
    emailLogger.info(`Email sent via SES. MessageId: ${response.MessageId}`);
    return { 
      success: true, 
      messageId: response.MessageId 
    };
  }

  private async sendEmailViaSMTP(options: EmailOptions, fromAddress: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'SMTP transporter not initialized' };
    }

    const mailOptions = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    const info = await this.transporter.sendMail(mailOptions);
    emailLogger.info(`Email sent via SMTP. MessageId: ${info.messageId}`);
    return { 
      success: true, 
      messageId: info.messageId 
    };
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const template = this.getPasswordResetTemplate(resetUrl, userName);
    
    const result = await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return result;
  }

  async sendEmailVerificationEmail(to: string, verificationToken: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const template = this.getEmailVerificationTemplate(verificationUrl, userName);
    
    const result = await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return result;
  }

  private getPasswordResetTemplate(resetUrl: string, userName?: string): EmailTemplate {
    const name = userName || 'there';
    
    return {
      subject: 'Reset Your NEPA Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your NEPA Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .security-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEPA</div>
              <h1>Reset Your Password</h1>
            </div>
            
            <p>Hi ${name},</p>
            
            <p>We received a request to reset your password for your NEPA account. Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="security-note">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The NEPA Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your NEPA Password
        
        Hi ${name},
        
        We received a request to reset your password for your NEPA account. Please visit this link to reset your password:
        
        ${resetUrl}
        
        Security Notice: This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Best regards,
        The NEPA Team
        
        This is an automated message. Please do not reply to this email.
      `
    };
  }

  private getEmailVerificationTemplate(verificationUrl: string, userName?: string): EmailTemplate {
    const name = userName || 'there';
    
    return {
      subject: 'Verify Your NEPA Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your NEPA Email Address</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEPA</div>
              <h1>Verify Your Email Address</h1>
            </div>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for signing up for NEPA! Please click the button below to verify your email address:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The NEPA Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your NEPA Email Address
        
        Hi ${name},
        
        Thank you for signing up for NEPA! Please visit this link to verify your email address:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Best regards,
        The NEPA Team
        
        This is an automated message. Please do not reply to this email.
      `
    };
  }

  isConfigured(): boolean {
    return this.isUsingSES ? !!this.sesClient : !!this.transporter;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: 'Email service not configured' };
      }

      if (this.isUsingSES) {
        // SES doesn't have a simple test connection, so we'll just check if client exists
        return { success: true };
      } else if (this.transporter) {
        await this.transporter.verify();
        return { success: true };
      }
      
      return { success: false, error: 'No email transport available' };
    } catch (error) {
      emailLogger.error('Email service test connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const emailService = EmailService.getInstance();
