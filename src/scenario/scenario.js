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
import { Container } from 'flux/utils';
import { Button } from 'react-bootstrap';
import FileSaver from 'file-saver';

import ScenarioStore from './scenario-store';
import ICStore from '../ic/ic-store';
import DashboardStore from '../dashboard/dashboard-store';
import ConfigStore from '../componentconfig/config-store';
import LoginStore from '../user/login-store';
import SignalStore from '../signal/signal-store'
import AppDispatcher from '../common/app-dispatcher';

import Icon from '../common/icon';
import Table from '../common/table';
import TableColumn from '../common/table-column';
import ImportConfigDialog from '../componentconfig/import-config';
import ImportDashboardDialog from "../dashboard/import-dashboard";
import NewDashboardDialog from "../dashboard/new-dashboard";

import ICAction from '../ic/ic-action';
import DeleteDialog from '../common/dialogs/delete-dialog';
import EditConfigDialog from "../componentconfig/edit-config";
import EditSignalMapping from "../signal/edit-signal-mapping";
import FileStore from "../file/file-store"
import WidgetStore from "../widget/widget-store";

class Scenario extends React.Component {

  static getStores() {
    return [ ScenarioStore, ConfigStore, DashboardStore, ICStore, LoginStore, SignalStore, FileStore, WidgetStore];
  }

  static calculateState(prevState, props) {
    // get selected scenario
    const sessionToken = LoginStore.getState().token;

    const scenario = ScenarioStore.getState().find(s => s.id === parseInt(props.match.params.scenario, 10));
    if (scenario == null) {
      AppDispatcher.dispatch({
        type: 'scenarios/start-load',
        data: props.match.params.scenario,
        token: sessionToken
      });
    }

    // obtain all dashboards of a scenario
    let dashboards = DashboardStore.getState().filter(dashb => dashb.scenarioID === parseInt(props.match.params.scenario, 10));

    // obtain all component configurations of a scenario
    let configs = ConfigStore.getState().filter(config => config.scenarioID === parseInt(props.match.params.scenario, 10));

    let signals = SignalStore.getState();
    let files = FileStore.getState();

    // apply filter to contain only ICs that are used by configs
    let icsUsed = ICStore.getState().filter(ic => {
      let ICused = false;
      for (let config of configs){
        if (ic.id === config.icID){
          ICused = true;
          break;
        }
      }
      return ICused;
    });


    return {
      scenario,
      sessionToken,
      configs,
      dashboards,
      signals,
      files,
      ics: ICStore.getState(),
      icsUsed,

      deleteConfigModal: false,
      importConfigModal: false,
      editConfigModal: false,
      modalConfigData: {},
      selectedConfigs: [],
      modalConfigIndex: 0,

      editOutputSignalsModal: false,
      editInputSignalsModal: false,

      newDashboardModal: false,
      deleteDashboardModal: false,
      importDashboardModal: false,
      modalDashboardData: {},
    }
  }

  componentDidMount() {
    //load selected scenario
    AppDispatcher.dispatch({
      type: 'scenarios/start-load',
      data: this.state.scenario.id,
      token: this.state.sessionToken
    });

    // load component configurations for selected scenario
    AppDispatcher.dispatch({
      type: 'configs/start-load',
      token: this.state.sessionToken,
      param: '?scenarioID='+this.state.scenario.id
    });

    // load dashboards of selected scenario
    AppDispatcher.dispatch({
      type: 'dashboards/start-load',
      token: this.state.sessionToken,
      param: '?scenarioID='+this.state.scenario.id
    });

    // load ICs to enable that component configs and dashboards work with them
    AppDispatcher.dispatch({
      type: 'ics/start-load',
      token: this.state.sessionToken
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // load widgets when dashboard id(s) are available
    if (this.state.dashboards.length !== prevState.dashboards.length) {
      let dashboards = Object.assign([], this.state.dashboards);
      dashboards.forEach(dboard => {
        AppDispatcher.dispatch({
          type: 'widgets/start-load',
          token: this.state.sessionToken,
          param: '?dashboardID='+dboard.id
      })})
    }
  }


  /* ##############################################
  * Component Configuration modification methods
  ############################################## */

  addConfig(){
    const config = {
      scenarioID: this.state.scenario.id,
      name: 'New Component Configuration',
      icID: this.state.ics.length > 0 ? this.state.ics[0].id : null,
      startParameters: {},
    };

    AppDispatcher.dispatch({
      type: 'configs/start-add',
      data: config,
      token: this.state.sessionToken
    });

    this.setState({ scenario: {} }, () => {
      AppDispatcher.dispatch({
        type: 'scenarios/start-load',
        data: this.props.match.params.scenario,
        token: this.state.sessionToken
      });
    });
  }

  closeEditConfigModal(data){
    this.setState({ editConfigModal : false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'configs/start-edit',
        data: data,
        token: this.state.sessionToken,
      });
    }
  }

  closeDeleteConfigModal(confirmDelete) {
    this.setState({ deleteConfigModal: false });

    if (confirmDelete === false) {
      return;
    }

    AppDispatcher.dispatch({
      type: 'configs/start-remove',
      data: this.state.modalConfigData,
      token: this.state.sessionToken
    });
  }

  importConfig(config){
    this.setState({ importConfigModal: false });

    if (config == null) {
      return;
    }

    config.scenario = this.state.scenario.id;

    AppDispatcher.dispatch({
      type: 'configs/start-add',
      data: config,
      token: this.state.sessionToken
    });

    this.setState({ scenario: {} }, () => {
      AppDispatcher.dispatch({
        type: 'scenarios/start-load',
        data: this.props.match.params.scenario,
        token: this.state.sessionToken
      });
    });
  }

  exportConfig(index) {
    // filter properties
    const config = Object.assign({}, this.state.configs[index]);

    // show save dialog
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'config-' + config.name + '.json');
  }

