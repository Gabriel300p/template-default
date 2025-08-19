export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  /**
   * Send email (mock implementation for MVP)
   * In production, integrate with SendGrid, AWS SES, or similar
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    // Mock implementation - just log to console
    console.log("\n📧 EMAIL SENT:");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Content (text):", options.text);
    console.log("---");

    // TODO: Implement real email service
    // Example with SendGrid:
    // const msg = {
    //   to: options.to,
    //   from: env.FROM_EMAIL,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // };
    // await sgMail.send(msg);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Send MFA code email
   */
  async sendMfaCode(to: string, userName: string, code: string): Promise<void> {
    const subject = "Código de Autenticação - Sistema B-BOSS";

    const text = `Olá, ${userName}!

Recebemos uma solicitação para acessar sua conta. Use o código abaixo para continuar:

${code}

O código expira em 10 minutos e pode ser usado somente neste acesso.

Se você não solicitou este código, sugerimos que desconsidere este e-mail de segurança.

Atenciosamente,
Equipe B-BOSS.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #fff; padding: 30px; border: 1px solid #ddd; }
        .code { background-color: #007bff; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 Sistema B-BOSS</h1>
            <h2>Código de Autenticação</h2>
        </div>
        <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            
            <p>Recebemos uma solicitação para acessar sua conta. Use o código abaixo para continuar:</p>
            
            <div class="code">${code}</div>
            
            <div class="warning">
                <p><strong>⏰ Importante:</strong></p>
                <ul>
                    <li>O código expira em <strong>10 minutos</strong></li>
                    <li>Pode ser usado <strong>somente neste acesso</strong></li>
                </ul>
            </div>
            
            <p>Se você não solicitou este código, sugerimos que desconsidere este e-mail de segurança.</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe B-BOSS</strong></p>
        </div>
        <div class="footer">
            <p>Este é um e-mail automático. Por favor, não responda.</p>
        </div>
    </div>
</body>
</html>`;

    await this.sendEmail({ to, subject, html, text });
  }
}

export const emailService = new EmailService();
