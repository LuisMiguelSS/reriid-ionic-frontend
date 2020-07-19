import { SuccessfullResponse } from './../../models/successfullresponse';
import { User } from './../database/sqlite.service';
import { WebsocketService, Message, WebSocketFrame, FrameActionType } from './../reriid/websocket/websocket.service';
import { Subject, Observable } from 'rxjs';
import { AuthenticatorService } from './../../auth/authenticator.service';
import { InternalAPIService } from './../reriid/internal-api.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class ChatService {

  public messages: Subject<WebSocketFrame>;
  public talkingWithUser: User = null;

  constructor(
    public reriidAPI: InternalAPIService,
    public authService: AuthenticatorService,
    private wsService: WebsocketService
  ) {

    this.messages = wsService
      .connect(WebsocketService.websocketUrl)
      .pipe(map((response: MessageEvent): WebSocketFrame | Message => {
        const data = JSON.parse(response.data);

        // Check if corresponds to a normal message or not
        if (data.from) {
          return data;
        }

        return {
          action: data.action,
          data: data.data
        };
      })) as Subject<WebSocketFrame>;

    this.markAsAvailable();
  }

  private markAsAvailable() {
    this.authService.getUserToken().then(token => {
      this.reriidAPI.getUser(token).toPromise().then( (response: SuccessfullResponse) => {
        this.messages.next({
          action: FrameActionType.set,
          data: {
            username: response.data.username
          },
        });
      });
    });
  }

  sendMessage(text: Message) {
    console.log('WebSocket: Message sent: ' + JSON.stringify(text) + '\n Cooler: ' + JSON.stringify({
      action: FrameActionType.send,
      data: text
    }));
    this.messages.next({
      action: FrameActionType.send,
      data: text
    });
  }

  getReceivedMessages(): Observable<WebSocketFrame> {
    return this.messages;
  }

}
