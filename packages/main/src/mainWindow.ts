import {app, BrowserView, BrowserWindow} from 'electron';
import {join} from 'node:path';
import {URL} from 'node:url';

export let chrome: BrowserView | undefined;
export let webpage: BrowserView | undefined;
export let mainWindow: BrowserWindow | undefined;

async function createWindow() {
  mainWindow = new BrowserWindow({
    show: true,
    frame: false,
    // closable: false,
    // minimizable: false,
    // maximizable: false,
    // fullscreenable: false,
    // alwaysOnTop: true,
  });

  createChrome();
  createWebpage();

  return mainWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}

function createChrome() {
  /**
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  const chrome = new BrowserView({
    webPreferences: {
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
      sandbox: false,
    },
  });
  mainWindow?.addBrowserView(chrome);

  function setSize() {
    chrome.setBounds({
      x: 0,
      y: 0,
      width: mainWindow?.getContentBounds().width ?? 0,
      height: 55,
    });
  }

  setSize();
  autoResize(setSize);

  chrome.webContents.loadURL(pageUrl);
  chrome.webContents.on('dom-ready', () => {
    mainWindow?.setTopBrowserView(chrome);
    mainWindow?.show();

    webpage!.webContents.on('will-navigate', (_, url) => {
      console.log('will-navigate');
      chrome!.webContents.send('URL_CHANGED', url);
    });

    webpage!.webContents.on('did-navigate-in-page', (_, url) => {
      console.log('did-navigate-in-page');
      chrome!.webContents.send('URL_CHANGED', url);
    });
  });

  chrome.webContents.openDevTools({mode: 'detach'});
}

function createWebpage() {
  webpage = new BrowserView();
  mainWindow?.addBrowserView(webpage);

  function setSize() {
    webpage?.setBounds({
      x: 0,
      y: 55,
      width: mainWindow?.getContentBounds().width ?? 0,
      height: (mainWindow?.getContentBounds().height ?? 55) - 55,
    });
  }

  setSize();
  autoResize(setSize);

  webpage.setBackgroundColor('#ffffff');
  webpage.webContents.loadURL('https://google.com');
}

function autoResize(onResize: () => void) {
  let lastHandle: NodeJS.Timeout;
  function handleWindowResize(e: any) {
    e.preventDefault();

    // the setTimeout is necessary because it runs after the event listener is handled
    lastHandle = setTimeout(() => {
      if (lastHandle != null) clearTimeout(lastHandle);
      if (mainWindow) onResize();
    });
  }

  mainWindow?.on('resize', handleWindowResize);
}
