/* eslint-env mocha */

'use strict'

require('isomorphic-fetch')

const assert = require('assert')
const createGrapes = require('bfx-svc-test-helper/grapes')

const Link = require('grenache-nodejs-link')

const { PeerRPCServer } = require('grenache-nodejs-http')

const PeerRPCClient = require('../client')
const BrowserLink = require('../link')

let grapes, link, service, peerSrv
describe('client', () => {
  before(async function () {
    this.timeout(20000)

    grapes = createGrapes()
    await grapes.start()

    link = new Link({
      grape: 'http://127.0.0.1:30001'
    }).start()

    peerSrv = new PeerRPCServer(link, {
      timeout: 300000
    })

    peerSrv.init()

    service = peerSrv.transport('buffered')
    service.listen(1337)

    link.announce('rpc_test', service.port, {}, (err, res) => {
      if (!err) return

      console.log(err)
      throw Error('error in announce, before')
    })
  })

  after(function (done) {
    this.timeout(5000)
    grapes.stop(done)
  })

  it('works', (done) => {
    const browserLink = new BrowserLink({
      grape: 'http://127.0.0.1:30001'
    }).start()

    const peer = new PeerRPCClient(browserLink, { ssl: false })
    peer.init()

    service.on('request', (rid, key, payload, handler, cert, meta) => {
      handler.reply(null, { hello: 'helloworld' })
    })

    const opts = { timeout: 100000 }
    peer.request('rpc_test', { hello: 'world' }, opts, (err, result) => {
      if (err) throw err

      assert.deepStrictEqual(result, { hello: 'helloworld' })

      link.stop()
      service.stop()

      done()
    })
  })
})
