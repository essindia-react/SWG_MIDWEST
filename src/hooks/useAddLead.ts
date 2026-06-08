import { useOutletContext } from "react-router";

interface AppLayoutContext {
  openAddLead: () => void;
}

export function useAddLead() {
  return useOutletContext<AppLayoutContext>();
}
