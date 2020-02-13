<template>
    <span style="font-size: small; color: #808080">{{time | formatDate}}</span>
</template>

<script>
    export default {
        name: "TimeText",
        props: {
            time: {
                type: String,
                required: true
            }
        }
    }
</script>

<style scoped>

</style>