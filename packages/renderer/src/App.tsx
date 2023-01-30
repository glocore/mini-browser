import { electronApi } from "#preload";
import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlinePushpin, AiOutlineReload } from "react-icons/ai";

import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { Button } from "./components/Button";
import "./index.css";

const App = () => {
  const [chromeStatus, setChromeStatus] = useState<"minimized" | "maximized">("minimized");
  const [url, setUrl] = useState("");
  const addressBarRef = useRef<HTMLInputElement>(null);

  const hasSubscribedToUrlChanges = useRef<boolean>(false);
  useEffect(() => {
    if (hasSubscribedToUrlChanges.current) return;

    electronApi.subscribeToUrlChanges((url) => {
      setUrl(url);
    });

    hasSubscribedToUrlChanges.current = true;
  }, []);

  const minimizeChrome = useCallback(() => {
    setChromeStatus("minimized");
    setTimeout(() => {
      electronApi.minimizeChrome();
    }, 150); // time it takes to fade out the chrome backdrop
  }, []);

  const handleAddressBarBlur = useCallback(() => {
    minimizeChrome();
  }, []);

  const handleAddressBarFocus = useCallback(() => {
    electronApi.maximizeChrome();
    setChromeStatus("maximized");
    setTimeout(() => {
      addressBarRef.current?.select();
    });
  }, []);

  const handleSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      electronApi.updateUrl(url);
      minimizeChrome();
    },
    [url]
  );

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
        <div className="flex h-[28px] px-1">
          <div className="flex-1" />
          <Button title="Pin window (⌘+P)">
            <AiOutlinePushpin />
          </Button>
        </div>

        <form
          className="flex items-center bg-white border-b border-b-gray-300 h-[45px] p-1"
          onSubmit={handleSubmit}
        >
          <Button title="Go Back">
            <HiOutlineChevronLeft size={20} />
          </Button>
          <Button title="Go Forward">
            <HiOutlineChevronRight size={20} />
          </Button>
          <Button title="Reload Page">
            <AiOutlineReload size={18} />
          </Button>
          <input
            ref={addressBarRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={handleAddressBarFocus}
            onBlur={handleAddressBarBlur}
            className="flex-1 h-[90%] border-none outline-blue-600 outline-4 rounded-full mx-1 px-4 bg-gray-100 focus:bg-white"
          />
        </form>
      </div>
    </div>
  );
};

export default App;
