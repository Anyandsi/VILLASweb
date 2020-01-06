/**
 * File: edit-widget-checkbox-control.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 19.08.2017
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
import { FormGroup, FormCheck } from 'react-bootstrap';

class EditWidgetCheckboxControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      widget: {
        customProperties:{

        }
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ widget: nextProps.widget });
  }

  render() {
    return <FormGroup>
      <FormCheck id={this.props.controlId} label={this.props.controlId} checked={this.state.widget[this.props.controlId] || this.state.widget.customProperties[this.props.controlId] || ''} onChange={e => this.props.handleChange(e)}></FormCheck>
    </FormGroup>;
  }
}

export default EditWidgetCheckboxControl;
