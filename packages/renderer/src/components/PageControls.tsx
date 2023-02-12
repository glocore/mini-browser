import { electronApi } from "#preload";
import { MdOutlineArrowBack, MdOutlineArrowForward, MdRefresh } from "react-icons/md";
import { Button } from "./Button";
import { getActiveTab } from "./Tabs";

export function PageControls() {
  return (
    <div className="flex items-center">
      <Button title="Go Back" onClick={goBack}>
        <MdOutlineArrowBack size={18} />
      </Button>
      <Button title="Go Forward" onClick={goForward}>
        <MdOutlineArrowForward size={18} />
      </Button>
      <Button title="Reload Page" onClick={reloadPage}>
        <MdRefresh size={18} />
      </Button>
    </div>
  );
}

function goBack() {
  const activeTab = getActiveTab();

  if (!activeTab) return;

  electronApi.goBack(activeTab.id);
}

function goForward() {
  const activeTab = getActiveTab();

  if (!activeTab) return;

  electronApi.goForward(activeTab.id);
}

function reloadPage() {
  const activeTab = getActiveTab();

  if (!activeTab) return;

  electronApi.reloadPage(activeTab.id);
}
