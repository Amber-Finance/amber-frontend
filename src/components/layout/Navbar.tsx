"use client";

import { ConnectButton } from "@/components/common/ConnectButton";
import Logo from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { initializeWasm } from "@/utils/health_computer/initWasm";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const baseClasses =
  "relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 pb-1";
const activeClasses =
  "text-gray-900 dark:text-white before:bg-gradient-to-r before:from-orange-400 before:to-yellow-200";
const defaultClasses =
  "text-gray-500 dark:text-gray-400 hover:text-gray-900 border-transparent dark:hover:text-white before:bg-transparent";
const borderClasses =
  "relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.25 before:bg-gradient-to-r before:from-orange-400 before:to-yellow-200 before:opacity-50";

const Navbar = () => {
  // Get current path to determine active link
  const pathname = usePathname();
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Initialize the health computer
  useEffect(() => {
    initializeWasm();
  }, []);

  return (
    <nav
      className={`overflow-hidden flex items-center justify-between p-2 px-3 md:p-4 md:px-6 ${borderClasses}`}
    >
      <div className="absolute left-0 right-0 top-0 h-[200px] md:h-[300px] bg-radial from-yellow-200 to-orange-400 opacity-40 z-10" />
      <div className="flex items-center gap-4 md:gap-8 z-20 relative">
        <Link
          href="/"
          className="flex items-center text-xl md:text-2xl font-bold text-gray-900 no-underline dark:text-white"
        >
          <Logo className="w-15 h-15 md:w-30 md:h-30" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`${baseClasses} ${
              pathname === "/" ? activeClasses : defaultClasses
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/markets"
            className={`${baseClasses} ${
              pathname === "/markets" ? activeClasses : defaultClasses
            }`}
          >
            Markets
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 z-20 relative">
        <ThemeToggle />
        <ConnectButton />
        {/* Mobile Burger Menu - moved to the far right */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Off-Canvas Mobile Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex flex-col`}
      >
        <div
          className={`flex items-center justify-between h-19 py-2 px-3 ${borderClasses}`}
        >
          <Link
            href="/"
            className="flex items-center"
            onClick={toggleMobileMenu}
          >
            <span className="ml-2 font-bold text-gray-900 dark:text-white">
              Bitcoin Outpost
            </span>
          </Link>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
            aria-label="Close navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col py-6 flex-grow">
          <Link
            href="/"
            className={`px-6 py-4 font-medium no-underline transition-colors ${
              pathname === "/"
                ? "text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 border-l-4 border-orange-500 pl-5"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
            }`}
            onClick={toggleMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            href="/markets"
            className={`px-6 py-4 font-medium no-underline transition-colors ${
              pathname === "/markets"
                ? "text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 border-l-4 border-orange-500 pl-5"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
            }`}
            onClick={toggleMobileMenu}
          >
            Markets
          </Link>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
