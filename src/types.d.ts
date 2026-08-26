declare module 'localforage-cordovasqlitedriver' {
  const cordovaSQLiteDriver: { _driver: string };
  export default cordovaSQLiteDriver;
}

interface Window {
  StatusBar?: {
    styleDefault(): void;
    styleLightContent(): void;
  };
}
