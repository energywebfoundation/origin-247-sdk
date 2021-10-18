# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.1.1...@energyweb/origin-247-certificate@2.1.2) (2021-10-18)


### Bug Fixes

* **origin-247-transfer:** fix certificate persisted race condition ([af0607a](https://github.com/energywebfoundation/origin-247-sdk/commit/af0607a608a997f0430a05a87ef7ed5795a81b42))





## [2.1.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.1.0...@energyweb/origin-247-certificate@2.1.1) (2021-10-15)

**Note:** Version bump only for package @energyweb/origin-247-certificate





# [2.1.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.0.1...@energyweb/origin-247-certificate@2.1.0) (2021-09-02)


### Features

* **origin-247-certificate:** improve job stack trace ([b178e9b](https://github.com/energywebfoundation/origin-247-sdk/commit/b178e9b70556b4d65a1e2ab5b6e6d12becbde590))





## [2.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.0.0...@energyweb/origin-247-certificate@2.0.1) (2021-08-26)


### Reverts

* Revert "chore(origin-247-certificate): allow to configure issuer-api options" ([73278a0](https://github.com/energywebfoundation/origin-247-sdk/commit/73278a0aa390a8d4afb9e024125ead7edcc9e9a2))





# [2.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@1.0.0...@energyweb/origin-247-certificate@2.0.0) (2021-08-26)


### chore

* **origin-247-certificate:** allow to configure issuer-api options ([f3f4e6a](https://github.com/energywebfoundation/origin-247-sdk/commit/f3f4e6a87b6449ca23f6ec3b16c250d6fda898f5))


### Features

* **origin-247-certificate:** Update issuer-api, make batch methods easier to use ([574d36b](https://github.com/energywebfoundation/origin-247-sdk/commit/574d36b20173db89e774768ee1546b7aa7bfe49f))


### BREAKING CHANGES

* **origin-247-certificate:** CertificateModule now requires `.register()`
* **origin-247-certificate:** now batch methods (transfer and claim) accept array of transfers/claims





# 1.0.0 (2021-08-17)


### Features

* **origin-247-certificate:** add 247-certificates module ([e75077f](https://github.com/energywebfoundation/origin-247-sdk/commit/e75077fd2ebc16a9f4d4895e95650081628fcd47))
* **origin-247-certificate:** add batch actions ([59e3656](https://github.com/energywebfoundation/origin-247-sdk/commit/59e36565fc9e7d2c20ad7bef7c29d90c8aec6ae7))
* **origin-247-certificate:** allow to configure queue lock duration ([c6b6f3d](https://github.com/energywebfoundation/origin-247-sdk/commit/c6b6f3d93540da86b9528eca61e5d7009d071221))
* **origin-247-certificate:** export CertificatePersisted event ([5f8cf8c](https://github.com/energywebfoundation/origin-247-sdk/commit/5f8cf8ce6729e335891e159e1c616d8f6af48d8c))
* **origin-247-transfer:** add state to ETR, add batch methods ([6b85bb5](https://github.com/energywebfoundation/origin-247-sdk/commit/6b85bb585a56e556bf5743c2d400fae974fd9c69))


* chore(origin-247-certificate)!: move issuer deps to peer deps ([5d6a1d3](https://github.com/energywebfoundation/origin-247-sdk/commit/5d6a1d37993087393ef7783dda30dc2bc1d31f04))
* chore(origin-247-certificate)!: remove tokenId ([42887f3](https://github.com/energywebfoundation/origin-247-sdk/commit/42887f33944bbf7f01d4cca0203d995b111c7344))
* chore(origin-247-certificate)!: update origin-sdk ([4d47c25](https://github.com/energywebfoundation/origin-247-sdk/commit/4d47c2569a6cb50e731f7ff649ebe2054dfc3d90))
* feat(origin-247-certificate)!: add forUnitTests module ([1d39de9](https://github.com/energywebfoundation/origin-247-sdk/commit/1d39de9a483d53ef0096c688588f49cb4e91d7c2))


### Bug Fixes

* **origin-247-certificate:** save certificate to database after persisting event ([aaea748](https://github.com/energywebfoundation/origin-247-sdk/commit/aaea748cc3f07f49febfc670928ceabcc08c3af1))


### BREAKING CHANGES

* **origin-247-transfer:** ETR now has new table with new data
* **origin-247-transfer:** certificates are issued/transferred in batches which means, that the time of the event is even less specific
* user has to install issuer-api and issuer deps by himself
* tokenId removed
* certificate claims are now BigNumber strings instead of numbers
* service inject must be done by @Inject(CERTIFICATE_SERVICE_TOKEN) now
