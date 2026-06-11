import type { WorkspaceFormValues } from "../components/workspace/types";

function mapInstallationTypeToAreaType(installationType: string): string {
  if (installationType === "Putting Green") return "Putting Green";
  return "Main Turf";
}

export function syncInquiryAddressToSiteVisit(
  values: WorkspaceFormValues
): WorkspaceFormValues {
  return {
    ...values,
    siteAddress: values.jobSiteAddress || values.siteAddress,
    siteCity: values.jobSiteCity || values.siteCity,
    siteZip: values.jobSiteZip || values.siteZip,
    totalArea: values.approximateArea || values.totalArea,
  };
}

/** Dropdown options for Area Name — sourced from inquiry installation types. */
export function getEstimationAreaNameOptions(values: WorkspaceFormValues): string[] {
  return [...values.installationTypes];
}

/** Areas actually selected in Area Info — used for material "For Area" dropdown. */
export function getSelectedEstimationAreaNames(values: WorkspaceFormValues): string[] {
  return values.estimationAreas
    .map((area) => area.areaName)
    .filter((name) => name.trim().length > 0);
}

/** Prefill only the first area row with the first inquiry type when empty. */
export function prefillFirstEstimationArea(
  values: WorkspaceFormValues
): WorkspaceFormValues {
  const firstType = values.installationTypes[0];
  if (!firstType) return values;

  if (values.estimationAreas.length === 0) {
    return {
      ...values,
      estimationAreas: [
        {
          id: `area-1-${Date.now()}`,
          areaName: firstType,
          areaType: mapInstallationTypeToAreaType(firstType),
          areaLength: "",
          areaWidth: "",
          customArea: "",
        },
      ],
    };
  }

  const [first, ...rest] = values.estimationAreas;
  if (first.areaName.trim()) return values;

  return {
    ...values,
    estimationAreas: [
      {
        ...first,
        areaName: firstType,
        areaType: mapInstallationTypeToAreaType(firstType),
      },
      ...rest,
    ],
  };
}

export function syncProductsToSelectedAreas(
  values: WorkspaceFormValues
): WorkspaceFormValues {
  const selected = new Set(getSelectedEstimationAreaNames(values));
  if (selected.size === 0) {
    return {
      ...values,
      estimationProducts: values.estimationProducts.map((product) => ({
        ...product,
        forArea: "",
        productId: "",
        productName: "",
        cost: 0,
      })),
    };
  }

  return {
    ...values,
    estimationProducts: values.estimationProducts.map((product) => {
      if (!product.forArea || selected.has(product.forArea)) return product;
      return {
        ...product,
        forArea: "",
        productId: "",
        productName: "",
        cost: 0,
      };
    }),
  };
}

export function renameProductAreaReferences(
  products: WorkspaceFormValues["estimationProducts"],
  oldName: string,
  newName: string
): WorkspaceFormValues["estimationProducts"] {
  if (!oldName || oldName === newName) return products;
  return products.map((product) =>
    product.forArea === oldName ? { ...product, forArea: newName } : product
  );
}

export function removeProductsForArea(
  products: WorkspaceFormValues["estimationProducts"],
  areaName: string
): WorkspaceFormValues["estimationProducts"] {
  return products.filter((product) => product.forArea !== areaName);
}

export function getUnusedAreaNameOptions(
  values: WorkspaceFormValues
): string[] {
  const used = new Set(
    values.estimationAreas.map((area) => area.areaName).filter(Boolean)
  );
  return getEstimationAreaNameOptions(values).filter((name) => !used.has(name));
}
