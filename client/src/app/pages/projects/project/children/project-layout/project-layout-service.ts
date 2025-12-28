import {inject, Injectable, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProjectType} from "@core/types/types.constans";
import {ProjectsService} from "@core/services/projects.service";

@Injectable({
  providedIn: 'root',
})
export class ProjectLayoutService {
  data = signal<ProjectType | null >(null);
  projectId: string | null = null;
  projectsService = inject(ProjectsService);
  async getData(id: string) {
    this.projectId = id;
    this.data.set((await this.projectsService.getProject(id)).project);
  }
  setData(data: ProjectType | null): void {
    this.data.set(data);
  }
  updateData(data: Partial<ProjectType>): void {
    const currentData = this.data();
    if (currentData) {
      this.data.set({...currentData, ...data});
    }
  }
}
