import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("offers nearby food discovery and a manual location alternative", () => {
  render(<HomePage />);
  expect(screen.getByRole("button", { name: /find food near me/i })).toBeVisible();
  expect(screen.getByLabelText(/city or neighborhood/i)).toBeVisible();
});
