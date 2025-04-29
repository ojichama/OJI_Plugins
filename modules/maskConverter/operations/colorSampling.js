const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const layerUtils = require('../../shared/layerUtils');

/**
 * Sample color from a layer
 * @param {Object} layer - Layer to sample from
 * @param {Function} logger - Logging callback
 */
// modules/maskConverter/operations/colorSampling.js の sampleLayerColor 関数を修正
async function sampleLayerColor(layer, logger) {
  if (!layer) {
    return { r: 127, g: 127, b: 127 }; // デフォルトグレー
  }
  
  let sampledColor = { r: 65, g: 105, b: 225 }; // 初期値
  
  try {
    await executeAsModal(async () => {
      // レイヤーをアクティブにする
      app.activeDocument.activeLayers = [layer];
      
      // サンプルサイズを設定（小さい範囲でサンプリング）[[3](https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q10154409475)]
      const result = await batchPlay([
        {
          _obj: "get",
          _target: [
            {
              _property: "color",
              _ref: "layer",
              _enum: "ordinal",
              _value: "targetEnum"
            }
          ],
          _options: { dialogOptions: "dontDisplay" }
        }
      ], { synchronousExecution: true });
      
      if (result && result[0] && result[0].color) {
        const color = result[0].color;
        if (color._obj === "RGBColor") {
          sampledColor = {
            r: Math.round(color.red || 0),
            g: Math.round(color.grain || 0),
            b: Math.round(color.blue || 0)
          };
        }
      }
    }, { commandName: "Sample Layer Color" });
    
    if (logger) logger(`Sampled color from "${layer.name}": RGB(${sampledColor.r}, ${sampledColor.g}, ${sampledColor.b})`);
  } catch (e) {
    if (logger) logger(`Error sampling color: ${e.message}`);
  }
  
  return sampledColor;
}
module.exports = {
  sampleLayerColor
};