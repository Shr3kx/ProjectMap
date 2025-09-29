import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeSwitcher from "@/components/theme-switcher";
import AppSidebar from "@/components/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ChatPage from "@/components/chatBot/page";

export default function HomePage() {
  return (
    <AppSidebar>
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between"></div>

        <ChatPage />
        {/* <header className="mb-8">
          <h1 className="text-balance text-3xl font-semibold md:text-5xl">
            Next.js + Tailwind + shadcn/ui
          </h1>
          <p className="mt-3 text-pretty text-red-foreground">
            This page proves your setup works. The heading and spacing use
            Tailwind, and the button and card below come from shadcn/ui.
          </p>
        </header>

        <section className="flex flex-col items-start gap-3 sm:flex-row">
          <Button className="skeuomorphic-button" asChild>
            <Link href="https://nextjs.org">Next.js Docs</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="https://tailwindcss.com/docs">Tailwind Docs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://ui.shadcn.com">shadcn/ui Docs</Link>
          </Button>
        </section>

        <section aria-labelledby="ui-demo" className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle id="ui-demo">shadcn/ui is wired up</CardTitle>
              <CardDescription>
                This Card and Buttons use your design tokens for colors and
                radius.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm text-muted-foreground">
                    Token-based box
                  </p>
                  <p className="mt-1 font-medium">
                    bg-card + text-card-foreground
                  </p>
                </div>
                <div className="rounded-lg border bg-secondary p-4 text-secondary-foreground">
                  <p className="text-sm">Secondary surface</p>
                  <p className="mt-1 font-medium">
                    bg-secondary + text-secondary-foreground
                  </p>
                </div>
                <div className="rounded-lg border p-4 ring-0 transition hover:ring-2 hover:ring-ring">
                  <p className="text-sm text-muted-foreground">
                    Interactive hover
                  </p>
                  <p className="mt-1 font-medium">hover:ring-ring</p>
                </div>
              </div>

              <div className="mt-6">
                <Button>Primary Button</Button>
                <Button className="ml-2" variant="ghost">
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </section> */}
      </div>
    </AppSidebar>
  );
}
