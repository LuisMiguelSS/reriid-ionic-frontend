import { Observable } from 'rxjs';
import { SuccessfullResponse } from './../../models/successfullresponse';
import { Geoposition, Geolocation } from '@ionic-native/geolocation/ngx';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

enum ResponseFields {
  data = 'data',
  latitude = 'latitude',
  longitude = 'longitude'
}

@Injectable({
  providedIn: 'root'
})
export class InternalAPIService {
  readonly baseURL = 'http://127.0.0.1:8000/api/';
  readonly apiKey = '1234';

  constructor(
    private http: HttpClient,
    private geopos: Geolocation
  ) { }

  getUser(loginToken: string) {
    return  this.http.get(this.baseURL + 'auth/user?api_key=' + this.apiKey,
        { headers: {Authorization: 'Bearer ' + loginToken} }
    );
  }

  getUserById(token: string, id: number) {
    return  this.http.get(this.baseURL + 'users/' + id + '?api_key=' + this.apiKey,
        { headers: {Authorization: 'Bearer ' + token} }
    );
  }

  logInUsingToken(token: string) {
    const data = new FormData();
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'login', data,
        { headers: {Authorization: 'Bearer ' + token} }
    );
  }

  logIn(login: string, password: string, rememberUser: boolean = false) {
    const data = new FormData();
    data.append('login', login);
    data.append('password', password);
    data.append('remember_me', rememberUser ? '1' : '0');
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'auth/login', data);
  }

  logOut(userToken: string) {
    const data = new FormData();
    data.append('api_key', this.apiKey);

    return  this.http.post(this.baseURL + 'auth/logout', data,
        { headers: {Authorization: 'Bearer ' + userToken} }
    );
  }

  deleteAccount(token: string, accountId: number) {
    return this.http.delete(this.baseURL + 'users/' + accountId + '?api_key=' + this.apiKey,
    { headers: {Authorization: 'Bearer ' + token} });
  }

  register(username: string,
           password: string,
           fullName: string,
           birthdate: Date,
           email: string,
           latitude?: number,
           longitude?: number,
           profilePicture?: any
           ) {

    const data = new FormData();
    data.append('username', username);
    data.append('password', password);
    data.append('fullname', fullName);
    data.append('email', email);

    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();

    const date = birthdate.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    data.append('birthdate', date);

    // Check location
    if (latitude && longitude) {
      data.append('lat', latitude + '');
      data.append('long', longitude + '');
    }

    // Check profile picture
    if (profilePicture) {
      data.append('photo', profilePicture);
    }
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'auth/register', data);

  }

  updateUser(
    token: string,
    id: number,
    fullname?: string,
    birthdate?: Date,
    profilePicture?: any,
    lat?: number, long?: number): Observable<any> {
    const data = new FormData();

    if (fullname) {
      data.append('fullname', fullname);
    }

    if (birthdate) {
      const month = birthdate.getMonth() + 1;
      const day = birthdate.getDate();
      const date = birthdate.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);

      data.append('birthdate', date);
    }

    if (profilePicture) {
      data.append('photo', this.getBlob(profilePicture, '.png'), 'myImage.png');
    }

    if (lat) {
      data.append('lat', lat + '');
    }

    if (long) {
      data.append('long', long + '');
    }
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'users/' + id, data,
      { headers: {Authorization: 'Bearer ' + token}});
  }

  usernameExists(username: string) {
    const data = new FormData();
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'check/username/' + username, data);
  }

  emailExists(username: string) {
    const data = new FormData();
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'check/email/' + username, data);
  }

  userExists(emailOrUsername: string) {
    const data = new FormData();
    data.append('api_key', this.apiKey);

    return this.http.post(this.baseURL + 'check/user/' + emailOrUsername, data);
  }

  nearbyPosts(token: string, nextPageUrl: string = null): Promise<any> {
    return new Promise( (resolve, reject) => {
      let lat = 0;
      let long = 0;

      let requestUrl: string = null;

      // Get user location
      this.getUser(token).toPromise().then( (response: SuccessfullResponse) => {
        if (response.data.latitude && response.data.longitude) {
          lat = response.data.latitude;
          long = response.data.longitude;
        } else {
          this.geopos.getCurrentPosition().then( (position: Geoposition) => {
            lat = position.coords.latitude;
            long = position.coords.latitude;
          });
        }

      }).then(() => {
        // Return http request
        if (nextPageUrl) {
          requestUrl = nextPageUrl;
        } else {
          requestUrl = this.baseURL + 'auth/posts/nearby?lat=' + lat +
                       '&long=' + long +
                       '&api_key=' + this.apiKey;
        }

        this.http.get(requestUrl, { headers: {Authorization: 'Bearer ' + token}}).toPromise().then(result => {
          resolve(result);
        });

      }).catch(e => reject(e));
    });
  }

  getPost(token: string, id: number) {
    return  this.http.get(this.baseURL + 'posts/' + id + '?api_key=' + this.apiKey,
        { headers: {Authorization: 'Bearer ' + token} }
    );
  }

  getUserPosts(token: string, userId: number) {
    return  this.http.get(this.baseURL + 'posts/user/' + userId + '?api_key=' + this.apiKey,
        { headers: {Authorization: 'Bearer ' + token} }
    );
  }
  editPost(token: string,
           postId: number,
           userId: number,
           description: string,
           images: Array<any>,
           bookTitle: string,
           bookSubtitle: string = '',
           bookSynopsis: string = '',
           bookIsbn: number = 0,
           bookAuthor: string = '',
           price: number
    ) {

    const data = new FormData();
    data.append('api_key', this.apiKey);
    data.append('user_id', userId + '');
    data.append('description', description);

    images.forEach((image, index) => {
      if (image.includes('http')) {
        console.log('It does');
        data.append('images[]', image);
      } else {
        console.log('It doesn\'t: ' + image);
        data.append('images[]', this.getBlob(image, '.png'), 'myImage' + index + '.png');
      }
    });
    data.append('book_title', bookTitle);
    data.append('price', price + '');

    if (bookSubtitle && bookSubtitle !== '') {
    data.append('book_subtitle', bookSubtitle);
    }
    if (bookSynopsis && bookSynopsis !== '') {
    data.append('book_synopsis', bookSynopsis);
    }
    if (bookIsbn && bookIsbn !== 0) {
    data.append('book_isbn', bookIsbn + '');
    }
    if (bookAuthor && bookAuthor !== '') {
    data.append('book_author', bookAuthor);
    }


    return this.http.post(this.baseURL + 'posts/' + postId, data,
      { headers: {Authorization: 'Bearer ' + token} });

  }

  addPost(token: string,
          userId: number,
          description: string,
          images: Array<any>,
          bookTitle: string,
          bookSubtitle: string = '',
          bookSynopsis: string = '',
          bookIsbn: number = 0,
          bookAuthor: string = '',
          price: number
          ) {

    const data = new FormData();
    data.append('api_key', this.apiKey);
    data.append('user_id', userId + '');
    data.append('description', description);

    images.forEach((image, index) => data.append('images[]', this.getBlob(image, '.png'), 'myImage' + index + '.png'));
    data.append('book_title', bookTitle);
    data.append('price', price + '');

    if (bookSubtitle && bookSubtitle !== '') {
      data.append('book_subtitle', bookSubtitle);
    }
    if (bookSynopsis && bookSynopsis !== '') {
      data.append('book_synopsis', bookSynopsis);
    }
    if (bookIsbn && bookIsbn !== 0) {
      data.append('book_isbn', bookIsbn + '');
    }
    if (bookAuthor && bookAuthor !== '') {
      data.append('book_author', bookAuthor);
    }


    return this.http.post(this.baseURL + 'posts/create', data,
        { headers: {Authorization: 'Bearer ' + token} });

  }

  private getBlob(b64Data: string, contentType: string, sliceSize: number= 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

}
