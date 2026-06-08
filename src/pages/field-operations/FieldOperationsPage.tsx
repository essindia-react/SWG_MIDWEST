import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { ProjectsList } from "../../features/projects/components/ProjectsList";
import { FieldOperationsWorkspacePanel } from "../../features/field-operations/components/workspace/FieldOperationsWorkspacePanel";

export function FieldOperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project");

  const openProject = useCallback(
    (id: string) => {
      setSearchParams({ project: id });
    },
    [setSearchParams]
  );

  const closeProject = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative">
      <ProjectsList
        title="Field Operations"
        subtitle="Manage work orders, pick lists, field documents, and on-site activity timelines."
        showAddButton={false}
        showEditAction={false}
        onSelectProject={openProject}
      />
      {projectId && (
        <FieldOperationsWorkspacePanel projectId={projectId} onClose={closeProject} />
      )}
    </div>
  );
}
