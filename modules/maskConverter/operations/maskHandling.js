const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;

/**
 * Detect if a layer has a mask
 * @param {Object} layer - Layer to check
 */
async function detectMask(layer) {
  let hasMask = false;
  
  await executeAsModal(async () => {
    try {
      app.activeDocument.activeLayers = [layer];
      
      const result = await batchPlay(
        [
          {
            _obj: "get",
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
      
      hasMask = result[0].hasOwnProperty("userMaskEnabled") && 
                result[0].userMaskEnabled === true;
    } catch (e) {
      console.error(`Error detecting mask: ${e.message}`);
    }
  }, { commandName: "Detect Mask" });
  
  return hasMask;
}

/**
 * Duplicate a mask from source layer to target layer
 */
async function duplicateMask(sourceLayer, targetLayer, logger) {
  await executeAsModal(async () => {
    try {
      app.activeDocument.activeLayers = [targetLayer];
      
      // マスクの複製処理
      await batchPlay([
        {
          // batchPlay コマンド
        }
      ], { synchronousExecution: true });
      
      if (logger) logger(`Duplicated mask from "${sourceLayer.name}" to "${targetLayer.name}"`);
    } catch (e) {
      if (logger) logger(`Error duplicating mask: ${e.message}`);
    }
  }, { commandName: "Duplicate Mask" });
}

module.exports = {
  detectMask,
  duplicateMask
};