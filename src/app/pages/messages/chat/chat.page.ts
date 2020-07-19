import { ModalController } from '@ionic/angular';
import { User, SqliteService, Message } from './../../../providers/database/sqlite.service';
import { TabsService } from './../../../providers/tabs/tabs.service';
import { ChatService } from './../../../providers/chat/chat.service';
import { Component, OnInit } from '@angular/core';
import { AuthenticatorService } from 'src/app/auth/authenticator.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  public messages: Message[] = [];
  public currentMessage = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthenticatorService,
    private modal: ModalController,
    private tabsService: TabsService,
    private sqliteService: SqliteService
  ) { }

  ngOnInit() {
    this.loadMessages();
  }

  ionViewWillEnter() {
    this.tabsService.hideBar();
  }

  getTalkingWithUser(): User {
    return this.chatService.talkingWithUser;
  }

  getUsername(): string {
    return this.authService.getUser().username;
  }

  sendMessage() {
    this.chatService.sendMessage({
      realId: this.authService.getUser().id,
      to: this.getTalkingWithUser().username,
      message: this.currentMessage
    });

    this.sqliteService.getChatWithUser(this.getTalkingWithUser().username).then(chat => {
      this.sqliteService.addMessage(this.getUsername(), this.currentMessage, new Date(), null, chat.id);
      this.currentMessage = '';
    });

  }

  loadMessages() {
    this.sqliteService.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.sqliteService.getChatWithUser(this.getTalkingWithUser().username).then(chat => {
          this.sqliteService.getMessages().subscribe(messages => {
            this.messages = messages.filter(message => {
              return message.chatId === chat.id;
            });
          });
        });
      }
    });
  }

}
