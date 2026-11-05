import { Spinner } from "@/ui";

/** Shown while a saved session is being restored. */
const FullPageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center text-brand">
    <Spinner size="lg" label="Loading" />
  </div>
);

export default FullPageLoader;
