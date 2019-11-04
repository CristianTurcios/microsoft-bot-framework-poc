module.exports = {
  getInitialCard: (context) => {
    const { name } = context.activity.from;
    return {
      type: 'message',
      text: '',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.0',
            body: [
              {
                type: 'TextBlock',
                text: `Hi ${name}! I am here to help you resolve any math question you may have 🤓`,
              },
              {
                type: 'Input.Text',
                id: 'exercise',
                placeholder: 'Eg: solve 3x-7=11',
              },
            ],
            actions: [
              {
                type: 'Action.Submit',
                title: 'Submit',
              },
            ],
          },
        },
      ],
    };
  },

  getResponseCard: (data = {}) => {
    const images = [{
      type: 'message',
      text: '',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.0',
            body: [
              {
                type: 'TextBlock',
                text: 'Here is the answer of your question',
                size: 'large',
              },
              {
                type: 'TextBlock',
                text: 'Step by step you can view how solve the exercise',
                size: 'medium',
                weight: 'lighter',
              },
            ],
          },
        },
      ],
    }];
    data = JSON.parse(data);

    data.queryresult.pods.forEach((pod) => {
      pod.subpods.forEach((subpod) => {
        const messages = subpod.plaintext.split('\n');
        const body = [];
        messages.forEach((element) => {
          body.push({
            type: 'TextBlock',
            text: element !== '' ? `[${element.replace('|', '')}](${subpod.img.src})` : `[Open Image](${subpod.img.src})`,
            size: 'medium',
            weight: 'lighter',
          });
        });
        images.push({
          type: 'message',
          text: '',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                version: '1.0',
                body,
              },
            },
          ],
        });
      });
    });
    return images;
  },

  parseButton: (message) => {
    const actions = [];
    message.buttons.forEach((button) => {
      actions.push({
        type: 'Action.Submit',
        title: button.title,
        data: {
          [button.title]: button.title,
        },
      });
    });
    return {
      type: 'message',
      text: message.text,
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.0',
          actions,
        },
      }],
    };
  },

  parseQuickReply: (message) => {
    const actions = [];
    message.options.forEach((element) => {
      actions.push({
        type: 'Action.Submit',
        title: element.title,
        data: {
          [element.title]: element.payload,
        },
      });
    });
    return {
      type: 'message',
      text: message.text,
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.0',
          actions,
        },
      }],
    };
  },

  parseCard: (message, parseCarouselCards = false) => {
    const body = [];
    const actions = [];

    if (message.title) {
      body.push({
        type: 'TextBlock',
        text: message.title,
      });
    }
    if (message.subtitle) {
      body.push({
        type: 'TextBlock',
        text: message.subtitle,
      });
    }
    message.options.forEach((element) => {
      if (element.type === 'postback') {
        actions.push({
          type: 'Action.Submit',
          title: element.title,
          data: {
            [element.title]: element.payload,
          },
        });
      } else if (element.type === 'web_url') {
        actions.push({
          type: 'Action.OpenUrl',
          title: element.title,
          url: element.url,
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
          body,
          actions,
        },
      };
    }
    return {
      type: 'message',
      text: '',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.0',
          body,
          actions,
        },
      }],
    };
  },

  parseCarousel: (message) => {
    // In MS teams only admit max of 10 cards
    const attachments = [];
    message.cards.forEach((element) => attachments.push(module.exports.parseCard(element, true)));

    return {
      type: 'message',
      attachmentLayout: 'carousel',
      text: '',
      attachments,
    };
  },

  parseList: (message) => {
    // In teams only admit max of 10 cards
    const attachments = [];
    message.cards.forEach((element) => attachments.push(module.exports.parseCard(element, true)));

    return {
      type: 'message',
      text: '',
      attachments,
    };
  },


};
