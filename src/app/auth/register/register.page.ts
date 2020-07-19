import { AlertService } from './../../alert/alert.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthenticatorService } from '../authenticator.service';
import { FormControl, FormGroup, Validators  } from '@angular/forms';
import { of } from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;

  formData = {
    username: '',
    fullname: '',
    birthdate: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  usernameAvailable = false;
  emailAvailable = false;

  //
  // Attributes
  params = {
    passwordLength: 6
  };

  showPassword = false;
  showConfirmPassword = false;

  //
  // Constructor
  constructor(
    private authService: AuthenticatorService,
    private alertService: AlertService,
    private route: Router
  ) {}

  ngOnInit() {
    // Initialize form validators
    this.registerForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-z0-9_.-]*$'),
        Validators.minLength(4),
        Validators.maxLength(15)
      ]),
      fullname: new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-zñáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑäëïöüÄËÏÖÜ ]+$'),
        Validators.minLength(3),
        Validators.maxLength(60)
      ]),
      birthdate: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-z0-9]*$'),
        Validators.minLength(8),
        Validators.maxLength(25)
      ]),
      confirmPassword: new FormControl('', Validators.required)
    });
  }

  //
  // Events
  onUsernameChange(value: string) {

    if (value) {
      of(value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((text) => {
           return this.authService.reriidAPI.usernameExists(text);
         })
     ).subscribe(response =>  this.usernameAvailable = !Boolean(response));
    } else {
      this.usernameAvailable = false;
    }

  }

  onEmailChange(value: string) {

    if (value) {
      of(value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((text) => {
           return this.authService.reriidAPI.emailExists(text);
         })
     ).subscribe(response =>  this.emailAvailable = !Boolean(response));
    } else {
      this.emailAvailable = false;
    }

  }

  onSubmit() {
    if (this.registerForm.invalid || !this.usernameAvailable || !this.emailAvailable) {
      return;
    }

    let didError = false;
    let errorTitle = 'Sorry! It\'s our fault :(';
    let errorMessages = 'Seems like we\'re having some trouble, try again later!';

    const username = this.registerForm.value.username;
    const email = this.registerForm.value.email;
    const fullname = this.registerForm.value.fullname;
    const birthdate = new Date(this.registerForm.value.birthdate);
    const password = this.registerForm.value.password;

    // Proccess
    this.alertService.showLoading()
      .then( (loadingElement: HTMLIonLoadingElement) => {
        loadingElement.present();

        // Try to register user
        this.authService.register(username, password, fullname, birthdate, email)
          .then(_ => this.registerForm.reset())
          .catch((error) => {
            didError = true;

            errorTitle = 'Oops, check your errors!';
            errorMessages = '';

            // Error mapping
            Object.keys(error.error.errors).forEach( (key, _) => {
              errorMessages += '\n-' + error.error.errors[key];
            });

          }).finally(() => {
            if (didError) {
              loadingElement.dismiss()
                .then(() => this.alertService.showAlert(errorTitle, errorMessages));

            } else {
              // Show Toast Notification
              loadingElement.dismiss()
                .then(() => {
                  this.alertService.showToast('Great! We just sent you a verification link to <b>' + email + '</b>', 5000);
                  this.goToLogin();
                });
            }
          });
      });

  }

  //
  // Other functions
  goToLogin() {
    this.route.navigate(['login']);
  }
}
