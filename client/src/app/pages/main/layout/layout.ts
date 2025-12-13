import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Notifications} from '@shared/ui/notifications/notifications';
import {Block} from '@shared/ui/block/block';
import { NgIcon } from '@ng-icons/core';
import { Icons } from '@core/types/icons.enum';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, CommonModule, Notifications, Block, NgIcon],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  standalone: true,
})
export class Layout {
  readonly pages = [
    { label: 'Feed', path: '/feed', icon: Icons.Home },
    { label: 'Projects', path: '/projects/search', icon: Icons.Search },
    { label: 'Marketplace', path: '/marketplace', icon: Icons.Marketplace },
    { label: 'More', path: '/more', icon: Icons.More },
  ];

  isActive(path: string) {
    return window.location.href.includes(path);
  }
}
