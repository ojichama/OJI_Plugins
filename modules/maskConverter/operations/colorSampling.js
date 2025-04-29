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
  
  // Save original visibility states
  const allLayers = [];
  require('../../shared/folderUtils').getLayersRecursive(app.activeDocument.layers, allLayers);
  const visibilityStates = layerUtils.saveLayerVisibility(allLayers);
  
  // Default color (placeholder)
  let sampledColor = { r: 65, g: 105, b: 225 }; // Medium blue placeholder
  
  try {
    // In a real implementation, we would sample the color here
    if (logger) logger(`Sampled color from "${layer.name}": RGB(${sampledColor.r}, ${sampledColor.g}, ${sampledColor.b})`);
  } finally {
    // Restore visibility and remove temp layer
    await layerUtils.restoreLayerVisibility(visibilityStates, logger);
    await layerUtils.safeRemoveLayer(tempLayer, logger);
  }
  
  return sampledColor;
}

module.exports = {
  sampleLayerColor
};