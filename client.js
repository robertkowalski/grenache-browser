'use strict'

const retry = require('async/retry')

class PeerRPCClient {
  constructor (link, opts) {
    const defaults = {
      requestTimeout: 2500,
      ssl: false
    }

    this.conf = { ...defaults, ...opts }
    this.link = link
  }

  init () {
    // mimic node api
    return this
  }

  _request (key, payload, _opts, dest, cb) {
    const defaults = {
      timeout: this.conf.requestTimeout
    }

    const opts = { ...defaults, _opts }

    const rid = `browser-${Date.now()}`
    const data = {
      method: 'POST',
      body: JSON.stringify([rid, key, payload]),
      headers: { 'Content-Type': 'application/json' }
    }

    const t = setTimeout(() => {
      cb(new Error('ERR_TIMEOUT'))
    }, opts.timeout)

    const u = this.conf.ssl
      ? ('https://' + dest) : ('http://' + dest)

    fetch(u, data)
      .then((res) => {
        clearTimeout(t)
        return res.json().catch((err) => {
          console.error(err)
          return res
        })
      })
      .then(json => {
        const [, err, res] = json
        if (err) return new Error(err)

        cb(null, res)
      })
      .catch((err) => {
        clearTimeout(t)
        return cb(err)
      })
  }

  request (key, payload, opts = {}, cb) {
    if (typeof opts === 'function') return this.request(key, payload, undefined, opts)

    this.link.lookup(
      key, {},
      (err, dests) => {
        if (err) {
          return cb(err)
        }

        retry(
          opts.retry || 1,
          done => {
            const i = Math.floor(Math.random() * dests.length)
            const dest = dests[i]

            this._request(key, payload, opts, dest, done)
          },
          cb
        )
      }
    )
  }
}

module.exports = PeerRPCClient
