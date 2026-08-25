import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { IFeatureFlags } from '../models/remote-config.model';

export const RemoteConfigActions = createActionGroup({
    source: 'Remote Config',
    events: {
        'Load Flags': emptyProps(),
        'Load Flags Success': props<{ flags: IFeatureFlags }>(),
        'Load Flags Failure': props<{ error: string }>()
    }
})
