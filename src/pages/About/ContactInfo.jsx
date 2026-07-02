import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contactInfo, socialLinks } from "./data/contactData";

const ContactInfo = () => {
  const { t } = useTranslation();

  const translatedContactInfo = [
    { ...contactInfo[0], title: t("about.contactLabels.email") },
    { ...contactInfo[1], title: t("about.contactLabels.phone") },
    { ...contactInfo[2], title: t("about.contactLabels.socialMedia") },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_0.8fr]">
      <div className="grid gap-4">
        {translatedContactInfo.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="museum-card flex items-center gap-5 rounded-[2rem] p-6">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-museum-gold/10 text-museum-gold-light">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-museum-ivory">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-museum-muted">{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="museum-paper relative overflow-hidden rounded-[2rem] p-7">
        <div className="museum-pattern absolute inset-0 opacity-[0.08]" />
        <div className="relative">
          <h3 className="font-display text-3xl font-semibold text-museum-espresso">
            Heritage Reborn
          </h3>
          <p className="mt-3 text-sm leading-7 text-museum-espresso/75">
            Kết nối với đội ngũ để cùng góp ý, chia sẻ nguồn tư liệu hoặc mở rộng
            trải nghiệm bảo tồn di sản số.
          </p>
          <div className="mt-7 flex gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.url}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-museum-black text-museum-ivory transition hover:bg-museum-gold hover:text-museum-black"
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
