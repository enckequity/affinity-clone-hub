
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Convert exec to promise-based
const execPromise = util.promisify(exec);

/**
 * Set up iMazing integration handlers
 * 
 * @param {Object} ipcMain - Electron IPC main instance
 */
function setupImazingIntegration(ipcMain) {
  // Check if iMazing is installed
  ipcMain.handle('imazing:check', async () => {
    try {
      const isInstalled = await checkImazingInstallation();
      const cliAvailable = await checkImazingCli();
      
      return {
        installed: isInstalled,
        cliAvailable: cliAvailable,
        path: isInstalled ? await getImazingPath() : null
      };
    } catch (error) {
      console.error('Error checking iMazing installation:', error);
      return {
        installed: false,
        cliAvailable: false,
        error: error.message
      };
    }
  });
  
  // Test iMazing connection with device
  ipcMain.handle('imazing:test', async () => {
    try {
      const devices = await getConnectedDevices();
      
      return {
        success: devices.length > 0,
        devices: devices
      };
    } catch (error) {
      console.error('Error testing iMazing connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });
}

/**
 * Check if iMazing is installed
 * 
 * @returns {Boolean} - True if installed
 */
async function checkImazingInstallation() {
  try {
    const platform = process.platform;
    let installPath;
    
    if (platform === 'darwin') {
      // macOS path
      installPath = '/Applications/iMazing.app';
      return fs.existsSync(installPath);
    } else if (platform === 'win32') {
      // Windows - check Program Files
      const programFiles = process.env['ProgramFiles'];
      const programFilesX86 = process.env['ProgramFiles(x86)'];
      
      return fs.existsSync(path.join(programFiles, 'iMazing')) || 
             fs.existsSync(path.join(programFilesX86, 'iMazing'));
    } else {
      // Linux or other OS - not supported by iMazing
      return false;
    }
  } catch (error) {
    console.error('Error checking iMazing installation:', error);
    return false;
  }
}

/**
 * Check if iMazing CLI is available
 * 
 * @returns {Boolean} - True if available
 */
async function checkImazingCli() {
  try {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // Check if iMazing CLI is available on macOS
      const cliPath = '/Applications/iMazing.app/Contents/MacOS/iMazing-CLI';
      return fs.existsSync(cliPath);
    } else if (platform === 'win32') {
      // Windows - check Program Files
      const programFiles = process.env['ProgramFiles'];
      const programFilesX86 = process.env['ProgramFiles(x86)'];
      
      return fs.existsSync(path.join(programFiles, 'iMazing', 'iMazing-CLI.exe')) || 
             fs.existsSync(path.join(programFilesX86, 'iMazing', 'iMazing-CLI.exe'));
    } else {
      // Linux or other OS
      return false;
    }
  } catch (error) {
    console.error('Error checking iMazing CLI:', error);
    return false;
  }
}

/**
 * Get iMazing installation path
 * 
 * @returns {String} - Path to iMazing installation
 */
async function getImazingPath() {
  try {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // macOS path
      return '/Applications/iMazing.app';
    } else if (platform === 'win32') {
      // Windows - check Program Files
      const programFiles = process.env['ProgramFiles'];
      const programFilesX86 = process.env['ProgramFiles(x86)'];
      
      const path1 = path.join(programFiles, 'iMazing');
      const path2 = path.join(programFilesX86, 'iMazing');
      
      if (fs.existsSync(path1)) {
        return path1;
      } else if (fs.existsSync(path2)) {
        return path2;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting iMazing path:', error);
    return null;
  }
}

/**
 * Get list of devices connected to iMazing
 * 
 * @returns {Array} - List of connected devices
 */
async function getConnectedDevices() {
  try {
    // In a real implementation, this would use the iMazing CLI to get device list
    // For demonstration, we'll just return a mock device
    
    return [
      { 
        id: 'mock-device-id',
        name: 'iPhone',
        model: 'iPhone 13',
        osVersion: 'iOS 15.5'
      }
    ];
  } catch (error) {
    console.error('Error getting connected devices:', error);
    throw error;
  }
}

module.exports = { setupImazingIntegration };
