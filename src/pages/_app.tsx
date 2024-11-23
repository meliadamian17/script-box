import "../styles/globals.css";
import { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

