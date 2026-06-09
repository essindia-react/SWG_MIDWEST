import { TaskManagementView } from "../../features/tasks/components/TaskManagementView";

export function TasksPage() {
  return (
    <div className="overflow-y-auto flex-1">
      <TaskManagementView />
    </div>
  );
}
