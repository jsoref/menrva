import React from "react";
import propTypes from "prop-types";
import Link from "next/link";
import styled from "react-emotion";
import theme from "../styles/theme";
import Commit from "./svg/Commit";
import Avatar from "./Avatar";

export default class CommitData extends React.Component {
  static propTypes = {
    commit: propTypes.object,
    repo: propTypes.string,
    pr: propTypes.string,
  };

  render() {
    const { repo, pr, commit } = this.props;
    const url = `https://github.com/${repo}/pull/${pr}`;

    return (
      <Link href={url}>
        <Container>
          {commit?.message}
          <StyledAvatar email={commit?.author?.email} size="small" />
          <StyledCommit />
        </Container>
      </Link>
    );
  }
}

let Container = styled("div")`
  display: flex;
  align-items: center;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  font-size: 0.7em;
  background: rgba(0, 0, 0, 0.1);
`;

let StyledAvatar = styled(Avatar)`
  width: 1.25em;
  height: 1.25em;
  margin-left: 0.25em;
  border-radius: 10px;
`;

let StyledCommit = styled(Commit)`
  height: 0.6em;
  color: ${theme.gray8};
  margin-left: 0.25em;
`;
