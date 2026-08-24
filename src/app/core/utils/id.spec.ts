import { newId } from './id';

describe('newId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve un id no vacío', () => {
    expect(newId().length).toBeGreaterThan(0);
  });

  it('no repite en mil llamadas seguidas', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));

    expect(ids.size).toBe(1000);
  });

  it('usa crypto.randomUUID cuando está disponible', () => {
    const randomUUID = vi.fn().mockReturnValue('11111111-2222-3333-4444-555555555555');
    vi.stubGlobal('crypto', { randomUUID });

    expect(newId()).toBe('11111111-2222-3333-4444-555555555555');
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it('cae al fallback si randomUUID no existe (WebView sin contexto seguro)', () => {
    vi.stubGlobal('crypto', {});

    expect(newId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('cae al fallback si no hay crypto en absoluto', () => {
    vi.stubGlobal('crypto', undefined);

    expect(newId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});
