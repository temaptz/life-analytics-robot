const CronJob = require('cron').CronJob;
const request = require('request');
const cheerio = require('cheerio');
const config  = require('./config');

const jobTask = () => {

    console.log(new Date());

    request.get(
        {
            url     : config.url,
            headers : {
                'User-Agent': config.userAgent
            }
        }, (err, resp, body) => {

            if (!err && resp.statusCode == 200) {

                const $ = cheerio.load(body);
                const text = $(config.selector).text();
                if ( text && text.length > 0 ) {
                    const numberOfPointsInText= text.split('.').length - 1;
                    let newValue = parseFloat(text.replace(/\./g, ''));
                    if ( numberOfPointsInText - 1 > 0 ) {
                        newValue = newValue / 1000 * ( numberOfPointsInText - 1 )
                    }
                    console.log(`Recieved new value: ${newValue}`);
                    sendValueToLifeAnalytics(newValue);
                }

            }

        });
};

// Отправка данных в life-analytics
sendValueToLifeAnalytics = (newValue) => {
    request.post(
        {
            url  : config.analyticsUrl,
            body : JSON.stringify({value : newValue}),
            headers: {
                'Authorization' : `GraphHash ${config.analyticsHash}`,
                'Content-Type'  : 'application/json'
            }
        }, (err, resp, body) => {

            if (!err && resp.statusCode == 200) {

                console.log(`New value sent`);

            } else {

                console.log(`Error sending new value`);

            }

        });
};

const job = new CronJob(config.cronTime, jobTask);
job.start();