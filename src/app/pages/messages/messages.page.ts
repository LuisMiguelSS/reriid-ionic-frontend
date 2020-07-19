import { SuccessfullResponse } from './../../models/successfullresponse';
import { AuthenticatorService } from './../../auth/authenticator.service';
import { InternalAPIService } from './../../providers/reriid/internal-api.service';
import { SqliteService, User } from './../../providers/database/sqlite.service';
import { TabsService } from './../../providers/tabs/tabs.service';
import { ChatService } from './../../providers/chat/chat.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  contacts: User[] = [];

  constructor(
    private route: Router,
    private chatService: ChatService,
    private tabsService: TabsService,
    private sqliteService: SqliteService,
    private reriidAPI: InternalAPIService,
    private authService: AuthenticatorService
  ) { }

  ngOnInit() {
    this.loadChats();
  }

  ionViewWillEnter() {
    this.tabsService.showBar();
  }

  openChat(user: User) {
    this.chatService.talkingWithUser = user;
    this.route.navigate(['p/messages/chat']);
  }

  loadChats() {
    this.sqliteService.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.sqliteService.getUsers().subscribe(users => {
          let loadedUsers = users;

          // Load thumbnails
          this.authService.getUserToken().then(token => {
            users.forEach((user, index) => {
              this.reriidAPI.getUserById(token, user.realId).toPromise().then( (response: SuccessfullResponse) => {
                loadedUsers[index].thumbnail = response.data.profile_pic;
              });
            });
          }).then(() => this.contacts = loadedUsers);
        });
      }
    });
  }

  doRefresh(event) {
    this.loadChats();
    event.target.complete();
  }

}
