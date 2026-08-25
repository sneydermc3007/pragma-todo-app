import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap } from 'rxjs';

import { RemoteConfigActions } from './remote-config.actions';
import { RemoteConfigService } from '../services/remote-config.service';

@Injectable()
export class RemoteConfigEffects {
    private actions$: Actions = inject(Actions);
    private remoteConfigService: RemoteConfigService = inject(RemoteConfigService);

    loadFlags$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteConfigActions.loadFlags),
        switchMap(() => this.remoteConfigService.getFlags().pipe(
            map((flags) => RemoteConfigActions.loadFlagsSuccess({ flags })),
            catchError((error: Error) =>
                of(RemoteConfigActions.loadFlagsFailure({ error: error.message })))
        ))
    ));
}
