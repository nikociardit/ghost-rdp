const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:5000';  // Backend must be running
const FRONTEND_URL = 'http://localhost:3000'; // React dev server

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL(FRONTEND_URL);
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- VPN Launch Example ----
// Makes a request to backend to fetch WG peer config, writes to file, and launches WG

async function launchWireGuard(userId) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/wg/peers`); 
    const peers = response.data.peers;
    if (peers.length === 0) {
      dialog.showErrorBox('VPN Error', 'No WireGuard peers found.');
      return;
    }
    // Just pick the first peer for demo
    const peer = peers[0];
    const wgConfig = `
[Interface]
PrivateKey = REPLACE_WITH_YOUR_PRIVATE_KEY
Address = 10.0.0.${peer.id}/32

[Peer]
PublicKey = ${peer.public_key}
AllowedIPs = ${peer.allowed_ips}
Endpoint = ${peer.server.endpoint}
    `;
    const configPath = path.join(app.getPath('userData'), 'wg0.conf');
    fs.writeFileSync(configPath, wgConfig);
    // Launch wg‐quick (requires WireGuard installed on Windows)
    exec(`wg-quick up "${configPath}"`, (err, stdout, stderr) => {
      if (err) {
        dialog.showErrorBox('WireGuard Error', stderr || err.message);
      } else {
        dialog.showMessageBox({ message: 'WireGuard tunnel started.' });
      }
    });
  } catch (e) {
    dialog.showErrorBox('VPN Error', e.message);
  }
}

// ---- RDP Launch Example ----
// Ask backend to generate RDP file for user, download it, then launch mstsc

async function launchRDP(userId) {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/rdp-config/${userId}`, { responseType: 'arraybuffer' });
    const filename = `user_${userId}.rdp`;
    const filePath = path.join(app.getPath('userData'), filename);
    fs.writeFileSync(filePath, Buffer.from(res.data));
    // Launch mstsc.exe
    exec(`mstsc "${filePath}"`, (err) => {
      if (err) {
        dialog.showErrorBox('RDP Error', err.message);
      }
    });
  } catch (e) {
    dialog.showErrorBox('RDP Error', e.message);
  }
}

// You can expose these functions via preload to be called from frontend if needed.
