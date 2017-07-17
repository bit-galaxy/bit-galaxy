import setTitle from './set-title';

// ------------------------------------------------------------
// -- Set URL hash based on parsed data -----------------------
// ------------------------------------------------------------
const setHashData = (hashData) => {
  window.onhashchange = null;
  setTitle(hashData);
  const keys = Object.keys(hashData);
  let hash = '#';
  if (keys.length > 0) {
    hash += `${keys[0]}=${hashData[keys[0]]}`;
  }
  for (let i = 1; i < keys.length; i++) {
    hash += `&${keys[i]}=${hashData[keys[i]]}`;
  }
  window.location.hash = hash;
  setTimeout(() => { window.onhashchange = () => { window.location.reload(); }; }, 0);
};

export default setHashData;
