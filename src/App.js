import React, {Component} from 'react';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };

        this.handleUpload = this.handleUpload.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
    }

    // Changes the background color to light purple when website first starts.
    componentDidMount() {
        document.body.style.backgroundColor = "#D8BFD8"
    }

    handleUpload() {
        alert("Upload clicked")
    }

    handleDownload = () => {
        alert("Download clicked")
    };

    render() {
        return (
            <div align="center">
                <button onClick={() => {
                    this.handleUpload();
                }}><font size="4">Upload</font>
                </button>
                <br/>
                <br/>
                <button onClick={() => {
                    this.handleDownload();
                }}><font size="4">Download</font>
                </button>
            </div>
        );
    }
}

export default App;
