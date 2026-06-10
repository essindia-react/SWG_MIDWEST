import artificialTurfUrl from "../../../assets/artificial-turf.jpg";
import whyus1Url from "../../../assets/whyus-1.jpg";
import type { LeadUploadedImage } from "../../../types/lead";

function createDemoImage(
  id: string,
  fileName: string,
  fileSize: number,
  uploadedAt: string,
  previewUrl: string
): LeadUploadedImage {
  return { id, fileName, fileSize, uploadedAt, previewUrl };
}

export const SHOWCASE_SITE_IMAGES: LeadUploadedImage[] = [
  createDemoImage(
    "site-img-1",
    "backyard-existing-lawn.jpg",
    106386,
    "2026-06-03T15:30:00.000Z",
    artificialTurfUrl
  ),
  createDemoImage(
    "site-img-2",
    "side-yard-site-survey.jpg",
    227529,
    "2026-06-03T15:35:00.000Z",
    whyus1Url
  ),
];

export const SHOWCASE_DESIGN_IMAGES: LeadUploadedImage[] = [
  createDemoImage(
    "design-img-1",
    "turf-layout-plan-v2.jpg",
    106386,
    "2026-06-04T10:00:00.000Z",
    artificialTurfUrl
  ),
  createDemoImage(
    "design-img-2",
    "3d-render-backyard-turf.jpg",
    227529,
    "2026-06-04T14:30:00.000Z",
    whyus1Url
  ),
];
