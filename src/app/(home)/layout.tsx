import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
