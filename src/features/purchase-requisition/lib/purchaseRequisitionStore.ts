import { DUMMY_PURCHASE_REQUISITIONS } from "../data/dummyPurchaseRequisitionData";
import { generatePONumber, todayISO } from "./purchaseRequisitionHelpers";
import type { PurchaseRequisition } from "../types/purchaseRequisition";

let purchaseRequisitions = [...DUMMY_PURCHASE_REQUISITIONS];

const EVENT = "purchase-requisitions-updated";

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribePurchaseRequisitions(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function getPurchaseRequisitions(): PurchaseRequisition[] {
  return [...purchaseRequisitions].sort(
    (a, b) => new Date(b.poDate).getTime() - new Date(a.poDate).getTime()
  );
}

export function addPurchaseRequisition(
  data: Omit<PurchaseRequisition, "id" | "poNumber" | "poDate" | "createdAt">
): PurchaseRequisition {
  const pr: PurchaseRequisition = {
    ...data,
    id: `pr-${Date.now()}`,
    poNumber: generatePONumber(purchaseRequisitions),
    poDate: todayISO(),
    createdAt: todayISO(),
  };
  purchaseRequisitions = [pr, ...purchaseRequisitions];
  notify();
  return pr;
}

export function updatePurchaseRequisition(
  id: string,
  updates: Partial<Omit<PurchaseRequisition, "id" | "poNumber" | "createdAt">>
): PurchaseRequisition | undefined {
  let updated: PurchaseRequisition | undefined;
  purchaseRequisitions = purchaseRequisitions.map((pr) => {
    if (pr.id !== id) return pr;
    updated = { ...pr, ...updates };
    return updated;
  });
  if (updated) notify();
  return updated;
}

export function getPurchaseRequisitionById(id: string): PurchaseRequisition | undefined {
  return purchaseRequisitions.find((pr) => pr.id === id);
}

export function findPurchaseRequisitionByLinkedRef(
  linkedRef: string
): PurchaseRequisition | undefined {
  return purchaseRequisitions.find((pr) => pr.linkedMaterialRequestNumber === linkedRef);
}
