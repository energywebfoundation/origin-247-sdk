# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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