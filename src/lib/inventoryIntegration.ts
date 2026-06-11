import { generateTxnId } from "../features/inventory/lib/inventoryHelpers";
import {
  addLedgerEntry,
  getLedgerEntries,
  getProductById,
  getProducts,
  updateProduct,
} from "../features/inventory/lib/inventoryStore";
import type { StockLedgerEntry } from "../features/inventory/types/inventory";
import {
  addPurchaseRequisition,
  findPurchaseRequisitionByLinkedRef,
  updatePurchaseRequisition,
} from "../features/purchase-requisition/lib/purchaseRequisitionStore";
import { todayISO } from "../features/purchase-requisition/lib/purchaseRequisitionHelpers";
import type {
  POLineItem,
  PurchaseRequisition,
} from "../features/purchase-requisition/types/purchaseRequisition";
import type { MaterialRequest } from "../features/site-material-request/types/materialRequest";
import type { Project } from "../types/project";
import type { TaskManagementPickListItem } from "../features/tasks/types/taskManagementPickList";
import { getTaskPickList } from "../features/tasks/lib/taskManagementPickListStore";

const BUDGET_MAT_REF_PREFIX = "BUDGET-MAT-";
const BUDGET_EQP_REF_PREFIX = "BUDGET-EQP-";

function toPoUnit(unit: string): POLineItem["unit"] {
  if (unit === "sq ft" || unit === "roll" || unit === "bag" || unit === "unit") {
    return unit;
  }
  return "unit";
}

const PROJECT_CODE_TO_ID: Record<string, string> = {
  "SWG-PROJ-2026-101": "project-1",
  "SWG-PROJ-2026-102": "project-2",
};

export function findProductBySkuOrName(sku: string, name: string) {
  const products = getProducts();
  if (sku) {
    const bySku = products.find((p) => p.sku === sku);
    if (bySku) return bySku;
  }
  return products.find((p) => p.name === name);
}

export function hasLedgerReference(ref: string): boolean {
  return getLedgerEntries().some((entry) => entry.referenceNumber === ref);
}

function createLedgerEntry(
  partial: Omit<StockLedgerEntry, "id" | "date" | "auditTrail"> & {
    auditDetails: string;
  }
): StockLedgerEntry | undefined {
  if (hasLedgerReference(partial.referenceNumber)) return undefined;

  const entry: StockLedgerEntry = {
    id: generateTxnId(),
    date: new Date().toISOString(),
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: "Created",
        user: partial.createdBy,
        details: partial.auditDetails,
      },
    ],
    ...partial,
  };
  addLedgerEntry(entry);
  return entry;
}

export function issueStockForSiteRequest(params: {
  productId: string;
  quantity: number;
  projectId?: string;
  projectName?: string;
  referenceNumber: string;
  createdBy: string;
  comments?: string;
}) {
  if (hasLedgerReference(params.referenceNumber)) return;

  const product = getProductById(params.productId);
  if (!product || params.quantity <= 0) return;

  updateProduct(product.id, {
    currentStock: Math.max(0, product.currentStock - params.quantity),
  });

  const signedQty = -params.quantity;
  createLedgerEntry({
    transactionType: "Site Request",
    productId: product.id,
    productName: product.name,
    projectId: params.projectId,
    projectName: params.projectName,
    quantity: signedQty,
    unitCost: product.unitCost,
    totalValue: signedQty * product.unitCost,
    referenceNumber: params.referenceNumber,
    createdBy: params.createdBy,
    comments: params.comments,
    auditDetails: params.comments ?? "Site material request fulfilled",
  });
}

export function recordPurchaseOrderLedger(params: {
  productId: string;
  quantity: number;
  projectId?: string;
  projectName?: string;
  referenceNumber: string;
  createdBy: string;
  comments?: string;
}) {
  const product = getProductById(params.productId);
  if (!product || params.quantity <= 0) return;

  createLedgerEntry({
    transactionType: "Purchase Order",
    productId: product.id,
    productName: product.name,
    projectId: params.projectId,
    projectName: params.projectName,
    quantity: params.quantity,
    unitCost: product.unitCost,
    totalValue: params.quantity * product.unitCost,
    referenceNumber: params.referenceNumber,
    createdBy: params.createdBy,
    comments: params.comments,
    auditDetails: "Purchase order raised",
  });
}

export function issueStockForPickList(params: {
  sku: string;
  itemName: string;
  quantity: number;
  projectId: string;
  projectName: string;
  taskId: string;
  pickListItemId: string;
  createdBy: string;
}) {
  const ref = `PICK-${params.projectId}-${params.taskId}-${params.pickListItemId}`;
  if (hasLedgerReference(ref)) return;

  const product = findProductBySkuOrName(params.sku, params.itemName);
  if (!product) return;

  issueStockForSiteRequest({
    productId: product.id,
    quantity: params.quantity,
    projectId: params.projectId,
    projectName: params.projectName,
    referenceNumber: ref,
    createdBy: params.createdBy,
    comments: `Pick list pull — task ${params.taskId}`,
  });
}

