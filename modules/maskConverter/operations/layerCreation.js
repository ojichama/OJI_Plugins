const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;
const layerUtils = require('../../shared/layerUtils');

/**
 * Create a solid fill layer with specified color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @param {Function} logger - Logging callback
 */
async function createSolidFillLayer(r, g, b, logger) {
  let newLayer = null;
  
  await executeAsModal(async () => {
    try {
      // Create solid fill layer
      const result = await batchPlay(
        [
          {
            _obj: "make",
            _target: [
              {
                _ref: "contentLayer"
              }
            ],
            using: {
              _obj: "contentLayer",
              type: {
                _obj: "solidColorLayer",
                color: {
                  _obj: "RGBColor",
                  red: r,
                  green: g,
                  blue: b
                }
              }
            },
            _isCommand: true,
            _options: {
              dialogOptions: "dontDisplay"
            }
          }
        ],
        { synchronousExecution: true }
      );
      
      newLayer = app.activeDocument.activeLayers[0];
      if (logger) logger(`Created solid fill layer (R=${r}, G=${g}, B=${b})`);
    } catch (e) {
      if (logger) logger(`Error: Failed to create solid fill layer: ${e.message}`);
    }
  }, { commandName: "Create Solid Fill Layer" });
  
  return newLayer;
}

module.exports = {
  createSolidFillLayer
};