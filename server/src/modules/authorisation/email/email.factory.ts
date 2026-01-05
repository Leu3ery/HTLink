import { IEmailService } from "./email.interface";
import { DevEmailService } from "./dev.email.service";
import { config } from "../../../config/config";

export class EmailServiceFactory {
  static create(): IEmailService {
    
    switch (config.EMAIL_TYPE) {
      case 'production':
        // TODO: Повернути production email service коли буде готовий
        return new DevEmailService();
      case 'dev':
      default:
        return new DevEmailService();
    }
  }
}
