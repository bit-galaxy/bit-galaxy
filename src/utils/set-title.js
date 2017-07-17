import { properties } from './default-options';

// ------------------------------------------------------------
// -- Set the page title based on the current location --------
// ------------------------------------------------------------
const setTitle = (hashData) => {
  const title = document.getElementsByTagName('title')[0];

  if (hashData.customized  && hashData.name) {
    title.innerText = `Bit Galaxy | ${hashData.name}'s custom galaxy`;
  } else if (!hashData.customized && hashData[properties[0]]) {
    let newTitle = 'Bit Galaxy |';
    for (let i = 0; i < properties.length; i++) {
      const splitProp = properties[i].split('_');
      newTitle += ` ${splitProp[splitProp.length - 1]}=${hashData[properties[i]]}`;
    }
    title.innerText = newTitle;
  } else if (!hashData.customized) {
    title.innerText = 'Bit Galaxy | authorizing...';
  } else {
    title.innerText = 'Bit Galaxy';
  }
};

export default setTitle;
