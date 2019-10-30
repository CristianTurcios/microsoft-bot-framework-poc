module.exports = {
    getInitialCard: () => {
        return {
            type: 'message',
            text: '',
            attachments: [
                {
                    'contentType': 'application/vnd.microsoft.card.adaptive',
                    'content': {
                        'type': 'AdaptiveCard',
                        'version': '1.0',
                        'body': [
                            {
                                'type': 'TextBlock',
                                'text': 'Hi! I am here to help you resolve any math question you may have 🤓'
                            },
                            {
                                'type': 'Input.Text',
                                'id': 'exercise',
                                'placeholder': 'Eg: solve 3x-7=11'
                            }
                        ],
                        'actions': [
                            {
                                'type': 'Action.Submit',
                                'title': 'Submit',
                            }
                        ]
                    }
                }
            ]
        };
    },

    getResponseCard: (data = {}) => {
        let images = [{
            'type': 'message',
            'text': '',
            'attachments': [
                {
                    'contentType': 'application/vnd.microsoft.card.adaptive',
                    'content': {
                        'type': 'AdaptiveCard',
                        'version': '1.0',
                        'body': [
                            {
                                type: 'TextBlock',
                                text: 'Here is the answer of your question',
                                size: 'large'
                            },
                            {
                                type: 'TextBlock',
                                text: 'Step by step you can view how solve the exercise',
                                size: 'medium',
                                weight: 'lighter'
                            }
                        ]
                    }
                }
            ]
        },];
        console.log('data', data);
        data = JSON.parse(data);

        data.queryresult.pods.forEach(pod => {
            pod.subpods.forEach(subpod => {

                const messages = subpod.plaintext.split('\n');
                console.log('messages', messages);
                const body = [];
                messages.forEach(element => {
                    body.push({
                        type: 'TextBlock',
                        text: element !== '' ? `[${element.replace('|', '')}](${subpod.img.src})`: `[Open Image](${subpod.img.src})`, 
                        size: 'medium',
                        weight: 'lighter'
                    })
                });
                images.push({
                    'type': 'message',
                    'text': '',
                    'attachments': [
                        {
                            'contentType': 'application/vnd.microsoft.card.adaptive',
                            'content': {
                                'type': 'AdaptiveCard',
                                'version': '1.0',
                                'body': body
                            }
                        }
                    ]
                });
            });
        });
        return images;
    }
}
