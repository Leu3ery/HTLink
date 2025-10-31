import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {ProjectType} from '@app/pages/projects/data/projects';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {SvgIconComponent} from '@shared/utils/svg.component';

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
  projects: ProjectType[] | undefined;


  ngOnInit() {
    this.projects = this.authService.me?.projects
  }
}
