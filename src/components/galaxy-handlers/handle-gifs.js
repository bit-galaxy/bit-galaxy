import GifReader from '../../lib/omggif';
import { getBitFrame } from './handle-bit';

const state = { gifs: {} };

const getGif = url => (
  new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.send();
  })
);

const createSpritePromise = sprite => (
  new Promise((resolve) => {
    sprite.onload = resolve;
  })
);

const getGifData = ({ height, width, frameCount }) => ({
  height,
  width,
  frameCount,
});

export const handleGif = (texture) => {
  const promise = new Promise((resolve) => {
    if (typeof state.gifs[texture] === 'undefined') {
      state.gifs[texture] = {
        bits: [],
        frames: [],
        animating: false,
      };
      const gif = state.gifs[texture];

      getGif(texture).then((gifData) => {
        const spritePromises = [];
        const can = document.createElement('canvas');
        const ctx = can.getContext('2d');
        const gr = new GifReader(new Uint8Array(gifData));
        ctx.clearRect(0, 0, can.height, can.width);
        can.height = gr.height;
        can.width = gr.width;
        const template = ctx.createImageData(gr.width, gr.height);
        let imagedata = ctx.createImageData(gr.width, gr.height);
        let last1 = 2;
        let last2 = 2;
        for (let i = 0; i < gr.length; i++) {
          const type = last1 + last2;
          if (type === 4) {
            imagedata = ctx.createImageData(gr.width, gr.height);
            gr.decodeAndBlitFrameRGBA(i, imagedata.data);
            template.data.set(imagedata.data);
          } else if (type === 3 && last2 === 2) {
            imagedata = ctx.createImageData(gr.width, gr.height);
            imagedata.data.set(template.data);
            gr.decodeAndBlitFrameRGBA(i, imagedata.data);
            template.data.set(imagedata.data);
          } else {
            gr.decodeAndBlitFrameRGBA(i, imagedata.data);
          }
          ctx.clearRect(0, 0, can.height, can.width);
          ctx.putImageData(imagedata, 0, 0);
          const data = can.toDataURL('image/png');
          const sprite = new Image();
          spritePromises.push(createSpritePromise(sprite));
          sprite.src = data;
          gif.frames.push(sprite);
          last1 = last2;
          last2 = gr.sizes[i];
        }

        gif.frameCount = gr.length;
        gif.height = gr.height;
        gif.width = gr.width;
        gif.delay = gr.delays[0];

        Promise.all(spritePromises).then(() => {
          resolve(getGifData(gif));
        });
      });
    } else {
      const gif = state.gifs[texture];
      gif.promise.then(() => {
        resolve(getGifData(gif));
      });
    }
  });
  if (typeof state.gifs[texture].promise === 'undefined') {
    state.gifs[texture].promise = promise;
  }
  return promise;
};

const setSprite = (gif, body, frameNum) => {
  if (gif.frames[frameNum]) {
    body.render.sprite.texture = gif.frames[frameNum].src;
  }
};

const animateGif = (texture) => {
  const gif = state.gifs[texture];
  for (let i = 0; i < gif.bits.length; i++) {
    if (gif.bits[i].body === null) {
      gif.bits.splice(i, 1);
      i--;
    } else {
      setSprite(gif, gif.bits[i].body, getBitFrame(gif.bits[i]));
    }
  }
  if (gif.bits.length > 0) {
    setTimeout(() => animateGif(texture), gif.delay);
  } else {
    gif.animating = false;
  }
};

export const animateBit = (texture, bit) => {
  const gif = state.gifs[texture];
  if (gif.animating === false) {
    gif.bits.push(bit);
    gif.animating = true;
    animateGif(texture);
  } else {
    gif.bits.push(bit);
  }
};
