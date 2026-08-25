import { createFeatureSelector, createSelector } from '@ngrx/store';

import { REMOTE_CONFIG_FEATURE_KEY } from '../models/remote-config.const';

import type { IRemoteConfigState } from './remote-config.reducer';

export const selectRemoteConfigState =
    createFeatureSelector<IRemoteConfigState>(REMOTE_CONFIG_FEATURE_KEY);

export const selectDarkModeEnabled =
    createSelector(selectRemoteConfigState, (state) => state.darkModeEnabled);

export const selectUse24hClock =
    createSelector(selectRemoteConfigState, (state) => state.use24hClock);

export const selectFlagsLoaded =
    createSelector(selectRemoteConfigState, (state) => state.loaded);
