const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");
const path = require("path");

const config = getSentryExpoConfig(__dirname);

// Stub CSS imports on web (e.g. mapbox-gl/dist/mapbox-gl.css)
const originalResolver = config.resolver?.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName.endsWith('.css')) {
      return { type: 'empty' };
    }
    if (originalResolver) {
      return originalResolver(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;