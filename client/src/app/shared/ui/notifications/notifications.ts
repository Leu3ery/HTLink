import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationType} from '@core/types/types.constans';
import {NotificationService} from '@core/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications {
  service = inject(NotificationService)

  protected readonly NotificationType = NotificationType;
}
