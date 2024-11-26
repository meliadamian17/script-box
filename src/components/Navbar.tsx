import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        try {
          const res = await fetch("/api/user/profile-img");
          if (res.ok) {
            const data = await res.json();
            setProfileImage(data.profileImage || null);
          }
        } catch (error) {
          console.error("Failed to fetch profile image:", error);
        }
      }
    };

    fetchProfileImage();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar bg-base-300 shadow-xl">
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2">
          <CodeBracketIcon className="w-8 h-8 text-primary" />
          <span className="normal-case text-xl font-bold">Scriptbox</span>
        </Link>
        {/* Navigation Links */}
        <div className="ml-6 flex space-x-4">
          <Link href="/templates" className="btn btn-ghost btn-sm rounded-btn">
            Templates
          </Link>
          <Link href="/blogs" className="btn btn-ghost btn-sm rounded-btn">
            Blogs
          </Link>
        </div>
      </div>
      <div className="flex-none">
        <div ref={dropdownRef} className="dropdown dropdown-end">
          {user ? (
            <>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <Image
                    src={profileImage || "/placeholder.jpg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </button>
              {dropdownOpen && (
                <ul className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link href="/account" className="justify-between" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="justify-between"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="btn btn-ghost btn-circle"
              >
                <CodeBracketIcon className="w-6 h-6" />
              </button>
              {dropdownOpen && (
                <ul className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link href="/login" onClick={() => setDropdownOpen(false)}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" onClick={() => setDropdownOpen(false)}>
                      Signup
                    </Link>
                  </li>
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

