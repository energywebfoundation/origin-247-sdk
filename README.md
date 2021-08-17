# Origin 24/7 SDK

SDK for implementing Origin solutions in 24/7 mode - which is continuous certificate trade between sites.

## Development

### Release

0. Install lerna (globally)
1. Authorize with npm (configure `~/.npmrc` file)
2. For canary: `export BUILD_ID=(date +"%s"); yarn publish:canary`
3. For release configure [GH_TOKEN variable](https://github.com/lerna/lerna/blob/main/commands/version/README.md#--create-release-type) and run: `yarn publish:release`
