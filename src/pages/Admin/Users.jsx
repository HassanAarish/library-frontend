import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LuSearch } from "react-icons/lu";
import { admin } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDebouncedValue, useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction, useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { Alert, Avatar, Badge, Button, DetailList, Drawer, Input, Segmented, Skeleton } from "@/ui";

const PROVIDER = { email: "Email", google: "Google", facebook: "Facebook" };

const UserPanel = ({ userId, onClose }) => {
  const { t, date } = useI18n();
  const detail = useQuery({
    queryKey: qk.admin("user", userId),
    queryFn: () => admin.user(userId),
  });
  const [confirming, setConfirming] = useState(false);
  const toggle = useAdminAction(() => admin.toggleBlock(userId), {
    onSuccess: () => setConfirming(false),
  });
  const u = detail.data;
  const isAdminUser = u?.role === "admin";

  return (
    <Drawer
      open
      onClose={onClose}
      title={u?.name ?? "…"}
      description={u?.email}
      footer={
        u && !isAdminUser ? (
          u.isBlocked ? (
            <Button loading={toggle.isPending} onClick={() => toggle.mutate()}>
              {t("admin.usersPage.unblock")}
            </Button>
          ) : confirming ? (
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" loading={toggle.isPending} onClick={() => toggle.mutate()}>
                {t("admin.usersPage.block")}
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              {t("admin.usersPage.block")}
            </Button>
          )
        ) : null
      }
    >
      {!u ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={u.profile?.profilePicture?.url} name={u.name} size="lg" />
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={isAdminUser ? "gold" : "brand"}>
                {isAdminUser ? t("admin.usersPage.adminRole") : t("admin.usersPage.reader")}
              </Badge>
              <Badge tone={u.isBlocked ? "danger" : "success"} dot>
                {u.isBlocked ? t("admin.usersPage.blocked") : t("admin.usersPage.active")}
              </Badge>
              <Badge tone={u.isVerified ? "success" : "warning"}>
                {u.isVerified ? t("admin.usersPage.verified") : t("admin.usersPage.unverified")}
              </Badge>
            </div>
          </div>
          {confirming ? (
            <Alert tone="danger">{t("admin.usersPage.blockConfirm", { name: u.name })}</Alert>
          ) : null}
          <DetailList
            items={[
              [t("admin.usersPage.signIn"), PROVIDER[u.authType] ?? u.authType],
              [t("admin.usersPage.joined"), date(u.createdAt)],
              [t("admin.usersPage.rentals"), String(u.stats?.totalRentals ?? 0)],
              [t("admin.usersPage.phone"), u.profile?.phoneNumber],
              [t("profile.altEmail"), u.profile?.alternativeEmail],
              ["2FA", u.twoFactor?.enabled ? t("admin.common.yes") : t("admin.common.no")],
            ]}
          />
        </div>
      )}
    </Drawer>
  );
};

/** /admin/users */
const Users = () => {
  const { t, date } = useI18n();
  useDocumentTitle(t("admin.users"));
  const list = useAdminList("users", admin.users);
  const [draft, setDraft] = useState("");
  const search = useDebouncedValue(draft);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (search !== (list.params.search ?? "")) list.set({ search });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when typing settles
  }, [search]);

  const filter = list.params.isBlocked === "true" ? "blocked" : (list.params.role ?? "");

  return (
    <AdminPage title={t("admin.users")} description={t("admin.usersPage.description")}>
      <AdminFilters>
        <Segmented
          label={t("admin.usersPage.role")}
          value={filter}
          onChange={(v) =>
            list.set({
              role: ["user", "admin"].includes(v) ? v : undefined,
              isBlocked: v === "blocked" ? "true" : undefined,
            })
          }
          options={[
            ["", t("admin.common.all")],
            ["user", t("admin.usersPage.reader")],
            ["admin", t("admin.usersPage.adminRole")],
            ["blocked", t("admin.usersPage.blocked")],
          ]}
        />
        <div className="sm:ms-auto sm:w-72">
          <Input
            type="search"
            aria-label={t("admin.common.search")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("admin.usersPage.searchPlaceholder")}
            startIcon={<LuSearch />}
          />
        </div>
      </AdminFilters>
      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        onRowClick={(u) => setOpen(u._id)}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "name",
            header: t("admin.common.user"),
            primary: true,
            cell: (u) => (
              <div className="flex items-center gap-3">
                <Avatar name={u.name} size="sm" />
                <Cell title={u.name} sub={u.email} />
              </div>
            ),
          },
          {
            key: "via",
            header: t("admin.usersPage.signIn"),
            cell: (u) => PROVIDER[u.authType] ?? u.authType,
          },
          {
            key: "role",
            header: t("admin.usersPage.role"),
            cell: (u) =>
              u.role === "admin" ? t("admin.usersPage.adminRole") : t("admin.usersPage.reader"),
          },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (u) => (
              <Badge tone={u.isBlocked ? "danger" : u.isVerified ? "success" : "warning"} dot>
                {u.isBlocked
                  ? t("admin.usersPage.blocked")
                  : u.isVerified
                    ? t("admin.usersPage.active")
                    : t("admin.usersPage.unverified")}
              </Badge>
            ),
          },
          {
            key: "joined",
            header: t("admin.usersPage.joined"),
            cell: (u) => <span className="text-fg-muted">{date(u.createdAt)}</span>,
          },
        ]}
      />
      {open ? <UserPanel key={open} userId={open} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Users;
