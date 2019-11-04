const {
  Avaamo,
  Parser,
} = require('avaamo-customchannel');
const {
  parseName,
} = require('./common');
const adaptativeCardsCustom = require('./adaptativeCards');

module.exports = {
  getAvaamoResponse: async (exercise, user) => {
    // if (!exercise.includes('solve')) exercise = `solve ${exercise}`;
    const channel = {
      webhook: 'https://c0.avaamo.com/bot_connector_webhooks/86fe561c-5a67-49c8-8d39-50f57bb768d3/message.json',
      id: '1fb44252-2797-48ae-b195-3d0e391f38a9',
    };
    const name = parseName(user.name);
    const avaamoUser = {
      id: user.id,
      first_name: name.first_name,
      last_name: name.last_name,
    };

    const avaamo = new Avaamo(
      avaamoUser.id,
      channel.webhook,
      channel.id,
      avaamoUser.first_name,
      avaamoUser.last_name,
    );

    let responses = await avaamo.query(exercise);
    responses = responses.map((response) => {
      try {
        const parser = new Parser(response);
        let reply = parser.parse();

        if (!reply && response.attachment) {
          const {
            payload,
          } = response.attachment;
          if (payload) {
            payload.type = payload.template_type;
            reply = payload;
          }
        }
        return module.exports.convertToAdaptiveCard(reply);
      } catch (error) {
        return null;
      }
    }).filter((response) => !!response);
    return responses;
  },

  convertToAdaptiveCard: (message) => {
    let convertedMsg = {
      type: 'message',
      text: message.text,
    };
    if (message.type === 'card') {
      convertedMsg = adaptativeCardsCustom.parseCard(message);
    } else if (message.type === 'button') {
      convertedMsg = adaptativeCardsCustom.parseButton(message);
    } else if (message.type === 'quickreply') {
      convertedMsg = adaptativeCardsCustom.parseQuickReply(message);
    } else if (message.type === 'carousel') {
      convertedMsg = adaptativeCardsCustom.parseCarousel(message);
    } else if (message.type === 'list') {
      convertedMsg = adaptativeCardsCustom.parseList(message);
    }
    return convertedMsg;
  },
};
