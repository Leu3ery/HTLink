import {Component, inject, OnInit, signal} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {ProjectsService} from '@core/services/projects.service';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {ProjectType} from '@core/types/types.constans';
import { RouterLink } from "@angular/router";
import { Modal } from "@shared/ui/modal/modal";
import { CreateProject } from "../create-project/create-project";
import { NgIcon } from "@ng-icons/core";
import { Icons } from '@core/types/icons.enum';

@Component({
  selector: 'app-my-projects',
  imports: [ProjectPreview, Modal, CreateProject, NgIcon],
  templateUrl: './my-projects.html',
  standalone: true,
  styleUrl: './my-projects.css',
})
export class MyProjects implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectsService);
  projects: ProjectType[] | undefined;

  isCreateModalOpen = signal(false);
  Icons = Icons;

  ngOnInit() {
    this.projectService.getMyProjects().then((projects) => {
      this.projects = projects.items;
      console.log(this.projects);
    });
  }
  eventPreventDefault($event: PointerEvent) {
    $event.stopPropagation();
  }
}
