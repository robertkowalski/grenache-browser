/* eslint-env mocha */

'use strict'

require('isomorphic-fetch')

const Link = require('grenache-nodejs-link')
const assert = require('assert')
const createGrapes = require('bfx-svc-test-helper/grapes')

const BrowserLink = require('../link')

let grapes
describe('link', () => {
  before(function (done) {
    this.timeout(20000)

    grapes = createGrapes()
    grapes.start(done)
  })

  after(function (done) {
    this.timeout(5000)
    grapes.stop(done)
  })

  it('lookup works with optional arguments', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })

    link.start()

    const browserLink = new BrowserLink({
      grape: 'http://127.0.0.1:30001'
    })

    browserLink.start()

    link.startAnnouncing('test', 10000, null, (err) => {
      if (err) throw err
      browserLink.lookup('test', {}, (err, res) => {
        if (err) throw err
        assert.deepStrictEqual(res, [ '127.0.0.1:10000' ])

        // no options passed
        browserLink.lookup('test', (err, res) => {
          if (err) throw err
          assert.deepStrictEqual(res, [ '127.0.0.1:10000' ])
          link.stop()
          browserLink.stop()

          done()
        })
      })
    })
  })
})
