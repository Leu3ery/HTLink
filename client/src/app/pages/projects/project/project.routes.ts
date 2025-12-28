import {ProjectLayout} from '@app/pages/projects/project/children/project-layout/project-layout';
import {Main} from './children/main/main';
import {Comments} from './children/comments/comments';
import {Settings} from './children/settings/settings';
import {Contributors} from "./children/contributors/contributors";

import SettingsRoutes from "./children/settings/settings.routes";
import settingsRoutes from "./children/settings/settings.routes";


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
        path: "contributors",
        component: Contributors
      },
      ...settingsRoutes,
      {
        path: "**",
        redirectTo: 'home',
      }
    ]
  }
]
