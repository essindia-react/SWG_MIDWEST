import React, { useState } from "react";
import { TaskManagementProjectsList } from "./TaskManagementProjectsList";
import { TaskManagementWorkspacePanel } from "./TaskManagementWorkspacePanel";

export function TaskManagementView() {
  const [selectedMilestone, setSelectedMilestone] = useState<{
    projectId: string;
    milestoneId: string;
  } | null>(null);

  return (
    <div className="relative flex-1 overflow-y-auto min-h-0">
      <TaskManagementProjectsList
        onSelectMilestone={(projectId, milestoneId) =>
          setSelectedMilestone({ projectId, milestoneId })
        }
      />

      {selectedMilestone && (
        <TaskManagementWorkspacePanel
          projectId={selectedMilestone.projectId}
          milestoneId={selectedMilestone.milestoneId}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  );
}
