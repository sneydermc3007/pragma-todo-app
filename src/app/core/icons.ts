import { addIcons } from 'ionicons';
import { add, calendarOutline, checkboxOutline, notificationsOutline, trashOutline } from 'ionicons/icons';

export const APP_ICONS = {
  add,
  calendarOutline,
  checkboxOutline,
  notificationsOutline,
  trashOutline,
};

export const registerAppIcons = (): void => addIcons(APP_ICONS);
