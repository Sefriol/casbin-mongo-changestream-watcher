# This repository is Archived in favor of https://github.com/node-casbin/mongo-changestream-watcher

# MongoDB Change Stream Watcher for Node-Casbin

[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![codebeat badge](https://codebeat.co/badges/93d238e4-31cc-4865-80b6-8b6d4695c249)](https://codebeat.co/projects/github-com-sefriol-casbin-mongo-changestream-watcher-master)
[![Coverage Status](https://coveralls.io/repos/github/Sefriol/casbin-mongo-changestream-watcher/badge.svg?branch=master)](https://coveralls.io/repos/github/Sefriol/casbin-mongo-changestream-watcher?branch=master)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/casbin/lobby)
[![tests](https://github.com/Sefriol/casbin-mongo-changestream-watcher/actions/workflows/main.yml/badge.svg)](https://github.com/Sefriol/casbin-mongo-changestream-watcher/actions/workflows/main.yml)

[npm-image]: https://img.shields.io/npm/v/casbin-mongo-changestream-watcher.svg?style=flat-square
[npm-url]: https://npmjs.org/package/casbin-mongo-changestream-watcher
[download-image]: https://img.shields.io/npm/dm/casbin-mongo-changestream-watcher.svg?style=flat-square
[download-url]: https://npmjs.org/package/casbin-mongo-changestream-watcher

[MongoDB Change Stream](https://www.mongodb.com/docs/manual/changeStreams/) Watcher for Node-Casbin.

## Installation

```shell script
# NPM
npm install --save @casbin/mongo-changestream-watcher

# Yarn
yarn add @casbin/mongo-changestream-watcher
```

## Simple Example using Mongoose Adapter

```typescript
import { MongoChangeStreamWatcher } from '@casbin/mongo-changestream-watcher';
import { newEnforcer } from 'casbin';

// Initialize the watcher by connecting to a replica set.
const watcher = await MongoChangeStreamWatcher.newWatcher('mongodb://localhost:27001,localhost:27002/casbin?replicaSet=rs0', {collectionName: 'casbin_rule'});
const adapter = await MongooseAdapter.newAdapter('mongodb://localhost:27001,localhost:27002/casbin?replicaSet=rs0');
const enforcer = await newEnforcer('test/fixtures/basic_model.conf', adapter);

// Initialize the enforcer.
const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

enforcer.setWatcher(watcher);

// By default, the watcher's callback is automatically set to the
// enforcer's loadPolicy() in the setWatcher() call.
// We can change it by explicitly setting a callback.
watcher.setUpdateCallback(() => console.log('Casbin need update'));
```

## Notes

This watcher does not operate with `update`-calls typically found in other watchers. Mongo Change Stream directly reacts to changes in the database collection, and therefore all other watchers listening to the same stream will be automatically notified when changes do occur. However, this means that watcher also gets notified by its own changes.
