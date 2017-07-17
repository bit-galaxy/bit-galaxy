import Matter, { World } from 'matter-js/build/matter.min';
import { properties, defaults } from '../../utils/default-options';
import { handleGif, animateBit } from './handle-gifs';
import { initializeBitState, constructBit } from './handle-bit';
import { handleSession } from './handle-session';

const state = {
  bits: [],
  gifs: {},
  world: {},
  ...defaults,
};

export const initializeBitsState = (world, settings) => {
  state.world = world;
  for (let i = 0; i < properties.length; i++) {
    state[properties[i]] = settings[properties[i]];
  }
  initializeBitState(state.animation_pause);
};

export const skimBits = (amount = 0) => {
  if (state.bits.length + amount > state.bit_limit) {
    const l =  (state.bits.length + amount) - state.bit_limit;
    for (let i = 0; state.bits.length > 1 && i < l; i++) {
      const bit = state.bits.pop();
      const bitBody = bit.body;
      bit.body = null;
      World.remove(state.world, bitBody);
    }
  }
};

const pushBitToScene = (bit, body) => {
  if (body === null) {
    Matter.Body.setVelocity(bit.body, {
      x: (Math.random() * 2) + 1,
      y: (Math.random() * -0.8) - 0.4,
    });
    setTimeout(() => {
      if (bit && bit.body) {
        Matter.Body.setVelocity(bit.body, {
          x: (Math.random() * 1) + 0.3,
          y: (Math.random() * -0.8) - 0.4,
        });
      }
    }, 2500);
  }

  World.addBody(state.world, bit.body);
};

const pushBitToBitsQueue = (bit, size) => {
  bit.timestamp = ((new Date()).getTime() / 1000) + size + 10;

  if (state.bits.length >= state.bit_limit) skimBits();
  let pushed = false;
  for (let i = 0; i < state.bits.length; i++) {
    if (bit.timestamp > state.bits[i].timestamp) {
      const tempArray = state.bits;
      state.bits = state.bits.slice(0, i);
      state.bits.push(bit);
      state.bits = state.bits.concat(tempArray.slice(i, tempArray.length));
      pushed = true;
      break;
    }
  }
  if (!pushed) state.bits.push(bit);
};

export const pushBit = (size, texture, body = null) => {
  handleGif(texture).then((gifData) => {
    const bit = constructBit({
      size,
      texture,
      gifData,
      body,
    });
    animateBit(texture, bit);

    pushBitToBitsQueue(bit, size);
    pushBitToScene(bit, body);
  });
};

export const startSessionHandling = () => handleSession(state);
