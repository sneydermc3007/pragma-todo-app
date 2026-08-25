import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { fetchAndActivate, getBoolean, getRemoteConfig } from 'firebase/remote-config';

import { defer, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { DEFAULT_FLAGS, FLAG_24H_CLOCK, FLAG_DARK_MODE } from '../models/remote-config.const';

import type { IFeatureFlags } from '../models/remote-config.model';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly ready$ = defer(() => {
    const remoteConfig = getRemoteConfig(getApp());

    remoteConfig.defaultConfig = DEFAULT_FLAGS;
    remoteConfig.settings.minimumFetchIntervalMillis =
      environment.remoteConfigMinimumFetchIntervalMillis;

    return from(fetchAndActivate(remoteConfig)).pipe(map(() => remoteConfig));
  }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getFlags(): Observable<IFeatureFlags> {
    return this.ready$.pipe(
      switchMap((remoteConfig) =>
        from([
          {
            darkModeEnabled: getBoolean(remoteConfig, FLAG_DARK_MODE),
            use24hClock: getBoolean(remoteConfig, FLAG_24H_CLOCK),
          },
        ])
      )
    );
  }
}
