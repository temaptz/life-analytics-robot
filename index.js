const CronJob = require('cron').CronJob;
const request = require('request');
const cheerio = require('cheerio');

const url      = 'https://matbea.com';
const selector = '.jsRateSellVal';
const cronTime = '*/5 * * * * *';

const jobTask = () => {
    console.log('tick');

    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            const text = $(selector);
            console.log(text);
        }
    });
};


const job = new CronJob(cronTime, jobTask);
job.start();