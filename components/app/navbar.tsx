"use client";

import Logo from "@/components/app/logo";
import { Input } from "@/components/ui/input";
import {
  Bell,
  LogIn,
  Search,
  LoaderCircle,
  User,
  LogOut,
  Bookmark,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchWorks } from "@/service/open_lib";
import { logout } from "@/service/auth_service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { EditProfileDialog } from "@/components/app/edit-profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import routes from "@/routes/routes";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const router = useRouter();
  const { user, loading, clearUser } = useUser();

  const searchMutation = useMutation({
    mutationFn: (query: string) => searchWorks(query),
    onSuccess: () => {
      router.push(routes.searchResult(searchInput));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser(); // Clear user from context
      toast.success("Logged out successfully");
      router.push(routes.login);
      router.refresh(); // Refresh to clear any cached data
    },
    onError: () => {
      toast.error("Failed to logout");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      searchMutation.mutate(searchInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

      <div className="ml-auto flex items-center space-x-4">
        {/* Search */}
        <div className="flex items-center relative">
          {searchMutation.isPending ? (
            <LoaderCircle className="size-5 absolute ml-3 mt-2.5 text-zinc-800 mb-2 animate-spin" />
          ) : (
            <Search
              className="size-5 absolute ml-3 mt-2.5 text-zinc-800 mb-2 cursor-pointer hover:text-zinc-600 transition-colors"
              onClick={handleSearch}
            />
          )}
          <Input
            className="rounded-2xl pl-10 pr-4 py-2"
            placeholder="Enter book name, author,..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searchMutation.isPending}
          />
        </div>
        {/* Noti */}
        <Bell className="size-5 text-zinc-800 hover:text-zinc-400 cursor-pointer transition-colors" />
        {/* Login / Profile */}
        <div className="m-0">
          <div className="w-0.5 h-6 bg-zinc-400"></div>
        </div>

        {loading ? (
          // Loading state
          <div className="ml-4 mb-1">
            <LoaderCircle className="size-8 animate-spin text-zinc-400" />
          </div>
        ) : user ? (
          // User Profile Avatar with Dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="ml-4 mb-1 cursor-pointer">
                <div className="size-9 rounded-full overflow-hidden border-2 border-zinc-300 hover:border-zinc-500 transition-all">
                  <Image
                    src={
                      user.avatar_url == "default_avatar"
                        ? "/default_image/default_profile_avatar.jpg"
                        : user.avatar_url
                    }
                    alt={user.username}
                    width={36}
                    height={36}
                    className="object-cover select-none"
                  />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <User className="mr-2 size-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <Link href="/home/saved">
                  <DropdownMenuItem className="cursor-pointer">
                    <Bookmark className="mr-2 size-4" />
                    <span>Saved Items</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/home/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 size-4 text-red-600" />
                <span>
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Login Button
          <Link
            href={routes.login}
            className="flex items-center ml-4 bg-zinc-100 px-5 py-2 mb-1 rounded-full hover:bg-zinc-200 font-semibold cursor-pointer transition-colors"
          >
            <LogIn className="size-4 text-zinc-800 cursor-pointer" />
            <h1 className="ml-2 text-zinc-800  cursor-pointer">Login</h1>
          </Link>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      />
    </div>
  );
}

export default Navbar;
