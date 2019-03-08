# grenache-browser

Minimalistic Grenache HTTP implementation for the browser.

Aim is to have full browser compatability with the smallest amounts of deps as possible, to reduce file sizes for the frontend.

To use Grenache in the Browser, CORS headers must be set by a proxy (e.g. haproxy or nginx).

In dev mode, [we use express](/example/dev.js)

## Usage

```js
const { Link, PeerRPCClient } = require('grenache-browser')

const link = new Link({
  grape: 'http://127.0.0.1:1337'
}).start()

const peer = new PeerRPCClient(link, { ssl: false })
peer.init()

const opts = { timeout: 100000 }
peer.request('rpc_test', { hello: 'world' }, opts, (err, res) => {
  console.log(err, res)
})
```

[/example/](/example/)


### Development

```
cd example
node dev.js
```

## API

### Class: Link

#### new Link(opts) => Link

 - `opts <Object>` Options for the link
  - `grape <String>` Address of the Grenache Grape instance
  - `requestTimeout <Number>` Default timeout for requests to Grape network
  - `fetch <Function>` WHATWG fetch API compatible client, defaults to `window.fetch`


#### link.start() => link

Sets up the link for usage.

#### link.stop()  => link

Stops the link.


### Class: PeerRPCClient

#### new PeerRPCClient(link, opts) => Client


 - `opts <Object>` Options for the link
  - `requestTimeout <Number>` Default timeout for requests to Grape network
  - `ssl` Use SSL protocol


#### client.init() => client

Starts the client.

#### client.request(key, payload, [opts], cb)

 - `opts <Object>` Options for the link
  - `timeout <Number>` Timeout for request

