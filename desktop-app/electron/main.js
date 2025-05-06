const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const keytar = require('keytar');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { setupApiClient } = require('./utils/api');
const { setupAuthHandlers } = require('./utils/auth');
const { setupSyncHandlers, initScheduledSync } = require('./utils/sync');
const { setupImazingIntegration } = require('./utils/imazing');

// Configuration
const isDev = process.argv.includes('--dev');
const SERVICE_NAME = 'ImazingSyncDesktop';
const ACCOUNT_NAME = 'ApiCredentials';

// App instance ID - used to identify this installation
let appId;
let store;
let tray = null;
let mainWindow = null;
let apiClient = null;
let isFirstRun = false;

// Initialize the app
async function initialize() {
  // Create store for settings
  store = new Store({
    name: 'settings',
    defaults: {
      autoSync: true,
      syncFrequency: 'daily',
      syncOnConnect: true,
      syncNotifications: true,
      lastSyncTime: null
    }
  });

  // Get or generate app ID
  appId = store.get('appId');
  if (!appId) {
    appId = uuidv4();
    store.set('appId', appId);
    isFirstRun = true;
  }

  // Initialize API client
  const token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  apiClient = setupApiClient(token);

  // Set up handlers
  setupAuthHandlers(ipcMain, store, keytar, SERVICE_NAME, ACCOUNT_NAME, apiClient, appId);
  setupSyncHandlers(ipcMain, store, apiClient);
  setupImazingIntegration(ipcMain);

  // Initialize scheduled sync if configured
  if (store.get('autoSync')) {
    initScheduledSync(store.get('syncFrequency'), apiClient, store);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets/app-icon.png')
  });

  // In production, load the bundled HTML file
  // In dev, load from local server
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Check if it's first run to show setup wizard
  if (isFirstRun) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('show-setup-wizard');
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open',
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.focus();
        }
      }
    },
    { 
      label: 'Sync Now',
      click: async () => {
        // Trigger manual sync
        const result = await apiClient.triggerSync();
        if (result.success) {
          sendNotification('Sync Started', 'Manual sync has been initiated.');
        } else {
          sendNotification('Sync Failed', result.error || 'Failed to start sync.');
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('iMazing Sync');
  tray.setContextMenu(contextMenu);
}

function sendNotification(title, body) {
  if (store.get('syncNotifications')) {
    const notification = {
      title,
      body
    };

    // Send to renderer if window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-notification', notification);
    } else {
      // Use native notification
      const notificationObj = new Notification(notification);
      notificationObj.show();
    }
  }
}

// App lifecycle
app.whenReady().then(async () => {
  await initialize();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep the app running in the background on macOS
  } else {
    app.quit();
  }
});

// Handle WiFi connectivity changes (macOS/Linux only)
if (process.platform !== 'win32') {
  const { networkInterfaces } = require('os');
  
  // Check WiFi connection periodically
  setInterval(() => {
    const interfaces = networkInterfaces();
    const isWifiConnected = Object.keys(interfaces).some(ifName => 
      ifName.toLowerCase().includes('wi-fi') && 
      interfaces[ifName].some(iface => !iface.internal && iface.family === 'IPv4')
    );
    
    if (isWifiConnected && store.get('syncOnConnect')) {
      // Trigger sync when WiFi connects
      const lastSyncCheck = store.get('lastWiFiCheck');
      const now = Date.now();
      
      // Only trigger if we haven't checked in the last 5 minutes
      if (!lastSyncCheck || now - lastSyncCheck > 5 * 60 * 1000) {
        apiClient.triggerSync();
        store.set('lastWiFiCheck', now);
      }
    }
  }, 60 * 1000); // Check every minute
}
