<template>
    <div>
        <div class="table">
            <div v-for="item in chartData" :key="item">
                <div>
                    {{ item.currency.name }}
                </div>
                <div class="value">
                    {{ item.currency.values[item.currency.values.length - 1] }}
                </div>
            </div>
        </div>
        <div v-for="item in chartData" :key="item" class="item">
            <div v-if="item.currency">
                <div>
                    <span class="currency-name">
                        {{ item.currency.name }}
                    </span>
                    <span class="currency-value">
                        {{ item.currency.values[item.currency.values.length - 1] }}
                    </span>
                </div>
                <div :id="`c-${item.name}`" class="ct-chart ct-chart--currency" />
            </div>
            <div v-if="item.index">
                <div>
                    <span class="market-name">rynek</span>
                    <span class="market-value">{{ item.index.name }}</span>
                </div>
                <div :id="`i-${item.name}`" class="ct-chart ct-chart--market" />
            </div>
        </div>
        <div v-for="(site, index) in news" :key="index" class="news">
            <div class="site-name">
                {{ site.title[0] }}
            </div>
            <div v-for="(item, index2) in site.items" :key="index2">
                <span class="item-date">
                    {{ getNiceDate(item.pubDate[0]) }}
                </span>
                <span class="item-title">
                    <a :href="item.link">
                        {{ item.title[0] }}
                    </a>
                </span>
                <div class="item-description" v-html="item.description[0]" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        async setup (): Promise<object> {
            return await useFetch('/api/all');
        },
        computed: {
            chartData (): Array<object> {
                const items = [
                    'usa',
                    'eur',
                    'gbr',
                    'sui',
                    'jap',
                    'chn',
                    'pol'
                ];

                return items.map((itemName) => {
                    return {
                        name: itemName,
                        currency: this.data.indexes.find(el => el.country === itemName && el.type === 'currency'),
                        index: this.data.indexes.find(el => el.country === itemName && el.type === 'index')
                    };
                });
            },
            news (): Array<object> {
                return this.data.news;
            }
        },
        mounted (): void {
            const script: HTMLScriptElement = document.createElement('script');
            script.onload = (): void => {
                for (const item of this.chartData) {
                    if (!item.currency || !item.index) {
                        continue;
                    }

                    // eslint-disable-next-line
                    new Chartist.Line(
                        `#c-${item.name}`,
                        { series: [item.currency.values] },
                        {
                            showArea: true,
                            height: '300px'
                        }
                    );

                    // eslint-disable-next-line
                    new Chartist.Line(
                        `#i-${item.name}`,
                        { series: [item.index.values] },
                        {
                            showArea: true,
                            height: '200px'
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
        methods: {
            getNiceDate (uglyDate: string): string {
                return this.$dayjs(uglyDate).format('DD.MM.YYYY');
            }
        }
    };
</script>

<style lang="scss">
    .table {
        font-family: 'tahoma';
        font-size: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin: 24px;

        & > * {
            margin: 16px;
        }
    }

    .value {
        font-family: monospace;
        font-size: 20px;
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

    .ct-chart--market {
        filter: grayscale(1);
    }

    img {
        display: none !important;
    }

    .site-name {
        font-size: 20px;
        margin: 24px;
    }

    .item-title {
        font-weight: 800;
        margin-left: 16px;
    }

    .item-description {
        margin: 16px 0;
    }
</style>
