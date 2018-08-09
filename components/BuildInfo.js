import React, { Component } from 'react';
import styled from 'react-emotion';
import Diff from './Diff';
import propTypes from 'prop-types';
import Link from 'next/link';
import theme from '../styles/theme';

class BuildInfo extends Component {
  static propTypes = {
    id: propTypes.number,
    commit: propTypes.object, //expound on this later
    snapshots: propTypes.array,
    status: propTypes.string,
    interactive: propTypes.bool,
    showMeta: propTypes.bool,
    showApproveButton: propTypes.bool,
  }

  time() {
    return new Date(this.props.commit.time * 1000).toLocaleTimeString('en-US', {hour12: false});
  }

  render() {
    return (
      <Link href={{ pathname: '/build', query: { id: this.props.id } }}>
        <Container {...this.props}>
          <BuildNumberAndTime>
            <BuildNumber>{this.props.id}</BuildNumber>
            <Time>{this.time()}</Time>
          </BuildNumberAndTime>
          <CommitInfo>
            <PullRequestTitle>
              {this.props.commit.pull.name}&nbsp;
              <span style={{fontWeight: "normal"}}>by</span>&nbsp;
              {this.props.commit.pull.author}
            </PullRequestTitle>
            <CommitHash href={this.props.commit.url}>#{this.props.commit.hash}</CommitHash>
          </CommitInfo>
          <SnapshotsInfo>
            {this.props.showMeta ? this.props.snapshots.length : ''}
          </SnapshotsInfo>
          <Status>
            {this.props.showApproveButton ?
              <ApproveButton status={this.props.status}>
                {(this.props.status == 'approved') ? 'Approved' : 'Approve'}
              </ApproveButton> :
              <BuildStatus status={this.props.status}>
                {this.props.status}
              </BuildStatus>
            }
          </Status>
        </Container>
      </Link>
    )
  }
}

let getColor = (status) => {
  if (status == "passed") return theme.green;
  if (status == "failed") return theme.red;
  return theme.gray8;
}

let Container = styled('div')`
  color: ${theme.gray7};
  text-decoration: none;
  padding: 2em 0 2em;
  align-items: center;
  border-bottom: 1px solid ${theme.gray3};
  display: grid;
  grid-template-columns: ${theme.buildColumnLayout};
  grid-column-gap: 3em;
  user-select: none;

  &:hover {
    background: ${p => p.interactive ? theme.gray2 : 'inherit'};
    cursor: ${p => p.interactive ? 'pointer' : 'inherit'};
  }
`;

let CommitInfo = styled('div')`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

let CommitHash = styled('span')`
  color: ${theme.gray8};
`;

let PullRequestTitle = styled('span')`
  font-size: 1.2em;
  font-weight: bold;
  text-decoration: none;
  margin-bottom: 0.25em;
`;

let BuildNumberAndTime = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

let Time = styled('div')`
  font-size: 0.75em;
`;

let SnapshotsInfo = styled('div')`
  font-size: 2em;
  font-weight: bold;
  text-align: center;
`;

let Status = styled('div')`
  display: flex;
  justify-content: center;
`

let BuildStatus = styled('div')`
  border-radius: 5em;
  padding: 1em 2em;
  font-size: 0.75em;
  background-color: ${p => getColor(p.status)};
  color: ${theme.gray2};
`

let BuildNumber = styled('h1')`
  font-weight: bold;
  font-size: 2.1em
`;

let ApproveButton = styled(BuildStatus)`
  background-color: ${theme.green};
  font-size: 1rem;
  border: 2px solid #fff;
  padding: 1em 4em;
  box-shadow: rgba(0, 0, 0, 0.05) 1px 1px 5px 1px;
`

export default BuildInfo;
