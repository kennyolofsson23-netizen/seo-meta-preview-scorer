import { describe, it, expect, vi } from "vitest";
import { captureAndDownload } from "./screenshot";

// Mock html2canvas
vi.mock("html2canvas", () => ({
  default: vi.fn().mockResolvedValue({
    getContext: vi.fn().mockReturnValue({
      canvas: { height: 400, width: 600 },
      fillStyle: "",
      fillRect: vi.fn(),
      fillText: vi.fn(),
      font: "",
      textAlign: "",
      textBaseline: "",
    }),
    toBlob: vi.fn().mockImplementation((callback: BlobCallback) => {
      callback(new Blob(["fake-image-data"], { type: "image/png" }));
    }),
  }),
}));

// Mock URL and DOM methods
const mockCreateObjectURL = vi.fn().mockReturnValue("blob:fake-url");
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(URL, "createObjectURL", {
  value: mockCreateObjectURL,
  writable: true,
});
Object.defineProperty(URL, "revokeObjectURL", {
  value: mockRevokeObjectURL,
  writable: true,
});

// Mock document.createElement for anchor click
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const originalCreateElement = document.createElement.bind(document);

vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
  if (tag === "a") {
    const el = originalCreateElement("a");
    el.click = mockClick;
    return el;
  }
  return originalCreateElement(tag);
});

vi.spyOn(document.body, "appendChild").mockImplementation(
  mockAppendChild as typeof document.body.appendChild,
);
vi.spyOn(document.body, "removeChild").mockImplementation(
  mockRemoveChild as typeof document.body.removeChild,
);

describe("screenshot", () => {
  it("returns success result when screenshot works", async () => {
    const el = document.createElement("div");
    const result = await captureAndDownload(el, { format: "png" });
    expect(result.success).toBe(true);
  });

  it("returns failure when html2canvas throws", async () => {
    const html2canvasMock = await import("html2canvas");
    vi.mocked(html2canvasMock.default).mockRejectedValueOnce(
      new Error("Canvas error"),
    );

    const el = document.createElement("div");
    const result = await captureAndDownload(el, { format: "png" });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
