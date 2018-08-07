import React from "react";
import axios from "axios";
import firebase from "firebase";

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
  }
  async handleUploadImage = (ev) => {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    const idToken = await firebase.auth().currentUser?.getIdToken();
     const response = await axios.post('/api/placeholder-token/upload', data, {
       headers: {
         Authorization: `Bearer: ${idToken}`
       }
    })

    const json = await response.json();
    console.log(await response.json());
  }

  render() {
    let { token } = this.state;
    return (
      <form onSubmit={this.handleUpload}>
                    <input ref={(ref) => { this.uploadInput = ref; }} type="file" />

        <button>
          Upload
        </button>
      </form>
    );
  }
}
