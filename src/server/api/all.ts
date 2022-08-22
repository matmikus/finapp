import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

const getIndexes = async (): Promise<object> => {
    const indexes1 = [
        { symbol: 'PLN=X', name: 'USD/PLN', type: 'currency', currency: 'pln' },
        { symbol: 'GBPPLN=X', name: 'GBP/PLN', type: 'currency', currency: 'pln' },
        { symbol: 'EURPLN=X', name: 'EUR/PLN', type: 'currency', currency: 'pln' },
        { symbol: 'CHFPLN=X', name: 'CHF/PLN', type: 'currency', currency: 'pln' },
        { symbol: 'JPYPLN=X', name: 'JPY/PLN', type: 'currency', currency: 'pln' },
        { symbol: 'PLNUSD=X', name: 'PLN/USD', type: 'currency', currency: 'usd' },
        { symbol: 'GBPUSD=X', name: 'GBP/USD', type: 'currency', currency: 'usd' },
        { symbol: 'EURUSD=X', name: 'EUR/USD', type: 'currency', currency: 'usd' },
        { symbol: 'CHFUSD=X', name: 'CHF/USD', type: 'currency', currency: 'usd' },
        { symbol: 'JPYUSD=X', name: 'JPY/USD', type: 'currency', currency: 'usd' },
        { symbol: 'EUR=X', name: 'USD/EUR', type: 'currency', currency: 'eur' },
        { symbol: 'GBPEUR=X', name: 'GBP/EUR', type: 'currency', currency: 'eur' },
        { symbol: 'PLNEUR=X', name: 'PLN/EUR', type: 'currency', currency: 'eur' },
        { symbol: 'CHFEUR=X', name: 'CHF/EUR', type: 'currency', currency: 'eur' },
        { symbol: 'JPYEUR=X', name: 'JPY/EUR', type: 'currency', currency: 'eur' }
    ];

    const indexes2 = [
        { symbol: 'CHF=X', name: 'USD/CHF', type: 'currency', currency: 'chf' },
        { symbol: 'GBPCHF=X', name: 'GBP/CHF', type: 'currency', currency: 'chf' },
        { symbol: 'EURCHF=X', name: 'EUR/CHF', type: 'currency', currency: 'chf' },
        { symbol: 'PLNCHF=X', name: 'PLN/CHF', type: 'currency', currency: 'chf' },
        { symbol: 'JPYCHF=X', name: 'JPY/CHF', type: 'currency', currency: 'chf' },
        { symbol: 'GBP=X', name: 'USD/GBP', type: 'currency', currency: 'gbp' },
        { symbol: 'PLNGBP=X', name: 'PLN/GBP', type: 'currency', currency: 'gbp' },
        { symbol: 'EURGBP=X', name: 'EUR/GBP', type: 'currency', currency: 'gbp' },
        { symbol: 'CHFGBP=X', name: 'CHF/GBP', type: 'currency', currency: 'gbp' },
        { symbol: 'JPYGBP=X', name: 'JPY/GBP', type: 'currency', currency: 'gbp' },
        { symbol: 'JPY=X', name: 'USD/JPY', type: 'currency', currency: 'jpy' },
        { symbol: 'GBPJPY=X', name: 'GBP/JPY', type: 'currency', currency: 'jpy' },
        { symbol: 'EURJPY=X', name: 'EUR/JPY', type: 'currency', currency: 'jpy' },
        { symbol: 'CHFJPY=X', name: 'CHF/JPY', type: 'currency', currency: 'jpy' },
        { symbol: 'PLNJPY=X', name: 'PLN/JPY', type: 'currency', currency: 'jpy' }
    ];

    const options1 = {
        method: 'GET',
        params: {
            interval: '1d',
            range: '6mo',
            symbols: indexes1.map(el => el.symbol).join(',')
        },
        headers: {
            'x-api-key': process.env.API_KEY
        }
    };

    const options2 = {
        method: 'GET',
        params: {
            interval: '1d',
            range: '6mo',
            symbols: indexes2.map(el => el.symbol).join(',')
        },
        headers: {
            'x-api-key': process.env.API_KEY
        }
    };

    const data1 = await axios.get('https://yfapi.net/v8/finance/spark', options1)
        .then((response: AxiosResponse) => {
            return Object.keys(response.data).map((el) => {
                return {
                    values: response.data[el].close.slice(-90),
                    ...indexes1.find(index => index.symbol === el)
                };
            });
        }).catch((err) => {
            console.log(err);
            return [];
        });

    const data2 = await axios.get('https://yfapi.net/v8/finance/spark', options2)
        .then((response: AxiosResponse) => {
            return Object.keys(response.data).map((el) => {
                return {
                    values: response.data[el].close.slice(-90),
                    ...indexes2.find(index => index.symbol === el)
                };
            });
        }).catch(() => {
            return [];
        });

    return [...data1, ...data2];
};

const getNews = async (): Promise<object> => {
    const news = [];
    const urls = [
        'https://cinkciarz.pl/articles/rss/nowosci/komentarze-walutowe/komentarze-tekstowe'
    ];

    for (const url of urls) {
        const data = await axios.get(url)
            .then(async (response: AxiosResponse) => {
                const data = await xml2js.parseStringPromise(response.data);

                return data.rss.channel[0].item;
            }).catch(() => {
                return {};
            });

        news.push(...data);
    }

    return news;
};

let lastTimestamp = 0;
let data = null;

export default defineEventHandler(async () => {
    const currentTimestamp = Date.now();

    if (currentTimestamp - 3600000 > lastTimestamp) {
        data = {
            news: await getNews(),
            indexes: await getIndexes()
        };

        lastTimestamp = currentTimestamp;
    }

    return data;
});
