import { useEffect, useState } from "react";
import { watchSaves } from "./save-notice";

export function SaveBanner() {
  const [notice, setNotice] = useState<{ token: number; failed: boolean } | null>(null);

  useEffect(
    () =>
      watchSaves((result) => {
        setNotice({ token: Date.now(), failed: result === "failed" });
      }),
    [],
  );

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  if (!notice) return null;
  return (
    <p
      role="status"
      className={`pointer-events-none fixed right-4 bottom-4 z-50 rounded-full px-4 py-2 text-sm font-medium text-white ${notice.failed ? "bg-danger/80" : "bg-sage/80"}`}
    >
      {notice.failed ? "Saving failed" : "Saved"}
    </p>
  );
}
