<template>
    <div>
        <div class="table">
            <div>
                <select v-model="selected">
                    <option v-for="item in currencies" :key="item">
                        {{ item }}
                    </option>
                </select>
            </div>
            <div v-for="item in chartData" :key="item">
                <div>
                    {{ item.name }}
                </div>
                <div v-if="item.values" class="value">
                    {{ item.values[item.values.length - 1] }}
                </div>
            </div>
        </div>
        <div v-for="item in chartData" :key="item" class="item">
            <div v-if="item.values">
                <div>
                    <span class="currency-name">
                        {{ item.name }}
                    </span>
                    <span class="currency-value">
                        {{ item.values[item.values.length - 1] }}
                    </span>
                </div>
                <div :id="`c-${item.name}`.replace('/', '')" class="ct-chart ct-chart--currency" />
            </div>
            <div class="stats">
                <div
                    :class="{ plus: getShift(item.values, 10) > 0, minus: getShift(item.values, 10) < 0 }"
                >
                    10D: {{ getShift(item.values, 10).toFixed(2) }}%
                </div>
                <div
                    :class="{ plus: getShift(item.values, 7) > 0, minus: getShift(item.values, 7) < 0 }"
                >
                    7D: {{ getShift(item.values, 7).toFixed(2) }}%
                </div>
                <div
                    :class="{ plus: getShift(item.values, 5) > 0, minus: getShift(item.values, 5) < 0 }"
                >
                    5D: {{ getShift(item.values, 5).toFixed(2) }}%
                </div>
                <div
                    :class="{ plus: getShift(item.values, 3) > 0, minus: getShift(item.values, 3) < 0 }"
                >
                    3D: {{ getShift(item.values, 3).toFixed(2) }}%
                </div>
                <div
                    :class="{ plus: getShift(item.values, 1) > 0, minus: getShift(item.values, 1) < 0 }"
                >
                    1D: {{ getShift(item.values, 1).toFixed(2) }}%
                </div>
            </div>
        </div>
        <div v-for="(item, index) in news" :key="index" class="news">
            <span class="news-date">
                {{ getNiceDate(item.pubDate[0]) }}
            </span>
            <span class="news-title">
                <a :href="item.link[0]" v-html="item.title[0]" />
            </span>
            <div class="news-description" v-html="item.description[0]" />
        </div>
    </div>
</template>

<script lang="ts">
    import relativeTime from 'dayjs/esm/plugin/relativeTime';

    export default {
        async setup (): Promise<object> {
            return await useFetch('/api/all');
        },
        data (): object {
            return {
                currencies: [
                    'pln',
                    'usd',
                    'eur',
                    'gbp',
                    'chf',
                    'jpy'
                ],
                selected: ''
            };
        },
        computed: {
            chartData (): Array<object> {
                return this.data.indexes.filter(el => el.currency === this.selected);
            },
            news (): Array<object> {
                const news = [...this.data.news];

                news.sort((a, b) => {
                    return this.$dayjs(a.pubDate[0]).isAfter(this.$dayjs(b.pubDate[0])) ? -1 : 1;
                });

                return news.filter((item) => {
                    return this.$dayjs(item.pubDate[0]).isAfter(this.$dayjs().subtract(1, 'week'));
                });
            }
        },
        watch: {
            selected (value: string): void {
                this.createCharts();
                window.localStorage.setItem('currency', value);
            }
        },
        mounted (): void {
            const selected = localStorage.getItem('currency');

            if (selected !== null) {
                this.selected = selected;
            } else {
                this.selected = this.currencies[0];
            }

            this.createCharts();
        },
        methods: {
            getNiceDate (uglyDate: string): string {
                this.$dayjs.extend(relativeTime);

                return this.$dayjs(uglyDate).fromNow();
            },
            createCharts (): void {
                const script: HTMLScriptElement = document.createElement('script');

                script.onload = (): void => {
                    for (const item of this.chartData) {
                        // eslint-disable-next-line
                        new Chartist.Line(
                            `#c-${item.name}`.replace('/', ''),
                            { series: [item.values] },
                            {
                                showArea: true,
                                height: '300px'
                            }
                        );
                    }
                };

                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.4/chartist.min.js';
                script.async = true;

                document.head.appendChild(script);

                const link: HTMLLinkElement = document.createElement('link');
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.4/chartist.min.css';
                link.rel = 'stylesheet';
                link.type = 'text/css';

                document.head.appendChild(link);
            },
            getShift (dataSet: Array<number>, period: number): number {
                return (((dataSet[dataSet.length - 1] / dataSet[dataSet.length - 1 - period]) - 1) * 100);
            }
        }
    };
</script>

<style lang="scss">
    body {
        background-color: #000;
        color: #fff;
    }

    .table {
        font-family: 'HelveticaNeue', 'tahoma';
        font-size: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin: 24px;
        font-family: Tahoma;

        & > * {
            margin: 16px;
        }
    }

    .value {
        font-family: monospace;
        font-size: 22px;
    }

    .item {
        font-family: 'verdana';
    }

    .currency-name {
        font-size: 24px;
    }

    .currency-value {
        font-size: 24px;
        font-weight: 800;
        margin-left: 16px;
    }

    .market-value {
        text-transform: uppercase;
        margin-left: 4px;
    }

    .ct-chart--currency {
        filter: invert(1);
    }

    .ct-chart--market {
        filter: grayscale(1);
    }

    img {
        display: none !important;
    }

    .news-title {
        margin-left: 16px;

        a {
            font-size: 18px;
            color: #fff;
            text-decoration: none;
        }
    }

    .news-description {
        margin: 16px 0;
        color: darkslategrey;
    }

    .news-date {
        font-family: monospace;
        font-size: 19px;
        color: darkslategrey;
    }

    .news {
        margin-bottom: 8px;
        padding: 4px;
        font-family: 'HelveticaNeue', 'tahoma';
    }

    select {
        font-size: 20px;
        text-transform: uppercase;
        padding: 8px;
    }

    .stats {
        display: flex;
        justify-content: flex-end;
        margin: -10px 10px 10px;

        div {
            padding: 8px;
        }
    }

    .plus {
        color: greenyellow;
    }

    .minus {
        color: red;
    }
</style>
