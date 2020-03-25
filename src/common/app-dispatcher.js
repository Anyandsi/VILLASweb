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

import { Dispatcher } from 'flux';

class AppDispatcher extends Dispatcher {
  dispatch(payload) {
    if (this.isDispatching()) {
      // try again later
      var self = this;

      setTimeout(function() {
        self.dispatch(payload);
      }, 1);
    } else {
      // do actual dispatch
      super.dispatch(payload);
    }
  }
}

export default new AppDispatcher();
