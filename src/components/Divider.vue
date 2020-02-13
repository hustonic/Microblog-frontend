<template>
    <div :style="dividerStyle"></div>
</template>

<script>
    export default {
        name: "Divider",
        props:{
            margin: {
                type: String,
                default(){
                    return '0'
                }
            },

        },
        data(){
            return {
                dividerStyle:{
                    'margin': this.margin,
                    'height': '1px',
                    'background-color': '#DCDFE6'
                }
            }
        }
    }
</script>

<style scoped>
</style>