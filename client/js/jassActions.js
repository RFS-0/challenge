import JassAppConstants from './jassAppConstants';
import JassAppDispatcher from './jassAppDispatcher';
import {SessionType} from '../../shared/session/sessionType';

export default {

    joinBot: (sessionName, chosenTeamIndex) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.JOIN_BOT,
            data: {
                sessionName,
                chosenTeamIndex
            }
        });
    },

    sessionJoined: (playerInfo) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.SESSION_JOINED,
            data: playerInfo
        });
    },

    broadcastTeams: (teams) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.BROADCAST_TEAMS,
            data: teams
        });
    },

    dealCards: (cards) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.DEAL_CARDS,
            data: cards
        });
    },

    requestTrumpf: (isGeschoben) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.REQUEST_TRUMPF,
            data: isGeschoben
        });
    },

    chooseTrumpf: (mode, trumpfColor) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.CHOOSE_TRUMPF,
            data: {
                mode,
                trumpfColor
            }
        });
    },

    broadastTrumpf: (gameMode) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.BROADCAST_TRUMPF,
            data: gameMode
        });
    },

    changeCardType: (cardType) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.CHANGE_CARD_TYPE,
            data: cardType
        });
    },

    requestCard: (playedCards) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.REQUEST_CARD,
            data: playedCards
        });
    },

    chooseCard: (color, number) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.CHOOSE_CARD,
            data: {
                color,
                number
            }
        });
    },

    rejectCard: (card) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.REJECT_CARD,
            data: card
        });
    },

    playedCards: (playedCards) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.PLAYED_CARDS,
            data: playedCards
        });
    },

    broadcastStich: (stich) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.BROADCAST_STICH,
            data: stich
        });
    },

    adjustSpectatorSpeed: (speedInMs) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.ADJUST_SPECTATOR_SPEED,
            data: speedInMs
        });
    },

    broadcastTournamentRankingTable: (rankingTable) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.BROADCAST_TOURNAMENT_RANKING_TABLE,
            data: rankingTable
        });
    },

    startTournament: () => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.START_TOURNAMENT
        });
    },

    requestRegistryBots: () => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.REQUEST_REGISTRY_BOTS
        });
    },

    sendRegistryBots: (registryBots) => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.SEND_REGISTRY_BOTS,
            data: registryBots
        });
    },
    
    addBotFromRegistry: (bot, sessionName) => {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.ADD_BOT_FROM_REGISTRY,
            data: {
                bot,
                sessionName
            }
        });
    },

    broadcastTournamentStarted: () => {
        JassAppDispatcher.handleServerAction({
            actionType: JassAppConstants.BROADCAST_TOURNAMENT_STARTED
        });
    },

    collectStich() {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.COLLECT_STICH
        });
    },

    toggleShowLastStich() {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.TOGGLE_SHOW_LAST_STICH
        });
    },

    toggleShowPoints() {
        JassAppDispatcher.handleViewAction({
            actionType: JassAppConstants.TOGGLE_SHOW_POINTS
        })
    }
};
