import { applyPickListInventoryPulls } from "../../../lib/inventoryIntegration";
import type { Project } from "../../../types/project";
import type { TaskManagementPickListItem } from "../types/taskManagementPickList";
import { getAllTaskPickListSeedsForProjects } from "./taskPickListHelpers";

const STORAGE_KEY = "landscapems-task-management-picklists";
const VERSION_KEY = "landscapems-task-management-picklists-version";
const CURRENT_VERSION = "4";

type PickListStore = Record<string, TaskManagementPickListItem[]>;

function taskKey(projectId: string, milestoneId: string, taskId: string): string {
  return `${projectId}:${milestoneId}:${taskId}`;
}

function readStore(): PickListStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PickListStore;
  } catch {
    return {};
  }
}

function writeStore(store: PickListStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function seedTaskPickListsFromProjects(projects: Project[]): void {
  if (localStorage.getItem(VERSION_KEY) === CURRENT_VERSION) return;

  const seeds = getAllTaskPickListSeedsForProjects(projects);
  const store: PickListStore = {};

  for (const [key, items] of Object.entries(seeds)) {
    if (items.length === 0) continue;
    store[key] = items.map((item, index) => ({
      id: `tmpl-seed-${key}-${index}`,
      ...item,
    }));
  }

  writeStore(store);
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  for (const project of projects) {
    applyPickListInventoryPulls(project);
  }
}

export function getTaskPickList(
  projectId: string,
  milestoneId: string,
  taskId: string
): TaskManagementPickListItem[] {
  const store = readStore();
  return store[taskKey(projectId, milestoneId, taskId)] ?? [];
}

export function saveTaskPickList(
  projectId: string,
  milestoneId: string,
  taskId: string,
  items: TaskManagementPickListItem[]
): void {
  const store = readStore();
  store[taskKey(projectId, milestoneId, taskId)] = items;
  writeStore(store);
}

export function addPickListItem(
  projectId: string,
  milestoneId: string,
  taskId: string,
  item: Omit<TaskManagementPickListItem, "id">
): TaskManagementPickListItem {
  const items = getTaskPickList(projectId, milestoneId, taskId);
  const newItem: TaskManagementPickListItem = {
    id: `tmpl-${Date.now()}`,
    ...item,
  };
  saveTaskPickList(projectId, milestoneId, taskId, [...items, newItem]);
  return newItem;
}

export function updatePickListItem(
  projectId: string,
  milestoneId: string,
  taskId: string,
  itemId: string,
  updates: Partial<Omit<TaskManagementPickListItem, "id">>
): void {
  const items = getTaskPickList(projectId, milestoneId, taskId).map((item) =>
    item.id === itemId ? { ...item, ...updates } : item
  );
  saveTaskPickList(projectId, milestoneId, taskId, items);
}

export function removePickListItem(
  projectId: string,
  milestoneId: string,
  taskId: string,
  itemId: string
): void {
  const items = getTaskPickList(projectId, milestoneId, taskId).filter((item) => item.id !== itemId);
  saveTaskPickList(projectId, milestoneId, taskId, items);
}

export function getTaskPickListCount(
  projectId: string,
  milestoneId: string,
  taskId: string
): number {
  return getTaskPickList(projectId, milestoneId, taskId).length;
}
