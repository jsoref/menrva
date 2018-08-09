import React from "react";
import { mount } from "enzyme";

import Index from "./index";
import Build from "./build";

describe("Index", function() {
  it("renders", async function() {
    let wrapper = mount(<Index />);
    await expect(wrapper).toSnapshot();
  });
});

describe("Build", function() {
  it("renders", async function() {
    let wrapper = mount(<Build />);
    await expect(wrapper).toSnapshot();
  });
});
