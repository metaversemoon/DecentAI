import React, {Component} from 'react'

import './node-list.css';
import { fetchNodes } from '../fetchNodes';
import NodeListItem from './node-list-item';

import styled from 'styled-components'

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

export default class NodeList extends Component {

    constructor(props) {
        super()
        this.routeToPage = props.routeToPage
        this.text = props.text
        this.state = {
            nodes :[],
            attendeeCount: {},
            loading: true
        }
    }
    componentDidMount() {
        this.getNodes();
    }
    getNodes = async () => {
        const e = await fetchNodes()

        
        console.log(e)
        console.log('TOTAL NODES: ' + e.length)
        let lockAddresses = []
        for (let i = 0; i < e.length; ++i) {
            lockAddresses.push("\"" + e[i].lockAddress + "\"")
        }
        // console.log(ac)
        this.setState({nodes: e, loading: false})
    }
    render() {
        return (
            <div style={{paddingLeft: '200px', paddingRight: '200px', display: 'flex', flexDirection: 'column'}}>

{!this.state.loading &&  <SelectNodeTitle>Select a node</SelectNodeTitle>}
                  {this.state.loading &&  <div className="loader"/>}

                <div id="node-list-bg">
                    {this.state.nodes.map((node, index) => {
                    return <NodeListItem node1={node} text={this.text} routeToPage={this.routeToPage} key={index}></NodeListItem>
                })}
                </div>
            </div>
        );
    }
}

