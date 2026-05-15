import { Facebook, Linkedin } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { teamMembers } from "./data/teamMembersData";

const MotionArticle = motion.article;

const TeamMembers = () => {
  const { t } = useTranslation();

  const translatedMembers = [
    { ...teamMembers[0], role: t("about.teamRoles.founderLeader"), bio: t("about.teamBios.bio1") },
    { ...teamMembers[1], role: t("about.teamRoles.backendDev"), bio: t("about.teamBios.bio2") },
    { ...teamMembers[2], role: t("about.teamRoles.fullstackDev"), bio: t("about.teamBios.bio3") },
  ];

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      {translatedMembers.map((member, index) => (
        <MotionArticle
          key={member.name}
          className="museum-card group overflow-hidden rounded-[2rem]"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.55, delay: index * 0.08 }}
        >
          <div className="relative aspect-[4/4.8] overflow-hidden">
            <img
              src={member.img || "https://placehold.co/600x700"}
              alt={member.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.08]"
              loading="lazy"
              width="480"
              height="580"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-museum-black via-museum-black/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="mb-4 text-sm leading-6 text-museum-parchment/90 opacity-0 transition group-hover:opacity-100">
                {member.bio}
              </p>
              <div className="flex gap-3">
                <Link
                  to={member.social.facebook}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-museum-gold/25 bg-museum-black/60 text-museum-ivory backdrop-blur transition hover:bg-museum-gold hover:text-museum-black"
                  aria-label={`Facebook ${member.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={18} />
                </Link>
                <Link
                  to={member.social.linkedin}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-museum-gold/25 bg-museum-black/60 text-museum-ivory backdrop-blur transition hover:bg-museum-gold hover:text-museum-black"
                  aria-label={`LinkedIn ${member.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={18} />
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-display text-2xl font-semibold text-museum-ivory">
              {member.name}
            </h3>
            <p className="mt-1 text-sm font-semibold uppercase text-museum-gold-light">
              {member.role}
            </p>
          </div>
        </MotionArticle>
      ))}
    </div>
  );
};

export default TeamMembers;
