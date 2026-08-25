import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { 
  IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList,
  IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet 
} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink, RouterLinkActive, IonApp, IonMenu, IonContent, 
    IonList, IonListHeader, IonItem, IonIcon, IonLabel, 
    IonMenuToggle, IonRouterOutlet
  ],
})
export class AppComponent {
  readonly sections = [
    { path: '/tasks', label: 'Tareas', icon: 'checkbox-outline' },
    { path: '/tasks/agenda', label: 'Agenda', icon: 'calendar-outline' },
    { path: '/tasks/alerts', label: 'Avisos', icon: 'notifications-outline' },
    { path: '/categories', label: 'Categorías', icon: 'pricetags-outline' },
  ];
}
