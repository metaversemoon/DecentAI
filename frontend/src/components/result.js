import React, { Component } from 'react'

import './node-list.css';
import { delay, fetchNodes } from '../fetchNodes';
import NodeListItem from './node-list-item';

import styled from 'styled-components'
import Button from 'react-bootstrap/Button';
import { waitForResponse } from '../utils/inferenceHelpers';

const ResultTitle = styled.p`

font-family: 'Satoshi';
font-style: normal;
font-weight: 500;
font-size: 30px;
/* identical to box height, or 96px */

text-align: center;
letter-spacing: -0.04em;

margin-bottom: 150px;
`

export default class Result extends Component {

    constructor(props) {
        super()
        this.requestId = props.requestId
        this.routeToPage = props.routeToPage
        this.state = {
            loading: true,
            resultImage: ''
        }
    }

    componentDidMount() {
        this.addListener();
    }

    addListener = async () => {
        waitForResponse((result) => {
            this.setState({
                loading: false,
                resultImage: result
            })
        })
       
    }

    render() {
        return (
            <div style={{ paddingLeft: '200px', paddingRight: '200px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>

                {this.state.loading && <ResultTitle>Waiting for results...<br></br>It usually takes less than 20s</ResultTitle>}
                {this.state.loading && <div className="loader" />}

                {!this.state.loading && <ResultTitle>Here is your output</ResultTitle>}

                <img src={this.state.resultImage} style={{marginTop: '20px'}}></img>
               
                {!this.state.loading && <Button id="start-button" onClick={() => this.routeToPage('home')}>Generate another image</Button>}
                
                {' '}

            </div>
        );
    }
}

