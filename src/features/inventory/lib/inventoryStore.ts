import {
  DUMMY_LEDGER,
  DUMMY_MATERIAL_REQUESTS,
  DUMMY_PRODUCTS,
  DUMMY_SWAPS,
} from "../data/dummyInventoryData";
import type {
  InventoryMaterialRequest,
  InventoryProduct,
  ProductSwap,
  StockLedgerEntry,
} from "../types/inventory";
import { generateAdjRef, generateTxnId } from "./inventoryHelpers";

let products = [...DUMMY_PRODUCTS];
let ledger = [...DUMMY_LEDGER];
let materialRequests = [...DUMMY_MATERIAL_REQUESTS];
let swaps = [...DUMMY_SWAPS];

const EVENT = "inventory-updated";

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeInventory(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function getProducts(): InventoryProduct[] {
  return [...products];
}

export function getProductById(id: string): InventoryProduct | undefined {
  return products.find((p) => p.id === id);
}

export function addProduct(product: InventoryProduct) {
  products = [product, ...products];
  notify();
}

export function updateProduct(id: string, updates: Partial<InventoryProduct>) {
  products = products.map((p) =>
    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : p
  );
  notify();
}

export function getLedgerEntries(): StockLedgerEntry[] {
  return [...ledger].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addLedgerEntry(entry: StockLedgerEntry) {
  ledger = [entry, ...ledger];
  notify();
}

export function createAdjustment(params: {
  productId: string;
  adjustmentType: "Increase" | "Decrease";
  quantity: number;
  reason: string;
  comments: string;
  createdBy: string;
}) {
  const product = getProductById(params.productId);
  if (!product) return;

  const signedQty =
    params.adjustmentType === "Increase" ? params.quantity : -params.quantity;
  const newStock = product.currentStock + signedQty;

  updateProduct(params.productId, { currentStock: Math.max(0, newStock) });

  const entry: StockLedgerEntry = {
    id: generateTxnId(),
    date: new Date().toISOString(),
    transactionType: "Adjustment",
    productId: product.id,
    productName: product.name,
    quantity: signedQty,
    unitCost: product.unitCost,
    totalValue: signedQty * product.unitCost,
    referenceNumber: generateAdjRef(),
    createdBy: params.createdBy,
    reason: params.reason,
    comments: params.comments,
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: "Created",
        user: params.createdBy,
        details: `Manual ${params.adjustmentType.toLowerCase()} adjustment`,
      },
    ],
  };

  addLedgerEntry(entry);
  return entry;
}

export function getMaterialRequests(): InventoryMaterialRequest[] {
  return [...materialRequests].sort(
    (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );
}

export function getMaterialRequestById(id: string): InventoryMaterialRequest | undefined {
  return materialRequests.find((r) => r.id === id);
}

export function updateMaterialRequest(
  id: string,
  updates: Partial<InventoryMaterialRequest>
) {
  materialRequests = materialRequests.map((r) =>
    r.id === id ? { ...r, ...updates } : r
  );
  notify();
}

export function getProductSwaps(): ProductSwap[] {
  return [...swaps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getProductSwapById(id: string): ProductSwap | undefined {
  return swaps.find((s) => s.id === id);
}

export function addProductSwap(swap: ProductSwap) {
  swaps = [swap, ...swaps];
  notify();
}

export function updateProductSwap(id: string, updates: Partial<ProductSwap>) {
  swaps = swaps.map((s) => (s.id === id ? { ...s, ...updates } : s));
  notify();
}
