<template>
    <div>finApp</div>
</template>

<script lang="ts">
    export default {
        async setup (): Promise<object> {
            return await useFetch('/api/currency');
        }
    };
</script>
