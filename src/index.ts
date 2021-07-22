import {app, BrowserWindow, dialog} from 'electron';
import * as fsAsync from 'fs/promises';
import loadIpcHandlers from 'Main/ipcHandlers';
import {Settings} from 'Types/types';
import {setSessionCookie, validateSession} from 'Main/client';
import defineExtensions from 'Main/extensions';
import {loadDownloadWatcherHandlers} from 'Main/downloadWatcher';

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let settings: Settings;

const createWindow = (): void => {
  // Create the browser window.
  /*const mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
    }
  });*/

  // can't figure out how to get preloading and nodeIntegration = false to play nice and successfully render without require is undefined
  // i'm pretty sure it's something to do with webpack
  // i think this is breaking spectron/mocha as well
  const mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  console.log(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY);

  defineExtensions();

  (async () => {
    try {
      await fsAsync.stat('settings.json');
    } catch (e) {
      await fsAsync.writeFile('settings.json', JSON.stringify({sessionCookie: ''}, null, 2));
    }

    const settingsBuffer = await fsAsync.readFile('settings.json');
    settings = JSON.parse(settingsBuffer.toString());

    setSessionCookie(settings.sessionCookie);

    if (!await validateSession()) {
      dialog.showErrorBox('Error', 'Session cookie was invalid');
      throw new Error('Session cookie was invalid');
    }
  })();

  loadIpcHandlers();
  loadDownloadWatcherHandlers();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
