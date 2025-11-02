import {Injectable, signal} from '@angular/core';
import {ProfileType, TagType} from '@core/types/types.constans';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  me$ = signal<ProfileType>(null as any);

  async getProfileById(_id: string): Promise<ProfileType> {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {
    this.getMe()
  }


  async updateProfile(data: any): Promise<void> {
    const dataNew = new FormData();
    for (const key in data) {
      if (!data[key]) {
        continue;
      }
      if (key === 'photo_path' && typeof data[key] === 'string') {
        dataNew.append("photo", await fetch(data[key]).then(r => r.blob()), "photo");
        continue;
      }
      if (key === 'skills') {
        data[key].forEach((id: TagType, i:number) => dataNew.append(`skills[${i}]`, id.id));
        continue
      }
      dataNew.append(key, data[key]);
    }
    this.http.patch('/api/users/me', dataNew).subscribe((response: any) => {
      if (response.status === 200) {
        // Profile updated successfully
      }
      this.me$.set(response.user);
    });
  }
  private async getMe(): Promise<void> {
    this.http.get('/api/users/me').subscribe((response: any) => {
      this.me$.set(response.user);
    });
  }
  get me(): ProfileType {
    return this.me$();
  }
}
