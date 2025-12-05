import ParentHeader from "../components/parent/ParentHeader";
import ParentBottomNav from "../components/parent/ParentBottomNav";
import { NotificationContainer } from "../components/parent/Notification";

export default function ParentLayout({ children }) {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-purple-600 to-indigo-700 p-2 flex justify-center items-center">
      <div
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full 
                   bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl 
                   p-4 flex flex-col"
      >
        {/* Parent Header */}
        <ParentHeader />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Parent Bottom Navigation */}
        <ParentBottomNav />
      </div>
      
      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}
