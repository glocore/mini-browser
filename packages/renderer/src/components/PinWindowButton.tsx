import { electronApi } from "#preload";
import { useCallback, useEffect, useState } from "react";
import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";
import { Button } from "./Button";

export function PinWindowButton() {
  const [isWindowPinned, setIsWindowPinned] = useState(false);

  useEffect(() => {
    (async () => {
      const _isWindowPinned = await electronApi.getWindowPinStatus();
      setIsWindowPinned(_isWindowPinned);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = electronApi.subscribeToHotkeys((command: string, pinOrUnpin: string) => {
      if (command !== "TOGGLE_PIN") return;

      setIsWindowPinned(pinOrUnpin === "PIN");
    });

    return unsubscribe;
  }, []);

  const handleButtonClick = useCallback(() => {
    if (isWindowPinned) {
      electronApi.unpinWindow();
    } else {
      electronApi.pinWindow();
    }

    setIsWindowPinned(!isWindowPinned);
  }, [isWindowPinned]);

  const accelerator = electronApi.isMac ? "(⌘P)" : "(Ctrl+P)";

  return (
    <Button
      onClick={handleButtonClick}
      title={isWindowPinned ? `Unpin window ${accelerator}` : `Pin window ${accelerator}`}
    >
      {isWindowPinned ? (
        <AiFillPushpin size={14} className="-rotate-45" />
      ) : (
        <AiOutlinePushpin size={14} />
      )}
    </Button>
  );
}
