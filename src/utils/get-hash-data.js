// ------------------------------------------------------------
// -- Parse data from URL hash --------------------------------
// ------------------------------------------------------------
const getHashData = (hash) => {
  const hashDataArray = hash.slice(1).split('&');
  const hashData = {};
  for (let i = 0; i < hashDataArray.length; i++) {
    if (hashDataArray[i]) {
      const pair = hashDataArray[i].split('=');
      hashData[pair[0]] = pair[1];
    }
  }
  return hashData;
};

export default getHashData;
