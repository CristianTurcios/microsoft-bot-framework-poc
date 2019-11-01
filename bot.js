// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const avaamo = require('./helpers/avaamo');
const adaptiveCard = require('./helpers/adaptativeCards');


class MyBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            console.log(context.activity.value);
            console.log(context.activity.text);
            
            let text;
            if (context.activity.text) {
                text = context.activity.text
                .replace('<at>dev wolfie</at>', '')
                .replace('<at>wolfie-dev</at>', '');
            }
            else {
                text = Object.keys(context.activity.value)[0];
            }


            const from = context.activity.from;
            const responses = await avaamo.getAvaamoResponse(text, from);
            responses.forEach(async (element) => await context.sendActivity(element));

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                    await context.sendActivity(adaptiveCard.getInitialCard(context));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.MyBot = MyBot;
