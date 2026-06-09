import { Toaster } from "sonner";
import { MobileTaskManagementView } from "../../features/tasks/components/MobileTaskManagementView";

export function TasksMobilePage() {
  return (
    <>
      <MobileTaskManagementView standalone />
      <Toaster position="top-center" richColors />
    </>
  );
}
