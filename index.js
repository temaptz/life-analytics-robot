const CronJob = require('cron').CronJob;
const request = require('request');
const cheerio = require('cheerio');
const fs      = require('fs');
const confDir = `${__dirname}/conf.d`;

const createCronJob = (config) => {
    const jobTask = () => {

        logMessage('startTask', config.configPath);

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
                        let newValue = parseFloat(text.replace(/\./g, ''));
                        logMessage(`Recieved new value: ${newValue}`, config.configPath);
                        sendValueToLifeAnalytics(newValue, config);
                    }

                }

            });
    };

    const job = new CronJob(config.cronTime, jobTask);
    job.start();
};

// Отправка данных в life-analytics
sendValueToLifeAnalytics = (newValue, config) => {
    request.post(
        {
            url  : config.analyticsUrl,
            body : JSON.stringify({value : newValue}),
            headers: {
                'Authorization' : `GraphHash ${config.analyticsHash}`,
                'Content-Type'  : 'application/json'
            }
        }, (err, resp) => {

            if (!err && resp.statusCode == 200) {

                logMessage(`New value sent`, config.configPath);

            } else {

                logMessage(`Error sending new value`, config.configPath);

            }

        });
};

const logMessage = (message, name='') => {
    console.log(`[${name}] [${new Date()}] ${message}`);
};

fs
    .readdirSync(confDir)
    .forEach((file) => {
        const configPath = `${confDir}/${file}`;
        const config = require(configPath);
        config.configPath = configPath;
        createCronJob(config);
    });