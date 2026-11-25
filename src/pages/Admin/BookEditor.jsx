import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuArrowLeft, LuExternalLink, LuFileText, LuImagePlus, LuSparkles } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { admin, files, lookup } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction } from "@/hooks/useAdmin";
import BookLookup from "@/components/books/BookLookup";
import { AdminPage } from "@/components/admin/AdminTable";
import { BookStatusBadge } from "@/components/admin/badges";
import { fieldError } from "@/pages/Auth/forms";
import {
  Alert,
  BookCover,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  Input,
  Select,
  Skeleton,
  Spinner,
  Textarea,
} from "@/ui";

const EMPTY = {
  title: "",
  author: "",
  description: "",
  categoryId: "",
  language: "English",
  isbn: "",
  publishedYear: "",
  price: "300",
  rentalDays: "14",
};

/** A file picker button that uploads straight away (with progress). */
const UploadButton = ({ accept, label, onFile, busy, progress, t }) => {
  const ref = useRef(null);
  return (
    <>
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? (
          <>
            <Spinner size="sm" /> {t("admin.booksPage.uploading", { percent: progress ?? 0 })}
          </>
        ) : (
          label
        )}
      </Button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
};

/**
 * /admin/books/new and /admin/books/:bookId. Open Library fills the details
 * (and can copy its cover); the PDF and cover are uploaded as the admin's
 * private/public assets; then save as draft or publish.
 */
