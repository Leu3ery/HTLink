import { Component } from '@angular/core';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {RouterLink} from '@angular/router';
import {Block} from '@shared/ui/block/block';

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
  readonly blocks = [
    [
      {label: "My Profile", path: "/profile", icon: "person"}
    ],
    [
      { label: 'My Projects', path: '/projects/my', icon: 'projects' },
      { label: 'News', path: '/news', icon: 'news' },
      { label: 'Friends', path: '/friends', icon: 'group' },
      // { label: 'Chats (comming soon)', path: '/chats', icon: 'chats' },
    ],
    [
      { label: 'Settings', path: '/settings', icon: 'settings' }
    ],
  ];
}
