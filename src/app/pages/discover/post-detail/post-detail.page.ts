import { AuthenticatorService } from 'src/app/auth/authenticator.service';
import { InternalAPIService } from './../../../providers/reriid/internal-api.service';
import { User } from './../../../models/user';
import { SqliteService } from './../../../providers/database/sqlite.service';
import { SuccessfullResponse } from './../../../models/successfullresponse';
import { TabsService } from './../../../providers/tabs/tabs.service';
import { Post } from './../../../models/post';
import { PostdetailService } from './../../../providers/post/postdetail.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SanitizerService } from 'src/app/providers/url/sanitizer.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: '../post-detail/post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})

export class PostDetailPage implements OnInit {

  data: Post;
  user: User;

  constructor(
    private route: Router,
    private postDetailService: PostdetailService,
    public sanitizer: SanitizerService,
    private tabsService: TabsService,
    private sqliteService: SqliteService,
    private reriidAPI: InternalAPIService,
    private authService: AuthenticatorService
  ) {
  }

  ngOnInit() {
    this.loadPostData();
  }

  @HostListener('document:ionBackButton', ['$event'])
  private async overrideHardwareBackAction($event: any) {
    await this.route.navigate(['/p']);
  }

  ionViewWillEnter() {
    this.tabsService.hideBar();
  }

  loadPostData() {
    this.postDetailService.getData().then(result => {
      result.toPromise().then((response: SuccessfullResponse) => {
        const cleanedImages = [];
        this.data = response.data;

        for (const image of response.data['images'].replace('[', '').replace(']', '').split(',')) {
          cleanedImages.push(image);
        }
        this.data.images = cleanedImages;

        // Load owner of post
        this.authService.getUserToken().then(token => {
          this.reriidAPI.getUserById(token, this.data.user_id).toPromise().then( (res: SuccessfullResponse) =>
            this.user = res.data);
        });
      });
    });
  }

  contactOwner(username: string) {
    this.sqliteService.userExists(username).then((result: boolean) => {
      if (!result) {
        this.sqliteService.addUser(this.user.id, username);
      }
      this.route.navigate(['/p/messages']);
    });
  }

  doRefresh(event) {
    this.loadPostData();
    event.target.complete();
  }

}
