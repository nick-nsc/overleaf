const {
  db,
  waitForDb,
  READ_PREFERENCE_SECONDARY,
} = require('../app/src/infrastructure/mongodb')
const UserSessionsManager = require('../app/src/Features/User/UserSessionsManager')

const COMMIT = process.argv.includes('--commit')
const LOG_SESSIONS = !process.argv.includes('--log-sessions=false')

async function main() {
  await waitForDb()
  const adminUsers = await db.users
    .find(
      { isAdmin: true },
      {
        projection: {
          _id: 1,
          email: 1,
        },
        readPreference: READ_PREFERENCE_SECONDARY,
      }
    )
    .toArray()

  if (LOG_SESSIONS) {
    for (const user of adminUsers) {
      user.sessions = JSON.stringify(
        await UserSessionsManager.promises.getAllUserSessions(user, [])
      )
    }
  }
  console.log('All Admin users before clearing:')
  console.table(adminUsers)

  if (COMMIT) {
    let anyFailed = false
    for (const user of adminUsers) {
      console.error(
        `Clearing sessions for ${user.email} (${user._id.toString()})`
      )
      user.clearedSessions = 0
      try {
        user.clearedSessions =
          await UserSessionsManager.promises.removeSessionsFromRedis(user)
      } catch (err) {
        anyFailed = true
        console.error(err)
      }
    }
    console.log('All Admin users after clearing:')
    console.table(adminUsers)

    if (anyFailed) {
      throw new Error('failed to clear some sessions, see above for details')
    }
  } else {
    console.warn('Use --commit to clear sessions.')
  }
}

main()
  .then(() => {
    console.error('Done.')
    process.exit(0)
  })
  .catch(error => {
    console.error({ error })
    process.exit(1)
  })
