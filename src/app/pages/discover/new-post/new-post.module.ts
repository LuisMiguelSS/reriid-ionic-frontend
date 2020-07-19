import { PipesCommonModule } from './../../../pipes/pipes-common/pipes-common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPostPageRoutingModule } from './new-post-routing.module';

import { NewPostPage } from './new-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPostPageRoutingModule,
    ReactiveFormsModule,
    PipesCommonModule
  ],
  declarations: [NewPostPage]
})
export class NewPostPageModule {}
