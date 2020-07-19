import { AlertService } from './../alert/alert.service';
import { Storage } from '@ionic/storage';
import { User } from './../models/user';
import { Injectable } from '@angular/core';
import { InternalAPIService } from '../providers/reriid/internal-api.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticatorService {
  userLogged = false;

  private user: User;

  constructor(
    private alertService: AlertService,
    public reriidAPI: InternalAPIService,
    public storage: Storage
  ) { }

  getUser() {
    return this.user;
  }

  setUser(user: User) {
    this.user = user;
  }

  isUserLoggedIn() {
    return this.userLogged;
  }

  getUserToken() {
    return this.storage.get('remember_token');
  }

  storeUserToken(token: string) {
    this.storage.set('remember_token', token);
  }

  loginUsingToken(token: string) {
    return this.reriidAPI.logInUsingToken(token);
  }

  login(login: string, password: string, rememberUser: boolean = false) {
    return this.reriidAPI.logIn(login, password, rememberUser);
  }

  logout() {
    this.getUserToken().then(token => {
      this.storage.remove('remember_token');
      return this.reriidAPI.logOut(token);

    }).catch((error: Response) => {
      if (error.status === 401) {
        this.alertService.showToast('We couldn\'t log you in automatically', 3000);
      }
    });
  }

  register(username: string,
           password: string,
           fullName: string,
           birthdate: Date,
           email: string,
           profilePicture?: any): Promise<any> {

    if (profilePicture) {
      return this.reriidAPI.register(username,
          password, fullName,
          birthdate, email,
          profilePicture).toPromise();

    } else {
      return this.reriidAPI.register(username, password, fullName, birthdate, email).toPromise();
    }

  }

  deleteAccount(): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.getUserToken().then(token => {
        this.reriidAPI.deleteAccount(token, this.getUser().id).toPromise().then(_ => {
          resolve();
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

}
