import {ProjectLayout} from '@app/pages/projects/project/children/project-layout/project-layout';
import {Project} from './project';

export default [
  {
    path: '',
    component: ProjectLayout,
    children: [
      {
        path: "",
        component: Project
      }
    ]
  }
]
