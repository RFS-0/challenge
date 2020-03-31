import React from 'react';
import ExistingSessions from './existingSessions.jsx';
import {GameSetupState} from './gameSetupStore';
import JassActions from '../jassActions';
import {SessionType} from '../../../shared/session/sessionType';

function createNewSession(sessionType, asSpectator, event) {
    let inputElement = event.target,
        sessionName = inputElement.value;

    if (event.charCode === 13 && sessionName.trim()) {
        inputElement.disabled = true;
        JassActions.createNewSession(sessionType, sessionName, asSpectator);
    }
}

export default (props) => {

    let status = props.setupState.status;
    return (
        <div id="chooseSession" className={(status !== GameSetupState.CHOOSE_SESSION ? 'hidden' : '')}>
          <h1 className="jumbotron">Choose Session to join</h1>
          {props.setupState && props.setupState.sessions && props.setupState.sessions.length > 0 ?
            <ExistingSessions sessions={props.setupState.sessions}/> :
            <p>No sessions found.</p>
          }

          <h1 className="jumbotron">Create a Session</h1>
          <div className="session-choice">
            <input type="text" name="createNewSession" placeholder="Session Name..."
                   onKeyPress={(event) => createNewSession(SessionType.SINGLE_GAME, false, event)}
            />
          </div>
          <div className="session-choice">
            <input type="text" name="createNewTournament" placeholder="Tournament Name..."
                   onKeyPress={(event) => createNewSession(SessionType.TOURNAMENT, true, event)}
            />
          </div>
          <div className="session-choice">
            <button type="button" name="autoJoin" onClick={JassActions.autojoinSession}>Just Join!</button>
          </div>
        </div>
    );
};
