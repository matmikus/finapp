import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

const getGold = async (): Promise<object> => {
    return await axios.get('http://api.nbp.pl/api/cenyzlota/last/90/?format=json')
        .then((response: AxiosResponse) => {
            return {
                name: 'gold/pln',
                country: 'pol',
                type: 'currency',
                values: response.data.map((el) => {
                    return el.cena;
                })
            };
        }).catch(() => {
            return {};
        });
};

const getIndexes = async (): Promise<object> => {
    const indexes = [
        { symbol: 'EPOL', name: 'pol', country: 'pol', type: 'index' },
        { symbol: '^FTSE', name: 'gbr', country: 'gbr', type: 'index' },
        { symbol: 'EWL', name: 'sui', country: 'sui', type: 'index' },
        { symbol: '^GSPC', name: 'usa', country: 'usa', type: 'index' },
        { symbol: 'FEZ', name: 'eur', country: 'eur', type: 'index' },
        { symbol: '^N225', name: 'jap', country: 'jap', type: 'index' },
        { symbol: '000001.SS', name: 'chn', country: 'chn', type: 'index' },
        { symbol: 'PLN=X', name: 'USD/PLN', country: 'usa', type: 'currency' },
        { symbol: 'GBPPLN=X', name: 'GBP/PLN', country: 'gbr', type: 'currency' },
        { symbol: 'EURPLN=X', name: 'EUR/PLN', country: 'eur', type: 'currency' },
        { symbol: 'CHFPLN=X', name: 'CHF/PLN', country: 'sui', type: 'currency' },
        { symbol: 'JPYPLN=X', name: 'JPY/PLN', country: 'jap', type: 'currency' },
        { symbol: 'CNYPLN=X', name: 'CNY/PLN', country: 'chn', type: 'currency' }
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
                    values: response.data[el].close.slice(-90),
                    ...indexes.find(index => index.symbol === el)
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
            indexes: await getIndexes()
        };

        data.indexes.push(await getGold());
        lastTimestamp = currentTimestamp;
    }

    return data;
});
