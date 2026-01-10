import {effect, inject, Injectable, signal} from '@angular/core';
import {ProfileType, TagType} from '@core/types/types.constans';
import {HttpClient} from '@angular/common/http';
import {NotificationService} from '@core/services/notification.service';
import {AuthService} from '@core/services/auth.service';
import {cleanObject} from '@shared/utils/utils';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  notificationsService = inject(NotificationService);
  me$ = signal<ProfileType>(null as any);

  async getProfileById(id: string): Promise<{user:ProfileType } | undefined> {
    return await this.http.get<{user:ProfileType }>(`/api/users/${id}`).toPromise()
  }
  constructor(private http: HttpClient, private aService: AuthService) {
    effect(() => {
      const token = this.aService.token()
      this.getMe()
    });
  }


  async getUsers(search: {value: string, filters:{[key: string]: any}}): Promise<ProfileType[]> {
    const data = cleanObject({
      nameContains: search.value,
      ...search.filters,
      class: search.filters["class"] + search.filters["letter"],
      letter: undefined
    })
    const res = await firstValueFrom(
      this.http.get<{ users: ProfileType[] }>('/api/users/', { params: data })
    );
    return res.users;

  }
  async updateProfile(data: any): Promise<any> {
    const dataNew = new FormData();
    for (const key in data) {
      // Allow password field even if it's not truthy to update empty values
      if (!data[key] && key !== 'password' && key !== 'class' && key !== 'department') {
        continue;
      }
      if (key === 'photo_path' && typeof data[key] === 'string') {
        if (data[key].startsWith('http')) {
          continue;
        }
        dataNew.append("photo", await fetch(data[key]).then(r => r.blob()), "photo");
        continue;
      }
      if (key === 'skills') {
        if (Array.isArray(data[key])) {
          data[key].forEach((id: TagType, i:number) => dataNew.append(`skills[${i}]`, id.id));
        }
        continue;
      }
      // Add all other fields including password, class, department, banner_link
      if (data[key] !== null && data[key] !== undefined) {
        dataNew.append(key, data[key]);
      }
    }
    
    // Check if FormData is empty
    const hasData = Array.from(dataNew.entries()).length > 0;
    if (!hasData) {
      this.notificationsService.addNotification('No changes to save', 3);
      return Promise.resolve();
    }
    
    return firstValueFrom(this.http.patch('/api/users/me', dataNew)).then((response: any) => {
      this.notificationsService.addNotification('Profile updated successfully', 2);
      this.me$.set(response.user);
    });
  }
  async getMe(): Promise<void> {
    if (!this.aService.token()) {
      return
    }
    this.http.get('/api/users/me').subscribe((response: any) => {
      this.me$.set(response.user);
    });
  }
  get me(): ProfileType {
    return this.me$();
  }
}
