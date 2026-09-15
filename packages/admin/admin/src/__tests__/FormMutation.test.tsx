import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "test-utils";
import { describe, expect, it } from "vitest";

import { FormMutation } from "../FormMutation";

const updateMutation = gql`
    mutation Update($id: ID!) {
        update(id: $id) {
            id
        }
    }
`;

const createMutation = gql`
    mutation Create {
        create {
            id
        }
    }
`;

describe("FormMutation", () => {
    it("should pass the mutation actions and state to its children", () => {
        render(
            <MockedProvider mocks={[]}>
                <FormMutation updateMutation={updateMutation} createMutation={createMutation}>
                    {({ update, create }, { loading, error }) => (
                        <div>
                            <span data-testid="types">{`${typeof update} ${typeof create}`}</span>
                            <span data-testid="state">{`${loading} ${error === undefined}`}</span>
                        </div>
                    )}
                </FormMutation>
            </MockedProvider>,
        );

        expect(screen.getByTestId("types").textContent).toBe("function function");
        expect(screen.getByTestId("state").textContent).toBe("false true");
    });
});
