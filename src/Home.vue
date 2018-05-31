<template>
    <el-container style="height: 700px; border: 1px solid #eee">
        <el-header style="text-align: right; font-size: 12px">
            <el-dropdown @command="exit">
                <i class="el-icon-setting" style="margin-right: 15px"></i>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>退出登录</el-dropdown-item>
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
                        <el-menu-item index="/3-1">会议室管理</el-menu-item>
                        <el-menu-item index="/3-2">会议设施管理</el-menu-item>
                    </el-submenu>
                    <el-submenu index="4">
                        <template slot="title">
                            <i class="el-icon-view"></i>办公审批
                        </template>
                        <el-menu-item index="/4-1">用品审批</el-menu-item>
                        <el-menu-item index="/4-2">会议审批</el-menu-item>
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
            }
        },
        created() {
            this.getEmp();
        },
        methods: {
            getEmp: function () {
                let t = this;
                this.axios.post('/zteoa/emp/getEmp')
                    .then(res => {
                        t.emp = res.data;
                    })
            },
            exit: function () {
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