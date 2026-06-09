import type { Invoice } from "../types/invoice";

export const DUMMY_INVOICES: Invoice[] = [
  {
    id: "inv-dummy-1",
    invoiceNumber: "SWG-INV-2026-0001",
    projectId: "project-1",
    milestoneId: "ms-1",
    status: "sent",
    invoiceDate: "2026-03-26",
    dueDate: "2026-04-10",
    billToName: "John Smith",
    billToAddress: "4521 Oak Ridge Dr, Columbus, OH 43220",
    billToEmail: "john.smith@email.com",
    projectName: "SWG-PROJ-2026-101",
    jobSiteAddress: "4521 Oak Ridge Dr, Columbus, OH 43220",
    milestoneName: "Site Preparation",
    lineItems: [
      { id: "li-ms-1-0", description: "Remove existing sod (Site Preparation)", amount: 4275 },
      { id: "li-ms-1-1", description: "Install drainage system (Site Preparation)", amount: 5700 },
    ],
    subtotal: 9975,
    taxPercent: 7.25,
    taxAmount: 723.19,
    totalDue: 10698.19,
    amountPreviouslyPaid: 0,
    balanceRemaining: 10698.19,
    paymentTerms: "Net 15",
    paymentMethods: ["ACH", "Check"],
    notesToClient:
      "Thank you for choosing Southwest Greens. Site preparation work has been completed.",
    internalNotes: "First milestone invoice for John Smith backyard project.",
    completionRecord: {
      completionPct: 100,
      markedCompleteBy: "Alex J.",
      completionDate: "2026-03-25",
      completionPhotos: ["site-prep-before.jpg", "site-prep-after.jpg"],
      checklistSignedOff: {
        "Site Preparation Complete": true,
        "Installation Quality Verified": true,
        "Safety Inspection Passed": true,
        "Manager Sign-off": true,
      },
    },
    createdAt: "2026-03-26T10:00:00.000Z",
    updatedAt: "2026-03-26T10:00:00.000Z",
  },
];
