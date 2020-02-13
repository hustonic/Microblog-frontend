<template>
    <el-popover placement="bottom-start" width="425" trigger="manual" v-model="showExpression" style="margin-right: 10px">
        <el-button slot="reference" type="text" @click="handleShowExpression">
            <i class="fa fa-smile-o fa-lg" style="color: orange"/> 表情</el-button>
        <!-- 关闭按钮 -->
        <close-button :on-click="handleShowExpression"/>
        <!-- 表情 -->
        <el-tabs type="card">
            <el-tab-pane v-for="(e,index) in expressions" :key="index" :label="e.label" style="height: 250px">
                <el-scrollbar style="height: 265px">
                    <el-button v-for="(i,index) in e.items" :key="index" @click="addExpression(i)" style="margin:0; padding: 10px; width:40px">{{i}}</el-button>
                </el-scrollbar>
            </el-tab-pane>
        </el-tabs>
    </el-popover>
</template>

<script>
    import CloseButton from "@/components/CloseButton";

    export default {
        name: "ExpressionSelector",
        components:{CloseButton},
        props:{
            inputDom:{
                type: [HTMLTextAreaElement, Object],
                required: true
            },
            text: {
                type: String,
                required: true
            },
            showExpression: {
                type: Boolean,
                default(){
                    return false
                }
            }
        },
        data(){
            return {
                expressions: [
                    {
                        label: '默认',
                        items: ['😀','😁','😂','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','😗','😙','😚','😇','😐','😑','😶','😏','😣','😥','😮','😯','😪','😫','😴','😌','😛','😜','😝','😒','😓','😔','😕','😲','😷','😖','😞','😟','😤','😢','😭','😦','😧','😨','😬','😰','😱','😳','😵','😡','😠','💪','👈','👉','👆','👇','👌','👍','👎','👊','👋','👏','👐','✍','✌','✋','☝','✊','💘','❤','💓','💔','💕','💖','💗','💙','💚','💛','💜','💝','💞','💟','❣']
                    },
                    {
                        label: '人物',
                        items: ['👦','👧','👨','👩','👴','👵','👶','👱','👮','👲','👳','👷','👸','💂','🎅','👰','👼','💆','💇','🙍','🙎','🙅','🙆','💁','🙋','🙇','🙌','🙏','👤','👥','🚶','🏃','👯','💃','👫','👬','👭','💏','💑','👪']
                    },
                    {
                        label: '动物',
                        items: ['🙈','🙉','🙊','🐵','🐒','🐶','🐕','🐩','🐺','🐱','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐈','🐯','🐅','🐆','🐴','🐎','🐮','🐂','🐃','🐄','🐷','🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🐘','🐭','🐁','🐀','🐹','🐰','🐇','🐻','🐨','🐼','🐾','🐔','🐓','🐣','🐤','🐥','🐦','🐧','🐸','🐊','🐢','🐍','🐲','🐉','🐳','🐋','🐬','🐟','🐠','🐡','🐙','🐚','🐌','🐛','🐜','🐝','🐞','🦋']
                    },
                    {
                        label: '食物',
                        items: ['☕','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🍎','🍏','🍐','🍑','🍒','🍓','🍅','🍆','🌽','🍄','🌰','🍞','🍖','🍗','🍔','🍟','🍕','🍳','🍲','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🍡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🍫','🍬','🍭','🍮','🍯','🍼','🍵','🍶','🍷','🍸','🍹','🍺','🍻','🍴']
                    }
                ]
            }
        },
        methods:{
            handleShowExpression(){
                this.$emit('update:showExpression', !this.showExpression)
            },
            addExpression(expression) {  // 参数: emoji字符, input DOM对象;
                //获取光标位置
                let input=this.inputDom;
                let selectionStart = input.selectionStart;
                let selectionEnd = input.selectionEnd;
                let text = input.value;
                //在光标位置插入表情，通知父组件更新text
                this.$emit('update:text', text.substring(0, selectionStart) + expression + text.substring(selectionEnd));
                //重新获取焦点
                input.focus();
                let newStart = selectionStart + expression.length;
                //设置光标位置，这里需要设置一定延时，否则没有效果
                setTimeout(()=>{
                    input.setSelectionRange(newStart, newStart);
                }, 10);
            }
        }
    }
</script>

<style scoped>

</style>