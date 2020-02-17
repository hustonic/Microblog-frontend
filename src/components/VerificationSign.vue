<template>
    <el-tooltip effect="light" placement="top" v-if="verification">
        <div slot="content" v-if="verification.verType===this.$api.verification.enums.verificationType.PERSON">微博个人认证</div>
        <div slot="content" v-if="verification.verType===this.$api.verification.enums.verificationType.INTEREST">微博个人认证</div>
        <div slot="content" v-if="verification.verType===this.$api.verification.enums.verificationType.ORGANIZATION">微博官方认证</div>

        <div style="cursor: pointer; width: fit-content;" @click="toVerificationPage">
            <span v-if="!complex">
                <i class="fa fa-vimeo person"
                   v-if="verification.verType===this.$api.verification.enums.verificationType.PERSON"/>
                <i class="fa fa-vimeo interest"
                   v-if="verification.verType===this.$api.verification.enums.verificationType.INTEREST"/>
                <i class="fa fa-vimeo org"
                   v-if="verification.verType===this.$api.verification.enums.verificationType.ORGANIZATION"/>
            </span>

            <div v-if="complex" :class="['v-sign',{
                            'v-person':verification.verType===this.$api.verification.enums.verificationType.PERSON,
                            'v-interest':verification.verType===this.$api.verification.enums.verificationType.INTEREST,
                            'v-org':verification.verType===this.$api.verification.enums.verificationType.ORGANIZATION
                        }]">
                <i class="fa fa-vimeo"/> 微博认证
            </div>
        </div>
    </el-tooltip>
</template>

<script>
    export default {
        name: "VerificationSign",
        props: {
            userId: Number,
            customVerification: Object,
            complex: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                verification: null
            }
        },
        methods: {
            toVerificationPage() {
                this.$router.push('/verification')
            },
            getVerification() {
                if (this.customVerification) {
                    this.verification = this.customVerification;
                } else if (this.userId) {
                    this.$api.verification.getVerification({userId: this.userId}).then((response) => {
                        this.verification = response.data.data;
                    })
                }
            },
            fetchData() {
                this.getVerification();
            }
        },
        created() {
            this.fetchData();
        },
        watch: {
            userId() {
                this.getVerification();
            },
            customVerification(){
                this.getVerification();
            }
        }
    }
</script>

<style scoped>
    .person {
        color: #ffb502;
    }

    .interest {
        color: #ffb502;
    }

    .org {
        color: #2fb0f7;
    }

    .v-sign {
        width: fit-content;
        padding: 6px;
        color: white;
        border-radius: 20px;
    }

    .v-person {
        background-color: #ffb502;
    }

    .v-interest {
        background-color: #ffb502;
    }

    .v-org {
        background-color: #2fb0f7;
    }
</style>