import { LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/common/ui/Button";

const AuthButton = () => {
  const { t } = useTranslation();
  return (
    <>
      <Link to="/login">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full whitespace-nowrap text-museum-ivory hover:bg-museum-ivory/10 hover:text-museum-gold-light"
        >
          <LogIn size={18} className="shrink-0" />
          <span className="whitespace-nowrap">{t("auth.login")}</span>
        </Button>
      </Link>
      {/* <Link to="/register">
        <Button
          size="sm"
          className="rounded-full bg-museum-gold px-4 text-museum-black shadow-museum-gold hover:bg-museum-gold-light"
        >
          <UserPlus size={18} />
          <span>{t("auth.register")}</span>
        </Button>
      </Link> */}
    </>
  );
};

export default AuthButton;
