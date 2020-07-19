import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabsService {

  private shouldHide = false;

  constructor() { }

  showBar() {
    this.shouldHide = false;
  }

  hideBar() {
    this.shouldHide = true;
  }

  shouldHideBar(): boolean {
    return this.shouldHide;
  }
}
