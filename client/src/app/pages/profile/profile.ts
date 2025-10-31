import {Component, inject, OnInit} from '@angular/core';
import {Block} from '@shared/ui/block/block';
import {SvgIconComponent} from '@shared/utils/svg.component';
import {AuthService} from '@core/services/auth.service';
import {CommonModule} from '@angular/common';
import {ProfileType} from './data/profile.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProfileService as ProfileService} from './data/profile.service';
import {Tag} from '@shared/ui/tag/tag';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';


@
  Component({
  selector: 'app-profile',
    imports: [
      Block,
      SvgIconComponent,
      CommonModule,
      Tag,
      ProjectPreview,
    ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);


  data: ProfileType | null = null;
  isMy = false;


  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      const _id = params.get('id');
      if (_id === 'me') {
        this.isMy = true;
        this.data = this.authService.me;
      } else {
        this.isMy = false;
        this.data = await this.profileService.getProfileById(_id || '');
      }
    })
  }
}
