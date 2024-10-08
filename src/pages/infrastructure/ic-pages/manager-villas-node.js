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

import { useDispatch, useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";
import IconButton from "../../../common/buttons/icon-button";
import ManagedICsTable from "./managed-ics-table";
import RawDataTable from "../../../common/rawDataTable";
import { downloadGraph } from "../../../utils/icUtils";
import { loadICbyId } from "../../../store/icSlice";
import { useGetICSQuery } from "../../../store/apiSlice";

import ICParamsTable from "../ic-params-table";

import { iconStyle, buttonStyle } from "../styles";

const ManagerVillasNode = (props) => {

  const { user: currentUser, token: sessionToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const ic = props.ic;

  const {data: icsRes, isLoading, refetch: refetchICs} = useGetICSQuery();
  const ics = icsRes ? icsRes.ics : [];
  const managedICs = ics.filter(managedIC => managedIC.category !== "manager" && managedIC.manager === ic.uuid);
  const graphURL = ic.apiurl !== "" ? ic.apiurl + "/graph.svg" : "";

  const refresh = () => {
    dispatch(loadICbyId({token: sessionToken, id: ic.id}));
  }

  return (
  <div className='section'>
    <h1>{ic.name}
      <span className='icon-button'>
        <IconButton
          childKey={2}
          tooltip='Refresh'
          onClick={() => refresh()}
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
          <ManagedICsTable
            managedICs={managedICs}
            currentUser={currentUser}
          />
        </Col>
    </Row>
    <hr />
    <Row>
      <Col>
        <h4>Raw Status</h4>
        <RawDataTable rawData={ic.statusupdateraw}/>
      </Col>
      <Col>
        <div className='section-buttons-group-right'>
            <IconButton
                childKey={0}
                tooltip='Download Graph'
                onClick={() => downloadGraph(graphURL)}
                icon='download'
                buttonStyle={buttonStyle}
                iconStyle={iconStyle}
            />
        </div>
        <h4>Graph</h4>
        <div>
            <img alt={"Graph image download failed and/or incorrect image API URL"} src={graphURL} />
        </div>
      </Col>
    </Row>
  </div>)
}

export default ManagerVillasNode;
