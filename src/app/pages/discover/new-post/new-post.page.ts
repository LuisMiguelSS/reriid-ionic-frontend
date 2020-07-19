import { AuthenticatorService } from 'src/app/auth/authenticator.service';
import { InternalAPIService } from './../../../providers/reriid/internal-api.service';
import { PictureSourceType } from '@ionic-native/camera';
import { AlertService } from './../../../alert/alert.service';
import { CameraService } from './../../../providers/camera/camera.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TabsService } from './../../../providers/tabs/tabs.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit {

  private win: any = window;

  addPostForm: FormGroup;
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
    private authService: AuthenticatorService
  ) { }

  ngOnInit() {
    // Initialize form validators
    this.addPostForm = new FormGroup({
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
    if (this.addPostForm.invalid) {
      return;
    }

    const bookTitle = this.addPostForm.value.book_title;
    const bookSubtitle = this.addPostForm.value.book_subtitle;
    const bookSynopsis = this.addPostForm.value.book_synopsis;
    const bookIsbn = this.addPostForm.value.book_isbn;
    const bookAuthor = this.addPostForm.value.book_author;
    const price = this.addPostForm.value.price;
    const description = this.addPostForm.value.description;

    // Proccess
    this.alertService.showLoading()
      .then( (loadingElement: HTMLIonLoadingElement) => {
        loadingElement.present();

        let didError = false;

        // Try to register user
        this.reriidAPI.addPost(
          this.userToken,
          this.authService.getUser().id,
          description,
          this.images.filter(Boolean),
          bookTitle,
          bookSubtitle,
          bookSynopsis,
          bookIsbn,
          bookAuthor,
          price).toPromise()
          .then(_ => this.addPostForm.reset())
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
                  this.alertService.showToast('Post created!', 3000);
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
        })).present().finally(() => loadingElement.dismiss());
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

  goToPost() {
    this.route.navigate(['/p/discover']);
  }

}
