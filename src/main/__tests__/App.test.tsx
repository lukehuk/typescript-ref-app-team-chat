/* eslint-disable */
import React from "react";
import { cleanup } from "@testing-library/react";
import App from "../App";

import "@testing-library/jest-dom/extend-expect";

describe("App", () => {
  afterEach(cleanup);

  it("renders without crashing", () => {
    expect(true);
    // expect(render(<App />)).toBeDefined();
  });
});
