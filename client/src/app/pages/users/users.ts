import {Component, inject, OnInit} from '@angular/core';
import {SearchBar} from '@shared/ui/search-bar/search-bar';
import {ProfileService} from '@core/services/profile.service';
import {ProfileType} from '@core/types/types.constans';

import {UserPreview} from '@app/pages/users/children/user-preview/user-preview';

@Component({
  selector: 'app-users',
  imports: [
    SearchBar,
    UserPreview
],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  profileService = inject(ProfileService)

  availableFilters = [
    {
      label: 'Class',
      options: [{label: 'All', value:''}, 1,2,3,4,5]
    },
    {
      label: 'Letter',
      options: [{label: 'All', value:''}, 'A', 'B', 'C']
    },
    {
      label: 'Department',
      options: [{label: 'All', value:''}, 'IF', 'WI', 'MB', 'EL']
    }
  ];

  searchResults: ProfileType[] = [];

  onSubmitSearch(data: {value: string, filters: {[key: string]: any}}) {
    const res = this.profileService.getUsers(data)
    res.then(data => this.searchResults=data);
  }

  ngOnInit() {
    this.profileService.getUsers({value: '', filters: {}}).then(data => this.searchResults=data);
  }
}
