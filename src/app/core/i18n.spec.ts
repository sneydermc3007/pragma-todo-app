import { detectLanguage, FALLBACK_LANGUAGE, isSupported } from './i18n';

describe('i18n', () => {
  const withNavigatorLanguage = (language: string | undefined): string => {
    vi.stubGlobal('navigator', language === undefined ? undefined : { language });

    const detected = detectLanguage();

    vi.unstubAllGlobals();

    return detected;
  };

  describe('isSupported', () => {
    it('acepta los idiomas del diccionario', () => {
      expect(isSupported('es')).toBe(true);
      expect(isSupported('en')).toBe(true);
    });

    it('rechaza cualquier otro', () => {
      expect(isSupported('fr')).toBe(false);
      expect(isSupported('')).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('toma el idioma del dispositivo ignorando la región', () => {
      expect(withNavigatorLanguage('en-US')).toBe('en');
      expect(withNavigatorLanguage('en-GB')).toBe('en');
      expect(withNavigatorLanguage('es-CO')).toBe('es');
      expect(withNavigatorLanguage('es-419')).toBe('es');
    });

    it('no distingue mayúsculas', () => {
      expect(withNavigatorLanguage('EN-us')).toBe('en');
    });

    it('cae al idioma por defecto con un idioma que no tenemos', () => {
      expect(withNavigatorLanguage('fr-FR')).toBe(FALLBACK_LANGUAGE);
      expect(withNavigatorLanguage('de')).toBe(FALLBACK_LANGUAGE);
    });

    it('cae al idioma por defecto si el dispositivo no informa idioma', () => {
      expect(withNavigatorLanguage('')).toBe(FALLBACK_LANGUAGE);
      expect(withNavigatorLanguage(undefined)).toBe(FALLBACK_LANGUAGE);
    });
  });
});
