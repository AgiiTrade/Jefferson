import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planbyinnovations.questmind',
  appName: 'QuestMind',
  webDir: 'www',
  plugins: {
    AdMob: {
      testing: true
    }
  }
};

export default config;
