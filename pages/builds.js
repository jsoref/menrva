import React from "react";
import styled from "react-emotion";
import { withRouter } from "next/router";
import BuildInfo from "../components/BuildInfo";

import LoadingSpinner from "../components/LoadingSpinner";

import theme from "../styles/theme";
import { fadeIn } from "../styles/keyframes";
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

    if (!builds) return <StyledLoadingSpinner />;

    return (
      <div>
        <BuildsHeader>
          <Label style={{ textAlign: "right" }}>Build</Label>
          <Label>Pull Request</Label>
          <Label style={{ textAlign: "center" }}>Snapshots</Label>
          <Label style={{ textAlign: "center" }}>Status</Label>
        </BuildsHeader>
        {builds.map((build, i) => (
          <div key={i}>
            <StyledBuildInfo {...build} showMeta={true} interactive={true} />
          </div>
        ))}
      </div>
    );
  }
}

let StyledBuildInfo = styled(BuildInfo)`
  padding: 2em 5em 2em 3em;
`;

let StyledLoadingSpinner = styled(LoadingSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  opacity: 0;
  animation: 2s forwards ${fadeIn};
`;

let BuildsHeader = styled("div")`
  display: grid;
  grid-template-columns: ${theme.buildColumnLayout};
  grid-column-gap: 3em;
  padding: 1.5em 5em 1.5em 3em;
  align-items: center;
  border-bottom: 1px solid ${theme.gray3};
  background: ${theme.gray1};
  user-select: none;
`;

let Label = styled("div")`
  color: ${theme.gray6};
  font-size: 0.75em;
  text-transform: uppercase;
`;

export default withRouter(Builds);