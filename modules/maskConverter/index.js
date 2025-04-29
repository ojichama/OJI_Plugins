/**
 * maskConverter/index.js - Main entry point for mask conversion
 */
const photoshop = require('photoshop');
const app = photoshop.app;

// Import the processing modules
const preProcessing = require('./processing/preProcessing');
const mainProcessing = require('./processing/mainProcessing');
const postProcessing = require('./processing/postProcessing');

// Flag to control cancellation
let cancelFlag = false;

/**
 * Convert masked raster layers to solid fill layers
 * @param {Function} logger - Logging callback
 * @param {Function} progress - Progress update callback
 * @param {Function} complete - Completion callback (success, error)
 */
async function convertLayersToSolid(logger, progress, complete) {
  const photoshop = require('photoshop');
  const app = photoshop.app;
  
  if (!app.documents.length) {
    if (logger) logger("No document is open");
    if (complete) complete(false, "No document is open");
    return;
  }
  
  // Reset cancellation flag
  cancelFlag = false;
  
  try {
    // Step 1: Pre-processing
    if (logger) logger("Step 1: Starting pre-processing...");
    await preProcessing.execute(logger, progress, cancelFlag);
    if (progress) progress(1);
    if (cancelFlag) {
      if (complete) complete(false, "Cancelled by user");
      return;
    }
    
    // Step 2: Main processing
    if (logger) logger("Step 2: Starting main conversion process...");
    await mainProcessing.execute(logger, progress, cancelFlag);
    if (progress) progress(1);
    if (cancelFlag) {
      if (complete) complete(false, "Cancelled by user");
      return;
    }
    
    // Step 3: Post-processing
    if (logger) logger("Step 3: Starting post-processing...");
    await postProcessing.execute(logger, progress, cancelFlag);
    if (progress) progress(1);
    
    if (logger) logger("All processing completed successfully");
    if (complete) complete(true);
  } catch (error) {
    if (logger) logger(`Error: ${error.message}`);
    try {
      await preProcessing.cleanup(logger);
    } catch (e) {
      if (logger) logger(`Error during cleanup: ${e.message}`);
    }
    if (complete) complete(false, error.message);
  }
}

/**
 * Cancel the conversion process
 */
function cancelConversion() {
  cancelFlag = true;
  console.log("Conversion process cancellation requested");
}

module.exports = {
  convertLayersToSolid,
  cancelConversion
};