const BookEditor = () => {
  const { bookId } = useParams();
  const isNew = !bookId;
  const { t, price } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useDocumentTitle(isNew ? t("admin.booksPage.newTitle") : t("admin.booksPage.editTitle"));

  const existing = useQuery({
    queryKey: qk.admin("book", bookId),
    queryFn: () => admin.book(bookId),
    enabled: !isNew,
  });
  const categories = useQuery({
    queryKey: qk.admin("categories", { status: "approved", limit: 100 }),
    queryFn: () => admin.categories({ status: "approved", limit: 100 }),
    select: (d) => d?.results ?? [],
  });

  const [pdf, setPdf] = useState(null); // { public_id, name, pages }
  const [cover, setCover] = useState(null); // { public_id, url }
  const [olCoverId, setOlCoverId] = useState(null);
  const [filled, setFilled] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const book = existing.data;
  const currentPdf = pdf ?? (book?.file ? { ...book.file } : null);
  const currentCover = cover ?? (book?.coverImage?.public_id ? book.coverImage : null);

  const uploadPdf = useMutation({
    mutationFn: (file) => admin.uploadBookFile(file, { onProgress: setPdfProgress }),
    onSuccess: setPdf,
    onError: (err) => toast.error(err.message),
  });
  const uploadCover = useMutation({
    mutationFn: (file) => files.uploadImages([file]).then(([c]) => c),
    onSuccess: setCover,
    onError: (err) => toast.error(err.message),
  });
  const importCover = useMutation({
    mutationFn: () => lookup.importCover(olCoverId),
    onSuccess: (c) => {
      setCover(c);
      toast.success(t("admin.booksPage.coverImported"));
    },
    onError: (err) => toast.error(err.message),
  });

  const save = useMutation({
    mutationFn: ({ values, status }) => {
      const body = {
        title: values.title.trim(),
        author: values.author.trim(),
        description: values.description.trim(),
        categoryId: values.categoryId,
        language: values.language.trim(),
        isbn: values.isbn.trim(),
        publishedYear: values.publishedYear,
        price: values.price,
        rentalDays: values.rentalDays,
        file: currentPdf ? { public_id: currentPdf.public_id } : undefined,
        coverImage: currentCover ? { public_id: currentCover.public_id } : undefined,
      };
      return isNew ? admin.createBook({ ...body, status }) : admin.updateBook(bookId, body);
    },
    onSuccess: ({ data }) => {
      toast.success(t("admin.booksPage.saved"));
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (isNew) navigate(`/admin/books/${data._id}`, { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const setStatus = useAdminAction((status) => admin.setBookStatus(bookId, status), {
    alsoInvalidate: [["books"]],
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: book
      ? {
          title: book.title ?? "",
          author: book.author ?? "",
          description: book.description ?? "",
          categoryId: book.category?._id ?? "",
          language: book.language ?? "",
          isbn: book.isbn ?? "",
          publishedYear: book.publishedYear ? String(book.publishedYear) : "",
          price: String(book.price ?? ""),
          rentalDays: String(book.rentalDays ?? 14),
        }
      : EMPTY,
    validationSchema: Yup.object({
      title: Yup.string().trim().required(t("admin.booksPage.required")),
      author: Yup.string().trim().required(t("admin.booksPage.required")),
      description: Yup.string().trim().required(t("admin.booksPage.required")),
      categoryId: Yup.string().required(t("admin.booksPage.required")),
      price: Yup.number()
        .typeError(t("admin.booksPage.required"))
        .integer()
        .min(0)
        .required(t("admin.booksPage.required")),
      rentalDays: Yup.number()
        .typeError(t("admin.booksPage.required"))
        .integer()
        .min(1)
        .max(90)
        .required(),
    }),
    onSubmit: () => {},
  });

  const submit = async (status) => {
    const errors = await formik.validateForm();
    formik.setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(errors).length) return;
    if (!currentPdf || !currentCover) return toast.error(t("admin.booksPage.needFiles"));
    save.mutate({ values: formik.values, status });
  };

  const fillFrom = async (item) => {
    formik.setValues({
      ...formik.values,
      title: item.title ?? formik.values.title,
      author: item.author ?? formik.values.author,
      isbn: item.isbn ?? formik.values.isbn,
      language: item.language ?? formik.values.language,
      publishedYear: item.publishedYear ? String(item.publishedYear) : formik.values.publishedYear,
    });
    setOlCoverId(item.coverId ?? null);
    setFilled(true);
    if (item.workKey) {
      try {
        const work = await lookup.work(item.workKey);
        if (work?.description) formik.setFieldValue("description", work.description);
        if (!item.coverId && work?.coverId) setOlCoverId(work.coverId);
      } catch {
        // description is optional; the admin can write one
      }
    }
  };

  if (!isNew && existing.isLoading) {
    return (
      <AdminPage title={t("admin.booksPage.editTitle")}>
        <Skeleton className="h-96 w-full" rounded="rounded-card" />
      </AdminPage>
    );
  }
  if (!isNew && existing.isError) {
    return (
      <AdminPage title={t("admin.booksPage.editTitle")}>
        <ErrorState error={existing.error} onRetry={existing.refetch} />
      </AdminPage>
    );
  }

  const busy = save.isPending || uploadPdf.isPending || uploadCover.isPending;

  return (
    <AdminPage
      title={isNew ? t("admin.booksPage.newTitle") : book.title}
      description={isNew ? t("admin.booksPage.newDescription") : undefined}
      actions={
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
        >
          <LuArrowLeft className="rtl:rotate-180" aria-hidden /> {t("admin.books")}
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {isNew ? (
            <Card>
              <BookLookup
                onPick={fillFrom}
                label={t("admin.booksPage.lookup")}
                placeholder={t("admin.booksPage.lookupPlaceholder")}
                hint={t("requests.lookupHint")}
              />
              {filled ? (
                <Alert tone="success" className="mt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <LuSparkles aria-hidden /> {t("admin.booksPage.lookupFilled")}
                  </span>
                </Alert>
              ) : null}
            </Card>
          ) : null}

          <Card as="section">
            <CardHeader title={t("admin.booksPage.details")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("admin.booksPage.titleLabel")}
                required
                error={fieldError(formik, "title")}
                className="sm:col-span-2"
              >
                <Input maxLength={200} {...formik.getFieldProps("title")} />
              </Field>
              <Field
                label={t("admin.booksPage.authorLabel")}
                required
                error={fieldError(formik, "author")}
              >
                <Input maxLength={120} {...formik.getFieldProps("author")} />
              </Field>
              <Field
                label={t("admin.booksPage.category")}
                required
                error={fieldError(formik, "categoryId")}
              >
                <Select {...formik.getFieldProps("categoryId")}>
                  <option value="">{t("admin.booksPage.chooseCategory")}</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={t("admin.booksPage.descriptionLabel")}
                required
                error={fieldError(formik, "description")}
                className="sm:col-span-2"
              >
                <Textarea rows={6} maxLength={5000} {...formik.getFieldProps("description")} />
              </Field>
              <Field label={t("admin.booksPage.language")}>
                <Input maxLength={40} {...formik.getFieldProps("language")} />
              </Field>
              <Field label={t("admin.booksPage.isbn")}>
                <Input maxLength={20} inputMode="numeric" {...formik.getFieldProps("isbn")} />
              </Field>
              <Field label={t("admin.booksPage.year")}>
                <Input
                  type="number"
                  min={0}
                  max={new Date().getFullYear() + 1}
                  {...formik.getFieldProps("publishedYear")}
                />
              </Field>
            </div>
          </Card>

          <Card as="section">
            <CardHeader title={t("admin.booksPage.pricing")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("admin.booksPage.priceLabel")}
                hint={t("admin.booksPage.priceHint")}
                error={fieldError(formik, "price")}
              >
                <Input type="number" min={0} step={1} {...formik.getFieldProps("price")} />
              </Field>
              <Field
                label={t("admin.booksPage.daysLabel")}
                error={fieldError(formik, "rentalDays")}
              >
                <Input type="number" min={1} max={90} {...formik.getFieldProps("rentalDays")} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card as="section">
            <CardHeader title={t("admin.booksPage.files")} />
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium">{t("admin.booksPage.cover")}</p>
                <div className="flex items-start gap-4">
                  <BookCover
                    src={currentCover?.url}
                    title={formik.values.title || "?"}
                    author={formik.values.author}
                    size="sm"
                  />
                  <div className="flex flex-col items-start gap-2">
                    <UploadButton
                      t={t}
                      accept="image/jpeg,image/png,image/webp"
                      label={
                        <>
                          <LuImagePlus aria-hidden /> {t("admin.booksPage.uploadCover")}
                        </>
                      }
                      onFile={(f) => uploadCover.mutate(f)}
                      busy={uploadCover.isPending}
                    />
                    {olCoverId ? (
                      <Button
                        variant="link"
                        size="sm"
                        loading={importCover.isPending}
                        onClick={() => importCover.mutate()}
                      >
                        {t("admin.booksPage.useOlCover")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium">{t("admin.booksPage.pdf")}</p>
                <p className="mb-2 text-xs text-fg-subtle">{t("admin.booksPage.pdfHint")}</p>
                {currentPdf ? (
                  <p className="mb-2 flex items-center gap-2 rounded-lg bg-sunken px-3 py-2 text-sm">
                    <LuFileText className="shrink-0 text-fg-subtle" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{currentPdf.name}</span>
                    {currentPdf.pages ? (
                      <span className="shrink-0 text-xs text-fg-subtle">
                        {t("admin.booksPage.pdfPages", { count: currentPdf.pages })}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                <UploadButton
                  t={t}
                  accept="application/pdf"
                  label={
                    currentPdf ? t("admin.booksPage.replacePdf") : t("admin.booksPage.uploadPdf")
                  }
                  onFile={(f) => {
                    setPdfProgress(0);
                    uploadPdf.mutate(f);
                  }}
                  busy={uploadPdf.isPending}
                  progress={pdfProgress}
                />
              </div>
            </div>
          </Card>

          <Card as="section">
            {!isNew ? (
              <div className="mb-4 flex items-center justify-between gap-2">
                <BookStatusBadge status={book.status} />
                <span className="font-serif text-lg font-semibold">
                  {book.price === 0 ? t("catalog.free") : price(book.price)}
                </span>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              {isNew ? (
                <>
                  <Button
                    fullWidth
                    loading={save.isPending && save.variables?.status === "published"}
                    disabled={busy}
                    onClick={() => submit("published")}
                  >
                    {t("admin.booksPage.publish")}
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    loading={save.isPending && save.variables?.status === "draft"}
                    disabled={busy}
                    onClick={() => submit("draft")}
                  >
                    {t("admin.booksPage.saveDraft")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    fullWidth
                    loading={save.isPending}
                    disabled={busy}
                    onClick={() => submit()}
                  >
                    {t("admin.booksPage.saveChanges")}
                  </Button>
                  {book.status === "published" ? (
                    <>
                      <Button
                        fullWidth
                        variant="secondary"
                        loading={setStatus.isPending && setStatus.variables === "draft"}
                        onClick={() => setStatus.mutate("draft")}
                      >
                        {t("admin.booksPage.unpublish")}
                      </Button>
                      <Button
                        fullWidth
                        variant="ghost"
                        loading={setStatus.isPending && setStatus.variables === "archived"}
                        onClick={() => setStatus.mutate("archived")}
                      >
                        {t("admin.booksPage.archive")}
                      </Button>
                      <Button
                        fullWidth
                        variant="link"
                        to={`/books/${book._id}`}
                        iconEnd={<LuExternalLink aria-hidden />}
                      >
                        {t("admin.booksPage.viewInCatalogue")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      variant="secondary"
                      loading={setStatus.isPending}
                      onClick={() => setStatus.mutate("published")}
                    >
                      {book.status === "archived"
                        ? t("admin.booksPage.restore")
                        : t("admin.booksPage.publish")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
};

export default BookEditor;
