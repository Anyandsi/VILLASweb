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

import RestDataManager from '../common/data-managers/rest-data-manager';
import RestAPI from '../common/api/rest-api';
import AppDispatcher from '../common/app-dispatcher';

class IcsDataManager extends RestDataManager {
  constructor() {
      super('ic', '/ic');
  }

  doActions(icid, actions, token = null, result=null) {
      for (let action of actions) {
        if (action.when)
          // Send timestamp as Unix Timestamp
          action.when = Math.round(action.when.getTime() / 1000);
      }

      if (icid !== undefined && icid != null) {

        console.log("doActions, icid:", icid)
        // sending action to a specific IC via IC list

        RestAPI.post(this.makeURL(this.url + '/' + icid + '/action'), actions, token).then(response => {
          AppDispatcher.dispatch({
            type: 'ics/action-started',
            data: response
          });
        }).catch(error => {
          AppDispatcher.dispatch({
            type: 'ics/action-error',
            error
          });
        });
      } else {
        // sending the same action to multiple ICs via scenario controls

        // distinguish between "start" action and any other

        if (actions[0].action !== "start"){
          for (let a of actions){
            console.log("doActions, a.icid:", a.icid)
            icid = JSON.parse(JSON.stringify(a.icid))
            delete a.icid
            console.log("doActions, icid:", icid)
            // sending action to a specific IC via IC list

            RestAPI.post(this.makeURL(this.url + '/' + icid + '/action'), [a], token).then(response => {
              AppDispatcher.dispatch({
                type: 'ics/action-started',
                data: response
              });
            }).catch(error => {
              AppDispatcher.dispatch({
                type: 'ics/action-error',
                error
              });
            });

          }
        } else{
          // for start actions procedure is different
          // first a result needs to be created, then the start actions can be sent

          RestAPI.post(this.makeURL( '/results'), result, token).then(response => {
            AppDispatcher.dispatch({
              type: 'ics/action-result-added',
              data: response,
              actions: actions,
              token: token,
            });
          }).catch(error => {
            AppDispatcher.dispatch({
              type: 'ics/action-result-add-error',
              error
            });
          });


        }



      }
  }

  getStatus(url,token,ic){
    RestAPI.get(url, null).then(response => {
      AppDispatcher.dispatch({
        type: 'ics/status-received',
        data: response,
        token: token,
        ic: ic
      });
    }).catch(error => {
      AppDispatcher.dispatch({
        type: 'ics/status-error',
        error: error
      })
    })
  }

  restart(url,token){
    RestAPI.post(url, null).then(response => {
      AppDispatcher.dispatch({
        type: 'ics/restart-successful',
        data: response,
        token: token,
      });
    }).catch(error => {
      AppDispatcher.dispatch({
        type: 'ics/restart-error',
        error: error
      })
    })
  }

  shutdown(url,token){
    RestAPI.post(url, null).then(response => {
      AppDispatcher.dispatch({
        type: 'ics/shutdown-successful',
        data: response,
        token: token,
      });
    }).catch(error => {
      AppDispatcher.dispatch({
        type: 'ics/shutdown-error',
        error: error
      })
    })
  }
}

export default new IcsDataManager();
