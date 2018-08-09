import React from "react";
import { mount } from "enzyme";

import BuildInfo from "./BuildInfo";

describe("BuildInfo", function() {
  it("renders", async function() {
    let wrapper = mount(<BuildInfo />);
    await expect(wrapper).toSnapshot();
  });
});
