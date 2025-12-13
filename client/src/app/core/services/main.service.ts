import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TagType} from '@core/types/types.constans';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  constructor(private http: HttpClient) {}

  async getSkills(): Promise<TagType[] | undefined> {
    return await this.http.get<TagType[]>('/api/skills').toPromise();
  }
  async getCategories(): Promise<any[] | undefined> {
    return await this.http.get<any[]>('/api/categories').toPromise();
  }
}
