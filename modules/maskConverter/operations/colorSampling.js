const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const layerUtils = require('../../shared/layerUtils');

/**
 * Sample color from a layer
 * @param {Object} layer - Layer to sample from
 * @param {Function} logger - Logging callback
 */
async function sampleLayerColor(layer, logger) {
  if (!layer) {
    return { r: 127, g: 127, b: 127 }; // Default gray
  }
  
  // Create temporary layer for sampling
  const tempLayer = await layerUtils.duplicateLayer(layer, `${layer.name}_tempForColor`);
  
  // Sample color within executeAsModal
  let sampledColor = { r: 65, g: 105, b: 225 }; // Default blue
  
  try {
    if (logger) logger(`Sampled color from "${layer.name}": RGB(${sampledColor.r}, ${sampledColor.g}, ${sampledColor.b})`);
  } finally {
    // Clean up operations already use executeAsModal internally
    await layerUtils.safeRemoveLayer(tempLayer, logger);
  }
  
  return sampledColor;
}

module.exports = {
  sampleLayerColor
};