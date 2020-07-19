import { AlertService } from './../../alert/alert.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthenticatorService } from '../authenticator.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { of } from 'rxjs';

const accessToken = 'access_token';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  loginForm: FormGroup;

  formData = {
    emailUsername: '',
    password: '',
    rememberMe: ''
  };

  userExists = false;

  params = {
    passwordLength: 6
  };

  showPassword = false;
  rememberMe = true;

  //
  // Constructor
  constructor(private route: Router,
              private authService: AuthenticatorService,
              private alertService: AlertService) { }

  ngOnInit() {
    // Initialize form validators
    this.loginForm = new FormGroup({
      emailUsername: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl('')
    });

    this.tokenLogin();
  }

  tokenLogin() {
    // Check if already logged in (remember_me token)
    this.alertService.showLoading('Logging in...')
    .then( (loadingElement: HTMLIonLoadingElement) => {
      loadingElement.present();

      this.authService.getUserToken().then(token => {

        this.authService.loginUsingToken(token).toPromise().then(_ => {
        this.authService.userLogged = true;
        loadingElement.dismiss();
        this.goToHome();

        }).catch(_ => this.alertService.showToast('We couldn\'t log you automatically', 3000)
        ).finally(() => loadingElement.dismiss());
      }).catch(e => console.log('ngOnInit Error1: ' + e));

    }).catch(e => console.log('ngOnInit Error2: ' + e));
  }

  //
  // Events
  onUsernameOrEmailChange(value: string) {

    if (value) {
      of(value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((text) => {
           return this.authService.reriidAPI.userExists(text);
         })
     ).subscribe(response => this.userExists = Boolean(response));
    } else {
      this.userExists = false;
    }

  }

  onSubmit() {
    if (this.loginForm.invalid || !this.userExists) {
      return;
    }

    const emailUsername = this.loginForm.value.emailUsername;
    const password = this.loginForm.value.password;

    // Proccess
    this.alertService.showLoading('Logging in...')
      .then(loadingElement => {
        loadingElement.present();

        // Try to login user
        this.authService.login(emailUsername, password, this.rememberMe).toPromise().then( (response: Response) => {

          // Success
          this.loginForm.reset();
          this.authService.userLogged = true;

          this.authService.storeUserToken(response[accessToken]);

          this.goToHome();

        }).catch((error) => {
          let message = '';
          console.log('Form submit error: ' + error);

          switch (error.status) {
            case 500:
              message = 'This error is our fault, please try again later :(';
              break;
            default:
              Object.keys(error.error.errors).forEach( (key, value) => {
                message += '\n-' + error.error.errors[key];
              });
              break;
          }

          this.alertService.showAlert('Oops!', message);

        }).finally(() => loadingElement.dismiss() );
      });

  }

  doRefresh(event) {
    this.loginForm.reset();
    this.tokenLogin();
    event.target.complete();
  }

  goToRegister() {
    this.route.navigate(['register']);
  }

  goToHome() {
    this.route.navigate(['p']);
  }

}
