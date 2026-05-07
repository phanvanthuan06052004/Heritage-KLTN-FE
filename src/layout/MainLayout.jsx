import { Outlet } from "react-router-dom";
import Footer from "~/components/Footer/Footer";
import NavBar from "~/components/NavBar/NavBar";
import ScrollToTop from "~/components/common/ScrollToTop";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <NavBar />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
