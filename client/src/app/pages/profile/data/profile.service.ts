import { Injectable } from '@angular/core';
import {ProjectType} from '@app/pages/projects/data/projects';
import {TagType} from '@core/eviroments/config.constants';


export type ProfileType = {
  id: string;
  name: string;
  email: string;
  class: string;
  skills?: TagType[];
  department: "IF" | "ET" | "WI" | "MB";
  bio?: string;
  role: 'student' | 'teacher' | 'president' | 'director' | 'admin';
  avatarUrl?: string;
  numberOfProjects?: number;
  numberOfFollowers?: number;
  numberOfFollowing?: number;

  projects?: ProjectType[];
  registeredAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  async getProfileById(_id: string): Promise<ProfileType> {
    throw new Error('Method not implemented.');
  }
}
