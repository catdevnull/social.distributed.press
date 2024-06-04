/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import test from 'ava'
import { ActivityStore } from './ActivityStore'
import { MemoryLevel } from 'memory-level'
import { APActivity } from 'activitypub-types'

function newActivityStore (): ActivityStore {
  return new ActivityStore(new MemoryLevel({ valueEncoding: 'json' }))
}

// Sample data for the tests
const activity: APActivity = {
  '@context': 'https://www.w3.org/ns/activitystreams',
  type: 'Create',
  published: new Date().toISOString(),
  actor: 'https://example.com/user1',
  object: {
    type: 'Note',
    content: 'Hello world',
    id: 'https://example.com/note1'
  },
  id: 'https://example.com/activity1'
}

test('ActivityStore - add and get activity', async t => {
  const store = newActivityStore()
  await store.add(activity)

  const retrievedActivity = await store.get(activity.id!)
  t.deepEqual(retrievedActivity, activity)
})

test('ActivityStore - remove activity', async t => {
  const store = newActivityStore()
  await store.add(activity)

  await store.remove(activity.id!)

  // Ensure the activity is deleted
  await t.throwsAsync(async () => {
    await store.get(activity.id!)
  }, {
    instanceOf: Error,
    message: `Activity not found for URL: ${activity.id!}`
  })
})

test('ActivityStore - list activities', async t => {
  const store = newActivityStore()
  const d1 = new Date(40000).toISOString()
  const d2 = new Date(200000).toISOString()
  const id1 = 'b'
  const id2 = 'a'
  const a1 = { ...activity, id: id1, published: d1 }
  const a2 = { ...activity, id: id2, published: d2 }
  await store.add(a1)
  await store.add(a2)

  const activities = await store.list()
  // Should be newest first
  t.deepEqual(activities, [a2, a1])
})
