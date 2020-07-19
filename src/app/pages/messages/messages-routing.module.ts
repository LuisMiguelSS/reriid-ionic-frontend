import { ChatGuard } from './../../providers/chat/chat.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanLoad } from '@angular/router';

import { MessagesPage } from './messages.page';

const routes: Routes = [
  {
    path: '',
    component: MessagesPage
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule),
    canLoad: [ChatGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagesPageRoutingModule {}
