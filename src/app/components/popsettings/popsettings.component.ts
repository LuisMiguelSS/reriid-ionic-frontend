import { AlertService } from './../../alert/alert.service';
import { AuthenticatorService } from './../../auth/authenticator.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popsettings',
  templateUrl: './popsettings.component.html',
  styleUrls: ['./popsettings.component.scss'],
})
export class PopsettingsComponent implements OnInit {

  constructor(
    private authController: AuthenticatorService,
    private route: Router,
    private popoverController: PopoverController,
    private alertService: AlertService
  ) { }

  ngOnInit() {}

  logout() {
    this.dismiss();
    this.authController.logout();
  }

  deleteAccount() {
    this.alertService.showAlertDialog(
      'Delete Account?',
      'Are you sure you want to <strong>delete</strong> your account? ' +
      'You will still be able to recover it before <strong>30 days from now</strong> by logging in again.',
      [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirm Deletion',
          handler: () => {
            this.authController.deleteAccount().then(() => {
              this.alertService.showToast('We\'re sorry to see you go :(', 4000);
              this.logout();
              this.route.navigate(['login']);

            }).catch(_ => {
              this.alertService.showToast('We couldn\'t delete your account :(', 3000);
              
            }).finally( () => this.dismiss());
          }
        }
      ]
    );
  }

  async dismiss() {
    await this.popoverController.dismiss();
  }

}
