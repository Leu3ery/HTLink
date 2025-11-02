import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {CommonModule} from '@angular/common';
import {Notifications} from '@shared/ui/notifications/notifications';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    SvgIconComponent,
    RouterLink,
    CommonModule,
    Notifications,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  standalone: true
})
export class Layout {

  readonly pages = [
    { label: 'Feed', path: '/feed', icon: 'home' },
    { label: 'Projects', path: '/projects/search', icon: 'search' },
    { label: 'Marketplace', path: '/marketplace', icon: 'marketplace' },
    { label: 'More', path: '/more', icon: 'menu' }
  ];

  isActive(path: string) {
    return window.location.href.includes(path);
  }
}
