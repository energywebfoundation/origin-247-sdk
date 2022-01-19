# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.2.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.2.0...@energyweb/origin-247-certificate@3.2.1) (2022-01-19)


### Bug Fixes

* **origin-247-certificate:** properly map internal id to blockchain id ([626ef5f](https://github.com/energywebfoundation/origin-247-sdk/commit/626ef5f5c798143bf431404ab815b2c981a42fe0))





# [3.2.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.1.0...@energyweb/origin-247-certificate@3.2.0) (2022-01-17)


### Features

* add transactions logs to certificate model ([#70](https://github.com/energywebfoundation/origin-247-sdk/issues/70)) ([22f66ce](https://github.com/energywebfoundation/origin-247-sdk/commit/22f66ce827f71b809e7e92923ae1f8705dd2df6e))





# [3.1.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.0.0...@energyweb/origin-247-certificate@3.1.0) (2022-01-14)


### Bug Fixes

* Remove claimed volume from owners ([#68](https://github.com/energywebfoundation/origin-247-sdk/issues/68)) ([39a213e](https://github.com/energywebfoundation/origin-247-sdk/commit/39a213e0b4bcb9311b1c5dae0b1982122dc0385b))


### Features

* add `isSynced` property to read model ([af0e4e4](https://github.com/energywebfoundation/origin-247-sdk/commit/af0e4e43e548e318570add1eec7f1a01bcb53bcf))





# [3.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.2.0...@energyweb/origin-247-certificate@3.0.0) (2022-01-11)


### Bug Fixes

* certificateForUnitTests.getAll filtering by device id ([5961662](https://github.com/energywebfoundation/origin-247-sdk/commit/596166280d899bc5f2fb5253d15429799071f489))


### Features

* **origin-247-certificate:** add offchain implementation ([109d636](https://github.com/energywebfoundation/origin-247-sdk/commit/109d63658684285e61f046998b31f146a59c5c1e))


### BREAKING CHANGES

* **origin-247-certificate:** because of introduction of offchain-certificate module,
to standarize naming anything related to "classic" certificate module is now prefixed with
"OnChain" - this includes module, service, service injection token and so on





# [2.2.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.1.3...@energyweb/origin-247-certificate@2.2.0) (2021-11-24)


### Bug Fixes

* **origin-247-certificate:** fix certificateForUnitTests filtering ([186d128](https://github.com/energywebfoundation/origin-247-sdk/commit/186d1282c951af9ec678e4ea178146893837f63d))
* **origin-247-certificate:** handle getAll in certificate service for unit tests ([5cfaea4](https://github.com/energywebfoundation/origin-247-sdk/commit/5cfaea45155242ddef32fd196c49355265658a2c))


### Features

* **origin-247-certificate:** add support for certificates `getAll` query ([602e4f2](https://github.com/energywebfoundation/origin-247-sdk/commit/602e4f257b2af610cf56263b55cc43090085d7e3))





## [2.1.3](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@2.1.2...@energyweb/origin-247-certificate@2.1.3) (2021-11-02)


### Bug Fixes

* **origin-247-certificate:** properly process empty batches ([2914606](https://github.com/energywebfoundation/origin-247-sdk/commit/29146062fcd3d88cd8c2482e0a73a9ebb107ab73))





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
