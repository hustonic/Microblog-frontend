<template>
    <div style="width:800px; margin: 0 auto">
        <el-card v-loading="loading">
            微博认证
            <el-divider/>
            <div v-if="!verification">
                <div class="center">当前账号还没有进行微博认证，请选择认证类型进行认证。</div>
                <div class="center">认证成功后会显示独有标识，彰显不同身份哦。</div>
                <el-form ref="form" :model="verifyForm" :rules="rules" label-position="right" label-width="80px"
                         style="margin: 50px 100px;">
                    <el-form-item label="认证类型" prop="verType">
                        <el-radio-group v-model="verifyForm.verType">
                            <el-radio border :label="0">身份认证</el-radio>
                            <el-radio border :label="1">兴趣认证</el-radio>
                            <el-radio border :label="2">组织认证</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="认证描述" prop="verDesc">
                        <el-input v-model="verifyForm.verDesc" :placeholder="verDescPlaceholder"/>
                    </el-form-item>
                    <el-form-item label="真实姓名" prop="verRealName">
                        <el-input v-model="verifyForm.verRealName" :placeholder="verRealNamePlaceholder"/>
                    </el-form-item>
                    <el-form-item label="身份证号" prop="verIdentityCard">
                        <el-input v-model="verifyForm.verIdentityCard" :placeholder="verIdentityCardPlaceholder"/>
                    </el-form-item>
                    <el-form-item label="认证材料">
                        {{verPicPlaceholder}}
                        <picture-upload ref="upload" :max-pic-num="9"
                                        :res-usage="this.$api.resource.enums.resourceUsage.VERIFICATION"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="addVerification">提交申请</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <div v-else class="center verification-info-container">
                <div>认证类型： {{verification.verType | verTypeText}}</div>
                <div>认证描述： {{verification.verDesc}}</div>
                <div>真实姓名： {{verification.verRealName}}</div>
                <div>身份证号： {{verification.verIdentityCard}}</div>
                <div>认证状态： {{verification.verState | verStateText}}</div>
                <div>认证结果： {{verification.verResDesc}}</div>
                <div>认证时间： {{verification.verTime | formatDate}}</div>
                <div>
                    认证材料：
                    <div v-if="resUrls" style="width: 360px">
                        <img v-for="resUrl in resUrls" :key="resUrl" :src="resUrl" alt="" @click="previewPic(resUrl)"
                             style="width: 100px; height: 100px; margin: 10px; cursor: pointer"/>
                    </div>
                    <!-- 图片预览 -->
                    <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" fullscreen>
                        <img width="100%" :src="dialogImageUrl" alt="">
                    </el-dialog>
                </div>
                <div>
                    操作：
                    <el-button @click="cancelVerify">取消认证</el-button>
                    <el-button v-if="verification&&verification.verState===this.$api.verification.enums.verificationState.CONFIRMING"
                               @click="confirm" type="primary">确认</el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
    import PictureUpload from "@/components/PictureUpload";

    export default {
        name: "Verification",
        components: {PictureUpload},
        data() {
            const validateVerDesc = (rule, value, callback) => {
                if (!value) return callback(new Error('请输入认证描述'));
                if (!/^.{1,100}$/.test(value))
                    return callback(new Error('认证描述为1-100个字符'));
                return callback();
            };
            const validateVerRealName = (rule, value, callback) => {
                if (!value) return callback(new Error('请输入真实姓名'));
                if (!/^[\u4E00-\u9FA5a-zA-Z·]{1,30}$/.test(value))
                    return callback(new Error('真实姓名只能包含中、英文和圆点‘·’，1-30个字符'));
                return callback();
            };
            const validateVerIdentityCard = (rule, value, callback) => {
                if (!value) return callback(new Error('请输入身份证号'));
                if (!/^[0-9X]{18}$/.test(value))
                    return callback(new Error('身份证号为18位数字，最后一位可以为X'));
                return callback();
            };
            return {
                loading: false,
                verification: null,
                resUrls: [],
                dialogVisible: false,
                dialogImageUrl: '',

                verifyForm: {
                    verType: this.$api.verification.enums.verificationType.PERSON,
                    verDesc: '',
                    verRealName: '',
                    verIdentityCard: '',
                    resIds: []
                },
                rules: {
                    verDesc: [
                        {validator: validateVerDesc, trigger: 'blur'}
                    ],
                    verRealName: [
                        {validator: validateVerRealName, trigger: 'blur'}
                    ],
                    verIdentityCard: [
                        {validator: validateVerIdentityCard, trigger: 'blur'}
                    ]
                }
            }
        },
        computed: {
            verDescPlaceholder() {
                let verificationType = this.$api.verification.enums.verificationType;
                switch (this.verifyForm.verType) {
                    case verificationType.PERSON:
                        return '请输自己的职业信息，如医生、律师、教师等';
                    case verificationType.INTEREST:
                        return '请输入自己擅长的垂直领域描述，如互联网博主、数码博主、综艺博主等';
                    case verificationType.ORGANIZATION:
                        return '请输入组织描述，如XXX机构官方微博';
                    default:
                        return '';
                }
            },
            verPicPlaceholder() {
                let verificationType = this.$api.verification.enums.verificationType;
                switch (this.verifyForm.verType) {
                    case verificationType.PERSON:
                        return '请上传身份证正反面、行业资格证明等照片';
                    case verificationType.INTEREST:
                        return '请上传身份证正反面、或其他证明材料，并确保发布过的微博内容符合垂直领域描述';
                    case verificationType.ORGANIZATION:
                        return '请上传代表人的身份证正反面、组织机构证明等照片';
                    default:
                        return '';
                }
            },
            verRealNamePlaceholder() {
                let verificationType = this.$api.verification.enums.verificationType;
                switch (this.verifyForm.verType) {
                    case verificationType.PERSON:
                        return '请输入本人真实姓名';
                    case verificationType.INTEREST:
                        return '请输入本人真实姓名';
                    case verificationType.ORGANIZATION:
                        return '请输入组织代表人/帐号管理者的真实姓名';
                    default:
                        return '';
                }
            },
            verIdentityCardPlaceholder() {
                let verificationType = this.$api.verification.enums.verificationType;
                switch (this.verifyForm.verType) {
                    case verificationType.PERSON:
                        return '请输入本人身份证号';
                    case verificationType.INTEREST:
                        return '请输入本人身份证号';
                    case verificationType.ORGANIZATION:
                        return '请输入组织代表人/帐号管理者的身份证号';
                    default:
                        return '';
                }
            }
        },
        methods: {
            previewPic(url) {
                this.dialogImageUrl = url;
                this.dialogVisible = true;
            },
            cancelVerify() {
                this.$api.verification.deleteVerification({verId: this.verification.verId}).then(() => {
                    this.$message.success('取消微博认证成功');
                    this.verification = null;
                }).catch((error)=>{
                    if(error.response.status===400||error.response.status===422){
                        this.$message.error(error.response.data.mesage);
                    }
                })
            },
            confirm(){
                this.$api.verification.confirm({verId: this.verification.verId}).then(()=>{
                    this.$message.success('确认认证结果成功');
                    this.verification.verState=this.$api.verification.enums.verificationState.FINISHED;
                }).catch((error)=>{
                    if(error.response.status===400||error.response.status===422){
                        this.$message.error(error.response.data.message);
                    }
                })
            },
            addVerification() {
                this.$refs['form'].validate((valid) => {
                    if (!valid) return false;

                    this.verifyForm.resIds = this.$refs['upload'].getResIds();
                    if (this.verifyForm.resIds.length === 0) {
                        this.$message.warning("请上传证明材料");
                        return;
                    }

                    this.$api.verification.addVerification(this.verifyForm).then((response) => {
                        this.$message.success("已提交认证申请，请等待审核");
                        this.verification = response.data.data;
                        this.resUrls = [];
                        this.verification.resIds.forEach((resId) => {
                            this.getResUrl(resId)
                        });
                    }).catch((error) => {
                        if (error.response.status === 400 || error.response.status === 422)
                            this.$message.error({message: error.response.data.message, showClose: true});
                    })
                });
            },
            getResUrl(resId) {
                if (!this.resUrls && !(this.resUrls instanceof Array)) {
                    this.resUrls = [];
                }
                this.$api.resource.getResUrl({resId: resId}).then((response) => {
                    this.resUrls.push(response.data.data);
                })
            },
            getVerification() {
                this.loading=true;
                this.$api.verification.getVerification({userId: this.$store.state.userId}).then((response) => {
                    this.verification = response.data.data;
                    this.resUrls = [];
                    if (this.verification) {
                        this.verification.resIds.forEach((resId) => {
                            this.getResUrl(resId)
                        });
                    }
                }).catch(()=>{
                    this.$message.error('获取数据失败，请刷新重试');
                })
                .finally(()=>{
                    this.loading=false;
                })
            },
            fetchData() {
                this.getVerification();
            }
        },
        created() {
            this.fetchData();
        },
        watch: {
            '$route': 'fetchData'
        }
    }
</script>

<style scoped>
    .center {
        width: fit-content;
        margin: 0 auto;
    }

    .divider {
        margin: 15px;
    }

    .verification-info-container > div {
        margin: 20px;
    }
</style>