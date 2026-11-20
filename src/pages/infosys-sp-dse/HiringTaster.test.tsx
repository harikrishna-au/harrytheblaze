// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HiringTaster from "./HiringTaster";
import { TASTER } from "./data";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
import { track } from "@/lib/analytics";

const mount = (props: Partial<{ premium: boolean; onUnlock: () => void }> = {}) =>
  render(
    <MemoryRouter>
      <HiringTaster onUnlock={props.onUnlock ?? (() => {})} premium={props.premium ?? false} priceLabel="₹299" />
    </MemoryRouter>,
  );

// Answer the current question by clicking its option letter + text, then press the continue button.
const answer = (idx: number) => {
  const radios = screen.getAllByRole("radio");
  fireEvent.click(radios[idx]);
};
const proceed = () => fireEvent.click(screen.getByRole("button", { name: /^(Next|See my result)/ }));

beforeEach(() => { vi.useFakeTimers(); (track as any).mockClear(); Element.prototype.scrollIntoView = vi.fn(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("HiringTaster", () => {
  it("starts on the intro and needs no account", () => {
    mount();
    expect(screen.getByRole("button", { name: /Start the taster/ })).toBeTruthy();
    expect(screen.getByText(/No account needed/)).toBeTruthy();
  });

  it("a perfect run ends on the SP result with 3 of 3 coding problems and 3 of 3 interview questions", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    for (const q of TASTER) { answer(q.answer); proceed(); }
    expect(screen.getByText(/read it like an SP candidate/i)).toBeTruthy();
    expect(screen.getByText(/3 of 3 coding problems fully right, and 3 of 3 interview/)).toBeTruthy();
    expect((track as any).mock.calls.map((c: any[]) => c[0])).toEqual(["sp_taster_start", "sp_taster_done"]);
    expect((track as any).mock.calls[1][1]).toMatchObject({ coding: 6, interview: 3, band: "sp", full: 3 });
  });

  it("shows the explanation, marks a wrong pick, and locks the question", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    const wrong = (TASTER[0].answer + 1) % 4;
    answer(wrong);
    expect(screen.getByText("Not quite.")).toBeTruthy();
    expect(screen.getByText(/Nested loops are about 10¹⁰ steps/)).toBeTruthy();
    // locked: a second click on another option changes nothing
    answer(TASTER[0].answer);
    expect(screen.getByText("Not quite.")).toBeTruthy();
    expect(screen.getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true);
  });

  it("skipping counts as wrong; finishing everything else right gives the DSE band", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    // skip problem 3's two questions (indexes 4 and 5)
    for (let i = 0; i < 4; i++) { answer(TASTER[i].answer); proceed(); }
    fireEvent.click(screen.getByRole("button", { name: /Skip this one/ }));
    fireEvent.click(screen.getByRole("button", { name: /Skip this one/ }));
    for (let i = 6; i < TASTER.length; i++) { answer(TASTER[i].answer); proceed(); }
    expect(screen.getByText(/read it like a DSE candidate/i)).toBeTruthy();
    expect(screen.getByText(/2 of 3 coding problems fully right/)).toBeTruthy();
  });

  it("when the coding clock runs out it jumps to the interview, leaving the rest unanswered", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    answer(TASTER[0].answer); proceed(); // one answered, then the clock expires
    act(() => { vi.advanceTimersByTime(250 * 1000); });
    expect(screen.getByText(/Interview · question 7 of 9/)).toBeTruthy();
    expect(screen.getByText("No clock here")).toBeTruthy();
  });

  it("the clock counts down in m:ss", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    expect(screen.getByLabelText(/seconds left/).textContent).toBe("4:00");
    act(() => { vi.advanceTimersByTime(65 * 1000); });
    expect(screen.getByLabelText(/seconds left/).textContent).toBe("2:55");
  });

  it("result offers the unlock button only to people who do not have Premium, and it calls onUnlock", () => {
    const onUnlock = vi.fn();
    const { unmount } = mount({ onUnlock });
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    for (const q of TASTER) { answer(q.answer); proceed(); }
    fireEvent.click(screen.getByRole("button", { name: /Unlock all questions · ₹299/ }));
    expect(onUnlock).toHaveBeenCalledTimes(1);
    unmount();

    mount({ premium: true });
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    for (const q of TASTER) { answer(q.answer); proceed(); }
    expect(screen.queryByRole("button", { name: /Unlock all questions/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Practise the full set/ })).toBeTruthy();
  });

  it("'Take it again' resets everything", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Start the taster/ }));
    for (const q of TASTER) { answer(q.answer); proceed(); }
    fireEvent.click(screen.getByRole("button", { name: /Take it again/ }));
    expect(screen.getByText(/question 1 of 9/)).toBeTruthy();
    expect(screen.queryByText("Correct.")).toBeNull();
  });
});
