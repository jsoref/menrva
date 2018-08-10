import React from "react";
import styled from "react-emotion";
import Link from "next/link";
import { withRouter } from "next/router";

import BuildInfo from "../components/BuildInfo";
import BreadCrumbs from "../components/Breadcrumbs";
import LoadingSpinner from "../components/LoadingSpinner";
import theme from "../styles/theme";
import api from "../util/api";

class Builds extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      builds: null,
    };
  }

  async componentDidMount() {
    const { router } = this.props;
    const builds = await api.get(`/api/builds/${router.query.repo}`);

    this.setState({ builds });
  }

  render() {
    let { builds } = this.state;

    if (!builds) return <LoadingSpinner />;

    return (
      <div>
        <BreadCrumbs>
          <Link href="/">
            <a>Home</a>
          </Link>{" "}
          /
          <Link href="/">
            <a>{this.props.router.query.repo}</a>
          </Link>
        </BreadCrumbs>
        {builds.map((build, i) => (
          <div key={i}>
            <BuildInfo {...build} />
          </div>
        ))}
      </div>
    );
  }
}

export default withRouter(Builds);
