import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

const getCurrencies = async (): Promise<object> => {
    const currencies = [];
    const urls = [
        'http://api.nbp.pl/api/exchangerates/rates/a/usd/last/100',
        'http://api.nbp.pl/api/exchangerates/rates/a/eur/last/100',
        'http://api.nbp.pl/api/exchangerates/rates/a/gbp/last/100',
        'http://api.nbp.pl/api/exchangerates/rates/a/chf/last/100',
        'http://api.nbp.pl/api/exchangerates/rates/a/jpy/last/100',
        'http://api.nbp.pl/api/exchangerates/rates/a/cny/last/100'
    ];

    for (const url of urls) {
        const data = await axios.get(url)
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch(() => {
                return {};
            });

        currencies.push(data);
    }

    const gold = await axios.get('http://api.nbp.pl/api/cenyzlota/last/100/?format=json')
        .then((response: AxiosResponse) => {
            return {
                currency: 'złoto',
                code: 'gold',
                rates: response.data.map((el) => {
                    return {
                        effectiveDate: el.data,
                        mid: el.cena
                    };
                })
            };
        }).catch(() => {
            return {};
        });

    currencies.push(gold);

    return currencies;
};

const getIndexes = async (): Promise<object> => {
    const indexes = [
        { symbol: 'EPOL', name: 'pol' },
        { symbol: '^FTSE', name: 'gbr' },
        { symbol: 'EWL', name: 'sui' },
        { symbol: '^GSPC', name: 'usa' },
        { symbol: 'FEZ', name: 'eur' },
        { symbol: '^N225', name: 'jap' },
        { symbol: '000001.SS', name: 'chn' }
    ];

    const options = {
        method: 'GET',
        params: {
            interval: '1d',
            range: '6mo',
            symbols: indexes.map(el => el.symbol).join(',')
        },
        headers: {
            'x-api-key': 'ntlES7hLq56hSNleudhcA76SAe7K7u5mvYG8FpOa'
        }
    };

    const data = await axios.get('https://yfapi.net/v8/finance/spark', options)
        .then((response: AxiosResponse) => {
            return Object.keys(response.data).map((el) => {
                return {
                    values: response.data[el].close,
                    name: indexes.find(index => index.symbol === el).name
                };
            });
        }).catch(() => {
            return {};
        });

    return data;
};

const getNews = async (): Promise<object> => {
    const news = [];
    const urls = [
        'https://www.bankier.pl/rss/waluty.xml',
        'https://www.bankier.pl/rss/wiadomosci.xml',
        'https://www.bankier.pl/rss/gielda.xml',
        'https://biznes.interia.pl/waluty/aktualnosci/feed',
        'https://biznes.interia.pl/gieldy/aktualnosci/feed',
        'https://cinkciarz.pl/articles/rss/nowosci/komentarze-walutowe/komentarze-tekstowe',
        'http://www.pieniadz.pl/rss.xml'
    ];

    for (const url of urls) {
        const data = await axios.get(url)
            .then(async (response: AxiosResponse) => {
                const data = await xml2js.parseStringPromise(response.data);

                return {
                    title: data.rss.channel[0].title,
                    items: data.rss.channel[0].item
                };
            }).catch(() => {
                return {};
            });

        news.push(data);
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
            currencies: await getCurrencies(),
            indexes: await getIndexes()
        };
        lastTimestamp = currentTimestamp;
    }

    return data;
});
