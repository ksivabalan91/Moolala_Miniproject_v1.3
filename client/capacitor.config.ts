import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.moolala',
  appName: 'Moolala',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;
