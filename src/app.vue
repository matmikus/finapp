<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script lang="ts">
    export default {
        setup (): void {
            useHead({
                title: 'finApp',
                meta: [{
                    name: 'viewport',
                    content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0'
                }]
            });
        }
    };
</script>
