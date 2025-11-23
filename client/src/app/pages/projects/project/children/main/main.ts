import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from '@core/services/projects.service';
import { ImageGallery } from '@shared/ui/image-gallery/image-gallery';
import { ProjectType } from '@core/types/types.constans';
import { Block } from '@shared/ui/block/block';
import { NgIcon } from '@ng-icons/core';
import { Icons } from '@core/types/icons.enum';
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: 'app-main',
  imports: [ImageGallery, Block, NgIcon, MarkdownComponent],
  templateUrl: './main.html',
  standalone: true,
  styleUrl: './main.css',
})
export class Main implements OnInit {
  private projectService = inject(ProjectsService);
  Icons = Icons;
  projectId: string | null = null;

  constructor(private routes: ActivatedRoute) {}

  data: ProjectType | null = null;

  ngOnInit() {
    this.routes.parent?.paramMap.subscribe(async (params) => {
      const id = params.get('project_id');
      this.projectId = id;
      if (id) {
        this.data = await this.projectService.getProject(id).then(res => res.project);
      } else {
        this.data = null;
      }

      console.log(this.data, this.projectId);
    });
  }
}
