const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
// .sql Dateien als Assets registrieren
config.resolver.assetExts.push('sql');

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/types/uniwind-types.d.ts'
});
