import { AutoCarousel } from "@/components/app/auto_carousel";
import Navbar from "@/components/app/navbar";
import Sidebar from "@/components/app/sidebar";

async function HomePage() {
  return (
    <div className="w-full">
      <Navbar />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1">
          <AutoCarousel />

          <div className="ml-24 my-12"></div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
