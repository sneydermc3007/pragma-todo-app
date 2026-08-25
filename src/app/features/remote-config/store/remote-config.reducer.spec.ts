import { initialState, remoteConfigReducer } from './remote-config.reducer';
import { RemoteConfigActions } from './remote-config.actions';

describe('remoteConfigReducer', () => {
    it('arranca con todas las banderas apagadas y sin marcar como cargado', () => {
        expect(initialState).toEqual({
            darkModeEnabled: false,
            use24hClock: false,
            loaded: false,
            error: null,
        });
    });

    it('aplica las banderas que llegan de Remote Config', () => {
        const state = remoteConfigReducer(initialState, RemoteConfigActions.loadFlagsSuccess({
            flags: { darkModeEnabled: true, use24hClock: true },
        }));

        expect(state.darkModeEnabled).toBe(true);
        expect(state.use24hClock).toBe(true);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it('una carga posterior apaga lo que se apagó en la consola', () => {
        const encendido = remoteConfigReducer(initialState, RemoteConfigActions.loadFlagsSuccess({
            flags: { darkModeEnabled: true, use24hClock: true },
        }));
        const state = remoteConfigReducer(encendido, RemoteConfigActions.loadFlagsSuccess({
            flags: { darkModeEnabled: false, use24hClock: true },
        }));

        expect(state.darkModeEnabled).toBe(false);
        expect(state.use24hClock).toBe(true);
    });

    it('limpia el error de un intento anterior al cargar bien', () => {
        const fallado = remoteConfigReducer(
            initialState,
            RemoteConfigActions.loadFlagsFailure({ error: 'sin red' })
        );
        const state = remoteConfigReducer(fallado, RemoteConfigActions.loadFlagsSuccess({
            flags: { darkModeEnabled: true, use24hClock: false },
        }));

        expect(state.error).toBeNull();
    });

    describe('cuando falla', () => {
        it('marca loaded igual, para que la app arranque con los valores por defecto', () => {
            const state = remoteConfigReducer(
                initialState,
                RemoteConfigActions.loadFlagsFailure({ error: 'sin red' })
            );

            expect(state.loaded).toBe(true);
            expect(state.error).toBe('sin red');
        });

        it('no apaga las banderas que ya estaban aplicadas', () => {
            const encendido = remoteConfigReducer(initialState, RemoteConfigActions.loadFlagsSuccess({
                flags: { darkModeEnabled: true, use24hClock: true },
            }));
            const state = remoteConfigReducer(
                encendido,
                RemoteConfigActions.loadFlagsFailure({ error: 'sin red' })
            );

            expect(state.darkModeEnabled).toBe(true);
            expect(state.use24hClock).toBe(true);
        });

        it('nunca enciende una bandera por su cuenta', () => {
            const state = remoteConfigReducer(
                initialState,
                RemoteConfigActions.loadFlagsFailure({ error: 'sin red' })
            );

            expect(state.darkModeEnabled).toBe(false);
            expect(state.use24hClock).toBe(false);
        });
    });

    it('pedir la carga no cambia el estado, porque no hay pantalla que espere', () => {
        expect(remoteConfigReducer(initialState, RemoteConfigActions.loadFlags())).toBe(initialState);
    });

    it('no muta el estado anterior', () => {
        const before = remoteConfigReducer(initialState, RemoteConfigActions.loadFlagsSuccess({
            flags: { darkModeEnabled: true, use24hClock: false },
        }));
        const after = remoteConfigReducer(before, RemoteConfigActions.loadFlagsFailure({ error: 'sin red' }));

        expect(before.error).toBeNull();
        expect(after).not.toBe(before);
    });
});
