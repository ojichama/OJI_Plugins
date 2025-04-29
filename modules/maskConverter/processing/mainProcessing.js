const photoshop = require('photoshop');
const app = photoshop.app;
const folderUtils = require('../../shared/folderUtils');
const maskHandling = require('../operations/maskHandling');
const colorSampling = require('../operations/colorSampling');
const layerCreation = require('../operations/layerCreation');
const layerMovement = require('../operations/layerMovement');

// Processing state
let processedLayers = {};
let layersToDelete = [];
let fillLayersToClip = [];

/**
 * Execute main processing tasks
 * @param {Function} logger - Logging callback
 * @param {Function} progress - Progress update callback
 * @param {boolean} cancelFlag - Flag to check for cancellation
 */
async function execute(logger, progress, cancelFlag) {
  if (cancelFlag) return;
  
  // Reset processing state
  processedLayers = {};
  layersToDelete = [];
  fillLayersToClip = [];
  
  try {
    // Get all normal layers
    const normalLayers = folderUtils.getNormalLayers(app.activeDocument.layers);
    
    // Process each layer with mask
    for (const layer of normalLayers) {
      if (await maskHandling.detectMask(layer) && !processedLayers[layer.id]) {
        processedLayers[layer.id] = true;
        
        // Convert layer to fill
        const color = await colorSampling.sampleLayerColor(layer, logger);
        const fillLayer = await layerCreation.createSolidFillLayer(color.r, color.g, color.b, logger);
        
        if (fillLayer) {
          fillLayer.name = `${layer.name}_fill`;
          await layerMovement.moveLayerBelow(fillLayer, layer, logger);
          await maskHandling.duplicateMask(layer, fillLayer, logger);
          
          // Add to processing lists
          layersToDelete.push(layer);
          fillLayersToClip.push(fillLayer);
        }
      }
      
      if (progress) progress(1);
    }
    
    if (logger) logger("Main processing completed");
  } catch (error) {
    if (logger) logger(`Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  execute,
  layersToDelete,
  fillLayersToClip
};