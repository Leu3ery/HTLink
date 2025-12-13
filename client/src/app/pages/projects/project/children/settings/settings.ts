import { Component } from '@angular/core';
import {Block} from "@shared/ui/block/block";
import {NgIcon} from "@ng-icons/core";
import {RouterLink} from "@angular/router";
import {Icons} from "@core/types/icons.enum";

@Component({
  selector: 'app-settings',
    imports: [
        Block,
        NgIcon,
        RouterLink
    ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  protected readonly Icons = Icons;
  readonly blocks = [
    [
      { label: 'Photos & Media', path: './media', icon: Icons.Camera },
    ],
    [
      { label: 'General Info', path: './general', icon: Icons.Info },
      { label: 'Read Me', path: './readme', icon: Icons.Book },
      { label: 'Links', path: './links', icon: Icons.Link },
    ],
    [
      { label: 'Edit Roles', path: './roles', icon: Icons.Briefcase },
      { label: 'Applications', path: './applications', icon: Icons.Inbox },
    ],
  ];
}
