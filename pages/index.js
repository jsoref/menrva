import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import Link from "next/link";

import LoadingSpinner from "../components/LoadingSpinner";

import theme from "../styles/theme";
import api from "../util/api";

class Index extends React.Component {
  static propTypes = {
    repos: PropTypes.array,
  };

  render() {
    let { repos } = this.props;

    if (!repos) return <LoadingSpinner />;

    return (
      <div>
        <BuildsHeader>
          <Label>Repository</Label>
        </BuildsHeader>
        {repos.map((repo, i) => (
          <div key={i}>
            <Link href={{ pathname: "/builds", query: { repo } }}>{repo}</Link>
          </div>
        ))}
      </div>
    );
  }
}
class IndexContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { repos: null };
  }

  async componentDidMount() {
    const repos = await api.get("/api/repos");
    this.setState({ repos });
  }

  render() {
    let { repos } = this.state;

    return <Index repos={repos} />;
  }
}

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

export default IndexContainer;
export { Index };
