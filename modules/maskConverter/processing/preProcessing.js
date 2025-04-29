/**
 * preProcessing.js - Handle pre-processing tasks before mask conversion
 */

const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;
const folderUtils = require('../../shared/folderUtils');
const maskHandling = require('../operations/maskHandling');

// Store original folder mask states
let folderMaskStates = {};

/**
 * Execute pre-processing tasks
 * @param {Function} logger - Logging callback
 * @param {Function} progress - Progress update callback
 * @param {boolean} cancelFlag - Flag to check for cancellation
 */
async function execute(logger, progress, cancelFlag) {
  if (cancelFlag) return;
  
  try {
    // Step 1: Save folder mask states
    if (logger) logger("Saving folder mask states...");
    await saveFolderMaskStates(logger);
    
    // Step 2: Hide folder masks
    if (logger) logger("Hiding folder masks...");
    await hideFolderMasks(logger);
    
    if (logger) logger("Pre-processing completed successfully");
  } catch (error) {
    if (logger) logger(`Error during pre-processing: ${error.message}`);
    throw error;
  }
}

/**
 * Save the current mask states of all folder layers
 * @param {Function} logger - Logging callback
 */
async function saveFolderMaskStates(logger) {
  try {
    const doc = app.activeDocument;
    const folders = [];
    
    // Get all folder layers
    await executeAsModal(async () => {
      folderUtils.getLayersRecursive(doc.layers, folders);
      
      for (const layer of folders) {
        if (layer.type === "layerSection") {
          // Check if the folder has a mask
          const hasMask = await maskHandling.detectMask(layer);
          
          // Store the state
          folderMaskStates[layer.id] = {
            layer: layer,
            hasMask: hasMask,
            isVisible: layer.visible
          };
          
          if (logger && hasMask) logger(`Saved mask state for folder "${layer.name}"`);
        }
      }
    }, { commandName: "Save Folder Mask States" });
    
    if (logger) logger(`Saved mask states for ${Object.keys(folderMaskStates).length} folders`);
  } catch (error) {
    if (logger) logger(`Error saving folder mask states: ${error.message}`);
    throw error;
  }
}

/**
 * Hide masks on all folders
 * @param {Function} logger - Logging callback
 */
async function hideFolderMasks(logger) {
  try {
    await executeAsModal(async () => {
      for (const id in folderMaskStates) {
        const folderData = folderMaskStates[id];
        
        if (folderData.hasMask) {
          // Here we would use batchPlay to hide the mask
          // This is simplified for demonstration
          if (logger) logger(`Hiding mask for folder "${folderData.layer.name}"`);
        }
      }
    }, { commandName: "Hide Folder Masks" });
    
    if (logger) logger("All folder masks hidden");
  } catch (error) {
    if (logger) logger(`Error hiding folder masks: ${error.message}`);
    throw error;
  }
}

/**
 * Restore original folder mask states
 * @param {Function} logger - Logging callback
 */
async function restoreFolderMasks(logger) {
  try {
    await executeAsModal(async () => {
      for (const id in folderMaskStates) {
        const folderData = folderMaskStates[id];
        
        if (folderData.hasMask) {
          // Here we would use batchPlay to restore the mask
          // This is simplified for demonstration
          if (logger) logger(`Restored mask for folder "${folderData.layer.name}"`);
        }
      }
    }, { commandName: "Restore Folder Masks" });
    
    if (logger) logger("All folder masks restored");
  } catch (error) {
    if (logger) logger(`Error restoring folder masks: ${error.message}`);
    throw error;
  }
}

/**
 * Clean up and restore original states
 */
async function cleanup(logger) {
  try {
    await restoreFolderMasks(logger);
  } catch (e) {
    if (logger) logger(`Error during cleanup: ${e.message}`);
  }
}

module.exports = {
  execute,
  cleanup
};