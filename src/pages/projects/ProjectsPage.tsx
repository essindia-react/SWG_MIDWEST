import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { ProjectsList } from "../../features/projects/components/ProjectsList";
import { ProjectCreateWorkspace } from "../../features/projects/components/ProjectCreateWorkspace";
import { ProjectWorkspacePanel } from "../../features/projects/components/workspace/ProjectWorkspacePanel";

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreating = searchParams.get("create") === "true";
  const projectId = searchParams.get("project");

  const openCreate = useCallback(() => {
    setSearchParams({ create: "true" });
  }, [setSearchParams]);

  const closeCreate = useCallback(() => {
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

  if (isCreating) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <ProjectCreateWorkspace
          onBack={closeCreate}
          onCreated={(id) => setSearchParams({ project: id })}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative">
      <ProjectsList
        onAddProject={openCreate}
        onSelectProject={(id) => openProject(id, "view")}
        onEditProject={(id) => openProject(id, "edit")}
      />
      {projectId && (
        <ProjectWorkspacePanel
          projectId={projectId}
          initialTab={searchParams.get("mode") === "edit" ? "edit" : "details"}
          onClose={closeProject}
        />
      )}
    </div>
  );
}
