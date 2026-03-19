import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenshotButton } from "./ScreenshotButton";

vi.mock("@/lib/screenshot", () => ({
  captureAndDownload: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ScreenshotButton", () => {
  it("renders export button", () => {
    const ref = { current: document.createElement("div") };
    render(<ScreenshotButton targetRef={ref} />);
    expect(screen.getByRole("button", { name: /save preview as/i })).toBeTruthy();
  });

  it("shows loading state when capturing", async () => {
    const { captureAndDownload } = await import("@/lib/screenshot");
    let resolveCapture: (val: { success: boolean }) => void;
    vi.mocked(captureAndDownload).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCapture = resolve;
        }),
    );

    const ref = { current: document.createElement("div") };
    const user = userEvent.setup();
    render(<ScreenshotButton targetRef={ref} />);

    const btn = screen.getByRole("button");
    await user.click(btn);

    expect(btn).toBeDisabled();
    // Resolve the capture and wait for state updates
    await act(async () => {
      resolveCapture!({ success: true });
    });
  });

  it("calls onSuccess when capture succeeds", async () => {
    const { captureAndDownload } = await import("@/lib/screenshot");
    vi.mocked(captureAndDownload).mockResolvedValueOnce({ success: true });

    const onSuccess = vi.fn();
    const ref = { current: document.createElement("div") };
    const user = userEvent.setup();
    render(<ScreenshotButton targetRef={ref} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button"));
    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onError when capture fails", async () => {
    const { captureAndDownload } = await import("@/lib/screenshot");
    vi.mocked(captureAndDownload).mockResolvedValueOnce({
      success: false,
      error: "Canvas error",
    });

    const onError = vi.fn();
    const ref = { current: document.createElement("div") };
    const user = userEvent.setup();
    render(<ScreenshotButton targetRef={ref} onError={onError} />);

    await user.click(screen.getByRole("button"));
    expect(onError).toHaveBeenCalledWith("Canvas error");
  });
});
