"use client";

import Logo from "@/components/app/logo";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, LogIn, Search } from "lucide-react";
import { useEffect, useState } from "react";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full flex items-center px-8 pt-1 fixed top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <Logo />
      {/* Type */}
      <div className="ml-10 flex items-center space-x-6 mb-0.5 ">
        <div className="flex items-center space-x-1 ml-6 cursor-pointer select-none text-zinc-900 hover:text-zinc-500 transition-colors">
          <h1 className="text-[16.5px] font-medium text-zinc-500">Category</h1>
          <ChevronDown className="size-5 mt-1 text-zinc-500" />
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Search */}
        <div className="flex items-center">
          <Search className="size-5 absolute ml-3 mt-2.5 text-zinc-500 mb-2" />
          <Input
            className="rounded-2xl pl-10 pr-4 py-2"
            placeholder="Enter book name, author,..."
          />
        </div>
        {/* Noti */}
        <Bell className="size-5 text-zinc-500 hover:text-zinc-700 cursor-pointer" />
        {/* Login / Profile */}
        <div>
          <div className="w-0.5 h-6 bg-zinc-400"></div>
        </div>

        <div className="flex items-center ml-4 bg-zinc-200 px-5 py-2 mb-1 rounded-full hover:bg-zinc-300 font-semibold cursor-pointer transition-colors">
          <LogIn className="size-4 text-zinc-500 cursor-pointer" />
          <h1 className="ml-2 text-zinc-500  cursor-pointer">Login</h1>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
