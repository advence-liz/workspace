import env from 'penv.macro'
// targetName PUBLISH_ENV
const BASE_URL = env(
  {
    development: '/',
    test: '//',
    production: '//',
  },
  '//.com',
)

const ENV = env(
  {
    development: 'dev',
    test: 'test',
    production: 'pro',
  },
  'dev',
)



export { BASE_URL, ENV }