  onConfigChecked(index, event) {
    const selectedConfigs = Object.assign([], this.state.selectedConfigs);
    for (let key in selectedConfigs) {
      if (selectedConfigs[key] === index) {
        // update existing entry
        if (event.target.checked) {
          return;
        }

        selectedConfigs.splice(key, 1);

        this.setState({ selectedConfigs: selectedConfigs });
        return;
      }
    }

    // add new entry
    if (event.target.checked === false) {
      return;
    }

    selectedConfigs.push(index);
    this.setState({ selectedConfigs: selectedConfigs });
  }

  runAction = action => {
    for (let index of this.state.selectedConfigs) {
      // get IC for component config
      let ic = null;
      for (let component of this.state.ics) {
        if (component._id === this.state.configs[index].icID) {
          ic = component;
        }
      }

      if (ic == null) {
        continue;
      }

      if (action.data.action === 'start') {
        action.data.parameters = this.state.configs[index].startParameters;
      }

      AppDispatcher.dispatch({
        type: 'ics/start-action',
        ic: ic,
        data: action.data,
        token: this.state.sessionToken
      });
    }
  };

  getICName(icID) {
    for (let ic of this.state.ics) {
      if (ic.id === icID) {
        return ic.name ||  ic.uuid;
      }
    }
  }

  /* ##############################################
  * Dashboard modification methods
  ############################################## */

  closeNewDashboardModal(data) {
    this.setState({ newDashboardModal : false });
    let newDashboard = data;
    // add default grid value and scenarioID
    newDashboard["grid"] = 15;
    newDashboard["scenarioID"] = this.state.scenario.id;

    if (data) {
      AppDispatcher.dispatch({
        type: 'dashboards/start-add',
        data,
        token: this.state.sessionToken,
      });
    }
  }

  closeDeleteDashboardModal(confirmDelete){
    this.setState({ deleteDashboardModal: false });

    if (confirmDelete === false) {
      return;
    }

    AppDispatcher.dispatch({
      type: 'dashboards/start-remove',
      data: this.state.modalDashboardData,
      token: this.state.sessionToken,
    });
  }

