'use strict';

import ClientApi from '../communication/clientApi.js';
import SessionFactory from './sessionFactory.js';
import {SessionChoice} from '../../shared/session/sessionChoice.js';
import {SessionType} from '../../shared/session/sessionType.js';
import UUID from 'uuid';

let clientApi = ClientApi.create();

function findOrCreateSessionWithSpace(sessions, sessionChoiceResponse) {
    let filteredSessions = sessions.filter((session) => {
        return !session.started;
    });

    if (filteredSessions.length === 0) {
        return createSession(sessions, {
            sessionName: sessionChoiceResponse.sessionName || UUID.v4(),
            sessionType: sessionChoiceResponse.sessionType || SessionType.SINGLE_GAME
        });
    }

    return filteredSessions[0];
}

function createSession(sessions, sessionChoiceResponse) {
    let session = SessionFactory.create(sessionChoiceResponse.sessionName, sessionChoiceResponse.sessionType);
    sessions.push(session);
    return session;
}

function findSession(sessions, sessionChoiceResponse) {
    let filteredSessions = sessions.filter((session) => {
        return session.name === sessionChoiceResponse.sessionName;
    });

    if (filteredSessions.length === 0) {
        return createSession(sessions, sessionChoiceResponse);
    }

    return filteredSessions[0];
}

function createOrJoinSession(sessions, sessionChoiceResponse) {
    switch (sessionChoiceResponse.sessionChoice) {
        case SessionChoice.CREATE_NEW:
            return createSession(sessions, sessionChoiceResponse);
        case SessionChoice.SPECTATOR:
        case SessionChoice.JOIN_EXISTING:
            return findSession(sessions, sessionChoiceResponse);
        default:
            return findOrCreateSessionWithSpace(sessions, sessionChoiceResponse);
    }
}

function keepSessionAlive(webSocket, intervall) {
    if (webSocket.readyState === 1) {
        webSocket.ping();
        setTimeout(keepSessionAlive.bind(null, webSocket, intervall), intervall);
    }
}

function handleTournamentStart(SessionHandler, webSocket, session) {
    if (!session.started && session.isComplete()) {
        SessionHandler.startSession(session);
    } else {
        clientApi.waitForTournamentStart(webSocket).then(handleTournamentStart);
    }
}


let SessionHandler = {

    sessions: [],

    getAvailableSessionNames() {
        return this.sessions.filter((session) => {
            return !session.started;
        }).map((session) => {
            return session.name;
        });
    },

    handleClientConnection(ws) {
        keepSessionAlive(ws, 10000);

        return clientApi.requestPlayerName(ws).then((playerName) => {
            return clientApi.requestSessionChoice(ws, this.getAvailableSessionNames()).then((sessionChoiceResponse) => {
                let session = createOrJoinSession(this.sessions, sessionChoiceResponse);

                if (sessionChoiceResponse.sessionChoice === SessionChoice.SPECTATOR || sessionChoiceResponse.asSpectator) {
                    session.addSpectator(ws);

                    if (session.type === SessionType.TOURNAMENT) {
                        clientApi.waitForTournamentStart(ws).then(handleTournamentStart.bind(null, this, ws, session));
                    }
                } else {
                    session.addPlayer(ws, playerName);

                    if (session.type === SessionType.SINGLE_GAME && session.isComplete()) {
                        this.startSession(session);
                    }
                }
            });
        });
    },

    startSession(session) {
        session.start().then(
            this.finishSession.bind(this, session),
            this.finishSession.bind(this, session));
    },

    finishSession(session) {
        session.close('Game Finished');
        this.removeSession(session);
    },
    
    removeSession(session) {
        let index = this.sessions.indexOf(session);
        this.sessions.splice(index, 1);
    },

    resetInstance() {
        this.sessions = [];
    }

};

export default SessionHandler;
