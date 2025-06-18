"use client";

import { ConnectButton } from "@/components/common/ConnectButton";
import Logo from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuroraText } from "@/components/ui/AuroraText";
import { Button } from "@/components/ui/button";
import { initializeWasm } from "@/utils/health_computer/initWasm";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-14 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Logo className="w-8 h-8" />
            <AuroraText
              className="text-lg font-bold"
              colors={["#f7931a", "#ff6b35", "#f7931a", "#ffaa00"]}
            >
              Bitcoin Outpost
            </AuroraText>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/markets"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/markets"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Markets
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="py-4 space-y-2 px-4 max-w-screen-2xl mx-auto">
            <Link
              href="/"
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === "/"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              onClick={toggleMobileMenu}
            >
              Dashboard
            </Link>
            <Link
              href="/markets"
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === "/markets"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              onClick={toggleMobileMenu}
            >
              Markets
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
