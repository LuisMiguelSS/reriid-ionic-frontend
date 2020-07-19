import { TabsService } from './../../providers/tabs/tabs.service';
import { AlertService } from './../../alert/alert.service';
import { SuccessfullResponse } from './../../models/successfullresponse';
import { AuthenticatorService } from './../../auth/authenticator.service';
import { InternalAPIService } from './../../providers/reriid/internal-api.service';
import { PostPreview } from './../../models/postpreview';
import { Component, OnInit } from '@angular/core';
import { PostdetailService } from 'src/app/providers/post/postdetail.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  allPosts: PostPreview[] = [];
  nextPageUrl: string = null;
  searchValue = '';
  stoppedLoadingPosts = false;

  constructor(
    private route: Router,
    private reriidAPI: InternalAPIService,
    private authService: AuthenticatorService,
    private postDetailService: PostdetailService,
    private alertService: AlertService,
    private tabsService: TabsService
  ) {
    this.loadPosts();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.tabsService.showBar();
  }

  filterItems(event) {
    this.nextPageUrl = null;

    const value: string = event.detail.value;

    if (value && value.trim() !== '') {
      this.allPosts = this.allPosts.filter(post => {
        return post.post_title.toLowerCase().indexOf(value.toLowerCase()) > -1;
      });
    } else {
      this.allPosts = [];
      this.loadPosts();
    }

  }

  private loadPosts(event?) {
    this.stoppedLoadingPosts = false;
    this.authService.getUserToken().then(token => {
      this.reriidAPI.nearbyPosts(token, this.nextPageUrl).then((res: SuccessfullResponse) => {
        const jsonData: any[] = res.data;

        jsonData.forEach(post => {

          // Distance
          post.distance = Math.ceil(post.distance / 100) * 100;

          // Images
          if (post.post_images && post.post_images.length > 0) {
            const cleanedImages = [];

            // Clean images individually
            for (const image of post.post_images.replace('[', '').replace(']', '').split(',')) {
              cleanedImages.push(image);
            }
            post.post_images = cleanedImages;
            post.thumbnail = cleanedImages[0];
          } else {
            post.post_images = [];
            post.thumbnail = '../../../assets/images/old-books.webp';
          }

        });

        // tslint:disable-next-line: no-string-literal
        if (res['current_page'] === 1) {
          this.allPosts = this.allPosts.length === 0 ? jsonData : [...this.allPosts, jsonData];
        } else {
          const values: string[] = [];

          for (const key in jsonData) {
            if (res.data.hasOwnProperty(key)) {
              values.push(res.data[key]);
            }
          }

          this.allPosts = this.allPosts.length === 0 ? jsonData : [...this.allPosts, values];
        }

        // Get next page
        if (!res.data.next_page_url) {
          this.nextPageUrl = null;
        } else {
          this.nextPageUrl = res.data.next_page_url;
        }
      }).catch(e => {
        console.log('Didn\'t load any posts: ' + e);

        this.alertService.showToast(
          this.allPosts && this.allPosts.length > 0 ?
          'Could not load more posts' : 'Could not load any posts :(',
        2000);
      }).finally(() => this.stoppedLoadingPosts = true);
    });

    if (event) {
      event.target.complete();
    }
  }

  loadNewPosts(event) {
    if (this.nextPageUrl) {
      this.loadPosts(event);
    } else {
      event.target.disabled = true;
    }
  }

  viewPost(id: number) {
    this.postDetailService.setPostId(id);
    this.route.navigate(['/p/discover/details/' + id]);
  }

  openNewPost() {
    this.route.navigate(['/p/discover/new']);
  }

  doRefresh(event) {
    this.nextPageUrl = null;
    this.allPosts = [];
    this.loadPosts();
    event.target.complete();
  }

}
