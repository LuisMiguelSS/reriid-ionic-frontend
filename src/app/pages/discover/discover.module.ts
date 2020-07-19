import { PipesCommonModule } from './../../pipes/pipes-common/pipes-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoverPageRoutingModule } from './discover-routing.module';

import { DiscoverPage } from './discover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscoverPageRoutingModule,
    TranslateModule,
    PipesCommonModule
  ],
  declarations: [DiscoverPage]
})
export class DiscoverPageModule {}
