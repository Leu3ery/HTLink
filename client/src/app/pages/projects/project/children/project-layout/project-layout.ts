import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {CommonModule} from '@angular/common';
import {Location} from '@angular/common';
import {Notifications} from '@shared/ui/notifications/notifications';
import {Block} from '@shared/ui/block/block';

@Component({
  selector: 'app-project-layout',
  imports: [RouterOutlet, RouterLink, SvgIconComponent, CommonModule, Notifications, Block],
  templateUrl: './project-layout.html',
  standalone: true,
  styleUrl: './project-layout.css',
})
export class ProjectLayout implements OnInit {
  router = inject(Router);
  constructor(private location: Location) {}

  readonly headerBtns = [
    { label: 'Back', path: '.', icon: 'arrowBack', click: () => this.goBack() },
  ];
  readonly pages = [
    { label: 'About', path: './home', icon: 'home' },
    { label: 'Comments', path: './comments', icon: 'comments' },
    { label: 'Roles', path: './roles', icon: 'projects' },
    { label: 'Settings', path: './settings', icon: 'hex' },
  ];

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  isActive(path: string) {
    return window.location.href.includes(path);
  }
}
