import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { RemoteConfigActions } from './features/remote-config/store/remote-config.actions';
import { selectDarkModeEnabled } from './features/remote-config/store/remote-config.selectors';

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
export class AppComponent implements OnInit {
  private store = inject(Store);

  private readonly darkModeEnabled = this.store.selectSignal(selectDarkModeEnabled);

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('ion-palette-dark', this.darkModeEnabled());
    });
  }

  ngOnInit(): void {
    this.store.dispatch(RemoteConfigActions.loadFlags());
  }

  readonly sections = [
    { path: '/tasks', label: 'Tareas', icon: 'checkbox-outline' },
    { path: '/tasks/agenda', label: 'Agenda', icon: 'calendar-outline' },
    { path: '/tasks/alerts', label: 'Avisos', icon: 'notifications-outline' },
    { path: '/categories', label: 'Categorías', icon: 'pricetags-outline' },
  ];
}
