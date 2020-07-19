import { ChatService } from './chat.service';
import { Injectable } from '@angular/core';
import { Route, CanLoad, UrlSegment, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatGuard implements CanLoad {

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  canLoad( _: Route, __: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.chatService.talkingWithUser ? true : this.router.navigate(['p/messages']);
  }

}
