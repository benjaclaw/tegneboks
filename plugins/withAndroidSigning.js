const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    // Add release signing config if not already present
    if (!buildGradle.includes("signingConfigs.release")) {
      buildGradle = buildGradle.replace(
        `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`,
        `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(findProperty('RELEASE_STORE_FILE') ?: 'debug.keystore')
            storePassword findProperty('RELEASE_STORE_PASSWORD') ?: 'android'
            keyAlias findProperty('RELEASE_KEY_ALIAS') ?: 'androiddebugkey'
            keyPassword findProperty('RELEASE_KEY_PASSWORD') ?: 'android'
        }
    }`
      );

      // Replace release signing config
      buildGradle = buildGradle.replace(
        /release \{[^}]*signingConfig signingConfigs\.debug/,
        `release {\n            signingConfig signingConfigs.release`
      );
    }

    config.modResults.contents = buildGradle;
    return config;
  });
};
