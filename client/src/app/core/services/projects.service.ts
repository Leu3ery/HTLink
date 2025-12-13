import {Injectable} from '@angular/core';
import {ProfileType, ProjectCreateData, ProjectType} from '@core/types/types.constans';
import {cleanObject} from '@shared/utils/utils';
import {catchError, firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ProfileService} from './profile.service';
import {isDevMode} from "@core/environment/config.constants";

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private http: HttpClient, private profileService: ProfileService) {
  }

  async getProject(id: string | null): Promise<{ project: ProjectType }> {
    if (isDevMode) {
      return {
        project: {
          id: '1',
          title: 'Sample Project',
          shortDescription: 'This is a sample project description.',
          fullReadme: 'Detailed README content goes here.',
          category: {id: 'cat1', name: 'Web Development'},
          ownerId: 'user1',
          tags: [{id: 'tag1', name: 'Angular'}, {id: 'tag2', name: 'TypeScript'}],
          images: [{
            image_path: 'https://via.placeholder.com/150',
            id: "piauhsdla"
          }, {image_path: 'https://via.placeholder.com/150', id: "piauhsdla"}],
          deadline: '2024-12-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          status: 'draft',
        }
      }
    }
    return firstValueFrom(this.http.get<{ project: ProjectType }>(`/api/projects/${id}/`));
  }

  async getMyProjects(limit?: number): Promise<{ items: ProjectType[] }> {
    return firstValueFrom(
      this.http.get<{ projects: { items: ProjectType[] } }>('/api/users/me/projects', {params: limit ? {limit} : {}})
    ).then((res) => res.projects);
  }

  async getProjectsByUserId(userId: string, limit: number): Promise<{ items: ProjectType[] }> {
    if (userId === 'me') {
      return await this.getMyProjects(limit);
    }
    return firstValueFrom(
      this.http
        .get<{ items: ProjectType[] }>(`/api/projects`, {
          params: {ownerId: userId, limit},
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
      this.http.get<{ projects: ProjectType[] }>('/api/users/', {params: data})
    );
    return res.projects;
  }

  async checkProjectIdAvailability(arg: string) {
    return await firstValueFrom(
      this.http.get<{ isAvailable: boolean }>(`/api/projects/${arg}/check`).pipe(
        catchError(() => {
          return [{isAvailable: false}];
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
