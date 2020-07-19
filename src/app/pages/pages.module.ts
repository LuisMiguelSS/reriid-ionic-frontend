import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { PagesPageRoutingModule } from './pages-routing.module';

import { PagesPage } from './pages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagesPageRoutingModule,
    TranslateModule
  ],
  declarations: [PagesPage],
})
export class PagesPageModule {}
