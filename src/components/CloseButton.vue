<template>
    <div style="height: 16px">
        <el-button type="text" icon="el-icon-close fa-lg" @click="onClick" style="margin:0; padding:0; float:right;"/>
    </div>
</template>

<script>
    export default {
        name: "CloseButton",
        props:{
            onClick: {
                type: Function,
                default(){}
            }
        }
    }
</script>

<style scoped>

</style>