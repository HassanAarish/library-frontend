import { Link, useNavigate } from "react-router-dom";
import { LuBookOpen, LuLayoutDashboard, LuLogOut, LuUser } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Avatar, MenuItem, Popover } from "@/ui";

const UserMenu = () => {
  const { user, preferences, isAdmin, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Popover
      width="w-60"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={t("nav.account")}
          className="rounded-full ring-offset-2 ring-offset-canvas transition hover:ring-2 hover:ring-line-strong"
        >
          <Avatar src={preferences?.profilePicture?.url} name={user?.name} size="sm" />
        </button>
      )}
    >
      {({ close }) => (
        <div className="p-1.5">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {isAdmin ? (
            <MenuItem as={Link} to="/admin" onClick={close} icon={<LuLayoutDashboard />}>
              {t("nav.admin")}
            </MenuItem>
          ) : null}
          <MenuItem as={Link} to="/account" onClick={close} icon={<LuBookOpen />}>
            {t("nav.myLibrary")}
          </MenuItem>
          <MenuItem as={Link} to="/account/profile" onClick={close} icon={<LuUser />}>
            {t("nav.profile")}
          </MenuItem>
          <div className="my-1 h-px bg-line" />
          <MenuItem
            danger
            icon={<LuLogOut />}
            onClick={() => {
              close();
              signOut();
              navigate("/");
            }}
          >
            {t("nav.signOut")}
          </MenuItem>
        </div>
      )}
    </Popover>
  );
};

export default UserMenu;
