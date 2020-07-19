import { PipesCommonModule } from './../../../pipes/pipes-common/pipes-common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPostPageRoutingModule } from './edit-post-routing.module';

import { EditPostPage } from './edit-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPostPageRoutingModule,
    ReactiveFormsModule,
    PipesCommonModule
  ],
  declarations: [EditPostPage]
})
export class EditPostPageModule {}
