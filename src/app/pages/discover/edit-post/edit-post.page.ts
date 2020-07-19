import { Post } from './../../../models/post';
import { PostdetailService } from './../../../providers/post/postdetail.service';
import { SuccessfullResponse } from './../../../models/successfullresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { TabsService } from 'src/app/providers/tabs/tabs.service';
import { CameraService } from 'src/app/providers/camera/camera.service';
import { AlertService } from 'src/app/alert/alert.service';
import { ActionSheetController } from '@ionic/angular';
import { InternalAPIService } from 'src/app/providers/reriid/internal-api.service';
import { Router } from '@angular/router';
import { AuthenticatorService } from 'src/app/auth/authenticator.service';
import { PictureSourceType } from '@ionic-native/camera';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.page.html',
  styleUrls: ['./edit-post.page.scss'],
})
export class EditPostPage implements OnInit {

  originalPost: Post;
  postTitle = '';
  postSubtitle = '';
  postSynopsis = '';
  postDescription = '';
  postIsbn = 0;
  postAuthor = '';
  postPrice = 0;

  private win: any = window;

  editPostForm: FormGroup;
  userToken = '';

  images = [];

  formData = {
    description: '', // Mandatory
    book_title: '', // Mandatory
    book_subtitle: '',
    book_synopsis: '',
    book_isbn: '',
    book_author: '',
    price: '', // Mandatory
  };

  constructor(
    private tabsService: TabsService,
    private cameraService: CameraService,
    private alertService: AlertService,
    private actionSheetController: ActionSheetController,
    private reriidAPI: InternalAPIService,
    private route: Router,
    private authService: AuthenticatorService,
    private postDetailService: PostdetailService
  ) { }

  ngOnInit() {
    this.loadPostData();

    // Initialize form validators
    this.editPostForm = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]),
      book_title: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]),
      book_subtitle: new FormControl('', [
        Validators.maxLength(20)
      ]),
      book_synopsis: new FormControl('', [
        Validators.maxLength(200)
      ]),
      book_isbn: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(13)
      ]),
      book_author: new FormControl('', [
        Validators.maxLength(30)
      ]),
      price: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  ionViewWillEnter() {
    this.tabsService.hideBar();
    this.authService.getUserToken()
      .then(token => this.userToken = token)
      .catch(error => console.log('Could not get user token: ' + error));
  }

  onSubmit() {
    if (this.editPostForm.invalid) {
      return;
    }

    // Proccess
    this.alertService.showLoading()
      .then( (loadingElement: HTMLIonLoadingElement) => {
        loadingElement.present();

        let didError = false;

        // Try to register user
        this.reriidAPI.editPost(
          this.userToken,
          this.originalPost.id,
          this.authService.getUser().id,
          this.postDescription,
          this.images.filter(Boolean),
          this.postTitle,
          this.postSubtitle,
          this.postSynopsis,
          this.postIsbn,
          this.postAuthor,
          this.postPrice).toPromise()
          .then(_ => this.editPostForm.reset())
          .catch((error) => {
            let errorMessages = 'We made a mistake! Try again';
            didError = true;
            console.log(JSON.stringify(error.error));

            if (error.error.errors) {
              errorMessages = '';
              // Error mapping
              Object.keys(error.error.errors).forEach( (key, _) => {
                errorMessages += '<br>-' + error.error.errors[key];
              });
            }

            loadingElement.dismiss();

            this.alertService.showAlert(errorMessages === '' ? 'Oops' : 'Check your errors!', errorMessages);

          }).finally(() => {
            if (!didError) {
              // Show Toast Notification
              loadingElement.dismiss()
                .then(() => {
                  this.alertService.showToast('Post modified!', 3000);
                  this.goToPost();
                });
            }
          });
      });

  }

  async pickImage() {

    this.alertService.showLoading('Uploading image...')
      .then(async loadingElement => {

        (await this.actionSheetController.create({
          header: 'Select a source',
          buttons: [
            {
              // Camera
              text: 'Use Camera',
              handler: () => {
                loadingElement.present();
                this.cameraService.takePicture(PictureSourceType.CAMERA)
                .then(file => {
                  loadingElement.present();

                  // Add image to array
                  if (this.canAddMoreImages()) {
                    this.addImage(this.win.Ionic.WebView.convertFileSrc(file));
                  } else {
                    this.alertService.showToast('You\'ve reached the limit of 4 images!');
                  }

                })
                .catch(error => {
                  this.alertService.showToast('We couldn\'t use the camera', 2000);
                  console.log('An error ocurred while taking a picture: ' + error);
                })
                .finally(() => loadingElement.dismiss());
              },
            },
            {
              // Local file
              text: 'From Gallery',
              handler: () => {
                loadingElement.present();
                this.cameraService.takePicture(PictureSourceType.PHOTOLIBRARY)
                .then(file => {

                  // Add image to array
                  if (this.canAddMoreImages()) {
                    this.addImage(this.win.Ionic.WebView.convertFileSrc(file));
                  } else {
                    this.alertService.showToast('You\'ve reached the limit of 4 images!');
                  }

                })
                .catch(error => {
                  this.alertService.showToast('We couldn\'t load the image', 2000);
                  console.log('An error ocurred while picking an image from the gallery: ' + error);
                })
                .finally(() => loadingElement.dismiss());
              }
            },
            {
              // Cancel the Action Sheet
              text: 'Cancel',
              role: 'cancel'
            }
          ]
        })).present().finally(() => {
          loadingElement.dismiss();
          this.loadPostData();
        });
      });

  }

  loadPostData() {
    this.postDetailService.getData().then(result => {
      result.toPromise().then((response: SuccessfullResponse) => {
        const cleanedImages = [];
        this.originalPost = response.data;

        for (const image of response.data['images'].replace('[', '').replace(']', '').split(',')) {
          cleanedImages.push(image);
        }
        this.originalPost.images = cleanedImages;
        this.images = cleanedImages;

        this.postTitle = this.originalPost.book_title;
        this.postSubtitle = this.originalPost.book_subtitle;
        this.postSynopsis = this.originalPost.book_synopsis;
        this.postDescription = this.originalPost.description;
        this.postAuthor = this.originalPost.book_author;
        this.postIsbn = this.originalPost.book_isbn;
        this.postPrice = this.originalPost.book_price;
      });
    });
  }

  removeImage(index: number = -1) {
    if (index !== -1) {
      this.images.splice(index, 1);
    } else {
      this.alertService.showToast('We couldn\'t delete the image');
    }
  }

  addImage(image) {
    this.images.push(image);
  }

  canAddMoreImages() {
    return this.images && this.images.length < 4;
  }

  doRefresh(event) {
    this.loadPostData();
    event.target.complete();
  }

  goToPost() {
    this.route.navigate(['/p/discover']);
  }


}
