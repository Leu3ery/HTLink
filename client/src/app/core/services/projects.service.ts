import { Injectable } from '@angular/core';
import { ProfileType, ProjectCreateData, ProjectType } from '@core/types/types.constans';
import { cleanObject } from '@shared/utils/utils';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private http: HttpClient, private profileService: ProfileService) {}

  async getProject(id: string | null): Promise<{ project: ProjectType }> {
    return firstValueFrom(this.http.get<{ project: ProjectType }>(`/api/projects/${id}/`));
  }
  async getMyProjects(limit?: number): Promise<{ items: ProjectType[] }> {
    return firstValueFrom(
      this.http.get<{ projects: { items: ProjectType[] } }>('/api/projects/me', {params: limit ? { limit } : {} })
    ).then((res) => res.projects);
  }
  async getProjectsByUserId(userId: string, limit: number): Promise<{ items: ProjectType[] }> {
    return firstValueFrom(
      this.http
        .get<{ items: ProjectType[] }>(`/api/projects`, {
          params: { ownerId: userId, limit },
        })
    );
  }
  async getProjects(search: {
    value: string;
    filters: { [key: string]: any };
  }): Promise<ProjectType[]> {
    const data = cleanObject({
      nameContains: search.value,
      ...search.filters,
    });
    const res = await firstValueFrom(
      this.http.get<{ projects: ProjectType[] }>('/api/users/', { params: data })
    );
    return res.projects;
  }

  async checkProjectIdAvailability(arg: string) {
    return await firstValueFrom(
      this.http.get<{ isAvailable: boolean }>(`/api/projects/${arg}/check`).pipe(
        catchError(() => {
          return [{ isAvailable: false }];
        })
      )
    ).then((res) => res.isAvailable);
  }

  async createProject(data: ProjectCreateData): Promise<ProjectType> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('shortDescription', data.shortDescription);
    formData.append('categoryId', data.categoryId);
    if (data.fullReadme) {
      formData.append('fullReadme', data.fullReadme);
    }
    if (data.deadline) {
      formData.append('deadline', data.deadline);
    }

    data.skills.forEach((skill) => formData.append('skills', skill));
    data.images.forEach((image) => formData.append('image', image));

    return firstValueFrom(this.http.post<ProjectType>('/api/projects/', formData));
  }
}
