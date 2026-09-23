const { contextBridge } = require('electron');
// Lets the web layer know it is running as an installed desktop app (hides "install to home screen" prompts)
contextBridge.exposeInMainWorld('electronApp', { platform: process.platform });
