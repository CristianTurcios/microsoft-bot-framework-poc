const axios = require('axios');

module.exports = {
    getAvaamoResponse: async (exercise) => {
        if (!exercise.includes('solve')) exercise = `solve ${exercise}`;
        console.log('exercise', exercise);

        const data = {
            channel_uuid: 'e44b5717-189d-4109-b2fe-b56785d5bee9',
            user: {
                first_name: 'Cristian',
                last_name: 'Code',
                uuid: '9ac15843-151d-47fb-8b3d-930b89ce797e'
            },
            message: {
                text: exercise
            }
        };

        const requestResult = await axios({
            method: 'POST',
            url: 'https://c0.avaamo.com/bot_connector_webhooks/2771d4bb-35c7-408f-8d40-830023dc93bf/message.json',
            data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return requestResult.data.incoming_message.bot_replies[0].text;
    }
}
