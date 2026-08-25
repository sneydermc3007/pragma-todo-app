export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export type TLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: TLanguage = 'es';

export const isSupported = (value: string): value is TLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const detectLanguage = (): TLanguage => {
  const preferred = globalThis.navigator?.language ?? '';
  const code = preferred.slice(0, 2).toLowerCase();

  return isSupported(code) ? code : FALLBACK_LANGUAGE;
};
