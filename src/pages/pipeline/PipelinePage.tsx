import { useNavigate } from "react-router";
import { PipelineBoard } from "../../features/leads/components/PipelineBoard";
import { ROUTES } from "../../routes/paths";

export function PipelinePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <PipelineBoard onAddLead={() => navigate(`${ROUTES.leads}?create=true`)} />
    </div>
  );
}
