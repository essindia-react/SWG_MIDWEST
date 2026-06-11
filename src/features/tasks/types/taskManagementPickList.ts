export interface TaskManagementPickListItem {
  id: string;
  fieldName: string;
  itemName: string;
  sku: string;
  quantityRequired: number;
  unit: string;
  category: "Material" | "Equipment";
  sourceLineId: string;
  pulledFromInventory: boolean;
  notes: string;
}

export interface TaskManagementPickListFormData {
  fieldName: string;
  itemName: string;
  sku: string;
  quantityRequired: string;
  unit: string;
  category: "Material" | "Equipment";
  sourceLineId: string;
  pulledFromInventory: boolean;
  notes: string;
}
