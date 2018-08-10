import React from "react";
import propTypes from "prop-types";
import Gravatar from "react-gravatar";
import styled from "react-emotion";
import theme from "../styles/theme";

export default class Avatar extends React.Component {
  static propTypes = {
    url: propTypes.string,
    image: propTypes.string,
  };

  render() {
    return (
      <AvatarContainer {...this.props} href={this.props.url}>
        {this.props.image && <img src={this.props.image} />}
        {this.props.email && <Gravatar email={this.props.email} />}
        {!this.props.email && this.props.image && <Placeholder />}
      </AvatarContainer>
    );
  }
}

let AvatarContainer = styled("div")`
  background: url(${p => p.background});
  background-size: cover;
  border: ${p => (p.size == "small" ? "1px" : "4px")} solid #fff;
  border-radius: 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 5em;
  max-height: 5em;
  cursor: ${p => (p.url ? "pointer" : "default")};

  &:hover {
    transform: scale(1.1);
  }

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

let Placeholder = styled("div")`
  width: 100%;
  height: 100%;
  background: ${theme.gray4};
`;
