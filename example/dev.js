'use strict'

const express = require('express')
const cors = require('cors')
const request = require('request')
const app = express()
const fs = require('fs')
const path = require('path')
const browserify = require('browserify')

const createGrapes = require('bfx-svc-test-helper/grapes')
const Link = require('grenache-nodejs-link')
const { PeerRPCServer } = require('grenache-nodejs-http')
const async = require('async')

const PROXY_PORT = 1337
const grenacheServicePort = 1338

function bundle (cb) {
  const src = path.join(__dirname, '..', 'index.js')
  const target = fs.createWriteStream(path.join(__dirname, 'dist.js'))
  browserify(src, { standalone: 'Grenache' })
    .bundle()
    .pipe(target)
    .on('finish', cb)
}

function grenache (cb) {
  const grapes = createGrapes()
  grapes.start(() => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    }).start()

    const peerSrv = new PeerRPCServer(link, {
      timeout: 300000
    })

    peerSrv.init()

    const service = peerSrv.transport('buffered')
    service.listen(grenacheServicePort)

    service.on('request', (rid, key, payload, handler, cert, meta) => {
      handler.reply(null, { hello: 'helloworld' })
    })

    link.announce('rpc_test', PROXY_PORT, {}, (err, res) => {
      if (!err) return

      console.error(err)
      throw Error('error in announce, before')
    })

    cb()
  })
}

function serve (cb) {
  app.use(cors())

  app.use(
    express.static(__dirname, {
      index: [ 'index.html' ],
      extensions: [ 'html' ]
    })
  )

  app.post('/lookup', function (req, res) {
    const origin = 'http://127.0.0.1:30001/' + req.path
    req.pipe(request.post(origin)).pipe(res)
  })

  app.post('*', function (req, res) {
    const origin = 'http://127.0.0.1:' + grenacheServicePort
    req.pipe(request.post(origin)).pipe(res)
  })

  app.listen(PROXY_PORT, () => {
    console.log(`listening on port ${PROXY_PORT}!`)
    console.log(`http://127.0.0.1:${PROXY_PORT}`)
    cb()
  })
}

async.waterfall([bundle, grenache, serve])
