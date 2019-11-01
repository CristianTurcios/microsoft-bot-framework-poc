const axios = require('axios');
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
                // console.log('reply', reply);

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
    console.log('message', message);

    let convertedMsg = {
        'type': 'message',
        'text': message.text
    };
    if (message.type === 'card') {
        convertedMsg = parseCard(message)
    } else if (message.type === 'button') {
        convertedMsg = parseButton(message)
    } else if (message.type === 'quickreply') {
        convertedMsg = parseQuickReply(message)
    }

    return convertedMsg;
}

function parseCard(message) {
    const body = [];
    if (message.title) {
        body.push({
            type: 'TextBlock',
            text: message.title
        })
    }
    if (message.subtitle) {
        body.push({
            type: 'TextBlock',
            text: message.subtitle
        })
    }
    return {
        'type': 'message',
        'text': '',
        'attachments': [{
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                'type': 'AdaptiveCard',
                'version': '1.0',
                'body': body
            }
        }]
    };
}

function parseButton(message) {
    const actions = [];
    message.buttons.forEach(button => {
        actions.push({
            'type': 'Action.Submit',
            'title': button.title,
            "data": {
                [button.title]: button.title
            }
        })
    });
    return {
        'type': 'message',
        'text': message.text,
        'attachments': [{
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                'type': 'AdaptiveCard',
                'version': '1.0',
                'actions': actions
            }
        }]
    };
}

function parseQuickReply(message) {
    const actions = [];
    message.options.forEach(element => {
        actions.push({
            'type': 'Action.Submit',
            'title': element.title,
            "data": {
                [element.title]: element.title
            }
        })
    });
    return {
        'type': 'message',
        'text': message.text,
        'attachments': [{
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                'type': 'AdaptiveCard',
                'version': '1.0',
                'actions': actions
            }
        }]
    };
}