import React from "react";
import { mount } from "enzyme";

import { Index } from "./index";

jest.mock("../util/api", () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
  };
});
describe("Index", function() {
  it("renders", async function() {
    let wrapper = mount(<Index repos={["billyvg/menrva"]} />);
    await expect(wrapper).toSnapshot();
  });
});
