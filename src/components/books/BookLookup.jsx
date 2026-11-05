import { useId, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDebouncedValue } from "@/hooks/useBooks";
import { useBookLookup } from "@/hooks/useCommunity";
import { BookCover, Field, Input, Spinner, cn } from "@/ui";

/**
 * Search-as-you-type over Open Library (signed in): picking a result calls
 * onPick({ workKey, title, author, isbn, language, publishedYear, coverId, … }).
 * Keyboard: ↑/↓ to move, Enter to pick, Escape to close. Used by the reader's
 * request form and the admin's Add book form.
 */
const BookLookup = ({ onPick, label, hint, placeholder }) => {
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

  if (!isAuthenticated) {
    return <p className="text-sm text-fg-subtle">{t("requests.lookupSignIn")}</p>;
  }

  return (
    <Field label={label ?? t("requests.lookupLabel")} hint={hint ?? t("requests.lookupHint")}>
      <div className="relative">
        <Input
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={text}
          placeholder={placeholder ?? t("requests.lookupPlaceholder")}
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

export default BookLookup;
