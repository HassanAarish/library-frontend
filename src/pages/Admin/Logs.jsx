import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { admin } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDebouncedValue, useDocumentTitle } from "@/hooks/useBooks";
import { useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { Badge, DetailList, Drawer, Field, Input, Segmented, Select } from "@/ui";

const SEVERITY_TONE = { info: "neutral", warning: "warning", critical: "danger" };
const statusTone = (code) => (code >= 500 ? "danger" : code >= 400 ? "warning" : "success");

// Date inputs give local days; the API wants ISO times (end of the "to" day).
const toIso = (day, end) =>
  day ? new Date(`${day}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : undefined;

const LogPanel = ({ log, kind, onClose }) => {
  const { t, dateTime } = useI18n();
  const items =
    kind === "audit"
      ? [
          [t("admin.logsPage.action"), <span className="font-mono">{log.action}</span>],
          [
            t("admin.logsPage.who"),
            log.actor
              ? `${log.actor.name} · ${log.actor.email}`
              : log.actorEmail || t("admin.logsPage.system"),
          ],
          [t("admin.logsPage.severity"), log.severity],
          [t("admin.logsPage.outcome"), log.outcome],
          [t("admin.logsPage.ip"), log.ip],
          [t("admin.logsPage.when"), dateTime(log.createdAt)],
          [
            t("admin.logsPage.requestId"),
            <span className="font-mono text-xs">{log.requestId}</span>,
          ],
          ["Target", log.target?.type ? `${log.target.type} ${log.target.id ?? ""}` : null],
        ]
      : [
          [t("admin.logsPage.method"), log.method],
          [
            t("admin.logsPage.path"),
            <span className="font-mono text-xs break-all">{log.path}</span>,
          ],
          [t("admin.logsPage.statusCode"), String(log.status)],
          [t("admin.logsPage.time"), log.durationMs != null ? `${log.durationMs} ms` : null],
          [t("admin.logsPage.who"), log.user ? `${log.user.name} · ${log.user.email}` : null],
          [t("admin.logsPage.ip"), log.ip],
          ["User agent", log.userAgent],
          [t("admin.logsPage.when"), dateTime(log.createdAt)],
          [
            t("admin.logsPage.requestId"),
            <span className="font-mono text-xs">{log.requestId}</span>,
          ],
        ];
  const extra = kind === "audit" ? log.metadata : log.error ? { error: log.error } : null;
  return (
    <Drawer
      open
      onClose={onClose}
      title={kind === "audit" ? log.action : `${log.method} ${log.status}`}
    >
      <DetailList items={items} />
      {extra && Object.keys(extra).length ? (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold">{t("admin.logsPage.metadata")}</h3>
          <pre className="overflow-x-auto rounded-lg bg-sunken p-3 text-xs">
            {JSON.stringify(extra, null, 2)}
          </pre>
        </section>
      ) : null}
    </Drawer>
  );
};

/** /admin/logs: the audit trail (sensitive actions) and the raw request log. */
const Logs = () => {
  const { t, dateTime } = useI18n();
  useDocumentTitle(t("admin.logs"));
  const [kind, setKind] = useState("audit");
  const audit = useAdminList("auditLogs", admin.auditLogs, {}, { limit: 30 });
  const requests = useAdminList("requestLogs", admin.requestLogs, {}, { limit: 30 });
  const list = kind === "audit" ? audit : requests;
  const [draft, setDraft] = useState("");
  const search = useDebouncedValue(draft);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    list.set({ search, from: toIso(from), to: toIso(to, true) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-query when a filter settles
  }, [search, from, to, kind]);

  const auditColumns = [
    {
      key: "action",
      header: t("admin.logsPage.action"),
      primary: true,
      cell: (l) => <span className="font-mono text-xs font-medium">{l.action}</span>,
    },
    {
      key: "who",
      header: t("admin.logsPage.who"),
      cell: (l) => (
        <Cell
          title={l.actor?.name ?? (l.actorEmail || t("admin.logsPage.system"))}
          sub={l.actor?.email}
        />
      ),
    },
    {
      key: "sev",
      header: t("admin.logsPage.severity"),
      cell: (l) => <Badge tone={SEVERITY_TONE[l.severity]}>{l.severity}</Badge>,
    },
    {
      key: "outcome",
      header: t("admin.logsPage.outcome"),
      cell: (l) => <Badge tone={l.outcome === "failure" ? "danger" : "success"}>{l.outcome}</Badge>,
    },
    {
      key: "ip",
      header: t("admin.logsPage.ip"),
      cell: (l) => <span className="font-mono text-xs">{l.ip}</span>,
    },
    {
      key: "when",
      header: t("admin.logsPage.when"),
      cell: (l) => <span className="whitespace-nowrap text-fg-muted">{dateTime(l.createdAt)}</span>,
    },
  ];
  const requestColumns = [
    {
      key: "path",
      header: t("admin.logsPage.path"),
      primary: true,
      cell: (l) => (
        <span className="font-mono text-xs">
          <b>{l.method}</b> {l.path}
        </span>
      ),
    },
    {
      key: "status",
      header: t("admin.logsPage.statusCode"),
      cell: (l) => <Badge tone={statusTone(l.status)}>{l.status}</Badge>,
    },
    {
      key: "time",
      header: t("admin.logsPage.time"),
      cell: (l) => (l.durationMs != null ? `${l.durationMs} ms` : "—"),
    },
    { key: "who", header: t("admin.logsPage.who"), cell: (l) => l.user?.email ?? "—" },
    {
      key: "ip",
      header: t("admin.logsPage.ip"),
      cell: (l) => <span className="font-mono text-xs">{l.ip}</span>,
    },
    {
      key: "when",
      header: t("admin.logsPage.when"),
      cell: (l) => <span className="whitespace-nowrap text-fg-muted">{dateTime(l.createdAt)}</span>,
    },
  ];

  return (
    <AdminPage title={t("admin.logs")} description={t("admin.logsPage.description")}>
      <AdminFilters>
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            ["audit", t("admin.logsPage.audit")],
            ["requests", t("admin.logsPage.requests")],
          ]}
        />
        <div className="sm:w-64">
          <Input
            type="search"
            aria-label={t("admin.common.search")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              kind === "audit"
                ? t("admin.logsPage.searchAudit")
                : t("admin.logsPage.searchRequests")
            }
            startIcon={<LuSearch />}
          />
        </div>
        <div className="flex gap-2">
          <Field label={t("admin.logsPage.from")} className="w-40">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label={t("admin.logsPage.to")} className="w-40">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        {kind === "audit" ? (
          <Field label={t("admin.logsPage.severity")} className="sm:w-40">
            <Select
              value={audit.params.severity ?? ""}
              onChange={(e) => audit.set({ severity: e.target.value || undefined })}
            >
              <option value="">{t("admin.common.all")}</option>
              <option value="critical">critical</option>
              <option value="warning">warning</option>
              <option value="info">info</option>
            </Select>
          </Field>
        ) : null}
      </AdminFilters>

      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        onRowClick={setOpen}
        empty={t("admin.common.empty")}
        columns={kind === "audit" ? auditColumns : requestColumns}
      />
      {open ? <LogPanel log={open} kind={kind} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Logs;
