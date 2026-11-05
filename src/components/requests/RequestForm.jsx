import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuBookCheck, LuSearch } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { bookRequests, categories } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDebouncedValue } from "@/hooks/useBooks";
import { useBookLookup } from "@/hooks/useCommunity";
import { fieldError } from "@/pages/Auth/forms";
import { BookCover, Button, Field, Input, Modal, Spinner, Textarea, cn } from "@/ui";

/**
 * Search-as-you-type over Open Library (signed-in): picking a result fills
 * title, author, ISBN and language. Keyboard: ↑/↓ to move, Enter to pick.
 */
const BookLookup = ({ onPick }) => {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const listId = useId();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = useDebouncedValue(text, 400);
  const { data = [], isFetching } = useBookLookup(query);
  const show = open && query.trim().length >= 3;

  const pick = (item) => {
    onPick(item);
    setText(item.title);
    setOpen(false);
  };

  if (!isAuthenticated)
    return <p className="text-sm text-fg-subtle">{t("requests.lookupSignIn")}</p>;

  return (
    <Field label={t("requests.lookupLabel")} hint={t("requests.lookupHint")}>
      <div className="relative">
        <Input
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={text}
          placeholder={t("requests.lookupPlaceholder")}
          startIcon={<LuSearch />}
          endSlot={isFetching ? <Spinner size="sm" className="me-2 text-fg-subtle" /> : null}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!show || !data.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % data.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i <= 0 ? data.length - 1 : i - 1));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(data[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {show ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-pop"
          >
            {!isFetching && data.length === 0 ? (
              <li className="px-4 py-3 text-sm text-fg-muted">{t("requests.lookupNone")}</li>
            ) : (
              data.map((item, i) => (
                <li
                  key={item.workKey ?? `${item.title}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2",
                    i === active ? "bg-sunken" : "hover:bg-sunken",
                  )}
                >
                  <BookCover
                    src={item.coverUrl}
                    title={item.title}
                    author={item.author}
                    size="xs"
                  />
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-sm font-medium text-fg">{item.title}</span>
                    <span className="line-clamp-1 text-xs text-fg-subtle">
                      {[item.author, item.publishedYear].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </Field>
  );
};

/**
 * "Request a book" dialog. The backend merges duplicates: the answer is a new
 * request, "added you to an existing one", or "it's already in the library".
 */
const RequestForm = ({ open, onClose }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inLibrary, setInLibrary] = useState(null);

  const send = useMutation({
    mutationFn: (values) => bookRequests.create(values),
    onSuccess: ({ data }) => {
      if (data.alreadyInLibrary) {
        setInLibrary(data.alreadyInLibrary);
        return;
      }
      toast.success(
        data.alreadyFollowing
          ? t("requests.alreadyFollowing")
          : data.joined
            ? t("requests.joined")
            : t("requests.created"),
      );
      queryClient.invalidateQueries({ queryKey: ["bookRequests"] });
      close();
      navigate(`/requests/${data.request._id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { title: "", author: "", isbn: "", language: "", note: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().required(t("requests.titleRequired")),
    }),
    onSubmit: (values) =>
      send.mutate(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]))),
  });

  function close() {
    formik.resetForm();
    setInLibrary(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={t("requests.formTitle")}
      description={t("requests.formDescription")}
      footer={
        inLibrary ? (
          <Button onClick={close} variant="secondary">
            {t("common.close")}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>
              {t("common.cancel")}
            </Button>
            <Button loading={send.isPending} onClick={formik.submitForm}>
              {t("requests.submit")}
            </Button>
          </>
        )
      }
    >
      {inLibrary ? (
        <div className="flex items-center gap-4">
          <BookCover
            src={inLibrary.coverImage?.url}
            title={inLibrary.title}
            author={inLibrary.author}
            size="sm"
          />
          <div>
            <p className="text-lg font-semibold">{t("requests.inLibraryTitle")}</p>
            <p className="mt-1 text-sm text-fg-muted">
              {t("requests.inLibraryBody", { title: inLibrary.title })}
            </p>
            <Button
              className="mt-3"
              size="sm"
              icon={<LuBookCheck aria-hidden />}
              to={`/books/${inLibrary._id}`}
              onClick={close}
            >
              {t("requests.viewBook")}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          <BookLookup
            onPick={(item) =>
              formik.setValues({
                ...formik.values,
                title: item.title ?? "",
                author: item.author ?? "",
                isbn: item.isbn ?? "",
                language: item.language ?? formik.values.language,
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("requests.bookTitle")}
              required
              error={fieldError(formik, "title")}
              className="sm:col-span-2"
            >
              <Input maxLength={200} {...formik.getFieldProps("title")} />
            </Field>
            <Field label={t("requests.author")}>
              <Input maxLength={120} {...formik.getFieldProps("author")} />
            </Field>
            <Field label={t("requests.isbn")}>
              <Input inputMode="numeric" maxLength={20} {...formik.getFieldProps("isbn")} />
            </Field>
            <Field label={t("requests.language")}>
              <Input
                maxLength={40}
                placeholder="English, Urdu…"
                {...formik.getFieldProps("language")}
              />
            </Field>
            <Field label={t("requests.note")} className="sm:col-span-2">
              <Textarea
                rows={2}
                maxLength={500}
                placeholder={t("requests.notePlaceholder")}
                {...formik.getFieldProps("note")}
              />
            </Field>
          </div>
          <button type="submit" hidden />
        </form>
      )}
    </Modal>
  );
};

export default RequestForm;

/** Small card on the requests page: suggest a new category. */
export const CategorySuggest = () => {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const send = useMutation({
    mutationFn: categories.suggest,
    onSuccess: () => {
      toast.success(t("requests.categorySent"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      formik.resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(2, t("requests.categoryNameRule"))
        .max(60, t("requests.categoryNameRule"))
        .required(t("requests.categoryNameRule")),
    }),
    onSubmit: (v) => send.mutate({ name: v.name.trim(), description: v.description.trim() }),
  });

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold">{t("requests.categoryTitle")}</h2>
      <p className="mt-1 text-sm text-fg-muted">{t("requests.categoryBody")}</p>
      {isAuthenticated ? (
        <form onSubmit={formik.handleSubmit} noValidate className="mt-4 space-y-3">
          <Field label={t("requests.categoryName")} error={fieldError(formik, "name")}>
            <Input
              maxLength={60}
              placeholder={t("requests.categoryNamePlaceholder")}
              {...formik.getFieldProps("name")}
            />
          </Field>
          <Field label={t("requests.categoryDescription")}>
            <Textarea rows={2} maxLength={500} {...formik.getFieldProps("description")} />
          </Field>
          <Button type="submit" variant="secondary" fullWidth loading={send.isPending}>
            {t("requests.categorySubmit")}
          </Button>
        </form>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          to="/login"
          state={{ from: { pathname: "/requests" } }}
        >
          {t("requests.signInToSuggest")}
        </Button>
      )}
    </section>
  );
};
