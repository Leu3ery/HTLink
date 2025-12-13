import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Block} from '@shared/ui/block/block';
import {AuthService} from '@core/services/auth.service';
import { NgIcon } from "@ng-icons/core";
import { Icons } from '@core/types/icons.enum';

@Component({
  selector: 'app-more-pages-component',
  imports: [RouterLink, Block, NgIcon],
  templateUrl: './more-pages-component.html',
  styleUrl: './more-pages-component.css',
})
export class MorePagesComponent {

  Icons = Icons;

  authService = inject(AuthService);
  readonly blocks = [
    [{ label: 'My Profile', path: '/profile', icon: Icons.User }],
    [
      { label: 'My Projects', path: '/projects/my', icon: Icons.Briefcase },
      { label: 'News', path: '/news', icon: Icons.News },
      { label: 'Users', path: '/users', icon: Icons.Users },
      // { label: 'Chats (comming soon)', path: '/chats', icon: 'chats' },
    ],
    [
      { label: 'Settings', path: '/settings', icon: Icons.Settings },
      {
        label: 'Logout',
        path: '/logout',
        icon: Icons.Logout,
        click: () => this.authService.logout(),
      },
    ],
  ];
}
