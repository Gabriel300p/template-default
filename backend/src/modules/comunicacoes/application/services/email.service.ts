import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  metadata?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    // Remove auth if no credentials provided (for development)
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      delete emailConfig.auth;
    }

    this.transporter = nodemailer.createTransporter(emailConfig);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.warn('SMTP configuration error:', error.message);
      } else {
        this.logger.log('SMTP server is ready to take our messages');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const defaultFrom = this.configService.get<string>('SMTP_FROM', 'noreply@example.com');
      
      const mailOptions = {
        from: options.from || defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.content,
        html: options.html || this.convertTextToHtml(options.content),
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(emails: EmailOptions[]): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const email of emails) {
      try {
        await this.sendEmail(email);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: email.to,
          error: error.message,
        });
      }
    }

    this.logger.log(`Bulk email results: ${results.success} sent, ${results.failed} failed`);
    return results;
  }

  async sendWelcomeEmail(to: string, name: string, activationUrl?: string): Promise<void> {
    const subject = 'Welcome to our platform!';
    const content = this.generateWelcomeEmailContent(name, activationUrl);
    
    await this.sendEmail({
      to,
      subject,
      content,
      html: this.generateWelcomeEmailHtml(name, activationUrl),
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const subject = 'Password Reset Request';
    const content = this.generatePasswordResetEmailContent(name, resetUrl);
    
    await this.sendEmail({
      to,
      subject,
      content,
      html: this.generatePasswordResetEmailHtml(name, resetUrl),
    });
  }

  async sendEmailVerificationEmail(to: string, name: string, verificationUrl: string): Promise<void> {
    const subject = 'Please verify your email address';
    const content = this.generateEmailVerificationContent(name, verificationUrl);
    
    await this.sendEmail({
      to,
      subject,
      content,
      html: this.generateEmailVerificationHtml(name, verificationUrl),
    });
  }

  async sendNotificationEmail(to: string, title: string, message: string, actionUrl?: string): Promise<void> {
    const subject = title;
    const content = this.generateNotificationEmailContent(message, actionUrl);
    
    await this.sendEmail({
      to,
      subject,
      content,
      html: this.generateNotificationEmailHtml(title, message, actionUrl),
    });
  }

  private convertTextToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  private generateWelcomeEmailContent(name: string, activationUrl?: string): string {
    let content = `Hello ${name},

Welcome to our platform! We're excited to have you on board.

Your account has been created successfully and you can now start exploring all the features we have to offer.`;

    if (activationUrl) {
      content += `

To get started, please activate your account by clicking the link below:
${activationUrl}

This link will expire in 24 hours for security reasons.`;
    }

    content += `

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The Team`;

    return content;
  }

  private generateWelcomeEmailHtml(name: string, activationUrl?: string): string {
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to our platform!</h2>
      <p>Hello ${name},</p>
      <p>We're excited to have you on board. Your account has been created successfully and you can now start exploring all the features we have to offer.</p>`;

    if (activationUrl) {
      html += `
      <p>To get started, please activate your account by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Activate Account</a>
      </div>
      <p><small>This link will expire in 24 hours for security reasons.</small></p>`;
    }

    html += `
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Team</p>
    </div>`;

    return html;
  }

  private generatePasswordResetEmailContent(name: string, resetUrl: string): string {
    return `Hello ${name},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, click the link below:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you're having trouble clicking the link, copy and paste it into your web browser.

Best regards,
The Team`;
  }

  private generatePasswordResetEmailHtml(name: string, resetUrl: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p><small>This link will expire in 1 hour for security reasons.</small></p>
      <p>If you're having trouble clicking the button, copy and paste this link into your web browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>Best regards,<br>The Team</p>
    </div>`;
  }

  private generateEmailVerificationContent(name: string, verificationUrl: string): string {
    return `Hello ${name},

Thank you for signing up! To complete your registration, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The Team`;
  }

  private generateEmailVerificationHtml(name: string, verificationUrl: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Please verify your email address</h2>
      <p>Hello ${name},</p>
      <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </div>
      <p><small>This link will expire in 24 hours for security reasons.</small></p>
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
      <p>Best regards,<br>The Team</p>
    </div>`;
  }

  private generateNotificationEmailContent(message: string, actionUrl?: string): string {
    let content = `Hello,

${message}`;

    if (actionUrl) {
      content += `

You can view more details by clicking the link below:
${actionUrl}`;
    }

    content += `

Best regards,
The Team`;

    return content;
  }

  private generateNotificationEmailHtml(title: string, message: string, actionUrl?: string): string {
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <p>Hello,</p>
      <p>${message}</p>`;

    if (actionUrl) {
      html += `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a>
      </div>`;
    }

    html += `
      <p>Best regards,<br>The Team</p>
    </div>`;

    return html;
  }
}

