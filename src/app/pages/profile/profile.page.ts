import { PictureSourceType } from '@ionic-native/camera/ngx';
import { AlertService } from './../../alert/alert.service';
import { CameraService } from './../../providers/camera/camera.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostdetailService } from 'src/app/providers/post/postdetail.service';
import { SuccessfullResponse } from './../../models/successfullresponse';
import { InternalAPIService } from './../../providers/reriid/internal-api.service';
import { User } from './../../models/user';
import { TabsService } from './../../providers/tabs/tabs.service';
import { AuthenticatorService } from './../../auth/authenticator.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { PopoverController, ActionSheetController } from '@ionic/angular';
import { PopsettingsComponent } from 'src/app/components/popsettings/popsettings.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private win: any = window;

  user: User;
  userPosts: Array<Post> = [];
  sliderOptions = {
    effect: 'slide',
    loop: true,
    slidesPerView: 2,
    centeredSlides: true,
    spaceBetween: 20,
    autoHeight: true
  };

  // Account Edit
  editProfileForm: FormGroup;

  newImage: string;
  fullnameField: string;

  formData = {
    fullname: '',
    birthdate: ''
  };

  constructor(
    public authController: AuthenticatorService,
    public route: Router,
    private tabsService: TabsService,
    private reriidAPI: InternalAPIService,
    private postDetailService: PostdetailService,
    private popoverController: PopoverController,
    private alertService: AlertService,
    private cameraService: CameraService,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.loadData();

    // Initialize form validators
    this.editProfileForm = new FormGroup({
      fullname: new FormControl('', [
        Validators.pattern('^[A-zñáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑäëïöüÄËÏÖÜ ]+$'),
        Validators.minLength(3),
        Validators.maxLength(60)
      ]),
      birthdate: new FormControl('')
    });
  }

  ionViewWillEnter() {
    this.tabsService.showBar();
  }

  async pickImage() {

    if (this.newImage) {
      this.newImage = null;
      return;
    }

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

                  // Display image
                  this.newImage = this.win.Ionic.WebView.convertFileSrc(file);
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
                this.cameraService.takePicture(PictureSourceType.PHOTOLIBRARY)
                .then(file => {
                  loadingElement.present();

                  // Display image
                  this.newImage = this.win.Ionic.WebView.convertFileSrc(file);
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

  onSubmit() {
    let didError = false;
    let errorTitle = 'Oops!';
    let errorMessages = 'We couldn\'t update your profile :(';

    this.alertService.showLoading('Updating your profile...')
      .then((loadingElement: HTMLIonLoadingElement) => {
        loadingElement.present();

        // Update data
        this.authController.getUserToken().then(token => {
          let fullNamesAreDifferent = false;
          let birthdatesAreDifferent = false;

          if (this.fullnameField !== this.user.full_name) {
            fullNamesAreDifferent = true;
          }

          if (this.editProfileForm.value.birthdate !== this.user.date_of_birth) {
            birthdatesAreDifferent = true;
          }

          if (fullNamesAreDifferent && this.editProfileForm.value.birthdate) {
            if (birthdatesAreDifferent) {
              if (this.newImage) {
                console.log('Fullname, birthdate & image');
                // Fullname, birthdate & image
                this.reriidAPI.updateUser(token, this.authController.getUser().id,
                  this.fullnameField,
                  new Date(this.editProfileForm.value.birthdate),
                  this.newImage).toPromise()
                  .then( (response: SuccessfullResponse) => {
                    this.authController.setUser(response.data);
                  });
              } else {
                console.log('Fullname & birthdate');
                // Fullname & birthdate
                this.reriidAPI.updateUser(token, this.authController.getUser().id,
                this.fullnameField,
                new Date(this.editProfileForm.value.birthdate)).toPromise()
                .then( (response: SuccessfullResponse) => {
                  this.authController.setUser(response.data);
                });
              }
            } else {
              if (this.newImage) {
                console.log('Fullname & image');
                // Fullname & image
                this.reriidAPI.updateUser(token, this.authController.getUser().id,
                this.fullnameField, null, this.newImage).toPromise()
                .then( (response: SuccessfullResponse) => {
                  this.authController.setUser(response.data);
                });
              } else {
                console.log('Fullname');
                // Fullname only
                this.reriidAPI.updateUser(token, this.authController.getUser().id,
                this.fullnameField).toPromise()
                .then( (response: SuccessfullResponse) => {
                  this.authController.setUser(response.data);
                });
              }
            }
          } else if (this.editProfileForm.value.birthdate) {
            if (this.newImage) {
              console.log('Birthdate & image');
              // Birthdate & image
              this.reriidAPI.updateUser(token, this.authController.getUser().id,
              null, this.editProfileForm.value.birthdate, this.newImage).toPromise()
              .then( (response: SuccessfullResponse) => {
                this.authController.setUser(response.data);
              });
            } else {
              console.log('Birthdate');
              // Only birthdate
              this.reriidAPI.updateUser(token, this.authController.getUser().id,
              null, this.editProfileForm.value.birthdate).toPromise()
              .then( (response: SuccessfullResponse) => {
                this.authController.setUser(response.data);
              });
            }
          } else if(this.newImage) {
            // Only Image
            this.reriidAPI.updateUser(token, this.authController.getUser().id,
            null, null, this.newImage).toPromise()
            .then( (response: SuccessfullResponse) => {
              this.authController.setUser(response.data);
            });
          }

          this.loadData();
          this.newImage = null;
        }).catch(error => {
          didError = true;
          errorTitle = 'Oops, check your errors!';

          if (error.error.errors) {
            errorMessages = '';

            // Error mapping
            Object.keys(error.error.errors).forEach( (key, _) => {
                errorMessages += '\n-' + error.error.errors[key];
            });

          }

          }).finally(() => {
            if (didError) {
              loadingElement.dismiss()
                .then(() => this.alertService.showAlert(errorTitle, errorMessages));

            } else {
              // Show Toast Notification
              loadingElement.dismiss()
                .then(() => {
                  this.alertService.showToast('Great! Your account has been updated!', 5000);
                });
            }
          });
    });

  }

  doRefresh(event) {
    this.loadData();
    event.target.complete();
  }

  loadData() {
    this.newImage = null;
    this.userPosts = [];
    this.user = this.authController.getUser();
    this.fullnameField = this.user.full_name;

    this.authController.getUserToken().then(token => {
      this.reriidAPI.getUserPosts(token, this.authController.getUser().id).toPromise()
        .then( (response: SuccessfullResponse) => {
          for (const key in response.data) {
            if (response.data.hasOwnProperty(key)) {

              // Clean images of post on the way
              const cleanedImages = [];
              for (const image of response.data[key].images.replace('[', '').replace(']', '').split(',')) {
                cleanedImages.push(image);
              }

              response.data[key].images = cleanedImages;

              this.userPosts.push(response.data[key]);

            }
          }

        });
    });
  }

  viewPost(id) {
    this.postDetailService.setPostId(id);
    this.route.navigate(['/p/discover/edit/' + id]);
  }

  async openOptions(eventAction) {
    const popover = await this.popoverController.create( {
      component: PopsettingsComponent,
      event: eventAction
    });

    popover.present();
  }

}
