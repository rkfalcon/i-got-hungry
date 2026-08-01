import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("offers top-food and cuisine-first location discovery", () => {
  render(<HomePage />);
  expect(screen.getByRole("button", { name: "Find Top Food Near Me" })).toBeVisible();
  expect(screen.getByRole("button", { name: /search selected cuisines near me/i })).toBeVisible();
  expect(screen.queryByLabelText(/city or zip code/i)).not.toBeInTheDocument();
});
