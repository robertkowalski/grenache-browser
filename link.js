'use strict'

const retry = require('async/retry')

class Link {
  constructor (opts) {
    const defaults = {
      grape: null,
      requestTimeout: 2500
    }

    this.conf = { ...defaults, ...opts }
  }

  start () {
    // mimic node api
    return this
  }

  stop () {
    // mimic node api
    return this
  }

  request (type, payload, _opts = {}, cb) {
    retry(_opts.retry || 1, next => {
      this._request(type, payload, _opts, next)
    }, cb)
  }

  _request (type, payload, _opts, cb) {
    const defaults = {
      timeout: this.conf.requestTimeout
    }

    const opts = { ...defaults, _opts }

    const rid = `browser-${Date.now()}`
    const data = {
      method: 'POST',
      body: JSON.stringify({ rid: rid, data: payload }),
      headers: { 'Content-Type': 'application/json' }
    }

    const t = setTimeout(() => {
      cb(new Error('ERR_TIMEOUT'))
    }, opts.timeout)

    fetch(`${this.conf.grape}/${type}`, data)
      .then((res) => {
        clearTimeout(t)
        return res.json().catch((err) => {
          console.error(err)
          return res
        })
      })
      .then(json => {
        cb(null, json)
      })
      .catch((err) => {
        clearTimeout(t)
        return cb(err)
      })
  }

  lookup (key, _opts, cb) {
    if (typeof _opts === 'function') return this.lookup(key, {}, _opts)

    const defaults = {
      retry: 3
    }

    const opts = { ...defaults, ..._opts }
    this.request('lookup', key, opts, (err, res) => {
      if (err) {
        return cb(err)
      }

      if (!Array.isArray(res) || !res.length) {
        return cb(new Error('ERR_GRAPE_LOOKUP_EMPTY'))
      }

      cb(null, res)
    })
  }
}

module.exports = Link
