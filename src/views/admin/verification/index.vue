<template>
    <div v-loading="loadingPic" v-infinite-scroll="listVerifyingVerification" :infinite-scroll-disabled="disabled">
        <el-page-header @back="$router.push('/')" content="微博认证审核"/>
        <div style="margin: 30px"/>

        <el-table :data="verifications" border stripe style="width: 100%">
            <el-table-column label="用户ID">
                <template v-slot="scope">
                    <el-link :underline="false" type="primary" @click="toUserPage(scope.row.userId)">{{scope.row.userId}}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="认证类型">
                <template v-slot="scope">{{scope.row.verType|verTypeText}}</template>
            </el-table-column>
            <el-table-column prop="verDesc" label="认证描述"/>
            <el-table-column prop="verRealName" label="真实姓名"/>
            <el-table-column prop="verIdentityCard" label="身份证号" width="170"/>
            <el-table-column label="认证状态">
                <template v-slot="scope">{{scope.row.verState|verStateText}}</template>
            </el-table-column>
            <el-table-column label="申请时间">
                <template v-slot="scope">{{scope.row.verTime|formatDate}}</template>
            </el-table-column>
            <el-table-column label="认证材料">
                <template v-slot="scope">
                    <el-link v-for="resId in scope.row.resIds" :key="resId" @click="showPic(resId)" :underline="false" type="primary">
                        {{resId}}
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template v-slot="scope">
                    <el-button type="primary" @click="showVerifyDialog(scope.row)">审核</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="center-text">
            <p v-if="loading">加载中...</p>
            <p v-if="noMore">没有更多了</p>
        </div>

        <el-dialog :visible.sync="dialogVisible">
            <el-form ref="form" :model="verifyForm" :rules="rules" label-position="right" label-width="80px">
                <el-form-item prop="verDesc" label="认证描述">
                    <el-input v-model="verifyForm.verDesc"/>
                </el-form-item>
                <el-form-item label="认证结果">
                    <el-radio-group v-model="verifyForm.verState">
                        <el-radio border :label="1">不通过</el-radio>
                        <el-radio border :label="2">通过</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="结果说明">
                    <el-input v-model="verifyForm.verResDesc"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="verify">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Verification",
        data(){
            const validateVerDesc = (rule, value, callback) => {
                if (!value) return callback(new Error('请输入认证描述'));
                if (!/^.{1,100}$/.test(value))
                    return callback(new Error('认证描述为1-100个字符'));
                return callback();
            };
            const validateVerResDesc = (rule, value, callback) => {
                if (!/^.{0,255}$/.test(value))
                    return callback(new Error('认证描述少于255个字符'));
                return callback();
            };
            return {
                verifications:[],
                offset: 0,
                limit : 10,
                loading: false,
                noMore: false,
                dialogVisible: false,
                loadingPic: false,
                verifyForm:{
                    verId: '',
                    verDesc: '',
                    verState: 1,
                    verResDesc: ''
                },
                rules:{
                    verDesc: [
                        {validator: validateVerDesc, trigger: 'blur'}
                    ],
                    verResDesc: [
                        {validator: validateVerResDesc, trigger: 'blur'}
                    ]
                }
            }
        },
        computed: {
            disabled () {
                return this.loading || this.noMore;
            }
        },
        methods:{
            toUserPage(userId){
                let path=`/user-page/${userId}`;
                let currentPath=this.$route.path;
                if(path!==currentPath){
                    window.open(path, '_blank');
                }
            },
            showPic(resId){
                this.loadingPic=true;
                this.$api.resource.getResUrl({resId: resId}).then((response)=>{
                    const url=response.data.data;
                    window.open(url, '_blank');
                }).finally(()=>{
                    this.loadingPic=false;
                })
            },
            showVerifyDialog(verification){
                this.verifyForm.verId=verification.verId;
                this.verifyForm.verDesc=verification.verDesc;
                this.verifyForm.verState=1;
                this.verifyForm.verResDesc='';
                this.dialogVisible=true;
            },
            verify(){
                this.$refs['form'].validate((valid)=>{
                    if(!valid) return false;
                    this.$api.verification.verify(this.verifyForm).then(()=>{
                        this.$message.success('审核成功');
                        this.dialogVisible=false;
                        //删除对应项
                        for (let i in this.verifications) {
                            if(this.verifications[i].verId===this.verifyForm.verId){
                                this.verifications.splice(i, 1);
                                return;
                            }
                        }
                    })
                })
            },
            listVerifyingVerification(){
                this.loading=true;
                this.$api.verification.listVerifyingVerification({
                    offset: this.offset,
                    limit : this.limit
                }).then((response)=>{
                    let length = response.data.data.length;
                    if(length!==0){
                        this.verifications.push(...response.data.data);
                        this.offset+=length;
                    }
                    if(length===0 || length<this.limit){
                        this.noMore = true;
                    }
                }).catch(()=>{
                    this.noMore=true;
                }).finally(()=>{
                    this.loading=false;
                })
            },
            fetchData(){

            }
        },
        created(){
            this.fetchData();
        },
        watch:{
            '$route': 'fetchData'
        }
    }
</script>

<style scoped>
    .center-text{
        width: fit-content;
        margin: 0 auto;
    }
</style>