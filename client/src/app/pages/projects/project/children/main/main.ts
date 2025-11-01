import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectsService } from '@core/services/projects.service';
import {ImageGallery} from '@shared/ui/image-gallery/image-gallery';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {ProjectType} from '@core/types/types.constans';

@Component({
  selector: 'app-main',
  imports: [
    ImageGallery,
    SvgIconComponent
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {
  private projectService = inject(ProjectsService)
  constructor(private routes: ActivatedRoute) {}

  data: ProjectType | null = null

  ngOnInit() {
    this.routes.paramMap.subscribe(paramMap => {
      const projectId = paramMap.get('id');
      this.projectService.getProject(projectId).then((project: any) => {
        this.data = project;
      })
    })
  }
}
