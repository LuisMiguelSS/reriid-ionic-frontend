import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    public toastController: ToastController,
    public loadingController: LoadingController,
    private alertController: AlertController,
  ) { }

  async showToast(
    text: string,
    timeDisplayed: number = 1000,
    backColor: string = 'primary',
    cssClasses?: string,
    location: any = 'bottom') {

    const toast = this.toastController.create({
      message: text,
      duration: timeDisplayed,
      cssClass: cssClasses,
      keyboardClose: true,
      animated: true,
      color: backColor,
      position: location,
    });

    return (await toast).present();
  }

  showAlert(title: string, text: string) {
    this.alertController
      .create({
        header: title,
        message: text,
        buttons: ['Ok']
      })
      .then(alertEl => alertEl.present());
  }

  async showAlertDialog(title: string, msg: string, alertButtons) {
    (await this.alertController.create( {
      header: title,
      message: msg,
      buttons: alertButtons
    })).present();
  }

  async showLoading(text: string = '', closeKeyboard: boolean = true) {
    return this.loadingController.create({
      message: text,
      keyboardClose: closeKeyboard
    });
  }

}
