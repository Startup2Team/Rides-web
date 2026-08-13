import Navbar from "../components/navbar";
import { Chatbot } from "../components/chatbot";

export default function ContactRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      {/* Clears the floating pill: 0.75rem gutter + 3.5rem bar, 1rem + 4rem at sm. */}
      <div className="pt-17 sm:pt-20">
        {children}
      </div>
      <div className="print:hidden">
        <Chatbot />
      </div>
    </>
  );
}
