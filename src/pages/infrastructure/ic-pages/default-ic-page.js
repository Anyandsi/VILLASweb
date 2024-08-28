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

import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import {Col, Row} from "react-bootstrap";
import IconButton from '../../../common/buttons/icon-button';
import { useDispatch } from 'react-redux';
import { loadICbyId } from '../../../store/icSlice';
import ICParamsTable from '../ic-params-table';
import RawDataTable from '../../../common/rawDataTable';

import { iconStyle, buttonStyle } from "../styles";

const DefaultICPage = (props) => {
  const ic = props.ic;

  const { user: currentUser, token: sessionToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const refresh = () => {
    dispatch(loadICbyId({token: sessionToken, id: ic.id}));
  }

  useEffect(() => {
  }, []);

  return (<div className='section'>
        <h1>{ic.name}
          <span className='icon-button'>
            <IconButton
              childKey={1}
              tooltip='Refresh'
              onClick={() => refresh(ic, sessionToken)}
              icon='sync-alt'
              buttonStyle={buttonStyle}
              iconStyle={iconStyle}
            />
          </span>
        </h1>
        <Row>
          <Col>
            <h4>Properties</h4>
            <ICParamsTable ic={ic}/>
          </Col>
          <Col>
            <h4>Raw Status</h4>
            <RawDataTable rawData={ic.statusupdateraw}/>
          </Col>
        </Row>
      </div>
    )

}

export default DefaultICPage;