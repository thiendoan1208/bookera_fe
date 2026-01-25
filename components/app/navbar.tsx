"use client";

import Logo from "@/components/app/logo";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, LogIn, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/data/categories";

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
      className={`w-full flex items-center px-8 pt-1 fixed top-0 z-55 transition-all duration-300 ${
        isScrolled
          ? "bg-(--bg-primary)/80 backdrop-blur-md"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <Logo />
      {/* Type */}
      <div className="ml-10 flex items-center space-x-6 mb-0.5 ">
        <div className="flex items-center space-x-1 ml-6 cursor-pointer select-none text-zinc-900 hover:text-zinc-800 transition-colors">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex itemcenter space-x-1">
                <h1 className="text-[16.5px] font-medium text-zinc-800">
                  Category
                </h1>
                <ChevronDown className="size-5 mt-1 text-zinc-800" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-xl z-55 h-80 grid grid-cols-2 p-2 pt-3"
              align="start"
            >
              {categories.map((category, index) => (
                <div key={`category-${index}`}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-[playfair-display] text-xl font-semibold">
                      {category.title}
                    </DropdownMenuLabel>
                    {category.subjects.map((subject, subIndex) => (
                      <DropdownMenuItem
                        key={`subject-${subIndex}`}
                        className="hover:bg-zinc-100 cursor-pointer"
                      >
                        {subject.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Search */}
        <div className="flex items-center">
          <Search className="size-5 absolute ml-3 mt-2.5 text-zinc-800 mb-2" />
          <Input
            className="rounded-2xl pl-10 pr-4 py-2"
            placeholder="Enter book name, author,..."
          />
        </div>
        {/* Noti */}
        <Bell className="size-5 text-zinc-800 hover:text-zinc-400 cursor-pointer transition-colors" />
        {/* Login / Profile */}
        <div>
          <div className="w-0.5 h-6 bg-zinc-400"></div>
        </div>

        <div className="flex items-center ml-4 bg-zinc-100 px-5 py-2 mb-1 rounded-full hover:bg-zinc-200 font-semibold cursor-pointer transition-colors">
          <LogIn className="size-4 text-zinc-800 cursor-pointer" />
          <h1 className="ml-2 text-zinc-800  cursor-pointer">Login</h1>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
