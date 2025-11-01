import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {Block} from '@shared/ui/block/block';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {AuthService} from '@core/services/auth.service';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ProfileService as ProfileService} from '@core/services/profile.service';
import {Tag} from '@shared/ui/tag/tag';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {ProjectsService} from '@core/services/projects.service';
import {ProfileType, ProjectType} from '@core/types/types.constans';
import {ImgPipe} from '@shared/utils/img.pipe';


@
  Component({
  selector: 'app-profile',
    imports: [
      Block,
      SvgIconComponent,
      CommonModule,
      Tag,
      ProjectPreview,
      RouterLink,
      ImgPipe,
    ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private projectsService = inject(ProjectsService);


  data: {user: WritableSignal<ProfileType>, projects:ProjectType[]} | null = null;
  isMy = false;


  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      const _id = params.get('id');
      if (_id === 'me') {
        this.isMy = true;
        this.data = {user:this.profileService.me$, projects:[]};
      } else {
        this.isMy = false;
        this.data = {
        user: signal((await this.profileService.getProfileById(_id || '')
        )), projects: []
        };
      }
    })
  }
}
