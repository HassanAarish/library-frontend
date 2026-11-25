import { Link, useLocation } from "react-router-dom";
import { LuBookCheck, LuHeart, LuUsers } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useFollowRequest } from "@/hooks/useCommunity";
import { Badge, Button, Card, cn } from "@/ui";

const STATUS_TONE = {
  open: "neutral",
  reviewing: "info",
  planned: "gold",
  fulfilled: "success",
  rejected: "danger",
  merged: "neutral",
  withdrawn: "neutral",
};

export const RequestStatus = ({ status }) => {
  const { t } = useI18n();
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {t(`requests.status.${status}`)}
    </Badge>
  );
};

/** "I want this too" / "Following" toggle (sign-in link for visitors). */
export const FollowButton = ({ request, size = "sm", className }) => {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const follow = useFollowRequest();
  const open = ["open", "reviewing", "planned"].includes(request.status);

  if (!open) return null;
  if (!isAuthenticated) {
    return (
      <Button
        size={size}
        variant="secondary"
        to="/login"
        state={{ from: location }}
        className={className}
      >
        {t("requests.signInToFollow")}
      </Button>
    );
  }
  return (
    <Button
      size={size}
      variant={request.following ? "subtle" : "secondary"}
      icon={<LuHeart className={cn(request.following && "fill-current")} aria-hidden />}
      loading={follow.isPending}
      aria-pressed={Boolean(request.following)}
      title={request.following ? t("requests.unfollow") : undefined}
      onClick={() => follow.mutate({ request, follow: !request.following })}
      className={className}
    >
      {request.following ? t("requests.following") : t("requests.follow")}
    </Button>
  );
};

/** One request in a list: title, status, how many want it, latest admin note. */
const RequestCard = ({ request }) => {
  const { t } = useI18n();
  return (
    <Card padded={false} className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/requests/${request._id}`}
            className="line-clamp-2 font-serif text-lg font-semibold hover:text-brand"
          >
            {request.title}
          </Link>
          {request.author ? (
            <p className="truncate text-sm text-fg-muted">{request.author}</p>
          ) : null}
        </div>
        <RequestStatus status={request.status} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-fg-subtle">
        <LuUsers aria-hidden /> {t("requests.wanted", { count: request.followerCount })}
      </p>
      {request.statusNote ? (
        <p className="mt-3 line-clamp-2 rounded-lg bg-sunken px-3 py-2 text-sm text-fg-muted">
          {request.statusNote}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {request.status === "fulfilled" && request.book?._id ? (
          <Button size="sm" icon={<LuBookCheck aria-hidden />} to={`/books/${request.book._id}`}>
            {t("requests.viewBook")}
          </Button>
        ) : (
          <FollowButton request={request} />
        )}
      </div>
    </Card>
  );
};

export default RequestCard;
