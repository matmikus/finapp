<template>
    <div>
        <div>usd</div>
        <div class="ct-chart" />
    </div>
</template>

<script lang="ts">
    export default {
        async setup (): Promise<object> {
            return await useFetch('/api/all');
        },
        mounted (): void {
            const script: HTMLScriptElement = document.createElement('script');
            script.onload = (): void => {
                // eslint-disable-next-line
                new Chartist.Line(
                    '.ct-chart',
                    { series: [this.data.currencies[0].rates.map(el => el.mid)] },
                    {
                        showArea: true,
                        height: '300px'
                    }
                );
            };
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.4/chartist.min.js';
            script.async = true;

            document.head.appendChild(script);

            const link: HTMLLinkElement = document.createElement('link');
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.4/chartist.min.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';

            document.head.appendChild(link);
        }
    };
</script>
