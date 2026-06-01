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
      <Navbar />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}
