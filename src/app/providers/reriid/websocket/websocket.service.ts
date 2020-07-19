import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';

export interface Message {
  message?: string;
  from?: string;
  realId?: number;
  to?: string;
  read?: boolean;
  timestamp?: Date;
}

export interface ConnectionData {
  username: string;
}

export interface WebSocketFrame {
  action: FrameActionType;
  data: Message | ConnectionData;
}

export enum FrameActionType {
  set = 'set',
  send = 'send-message'
}

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {

  static readonly websocketUrl = 'ws://127.0.0.1:50100';
  private subject: Rx.Subject<MessageEvent>;

  constructor() { }

  public connect(url: string): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Successfully connect to the WebsocketServer: ' + url);
    }

    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    const ws = new WebSocket(url);

    const observable = new Rx.Observable(
      (obs: Rx.Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.next.bind(obs);
        ws.onclose = obs.next.bind(obs);

        return ws.close.bind(obs);
      }
    );

    const observer = {
      next: (data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
      error: err => console.log(err),
      complete: () => {}
    };

    return new AnonymousSubject(observer, observable);
  }
}
