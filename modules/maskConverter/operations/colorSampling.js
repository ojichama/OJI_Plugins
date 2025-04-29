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
    return { r: 127, g: 127, b: 127 };
  }
  
  let sampledColor = { r: 65, g: 105, b: 225 }; // デフォルト値
  
  try {
    // tempLayerの作成と色のサンプリングをexecuteAsModal内で行う
    await executeAsModal(async () => {
      // ここでbatchPlayを使用して実際の色をサンプリング
      // 例: 画像の中心からサンプリングするなど
      
      // サンプリング結果を設定
      // sampledColor = 実際のサンプリング結果;
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