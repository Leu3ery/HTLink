import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {ProjectsService} from '@core/services/projects.service';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {ProjectType} from '@core/types/types.constans';

@Component({
  selector: 'app-my-projects',
  imports: [
    ProjectPreview,
    SvgIconComponent
  ],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css'
})
export class MyProjects implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectsService);
  projects: ProjectType[] | undefined;


  ngOnInit() {
    this.projectService.getMyProjects().then(projects => {
      this.projects = projects;
    });
  }
}
