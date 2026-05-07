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
    <footer
      className="bg-card border-t border-border mt-auto"
      role="contentinfo"
    >
      <div className="lcn-container-x py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand & Social */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Heritage" className="w-7 h-7" />
              <h4 className="text-xl font-semibold tracking-tight text-heritage">
                {t("footer.brand")}
              </h4>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-3 pt-1">
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
            aria-label="Footer navigation"
            className="flex flex-col md:flex-row gap-6 md:gap-12 text-center md:text-left"
          >
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quick Links
              </h5>
              <ul className="space-y-2">
                {FOOTER_CONFIG.navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-heritage focus:text-heritage transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Contact
            </h5>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={16} className="shrink-0" />
              <a
                href={`mailto:${FOOTER_CONFIG.email}`}
                className="text-sm hover:text-heritage focus:text-heritage transition-colors duration-200"
              >
                {FOOTER_CONFIG.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("footer.brand")}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
