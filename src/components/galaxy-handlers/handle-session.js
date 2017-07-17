import { pushBit, skimBits } from './handle-bits';

export const loadBits = () => {
  const bitsString = sessionStorage.getItem('bits');
  if (bitsString) {
    const bits = JSON.parse(bitsString);
    for (let i = 0; i < bits.length; i++) {
      pushBit(bits[i].size, bits[i].texture, bits[i].body);
    }
    skimBits(bits.length);
  }
};

export const handleSession = (bitsState) => {
  setInterval(() => {
    const bits = bitsState.bits.map(({ body, size, texture }) => {
      const newBody = { ...body };
      delete newBody.parent;
      delete newBody.parts;
      delete newBody.vertices;
      delete newBody.render;
      const storedBit = {
        body: newBody,
        size,
        texture,
      };
      return storedBit;
    });

    sessionStorage.setItem('bits', JSON.stringify(bits));
  }, 500);
};
