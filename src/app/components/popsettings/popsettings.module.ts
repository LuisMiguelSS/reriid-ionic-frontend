import { PopsettingsComponent } from 'src/app/components/popsettings/popsettings.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [PopsettingsComponent]
})

export class PopsettingsComponentModule {}