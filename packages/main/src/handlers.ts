import { ipcMain } from "electron";
import { URL } from "node:url";
import { webpage, minimizeChrome, maximizeChrome, focusWebpage, focusChrome } from "./mainWindow";

[
  function handleUpdateUrl() {
    ipcMain.on("UPDATE_URL", (_, url) => {
      let fullUrl;
      try {
        fullUrl = new URL(url);

        if (!fullUrl.hostname) {
          // cases where the hostname was not identified
          // ex: user:password@www.example.com, example.com:8000
          fullUrl = new URL("http://" + url);
        }
      } catch (error) {
        fullUrl = new URL("http://" + url);
      }
      webpage!.webContents.loadURL(fullUrl.toString());
    });
  },

  function handleMinimizeChrome() {
    ipcMain.on("MINIMIZE_CHROME", () => {
      minimizeChrome();
      focusWebpage();
    });
  },

  function handleMaximizeChrome() {
    ipcMain.on("MAXIMIZE_CHROME", () => {
      maximizeChrome();
      focusChrome();
    });
  },
].forEach((f) => f());
