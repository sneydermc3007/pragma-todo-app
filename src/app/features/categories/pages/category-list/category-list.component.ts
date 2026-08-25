import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem,
         IonLabel, IonList, IonMenuButton, IonNote, IonTitle, IonToolbar,
         ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { CategoryFormComponent } from '../../components/category-form/category-form.component';

import { CategoryActions } from '../../store/category.actions';
import { selectAllCategories, selectCategoryNames } from '../../store/category.selectors';
import { TaskActions } from '../../../tasks/store/task.actions';
import { selectTaskCountByCategory } from '../../../tasks/store/task.selectors';

import type { ICategory, TAddCategoryPayload } from '../../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonButton, IonIcon,
            IonContent, IonList, IonItem, IonLabel, IonNote],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private store = inject(Store);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  readonly categories = this.store.selectSignal(selectAllCategories);
  readonly taskCounts = this.store.selectSignal(selectTaskCountByCategory);
  private readonly takenNames = this.store.selectSignal(selectCategoryNames);

  ngOnInit(): void {
    this.store.dispatch(CategoryActions.loadCategories());
    this.store.dispatch(TaskActions.loadTasks());
  }

  countFor(category: ICategory): number {
    return this.taskCounts()[category.id] ?? 0;
  }

  async create(): Promise<void> {
    const payload = await this.openForm(null);

    if (payload) {
      this.store.dispatch(CategoryActions.addCategory({ category: payload }));
    }
  }

  async edit(category: ICategory): Promise<void> {
    const payload = await this.openForm(category);

    if (payload) {
      this.store.dispatch(CategoryActions.updateCategory({ id: category.id, changes: payload }));
    }
  }

  async remove(category: ICategory): Promise<void> {
    const count = this.countFor(category);

    const alert = await this.alertCtrl.create({
      header: `Eliminar «${category.name}»`,
      message: count
        ? `${count} ${count === 1 ? 'tarea va a quedar' : 'tareas van a quedar'} sin categoría. Las tareas no se borran.`
        : 'Ninguna tarea usa esta categoría.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive' },
      ],
    });

    await alert.present();

    const { role } = await alert.onWillDismiss();

    if (role === 'destructive') {
      this.store.dispatch(CategoryActions.deleteCategory({ id: category.id }));
    }
  }

  private async openForm(category: ICategory | null): Promise<TAddCategoryPayload | null> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { category, takenNames: this.takenNames() },
      breakpoints: [0, 0.7],
      initialBreakpoint: 0.7,
      handle: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<TAddCategoryPayload>();

    return role === 'confirm' && data ? data : null;
  }
}
