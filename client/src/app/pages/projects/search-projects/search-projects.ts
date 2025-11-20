import {Component, inject, OnInit} from '@angular/core';
import {SearchBar} from '@shared/ui/search-bar/search-bar';
import {ProfileType, ProjectType} from '@core/types/types.constans';
import {ProjectPreview} from '@shared/ui/project-preview/project-preview';
import {ProjectsService} from '@core/services/projects.service';

@Component({
  selector: 'app-search-projects',
  imports: [
    SearchBar,
    ProjectPreview
  ],
  templateUrl: './search-projects.html',
  styleUrl: './search-projects.css'
})
export class SearchProjects implements OnInit {

  projectsService = inject(ProjectsService);


  availableFilters = [
    // #TODO
    // {
    //   label: 'Class',
    //   options: [{label: 'All', value:''}, 1,2,3,4,5]
    // },
    // {
    //   label: 'Letter',
    //   options: [{label: 'All', value:''}, 'A', 'B', 'C']
    // },
    // {
    //   label: 'Department',
    //   options: [{label: 'All', value:''}, 'IF', 'WI', 'MB', 'EL']
    // }
  ];

  searchResults: ProjectType[] = [];

  onSubmitSearch(data: {value: string, filters: {[key: string]: any}}) {
    const res = this.projectsService.getProjects(data);
    res.then(data => this.searchResults=data);
  }

  ngOnInit() {
    this.projectsService.getProjects({value: '', filters: {}}).then(data => this.searchResults=data);
  }
}
