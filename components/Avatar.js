import React from "react";
import propTypes from "prop-types";
import styled from "react-emotion";

export default class Avatar extends React.Component {
  static propTypes = {
    url: propTypes.string,
    image: propTypes.string,
  };

  render() {
    return (
      <AvatarContainer {...this.props} href={this.props.url}>
        <AvatarImage background={this.props.image} />
      </AvatarContainer>
    );
  }
}

let AvatarImage = styled("div")`
  background: url(${p => p.background});
  background-size: cover;
  border: 4px solid #fff;
  border-radius: 100%;
  width: 100%;
  height: 100%;
`;

let AvatarContainer = styled("a")`
  display: block;
  cursor: pointer;
  width: 100%;
  height: 100%;
  max-width: 5em;
  max-height: 5em;
  transition: 0.2s transform;

  &:hover {
    transform: scale(1.1);
  }
`;
