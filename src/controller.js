import bitApiInterface from './components/bit-api-interface';
import customizeGalaxy from './components/customize-galaxy';
import generateGalaxy  from './components/generate-galaxy';

// ------------------------------------------------------------
// -- Start the customizer when the API has been initialized --
// ------------------------------------------------------------
window.addEventListener('on-api-ready', () => customizeGalaxy());

// ------------------------------------------------------------
// -- Start the visualizer when customization is complete -----
// ------------------------------------------------------------
window.addEventListener('on-customize-ready', () => generateGalaxy());

// ------------------------------------------------------------
// -- Set up refresh on use of back and forward buttons -------
// ------------------------------------------------------------
window.onhashchange = () => window.location.reload();

// ------------------------------------------------------------
// -- Start the API connection --------------------------------
// ------------------------------------------------------------
bitApiInterface();
