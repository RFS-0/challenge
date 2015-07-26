'use strict';

let expect = require('chai').expect,
    WebSocket = require('ws'),
    WebSocketServer = require('ws').Server,
    ClientApi = require('../../../server/communication/clientApi'),
    GameType = require('../../../server/game/gameType'),
    GameMode = require('../../../server/game/gameMode'),
    CardColor = require('../../../shared/deck/card').CardColor,
    TestDataCreator = require('../../testDataCreator'),
    CloseEventCode = require('../../../server/communication/closeEventCode'),
    sinon = require('sinon'),
    messages = require('../../../shared/messages/messages'),
    MessageType = require('../../../shared/messages/messageType');

describe('Client API', () => {

    let wss,
        clientApi;

    beforeEach(() => {
        wss = new WebSocketServer({port: 10001});
        clientApi = ClientApi.create();
    });

    afterEach(() => {
        wss.close();
    });

    describe('addClient', () => {
        let webSocket;

        beforeEach(() => {
            webSocket = {
                on: () => {
                }
            };
        });

        it('should add given client to clients array', () => {
            clientApi.addClient(webSocket);

            expect(clientApi.clients[0]).to.equal(webSocket);
        });

        it('should return promise which rejects on client close event', (done) => {
            let disconnectMessage = 'message';
            sinon.stub(webSocket, 'on').withArgs('close', sinon.match.func).callsArgWith(1, CloseEventCode.NORMAL, disconnectMessage);

            let promise = clientApi.addClient(webSocket);

            promise.then(() => {
                done('This promise should never resolve');
            }, ({code: code, message: message}) => {
                expect(code).to.equal(CloseEventCode.NORMAL);
                expect(message).to.equal(disconnectMessage);
                done();
            }).catch(done);
        });
    });

    describe('requestPlayerName', () => {
        it('should wait for choosePlayerName', (done) => {
            let choosePlayerName = messages.create(MessageType.CHOOSE_PLAYER_NAME.name, 'Hans');

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestPlayerName(client).then((data) => {
                    expect(data.playerName).to.equal(choosePlayerName.data.playerName);
                    done();
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            client.on('message', (message) => {
                message = JSON.parse(message);

                if (message.type === MessageType.REQUEST_PLAYER_NAME.name) {
                    client.send(JSON.stringify(choosePlayerName));
                }
            });
        });

        it('should reject invalid answer messages', (done) => {
            let clientAnswer = messages.create(MessageType.PLAYED_CARDS.name, ['a', 'b', 'c']);

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestPlayerName(client).then(() => done(new Error('Should not resolve'))).catch((data) => {
                    expect(data).to.equal('Invalid client answer: ' + JSON.stringify(clientAnswer));
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            new Promise((resolve) => {
                client.on('message', (message) => {
                    message = JSON.parse(message);

                    if (message.type === MessageType.REQUEST_PLAYER_NAME.name) {
                        client.send(JSON.stringify(clientAnswer));
                    } else if (message.type === MessageType.BAD_MESSAGE.name) {
                        resolve();
                    }
                });
            }).then(done, done);
        });

        it('should reject empty answer messages', (done) => {
            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestPlayerName(client).then(() => done(new Error('Should not resolve'))).catch((data) => {
                    expect(data).to.equal('Invalid client answer: ');
                    done();
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            client.on('message', (message) => {
                message = JSON.parse(message);

                if (message.type === MessageType.REQUEST_PLAYER_NAME.name) {
                    client.send(undefined);
                }
            });
        });
    });

    describe('broadcastTeams', () => {
        it('should send the teams message to all clients', (done) => {
            let clients,
                clientPromises = [],
                teamsMessage = [];

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (clientApi.clients.length === clients.length) {
                    clientApi.broadcastTeams(teamsMessage);
                }
            });

            clients = [new WebSocket('ws://localhost:10001'), new WebSocket('ws://localhost:10001')];

            clients.forEach((client) => {
                clientPromises.push(new Promise((resolve) => {
                    client.on('message', (message) => {
                        message = JSON.parse(message);

                        expect(message.type).to.equal(MessageType.BROADCAST_TEAMS.name);
                        expect(message.data).to.eql(teamsMessage);

                        resolve();
                    });
                }));
            });

            Promise.all(clientPromises).then(() => {
                done();
            }).catch(done);
        });
    });

    describe('dealCards', () => {
        it('should deal cards to given client', (done) => {
            let cards = ['a', 'b', 'c'];

            wss.on('connection', (client) => {
                clientApi.addClient(client);
                clientApi.dealCards(client, cards);
            });

            let client = new WebSocket('ws://localhost:10001');

            new Promise((resolve) => {
                client.on('message', (message) => {
                    message = JSON.parse(message);

                    expect(message.type).to.equal(MessageType.DEAL_CARDS.name);
                    expect(message.data).to.eql(cards);

                    resolve();
                });
            }).then(() => done()).catch(done);
        });
    });

    describe('requestTrumpf', () => {
        it('should wait for chooseTrumpf', (done) => {
            let chooseTrumpf = messages.create(MessageType.CHOOSE_TRUMPF.name, 'Spades');

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestTrumpf(client, false).then((data) => {
                    expect(data).to.equal(chooseTrumpf.data);
                    done();
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            client.on('message', (message) => {
                message = JSON.parse(message);

                if (message.type === MessageType.REQUEST_TRUMPF.name) {
                    client.send(JSON.stringify(chooseTrumpf));
                }
            });
        });
    });

    describe('rejectTrumpf', () => {
        it('should reject trumpf to given client', (done) => {
            let gameType = GameType.create(GameMode.SCHIEBE);

            wss.on('connection', (client) => {
                clientApi.addClient(client);
                clientApi.rejectTrumpf(client, gameType);
            });

            let client = new WebSocket('ws://localhost:10001');

            new Promise((resolve) => {
                client.on('message', (message) => {
                    message = JSON.parse(message);

                    expect(message.type).to.equal(MessageType.REJECT_TRUMPF.name);
                    expect(message.data.mode).to.equal(gameType.mode);

                    resolve();
                });
            }).then(() => done()).catch(done);
        });
    });

    describe('broadcastStich', () => {
        it('should send the stich message to all clients', (done) => {
            let clients,
                clientPromises = [],
                stichMessage = {name: 'hans'};

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (clientApi.clients.length === clients.length) {
                    clientApi.broadcastStich(stichMessage);
                }
            });

            clients = [new WebSocket('ws://localhost:10001'), new WebSocket('ws://localhost:10001')];

            clients.forEach((client) => {
                clientPromises.push(new Promise((resolve) => {
                    client.on('message', (message) => {
                        message = JSON.parse(message);

                        expect(message.type).to.equal(MessageType.BROADCAST_STICH.name);
                        expect(message.data).to.eql(stichMessage);

                        resolve();
                    });
                }));
            });

            Promise.all(clientPromises).then(() => {
                done();
            }).catch(done);
        });
    });

    describe('broadcastPlayedCards', () => {
        it('should send played cards to all clients', (done) => {
            let clients,
                playedCards = ['a', 'b', 'c'],
                clientPromises = [];

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (clientApi.clients.length === clients.length) {
                    clientApi.broadcastCardPlayed(playedCards);
                }
            });

            clients = [new WebSocket('ws://localhost:10001'), new WebSocket('ws://localhost:10001')];

            clients.forEach((client) => {
                clientPromises.push(new Promise((resolve) => {
                    client.on('message', (message) => {
                        message = JSON.parse(message);

                        expect(message.type).to.equal(MessageType.PLAYED_CARDS.name);
                        expect(message.data).to.eql(playedCards);

                        resolve();
                    });
                }));
            });

            Promise.all(clientPromises).then(() => {
                done();
            }).catch(done);
        });
    });

    describe('broadcastTrumpf', () => {
        it('should send chosen Trumpf to all clients', (done) => {
            let clients,
                gameType = GameType.create(GameMode.TRUMPF, CardColor.SPADES),
                clientPromises = [];

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (clientApi.clients.length === clients.length) {
                    clientApi.broadcastTrumpf(gameType);
                }
            });

            clients = [new WebSocket('ws://localhost:10001'), new WebSocket('ws://localhost:10001')];

            clients.forEach((client) => {
                clientPromises.push(new Promise((resolve) => {
                    client.on('message', (message) => {
                        message = JSON.parse(message);

                        expect(message.type).to.equal(MessageType.BROADCAST_TRUMPF.name);
                        expect(message.data).to.eql(gameType);

                        resolve();
                    });
                }));
            });

            Promise.all(clientPromises).then(() => {
                done();
            }).catch(done);
        });
    });

    describe('requestCard', () => {
        it('should wait for chooseCard', (done) => {
            let chooseCard = messages.create(MessageType.CHOOSE_CARD.name, 'c'),
                cardsOnTable = ['a', 'b'];

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestCard(client, cardsOnTable).then((data) => {
                    expect(data.card).to.equal(chooseCard.data.card);
                    done();
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            client.on('message', (message) => {
                message = JSON.parse(message);

                if (message.type === MessageType.REQUEST_CARD.name) {
                    client.send(JSON.stringify(chooseCard));
                }
            });
        });
    });

    describe('rejectCard', () => {
        it('should reject card to given client', (done) => {
            let cardsOnTable = ['c', 'b'],
                card = 'e';

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.rejectCard(client, card, cardsOnTable);
            });

            let client = new WebSocket('ws://localhost:10001');

            new Promise((resolve) => {
                client.on('message', (message) => {
                    message = JSON.parse(message);

                    expect(message.type).to.equal(MessageType.REJECT_CARD.name);
                    resolve();
                });
            }).then(done, done);
        });
    });

    describe('requestSessionChoice', () => {
        it('should request session to join from client', (done) => {
            let availableSessions = ['Session 1', 'Session2', 'Session 3'],
                sessionChoice = 'sessionChoice',
                sessionName = 'sessionName',
                chooseSession = {
                    type: MessageType.CHOOSE_SESSION.name,
                    data: {
                        sessionChoice,
                        sessionName
                    }
                };

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                clientApi.requestSessionChoice(client, availableSessions).then((data) => {
                    expect(data.sessionChoice).to.equal(sessionChoice);
                    expect(data.sessionName).to.equal(sessionName);
                    done();
                }).catch(done);
            });

            let client = new WebSocket('ws://localhost:10001');

            new Promise(() => {
                client.on('message', (message) => {
                    message = JSON.parse(message);

                    expect(message.type).to.equal(MessageType.REQUEST_SESSION_CHOICE.name);
                    expect(message.data).to.eql(availableSessions);
                    client.send(JSON.stringify(chooseSession));
                });
            }).catch(done);
        });
    });


    describe('closeAll', () => {
        it('should gracefully close all clients with given message', (done) => {
            let connectedClients = 0,
                disconnectMessage = 'disconnect due to failing bot',
                expectCodeAndMessage = (resolve, code, message) => {
                    expect(code).to.equal(CloseEventCode.NORMAL);
                    expect(message).to.equal(disconnectMessage);
                    resolve();
                };

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (++connectedClients === 2) {
                    clientApi.closeAll(CloseEventCode.NORMAL, disconnectMessage);
                }
            });

            let client1 = new WebSocket('ws://localhost:10001');
            let client2 = new WebSocket('ws://localhost:10001');

            Promise.all([
                new Promise((resolve) => {
                    client1.on('close', expectCodeAndMessage.bind(null, resolve));
                }),
                new Promise((resolve) => {
                    client2.on('close', expectCodeAndMessage.bind(null, resolve));
                })
            ]).then(() => {
                expect(client1.readyState).to.equal(WebSocket.CLOSED);
                expect(client2.readyState).to.equal(WebSocket.CLOSED);
                done();
            }).catch(done);
        });
    });

    describe('broadcastSessionJoined', () => {
        it('should send the player name and id to all clients', (done) => {
            let clients,
                clientPromises = [],
                name = 'name',
                id = 0,
                sessionJoinedMessage = {
                    name: name,
                    id: id
                };

            wss.on('connection', (client) => {
                clientApi.addClient(client);

                if (clientApi.clients.length === clients.length) {
                    clientApi.broadcastSessionJoined(name, id);
                }
            });

            clients = [new WebSocket('ws://localhost:10001'), new WebSocket('ws://localhost:10001')];

            clients.forEach((client) => {
                clientPromises.push(new Promise((resolve) => {
                    client.on('message', (message) => {
                        message = JSON.parse(message);

                        expect(message.type).to.equal(MessageType.BROADCAST_SESSION_JOINED.name);
                        expect(message.data).to.eql(sessionJoinedMessage);

                        resolve();
                    });
                }));
            });

            Promise.all(clientPromises).then(() => {
                done();
            }).catch(done);
        });
    });
});
