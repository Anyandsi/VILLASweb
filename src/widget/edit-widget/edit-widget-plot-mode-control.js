/**
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
 **********************************************************************************/

import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

class EditWidgetPlotModeControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      widget: {},
    };
  }

  static getDerivedStateFromProps(props, state){
    return {
      widget: props.widget,
    };
  }

  handleModeChange(e){

    this.props.handleChange({ target: { id: this.props.controlId, value: e.target.value } });

  }

  render() {

    return (
        <Form.Group controlId="mode">
          <Form.Label>Select mode</Form.Label>
          <Form.Control as="select" value={this.props.widget.customProperties.mode || ""} onChange={(e) => this.handleModeChange(e)}>
          <option key={0} value={"auto time-scrolling"}>Auto time-scrolling</option>
          <option key={1} value={"last samples"}>Last samples</option>
          </Form.Control>
        </Form.Group>
    );
  }
}

export default EditWidgetPlotModeControl;