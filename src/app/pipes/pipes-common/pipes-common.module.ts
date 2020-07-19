import { SafeUrlPipe } from './../safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [SafeUrlPipe],
  imports: [
    CommonModule
  ],
  exports: [SafeUrlPipe]
})
export class PipesCommonModule { }
