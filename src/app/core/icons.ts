import { addIcons } from 'ionicons';
import { add, calendarOutline, checkboxOutline, createOutline, notificationsOutline, pricetagsOutline, trashOutline } from 'ionicons/icons';

export const APP_ICONS = {
  add,
  calendarOutline,
  checkboxOutline,
  createOutline,
  notificationsOutline,
  pricetagsOutline,
  trashOutline,
};

export const registerAppIcons = (): void => addIcons(APP_ICONS);
