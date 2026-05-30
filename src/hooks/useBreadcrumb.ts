import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pushBreadcrumb } from "@/lib/breadcrumbs";

/** Records the current route on every navigation. */
export function useRouteBreadcrumb() {
  const location = useLocation();
  useEffect(() => {
    pushBreadcrumb("route", location.pathname + location.search);
  }, [location.pathname, location.search]);
}

/** Records a UI section mount (e.g. "Pulse:Map", "Social:Feed"). */
export function useSectionBreadcrumb(label: string) {
  useEffect(() => {
    pushBreadcrumb("section", label);
  }, [label]);
}