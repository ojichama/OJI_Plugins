const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;

/**
 * Move a layer below a reference layer
 * @param {Object} layerToMove - Layer to be moved
 * @param {Object} referenceLayer - Target reference layer
 * @param {Function} logger - Logging callback
 */
async function moveLayerBelow(layerToMove, referenceLayer, logger) {
  if (!layerToMove || !referenceLayer) {
    if (logger) logger("Invalid layers for movement operation");
    return;
  }

  await executeAsModal(async () => {
    try {
      // Make the layer to move active
      app.activeDocument.activeLayers = [layerToMove];
      
      // Perform the move operation
      await batchPlay(
        [
          {
            _obj: "move",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
              }
            ],
            to: {
              _ref: "layer",
              _id: referenceLayer.id,
              _enum: "elementTarget",
              _value: "below"
            },
            _isCommand: true,
            _options: {
              dialogOptions: "dontDisplay"
            }
          }
        ],
        { synchronousExecution: true }
      );
      
      if (logger) logger(`Layer "${layerToMove.name}" moved below "${referenceLayer.name}"`);
    } catch (e) {
      if (logger) logger(`Error: Failed to move layer: ${e.message}`);
    }
  }, { commandName: "Move Layer Below" });
}

module.exports = {
  moveLayerBelow
};