import { Toaster } from "sonner";
import { MobileMaterialRequestView } from "../../features/site-material-request/components/MobileMaterialRequestView";

export function SiteMaterialRequestMobilePage() {
  return (
    <>
      <MobileMaterialRequestView standalone />
      <Toaster position="top-center" richColors />
    </>
  );
}
