import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {Block} from '@shared/ui/block/block';
import {AuthService} from '@core/services/auth.service';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ProfileService as ProfileService} from '@core/services/profile.service';
import {Tag} from '@shared/ui/tag/tag';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {ProjectsService} from '@core/services/projects.service';
import {ProfileType, ProjectType} from '@core/types/types.constans';
import {ImgPipe} from '@shared/utils/img.pipe';
import { NgIcon } from "@ng-icons/core";
import { Icons } from '@core/types/icons.enum';


@Component({
  selector: 'app-profile',
  imports: [
    Block,
    CommonModule,
    Tag,
    ProjectPreview,
    RouterLink,
    ImgPipe,
    NgIcon,
],
  templateUrl: './profile.html',
  standalone: true,
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private projectsService = inject(ProjectsService);


  data: {user: WritableSignal<ProfileType>, projects:ProjectType[]} | null = null;
  isMy = false;
  Icons = Icons;


  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      const _id = params.get('id');
      if (_id === 'me' || (!_id && this.profileService.me$()) || _id === this.profileService.me$()?.id) {
        this.isMy = true;
        this.data = {user:this.profileService.me$, projects:await this.projectsService.getMyProjects(3).then(res=>res.items)};
      } else {
        this.isMy = false;
        this.data = {
        user:
          await this.profileService.getProfileById(_id || '')
            .then(
              (res)=> {
                if (!res) {
                  this.data = null;
                  return signal<ProfileType>(null as any);
                }
                  return signal<ProfileType>(res.user);
                }
        ), projects: await this.projectsService.getProjectsByUserId(_id || '', 3).then(res=>res.items)
        }
      }
    })
  }
}
