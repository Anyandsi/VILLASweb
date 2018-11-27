/**
 * File: new-simulator.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 02.03.2017
 *
 * This file is part of VILLASweb.
 *
 * VILLASweb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VILLASweb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with VILLASweb. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import _ from 'lodash';

import Dialog from './dialog';
import ParametersEditor from '../parameters-editor';

class EditSimulatorDialog extends React.Component {
  valid = true;

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      endpoint: ''
    };
  }

  onClose(canceled) {
    if (canceled === false) {
      if (this.valid) {
        let data = {};

        if (this.state.name != null && this.state.name !== "" && this.state.name !== _.get(this.props.simulator, 'rawProperties.name')) {
          data.name = this.state.name;
        }

        if (this.state.endpoint != null && this.state.endpoint !== "" && this.state.endpoint !== "http://" && this.state.endpoint !== _.get(this.props.simulator, 'rawProperties.endpoint')) {
          data.endpoint = this.state.endpoint;
        }

        this.props.onClose(data);
      }
    } else {
      this.props.onClose();
    }
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  resetState() {
    this.setState({
      name: _.get(this.props.simulator, 'properties.name') || _.get(this.props.simulator, 'rawProperties.name'),
      endpoint: _.get(this.props.simulator, 'properties.endpoint') || _.get(this.props.simulator, 'rawProperties.endpoint')
    });
  }

  render() {
    return (
      <Dialog show={this.props.show} title="Edit Simulator" buttonTitle="Save" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
        <form>
          <FormGroup controlId="name">
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text" placeholder={_.get(this.props.simulator, 'rawProperties.name')} value={this.state.name} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="endpoint">
            <ControlLabel>Endpoint</ControlLabel>
            <FormControl type="text" placeholder={_.get(this.props.simulator, 'rawProperties.endpoint')} value={this.state.endpoint || 'http://' } onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId='properties'>
            <ControlLabel>Properties</ControlLabel>
            <ParametersEditor content={_.merge({}, this.props.simulator.rawProperties, this.props.simulator.properties)} disabled={true} />
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}

export default EditSimulatorDialog;