// "use client";
// import { useState } from "react";
// import ThemeSwitcher from "@/components/theme-switcher";
// import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
// import { Github, Info } from "lucide-react";
// import { Button } from "./ui/button";
// import Link from "next/link";
// export function AppHeader() {
//   const { state } = useSidebar();

//   return (
//     <header
//       role="banner"
//       className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-sm border-b border-border/40 supports-[backdrop-filter]:bg-background/60"
//     >
//       <div className="flex h-12 items-center justify-between px-3 md:h-14 md:px-4">
//         {/* Left: Sidebar trigger + brand */}
//         <div className="flex items-center gap-2 ">
//           <SidebarTrigger className="size-8 md:size-7 cursor-pointer" />
//         </div>

//         {/* Right: Theme switcher + GitHub */}
//         <div className="flex items-center gap-2">
//           <ThemeSwitcher />
//           <Link href="https://github.com/Shr3kx" target="_blank">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="size-8"
//               aria-label="Keyboard shortcuts"
//             >
//               <Github className="size-4 cursor-pointer" />
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default AppHeader;
