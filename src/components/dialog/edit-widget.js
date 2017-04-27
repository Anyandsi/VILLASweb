/**
 * File: edit-widget.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 08.03.2017
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

import React, { Component, PropTypes } from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import Dialog from './dialog';

import EditValueWidget from './edit-widget-value';
import EditPlotWidget from './edit-widget-plot';
import EditTableWidget from './edit-widget-table';
import EditImageWidget from './edit-widget-image';

class EditWidgetDialog extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  valid: true;

  constructor(props) {
    super(props);

    this.state = {
      temporal: {
        name: '',
        simulator: '',
        signal: 0
      }
    };
  }

  onClose(canceled) {
    if (canceled === false) {
      this.props.onClose(this.state.temporal);
    } else {
      this.props.onClose();
    }
  }

  handleChange(e, index) {
    var update = this.state.temporal;
    update[e.target.id] = e.target.value;
    this.setState({ temporal: update });

    //console.log(this.state.widget);
  }

  resetState() {
    var widget_data = Object.assign({}, this.props.widget);
    this.setState({ temporal: widget_data });
  }

  validateForm(target) {
    // check all controls
    var name = true;

    if (this.state.name === '') {
      name = false;
    }

    this.valid = name;

    // return state to control
    if (target === 'name') return name ? "success" : "error";
  }

  render() {
    // get widget part
    var widgetDialog = null;

    if (this.props.widget) {
      if (this.props.widget.type === 'Value') {
        widgetDialog = <EditValueWidget widget={this.state.temporal} validate={(id) => this.validateForm(id)} simulation={this.props.simulation} handleChange={(e) => this.handleChange(e)} />;
      } else if (this.props.widget.type === 'Plot') {
        widgetDialog = <EditPlotWidget widget={this.state.temporal} validate={(id) => this.validateForm(id)} simulation={this.props.simulation} handleChange={(e, index) => this.handleChange(e, index)} />;
      } else if (this.props.widget.type === 'Table') {
        widgetDialog = <EditTableWidget widget={this.state.temporal} validate={(id) => this.validateForm(id)} simulation={this.props.simulation} handleChange={(e, index) => this.handleChange(e, index)} />;
      } else if (this.props.widget.type === 'Image') {
        widgetDialog = <EditImageWidget widget={this.state.temporal} files={this.props.files} validate={(id) => this.validateForm(id)} simulation={this.props.simulation} handleChange={(e, index) => this.handleChange(e, index)} />;
      }
    }

    return (
      <Dialog show={this.props.show} title="Edit Widget" buttonTitle="save" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
        <form encType='multipart/form-data'>
          <FormGroup controlId="name" validationState={this.validateForm('name')}>
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text" placeholder="Enter name" value={this.state.temporal.name} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>

          {widgetDialog}
        </form>
      </Dialog>
    );
  }
}

export default EditWidgetDialog;
