// ref https://visionmedia.github.io/superagent
import superagent from 'superagent'
import config from '@/config'
const { header, host } = config
const currentHost = host()
/**
 *
 * @param {string} url
 * @param {object} params
 */
const post = (url, params = {}) => {
  return superagent
    .post(`${currentHost}${url}`)
    .withCredentials()
    .send(params)
    .then(res => res.body)
}
/**
 *
 * @param {string} url
 * @param {object} params
 */
const get = (url, params = {}) => {
  return superagent
    .get(`${currentHost}${url}`)
    .query(params)
    .withCredentials()
    .then(res => res.body)
}

export { post, get }
