const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    unstable_allowRequireContext: true,
  },
  resolver: {
    blockList: /.*\/android\/(\.cxx|build)\/.*/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
