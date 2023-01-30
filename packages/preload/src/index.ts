import { ipcRenderer } from "electron";

export { versions } from "./versions";

export const electronApi = {
  subscribeToUrlChanges(callback: (url: string) => void) {
    ipcRenderer.on("URL_CHANGED", (_, url) => callback(url));
  },

  updateUrl(url: string) {
    ipcRenderer.send("UPDATE_URL", url);
  },

  minimizeChrome() {
    ipcRenderer.send("MINIMIZE_CHROME");
  },

  maximizeChrome() {
    ipcRenderer.send("MAXIMIZE_CHROME");
  },
};
