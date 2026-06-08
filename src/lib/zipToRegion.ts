import type { OhioRegion } from "../types/lead";
import { DEFAULT_OHIO_REGION } from "./constants";

const ZIP_PREFIX_TO_REGION: Record<string, OhioRegion> = {
  "430": "columbus",
  "431": "columbus",
  "432": "columbus",
  "433": "columbus",
  "434": "toledo",
  "435": "toledo",
  "436": "toledo",
  "437": "toledo",
  "440": "cleveland",
  "441": "cleveland",
  "442": "akron",
  "443": "akron",
  "444": "akron",
  "445": "cleveland",
  "450": "cincinnati",
  "451": "cincinnati",
  "452": "cincinnati",
  "453": "dayton",
  "454": "dayton",
  "455": "dayton",
};

export function zipToOhioRegion(zipCode: string): OhioRegion {
  const zip = zipCode.replace(/\D/g, "").slice(0, 5);
  if (!zip) return DEFAULT_OHIO_REGION;

  const prefix3 = zip.slice(0, 3);
  return ZIP_PREFIX_TO_REGION[prefix3] ?? DEFAULT_OHIO_REGION;
}