export function resolveProjectId(projectCode: string): string | undefined {
  return PROJECT_CODE_TO_ID[projectCode];
}

export function resolveProjectNameShort(fullName: string): string {
  return fullName.split(" — ")[0] ?? fullName;
}

function defaultVendorForProduct(productId: string) {
  const product = getProductById(productId);
  return {
    vendorName: product?.preferredVendor || "Southwest Turf Supply",
    vendorContact: "Mike Rivera",
    vendorEmail: "orders@southwestturf.com",
  };
}

function buildMaterialLineItems(project: Project): POLineItem[] {
  return project.budget.materials.map((line) => {
    const product = findProductBySkuOrName(line.sku, line.materialName);
    const unitPrice = line.unitCost || product?.unitCost || 0;
    return {
      id: `li-mat-${line.id}`,
      productId: product?.id ?? "",
      itemName: line.materialName,
      sku: line.sku,
      description: line.notes || `Project budget — ${project.projectCode}`,
      quantity: line.estimatedQuantity,
      unit: toPoUnit(line.unit),
      unitPrice,
      total: line.totalCost || line.estimatedQuantity * unitPrice,
    };
  });
}

function buildEquipmentLineItems(project: Project): POLineItem[] {
  return project.budget.equipment.map((line) => ({
    id: `li-eq-${line.id}`,
    productId: "",
    itemName: line.equipmentName,
    sku: "EQP-RENT",
    description: line.notes || `Equipment rental — ${project.projectCode}`,
    quantity: line.usageDays,
    unit: "unit",
    unitPrice: line.dailyRate,
    total: line.totalCost,
  }));
}

function upsertBudgetPurchaseOrder(params: {
  project: Project;
  linkedRef: string;
  poType: PurchaseRequisition["poType"];
  lineItems: POLineItem[];
  notesToVendor: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
}): PurchaseRequisition | undefined {
  if (params.lineItems.length === 0) return undefined;

  const existing = findPurchaseRequisitionByLinkedRef(params.linkedRef);
  const payload = {
    poType: params.poType,
    linkedProjectId: params.project.id,
    linkedProjectName: params.project.customerName,
    linkedMaterialRequestNumber: params.linkedRef,
    vendorName: params.vendorName,
    vendorContact: params.vendorContact,
    vendorEmail: params.vendorEmail,
    deliveryAddress: "Job Site" as const,
    requiredDeliveryDate: params.project.plannedStartDate || todayISO(),
    paymentTerms: "Net 30" as const,
    notesToVendor: params.notesToVendor,
    lineItems: params.lineItems,
    status: "Draft" as const,
  };

  if (existing) {
    return updatePurchaseRequisition(existing.id, payload);
  }

  return addPurchaseRequisition(payload);
}

export function syncProjectBudgetToPurchaseOrders(project: Project): void {
  const matRef = `${BUDGET_MAT_REF_PREFIX}${project.projectCode}`;
  const eqpRef = `${BUDGET_EQP_REF_PREFIX}${project.projectCode}`;
  const matLines = buildMaterialLineItems(project);
  const eqpLines = buildEquipmentLineItems(project);

  const primaryProduct = matLines[0]?.productId
    ? getProductById(matLines[0].productId)
    : undefined;
  const vendor = primaryProduct
    ? defaultVendorForProduct(primaryProduct.id)
    : {
        vendorName: "Southwest Turf Supply",
        vendorContact: "Mike Rivera",
        vendorEmail: "orders@southwestturf.com",
      };

  upsertBudgetPurchaseOrder({
    project,
    linkedRef: matRef,
    poType: "Materials",
    lineItems: matLines,
    notesToVendor: `Materials procurement for ${project.projectCode} — synced from project budget.`,
    ...vendor,
  });

  upsertBudgetPurchaseOrder({
    project,
    linkedRef: eqpRef,
    poType: "Equipment Rental",
    lineItems: eqpLines,
    notesToVendor: `Equipment rental for ${project.projectCode} — synced from project budget.`,
    vendorName: "Equipment Rentals Inc.",
    vendorContact: "Dispatch",
    vendorEmail: "dispatch@equiprentals.com",
  });

  for (const line of matLines) {
    if (!line.productId) continue;
    const matPo = findPurchaseRequisitionByLinkedRef(matRef);
    if (!matPo) continue;
    recordPurchaseOrderLedger({
      productId: line.productId,
      quantity: line.quantity,
      projectId: project.id,
      projectName: project.customerName,
      referenceNumber: `${matPo.poNumber}-${line.sku}`,
      createdBy: "Maria S.",
      comments: `Budget materials PO ${matPo.poNumber}`,
    });
  }
}

