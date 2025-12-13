import { Component, inject, input } from '@angular/core';
import { Block } from '@shared/ui/block/block';
import { Tag } from '@shared/ui/tag/tag';
import { Router } from '@angular/router';
import { ProjectType } from '@core/types/types.constans';
import { ImgPipe } from "../../utils/img.pipe";
import { NgIcon } from "@ng-icons/core";
import { Icons } from '@core/types/icons.enum';

@Component({
  selector: 'app-project-preview',
  imports: [Block, Tag, ImgPipe, NgIcon],
  templateUrl: './project-preview.html',
  standalone: true,
  styleUrl: './project-preview.css',
})
export class ProjectPreview {
  router = inject(Router);
  data = input.required<ProjectType>();
  Icons = Icons;
}
