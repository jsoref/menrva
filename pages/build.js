import React, { Component } from 'react';
import styled from 'react-emotion';
import propTypes from 'prop-types';
import { withRouter } from 'next/router'

import Diff from '../components/Diff';
import BuildInfo from '../components/BuildInfo';
import theme from '../styles/theme';
import mock from "../mock-response";

class Build extends Component {
  render() {
    let mockRouter = {query: {id: 134}};
    let router = this.props.router || mockRouter;
    let build = mock.builds.find(b => b.id == router.query.id);

    return (
      <div>
        <StyledBuildInfo {...build} showApproveButton={true}/>
        {build.snapshots.map(snapshot => (
          <div>
            <BuildTitle>{snapshot.name}</BuildTitle>
            <Diff
              src1={snapshot.src1}
              src2={snapshot.src2}
            />
          </div>
        ))}
      </div>
    )
  }
}

let StyledBuildInfo = styled(BuildInfo)`
  padding-right: 5em;
`

let BuildTitle = styled('div')`
  font-size: 1.1em;
  text-decoration: none;
  padding: 1em 3em 1.2em 3em;
  background-color: #fff;
  border-bottom: 1px solid ${theme.gray3};
`;

export default withRouter(Build);
