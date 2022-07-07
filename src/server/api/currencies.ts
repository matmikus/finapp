import axios, { AxiosResponse } from 'axios';

const getData = async (): Promise<object> => {
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

let lastTimestamp = 0;
let data = null;

export default defineEventHandler(async () => {
    const currentTimestamp = Date.now();

    if (currentTimestamp - 3600000 > lastTimestamp) {
        data = await getData();
        lastTimestamp = currentTimestamp;
    }

    return data;
});
