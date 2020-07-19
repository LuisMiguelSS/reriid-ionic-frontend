import { Injectable } from '@angular/core';
import { CanLoad, Router, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticatorService } from './authenticator.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorGuard implements CanLoad {

  //
  // Constructor
  constructor(
    private authenticator: AuthenticatorService,
    private router: Router) {
  }

  // CanLoad
  canLoad( route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.authenticator.isUserLoggedIn() ? true : this.router.navigate(['login']);
  }
}
