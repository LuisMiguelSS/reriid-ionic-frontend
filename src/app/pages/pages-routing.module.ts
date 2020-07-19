import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatorGuard } from '../auth/authenticator.guard';

import { PagesPage } from './pages.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'p',
    pathMatch: 'full'
  },

  {
    path: 'p',
    component: PagesPage,
    children: [
      {
        path: '',
        redirectTo: '/p/discover',
        pathMatch: 'full'
      },

      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
        canLoad: [AuthenticatorGuard]
      },
      {
        path: 'discover',
        loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule),
        canLoad: [AuthenticatorGuard]
      },
      {
        path: 'messages',
        loadChildren: () => import('./messages/messages.module').then( m => m.MessagesPageModule),
        canLoad: [AuthenticatorGuard]
      }
    ],
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesPageRoutingModule {}
