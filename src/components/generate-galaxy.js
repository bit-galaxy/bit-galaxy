import Matter, { Engine, Render, World, Bodies } from 'matter-js/build/matter.min';
import '../lib/matter-attractors.min';
import getHashData from '../utils/get-hash-data';
import { ranges, properties, defaults } from '../utils/default-options';
import {
  initializeBitsState,
  skimBits,
  pushBit,
  startSessionHandling,
} from './galaxy-handlers/handle-bits';
import { loadBits } from './galaxy-handlers/handle-session';

// add attractors plugin
Matter.use('matter-attractors');

// start the visualizer
const generateGalaxy = () => {
  // set globals
  const hashData = getHashData(window.location.hash);
  const engine = Engine.create();
  const TIME_SCALE = 0.3;
  const settings = defaults;

  // ------------------------------------------------------------
  // -- Set custom properties based on hash ---------------------
  // ------------------------------------------------------------
  const defineProperties = () => {
    for (let i = 0; i < properties.length; i++) {
      const property = +hashData[properties[i]];
      settings[properties[i]] =
        (!isNaN(property)
      && property >= ranges[properties[i]].min
      && property <= ranges[properties[i]].max)
          ? Math.floor(property / ranges[properties[i]].step)
            * ranges[properties[i]].step
          : ranges[properties[i]].default;
    }
  };

  // ------------------------------------------------------------
  // -- Create the gravitational center point -------------------
  // ------------------------------------------------------------
  const createAnchor = () => {
    const anchor = Bodies.circle(400, 400, 0, {
      label: 'anchor',
      mass: 100000,
      isStatic: true,
      collisionFilter: { group: 0 },
      plugin: {
        attractors: [
          (bodyA, bodyB) => ({
            x: bodyB.mass * (bodyA.position.x - bodyB.position.x) * 1e-6,
            y: bodyB.mass * (bodyA.position.y - bodyB.position.y) * 1e-6,
          }),
        ],
      },
    });
    World.addBody(engine.world, anchor);
  };

  // ------------------------------------------------------------
  // -- Initialize the bit handler ------------------------------
  // ------------------------------------------------------------
  const createBitHandler = () => {
    initializeBitsState(engine.world, settings);
    if (!hashData.demo) {
      loadBits();
      startSessionHandling();
    }

    window.addEventListener('on-bits', (e) => {
      const newBits = e.detail;
      skimBits(newBits.length);
      for (let i = 0; i < newBits.length; i++) {
        setTimeout(() => {
          pushBit(newBits[i].size, newBits[i].url);
        }, 400 * i);
      }
    });
  };

  // ------------------------------------------------------------
  // -- Run the engine and renderer -----------------------------
  // ------------------------------------------------------------
  const runVisualizer = () => {
    // turn off gravity
    engine.world.gravity.scale = 0;
    engine.world.gravity.y = 0;
    // set time scale
    engine.timing.timeScale = TIME_SCALE;

    // run the engine
    Engine.run(engine);

    // create a renderer
    const render = Render.create({
      element: document.body,
      canvas: document.getElementById('galaxy'),
      engine,
      options: {
        height: 800,
        width: 800,
        wireframes: false,
        background: 'transparent',
      },
    });

    // run the renderer
    Render.run(render);
  };

  // ------------------------------------------------------------
  // -- Controller Script ---------------------------------------
  // ------------------------------------------------------------
  const controller = () => {
    defineProperties();
    createAnchor();
    createBitHandler();
    runVisualizer();
  };

  // run controller
  controller();
};

export default generateGalaxy;


// TODO: slow down time a couple seconds after new bits are added
//        engine broken: (https://github.com/liabru/matter-js/issues/303)
// TODO: add option to put in logo image that will be placed in the center
//        (don't forget to scale the logo image so it is always the same size)
