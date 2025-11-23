import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Location} from '@angular/common';
import {Notifications} from '@shared/ui/notifications/notifications';
import {Block} from '@shared/ui/block/block';
import { Icons } from '@core/types/icons.enum';
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-project-layout',
  imports: [RouterOutlet, RouterLink, CommonModule, Notifications, Block, NgIcon],
  templateUrl: './project-layout.html',
  standalone: true,
  styleUrl: './project-layout.css',
})
export class ProjectLayout implements OnInit {
  router = inject(Router);
  constructor(private location: Location) {}

  readonly headerBtns = [
    { label: 'Back', path: '.', icon: Icons.ArrowLeft, click: () => this.goBack() },
  ];
  readonly pages = [
    { label: 'About', path: './home', icon: Icons.Home },
    { label: 'Comments', path: './comments', icon: Icons.Comments },
    { label: 'Roles', path: './roles', icon: Icons.Projects },
    { label: 'Settings', path: './settings', icon: Icons.Settings },
  ];

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  isActive(path: string) {
    return window.location.href.includes(path);
  }
}
