function doPost(e) {
    const channelAccessToken = 'YOUR_CHANNEL_ACCESS_TOKEN';

    const requestBody = JSON.parse(e.postData.contents);

    if (requestBody.events) {
        requestBody.events.forEach(event => {
            const eventType = event.type;
            const replyToken = event.replyToken;
            const userId = event.source.userId;
            const messageText = event.message.text;

            this.saveLog(eventType);
            this.saveLog(replyToken);
            this.saveLog(userId);
            this.saveLog(messageText);

            if (eventType === 'message' && messageText === '麻雀の収支を記録する') {
                const flexMessage = {
                    type: 'flex',
                    altText: '麻雀の収支を記録する',
                    contents: {
                        type: 'bubble',
                        hero: {
                            type: 'image',
                            url: 'https://example.com/cafe.jpg',
                            size: 'full',
                            aspectRatio: '20:13',
                            aspectMode: 'cover',
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'md',
                            contents: [],
                        },
                        footer: {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'button',
                                    action: {
                                        type: 'postback',
                                        label: 'キャンセル',
                                        data: 'cancel',
                                    },
                                    style: 'secondary',
                                },
                            ],
                        },
                    },
                };

                const url = 'https://api.line.me/v2/bot/message/reply';
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                };
                const data = {
                    replyToken: replyToken,
                    messages: [flexMessage],
                };

                const options = {
                    method: 'post',
                    headers: headers,
                    payload: JSON.stringify(data),
                };

                try {
                    response = UrlFetchApp.fetch(url, options);
                    content = response.getContentText();
                } catch (e) {
                    this.saveLog(e.message);
                }
            }

            if (eventType === 'postback') {
                const postbackData = event.postback.data;
                const sheetId = 'YOUR_SHEET_ID';
                const sheetName = 'Sheet1';

                const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
                const row = [Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm:ss'), userId];
                let message;

                switch (postbackData) {
                    case '1st':
                        message = '1着の回数を入力してください。';
                        break;
                    case '2nd':
                        message = '2着の回数を入力してください。';
                        break;
                    case '3rd':
                        message = '3着の回数を入力してください。';
                        break;
                    case '4th':
                        message = '4着の回数を入力してください。';
                        break;
                    case 'profitLoss':
                        message = '収支を入力してください。';
                        break;
                    case 'place':
                        message = '雀荘を選択してください。';
                        break;
                    case 'cancel':
                        message = '入力をキャンセルしました。';
                        break;
                    default:
                        break;
                }
                if (message) {
                    sheet.appendRow(row.concat([message]));
                }

                const url = 'https://api.line.me/v2/bot/message/reply';
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                };
                const data = {
                    replyToken: replyToken,
                    messages: [{ type: 'text', text: message }],
                };

                const options = {
                    method: 'post',
                    headers: headers,
                    payload: JSON.stringify(data),
                };

                UrlFetchApp.fetch(url, options);
            }
        });
    }

    return ContentService.createTextOutput('success');
}

function saveLog(text) {
    // 現在日時を取得
    const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

    const lastRow = logSheet.getLastRow();
    // スプレッドシートにログを出力
    logSheet.getRange(lastRow + 1, 1).setValue(text);
    logSheet.getRange(lastRow + 1, 2).setValue(now);
}
