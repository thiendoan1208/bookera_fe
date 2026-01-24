import Navbar from "@/components/app/navbar";
import Sidebar from "@/components/app/sidebar";

function HomePage() {
  return (
    <div className="h-screen w-full">
      <Navbar />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 mt-12">
          <h1>Homepage</h1>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
