# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.4](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@4.0.3...@energyweb/origin-247-claim@4.0.4) (2022-01-24)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [4.0.3](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@4.0.2...@energyweb/origin-247-claim@4.0.3) (2022-01-19)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [4.0.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@4.0.1...@energyweb/origin-247-claim@4.0.2) (2022-01-17)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [4.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@4.0.0...@energyweb/origin-247-claim@4.0.1) (2022-01-14)

**Note:** Version bump only for package @energyweb/origin-247-claim





# [4.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.2.0...@energyweb/origin-247-claim@4.0.0) (2022-01-11)


### Bug Fixes

* **origin-247-claim:** fix error when two entities had the same id ([54eeab7](https://github.com/energywebfoundation/origin-247-sdk/commit/54eeab701d88aeb0b70c6bf4ab3d9a26d9dce7ed))
* make claimCustomizationFn generic as well ([a4801c7](https://github.com/energywebfoundation/origin-247-sdk/commit/a4801c78c41f9e5a46cf67a91a08873626807c22))


### Features

* **origin-247-certificate:** add offchain implementation ([109d636](https://github.com/energywebfoundation/origin-247-sdk/commit/109d63658684285e61f046998b31f146a59c5c1e))
* add ClaimForUnitTestsModule ([897492f](https://github.com/energywebfoundation/origin-247-sdk/commit/897492f737c42a992f203c53e1f9c4ec8837848a))
* allow to customize claim facade input type ([c706d2c](https://github.com/energywebfoundation/origin-247-sdk/commit/c706d2cfd02bb43a8401219f8accbf7a09b7ac19))


### BREAKING CHANGES

* **origin-247-certificate:** because of introduction of offchain-certificate module,
to standarize naming anything related to "classic" certificate module is now prefixed with
"OnChain" - this includes module, service, service injection token and so on
* claim facade now accepts consumer and generator ids as generic `id` field. This way it is inline with matching algorithms, and requires less mapping





# [3.2.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.5...@energyweb/origin-247-claim@3.2.0) (2021-11-24)


### Features

* **origin-247-certificate:** add support for certificates `getAll` query ([602e4f2](https://github.com/energywebfoundation/origin-247-sdk/commit/602e4f257b2af610cf56263b55cc43090085d7e3))





## [3.1.5](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.4...@energyweb/origin-247-claim@3.1.5) (2021-11-02)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [3.1.4](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.3...@energyweb/origin-247-claim@3.1.4) (2021-10-19)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [3.1.3](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.2...@energyweb/origin-247-claim@3.1.3) (2021-10-19)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [3.1.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.1...@energyweb/origin-247-claim@3.1.2) (2021-10-18)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [3.1.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.1.0...@energyweb/origin-247-claim@3.1.1) (2021-10-15)

**Note:** Version bump only for package @energyweb/origin-247-claim





# [3.1.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.0.1...@energyweb/origin-247-claim@3.1.0) (2021-09-02)


### Features

* **origin-247-claim:** return round matches alongside flattened matches ([734955e](https://github.com/energywebfoundation/origin-247-sdk/commit/734955e2670e8680a56f89e03c68026aac0b3dc7))
* **origin-247-claim:** spreadMatcher spread optimization ([75f8bd3](https://github.com/energywebfoundation/origin-247-sdk/commit/75f8bd3e7043f00383591b7fcd3ed95162d91f68))





## [3.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@3.0.0...@energyweb/origin-247-claim@3.0.1) (2021-08-30)

**Note:** Version bump only for package @energyweb/origin-247-claim





# [3.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@2.0.1...@energyweb/origin-247-claim@3.0.0) (2021-08-30)


### chore

* **origin-247-claim:** remove findByGrouped method ([95dfbf1](https://github.com/energywebfoundation/origin-247-sdk/commit/95dfbf174bdfb8dab00faf745d987675b2c24990))


### Features

* **origin-247-claim:** export aggregate, Duration and bigNum utils ([a9c7f18](https://github.com/energywebfoundation/origin-247-sdk/commit/a9c7f1827c8034e54e0cf6a1addfa3ae6bbced59))


### BREAKING CHANGES

* **origin-247-claim:** findByGrouped is removed





## [2.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@2.0.0...@energyweb/origin-247-claim@2.0.1) (2021-08-26)

**Note:** Version bump only for package @energyweb/origin-247-claim





# [2.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@1.1.2...@energyweb/origin-247-claim@2.0.0) (2021-08-26)


### Features

* **origin-247-claim:** allow flexible batch claims ([f0f0916](https://github.com/energywebfoundation/origin-247-sdk/commit/f0f0916ec2b9c8f5d10cafbe60ae4a74d028bbe9))


### BREAKING CHANGES

* **origin-247-claim:** claimCustomizationFn now accepts different - more flexible - interface





## [1.1.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@1.1.1...@energyweb/origin-247-claim@1.1.2) (2021-08-23)

**Note:** Version bump only for package @energyweb/origin-247-claim





## [1.1.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@1.1.0...@energyweb/origin-247-claim@1.1.1) (2021-08-23)

**Note:** Version bump only for package @energyweb/origin-247-claim





# [1.1.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-claim@1.0.0...@energyweb/origin-247-claim@1.1.0) (2021-08-23)


### Features

* **origin-247-claim:** allow missing entity priority ([0410559](https://github.com/energywebfoundation/origin-247-sdk/commit/041055933da4219cbe7aa6d680353068f765baab))





# 1.0.0 (2021-08-17)


### Features

* **origin-247-claim:** add basic matcher algorithm ([d6f289b](https://github.com/energywebfoundation/origin-247-sdk/commit/d6f289bd6305d45088a3c4db9a3c999b8ccdbec1))
* **origin-247-claim:** Add claim module and service ([2e6b670](https://github.com/energywebfoundation/origin-247-sdk/commit/2e6b67057af46fe089fd0fe48be0e703e5beb78f))
* **origin-247-claim:** Add filtering of zero value consumptions and generations ([e71bab9](https://github.com/energywebfoundation/origin-247-sdk/commit/e71bab9f4938a644a019cdb9dd48ecbac67aa0fa))
* **origin-247-claim:** expose only facade ([fa0b528](https://github.com/energywebfoundation/origin-247-sdk/commit/fa0b528fa6f496b5b6635c4c03db0be87f60c0ca))


* feat(origin-247-claim)!: work with generic entities instead of entity ID ([11cea57](https://github.com/energywebfoundation/origin-247-sdk/commit/11cea57937cd256ab10e9179b52d29f1366183fd))
* feat(origin-247-claim)!: use BigNumber for volumes ([dcd1dfa](https://github.com/energywebfoundation/origin-247-sdk/commit/dcd1dfab5e3d1e2fa8f9c62680bee370a952d59d))


### Bug Fixes

* **origin-247-claim:** tests ([3717d07](https://github.com/energywebfoundation/origin-247-sdk/commit/3717d073aef7af3ff04c28698235179ea6b75125))


### BREAKING CHANGES

* result returned from matcher now is built of entities with all their fields, instead of entities id
* changed API: now instead of "priority" there is "groupPriority" field
* export from algorithm is wrapped in SpreadMatcher namespace
* input is not BigNumber instead of number primitive for all volume inputs
