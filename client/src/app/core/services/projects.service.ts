import { Injectable } from '@angular/core';
import {ProfileType, ProjectCreateData, ProjectType} from '@core/types/types.constans';
import {cleanObject} from '@shared/utils/cleanObject';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private http: HttpClient) {}


  async getProject(id: string | null): Promise<ProjectType> {
    return firstValueFrom(
      this.http.get<ProjectType>(`/api/projects/${id}/`)
    );
  }
  async getMyProjects(): Promise<ProjectType[]> {
    return firstValueFrom(
      this.http.get<{ projects: ProjectType[] }>('/api/users/me/projects/')
    ).then(res => res.projects);
  }
  async getProjectsByUserId(userId: string): Promise<ProjectType[]> {
    if (userId === '') {
      userId = 'me';
    }
    return firstValueFrom(
      this.http.get<{ projects: ProjectType[] }>(`/api/users/${userId}/projects/`)
    ).then((res) => res.projects);
  }
  async getProjects(search: {value: string, filters:{[key: string]: any}}): Promise<ProjectType[]> {
    const data = cleanObject({
      nameContains: search.value,
      ...search.filters,
    })
    const res = await firstValueFrom(
      this.http.get<{ projects: ProjectType[] }>('/api/users/', { params: data })
    );
    return res.projects;

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

    data.skills.forEach(skill => formData.append('skills', skill));
    data.images.forEach(image => formData.append('image', image));

    return firstValueFrom(
      this.http.post<ProjectType>('/api/projects/', formData)
    );
  }
}


