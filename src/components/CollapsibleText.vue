<template>
    <span>
        <!-- 每一行加上<br/>标签，最后一行不加 -->
        <span v-for="(line, index) in mblogLines" :key="index">
            {{line}}<br v-if="index!==mblogLines.length-1"/>
        </span>
        <span v-if="tooLong">
            <span v-if="!expand">... </span>
            <el-button type="text" @click="expand=!expand" style="padding: 0">
                <span v-if="!expand">展开全文 <i class="el-icon-arrow-down"/></span>
                <span v-else>收起全文 <i class="el-icon-arrow-up"/></span>
            </el-button>
        </span>
    </span>
</template>

<script>
    export default {
        name: "CollapsibleText",
        props:{
            text: {
                type: String,
                default(){
                    return '';
                }
            }
        },
        data(){
          return {
              expand: false,
              maxLines: 4,
              maxLength: 140
          }
        },
        computed: {
            tooLong() {
                let lines = 0;
                for (let i = 0; i < this.text.length; i++) {
                    if (this.text.charAt(i) === '\n') {
                        lines++;
                    }
                }
                return this.text.length > this.maxLength || lines >= this.maxLines;
            },
            mblogLines() {
                let text = this.text;
                if (this.tooLong && !this.expand) {
                    if (this.text.length > this.maxLength) {
                        text = this.text.substring(0, this.maxLength);
                    } else {
                        let lines = 0;
                        for (let i = 0; i < this.text.length; i++) {
                            if (this.text.charAt(i) === '\n') {
                                lines++;
                                if (lines >= this.maxLines) {
                                    text = this.text.substring(0, i);
                                    break;
                                }
                            }
                        }
                    }
                }
                return this.$utils.textToList(text);
            }
        }
    }
</script>

<style scoped>

</style>