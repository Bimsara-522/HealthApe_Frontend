import LeftPanel from "./components/LeftPanel";
import MiddlePanel from "./components/MiddlePanel";
import RightPanel from "./components/RightPanel";

export default function UploadMedicalFilesPage() {
  return (
    <div className="grid grid-cols-12 min-h-screen bg-gray-100">
      
      {/* Left Navigation */}
      <div className="col-span-2 bg-white border-r">
        <LeftPanel />
      </div>

      {/* Middle Workspace */}
      <div className="col-span-6 p-8">
        <MiddlePanel />
      </div>

      {/* Right Preview */}
      <div className="col-span-4 bg-white border-l p-6">
        <RightPanel />
      </div>

    </div>
  );
}
