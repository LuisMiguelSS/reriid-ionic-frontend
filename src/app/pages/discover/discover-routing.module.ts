import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverPage } from './discover.page';
import { AuthenticatorGuard } from 'src/app/auth/authenticator.guard';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage,
  },
  {
    path: 'details/:id',
    loadChildren: () => import('./post-detail/post-detail.module').then( m => m.PostDetailPageModule),
    canLoad: [AuthenticatorGuard]
  },
  {
    path: 'new',
    loadChildren: () => import('./new-post/new-post.module').then( m => m.NewPostPageModule),
    canLoad: [AuthenticatorGuard]
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./edit-post/edit-post.module').then( m => m.EditPostPageModule),
    canLoad: [AuthenticatorGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverPageRoutingModule {}
