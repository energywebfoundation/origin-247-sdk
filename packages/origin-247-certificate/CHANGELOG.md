# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.4.0...@energyweb/origin-247-certificate@4.0.0) (2022-03-23)


### Bug Fixes

* add and copy issuer from properties ([7edd037](https://github.com/energywebfoundation/origin-247-sdk/commit/7edd037947980667b1824f1f64cc49286c19bcaf))
* add batchConfigServiceForUnitTests ([93ebfdc](https://github.com/energywebfoundation/origin-247-sdk/commit/93ebfdc3aff451b13eecdf81ea263c3acdaef067))
* add IGetAllCertificatesOptions export ([fec4078](https://github.com/energywebfoundation/origin-247-sdk/commit/fec4078b2738027fc3e15cc27561c51505c6244c))
* also return query from deployContracts ([93817f8](https://github.com/energywebfoundation/origin-247-sdk/commit/93817f8a4907a13267589d28262ab9e8b0de3a3f))
* Change default batch sizes ([#90](https://github.com/energywebfoundation/origin-247-sdk/issues/90)) ([8cab085](https://github.com/energywebfoundation/origin-247-sdk/commit/8cab085f17f6b15a6ab2984600a767b158547484))
* change let to const ([e7cfb34](https://github.com/energywebfoundation/origin-247-sdk/commit/e7cfb34f4e92222ddb58e59093116638c4fb9955))
* Decrease default batch sizes ([#91](https://github.com/energywebfoundation/origin-247-sdk/issues/91)) ([580cbb5](https://github.com/energywebfoundation/origin-247-sdk/commit/580cbb57b2efd9f5bca7302055b9dc661953fb39))
* default batch size values ([210bdbb](https://github.com/energywebfoundation/origin-247-sdk/commit/210bdbb85d8aa81fbcfa8c2a7063d2af704f836e))
* fix copying old registry ([018ff8c](https://github.com/energywebfoundation/origin-247-sdk/commit/018ff8ca234d126f2f20c0899d45471286751da2))
* fix test setup ([60f6e5b](https://github.com/energywebfoundation/origin-247-sdk/commit/60f6e5b63b58773958950fc221438d8c9f31f06f))
* migration name ([a599b32](https://github.com/energywebfoundation/origin-247-sdk/commit/a599b32e11d3fadd1eaba1db2e3d5b38f8679cb2))
* module providers and exports ([0fbacdb](https://github.com/energywebfoundation/origin-247-sdk/commit/0fbacdb34414a13de7da6f7c0668b561676ac2a5))
* remove unused variable ([5810d31](https://github.com/energywebfoundation/origin-247-sdk/commit/5810d31bfd24a6019dddee07e0d46a32ca4ce3a4))
* repo, module, cr fixes ([f43cf4f](https://github.com/energywebfoundation/origin-247-sdk/commit/f43cf4fb603fef41903b90216a41f0ba5b08fbc8))
* typos, snippets ([342ab03](https://github.com/energywebfoundation/origin-247-sdk/commit/342ab0338d7b0073aeff773dd1a9fbb70a126982))
* update blockchainProperties methods ([44f6957](https://github.com/energywebfoundation/origin-247-sdk/commit/44f6957d61038da70953171e60f37c09ab2dd98b))


### Features

* add batch-configuration-service ([2d90158](https://github.com/energywebfoundation/origin-247-sdk/commit/2d90158e1c2748dd5a68a8256af80ef8e4215fd7))
* add blockchainProperties ([f6761a3](https://github.com/energywebfoundation/origin-247-sdk/commit/f6761a3da7e96a6923e968ae6e6221a38e9054b1))
* add deployContracts ([a99e90c](https://github.com/energywebfoundation/origin-247-sdk/commit/a99e90c8c1ad57caa8bcf60d9e5c147a7d045312))
* add deploymentProperties ([22097b7](https://github.com/energywebfoundation/origin-247-sdk/commit/22097b7689e4519b26bd367b428f685df02732ea))
* add get method ([09714d0](https://github.com/energywebfoundation/origin-247-sdk/commit/09714d0fd3ae02645f1435d5af09477390b0d2bc))
* Use `issuer` package directly. Drop `issuer-api` package ([7c293e1](https://github.com/energywebfoundation/origin-247-sdk/commit/7c293e111e08de781d45b196a1adbcc8166c0af4))


### BREAKING CHANGES

* `energyValue` field is now required in transfer and claim commands.
Previously when calling `transfer` or `claim` methods in `OffChainCertificateService`
you could skip passing `energyValue` field to commands.
Right now those calls will fail with ValidationError - you will have to
explicitly pass `energyValue` you want to use to make it work.
Contracts (and blockchain properties) should not be deployed using seed anymore.
For deploying contracts on blockchain on application startup refer to README.





# [3.4.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.3.1...@energyweb/origin-247-certificate@3.4.0) (2022-02-10)


### Bug Fixes

* inconsistent certificate type ([#48](https://github.com/energywebfoundation/origin-247-sdk/issues/48)) ([0812369](https://github.com/energywebfoundation/origin-247-sdk/commit/081236956e2de2f8c920f25bb837aacb3688c380))


### Features

* Add validation of user commands ([#76](https://github.com/energywebfoundation/origin-247-sdk/issues/76)) ([5b9fdac](https://github.com/energywebfoundation/origin-247-sdk/commit/5b9fdacb57de262c2f64cee8b2b18c33e63bfb1b))
* Improve commands batching performance ([#80](https://github.com/energywebfoundation/origin-247-sdk/issues/80)) ([a3a8011](https://github.com/energywebfoundation/origin-247-sdk/commit/a3a80115ce14cb2ec00fcef266f8868966e765f9))





## [3.3.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.3.0...@energyweb/origin-247-certificate@3.3.1) (2022-01-25)


### Bug Fixes

* use sequence for generating internal certificate id ([81807db](https://github.com/energywebfoundation/origin-247-sdk/commit/81807dbe938b294e819cb34b9fdf032acbc42a0b))





# [3.3.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-certificate@3.2.1...@energyweb/origin-247-certificate@3.3.0) (2022-01-24)


### Bug Fixes

* After CR ([e767799](https://github.com/energywebfoundation/origin-247-sdk/commit/e767799e9ea6d77a6d48bc6ce0f754faeaafacc1))
* After CR ([af4f5c4](https://github.com/energywebfoundation/origin-247-sdk/commit/af4f5c4bfb59dfa86e945059cc64375474b9e0c0))
* After CR ([5fed89a](https://github.com/energywebfoundation/origin-247-sdk/commit/5fed89a136220129627195399fbaedf5308c246d))


### Features

* Do not try to synchronize certificates if synchronization failed before for them ([6b85c0e](https://github.com/energywebfoundation/origin-247-sdk/commit/6b85c0e71856637f11020b0b1a1ad535eb099801))
* Make number of retries configurable ([#72](https://github.com/energywebfoundation/origin-247-sdk/issues/72)) ([a8952c6](https://github.com/energywebfoundation/origin-247-sdk/commit/a8952c67d78e31ece571347d8c170699cf5c458f))





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
