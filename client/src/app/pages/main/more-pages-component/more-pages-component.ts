import {Component, inject} from '@angular/core';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {RouterLink} from '@angular/router';
import {Block} from '@shared/ui/block/block';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-more-pages-component',
  imports: [
    SvgIconComponent,
    RouterLink,
    Block
  ],
  templateUrl: './more-pages-component.html',
  styleUrl: './more-pages-component.css'
})
export class MorePagesComponent {
  authService = inject(AuthService);
  readonly blocks = [
    [
      {label: "My Profile", path: "/profile", icon: "person"}
    ],
    [
      { label: 'My Projects', path: '/projects/my', icon: 'projects' },
      { label: 'News', path: '/news', icon: 'news' },
      { label: 'Users', path: '/users', icon: 'group' },
      // { label: 'Chats (comming soon)', path: '/chats', icon: 'chats' },
    ],
    [
      { label: 'Settings', path: '/settings', icon: 'settings' },
      {label: "Logout", path: "/logout", icon: "logout", click: ()=>this.authService.logout()},
    ]
  ];
}
