import { newEnforcer, Enforcer } from 'casbin'
import { MongooseAdapter, CasbinRule } from 'casbin-mongoose-adapter'
import { MongoChangeStreamWatcher } from '../../src/watcher'

describe('Watcher Tests', () => {
  let enforcer: Enforcer, watcher: MongoChangeStreamWatcher, adapter: MongooseAdapter
  beforeAll(async () => {
    adapter = await MongooseAdapter.newAdapter('mongodb://localhost:27001,localhost:27002/casbin?replicaSet=rs0')
    await CasbinRule.deleteMany()
    enforcer = await newEnforcer('test/fixtures/basic_model.conf', adapter)
  })

  it('Setting a stream to non-existant collection should succeed', async () => {
    watcher = await MongoChangeStreamWatcher.newWatcher('mongodb://localhost:27001,localhost:27002?replicaSet=rs0', { logger: console, dbName: 'casbin' })
    await watcher.close()
    watcher = await MongoChangeStreamWatcher.newWatcher('mongodb://localhost:27001,localhost:27002/casbin?replicaSet=rs0')
    // @ts-expect-error
    expect(watcher.client.db().databaseName).toBe('casbin')
    await watcher.close()
  })

  it('Setting a stream to existing collection should succeed', async () => {
    watcher = await MongoChangeStreamWatcher.newWatcher('mongodb://localhost:27001,localhost:27002/casbin?replicaSet=rs0', { collectionName: 'casbin_rule' })
    // @ts-expect-error
    const namespace = watcher.changeStream.namespace
    expect(namespace.db).toBe('casbin')
    expect(namespace.collection).toBe('casbin_rule')
  })

  it('Callback is called', async () => {
    return await new Promise<void>((resolve) => {
      enforcer.setWatcher(watcher)
      // @ts-expect-error
      const spyDebug = jest.spyOn(watcher?.logger, 'debug')
      expect(watcher.toggleLogger()).toBe(true)
      watcher.setUpdateCallback(() => {
        expect(spyDebug).toBeCalled()
        resolve()
      })
      void enforcer.addPolicy('sub', 'obj', 'act')
    })
  })

  test('Logger should not get enabled when it is undefined', async () => {
    // @ts-expect-error
    watcher.logger = undefined
    expect(watcher.toggleLogger()).toBe(false)
  })

  afterAll(async () => {
    await CasbinRule.deleteMany()
    await watcher?.close()
    await adapter?.close()
  })
})
