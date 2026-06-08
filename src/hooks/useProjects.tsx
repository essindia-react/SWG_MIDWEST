import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DUMMY_PROJECTS } from "../data/dummyProjects";
import { generateProjectCode, getDefaultProjectDocuments, normalizeProject } from "../lib/projectHelpers";
import {
  mergeProjectsWithStored,
  saveUserProjects,
} from "../lib/projectStorage";
import type {
  MilestoneFormInput,
  Project,
  ProjectFormInput,
  ProjectTaskFormInput,
  TeamAssignmentFormInput,
} from "../types/project";

interface ProjectsContextValue {
  projects: Project[];
  userAddedProjects: Project[];
  addProject: (input: ProjectFormInput) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProjectById: (id: string) => Project | undefined;
  addTeamAssignment: (projectId: string, input: TeamAssignmentFormInput) => void;
  updateTeamAssignment: (
    projectId: string,
    assignmentId: string,
    updates: Partial<TeamAssignmentFormInput>
  ) => void;
  removeTeamAssignment: (projectId: string, assignmentId: string) => void;
  addMilestone: (projectId: string, input: MilestoneFormInput) => void;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    updates: Partial<MilestoneFormInput>
  ) => void;
  removeMilestone: (projectId: string, milestoneId: string) => void;
  addTask: (projectId: string, input: ProjectTaskFormInput) => void;
  updateTask: (
    projectId: string,
    milestoneId: string,
    taskId: string,
    updates: Partial<Omit<ProjectTaskFormInput, "milestoneId">>
  ) => void;
  removeTask: (projectId: string, milestoneId: string, taskId: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function createProjectRecord(input: ProjectFormInput): Project {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const base = Date.now();

  const teamAssignments = (input.teamAssignments ?? []).map((assignment, index) => ({
    id: `team-${base}-${index}`,
    ...assignment,
  }));

  const milestones = (input.milestones ?? []).map((milestone, milestoneIndex) => {
    const milestoneId = `ms-${base}-${milestoneIndex}`;
    const { tasks = [], ...milestoneData } = milestone;

    return {
      id: milestoneId,
      ...milestoneData,
      tasks: tasks.map((task, taskIndex) => ({
        id: `task-${base}-${milestoneIndex}-${taskIndex}`,
        milestoneId,
        ...task,
      })),
    };
  });

  return {
    id: `project-${base}`,
    projectCode: generateProjectCode(),
    projectDate: today,
    customerId: input.customerId,
    customerName: input.customerName,
    plannedStartDate: input.plannedStartDate,
    plannedEndDate: input.plannedEndDate,
    description: input.description,
    projectType: input.projectType,
    actualStartDate: input.actualStartDate ?? "",
    actualEndDate: input.actualEndDate ?? "",
    status: input.status ?? "planning",
    projectValue: input.projectValue ?? 0,
    projectManager: input.projectManager,
    remarks: input.remarks ?? "",
    teamAssignments,
    milestones,
    documents: getDefaultProjectDocuments(),
    budget: { materials: [], crew: [], equipment: [], overhead: [] },
    createdAt: now,
    updatedAt: now,
  };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() =>
    mergeProjectsWithStored(DUMMY_PROJECTS).map(normalizeProject)
  );

  useEffect(() => {
    saveUserProjects(projects);
  }, [projects]);

  const userAddedProjects = useMemo(
    () =>
      projects.filter(
        (project) => !DUMMY_PROJECTS.some((dummy) => dummy.id === project.id)
      ),
    [projects]
  );

  const addProject = useCallback((input: ProjectFormInput) => {
    const newProject = createProjectRecord(input);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: now } : project
      )
    );
  }, []);

  const getProjectById = useCallback(
    (id: string) => projects.find((project) => project.id === id),
    [projects]
  );

  const addTeamAssignment = useCallback(
    (projectId: string, input: TeamAssignmentFormInput) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            teamAssignments: [
              ...project.teamAssignments,
              {
                id: `team-${Date.now()}`,
                ...input,
              },
            ],
          };
        })
      );
    },
    []
  );

  const updateTeamAssignment = useCallback(
    (
      projectId: string,
      assignmentId: string,
      updates: Partial<TeamAssignmentFormInput>
    ) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            teamAssignments: project.teamAssignments.map((assignment) =>
              assignment.id === assignmentId
                ? { ...assignment, ...updates }
                : assignment
            ),
          };
        })
      );
    },
    []
  );

  const removeTeamAssignment = useCallback(
    (projectId: string, assignmentId: string) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            teamAssignments: project.teamAssignments.filter(
              (a) => a.id !== assignmentId
            ),
          };
        })
      );
    },
    []
  );

  const addMilestone = useCallback((projectId: string, input: MilestoneFormInput) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          updatedAt: now,
          milestones: [
            ...project.milestones,
            {
              id: `ms-${Date.now()}`,
              ...input,
              tasks: [],
            },
          ],
        };
      })
    );
  }, []);

  const updateMilestone = useCallback(
    (projectId: string, milestoneId: string, updates: Partial<MilestoneFormInput>) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            milestones: project.milestones.map((milestone) =>
              milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
            ),
          };
        })
      );
    },
    []
  );

  const removeMilestone = useCallback((projectId: string, milestoneId: string) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          updatedAt: now,
          milestones: project.milestones.filter((m) => m.id !== milestoneId),
        };
      })
    );
  }, []);

  const addTask = useCallback((projectId: string, input: ProjectTaskFormInput) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          updatedAt: now,
          milestones: project.milestones.map((milestone) => {
            if (milestone.id !== input.milestoneId) return milestone;
            const { milestoneId: _, ...taskFields } = input;
            return {
              ...milestone,
              tasks: [
                ...milestone.tasks,
                {
                  id: `task-${Date.now()}`,
                  milestoneId: input.milestoneId,
                  ...taskFields,
                },
              ],
            };
          }),
        };
      })
    );
  }, []);

  const updateTask = useCallback(
    (
      projectId: string,
      milestoneId: string,
      taskId: string,
      updates: Partial<Omit<ProjectTaskFormInput, "milestoneId">>
    ) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            milestones: project.milestones.map((milestone) => {
              if (milestone.id !== milestoneId) return milestone;
              return {
                ...milestone,
                tasks: milestone.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              };
            }),
          };
        })
      );
    },
    []
  );

  const removeTask = useCallback(
    (projectId: string, milestoneId: string, taskId: string) => {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            updatedAt: now,
            milestones: project.milestones.map((milestone) => {
              if (milestone.id !== milestoneId) return milestone;
              return {
                ...milestone,
                tasks: milestone.tasks.filter((task) => task.id !== taskId),
              };
            }),
          };
        })
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      projects,
      userAddedProjects,
      addProject,
      updateProject,
      getProjectById,
      addTeamAssignment,
      updateTeamAssignment,
      removeTeamAssignment,
      addMilestone,
      updateMilestone,
      removeMilestone,
      addTask,
      updateTask,
      removeTask,
    }),
    [
      projects,
      userAddedProjects,
      addProject,
      updateProject,
      getProjectById,
      addTeamAssignment,
      updateTeamAssignment,
      removeTeamAssignment,
      addMilestone,
      updateMilestone,
      removeMilestone,
      addTask,
      updateTask,
      removeTask,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
