const {
    Avaamo,
    Parser
} = require('avaamo-customchannel');
const {
    parseName
} = require('./common');

module.exports = {
    getAvaamoResponse: async (exercise, user) => {
        //if (!exercise.includes('solve')) exercise = `solve ${exercise}`;
        console.log('exercise', exercise);
        const channel = {
            webhook: 'https://c0.avaamo.com/bot_connector_webhooks/86fe561c-5a67-49c8-8d39-50f57bb768d3/message.json',
            id: '1fb44252-2797-48ae-b195-3d0e391f38a9'
        };
        const name = parseName(user.name);
        const avaamoUser = {
            id: user.id,
            first_name: name.first_name,
            last_name: name.last_name
        };

        const avaamo = new Avaamo(avaamoUser.id, channel.webhook, channel.id, avaamoUser.first_name, avaamoUser.last_name);

        let responses = await avaamo.query(exercise);
        responses = responses.map(response => {
            try {
                let parser = new Parser(response);
                let reply = parser.parse();

                if (!reply && response.attachment) {
                    const payload = response.attachment.payload;
                    if (payload) {
                        payload.type = payload.template_type
                        reply = payload;
                    }
                }
                return convertToAdaptiveCard(reply);
            } catch (error) {
                return null;
            }
        }).filter(response => !!response);
        return responses;
    }
}

function convertToAdaptiveCard(message) {
    let convertedMsg = {
        type: 'message',
        text: message.text
    };
    if (message.type === 'card') {
        convertedMsg = parseCard(message)
    } else if (message.type === 'button') {
        convertedMsg = parseButton(message)
    } else if (message.type === 'quickreply') {
        convertedMsg = parseQuickReply(message)
    } else if (message.type === 'carousel') {
        convertedMsg = parseCarousel(message)
    } else if (message.type === 'list') {
        convertedMsg = parseList(message)
    }
    return convertedMsg;
}

function parseButton(message) {
    const actions = [];
    message.buttons.forEach(button => {
        actions.push({
            type: 'Action.Submit',
            title: button.title,
            data: {
                [button.title]: button.title
            }
        })
    });
    return {
        type: 'message',
        text: message.text,
        attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
                type: 'AdaptiveCard',
                version: '1.0',
                actions: actions
            }
        }]
    };
}

function parseQuickReply(message) {
    const actions = [];
    message.options.forEach(element => {
        actions.push({
            type: 'Action.Submit',
            title: element.title,
            data: {
                [element.title]: element.payload
            }
        })
    });
    return {
        type: 'message',
        text: message.text,
        attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
                type: 'AdaptiveCard',
                version: '1.0',
                actions: actions
            }
        }]
    };
}

function parseCard(message, parseCarouselCards = false) {
    const body = [];
    const actions = [];

    if (message.title) {
        body.push({
            type: 'TextBlock',
            text: message.title
        });
    }
    if (message.subtitle) {
        body.push({
            type: 'TextBlock',
            text: message.subtitle
        });
    }
    message.options.forEach(element => {
        if (element.type === 'postback') {
            actions.push({
                type: 'Action.Submit',
                title: element.title,
                data: {
                    [element.title]: element.payload
                }
            });
        } else if (element.type === 'web_url') {
            actions.push({
                type: 'Action.OpenUrl',
                title: element.title,
                url: element.url
            });
        }
    });

    if (parseCarouselCards) {
        return {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
                type: 'AdaptiveCard',
                backgroundImage: message.image,
                version: '1.0',
                body: body,
                actions: actions
            }
        }
    } else {
        return {
            type: 'message',
            text: '',
            attachments: [{
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                    type: 'AdaptiveCard',
                    version: '1.0',
                    body: body,
                    actions: actions
                }
            }]
        };
    }
}

function parseCarousel(message) {
    // In MS teams only admit max of 10 cards
    const attachments = [];
    message.cards.forEach(element => attachments.push(parseCard(element, true)));

    return {
        type: 'message',
        attachmentLayout: 'carousel',
        text: '',
        attachments: attachments
    };
}

function parseList(message) {
    // In teams only admit max of 10 cards
    console.log('message', message);

    const attachments = [];
    message.cards.forEach(element => attachments.push(parseCard(element, true)));

    return {
        type: 'message',
        text: '',
        attachments: attachments
    };
}