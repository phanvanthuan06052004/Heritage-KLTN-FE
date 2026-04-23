import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { siFacebook, siInstagram } from "simple-icons";
import { useTranslation } from "react-i18next";
import SocialIcon from "./SocialIcon";

const FOOTER_CONFIG = {
  socialLinks: [
    {
      name: "Facebook",
      url: "https://www.facebook.com/duc.nhatt.nguyen",
      icon: siFacebook.path,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/nhatt.1510/",
      icon: siInstagram.path,
    },
  ],
  email: "22110240@student.hcmute.edu.vn",
  navLinks: [
    { to: "/heritages", labelKey: "nav.heritageSites" },
    { to: "/explore", labelKey: "nav.explore" },
    { to: "/about", labelKey: "nav.about" },
  ],
};

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="lcn-container-x py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          {/* Brand & Social */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="text-xl font-semibold tracking-tight text-heritage">
              {t("footer.brand")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="flex space-x-4">
              {FOOTER_CONFIG.socialLinks.map((social) => (
                <SocialIcon
                  key={social.name}
                  name={social.name}
                  url={social.url}
                  iconPath={social.icon}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav
            role="navigation"
            aria-label="Footer navigation"
            className="flex flex-col md:flex-row gap-4 md:gap-12"
          >
            {FOOTER_CONFIG.navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-heritage focus:text-heritage transition-colors duration-200"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail size={20} />
            <a
              href={`mailto:${FOOTER_CONFIG.email}`}
              className="text-sm hover:text-heritage focus:text-heritage transition-colors duration-200"
            >
              {FOOTER_CONFIG.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
