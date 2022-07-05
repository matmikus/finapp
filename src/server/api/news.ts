import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

const getData = async (): Promise<object> => {
    const news = [];
    const urls = [
        'https://www.bankier.pl/rss/waluty.xml',
        'https://www.bankier.pl/rss/wiadomosci.xml',
        'https://www.bankier.pl/rss/gielda.xml'
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
        data = await getData();
        lastTimestamp = currentTimestamp;
    }

    return data;
});
