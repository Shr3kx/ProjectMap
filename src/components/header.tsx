"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeSwitcher from "@/components/theme-switcher";

export const AppHeader = () => {
  return (
    <header
      role="banner"
      className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-sm border-b border-border/40 supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-12 items-center justify-between px-3 md:h-14 md:px-4">
        {/* Left: Sidebar trigger + brand */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="size-8 md:size-7 cursor-pointer" />
          <Link
            href="/"
            aria-label="home"
            className="flex items-center space-x-2"
          >
            {/* <Logo /> */}
          </Link>
        </div>

        {/* Right: Theme switcher + GitHub */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Link href="https://github.com/Shr3kx" target="_blank">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

// "use client";

// import Link from "next/link";
// import { Menu, X, Github } from "lucide-react";
// import React from "react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import ThemeSwitcher from "@/components/theme-switcher";

// export const AppHeader = () => {
//   const [menuState, setMenuState] = React.useState(false);
//   const [isScrolled, setIsScrolled] = React.useState(false);

//   React.useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <header>
//       <nav
//         data-state={menuState && "active"}
//         className="fixed z-20 w-full px-2"
//       >
//         <div
//           className={cn(
//             "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
//             isScrolled &&
//               "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
//           )}
//         >
//           <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
//             {/* LEFT: Sidebar + Logo */}
//             <div className="flex w-full items-center justify-between lg:w-auto">
//               <div className="flex items-center gap-2">
//                 <SidebarTrigger className="size-8 md:size-7 cursor-pointer" />
//                 <Link
//                   href="/"
//                   aria-label="home"
//                   className="flex items-center space-x-2"
//                 >
//                   {/* <Logo /> */}
//                 </Link>
//               </div>

//               {/* Mobile menu toggle (hidden since no menu) */}
//               <button
//                 onClick={() => setMenuState(!menuState)}
//                 aria-label={menuState ? "Close Menu" : "Open Menu"}
//                 className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
//               >
//                 <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
//                 <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
//               </button>
//             </div>

//             {/* RIGHT: Theme + GitHub + Auth buttons */}
//             <div className="flex w-full flex-wrap items-center justify-end gap-3 lg:w-fit">
//               <div className="flex items-center gap-3">
//                 <ThemeSwitcher />
//                 <Link href="https://github.com/Shr3kx" target="_blank">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="size-8"
//                     aria-label="GitHub"
//                   >
//                     <Github className="size-4" />
//                   </Button>
//                 </Link>
//               </div>

//               <div className="flex flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
//                 <Button
//                   asChild
//                   variant="outline"
//                   size="sm"
//                   className={cn(isScrolled && "lg:hidden")}
//                 >
//                   <Link href="#">
//                     <span>Login</span>
//                   </Link>
//                 </Button>
//                 <Button
//                   asChild
//                   size="sm"
//                   className={cn(isScrolled && "lg:hidden")}
//                 >
//                   <Link href="#">
//                     <span>Sign Up</span>
//                   </Link>
//                 </Button>
//                 <Button
//                   asChild
//                   size="sm"
//                   className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
//                 >
//                   <Link href="#">
//                     <span>Get Started</span>
//                   </Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default AppHeader;
