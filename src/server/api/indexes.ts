import axios, { AxiosResponse } from 'axios';

const getData = async (): Promise<object> => {
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
