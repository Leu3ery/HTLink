export interface IEmailService {
  sendVerificationCode(email: string, code: string): Promise<void>;
}

