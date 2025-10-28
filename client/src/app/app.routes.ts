import { Routes } from '@angular/router';
import {Layout} from '@app/pages/main/layout/layout';
import {SearchProjects} from '@app/pages/projects/search-projects/search-projects';
import {MyProjects} from '@app/pages/projects/my-projects/my-projects';
import {MorePagesComponent} from '@app/pages/more-pages-component/more-pages-component';
import {Marketplace} from '@app/pages/marketplace/marketplace';
import ProjectRoutes from '@app/pages/projects/project/project.routes';
import {Profile} from '@app/pages/profile/profile';
import {Feed} from '@app/pages/feed/feed';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'feed',
        component: Feed
      },
      {
        path: "projects",
        children: [
          {
            path: "my",
            component: MyProjects,
            pathMatch: 'full'
          },
          {
            path: "search",
            component: SearchProjects,
            pathMatch: 'full'
          }
        ]
      },
      {
        path: "marketplace",
        component: Marketplace,
      },
      {
        path: "more",
        component: MorePagesComponent
      },
      {
        path: "profile/:id",
        component: Profile
      },
      {
        path: "profile",
        redirectTo: "/profile/me",
        pathMatch: 'full'
      },
      {
        path: "**",
        redirectTo: "feed"
      }
    ],
  },
  {
    path: 'projects/:id',
    children: ProjectRoutes
  },
];
