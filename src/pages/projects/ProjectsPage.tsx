import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { ProjectsList } from "../../features/projects/components/ProjectsList";
import { ProjectWorkspacePanel } from "../../features/projects/components/workspace/ProjectWorkspacePanel";

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreating = searchParams.get("create") === "true";
  const projectId = searchParams.get("project");
  const [createSessionActive, setCreateSessionActive] = useState(isCreating);

  const openCreate = useCallback(() => {
    setCreateSessionActive(true);
    setSearchParams({ create: "true" });
  }, [setSearchParams]);

  const closeCreate = useCallback(() => {
    setCreateSessionActive(false);
    setSearchParams({});
  }, [setSearchParams]);

  const openProject = useCallback(
    (id: string, mode?: "view" | "edit") => {
      if (mode === "edit") {
        setSearchParams({ project: id, mode: "edit" });
      } else {
        setSearchParams({ project: id });
      }
    },
    [setSearchParams]
  );

  const closeProject = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative">
      <ProjectsList
        onAddProject={openCreate}
        onSelectProject={(id) => openProject(id, "view")}
        onEditProject={(id) => openProject(id, "view")}
      />
      {createSessionActive && (
        <ProjectWorkspacePanel
          mode="create"
          initialTab="details"
          onClose={closeCreate}
          onCreated={(id) => setSearchParams({ project: id }, { replace: true })}
        />
      )}
      {projectId && !createSessionActive && (
        <ProjectWorkspacePanel
          projectId={projectId}
          initialTab="details"
          onClose={closeProject}
        />
      )}
    </div>
  );
}
