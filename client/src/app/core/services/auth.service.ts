import {Injectable, signal, WritableSignal} from '@angular/core';
import {ProfileType} from '@app/pages/profile/data/profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: WritableSignal<string | null> = signal(null);
  private me$ = signal< ProfileType | null>(null);


  constructor() {
    this.getMe();
  }


  private async getMe(): Promise<void> {
    this.me$.set({
      id: '123456',
      name: 'Maksym Rvachov',
      email: 'maks.rvachov.at@gmail.com',
      class: '3A',
      department: 'IF',
      role: 'admin',
      registeredAt: new Date('2022-01-01T00:00:00Z'),
      bio: "Coder of this fucking website",
      avatarUrl: "https://www.htlstp.ac.at/wp-content/uploads/2024/08/maus.jpeg",
      numberOfProjects: 42,
      numberOfFollowers: 666,
      numberOfFollowing: 999,
      skills: [{id:"1", name:'angular'},{id:"2", name:'angular'}],
      projects: [{
        id: 'proj1',
        images:[{url: "https://angular.io/assets/images/logos/angular/angular.png", size: 2048}],
        title: 'Awesome Project',
        description: 'This is an awesome project.',
        authorId: '123456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-06-01T00:00:00Z'),
        tags: [{id:"1", name:'angular'},{id:"2", name:'angular'}],
        likes: 100,
      },{
        id: 'proj1',
        images:[{url: "https://angular.io/assets/images/logos/angular/angular.png", size: 2048}],
        title: 'Awesome Project',
        description: 'This is an awesome project.',
        authorId: '123456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-06-01T00:00:00Z'),
        tags: [{id:"1", name:'angular'},{id:"2", name:'angular'}],
        likes: 100,
      },{
        id: 'proj1',
        images:[{url: "https://angular.io/assets/images/logos/angular/angular.png", size: 2048}],
        title: 'Awesome Project',
        description: 'This is an awesome project.',
        authorId: '123456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-06-01T00:00:00Z'),
        tags: [{id:"1", name:'angular'},{id:"2", name:'angular'}],
        likes: 100,
      },{
        id: 'proj1',
        images:[{url: "https://angular.io/assets/images/logos/angular/angular.png", size: 2048}],
        title: 'Awesome Project',
        description: 'This is an awesome project.',
        authorId: '123456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-06-01T00:00:00Z'),
        tags: [{id:"1", name:'angular'},{id:"2", name:'angular'}],
        likes: 100,
      }]
    })
  }


  get me(): ProfileType | null {
    return this.me$();
  }
  get isAuthed() {
    return !!this.me;
  }
  logout(): void {
    this.token.set(null);
  }
}
