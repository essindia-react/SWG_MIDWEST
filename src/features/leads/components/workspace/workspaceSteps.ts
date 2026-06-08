import {
  MessageCircle,
  MapPin,
  PenTool,
  Calculator,
  FileCheck,
  Clock,
  Paperclip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WorkspaceStep {
  id: number;
  label: string;
  icon: LucideIcon;
}

export const WORKSPACE_STEPS: WorkspaceStep[] = [
  { id: 1, label: "Inquiry", icon: MessageCircle },
  { id: 2, label: "Site Visit", icon: MapPin },
  { id: 3, label: "Design", icon: PenTool },
  { id: 4, label: "Estimation", icon: Calculator },
  { id: 5, label: "Proposal", icon: FileCheck },
  { id: 6, label: "Follow Up", icon: Clock },
  { id: 7, label: "Documents", icon: Paperclip },
];
