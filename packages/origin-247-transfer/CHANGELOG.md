# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.5](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@2.0.4...@energyweb/origin-247-transfer@2.0.5) (2022-01-25)


### Bug Fixes

* use sequence for generating internal certificate id ([81807db](https://github.com/energywebfoundation/origin-247-sdk/commit/81807dbe938b294e819cb34b9fdf032acbc42a0b))





## [2.0.4](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@2.0.3...@energyweb/origin-247-transfer@2.0.4) (2022-01-24)

**Note:** Version bump only for package @energyweb/origin-247-transfer





## [2.0.3](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@2.0.2...@energyweb/origin-247-transfer@2.0.3) (2022-01-19)

**Note:** Version bump only for package @energyweb/origin-247-transfer





## [2.0.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@2.0.1...@energyweb/origin-247-transfer@2.0.2) (2022-01-17)

**Note:** Version bump only for package @energyweb/origin-247-transfer





## [2.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@2.0.0...@energyweb/origin-247-transfer@2.0.1) (2022-01-14)

**Note:** Version bump only for package @energyweb/origin-247-transfer





# [2.0.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.1.0...@energyweb/origin-247-transfer@2.0.0) (2022-01-11)


### Features

* **origin-247-certificate:** add offchain implementation ([109d636](https://github.com/energywebfoundation/origin-247-sdk/commit/109d63658684285e61f046998b31f146a59c5c1e))
* skip validation and transfer if both sites are equal ([01acdc3](https://github.com/energywebfoundation/origin-247-sdk/commit/01acdc3b40b57ca4ef455c5a8a3d7da3253f9018))


### BREAKING CHANGES

* **origin-247-certificate:** because of introduction of offchain-certificate module,
to standarize naming anything related to "classic" certificate module is now prefixed with
"OnChain" - this includes module, service, service injection token and so on





# [1.1.0](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.7...@energyweb/origin-247-transfer@1.1.0) (2021-11-24)


### Features

* **origin-247-certificate:** add support for certificates `getAll` query ([602e4f2](https://github.com/energywebfoundation/origin-247-sdk/commit/602e4f257b2af610cf56263b55cc43090085d7e3))





## [1.0.7](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.6...@energyweb/origin-247-transfer@1.0.7) (2021-11-02)


### Reverts

* Revert "fix(origin-247-transfer): fix certificate persisted race condition" ([e9ab9ec](https://github.com/energywebfoundation/origin-247-sdk/commit/e9ab9ec9c514880bebdc0c41392fdb49cfcae129))





## [1.0.6](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.5...@energyweb/origin-247-transfer@1.0.6) (2021-10-19)


### Bug Fixes

* **origin-247-transfer:** parse redis url ([7908e15](https://github.com/energywebfoundation/origin-247-sdk/commit/7908e153ec3f6b80fda93a2001f6b916f7a0891b))





## [1.0.5](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.4...@energyweb/origin-247-transfer@1.0.5) (2021-10-18)


### Bug Fixes

* **origin-247-transfer:** fix certificate persisted race condition ([af0607a](https://github.com/energywebfoundation/origin-247-sdk/commit/af0607a608a997f0430a05a87ef7ed5795a81b42))
* **origin-247-transfer:** properly emit validation awaiting after persistance ([8928bc7](https://github.com/energywebfoundation/origin-247-sdk/commit/8928bc7bd06a78caa5fa87b4dc85777c47af5f97))





## [1.0.4](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.3...@energyweb/origin-247-transfer@1.0.4) (2021-10-15)


### Bug Fixes

* **origin-247-sdk:** fix how ETR handles error ([5208391](https://github.com/energywebfoundation/origin-247-sdk/commit/520839106741c9b438cc2fbd50c4ccf7d4ab020c))
* **origin-247-transfer:** use better batching system ([bc99e13](https://github.com/energywebfoundation/origin-247-sdk/commit/bc99e132c28adb7e9065895f7f92d9787b7c705f))





## [1.0.3](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.2...@energyweb/origin-247-transfer@1.0.3) (2021-09-02)

**Note:** Version bump only for package @energyweb/origin-247-transfer





## [1.0.2](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.1...@energyweb/origin-247-transfer@1.0.2) (2021-08-26)

**Note:** Version bump only for package @energyweb/origin-247-transfer





## [1.0.1](https://github.com/energywebfoundation/origin-247-sdk/compare/@energyweb/origin-247-transfer@1.0.0...@energyweb/origin-247-transfer@1.0.1) (2021-08-26)

**Note:** Version bump only for package @energyweb/origin-247-transfer





# 1.0.0 (2021-08-17)


### Bug Fixes

* **origin-247-certificate:** save certificate to database after persisting event ([aaea748](https://github.com/energywebfoundation/origin-247-sdk/commit/aaea748cc3f07f49febfc670928ceabcc08c3af1))
* **origin-247-transfer:** correct handling transfer error ([cfff8d9](https://github.com/energywebfoundation/origin-247-sdk/commit/cfff8d98f441ecbe07600542e265147dab4d4eb9))
* **origin-247-transfer:** don't issue zero volume certificate ([7147004](https://github.com/energywebfoundation/origin-247-sdk/commit/71470041a2d5b476e55cb70d9e660a96a1c506ef))
* **origin-247-transfer:** fix ETR overriding each other ([cbc1961](https://github.com/energywebfoundation/origin-247-sdk/commit/cbc1961a9ed5809b236c7c0b9e57ae5d3981d69c))


### Features

* **origin-247-transfer:** add command for status update ([c29b531](https://github.com/energywebfoundation/origin-247-sdk/commit/c29b531b9a753c6b70155def53a1b7063f489e5e))
* **origin-247-transfer:** add module boilerplate ([b051d4e](https://github.com/energywebfoundation/origin-247-sdk/commit/b051d4e7754766b355bf54ba81f13038ec491e5f))
* **origin-247-transfer:** add sites blockchain addresses ([8d82137](https://github.com/energywebfoundation/origin-247-sdk/commit/8d8213738661a8a90ee75aab1d6d832816949c51))
* **origin-247-transfer:** add state to ETR, add batch methods ([6b85bb5](https://github.com/energywebfoundation/origin-247-sdk/commit/6b85bb585a56e556bf5743c2d400fae974fd9c69))
* **origin-247-transfer:** add transferDate and more public attrs ([2775f26](https://github.com/energywebfoundation/origin-247-sdk/commit/2775f260af6706f7750741edb1c53fabf90d203d))
* **origin-247-transfer:** allow for no validators ([0df8056](https://github.com/energywebfoundation/origin-247-sdk/commit/0df8056996a1b14622a3a86830384408f16ee219))
* **origin-247-transfer:** issue certificate and create energy block ([5a8f2cb](https://github.com/energywebfoundation/origin-247-sdk/commit/5a8f2cb3c60bac671fa101e303ad8269d969c2ba))
* **origin-247-transfer:** save persist flag on ETR ([c3b098a](https://github.com/energywebfoundation/origin-247-sdk/commit/c3b098a63db478addb237ec2eabb36b018a607da))
* **origin-247-transfer:** save sites from sites query, save certificateId separately, update schema ([51d749f](https://github.com/energywebfoundation/origin-247-sdk/commit/51d749fdb16186e04f0a8c2aa1b6f152a07b63e9))
* **origin-247-transfer:** symmetric validation logic ([6ae2a88](https://github.com/energywebfoundation/origin-247-sdk/commit/6ae2a88f0db3eb27f4660b855b1f27a46d3865fe))


* chore(origin-247-transfer)!: change column datatype, fix race condition ([0e5c429](https://github.com/energywebfoundation/origin-247-sdk/commit/0e5c42968a172473a7d714ce9c4cad5c82759a8d))


### BREAKING CHANGES

* **origin-247-transfer:** ETR now has new table with new data
* **origin-247-transfer:** certificates are issued/transferred in batches which means, that the time of the event is even less specific
* date columns in ETR database entity now have TIMESTAMPTZ type
