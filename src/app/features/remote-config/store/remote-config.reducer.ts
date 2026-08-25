import { createReducer, on } from '@ngrx/store';

import { RemoteConfigActions } from './remote-config.actions';

import type { IFeatureFlags } from '../models/remote-config.model';

export interface IRemoteConfigState extends IFeatureFlags {
    loaded: boolean;
    error: string | null;
}

export const initialState: IRemoteConfigState = {
    darkModeEnabled: false,
    use24hClock: false,
    loaded: false,
    error: null
};

export const remoteConfigReducer = createReducer(
    initialState,

    on(RemoteConfigActions.loadFlagsSuccess, (state, { flags }) =>
        ({ ...state, ...flags, loaded: true, error: null })
    ),
    on(RemoteConfigActions.loadFlagsFailure, (state, { error }) =>
        ({ ...state, loaded: true, error })
    )
);
