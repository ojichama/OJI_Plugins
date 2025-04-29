const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const folderUtils = require('../../shared/folderUtils');
const layerUtils = require('../../shared/layerUtils');
const mainProcessing = require('./mainProcessing');

/**
 * Execute post-processing tasks
 * @param {Function} logger - Logging callback
 * @param {Function} progress - Progress update callback
 * @param {boolean} cancelFlag - Flag to check for cancellation
 */
async function execute(logger, progress, cancelFlag) {
  if (cancelFlag) return;
  
  try {
    // Step 1: Delete original layers
    if (logger) logger("Deleting original layers...");
    for (const layer of mainProcessing.layersToDelete) {
      await layerUtils.safeRemoveLayer(layer, logger);
    }
    
    // Step 2: Apply clipping masks
    if (logger) logger("Applying clipping masks...");
    for (const layer of mainProcessing.fillLayersToClip) {
      await layerUtils.createClippingMaskForLayer(layer, logger);
    }
    
    // Step 3: Rename layers (remove "_fill" suffix)
    if (logger) logger("Renaming layers (removing '_fill' suffix)...");
    const allLayers = [];
    folderUtils.getLayersRecursive(app.activeDocument.layers, allLayers);
    
    await executeAsModal(async () => {
      for (const layer of allLayers) {
        if (layer.name.endsWith("_fill")) {
          layer.name = layer.name.slice(0, -5);
        }
      }
    }, { commandName: "Rename Layers" });
    
    if (logger) logger("Post-processing completed");
  } catch (error) {
    if (logger) logger(`Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  execute
};