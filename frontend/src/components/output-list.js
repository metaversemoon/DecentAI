import React, {Component} from 'react'

import './node-list.css';
import { fetchNodes } from '../fetchNodes';
import NodeListItem from './node-list-item';

import styled from 'styled-components'
import { getInferences } from '../utils/ratingHelper';
import OutputListItem from './output-list-item';

const SelectNodeTitle = styled.p`

font-family: 'Satoshi';
font-style: normal;
font-weight: 500;
font-size: 30px;
line-height: 100%;
/* identical to box height, or 96px */

text-align: center;
letter-spacing: -0.04em;
margin-top: 16px;
`

export default class OutputList extends Component {

    constructor(props) {
        super()
        this.routeToPage = props.routeToPage
        this.text = props.text
        this.state = {
            images :[],
            attendeeCount: {},
            loading: true
        }
    }
    componentDidMount() {
        this.getImages();
    }
    getImages = async () => {
        const e = await getInferences()
        console.log(e)
        console.log('TOTAL images: ' + e.length)
            this.setState({images: e, loading: false})
    }
    render() {
        return (
            <div style={{paddingLeft: '300px', paddingRight: '300px', display: 'flex', flexDirection: 'column'}}>

            {!this.state.loading &&  <SelectNodeTitle>{this.state.images.length} previous creations</SelectNodeTitle>}
                  {this.state.loading &&  <div className="loader"/>}

                <div id="node-list-bg">
                    {this.state.images.map((image, index) => {
                    return <OutputListItem image={image}routeToPage={this.routeToPage} key={index}></OutputListItem>
                })}
                </div>
            </div>
        );
    }
}

