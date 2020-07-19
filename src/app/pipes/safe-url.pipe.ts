import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: any, ..._: unknown[]): unknown {
    return this.domSanitizer.bypassSecurityTrustUrl((value as string).replace(/"/g, ''));
  }

}