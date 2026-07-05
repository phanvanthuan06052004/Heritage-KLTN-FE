import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
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
    { to: "/historical-map", labelKey: "nav.historicalMap" },
    { to: "/passport", labelKey: "nav.passport" },
    { to: "/about", labelKey: "nav.about" },
  ],
};

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-museum-black via-museum-black to-museum-charcoal text-museum-ivory" role="contentinfo">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/25 to-transparent" />
      <div className="museum-pattern absolute inset-0 opacity-[0.04]" />
      <div className="lcn-container-x relative py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_1fr] md:items-start">
          {/* Brand & Social */}
          <div className="flex flex-col items-center space-y-4 md:items-start">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/images/logo-mark.png"
                alt="Heritage"
                className="h-12 w-10 object-contain"
              />
              <h4 className="font-display text-2xl font-semibold tracking-[0.12em] text-museum-parchment">
                {t("footer.brand")}
              </h4>
            </Link>
            <p className="max-w-sm text-center text-sm leading-6 text-museum-muted/90 md:text-left">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {FOOTER_CONFIG.socialLinks.map((social) => (
                <span
                  key={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-museum-gold/15 bg-museum-gold/5 text-museum-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
                >
                  <SocialIcon
                    name={social.name}
                    url={social.url}
                    iconPath={social.icon}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Footer navigation"
            className="text-center md:text-left"
          >
            <div>
              <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-museum-gold/90">
                Quick Links
              </h5>
              <ul className="space-y-2">
                {FOOTER_CONFIG.navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-museum-muted transition-colors duration-200 hover:text-museum-gold-light focus:text-museum-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contact */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-museum-gold/90">
              Contact
            </h5>
            <div className="flex items-center gap-2 text-museum-muted">
              <Mail size={16} className="shrink-0" />
              <a
                href={`mailto:${FOOTER_CONFIG.email}`}
                className="text-sm transition-colors duration-200 hover:text-museum-gold-light focus:text-museum-gold-light"
              >
                {FOOTER_CONFIG.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-museum-muted">
              <MapPin size={16} className="shrink-0 text-museum-gold/75" />
              Ho Chi Minh City, Vietnam
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-museum-gold/10 pt-6 text-center">
          <p className="text-xs text-museum-muted">
            &copy; {new Date().getFullYear()} {t("footer.brand")}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
