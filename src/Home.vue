<template>
    <el-container style="height: 700px; border: 1px solid #eee">
        <el-header style="text-align: right; font-size: 12px">
            <el-dropdown @command="command">
                <i class="el-icon-setting" style="margin-right: 15px"></i>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="exit">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <span>{{ emp.name }}</span>
        </el-header>
        <el-container>
            <el-aside width="200px" style="height: 640px;background-color: rgb(238, 241, 246)">
                <el-menu :router=true :unique-opened=true>
                    <el-submenu index="1">
                        <template slot="title">
                            <i class="el-icon-setting"></i>系统管理
                        </template>
                        <el-menu-item index="/person">人员管理</el-menu-item>
                        <el-menu-item index="/dept">部门管理</el-menu-item>
                        <el-menu-item index="/position">角色管理</el-menu-item>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title">
                            <i class="el-icon-goods"></i>办公用品
                        </template>
                        <el-menu-item index="/product">用品管理</el-menu-item>
                        <el-menu-item index="/productCategory">用品类别</el-menu-item>
                    </el-submenu>
                    <el-submenu index="3">
                        <template slot="title">
                            <i class="el-icon-document"></i>会议管理
                        </template>
                        <el-menu-item index="/boardroom">会议室管理</el-menu-item>
                        <el-menu-item index="/boardroomFacilities">会议设施管理</el-menu-item>
                    </el-submenu>
                    <el-submenu index="4">
                        <template slot="title">
                            <i class="el-icon-view"></i>办公审批
                        </template>
                        <el-menu-item index="/receive">用品审批</el-menu-item>
                        <el-menu-item index="/brApply">会议审批</el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main style="height: 640px">
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: 'home',
        data() {
            return {
                emp: {
                    name: '',
                    id: '',
                    address: '',
                    phone: '',
                    dept: {
                        name: ''
                    },
                    position: {
                        name: ''
                    },
                },
                applys: [],
            }
        },
        created() {
            this.getEmp();
            this.getApply();
        },
        methods: {
            getEmp: function () {
                let t = this;
                this.axios.post('/zteoa/emp/getEmp')
                    .then(res => {
                        t.emp = res.data;
                    })
            },
            getApply: function () {
                let t = this;
                this.axios.get('/zteoa/boardroomApply/getAllApply')
                    .then(res => {
                        t.applys = res.data;
                        t.showApply();
                    })
            },
            showApply: function () {
                let time = 0;
                this.applys.forEach(apply => {
                    if (apply.agree == 2) {
                        setTimeout(() => {
                            this.$notify({
                                title: '会议审核通过',
                                message: '您申请的会议室' + apply.boardroom.name + "已经通过审核啦！！！",
                                type: 'success',
                                position: 'bottom-right'
                            })
                        }, time);
                        time += 500;
                    } else if (apply.agree == 3) {
                        setTimeout(() => {
                            this.$notify({
                                title: '会议审核未通过',
                                message: '很遗憾，您申请的会议室' + apply.boardroom.name + "未能通过审核了，您可以再次尝试提交审核信息！",
                                type: 'error',
                                position: 'bottom-right'
                            })
                        }, time);
                        time += 500;
                    }
                });
            },
            command: function () {
                this.axios.get('/zteoa/emp/exit')
                    .then(res => {
                        if (res.data) {
                            this.$router.push('/login');
                        }
                    })
            }
        }
    }
</script>

<style>
    .el-header {
        background-color: #B3C0D1;
        color: #333;
        line-height: 60px;
        padding-left: 0;
    }

    .el-aside {
        color: #333;
    }
</style>