<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./energyweb.png" width="120" alt="Energy Web Foundation" /></a>
</p>

# Origin 24/7 SDK

## Description

SDK for implementing Origin solutions in 24/7 mode - which is continuous certificate trade between sites.

For component details go to relevant package:

-   [origin-247-certificate](./packages/origin-247-certificate) - issue, transfer and claim certificates
-   [origin-247-transfer](./packages/origin-247-transfer) - automate issuance, transfer and transfer validation of certificates
-   [origin-247-claim](./packages/origin-247-claim) - match and claim certificates, and save result of matching
-   [origin-247-energy-api](./packages/origin-247-energy-api) - store production and consumption readings, and create onchain notary proofs for them

## Development

### Release

0. Install lerna (globally)
1. Authorize with npm (configure `~/.npmrc` file)
2. For canary: `export BUILD_ID=(date +"%s"); yarn publish:canary`
3. For release configure [GH_TOKEN variable](https://github.com/lerna/lerna/blob/main/commands/version/README.md#--create-release-type) and run: `yarn publish:release`

## Contributing Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Questions and Support

For questions and support please use Energy Web's [Discord channel](https://discord.com/channels/706103009205288990/843970822254362664)

Or reach out to us via email: 247enquiries@energyweb.org

## EW-DOS

The Energy Web Decentralized Operating System is a blockchain-based, multi-layer digital infrastructure.

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

-   To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/).

-   For an overview of the energy-sector challenges our use cases address, go [here](https://app.gitbook.com/@energy-web-foundation/s/energy-web/our-mission).

For a deep-dive into the motivation and methodology behind our technical solutions, we encourage you to read our White Papers:

-   [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
-   [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

-   [Twitter](https://twitter.com/energywebx)
-   [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
-   [Telegram](https://t.me/energyweb)
