import React, { Component } from 'react';
import styled from 'react-emotion';
import pixelMatch from 'pixelmatch';
import propTypes from 'prop-types';
import theme from '../styles/theme';

class Diff extends Component {
  static propTypes = {
    src1: propTypes.string,
    src2: propTypes.string
  }

  constructor(props) {
    super(props)
    this.canvas = React.createRef();
    this.image1 = React.createRef();
    this.image2 = React.createRef();
    this.state = {
      image1Loaded: false,
      image2Loaded: false,
      overlayVisible: true
    }
  }

  getImageData(image) {
    let canvas = this.canvas.current;
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height);
  }

  diffImages() {
    let canvas = this.canvas.current;
    let context = canvas.getContext('2d');

    let img1 = this.getImageData(this.image1.current);
    let img2 = this.getImageData(this.image2.current);


    let width = Math.max(this.image1.current.naturalWidth, this.image2.current.naturalWidth);
    let height = Math.max(this.image1.current.naturalHeight, this.image2.current.naturalHeight);

    let diff = context.createImageData(width, height);

    pixelMatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});

    context.putImageData(diff, 0, 0);
  }

  registerImage(img) {
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    })
  }

  componentDidMount() {
    let {image1, image2, registerImage, diffImages} = this;
    Promise.all([registerImage(image1.current), registerImage(image2.current)]).then(diffImages.bind(this))
  }

  toggleOverlay() {
    this.setState({overlayVisible: !this.state.overlayVisible})
  }

  render() {
    return (
      <DiffRow onClick={() => this.toggleOverlay()}>
        <div style={{position: 'relative'}}>
          <OverlayCanvas
            innerRef={this.canvas}
            overlayVisible={this.state.overlayVisible}
          />
          <DiffImage
            alt="image1"
            src={`${this.props.src1}?t=${new Date().getTime()}`}
            innerRef={this.image1}
            crossOrigin="anonymous"
          />
        </div>
        <DiffImage
          alt="image2"
          src={`${this.props.src2}?t=${new Date().getTime()}`}
          innerRef={this.image2}
          crossOrigin="anonymous"
        />
      </DiffRow>
    );
  }
}

let DiffRow = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3em;
  grid-column-gap: 1em;
  background: ${theme.gray1};
  cursor: pointer;
`;

let DiffImage = styled('img')`
  width: 100%;
  height: auto;
  user-select: none;
  box-shadow: rgba(0,0,0,0.02) 0px 0px 20px 10px;
  border: 2px solid ${theme.gray3};
`;

let OverlayCanvas = styled('canvas')`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  border: 2px solid ${theme.gray3};
  opacity: ${p => p.overlayVisible ? 0.85 : 0};
`

export default Diff;
