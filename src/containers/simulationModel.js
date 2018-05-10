/**
 * File: simulationModel.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 10.08.2018
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
import { Container } from 'flux/utils';
import { Button } from 'react-bootstrap';

import SimulationModelStore from '../stores/simulation-model-store';
import UserStore from '../stores/user-store';
import AppDispatcher from '../app-dispatcher';

import SelectSimulator from './selectSimulator';

class SimulationModel extends React.Component {
    static getStores() {
        return [ SimulationModelStore, UserStore ];
    }

    static calculateState(prevState, props) {
        const simulationModel = SimulationModelStore.getState().find(m => m._id === props.match.params.simulationModel);

        return {
            simulationModel: simulationModel || {},
            sessionToken: UserStore.getState().token
        };
    }

    componentWillMount() {
        AppDispatcher.dispatch({
            type: 'simulationModels/start-load',
            data: this.props.match.params.simulationModel,
            token: this.state.sessionToken
        });
    }

    submitForm = event => {
        event.preventDefault();
    }

    saveChanges = () => {

    }

    handleSimulatorChange = simulator => {
        console.log(simulator);
    }

    render() {
        return <div className='section'>
            <h1>{this.state.simulationModel.name}</h1>

            <form onSubmit={this.submitForm}>
                <SelectSimulator onChange={this.handleSimulatorChange} value={this.state.simulationModel.simulator} />

                <Button bsStyle='primary' onClick={this.saveChanges}>Save</Button>
            </form>
        </div>;
    }
}

export default Container.create(SimulationModel, { withProps: true });
