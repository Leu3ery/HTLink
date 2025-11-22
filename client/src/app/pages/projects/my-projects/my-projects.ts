import {Component, inject, OnInit, signal} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {ProjectsService} from '@core/services/projects.service';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {ProjectType} from '@core/types/types.constans';
import { RouterLink } from "@angular/router";
import { Modal } from "@shared/ui/modal/modal";
import { CreateProject } from "../create-project/create-project";

@Component({
  selector: 'app-my-projects',
  imports: [ProjectPreview, SvgIconComponent, Modal, CreateProject],
  templateUrl: './my-projects.html',
  standalone: true,
  styleUrl: './my-projects.css',
})
export class MyProjects implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectsService);
  projects: ProjectType[] | undefined;

  isCreateModalOpen = signal(false);

  ngOnInit() {
    this.projectService.getMyProjects().then((projects) => {
      this.projects = projects;
    });
  }
  eventPreventDefault($event: PointerEvent) {
    $event.stopPropagation();
  }
}
