import getHashData from '../utils/get-hash-data';
import setHashData from '../utils/set-hash-data';

// TODO: add in test id when compiled in dev mode
const ClientID = '9hwtjyz2k3fosgnfy8c994fwwkh1w2';

const bitApiInterface = () => {
  // set globals
  const bitToURL = {};
  let bitRegex;

  // ------------------------------------------------------------
  // -- Register event dispatchers ------------------------------
  // ------------------------------------------------------------
  const onBits = (bits) => {
    window.dispatchEvent(new CustomEvent('on-bits', { detail: bits }));
  };
  const onReady = () => {
    window.dispatchEvent(new CustomEvent('on-api-ready'));
  };

  // ------------------------------------------------------------
  // -- Redirect the user for authentication --------------------
  // ------------------------------------------------------------
  const authorize = () => {
    window.location = 'https://api.twitch.tv/kraken/oauth2/authorize'
      + `?client_id=${ClientID}`
      + '&redirect_uri=https://open-stream-visualizers.github.io/bit-galaxy/'
      + '&response_type=token'
      + '&scope=user_read';
  };

  // ------------------------------------------------------------
  // -- Fetch the channel id of the user ------------------------
  // ------------------------------------------------------------
  const fetchIDandName = accessToken => (
    new Promise((resolve, reject) => {
      const headers = new Headers();
      headers.append('Accept', 'application/vnd.twitchtv.v5+json');
      headers.append('Client-ID', ClientID);
      const init = {
        method: 'GET',
        headers,
        mode: 'cors',
        cache: 'default',
      };
      fetch(`https://api.twitch.tv/kraken?oauth_token=${accessToken}`, init)
        .then((data) => {
          data.json().then((res) => {
            resolve({ id: res.token.user_id, name: res.token.user_name });
          });
        })
        .catch(reject);
    })
  );

  // ------------------------------------------------------------
  // -- Generate a random Nonce string --------------------------
  // ------------------------------------------------------------
  const generateNonce = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789';
    let nonce = '';
    for (let i = 1; i < 25; i++) {
      if (i !== 0 && i % 5 === 0) nonce += '-';
      else nonce += chars[Math.floor(Math.random() * chars.length)];
    }
    return nonce;
  };

  // ------------------------------------------------------------
  // -- Build bit regex -----------------------------------------
  // ------------------------------------------------------------
  const buildBitToURL = (bitTypes) => {
    for (let i = 0; i < bitTypes.length; i++) {
      const name = bitTypes[i].prefix.toLowerCase();
      bitToURL[name] = [];
      for (let j = 0; j < bitTypes[i].tiers.length; j++) {
        bitToURL[name].push({
          min: bitTypes[i].tiers[j].min_bits,
          url: bitTypes[i].tiers[j].images.light.animated['4'],
        });
      }
    }
  };

  // ------------------------------------------------------------
  // -- Build bit regex -----------------------------------------
  // ------------------------------------------------------------
  const buildBitRegex = (bitTypes) => {
    let regex = `(^|\\s)${bitTypes[0].prefix}\\d+(?=\\s|$)`;
    for (let i = 1; i < bitTypes.length; i++) {
      regex += `|(^|\\s)${bitTypes[i].prefix}\\d+(?=\\s|$)`;
    }
    return new RegExp(regex, 'ig');
  };

  // ------------------------------------------------------------
  // -- Get bit specs from API ----------------------------------
  // ------------------------------------------------------------
  const getBitSpecs = (id, demo) => (
    new Promise((resolve, reject) => {
      const headers = new Headers();
      headers.append('Accept', 'application/vnd.twitchtv.v5+json');
      headers.append('Client-ID', ClientID);
      const init = {
        method: 'GET',
        headers,
        mode: 'cors',
        cache: 'default',
      };
      const query = demo ?
        'https://api.twitch.tv/kraken/bits/actions' :
        `https://api.twitch.tv/kraken/bits/actions?channel_id=${id}`;
      fetch(query, init)
        .then((data) => {
          data.json().then((res) => {
            bitRegex = buildBitRegex(res.actions);
            buildBitToURL(res.actions);
            resolve();
          });
        })
        .catch(reject);
    })
  );

  // ------------------------------------------------------------
  // -- Parse bit data ------------------------------------------
  // ------------------------------------------------------------
  const getBits = (bitData) => {
    const data = bitData.data.chat_message.match(bitRegex);
    const bits = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const cheer = data[i].match(/[^\s]+/g)[0].split(/(\d+$)/);
        const size = +cheer[1];
        let url = null;
        const urls = bitToURL[cheer[0].toLowerCase()];
        for (let j = 1; url === null && j < urls.length; j++) {
          if (size < urls[j].min) url = urls[j - 1].url;
        }
        if (url === null) url = urls[urls.length - 1].url;
        bits.push({
          url,
          size,
        });
      }
    }
    return bits;
  };

  // ------------------------------------------------------------
  // -- Get delay to next reconnect request ---------------------
  // ------------------------------------------------------------
  class ReconnectDelay {
    constructor() {
      this.MAX_DELAY = 120500;
      this.delay = Math.floor(100 * Math.random());
    }

    get() {
      const delay = this.delay;
      this.delay *= 2;
      if (this.delay > this.MAX_DELAY) {
        this.delay = (this.MAX_DELAY - 500) + Math.floor(Math.random() * 500);
      }
      return delay;
    }

    // call on connection success
    reset() {
      this.delay = Math.floor(100 * Math.random());
    }
  }
  const reconnectDelay = new ReconnectDelay();

  // ------------------------------------------------------------
  // -- Ping connection -----------------------------------------
  // ------------------------------------------------------------
  const ping = (socket, status, reconnect) => {
    socket.send(JSON.stringify({
      type: 'PING',
    }));
    setTimeout(() => {
      if (status.pong) status.pong = false;
      else {
        if (socket.readyState !== socket.CLOSED) socket.close();
        setTimeout(reconnect, reconnectDelay.get());
      }
    }, 11000);
  };

  // ------------------------------------------------------------
  // -- Open WebSocket connection to PubSub bit events ----------
  // ------------------------------------------------------------
  const openSocket = (hashData) => {
    const socket = new WebSocket('wss://pubsub-edge.twitch.tv');
    const nonce = `bit-events ${generateNonce()}`;
    const status = { pong: false };

    const bound = openSocket.bind(null, hashData);

    // Connection opened
    socket.addEventListener('open', () => {
      ping(socket, status, bound);
      setInterval(
        () => ping(socket, status, bound),
        280000 + Math.floor(Math.random() * 100),
      );

      socket.send(JSON.stringify({
        type: 'LISTEN',
        nonce,
        data: {
          topics: [`channel-bits-events-v1.${hashData.id}`],
          auth_token: hashData.access_token,
        },
      }));
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.error === 'ERR_BADAUTH') {
        window.location.hash = '';
        socket.close();
      }

      switch (data.type) {
        case 'PONG':
          status.pong = true;
          break;
        case 'RESPONSE':
          reconnectDelay.reset();
          break;
        case 'MESSAGE':
          // parse bits and send data to callback
          onBits(getBits(JSON.parse(data.message)));
          break;
        case 'RECONNECT':
          socket.close();
          setTimeout(() => openSocket(hashData), reconnectDelay.get());
          break;
        default:
          break;
      }
    });

    socket.addEventListener('close', () => {
      setTimeout(() => openSocket(hashData), reconnectDelay.get());
    });
  };

  // ------------------------------------------------------------
  // -- Controller Script ---------------------------------------
  // ------------------------------------------------------------
  const controller = () => {
    // get hash location
    const hash = window.location.hash;
    if (hash && hash.indexOf('demo') !== -1) {
      const hashData = getHashData(hash);
      getBitSpecs(hashData.id, true);
      onReady();
      setTimeout(() => {
        onBits(getBits({ data: { chat_message: 'cheer1 cheer1 cheer1 cheer1 cheer1 cheer100 cheer100 cheer100 cheer1000 cheer1000 cheer5000 cheer10000' } }));
      }, 1000);
      window.onmessage = (message) => {
        onBits(getBits({ data: { chat_message: message.data } }));
      };
    } else if (!hash || hash.indexOf('access_token') === -1) {
      authorize();
    } else {
      const hashData = getHashData(hash);
      if (!hashData.id || !hashData.name) {
        fetchIDandName(hashData.access_token)
          .then((data) => {
            hashData.id = data.id;
            hashData.name = data.name;
            setHashData(hashData);
            getBitSpecs(hashData.id).then(() => {
              openSocket(hashData);
            });
            onReady();
          });
      } else {
        getBitSpecs(hashData.id).then(() => {
          openSocket(hashData);
        });
        onReady();
      }
    }
  };

  // run controller
  controller();
};

export default bitApiInterface;
