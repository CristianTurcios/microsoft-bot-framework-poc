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

            if (context.activity.hasOwnProperty('value') && context.activity.value.exercise) {
                const response = await avaamo.getAvaamoResponse(context.activity.value.exercise);
                
                adaptiveCard.getResponseCard(response).forEach((element, index) => {
                    if(element.id == index) context.sendActivity(element);
                });
                await context.sendActivity(adaptiveCard.getInitialCard());
            }
            else {
                await context.sendActivity('You need put an exercise in the input field');
                await context.sendActivity(adaptiveCard.getInitialCard());
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                    await context.sendActivity(adaptiveCard.getInitialCard());
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.MyBot = MyBot;
