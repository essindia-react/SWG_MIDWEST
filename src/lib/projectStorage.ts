import { DUMMY_PROJECTS } from "../data/dummyProjects";
import type { Project } from "../types/project";

export const USER_PROJECTS_STORAGE_KEY = "swg-user-projects";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface UserProjectsCache {
  expiresAt: number;
  projects: Project[];
}

const DUMMY_PROJECT_IDS = new Set(DUMMY_PROJECTS.map((project) => project.id));

export function isUserAddedProject(project: Project): boolean {
  return !DUMMY_PROJECT_IDS.has(project.id);
}

export function extractUserProjects(projects: Project[]): Project[] {
  return projects.filter(isUserAddedProject);
}

export function loadUserProjects(): Project[] {
  try {
    const raw = localStorage.getItem(USER_PROJECTS_STORAGE_KEY);
    if (!raw) return [];

    const cache = JSON.parse(raw) as UserProjectsCache;
    if (Date.now() > cache.expiresAt) {
      localStorage.removeItem(USER_PROJECTS_STORAGE_KEY);
      return [];
    }

    return cache.projects;
  } catch {
    localStorage.removeItem(USER_PROJECTS_STORAGE_KEY);
    return [];
  }
}

export function saveUserProjects(projects: Project[]): void {
  const userProjects = extractUserProjects(projects);
  if (userProjects.length === 0) {
    localStorage.removeItem(USER_PROJECTS_STORAGE_KEY);
    return;
  }

  const cache: UserProjectsCache = {
    expiresAt: Date.now() + TTL_MS,
    projects: userProjects,
  };
  localStorage.setItem(USER_PROJECTS_STORAGE_KEY, JSON.stringify(cache));
}

export function mergeProjectsWithStored(dummyProjects: Project[]): Project[] {
  localStorage.removeItem(USER_PROJECTS_STORAGE_KEY);
  return dummyProjects;
}
