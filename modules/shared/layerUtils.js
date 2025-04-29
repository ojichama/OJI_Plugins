const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;

/**
 * Safely remove a layer
 */
async function safeRemoveLayer(layer, logger) {
  await executeAsModal(async () => {
    try {
      app.activeDocument.activeLayers = [layer];
      
      await batchPlay(
        [
          {
            _obj: "delete",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
              }
            ],
            _options: {
              dialogOptions: "dontDisplay"
            }
          }
        ],
        { synchronousExecution: true }
      );
      
      if (logger) logger(`Removed layer "${layer.name}"`);
    } catch (e) {
      if (logger) logger(`Error removing layer: ${e.message}`);
    }
  }, { commandName: "Remove Layer" });
}

/**
 * Create a clipping mask for a layer
 */
async function createClippingMaskForLayer(layer, logger) {
  await executeAsModal(async () => {
    try {
      app.activeDocument.activeLayers = [layer];
      
      await batchPlay(
        [
          {
            _obj: "groupEvent",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
              }
            ],
            _options: {
              dialogOptions: "dontDisplay"
            }
          }
        ],
        { synchronousExecution: true }
      );
      
      if (logger) logger(`Created clipping mask for layer "${layer.name}"`);
    } catch (e) {
      if (logger) logger(`Error creating clipping mask: ${e.message}`);
    }
  }, { commandName: "Create Clipping Mask" });
}

/**
 * Duplicate a layer
 */
async function duplicateLayer(layer, newName) {
  let duplicatedLayer = null;
  
  await executeAsModal(async () => {
    try {
      app.activeDocument.activeLayers = [layer];
      
      await batchPlay(
        [
          {
            _obj: "duplicate",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
              }
            ],
            _options: {
              dialogOptions: "dontDisplay"
            }
          }
        ],
        { synchronousExecution: true }
      );
      
      duplicatedLayer = app.activeDocument.activeLayers[0];
      
      if (newName) {
        duplicatedLayer.name = newName;
      }
    } catch (e) {
      console.error(`Error duplicating layer: ${e.message}`);
    }
  }, { commandName: "Duplicate Layer" });
  
  return duplicatedLayer;
}

/**
 * Save layer visibility states
 * @param {Array} layers - Array of layers
 * @returns {Array} - Array of visibility states
 */
function saveLayerVisibility(layers) {
  const states = [];
  
  for (let i = 0; i < layers.length; i++) {
    states.push({
      layer: layers[i],
      visible: layers[i].visible
    });
  }
  
  return states;
}

/**
 * Restore layer visibility states
 * @param {Array} states - Array of visibility states
 * @param {Function} logger - Logging callback
 */
async function restoreLayerVisibility(states, logger) {
  for (let i = 0; i < states.length; i++) {
    try {
      states[i].layer.visible = states[i].visible;
    } catch (e) {
      if (logger) logger(`Error restoring visibility: ${e.message}`);
      else console.error(`Error restoring visibility: ${e.message}`);
    }
  }
}

module.exports = {
  safeRemoveLayer,
  createClippingMaskForLayer,
  duplicateLayer,
  saveLayerVisibility,
  restoreLayerVisibility
};