import {Component, inject, input} from '@angular/core';
import {ProjectType} from '@app/pages/projects/data/projects';
import {Block} from '@shared/ui/block/block';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {Tag} from '@shared/ui/tag/tag';
import {Router} from '@angular/router';

@Component({
  selector: 'app-project-preview',
  imports: [
    Block,
    SvgIconComponent,
    Tag
  ],
  templateUrl: './project-preview.html',
  styleUrl: './project-preview.css'
})
export class ProjectPreview {
  router = inject(Router);
  data = input.required<ProjectType>()
}
