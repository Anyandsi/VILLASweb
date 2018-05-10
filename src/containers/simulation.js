/**
 * File: simulation.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 04.03.2017
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
import { Button, Glyphicon } from 'react-bootstrap';
import FileSaver from 'file-saver';
import _ from 'lodash';

import SimulationStore from '../stores/simulation-store';
import SimulatorStore from '../stores/simulator-store';
import SimulationModelStore from '../stores/simulation-model-store';
import UserStore from '../stores/user-store';
import AppDispatcher from '../app-dispatcher';

import Table from '../components/table';
import TableColumn from '../components/table-column';
import NewSimulationModelDialog from '../components/dialog/new-simulation-model';
import EditSimulationModelDialog from '../components/dialog/edit-simulation-model';
import ImportSimulationModelDialog from '../components/dialog/import-simulation-model';

import SimulatorAction from '../components/simulator-action';
import DeleteDialog from '../components/dialog/delete-dialog';

class Simulation extends React.Component {
  static getStores() {
    return [ SimulationStore, SimulatorStore, SimulationModelStore, UserStore ];
  }

  static calculateState(prevState, props) {
    // get selected simulation
    const sessionToken = UserStore.getState().token;

    let simulation = SimulationStore.getState().find(s => s._id === props.match.params.simulation);
    if (simulation == null) {
      AppDispatcher.dispatch({
        type: 'simulations/start-load',
        data: props.match.params.simulation,
        token: sessionToken
      });

      simulation = {};
    }

    // load models
    let simulationModels = [];
    if (simulation.models != null) {
      simulationModels = SimulationModelStore.getState().filter(m => simulation.models.includes(m._id));
    }

    return {
      simulationModels,
      simulation,

      simulators: SimulatorStore.getState(),
      sessionToken,

      newModal: false,
      deleteModal: false,
      editModal: false,
      importModal: false,
      modalData: {},
      modalIndex: null,

      selectedSimulationModels: []
    }
  }

  componentWillMount() {
    AppDispatcher.dispatch({
      type: 'simulations/start-load',
      token: this.state.sessionToken
    });

    AppDispatcher.dispatch({
      type: 'simulationModels/start-load',
      token: this.state.sessionToken
    });

    AppDispatcher.dispatch({
      type: 'simulators/start-load',
      token: this.state.sessionToken
    });
  }

  closeNewModal(data) {
    this.setState({ newModal : false });

    if (data) {
      data.simulation = this.state.simulation._id;

      AppDispatcher.dispatch({
        type: 'simulationModels/start-add',
        data,
        token: this.state.sessionToken
      });

      this.setState({ simulation: {} }, () => {
        AppDispatcher.dispatch({
          type: 'simulations/start-load',
          data: this.props.match.params.simulation,
          token: this.state.sessionToken
        });
      });
    }
  }

  closeDeleteModal = confirmDelete => {
    this.setState({ deleteModal: false });

    if (confirmDelete === false) {
      return;
    }

    AppDispatcher.dispatch({
      type: 'simulationModels/start-remove',
      data: this.state.modalData,
      token: this.state.sessionToken
    });
  }

  closeEditModal(data) {
    this.setState({ editModal : false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'simulationModels/start-edit',
        data,
        token: this.state.sessionToken
      });
    }
  }

  closeImportModal(data) {
    this.setState({ importModal: false });

    if (data) {
      data.simulation = this.state.simulation._id;

      AppDispatcher.dispatch({
        type: 'simulationModels/start-add',
        data,
        token: this.state.sessionToken
      });

      this.setState({ simulation: {} }, () => {
        AppDispatcher.dispatch({
          type: 'simulations/start-load',
          data: this.props.match.params.simulation,
          token: this.state.sessionToken
        });
      });
    }
  }

  getSimulatorName(simulatorId) {
    for (let simulator of this.state.simulators) {
      if (simulator._id === simulatorId) {
        return _.get(simulator, 'properties.name') || _.get(simulator, 'rawProperties.name') ||  simulator.uuid;
      }
    }
  }

  exportModel(index) {
    // filter properties
    const model = Object.assign({}, this.state.simulationModels[index]);
    delete model.simulator;
    delete model.simulation;

    // show save dialog
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'simulation model - ' + model.name + '.json');
  }

  onSimulationModelChecked(index, event) {
    const selectedSimulationModels = Object.assign([], this.state.selectedSimulationModels);
    for (let key in selectedSimulationModels) {
      if (selectedSimulationModels[key] === index) {
        // update existing entry
        if (event.target.checked) {
          return;
        }

        selectedSimulationModels.splice(key, 1);

        this.setState({ selectedSimulationModels });
        return;
      }
    }

    // add new entry
    if (event.target.checked === false) {
      return;
    }

    selectedSimulationModels.push(index);
    this.setState({ selectedSimulationModels });
  }

  runAction = action => {
    for (let index of this.state.selectedSimulationModels) {
      // get simulator for model
      let simulator = null;
      for (let sim of this.state.simulators) {
        if (sim._id === this.state.simulationModels[index].simulator) {
          simulator = sim;
        }
      }

      if (simulator == null) {
        continue;
      }

      AppDispatcher.dispatch({
        type: 'simulators/start-action',
        simulator,
        data: action.data,
        token: this.state.sessionToken
      });
    }
  }

  render() {
    return (
      <div className='section'>
        <h1>{this.state.simulation.name}</h1>

        <Table data={this.state.simulationModels}>
          <TableColumn checkbox onChecked={(index, event) => this.onSimulationModelChecked(index, event)} width='30' />
          <TableColumn title='Name' dataKey='name' link='/simulationModel/' linkKey='_id' />
          <TableColumn title='Simulator' dataKey='simulator' width='180' modifier={(simulator) => this.getSimulatorName(simulator)} />
          <TableColumn title='Output' dataKey='outputLength' width='100' />
          <TableColumn title='Input' dataKey='inputLength' width='100' />
          <TableColumn
            title=''
            width='100'
            editButton
            deleteButton
            exportButton
            onEdit={(index) => this.setState({ editModal: true, modalData: this.state.simulationModels[index], modalIndex: index })}
            onDelete={(index) => this.setState({ deleteModal: true, modalData: this.state.simulationModels[index], modalIndex: index })}
            onExport={index => this.exportModel(index)}
          />
        </Table>

        <div style={{ float: 'left' }}>
          <SimulatorAction
            runDisabled={this.state.selectedSimulationModels.length === 0}
            runAction={this.runAction}
            actions={[
              { id: '0', title: 'Start', data: { action: 'start' } },
              { id: '1', title: 'Stop', data: { action: 'stop' } },
              { id: '2', title: 'Pause', data: { action: 'pause' } },
              { id: '3', title: 'Resume', data: { action: 'resume' } }
            ]}/>
        </div>

        <div style={{ float: 'right' }}>
          <Button onClick={() => this.setState({ newModal: true })}><Glyphicon glyph="plus" /> Simulation Model</Button>
          <Button onClick={() => this.setState({ importModal: true })}><Glyphicon glyph="import" /> Import</Button>
        </div>

        <NewSimulationModelDialog show={this.state.newModal} onClose={data => this.closeNewModal(data)} simulators={this.state.simulators} />
        <EditSimulationModelDialog show={this.state.editModal} onClose={data => this.closeEditModal(data)} data={this.state.modalData} simulators={this.state.simulators} />
        <ImportSimulationModelDialog show={this.state.importModal} onClose={data => this.closeImportModal(data)} simulators={this.state.simulators} />

        <DeleteDialog title="simulation model" name={this.state.modalData.name} show={this.state.deleteModal} onClose={this.closeDeleteModal} />
      </div>
    );
  }
}

export default Container.create(Simulation, { withProps: true });
