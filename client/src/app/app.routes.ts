import { Routes } from '@angular/router';
import {Layout} from '@app/pages/main/layout/layout';
import {SearchProjects} from '@app/pages/projects/search-projects/search-projects';
import {MyProjects} from '@app/pages/projects/my-projects/my-projects';
import {MorePagesComponent} from '@app/pages/main/more-pages-component/more-pages-component';
import {Marketplace} from '@app/pages/marketplace/marketplace';
import ProjectRoutes from '@app/pages/projects/project/project.routes';
import {Profile} from '@app/pages/profile/profile';
import {Feed} from '@app/pages/feed/feed';
import {News} from '@app/pages/news/news';
import {Login} from '@app/pages/login/login';
import {AuthGuard} from '@core/guards/auth.guard';
import {NotAuthGuard} from '@core/guards/notauth.guard';
import {Edit} from '@app/pages/profile/children/edit/edit';
import {Users} from '@app/pages/users/users';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'feed',
        component: Feed,
      },
      {
        path: 'projects',
        children: [
          {
            path: 'my',
            component: MyProjects,
            canActivate: [AuthGuard],
            pathMatch: 'full',
          },
          {
            path: 'search',
            component: SearchProjects,
            pathMatch: 'full',
          },
          {
            path: '',
            redirectTo: 'search',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'marketplace',
        component: Marketplace,
      },
      {
        path: 'news',
        canActivate: [AuthGuard],
        component: News,
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        component: Users,
      },
      {
        path: 'more',
        children: [
          {
            path: '',
            canActivate: [AuthGuard],
            component: MorePagesComponent,
          },
          {
            path: 'login',
            canActivate: [NotAuthGuard],
            component: Login,
          },
        ],
      },
      {
        path: 'profile/me/edit',
        canActivate: [AuthGuard],
        component: Edit,
      },
      {
        path: 'profile/:id',
        component: Profile,
      },
      {
        path: 'profile',
        redirectTo: '/profile/me',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'projects/:project_id',
    children: ProjectRoutes,
  },
  {
    path: '**',
    redirectTo: '/feed',
    pathMatch: 'full',
  },
];
