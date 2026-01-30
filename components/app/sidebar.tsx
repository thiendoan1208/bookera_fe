"use client";

import routes from "@/routes/routes";
import { Hash, House, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", icon: <House />, link: routes.home },
  { name: "Marketplace", icon: <Store />, link: routes.marketplace },
  { name: "Topic", icon: <Hash />, link: routes.topic },
  {
    name: "Assistant",
    icon: <Sparkles />,
    link: routes.assistant,
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-24 h-full m-0 p-0 fixed left-0 top-0 bg-(--bg-primary)/80 backdrop-blur-md z-50">
      <div className="h-full flex flex-col items-center mt-24 space-y-4">
        {navItems.map((item) => (
          <div
            key={item.name}
            className="w-full flex justify-center items-center relative"
          >
            {pathname === item.link && (
              <div className="w-1 h-full absolute left-0 bg-black rounded-r-2xl"></div>
            )}
            <div
              className={`flex flex-col items-center justify-center ${pathname === item.link ? " text-black" : "text-zinc-500"}  cursor-pointer hover:text-black transition-colors`}
            >
              {item.name == "Assistant" ? (
                <div className="flex flex-col items-center justify-center p-3 bg-linear-to-tr from-purple-500 via-pink-500 to-red-500 rounded-full text-white">
                  <Link
                    href={item.link}
                    className="flex flex-col items-center w-full"
                  >
                    {item.icon}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 rounded-full transition-colors">
                  <Link
                    href={item.link}
                    className="flex flex-col items-center w-full"
                  >
                    {item.icon}
                    <h1 className="font-semibold text-sm">{item.name}</h1>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
