const photoshop = require('photoshop');

/**
 * Get all layers recursively (including folders)
 */
function getLayersRecursive(layerList, result = []) {
  if (!layerList || !Array.isArray(layerList)) {
    return result;
  }
  
  for (const layer of layerList) {
    result.push(layer);
    
    if (layer.type === "layerSection" && layer.layers && layer.layers.length > 0) {
      getLayersRecursive(layer.layers, result);
    }
  }
  
  return result;
}

/**
 * Get all normal (non-folder) layers recursively
 */
function getNormalLayers(layerList, result = []) {
  if (!layerList || !Array.isArray(layerList)) {
    return result;
  }
  
  for (const layer of layerList) {
    if (layer.type === "layerSection") {
      if (layer.layers && layer.layers.length > 0) {
        getNormalLayers(layer.layers, result);
      }
    } else {
      result.push(layer);
    }
  }
  
  return result;
}

/**
 * Check if a layer is a normal raster layer
 */
function isNormalLayer(layer) {
  return (
    layer.type !== "layerSection" && 
    layer.kind === "pixel" &&
    !layer.isBackgroundLayer
  );
}

module.exports = {
  getLayersRecursive,
  getNormalLayers,
  isNormalLayer
};