  closeImportDashboardModal(data) {
    this.setState({ importDashboardModal: false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'dashboards/start-add',
        data,
        token: this.state.sessionToken,
      });
    }
  }

  exportDashboard(index) {
    // filter properties
    const dashboard = Object.assign({}, this.state.dashboards[index]);

    let widgets = WidgetStore.getState().filter(w => w.dashboardID === parseInt(dashboard.id, 10));


    var jsonObj = dashboard;
    jsonObj["widgets"] = widgets;
 
    // show save dialog
    const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'dashboard - ' + dashboard.name + '.json');
  }

  /* ##############################################
  * Signal modification methods
  ############################################## */

  closeDeleteSignalModal(data){
    // data contains the signal to be deleted
    if (data){

      AppDispatcher.dispatch({
        type: 'signals/start-remove',
        data: data,
        token: this.state.sessionToken
      });

    }
  }

  closeNewSignalModal(data){
    //data contains the new signal incl. configID and direction
    if (data) {
      AppDispatcher.dispatch({
        type: 'signals/start-add',
        data: data,
        token: this.state.sessionToken
      });
    }
  }

  closeEditSignalsModal(data, direction){

    if( direction === "in") {
      this.setState({editInputSignalsModal: false});
    } else if( direction === "out"){
      this.setState({editOutputSignalsModal: false});
    } else {
      return; // no valid direction
    }

    if (data){
      //data is an array of signals
      for (let sig of data) {
        //dispatch changes to signals
        AppDispatcher.dispatch({
          type: 'signals/start-edit',
          data: sig,
          token: this.state.sessionToken,
        });
      }
    }

  }

  /* ##############################################
  * File modification methods
  ############################################## */

  getFileName(id){
    for (let file of this.state.files) {
      if (file.id === id) {
        return file.name;
      }
    }
  }

  /* ##############################################
  * Render method
  ############################################## */

  render() {

    const buttonStyle = {
      marginLeft: '10px'
    };

    return <div className='section'>
      <h1>{this.state.scenario.name}</h1>

      {/*Component Configurations table*/}
      <h2>Component Configurations</h2>
      <Table data={this.state.configs}>
        <TableColumn checkbox onChecked={(index, event) => this.onConfigChecked(index, event)} width='30' />
        <TableColumn title='Name' dataKey='name' />
        <TableColumn title='Selected configuration file' dataKey='selectedFileID' modifier={(selectedFileID) => this.getFileName(selectedFileID)}/>
        <TableColumn
          title='# Output Signals'
          dataKey='outputLength'
          editButton
          onEdit={index => this.setState({ editOutputSignalsModal: true, modalConfigData: this.state.configs[index], modalConfigIndex: index })}
        />
        <TableColumn
          title='# Input Signals'
          dataKey='inputLength'
          editButton
          onEdit={index => this.setState({ editInputSignalsModal: true, modalConfigData: this.state.configs[index], modalConfigIndex: index })}
        />
        <TableColumn title='Infrastructure Component' dataKey='icID' modifier={(icID) => this.getICName(icID)} />
        <TableColumn
          title='Edit/ Delete/ Export'
          width='200'
          editButton
          deleteButton
          exportButton
          onEdit={index => this.setState({ editConfigModal: true, modalConfigData: this.state.configs[index], modalConfigIndex: index })}
          onDelete={(index) => this.setState({ deleteConfigModal: true, modalConfigData: this.state.configs[index], modalConfigIndex: index })}
          onExport={index => this.exportConfig(index)}
        />
      </Table>

      <div style={{ float: 'left' }}>
        <ICAction
          runDisabled={this.state.selectedConfigs.length === 0}
          runAction={this.runAction}
          actions={[
            { id: '0', title: 'Start', data: { action: 'start' } },
            { id: '1', title: 'Stop', data: { action: 'stop' } },
            { id: '2', title: 'Pause', data: { action: 'pause' } },
            { id: '3', title: 'Resume', data: { action: 'resume' } }
          ]}/>
      </div>

      <div style={{ float: 'right' }}>
        <Button onClick={() => this.addConfig()} style={buttonStyle}><Icon icon="plus" /> Component Configuration</Button>
        <Button onClick={() => this.setState({ importConfigModal: true })} style={buttonStyle}><Icon icon="upload" /> Import</Button>
      </div>

      <div style={{ clear: 'both' }} />

      <EditConfigDialog show={this.state.editConfigModal} onClose={data => this.closeEditConfigModal(data)} config={this.state.modalConfigData} ics={this.state.ics} />
      <ImportConfigDialog show={this.state.importConfigModal} onClose={data => this.importConfig(data)} ics={this.state.ics} />
      <DeleteDialog title="component configuration" name={this.state.modalConfigData.name} show={this.state.deleteConfigModal} onClose={(c) => this.closeDeleteConfigModal(c)} />

      <EditSignalMapping
        show={this.state.editOutputSignalsModal}
        onCloseEdit={(data, direction) => this.closeEditSignalsModal(data, direction)}
        onAdd={(data) => this.closeNewSignalModal(data)}
        onDelete={(data) => this.closeDeleteSignalModal(data)}
        direction="Output"
        signals={this.state.signals}
        configID={this.state.modalConfigData.id} />
      <EditSignalMapping
        show={this.state.editInputSignalsModal}
        onCloseEdit={(data, direction) => this.closeEditSignalsModal(data, direction)}
        onAdd={(data) => this.closeNewSignalModal(data)}
        onDelete={(data) => this.closeDeleteSignalModal(data)}
        direction="Input"
        signals={this.state.signals}
        configID={this.state.modalConfigData.id}/>

      {/*Dashboard table*/}
      <h2>Dashboards</h2>
      <Table data={this.state.dashboards}>
        <TableColumn title='Name' dataKey='name' link='/dashboards/' linkKey='id' />
        <TableColumn title='Grid' dataKey='grid' />
        <TableColumn
          title=''
          width='200'
          deleteButton
          exportButton
          onDelete={(index) => this.setState({ deleteDashboardModal: true, modalDashboardData: this.state.dashboards[index], modalDashboardIndex: index })}
          onExport={index => this.exportDashboard(index)}
        />
      </Table>

      <div style={{ float: 'right' }}>
        <Button onClick={() => this.setState({ newDashboardModal: true })} style={buttonStyle}><Icon icon="plus" /> Dashboard</Button>
        <Button onClick={() => this.setState({ importDashboardModal: true })} style={buttonStyle}><Icon icon="upload" /> Import</Button>
      </div>

      <div style={{ clear: 'both' }} />

      <NewDashboardDialog show={this.state.newDashboardModal} onClose={data => this.closeNewDashboardModal(data)}/>
      <ImportDashboardDialog show={this.state.importDashboardModal} onClose={data => this.closeImportDashboardModal(data)}  />

      <DeleteDialog title="dashboard" name={this.state.modalDashboardData.name} show={this.state.deleteDashboardModal} onClose={(e) => this.closeDeleteDashboardModal(e)}/>


    </div>;
  }
}

let fluxContainerConverter = require('../common/FluxContainerConverter');
export default Container.create(fluxContainerConverter.convert(Scenario), { withProps: true });
