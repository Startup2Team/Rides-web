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
      <div className="pt-16 sm:pt-20">
        {children}
      </div>
      <div className="print:hidden">
        <Chatbot />
      </div>
    </>
  );
}
