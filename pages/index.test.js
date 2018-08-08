import React from "react";
import { mount } from "enzyme";

import Index from "./index";

describe("Index", function() {
  it("renders", async function() {
    let wrapper = mount(<Index />);
    await expect(wrapper).toSnapshot();
  });
});
