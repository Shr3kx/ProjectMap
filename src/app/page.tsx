import ThemeSwitcher from "@/components/theme-switcher";
import AppSidebar from "@/components/sidebar";
import ChatPage from "@/components/chatBot/page";

export default function HomePage() {
  return (
    <AppSidebar>
      <div className="mx-auto max-w-3xl p-6 md:p-10 ">
        <div className="mb-6 flex items-center justify-between"></div>

        <ChatPage />
      </div>
    </AppSidebar>
  );
}
