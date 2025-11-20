import { Injectable } from '@angular/core';
import {ProfileType, ProjectType} from '@core/types/types.constans';
import {cleanObject} from '@shared/utils/cleanObject';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private http: HttpClient) {}


  async getProject(id: string | null): Promise<ProjectType> {
    return {
      id: id || '1',
      title: 'Sample Project',
      description: 'This is a sample project description.',
      images: [
        {url: 'https://angular.io/assets/images/logos/angular/angular.png', size: 1024},
        {url: 'https://angular.io/assets/images/logos/angular/angular.png', size: 2048}
      ],
      authorId: 'author123',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [{id: "1", name: 'angular'}, {id: "2", name: 'angular'}],
      members: [],
      likes: 42
    };
  }
  async getMyProjects(): Promise<ProjectType[]> {
    return [
      {
        id: '1',
        title: 'My First Project',
        description: 'Description of my first project.',
        images: [
          {url: 'https://angular.io/assets/images/logos/angular/angular.png', size: 1024}
        ],
        authorId: 'me',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [{id: "1", name: 'angular'}],
        members: [],
        likes: 10
      }
    ]
  }
  async getProjectsByUserId(userId: string): Promise<ProjectType[]> {
    if (userId === '') {
      userId = 'me';
    }
    return [
      {
        id: '2',
        title: `Project of user ${userId}`,
        description: 'Description of user project.',
        images: [
          {url: 'https://angular.io/assets/images/logos/angular/angular.png', size: 1024}
        ],
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [{id: "2", name: 'angular'}],
        members: [],
        likes: 20
      }
    ]
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
}
