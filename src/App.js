import React, {Component} from 'react';
import uw from './uw.jpg';

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

    handleUpload = () => {
        alert("Upload clicked")
    }

    handleDownload = () => {
        let element = document.createElement("a");
        element.click();
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
                <img src={uw} alt="uw"/>
                <br/>
                <a href="http://localhost:3000/static/media/uw.48d20167.jpg"
                   download
                   onClick={() => this.handleDownload()}>
                    <button><font size="4">Download</font></button>
                </a>
                <br/>
            </div>
        );
    }
}

export default App;