export function syncAllProjectBudgetPurchaseOrders(projects: Project[]): void {
  for (const project of projects) {
    syncProjectBudgetToPurchaseOrders(project);
  }
}

export function createPurchaseRequisitionFromSiteRequest(
  request: MaterialRequest,
  projectId?: string,
  projectName?: string
): PurchaseRequisition | undefined {
  const product = findProductBySkuOrName("", request.itemName);
  const qty = request.approvedQuantity ?? request.quantityNeeded;
  const unitPrice = product?.unitCost ?? 0;

  const lineItem: POLineItem = {
    id: `li-mr-${request.id}`,
    productId: product?.id ?? "",
    itemName: request.itemName,
    sku: product?.sku ?? "CUSTOM",
    description: request.notes || `Site material request ${request.requestNumber}`,
    quantity: qty,
    unit: toPoUnit(request.unit),
    unitPrice,
    total: qty * unitPrice,
  };

  const existing = findPurchaseRequisitionByLinkedRef(request.requestNumber);
  if (existing) return existing;

  const vendor = product ? defaultVendorForProduct(product.id) : defaultVendorForProduct("prod-001");

  return addPurchaseRequisition({
    poType: "Materials",
    linkedProjectId: projectId ?? "",
    linkedProjectName: projectName ?? resolveProjectNameShort(request.projectName),
    linkedMaterialRequestNumber: request.requestNumber,
    ...vendor,
    deliveryAddress: "Job Site",
    requiredDeliveryDate: todayISO(),
    paymentTerms: "Net 30",
    notesToVendor: `Raised from site material request ${request.requestNumber}. ${request.notesToCrew ?? ""}`.trim(),
    lineItems: [lineItem],
    status: "Draft",
  });
}

export function fulfillSiteMaterialRequest(request: MaterialRequest): MaterialRequest {
  if (request.status !== "approved" || !request.fulfillmentMethod) return request;

  const projectId = resolveProjectId(request.projectCode);
  const projectName = resolveProjectNameShort(request.projectName);
  const qty = request.approvedQuantity ?? request.quantityNeeded;
  const product = findProductBySkuOrName("", request.itemName);

  if (request.fulfillmentMethod === "Pull from Inventory" && product) {
    issueStockForSiteRequest({
      productId: product.id,
      quantity: qty,
      projectId,
      projectName,
      referenceNumber: request.requestNumber,
      createdBy: "Maria S.",
      comments: `Material request ${request.requestNumber} — pull from inventory`,
    });
  }

  if (request.fulfillmentMethod === "Raise Purchase Order") {
    const pr = createPurchaseRequisitionFromSiteRequest(request, projectId, projectName);
    if (product && pr) {
      recordPurchaseOrderLedger({
        productId: product.id,
        quantity: qty,
        projectId,
        projectName,
        referenceNumber: pr.poNumber,
        createdBy: "Maria S.",
        comments: `PO raised for ${request.requestNumber}`,
      });
    }
    return { ...request, linkedPONumber: pr?.poNumber };
  }

  return request;
}

export function applySeededSiteMaterialFulfillments(requests: MaterialRequest[]): void {
  for (const request of requests) {
    if (request.status === "approved" && request.fulfillmentMethod) {
      fulfillSiteMaterialRequest(request);
    }
  }
}

export function applyPickListInventoryPulls(project: Project): void {
  for (const milestone of project.milestones) {
    for (const task of milestone.tasks) {
      const items = getTaskPickList(project.id, milestone.id, task.id);
      for (const item of items) {
        if (!item.pulledFromInventory) continue;
        issueStockForPickList({
          sku: item.sku,
          itemName: item.itemName,
          quantity: item.quantityRequired,
          projectId: project.id,
          projectName: project.customerName,
          taskId: task.id,
          pickListItemId: item.id,
          createdBy: task.assignedTo || "Alex J.",
        });
      }
    }
  }
}

export function processPickListItemPull(
  project: Project,
  taskId: string,
  item: TaskManagementPickListItem,
  assignedTo?: string
): void {
  if (!item.pulledFromInventory) return;
  issueStockForPickList({
    sku: item.sku,
    itemName: item.itemName,
    quantity: item.quantityRequired,
    projectId: project.id,
    projectName: project.customerName,
    taskId,
    pickListItemId: item.id,
    createdBy: assignedTo || "Alex J.",
  });
}
