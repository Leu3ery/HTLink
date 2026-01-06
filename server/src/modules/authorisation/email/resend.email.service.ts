import { Resend } from "resend";
import { IEmailService } from "./email.interface";

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = "onboarding@resend.dev") {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: `HTLink <${this.fromEmail}>`,
      to: [email],
      subject: "Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </div>
          <p style="margin-top: 20px; color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

