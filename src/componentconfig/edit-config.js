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
 ******************************************************************************/

import React from 'react';
import {FormGroup, FormControl, FormLabel} from 'react-bootstrap';
import Dialog from '../common/dialogs/dialog';
import ParametersEditor from '../common/parameters-editor';
import SelectFile from "../file/select-file";

class EditConfigDialog extends React.Component {
    valid = false;

    constructor(props) {
        super(props);

        this.state = {
            selectedFile: null,
            name: '',
            icID: '',
            configuration: null,
            startParameters: {},
            selectedFileID:0

        };
    }


    onClose(canceled) {
        if (canceled === false) {
            if (this.valid) {
                let data = this.props.config;
                if (this.state.name !== '' && this.props.config.name !== this.state.name) {
                    data.name = this.state.name;
                }
                if (this.state.icID !== '' && this.props.config.icID !== parseInt(this.state.icID)) {
                    data.icID = parseInt(this.state.icID, 10);
                }
                if(this.state.startParameters !==  {} && this.props.config.startParameters !== this.state.startParameters){
                    data.startParameters = this.state.startParameters;
                }
                if (parseInt(this.state.selectedFileID, 10) !== 0 &&
                  this.props.config.selectedFileID !== parseInt(this.state.selectedFileID)) {
                  data.selectedFileID = parseInt(this.state.selectedFileID, 10);
                }

                //forward modified config to callback function
                this.props.onClose(data)
            }
        } else {
            this.props.onClose();
        }
    }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
        this.valid = this.isValid()
    }

    handleParameterChange(data) {
      if (data) {
        this.setState({startParameters: data});
      }


      this.valid = this.isValid()
    }

    handleSelectedFileChange(newFileID){
      console.log("Config file change to: ", newFileID);
      this.setState({selectedFileID: newFileID})

      this.valid = this.isValid()
    }

    isValid() {
      // input is valid if at least one element has changed from its initial value
      return this.state.name !== ''
        || this.state.icID !== ''
        || this.state.startParameters !== {}
        || this.state.selectedFile != null
        || this.state.configuration != null
        || this.state.selectedFileID !== 0;
    }

    resetState() {
        //this.setState({});
    }

    render() {
        const ICOptions = this.props.ics.map(s =>
            <option key={s.id} value={s.id}>{s.name}</option>
        );

        return (
            <Dialog show={this.props.show} title="Edit Component Configuration" buttonTitle="Save" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
                <form>
                    <FormGroup controlId="name">
                        <FormLabel column={false}>Name</FormLabel>
                        <FormControl type="text" placeholder={this.props.config.name} value={this.state.name} onChange={(e) => this.handleChange(e)} />
                        <FormControl.Feedback />
                    </FormGroup>

                    <FormGroup controlId="icID">
                      <FormLabel column={false}> Infrastructure Component </FormLabel>
                      <FormControl as="select" placeholder='Select infrastructure component' value={this.state.icID} onChange={(e) => this.handleChange(e)}>
                        {ICOptions}
                      </FormControl>
                    </FormGroup>

                    <SelectFile type='config' name='Configuration File' onChange={(e) => this.handleSelectedFileChange(e)} value={this.state.selectedFileID} scenarioID={this.props.config.scenarioID}/>

                    <FormGroup controlId='startParameters'>
                        <FormLabel> Start Parameters </FormLabel>
                        <ParametersEditor content={this.props.config.startParameters} onChange={(data) => this.handleParameterChange(data)} />
                    </FormGroup>
                </form>
            </Dialog>
        );
    }
}

export default EditConfigDialog;
