import React, {Component} from 'react';
import Spinner from './Spinner'
import Images from './Images'
import Buttons from './Buttons'
import { API_URL } from './config'
import './App.css'
import uw from './uw.jpg';
require('dotenv').config()

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            images: []
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
    onChange = e => {
        const files = Array.from(e.target.files)
        this.setState({ uploading: true })

        const formData = new FormData()

        files.forEach((file, i) => {
            formData.append(i, file)
        })

        fetch(`${API_URL}/image-upload`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(images => {
                this.setState({
                    uploading: false,
                    images
                })
            })
    }

    removeImage = id => {
        this.setState({
            images: this.state.images.filter(image => image.public_id !== id)
        })
    }


    render() {
        const { uploading, images } = this.state

        const content = () => {
            switch (true) {
                case uploading:
                    return <Spinner/>
                case images.length > 0:
                    return <Images images={images} removeImage={this.removeImage}/>
                default:
                    return <Buttons onChange={this.onChange}/>
            }
        }
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
                <div className='buttons'>
                    {content()}
                </div>
            </div>
        );
    }
}

export default App;
