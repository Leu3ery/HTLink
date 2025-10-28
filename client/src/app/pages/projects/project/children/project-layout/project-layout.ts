import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-project-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    SvgIconComponent,
    CommonModule
  ],
  templateUrl: './project-layout.html',
  styleUrl: './project-layout.css'
})
export class ProjectLayout {
  readonly pages = [
    { label: 'Back', path: '/projects/my', icon: 'projects' },
    { label: 'Projects', path: '/projects/search', icon: 'search' },
    { label: 'Marketplace', path: '/marketplace', icon: 'marketplace' },
    { label: 'More', path: '/more', icon: 'menu' }
  ];

  isActive(path: string) {
    return window.location.href.includes(path);
  }
}
