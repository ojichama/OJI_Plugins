/**
 * batchExporter.js - UXP版
 * フォルダーグループごとに画像を一括出力するモジュール
 */

const photoshop = require("photoshop");
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;
const uxp = require("uxp");
const fs = uxp.storage.localFileSystem;

// モジュール内部の状態
let cancelFlag = false;
let exportOptions = {
  format: 'PNG',
  quality: 100,
  includeICCProfile: true,
  directory: null
};

/**
 * すべてのフォルダを再帰的に取得
 * @param {Array} layerList - レイヤーリスト
 * @returns {Promise<Array>} - フォルダーレイヤーの配列
 */
async function getAllFolders(layerList) {
  const folders = [];
  
  for (let i = 0; i < layerList.length; i++) {
    const layer = layerList[i];
    if (layer.type === "layerSection") {
      folders.push(layer);
      // 子フォルダも取得
      if (layer.layers && layer.layers.length > 0) {
        const subFolders = await getAllFolders(layer.layers);
        folders.push(...subFolders);
      }
    }
  }
  
  return folders;
}

/**
 * ログ出力関数
 * @param {string} msg - ログメッセージ
 * @param {Function} logCallback - ログコールバック関数
 */
function logMessage(msg, logCallback) {
  if (logCallback) {
    logCallback(msg);
  }
}

/**
 * 進捗状態の更新
 * @param {number} increment - 進捗の増分
 * @param {Function} progressCallback - 進捗コールバック関数
 */
function updateProgress(increment, progressCallback) {
  if (progressCallback) {
    progressCallback(increment);
  }
}

/**
 * 保存先ディレクトリを選択
 * @returns {Promise<string|null>} - 選択されたディレクトリのパス、またはキャンセルの場合はnull
 */
async function selectExportDirectory() {
  try {
    const folder = await fs.getFolder();
    return folder.nativePath;
  } catch (e) {
    console.error(`Error selecting directory: ${e}`);
    return null;
  }
}

/**
 * レイヤーの表示状態を保存
 * @param {Array} layers - レイヤー配列
 * @returns {Array} - 表示状態の配列
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
 * レイヤーの表示状態を復元
 * @param {Array} states - 表示状態の配列
 */
async function restoreLayerVisibility(states) {
  for (let i = 0; i < states.length; i++) {
    try {
      states[i].layer.visible = states[i].visible;
    } catch (e) {
      console.error(`Error restoring visibility: ${e}`);
    }
  }
}

/**
 * すべてのレイヤーを再帰的に取得
 * @param {Array} layerList - レイヤーリスト
 * @param {Array} result - 結果を格納する配列
 */
function getLayersRecursive(layerList, result = []) {
  for (let i = 0; i < layerList.length; i++) {
    const layer = layerList[i];
    result.push(layer);
    
    if (layer.type === "layerSection" && layer.layers && layer.layers.length > 0) {
      getLayersRecursive(layer.layers, result);
    }
  }
  
  return result;
}

/**
 * フォルダーレイヤーを選んで書き出し
 * @param {Object} folder - フォルダーレイヤー
 * @param {string} outputDir - 出力ディレクトリのパス
 * @param {Function} logger - ログコールバック関数
 */
async function exportFolderAsImage(folder, outputDir, logger) {
  const doc = app.activeDocument;
  
  // 全レイヤーの表示状態を保存
  const allLayers = [];
  getLayersRecursive(doc.layers, allLayers);
  const visibilityStates = saveLayerVisibility(allLayers);
  
  try {
    // 全レイヤーを非表示
    for (let i = 0; i < allLayers.length; i++) {
      allLayers[i].visible = false;
    }
    
    // 対象フォルダーのみ表示
    folder.visible = true;
    
    // ファイル名を設定（日本語や特殊文字に対応するため置換処理）
    let fileName = folder.name.replace(/[\\/:*?"<>|]/g, "_");
    
    // 書き出し処理
    await executeAsModal(async () => {
      try {
        const exportFolder = await fs.getFolder(outputDir);
        const file = await exportFolder.createFile(`${fileName}.${exportOptions.format.toLowerCase()}`);
        
        // ドキュメントをエクスポート
        await batchPlay(
          [
            {
              _obj: "exportSelectionAsFileTypePressed",
              _target: {
                _ref: "document",
                _enum: "ordinal",
                _value: "targetEnum"
              },
              fileType: exportOptions.format,
              quality: exportOptions.quality,
              metadata: exportOptions.includeICCProfile,
              destFolder: outputDir,
              destFileName: fileName,
              _options: {
                dialogOptions: "dontDisplay"
              }
            }
          ],
          {
            synchronousExecution: true,
            modalBehavior: "fail"
          }
        );
        
        logMessage(`Successfully exported: ${fileName}.${exportOptions.format.toLowerCase()}`, logger);
      } catch (e) {
        logMessage(`Error exporting ${folder.name}: ${e}`, logger);
      }
    }, { commandName: "Export Folder" });
  } catch (e) {
    logMessage(`Error during export process: ${e}`, logger);
  } finally {
    // 表示状態を元に戻す
    await restoreLayerVisibility(visibilityStates);
  }
}

/**
 * フォルダグループごとに画像を一括出力する
 * @param {Function} logger - ログ出力コールバック
 * @param {Function} progress - 進捗状況コールバック
 * @param {Function} complete - 完了コールバック
 * @param {Object} options - 出力オプション
 */
async function exportByFolders(logger, progress, complete, options) {
  // ドキュメントチェック
  if (!app.documents.length) {
    logMessage("No document open.", logger);
    if (complete) complete(false, "No document open.");
    return;
  }
  
  // オプションのマージ
  if (options) {
    exportOptions = {...exportOptions, ...options};
  }
  
  // キャンセルフラグリセット
  cancelFlag = false;
  
  try {
    // 出力先ディレクトリ選択
    const outputDir = exportOptions.directory || await selectExportDirectory();
    if (!outputDir) {
      logMessage("Export cancelled: No output directory selected.", logger);
      if (complete) complete(false, "No output directory selected.");
      return;
    }
    
    // フォルダー一覧取得
    const doc = app.activeDocument;
    logMessage("Getting folder list...", logger);
    const folders = await getAllFolders(doc.layers);
    
    if (folders.length === 0) {
      logMessage("No folder layers found in document.", logger);
      if (complete) complete(false, "No folder layers found.");
      return;
    }
    
    logMessage(`Found ${folders.length} folders to export.`, logger);
    
    // 各フォルダーごとに書き出し
    for (let i = 0; i < folders.length; i++) {
      if (cancelFlag) {
        logMessage("Export cancelled by user.", logger);
        if (complete) complete(false, "Cancelled by user.");
        return;
      }
      
      const folder = folders[i];
      logMessage(`Processing folder ${i+1}/${folders.length}: ${folder.name}`, logger);
      
      await exportFolderAsImage(folder, outputDir, logger);
      
      // 進捗更新
      updateProgress(1, progress);
    }
    
    logMessage("Export completed successfully.", logger);
    if (complete) complete(true);
  } catch (error) {
    logMessage(`Error in export process: ${error}`, logger);
    if (complete) complete(false, error);
  }
}

/**
 * 処理のキャンセル
 */
function cancelExport() {
  cancelFlag = true;
  console.log("Export process cancellation requested.");
}

// 公開API
module.exports = {
  exportByFolders,
  cancelExport
};
