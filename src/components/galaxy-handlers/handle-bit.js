import { Bodies } from 'matter-js/build/matter.min';
import MatterAttractors from '../../lib/matter-attractors.min';

const state = { animation_pause: 0 };

export const initializeBitState = (animationPause) => {
  state.animation_pause = animationPause;
};

const getDefaultBit = ({ size, texture, gifData }) => ({
  body: null,
  frameCount: gifData.frameCount,
  frame: 0,
  pauseStart: null,
  pause: 2,
  size,
  texture,
});

const getSprite = ({ size, texture, gifData }) => ({
  texture,
  xScale: (84 / gifData.width) * (0.3 + (((Math.log(size) ** 1.88) + 1) / 100)),
  yScale: (84 / gifData.width) * (0.3 + (((Math.log(size) ** 1.88) + 1) / 100)),
});

const getRadius = ({ size }) => ((4 * (((Math.log(size) ** 2) / 12) + 1)) + 5);

const setBitBody = (bit, sprite, radius, { size, body }) => {
  if (body !== null) { // if loading from session storage
    bit.body = Bodies.circle(
      body.position.x,
      body.position.y,
      radius,
      {
        ...body,
        circleRadius: radius,
        render: { sprite },
      },
    );
  } else { // if creating from scratch
    bit.body = Bodies.circle(
      -((Math.random() * 300) + 30),
      (Math.random() * 300) + 100,
      radius,
      {
        torque: ((Math.random() * 0.01) + 0.01) * ((Math.log(size) + 1) ** 2),
        mass: (Math.log(size) + 1) ** 2,
        friction: 0,
        frictionAir: 0,
        render: { sprite },
        plugin: { attractors: [MatterAttractors.Attractors.gravity] },
      },
    );
  }
};

export const constructBit = (bitData) => { // bitData = { size, texture, gifData, body }
  const bit = getDefaultBit(bitData);
  const sprite = getSprite(bitData);
  const radius = getRadius(bitData);

  setBitBody(bit, sprite, radius, bitData);

  return bit;
};

export const getBitFrame = (bit) => {
  if (bit.pauseStart === null) {
    bit.frame++;
    if (bit.frameCount) bit.frame %= bit.frameCount;
    if (bit.frame === 0) {
      bit.pauseStart = ((new Date()).getTime() / 1000);
    }
  } else if (((new Date()).getTime() / 1000) - bit.pauseStart >= bit.pause) {
    bit.pauseStart = null;
    bit.frame++;
    if (bit.frameCount) bit.frame %= bit.frameCount;
    bit.pause = state.animation_pause + (Math.random() * (state.animation_pause / 4));
  }
  return bit.frame;
};
