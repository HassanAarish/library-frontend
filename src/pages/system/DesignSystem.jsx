import { useState } from "react";
import { toast } from "react-toastify";
import { LuPlus, LuSearch } from "react-icons/lu";
import {
  Alert,
  Avatar,
  Badge,
  BookCover,
  Button,
  Card,
  CardHeader,
  Container,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Textarea,
} from "@/ui";

/** Dev-only gallery of the design system (route /dev/design). Not shipped. */
const DesignSystem = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(2);

  return (
    <Container className="space-y-10 py-12">
      <PageHeader
        eyebrow="Internal"
        title="Design system"
        description="Every UI building block, in both themes."
      />

      <Card>
        <CardHeader title="Buttons" />
        <div className="flex flex-wrap gap-3">
          <Button icon={<LuPlus />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button loading>Saving</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Form fields" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email" required hint="We'll send a 6-digit code.">
            <Input type="email" placeholder="you@example.pk" />
          </Field>
          <Field label="Transaction ID" error="Please enter the Transaction ID exactly as shown.">
            <Input defaultValue="12ab" />
          </Field>
          <Field label="Search">
            <Input startIcon={<LuSearch />} placeholder="Title or author" />
          </Field>
          <Field label="Sort">
            <Select defaultValue="newest">
              <option value="newest">Newest</option>
              <option value="title">Title</option>
            </Select>
          </Field>
          <Field label="Note" className="md:col-span-2">
            <Textarea placeholder="Anything the admin should know?" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Badges, avatars, covers" />
        <div className="flex flex-wrap items-center gap-2">
          {["neutral", "brand", "gold", "success", "warning", "danger", "info"].map((tone) => (
            <Badge key={tone} tone={tone} dot>
              {tone}
            </Badge>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Avatar name="Ayesha Khan" size="sm" />
          <Avatar name="Bilal" />
          <Avatar name="Sana Mir" size="lg" />
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <BookCover title="Raja Gidh" author="Bano Qudsia" size="sm" />
          <BookCover title="The Alchemist" author="Paulo Coelho" size="md" />
          <BookCover title="Atomic Habits" author="James Clear" size="lg" />
          <BookCover
            src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
            title="Atomic Habits"
            size="md"
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Feedback" />
        <div className="space-y-4">
          <Alert tone="info" title="Payment under review">
            We'll confirm it within a few hours.
          </Alert>
          <Alert tone="success" title="Rental confirmed" />
          <Alert tone="warning" title="Your hold expires in 12 minutes" />
          <Alert tone="danger" title="Payment not confirmed">
            The Transaction ID didn't match.
          </Alert>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <ErrorState
            error={{ message: "Can't reach the server.", requestId: "1a2b3c" }}
            onRetry={() => {}}
          />
          <EmptyState
            title="No rentals yet"
            description="Books you rent will appear here."
            action={<Button>Browse books</Button>}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => toast.success("Saved")}>
              Toast
            </Button>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Open modal
            </Button>
          </div>
          <Pagination page={page} totalPages={5} onChange={setPage} />
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        description="Your package credit will be returned."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Cancel booking
            </Button>
          </>
        }
      >
        <p className="text-fg-muted">You can book it again any time it's free.</p>
      </Modal>
    </Container>
  );
};

export default DesignSystem;
