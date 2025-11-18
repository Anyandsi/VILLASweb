/**
 * This file is part of VILLASweb.
 *
 * VILLASweb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VILLASweb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with VILLASweb. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

// tests/pages/scenarios.test.jsx
import { vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// mocking of RTK entries
vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ auth: { user: { role: "Admin" }, token: "Token" } }),
}));

const scenarios = [
  {
    id: 1,
    name: "SLEW",
    isLocked: false,
    createdAt: "2024-06-27T16:00:36.611236Z",
    updatedAt: "2024-10-31T12:27:57.888382Z",
    startParameters: {},
  },
];

vi.mock("../../src/store/apiSlice", () => {
  const refetchScenarios = vi.fn();
  const updateScenario = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({}),
  }));
  const deleteScenario = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({}),
  }));
  const addScenario = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({}),
  }));

  return {
    useGetScenariosQuery: vi.fn(() => ({
      data: { scenarios },
      refetch: refetchScenarios,
    })),
    useGetConfigsQuery: vi.fn(() => ({ data: { configs: [] } })),
    useGetDashboardsQuery: vi.fn(() => ({ data: { dashboards: [] } })),

    useUpdateScenarioMutation: vi.fn(() => [
      updateScenario,
      { isLoadingUpdate: false },
    ]),
    useAddScenarioMutation: vi.fn(() => [
      addScenario,
      { isLoadingPost: false },
    ]),
    useDeleteScenarioMutation: vi.fn(() => [
      deleteScenario,
      { isLoadingDelete: false },
    ]),

    __mocks__: { refetchScenarios, updateScenario },
  };
});

vi.mock("../../src/pages/scenarios/dialogs/new-scenario", () => ({
  default: () => null,
}));
vi.mock("../../src/pages/scenarios/dialogs/import-scenario", () => ({
  default: () => null,
}));
vi.mock("../../src/common/dialogs/delete-dialog", () => ({
  default: () => null,
}));
vi.mock("../../src/pages/scenarios/dialogs/edit-scenario", () => ({
  default: ({ show, scenario, onClose }) =>
    show ? (
      <div data-testid="edit-dialog">
        <div data-testid="edit-name">{scenario?.name}</div>
        <button
          data-testid="edit-ok"
          onClick={() => onClose({ name: "Edited" })}
        >
          ok
        </button>
      </div>
    ) : null,
}));

import Scenarios from "../../src/pages/scenarios/scenarios";
import { __mocks__ as api } from "../../src/store/apiSlice";

describe("Scenarios renders", () => {
  let table;
  let rows;

  beforeEach(async () => {
    vi.clearAllMocks();

    render(
      <MemoryRouter>
        <Scenarios />
      </MemoryRouter>
    );

    table = await screen.findByRole("table");
    rows = within(table).getAllByRole("row").slice(1);
  });

  it("creates one row per scenario", () => {
    expect(rows.length).toEqual(scenarios.length);
  });

  describe("every scenario row", () => {
    scenarios.forEach((scenario, i) => {
      describe(`scenario ${scenario.id}`, () => {
        it("has correct id", () => {
          const cells = within(rows[i]).getAllByRole("cell");
          const idCell = cells[0];
          expect(idCell).toHaveTextContent(String(scenario.id));
        });

        it("has correct name", () => {
          const cells = within(rows[i]).getAllByRole("cell");
          const nameCell = cells[1];
          expect(nameCell).toHaveTextContent(scenario.name);
        });

        describe("lock button", () => {
          it("shows unchecked when isLocked = false", () => {
            const cells = within(rows[i]).getAllByRole("cell");
            const lockCell = cells[2];
            const checkbox = within(lockCell).getByRole("checkbox");
            expect(checkbox).not.toBeChecked();
          });

          it("locks scenario when clicked", async () => {
            const cells = within(rows[i]).getAllByRole("cell");
            const lockCell = cells[2];
            const label = lockCell.querySelector(`label[for="${scenario.id}"]`);
            expect(label).not.toBeNull();

            fireEvent.click(label);

            await waitFor(() => {
              expect(api.updateScenario).toHaveBeenCalledTimes(1);
              expect(api.updateScenario.mock.calls[0][0]).toMatchObject({
                id: scenario.id,
                scenario: expect.objectContaining({ isLocked: true }),
              });
              expect(api.refetchScenarios).toHaveBeenCalledTimes(1);
            });
          });
        });
      });
    });
  });
});
