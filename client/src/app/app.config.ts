import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

import {errorCatcher, loggingInterceptor} from '@shared/utils/interceptors';
import { provideServiceWorker } from '@angular/service-worker';
import { provideMarkdown } from 'ngx-markdown';

import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import * as heroOutlineIcons from '@ng-icons/heroicons/outline';
import * as heroSolidIcons from '@ng-icons/heroicons/solid';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loggingInterceptor, errorCatcher])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideMarkdown(),
    provideIcons({
      ...heroOutlineIcons,
      ...heroSolidIcons,
    }),
    provideNgIconsConfig({
      size: '2rem',
      strokeWidth: "1",
    })
  ],
};

