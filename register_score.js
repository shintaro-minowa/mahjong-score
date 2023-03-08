function doPost(e) {
    const event = JSON.parse(e.postData.contents).events[0];
    const userId = event.source.userId;
    const replyToken = event.replyToken;
    const userMessage = event.message.text;

    if (userMessage.indexOf("雀荘") !== -1) {
        this.lineReply(replyToken, "雀荘一覧です");
    }

    if (this.validateFormat(userMessage)) {
        scoreArr = convertStrToArr(userMessage);
        this.saveScore(scoreArr);
        text = '記録しました。';
    } else {
        text = '「8-6-3-2 32000 渋谷かめきたざわ」のようなフォーマットで入力してください';
    }

    this.lineReply(replyToken, text);
}

function validateFormat(str) {
    // '8-6-3-2 32000 渋谷かめきたざわ' のようなフォーマットであるかチェック
    const regex = /^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}\s-?\d+\s.+$/;

    return regex.test(str);
}

function convertStrToArr(str) {
    const arr = str.split(' ');

    const first = parseInt(arr[0].split('-')[0]);
    const second = parseInt(arr[0].split('-')[1]);
    const third = parseInt(arr[0].split('-')[2]);
    const forth = parseInt(arr[0].split('-')[3]);
    const score = parseInt(arr[1]);
    const storeName = arr[2];

    const result = {
        first: first,
        second: second,
        third: third,
        forth: forth,
        score: score,
        storeName: storeName
    };

    return result;
}

function saveScore(score) {
    // 今年を取得
    const year = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy");
    // 今年のシートを取得
    const scoreSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(year + 'free');
    // 本日の日付を取得
    const today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd");

    const lastRow = scoreSheet.getLastRow();
    const inputRow = parseInt(lastRow) + 1;

    const store = this.getStore(score['storeName']);

    // スプレッドシートにログを出力
    scoreSheet.getRange(inputRow, 1).setValue(today);
    scoreSheet.getRange(inputRow, 3).setValue(score['score']);
    scoreSheet.getRange(inputRow, 4).setValue("=D" + lastRow + "+C" + inputRow);
    scoreSheet.getRange(inputRow, 5).setValue("=C" + inputRow + "+G" + inputRow);
    scoreSheet.getRange(inputRow, 6).setValue("=F" + lastRow + "+E" + inputRow);
    if (store) {
        scoreSheet.getRange(inputRow, 7).setValue("=" + store['baFee'] + "*L" + inputRow + "+" + store['topFee'] + "*H" + inputRow + "+" + store['entranceFee']);
    }
    scoreSheet.getRange(inputRow, 8).setValue(score['first']);
    scoreSheet.getRange(inputRow, 9).setValue(score['second']);
    scoreSheet.getRange(inputRow, 10).setValue(score['third']);
    scoreSheet.getRange(inputRow, 11).setValue(score['forth']);
    scoreSheet.getRange(inputRow, 12).setValue("=H" + inputRow + "+I" + inputRow + "+J" + inputRow + "+K" + inputRow);
    scoreSheet.getRange(inputRow, 13).setValue(score['storeName']);

}

function getStore(storeName) {
    // 雀荘の情報のシートを取得
    const storeSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('stores');
    // 雀荘の情報を全件取得
    let data = storeSheet.getDataRange().getValues();
    // userIdでフィルタリング
    let row = data.filter(row => row[0] === storeName)[0];

    if (row === undefined) return undefined;

    let store = { "baFee": row[1], "topFee": row[2], "entranceFee": row[3] };

    return store;
}

function saveLog(text) {
    // 現在日時を取得
    const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

    const lastRow = logSheet.getLastRow();
    // スプレッドシートにログを出力
    logSheet.getRange(lastRow + 1, 1).setValue(text);
    logSheet.getRange(lastRow + 1, 2).setValue(now);
}

function lineReply(replyToken, text) {
    UrlFetchApp.fetch(LINE_REPLY_URL, {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
            'replyToken': replyToken,
            'messages': [{
                'type': 'text',
                'text': text,
            }]
        })
    });
    return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);
}
