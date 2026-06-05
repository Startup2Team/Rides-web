import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Chatbot } from "../components/chatbot";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      {children}
      <div className="print:hidden">
        <Footer />
        <Chatbot />
      </div>
    </>
  );
}
