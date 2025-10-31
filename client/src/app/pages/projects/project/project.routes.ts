import {ProjectLayout} from '@app/pages/projects/project/children/project-layout/project-layout';
import {Main} from './children/main/main';
import {Comments} from './children/comments/comments';
import {Roles} from './children/roles/roles';
import {Settings} from './children/settings/settings';

export default [
  {
    path: '',
    component: ProjectLayout,
    children: [
      {
        path: "home",
        component: Main
      },
      {
        path: "comments",
        component: Comments
      },
      {
        path: "roles",
        component: Roles
      },
      {
        path: "settings",
        component: Settings
      },
      {
        path: "**",
        redirectTo: "home"
      }
    ]
  }
]
