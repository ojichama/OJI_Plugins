const photoshop = require('photoshop');
const app = photoshop.app;
const { executeAsModal } = photoshop.core;
const { batchPlay } = photoshop.action;

/**
 * Convert character ID to type ID
 */
function cTID(s) {
  return app.charIDToTypeID(s);
}

/**
 * Convert string ID to type ID
 */
function sTID(s) {
  return app.stringIDToTypeID(s);
}

/**
 * Execute a batch play command with proper error handling
 */
async function executeBatchPlay(commands, commandName, logger) {
  try {
    return await executeAsModal(async () => {
      return await batchPlay(commands, {
        synchronousExecution: true,
        modalBehavior: "fail"
      });
    }, { commandName: commandName || "BatchPlay Command" });
  } catch (e) {
    if (logger) logger(`Error executing batch command: ${e.message}`);
    throw e;
  }
}

module.exports = {
  cTID,
  sTID,
  executeBatchPlay
};