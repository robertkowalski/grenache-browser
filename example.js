'use strict'

// nodejs fetch api polyfill
// require('isomorphic-fetch')

const Link = require('./link')
const PeerRPCClient = require('./client')

const link = new Link({
  grape: 'http://127.0.0.1:1337'
}).start()

const peer = new PeerRPCClient(link, { ssl: false })
peer.init()

const opts = { timeout: 100000 }
peer.request('rpc_test', { hello: 'world' }, opts, (err, res) => {
  console.log(err, res)
})
