/**
 * File: home.js
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

//import { Link } from 'react-router-dom';

//import RestAPI from '../api/rest-api';

import config from '../config';
import UserStore from "../user/user-store";

class Home extends React.Component {
  constructor(props) {
    super(props);
    let currentUser = UserStore.getState().currentUser;

    this.state = {
      currentRole: currentUser ? currentUser.role : '',
      currentUsername: currentUser ? currentUser.username: '',
      currentUserID: currentUser ? currentUser.id: 0,
      token: UserStore.getState().token
    };
  }

  getCounts(type) {
    if (this.state.hasOwnProperty('counts'))
      return this.state.counts[type];
    else
      return '?';
  }

  componentDidMount() {
    //RestAPI.get('/api/v1/counts').then(response => {
    //  this.setState({ counts: response });
    //});
  }

  render() {
    return (
      <div className="home-container">
        <img style={{height: 120, float: 'right'}} src={require('../img/villas_web.svg')} alt="Logo VILLASweb" />
        <h1>Home</h1>
        <p>
          Welcome to <b>{config.instance}</b>!<br />
          VILLASweb is a frontend for distributed real-time simulation hosted by <a href={"mailto:" + config.admin.mail}>{config.admin.name}</a>.
        </p>
        <p>
        You are logged in as user <b>{this.state.currentUsername}</b> with <b>ID {this.state.currentUserID}</b> and role <b>{this.state.currentRole}</b>.
        </p>
        {/*
          <p>
            This instance is hosting <Link to="/projects" title="Projects">{this.getCounts('projects')} projects</Link> consisting of <Link to="/simulators" title="Simulators">{this.getCounts('simulators')} simulators</Link>, {this.getCounts('dashboards')} dashboards and <Link to="/simulations" title="Simulations">{this.getCounts('simulations')} simulations</Link>.
            A total of <Link to="/users" title="Users">{this.getCounts('users')} users</Link> are registered.<br />
          </p>
        */}
        <h3>Credits</h3>
        <p>VILLASweb is developed by the <a href="http://acs.eonerc.rwth-aachen.de">Institute for Automation of Complex Power Systems</a> at the <a href="https;//www.rwth-aachen.de">RWTH Aachen University</a>.</p>
        <ul>
          <li><a href="mailto:mgrigull@eonerc.rwth-aachen.de">Markus Grigull</a></li>
          <li><a href="mailto:stvogel@eonerc.rwth-aachen.de">Steffen Vogel</a></li>
          <li><a href="mailto:mstevic@eonerc.rwth-aachen.de">Marija Stevic</a></li>
          <li><a href="mailto:sonja.happ@eonerc.rwth-aachen.de">Sonja Happ</a></li>
        </ul>
        <h3>Links</h3>
        <ul>
          <li><a href="http://fein-aachen.org/projects/villas-framework/">Project Page</a></li>
          <li><a href="https://villas.fein-aachen.org/doc/web.html">Documentation</a></li>
          <li><a href="https://git.rwth-aachen.de/VILLASframework/VILLASweb">Source Code</a></li>
        </ul>
        <h3>Funding</h3>
        <p>The development of <a href="http://fein-aachen.org/projects/villas-framework/">VILLASframework</a> projects have received funding from</p>
        <ul>
          <li><a href="http://www.acs.eonerc.rwth-aachen.de/cms/E-ON-ERC-ACS/Forschung/Forschungsprojekte/Gruppe-Real-Time-Simulation-and-Hardware/~qxvw/Urban-Energy-Lab-4/">Urban Energy Lab 4.0</a> a project funded by OP EFRE NRW (European Regional Development Fund) for the setup of a novel energy research infrastructure.</li>
          <li><a href="http://www.re-serve.eu">RESERVE</a> a European Union’s Horizon 2020 research and innovation programme under grant agreement No 727481</li>
          <li><a href="http://www.jara.org/en/research/energy">JARA-ENERGY</a>. Jülich-Aachen Research Alliance (JARA) is an initiative of RWTH Aachen University and Forschungszentrum Jülich.</li>
        </ul>
        <img height={100} src={require('../img/european_commission.svg')} alt="Logo EU" />
        <img height={70} src={require('../img/reserve.svg')} alt="Logo EU" />
        <img height={70} src={require('../img/uel_efre.jpeg')} alt="Logo UEL OP EFRE NRW" />
        <img height={70} src={require('../img/uel.png')} alt="Logo UEL" />
        <img height={60} src={require('../img/eonerc_rwth.svg')} alt="Logo ACS" />
        {
          //<img height={70} src={require('../img/jara.svg')} alt="Logo JARA" />
        }
      </div>
    );
  }
}

export default Home;
