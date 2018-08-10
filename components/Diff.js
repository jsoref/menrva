import React, { Component } from "react";
import styled from "react-emotion";
import pixelMatch from "pixelmatch";
import propTypes from "prop-types";
import theme from "../styles/theme";

class Diff extends Component {
  static propTypes = {
    src1: propTypes.string,
    src2: propTypes.string,
  };

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.image1 = React.createRef();
    this.image2 = React.createRef();
    this.state = {
      image1Loaded: false,
      image2Loaded: false,
      overlayVisible: true,
    };
  }

  getImageData(image) {
    let canvas = this.canvas.current;
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height);
  }

  diffImages() {
    let canvas = this.canvas.current;
    let context = canvas.getContext("2d");

    if (
      !this.image1 ||
      !this.image2 ||
      !this.image1.current ||
      !this.image2.current
    )
      return;

    let img1 = this.getImageData(this.image1.current);
    let img2 = this.getImageData(this.image2.current);

    let width = Math.max(
      this.image1.current.naturalWidth,
      this.image2.current.naturalWidth
    );

    let height = Math.max(
      this.image1.current.naturalHeight,
      this.image2.current.naturalHeight
    );

    let diff = context.createImageData(width, height);

    pixelMatch(img1.data, img2.data, diff.data, width, height, {
      threshold: 0.1,
    });

    context.putImageData(diff, 0, 0);
  }

  registerImage(img) {
    return new Promise(resolve => {
      if (!img) resolve();
      img.onload = () => resolve(img);
    });
  }

  componentDidMount() {
    let { image1, image2, registerImage, diffImages } = this;
    Promise.all([
      registerImage(image1?.current),
      registerImage(image2?.current),
    ]).then(diffImages.bind(this));
  }

  toggleOverlay() {
    this.setState({ overlayVisible: !this.state.overlayVisible });
  }

  render() {
    // TODO empty state when src doesn't exist (either 1 or 2)
    return (
      <DiffRow onClick={() => this.toggleOverlay()}>
        <DiffImageContainer>
          {this.props.src1 ? (
            <DiffLabel type="changes">Changes</DiffLabel>
          ) : (
            <DiffLabel type="changes">No Diff</DiffLabel>
          )}
          <OverlayCanvas
            innerRef={this.canvas}
            overlayVisible={this.state.overlayVisible}
          />
          {this.props.src1 && (
            <DiffImage
              alt="image1"
              src={`${this.props.src1}?t=${new Date().getTime()}`}
              innerRef={this.image1}
              crossOrigin="anonymous"
            />
          )}
        </DiffImageContainer>

        <DiffImageContainer>
          {this.props.src1 ? (
            <DiffLabel type="original">Original</DiffLabel>
          ) : (
            <DiffLabel type="new">New</DiffLabel>
          )}
          {this.props.src2 && (
            <DiffImage
              alt="image2"
              src={`${this.props.src2}?t=${new Date().getTime()}`}
              innerRef={this.image2}
              crossOrigin="anonymous"
            />
          )}
        </DiffImageContainer>
      </DiffRow>
    );
  }
}

let getColor = type => {
  if (type == "changes") return theme.red;
  if (type == "original") return theme.green;
  if (type == "new") return theme.orange;
};

let DiffRow = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1.5em 3em;
  grid-column-gap: 2em;
  background: ${theme.gray1};
  cursor: pointer;
`;

let DiffImageContainer = styled("div")`
  position: relative;
  background: ${theme.gray3};
  line-height: 0;
`;

let DiffImage = styled("img")`
  width: 100%;
  height: auto;
  user-select: none;
  box-shadow: rgba(0, 0, 0, 0.02) 0px 0px 20px 10px;
  border: 2px solid ${theme.gray3};
`;

let OverlayCanvas = styled("canvas")`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  border: 2px solid ${theme.gray3};
  opacity: ${p => (p.overlayVisible ? 0.85 : 0)};
`;

let DiffLabel = styled("div")`
  background: ${p => getColor(p.type)};
  padding: 0.5em 1em;
  color: #fff;
  border-radius: 4em;
  position: absolute;
  top: 0;
  right: -1em;
  font-size: 0.75em;
  z-index: 99;
  transform: translateY(-50%);
  display: flex;
  line-height: 1;
`;

export default Diff;
