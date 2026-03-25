import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planbyinnovations.vocab',
  appName: 'Vocabulary Master Pro',
  webDir: 'www',
  plugins: {
    AdMob: {
      // Google Test Ad IDs (safe for development/testing)
      // Replace with real IDs before publishing
      adMobBannerId: 'ca-app-pub-3940256099942544/6300978111',
      adMobInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
      adMobRewardedId: 'ca-app-pub-3940256099942544/5224354917',
      // For testing, use these Google-provided test ad unit IDs
      testing: true
    }
  }
};

export default config;
