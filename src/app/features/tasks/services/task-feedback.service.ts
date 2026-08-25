import { inject, Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TaskFeedbackService {
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private translate = inject(TranslateService);

  async confirmDelete(title: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('taskDelete.header'),
      message: this.translate.instant('taskDelete.message', { title }),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        { text: this.translate.instant('common.delete'), role: 'destructive' },
      ],
    });

    await alert.present();

    const { role } = await alert.onWillDismiss();

    return role === 'destructive';
  }

  async notify(key: string, params?: Record<string, unknown>): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant(key, params),
      duration: 1800,
      position: 'top',
    });

    await toast.present();
  }
}
