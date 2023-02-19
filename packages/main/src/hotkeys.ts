import { globalShortcut } from "electron";
import { chrome, isMainWindowPinned, pinWindow, unpinWindow } from "./mainWindow";

const registrations = new Set<string>();

function register(accelerator: string, callback: () => void) {
  globalShortcut.register(accelerator, callback);
  registrations.add(accelerator);
}

export function registerHotkeys() {
  register("CmdOrCtrl+P", () => {
    if (isMainWindowPinned) {
      unpinWindow();
      chrome?.webContents.send("HOTKEY", "TOGGLE_PIN", "UNPIN");
    } else {
      pinWindow();
      chrome?.webContents.send("HOTKEY", "TOGGLE_PIN", "PIN");
    }
  });

  register("CmdOrCtrl+L", () => {
    chrome?.webContents.focus();
    chrome?.webContents.send("HOTKEY", "FOCUS_ADDRESSBAR");
  });

  register("CmdOrCtrl+T", () => {
    chrome?.webContents.focus();
    chrome?.webContents.send("HOTKEY", "CREATE_NEW_TAB");
  });

  register("CmdOrCtrl+T", () => {
    chrome?.webContents.focus();
    chrome?.webContents.send("HOTKEY", "CREATE_NEW_TAB");
  });

  register("CmdOrCtrl+W", () => {
    chrome?.webContents.send("HOTKEY", "DESTROY_ACTIVE_TAB");
  });

  register("Ctrl+Tab", () => {
    chrome?.webContents.send("HOTKEY", "FOCUS_NEXT_TAB");
  });

  register("Ctrl+Shift+Tab", () => {
    chrome?.webContents.send("HOTKEY", "FOCUS_PREVIOUS_TAB");
  });
}

export function unregisterHotkeys() {
  registrations.forEach((r) => globalShortcut.unregister(r));
}
