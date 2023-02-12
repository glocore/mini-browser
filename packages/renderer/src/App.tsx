import { electronApi } from "#preload";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import cx from "classnames";
import { useCallback, useState } from "react";
import { AiOutlinePushpin } from "react-icons/ai";
import { HiOutlineChevronDown } from "react-icons/hi";
import { MdAdd, MdMoreVert } from "react-icons/md";
import { snapshot } from "valtio";
import { AddressBar } from "./components/AddressBar";
import { Button } from "./components/Button";
import { PageControls } from "./components/PageControls";
import { createTab, resetTabs, Tabs, tabStore } from "./components/Tabs";
import "./index.css";

resetTabs();

const App = () => {
  const [chromeStatus, setChromeStatus] = useState<"minimized" | "maximized">("minimized");

  const minimizeChrome = useCallback(() => {
    setChromeStatus("minimized");
    setTimeout(() => {
      electronApi.minimizeChrome();
      electronApi.focusWebpage(snapshot(tabStore).activeTab!);
    }, 150); // time it takes to fade out the chrome backdrop
  }, []);

  const maximizeChrome = useCallback(() => {
    electronApi.maximizeChrome();
    setChromeStatus("maximized");
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <div
        className={cx("z-10 bg-white fixed top-0 bottom-0 left-0 right-0 transition-opacity", {
          "opacity-0": chromeStatus === "minimized",
          "opacity-100": chromeStatus === "maximized",
        })}
      />

      <div className="z-20 relative">
        {/* tab bar */}
        <div className="flex h-[28px] bg-[#DEE1E6]">
          <div className="tablist min-w-0 h-full overflow-auto">
            <Tabs />
          </div>
          <div className="flex-1 flex items-center ml-0.5">
            <Button title="New Tab (⌘+T)" onClick={() => createTab()}>
              <MdAdd />
            </Button>
          </div>
          <div className="flex items-center mr-1">
            <div className="h-full w-4" />
            <Button title="Pin window (⌘+P)">
              <HiOutlineChevronDown size={14} />
            </Button>
            <Button title="Pin window (⌘+P)">
              <AiOutlinePushpin size={14} />
            </Button>
          </div>
        </div>

        <div className="flex items-center bg-white border-b border-b-gray-200 h-[35px] p-0.5">
          <PageControls />
          <AddressBar onFocus={maximizeChrome} onBlur={minimizeChrome} />
          <div className="mr-0.5 flex items-center">
            <Button>
              <MdMoreVert />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 0,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      retryOnMount: false,
    },
  },
});

export default function () {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
