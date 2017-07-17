export const ranges = {
  bit_limit: {
    title: 'Bit Limit',
    subtitles: [
      'the maximum number of bits allowed on screen at once',
      '(try lowering the amount if you experience bad performance)',
    ],
    min: 50,
    max: 200,
    default: 125,
    step: 25,
  },
  animation_pause: {
    title: 'Animation Pause',
    subtitles: [
      'the rough number of seconds to pause bit animations',
      '(the actual numbers will be slightly randomized)',
    ],
    min: 0,
    max: 120,
    default: 60,
    step: 1,
  },
};

export const properties = Object.keys(ranges);

const getDefaults = () => {
  const defaults = {};
  for (let i = 0; i < properties.length; i++) {
    defaults[properties[i]] = ranges[properties[i]].default;
  }
  return defaults;
};

export const defaults = getDefaults();
