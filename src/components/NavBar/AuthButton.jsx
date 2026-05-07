import { LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/common/ui/Button";

const AuthButton = () => {
  const { t } = useTranslation();
  return (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">
          <LogIn size={18} />
          <span>{t("auth.login")}</span>
        </Button>
      </Link>
      <Link to="/register">
        <Button size="sm">
          <UserPlus size={18} />
          <span>{t("auth.register")}</span>
        </Button>
      </Link>
    </>
  );
};

export default AuthButton;
