import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from '@core/services/projects.service';
import { ImageGallery } from '@shared/ui/image-gallery/image-gallery';
import { ProjectType } from '@core/types/types.constans';
import { Block } from '@shared/ui/block/block';
import { NgIcon } from '@ng-icons/core';
import { Icons } from '@core/types/icons.enum';
import { MarkdownComponent } from "ngx-markdown";
import {ProjectLayoutService} from "@app/pages/projects/project/children/project-layout/project-layout-service";

@Component({
  selector: 'app-main',
  imports: [ImageGallery, Block, NgIcon, MarkdownComponent],
  templateUrl: './main.html',
  standalone: true,
  styleUrl: './main.css',
})
export class Main {
  private projectLayoutService = inject(ProjectLayoutService);
  Icons = Icons;
  data = computed(this.projectLayoutService.data);
}
