import getHashData from '../utils/get-hash-data';
import setHashData from '../utils/set-hash-data';
import { ranges, properties, defaults } from '../utils/default-options';
import customizeCSS from '../css/customize.css';

const customizeGalaxy = () => {
  // set globals
  const hashData = getHashData(window.location.hash);
  const settings = defaults;

  // ------------------------------------------------------------
  // -- Register event dispatcher -------------------------------
  // ------------------------------------------------------------
  const onReady = () => {
    window.dispatchEvent(new CustomEvent('on-customize-ready'));
  };

  // ------------------------------------------------------------
  // -- Make canvas visible and dispatch ready event ------------
  // ------------------------------------------------------------
  const finish = () => {
    const galaxy = document.getElementById('galaxy');
    galaxy.style.display = 'block';
    galaxy.style.height = '100vh';
    galaxy.style.width = '100vh';
    onReady();
  };

  // ------------------------------------------------------------
  // -- Set default values if none set --------------------------
  // ------------------------------------------------------------
  const setDefaults = () => {
    for (let i = 0; i < properties.length; i++) {
      if (!hashData[properties[i]] || isNaN(+hashData[properties[i]])) {
        hashData[properties[i]] = settings[properties[i]];
      } else {
        settings[properties[i]] = hashData[properties[i]];
      }
    }
    setHashData(hashData);
  };

  // ------------------------------------------------------------
  // -- Create a slider -----------------------------------------
  // ------------------------------------------------------------
  const createSlider = (property) => {
    let slider = `<div class="text title">${ranges[property].title}</div>`;
    for (let i = 0; i < ranges[property].subtitles.length; i++) {
      slider += `<div class="text subtitle">${ranges[property].subtitles[i]}</div>`;
    }
    slider += `<div class="text default">default: ${ranges[property].default}</div>`
            + `<input id="${property}-slider" class="slider" type="range" `
            +   `list="${property}-tickmarks" min="${ranges[property].min}" `
            +   `max="${ranges[property].max}" value="${settings[property]}" `
            +   `step="${ranges[property].step}">`
            + `<datalist id="${property}-tickmarks">`;
    let limit = (
      (ranges[property].max - ranges[property].min)
      / ranges[property].step
    ) + 1;
    limit = limit > 13 ? 13 : limit;
    const chunk = (ranges[property].max - ranges[property].min) / (limit - 1);
    for (let i = 0; i < limit; i++) {
      slider += `<option value="${ranges[property].min + (chunk * i)}">`;
    }
    slider += '</datalist>'
            + `<div id="${property}-display" class="text display">`
            +   `${settings[property]}</div>`
            + '<div id="middle-divider" class="divider"></div>';
    return slider;
  };

  // ------------------------------------------------------------
  // -- Create customization interface --------------------------
  // ------------------------------------------------------------
  const createInterface = (customizeDiv) => {
    document.getElementsByTagName('html')[0].style = 'background:#333;';
    let customizePage = `<style type="text/css">${customizeCSS}</style>`
      + '<div id="customize-title" class="text">Customize</div>'
      + '<div id="title-divider" class="divider"></div>';
    for (let i = 0; i < properties.length; i++) {
      customizePage += createSlider(properties[i]);
    }
    customizePage += '<button type="submit" id="done">Done</button>';
    customizeDiv.innerHTML = customizePage;
  };

  // ------------------------------------------------------------
  // -- Handle sliders ------------------------------------------
  // ------------------------------------------------------------
  const handleSliders = () => {
    for (let i = 0; i < properties.length; i++) {
      const display = document.getElementById(`${properties[i]}-display`);
      const slider = document.getElementById(`${properties[i]}-slider`);
      slider.onmousemove = (e) => {
        display.innerText = e.target.value;
      };
      slider.onchange = (e) => {
        display.innerText = e.target.value;
        settings[properties[i]] = e.target.value;
        hashData[properties[i]] = e.target.value;
        setHashData(hashData);
      };
    }
  };

  // ------------------------------------------------------------
  // -- Handle done button --------------------------------------
  // ------------------------------------------------------------
  const handleDone = (customizeDiv, cb) => {
    const done = document.getElementById('done');
    done.onclick = () => {
      hashData.customized = 1;
      setHashData(hashData);
      customizeDiv.innerHTML = '';
      document.getElementsByTagName('html')[0].style = '';

      cb();
    };
  };

  // ------------------------------------------------------------
  // -- Controller Script ---------------------------------------
  // ------------------------------------------------------------
  const controller = () => {
    setDefaults();

    if (!hashData.customized) {
      // if not customized yet
      const customizeDiv = document.getElementById('customize');
      createInterface(customizeDiv);
      handleSliders();
      handleDone(customizeDiv, finish);
    } else {
      // if already customized
      finish();
    }
  };

  // run controller
  controller();
};

export default customizeGalaxy;
