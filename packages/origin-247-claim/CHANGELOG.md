# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
