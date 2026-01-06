import { IEmailService } from "./email.interface";
import { DevEmailService } from "./dev.email.service";
import { ResendEmailService } from "./resend.email.service";
import { config } from "../../../config/config";

export class EmailServiceFactory {
  static create(): IEmailService {
    
    switch (config.EMAIL_TYPE) {
      case 'production':
        return new ResendEmailService(config.RESEND_API_KEY, config.RESEND_FROM_EMAIL);
      case 'dev':
      default:
        return new DevEmailService();
    }
  }
}
