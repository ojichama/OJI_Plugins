/**
 * OJI Plugins - main.js
 * Photoshop UXP plugin with multiple functionalities
 */

// Require UXP modules
const photoshop = require("photoshop");
const app = photoshop.app;
const { executeAsModal } = photoshop.core;

// Import the mask converter module
// Fixed path to match your actual file structure
const maskConverter = require("./modules/maskConverter/index");

// Import the batch exporter module
// Fixed path to match your actual file structure
const batchExporter = require("./modules/batchExporter");

// DOM elements
let maskConverterStatus;
let maskConverterProgress;
let maskConverterLog;
let exporterStatus;
let exporterProgress;
let exporterLog;

// Show handler for when panel becomes visible
function panelShowHandler() {
    console.log("Panel shown");
    // You could refresh UI state here if needed
}

// Initialize the UI when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing UI elements...");
    
    // Get UI element references
    maskConverterStatus = document.getElementById("maskConverterStatus");
    maskConverterProgress = document.getElementById("maskConverterProgress");
    maskConverterLog = document.getElementById("maskConverterLog");
    exporterStatus = document.getElementById("exporterStatus");
    exporterProgress = document.getElementById("exporterProgress");
    exporterLog = document.getElementById("exporterLog");
    
    // Set up event listeners for the mask converter
    const btnConvert = document.getElementById("btnConvertLayers");
    btnConvert.addEventListener("click", () => {
        startMaskConversion();
    });
    console.log("Convert layers button initialized");
    
    const btnCancelConversion = document.getElementById("btnCancelConversion");
    btnCancelConversion.addEventListener("click", () => {
        maskConverter.cancelConversion();
        updateMaskConverterStatus("キャンセルしました", 0);
    });
    console.log("Cancel conversion button initialized");
    
    // Set up event listeners for the batch exporter
    const btnExport = document.getElementById("btnExportByFolder");
    btnExport.addEventListener("click", () => {
        startExport();
    });
    console.log("Export button initialized");
    
    const btnCancelExport = document.getElementById("btnCancelExport");
    btnCancelExport.addEventListener("click", () => {
        batchExporter.cancelExport();
        updateExporterStatus("キャンセルしました", 0);
    });
    console.log("Cancel export button initialized");
    
    console.log("UXP Plugin initialized successfully");
});

// Add show handler
if (window.showPanelCallback) {
    window.showPanelCallback(panelShowHandler);
}

// Start mask conversion
function startMaskConversion() {
    console.log("Starting mask conversion...");
    
    // Reset UI
    maskConverterLog.innerHTML = "";
    maskConverterProgress.value = 0;
    updateMaskConverterStatus("処理中...", -1);
    
    // Logger callback
    const logger = (message) => {
        console.log(message);
        const logItem = document.createElement("div");
        logItem.textContent = message;
        maskConverterLog.appendChild(logItem);
        maskConverterLog.scrollTop = maskConverterLog.scrollHeight;
    };
    
    // Progress callback
    const progress = (increment) => {
        maskConverterProgress.value += increment;
    };
    
    // Completion callback
    const complete = (success, errorMessage) => {
        if (success) {
            updateMaskConverterStatus("変換完了", 0);
        } else {
            updateMaskConverterStatus(`エラー: ${errorMessage}`, 0);
            console.error(`Error: ${errorMessage}`);
        }
    };
    
    // Start the conversion
    maskConverter.convertLayersToSolid(logger, progress, complete);
}

// Start export
function startExport() {
    console.log("Starting export by folders...");
    
    // Reset UI
    exporterLog.innerHTML = "";
    exporterProgress.value = 0;
    updateExporterStatus("処理中...", -1);
    
    // Logger callback
    const logger = (message) => {
        console.log(message);
        const logItem = document.createElement("div");
        logItem.textContent = message;
        exporterLog.appendChild(logItem);
        exporterLog.scrollTop = exporterLog.scrollHeight;
    };
    
    // Progress callback
    const progress = (increment) => {
        exporterProgress.value += increment;
    };
    
    // Completion callback
    const complete = (success, errorMessage) => {
        if (success) {
            updateExporterStatus("出力完了", 0);
        } else {
            updateExporterStatus(`エラー: ${errorMessage}`, 0);
            console.error(`Error: ${errorMessage}`);
        }
    };
    
    // Start the export
    batchExporter.exportByFolders(logger, progress, complete);
}

// Update mask converter status
function updateMaskConverterStatus(text, progressValue) {
    maskConverterStatus.textContent = text;
    if (progressValue >= 0) {
        maskConverterProgress.value = progressValue;
    }
}

// Update exporter status
function updateExporterStatus(text, progressValue) {
    exporterStatus.textContent = text;
    if (progressValue >= 0) {
        exporterProgress.value = progressValue;
    }
}