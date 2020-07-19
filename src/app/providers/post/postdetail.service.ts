import { InternalAPIService } from './../reriid/internal-api.service';
import { Injectable } from '@angular/core';
import { AuthenticatorService } from 'src/app/auth/authenticator.service';

@Injectable({
  providedIn: 'root'
})
export class PostdetailService {

  private currentPostId = 0;

  constructor(
    private reriidAPI: InternalAPIService,
    private authService: AuthenticatorService
  ) {

  }

  setPostId(id: number): void {
    this.currentPostId = id;
  }

  getPostId(): number {
    return this.currentPostId;
  }

  getData() {
    return this.authService.getUserToken().then(token => {
      return this.reriidAPI.getPost(token, this.currentPostId);
    });
  }
}
