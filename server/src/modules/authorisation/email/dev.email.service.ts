import { IEmailService } from "./email.interface";

export class DevEmailService implements IEmailService {
  async sendVerificationCode(email: string, code: string): Promise<void> {
    console.log('='.repeat(50));
    console.log('📧 Dev Email Service - Verification Code');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log('='.repeat(50));
  }
}

