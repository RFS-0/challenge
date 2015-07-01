"use strict";

let Validation = require('../validation/validation');

let Cycle = {
    iterate: function () {
        let that = this;

        function handleChosenCard(player, card) {
            that.currentPlayer = player;

            if (that.validator.validate(that.playedCards, that.currentPlayer.cards, card)) {
                that.playedCards.push(card);
                let cardIndex = that.currentPlayer.cards.indexOf(card);
                that.currentPlayer.cards.splice(cardIndex, 1);
                that.clientApi.broadcastCardPlayed(that.playedCards);
            } else {
                return that.currentPlayer.rejectCard(card, that.playedCards).then(handleChosenCard);
            }

            return that.playedCards;
        }

        return that.players.reduce((previousPlayer, currentPlayer, index) => {
            let previousPromise;

            if (index === 1) {
                previousPromise = previousPlayer.requestCard(that.playedCards).then(handleChosenCard.bind(null, previousPlayer));
            } else {
                previousPromise = previousPlayer;
            }

            return previousPromise.then((cardsOnTable) => {
                return currentPlayer.requestCard(cardsOnTable).then(handleChosenCard.bind(null, currentPlayer));
            });
        });
    }
};

let create = function (currentPlayer, players, clientApi) {
    let cycle = Object.create(Cycle);
    cycle.players = players;

    cycle.clientApi = clientApi;
    cycle.validator = Validation.create();
    cycle.playedCards = [];
    cycle.currentPlayer = currentPlayer;
    return cycle;
};

module.exports = {
    create
};