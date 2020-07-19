import { AlertService } from './../alert/alert.service';
import { SqliteService } from './../providers/database/sqlite.service';
import { User } from './../models/user';
import { SuccessfullResponse } from './../models/successfullresponse';
import { AuthenticatorService } from 'src/app/auth/authenticator.service';
import { InternalAPIService } from './../providers/reriid/internal-api.service';
import { TabsService } from './../providers/tabs/tabs.service';
import { ProfilePage } from './profile/profile.page';
import { DiscoverPage } from './discover/discover.page';
import { MessagesPage } from './messages/messages.page';
import { ChatService } from './../providers/chat/chat.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.page.html',
  styleUrls: ['./pages.page.scss'],
})
export class PagesPage implements OnInit {

  messages = MessagesPage;
  discover = DiscoverPage;
  profile = ProfilePage;

  constructor(
    public chatService: ChatService,
    public tabsService: TabsService,
    private reriidAPI: InternalAPIService,
    private authService: AuthenticatorService,
    private sqliteService: SqliteService,
    private alertService: AlertService
  ) {
    chatService.messages.subscribe(msg => {
      const from = 'from';
      const timestamp = 'timestamp';
      const realId = 'realId';
      const message = 'message';

      // Alert user with message
      if (msg[from]) {
        this.alertService.showToast(msg[from] + ': ' + msg[message], 3000, 'light', '', 'top');

        // Add message to the db and to the conversation
        this.sqliteService.addMessageToConversationWithUser(msg[realId], msg[from], {
          sender: msg[from],
          content: msg[message],
          sentAt: msg[timestamp],
          readAt: null
        });
      }

    });
  }

  ngOnInit() {

    // Load user data
    this.authService.getUserToken().then(token => {
      this.reriidAPI.getUser(token).toPromise().then((response: SuccessfullResponse) => {
        const data: User = response.data;

        data.date_of_birth = new Date(data.date_of_birth);
        this.authService.setUser(data);
      });
    });

  }

  shouldHide() {
    return this.tabsService.shouldHideBar();
  }

}
