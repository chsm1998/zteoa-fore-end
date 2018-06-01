<template>
    <div>
        <el-row>
            <el-col :offset="18" :span="6" class="add">
                <el-button @click="addReceive" type="primary" icon="el-icon-circle-plus">申请用品</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="申请编号" width="50">
                </el-table-column>
                <el-table-column align="center" prop="emp.name" label="申请人">
                </el-table-column>
                <el-table-column align="center" prop="product.name" label="申请用品">
                </el-table-column>
                <el-table-column align="center" prop="num" label="申请数量">
                </el-table-column>
                <el-table-column align="center" prop="reason" label="申请原因">
                </el-table-column>
                <el-table-column align="center" label="申请类别">
                    <template slot-scope="scope">
                        <span>{{ scope.row.category == 1 ? '个人用品申请' : '会议设施申请' }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="申请时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.createTime) }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="当前状态">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.agree == 1">待审核</el-tag>
                        <el-tag type="success" v-if="scope.row.agree == 2">审核通过</el-tag>
                        <el-tag type="danger" v-if="scope.row.agree == 3">审核未通过</el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="240">
                    <template slot-scope="Receive">
                        <el-button-group>
                            <el-button size="small" @click="showReceive(Receive.row)" icon="el-icon-search"></el-button>
                            <template v-if="isAuthority && Receive.row.agree == 1">
                                <el-button size="small" @click="applySuccess(Receive.row)" type="success">通过审核</el-button>
                                <el-button size="small" @click="applyError(Receive.row)" type="danger">不通过审核</el-button>
                            </template>
                            <template v-if="eid == Receive.row.eid && Receive.row.agree == 1">
                                <el-button size="small" @click="updateReceive(Receive.row)" type="primary">修改申请信息</el-button>
                            </template>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currPage" :page-sizes="pageSizes"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog title="用品申请信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="申请编号">
                    <span>{{ receive.id }}</span>
                </el-form-item>
                <el-form-item label="申请人">
                    <span>{{ receive.emp.name }}</span>
                </el-form-item>
                <el-form-item label="申请用品">
                    <span>{{ receive.product.name }}</span>
                </el-form-item>
                <el-form-item label="申请数量">
                    <span>{{ receive.num }}</span>
                </el-form-item>
                <el-form-item label="申请原因">
                    <span>{{ receive.reason }}</span>
                </el-form-item>
                <el-form-item label="申请类别">
                    <span>{{ receive.category }}</span>
                </el-form-item>
                <el-form-item label="申请时间">
                    <span>{{ getTime(receive.createTime) }}</span>
                </el-form-item>
                <el-form-item label="审核状态">
                    <span>{{ getAgree(receive.agree) }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="添加申请信息" :visible.sync="addShow" :center="true">
            <el-form :model="receive" status-icon label-width="100px">
                <el-form-item label="用品名称">
                    <el-select v-model="receive.pid" filterable placeholder="请选择用品">
                        <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="申请数量">
                    <el-input v-model="receive.num"></el-input>
                </el-form-item>
                <el-form-item label="申请原因">
                    <el-input v-model="receive.reason"></el-input>
                </el-form-item>
                <el-form-item label="申请类别" prop="category">
                    <el-radio v-model="receive.category" border :label="1">个人用品申请</el-radio>
                    <el-radio v-model="receive.category" border :label="2">会议设施申请</el-radio>
                </el-form-item>
                <template v-if="receive.category == 2">
                    <el-form-item label="所属会议室">
                        <el-select v-model="receive.bid" filterable placeholder="请选择所属会议室">
                            <el-option v-for="item in rooms" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
                <el-form-item>
                    <el-button type="primary" @click="subAddReceive('receive')">添加</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改申请信息" :visible.sync="updateShow" :center="true">
            <el-form :model="receive" status-icon label-width="100px">
                <el-form-item label="用品名称">
                    <el-select v-model="receive.pid" filterable placeholder="请选择用品">
                        <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="申请数量" prop="num">
                    <el-input v-model="receive.num"></el-input>
                </el-form-item>
                <el-form-item label="申请原因" prop="num">
                    <el-input v-model="receive.reason"></el-input>
                </el-form-item>
                <el-form-item label="申请类别" prop="category">
                    <el-radio v-model="receive.category" border label="1">个人用品申请</el-radio>
                    <el-radio v-model="receive.category" border label="2">会议设施申请</el-radio>
                </el-form-item>
                <template v-if="receive.category == 2">
                    <el-fore-item label="所属会议室">
                        <el-select v-model="receive.bid" filterable placeholder="请选择所属会议室">
                            <el-option v-for="item in rooms" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-fore-item>
                </template>
                <el-form-item>
                    <el-button type="primary" @click="subUpdateReceive('receive')">修改</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'receive',
        data: function () {
            return {
                tableData: [],
                rooms: [],
                pageSizes: [5, 10, 15, 20],
                total: 1,
                ctotal: 1,
                search: '',
                currPage: 1,
                pageSize: 5,
                eid: '',
                load: true,
                show: false,
                addShow: false,
                updateShow: false,
                isAuthority: false,
                value: [],
                // isApplyEmp: 'false',
                receive: {
                    id: '',
                    num: '',
                    category: '',
                    reason: '',
                    createTime: '',
                    agree: '',
                    eid: '',
                    pid: '',
                    bid: '',
                    emp: {
                        name: '',
                    },
                    product: {
                        name: '',
                    }
                },
                products: [],
            }
        },
        created() {
            this.getEid();
            this.initReceive();
            this.getTotal();
            this.getCtotal();
            this.getProducts();
            this.getBoardroom();
        },
        methods: {
            initReceive: function () {
                const t = this;
                this.isAuthorityF();
                // this.isApplyEmpF();
                this.axios.post('/zteoa/receive/queryList', {
                    currPage: t.currPage,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            getProducts: function () {
                let t = this;
                this.axios.get('/zteoa/product/queryAll')
                    .then(res => {
                        t.products = res.data;
                    })
            },
            getBoardroom: function () {
                let t = this;
                this.axios.get('/zteoa/boardroom/queryAll')
                    .then(res => {
                        t.rooms = res.data;
                    })
            },
            getEid: function () {
                let t = this;
                this.axios.get('/zteoa/emp/getEmp')
                    .then(res => {
                        t.eid = res.data.id;
                    })
            },
            isAuthorityF: function () {
                let t = this;
                this.axios.get('/zteoa/boardroomApply/isAuthority')
                    .then(res => {
                        t.isAuthority = res.data.bl;
                    })
            },
            // isApplyEmpF: function () {
            //     let t = this;
            //     this.axios.get('/zteoa/boardroomApply/getAllApply')
            //     .then(res => {
            //         if (res.data.length != 0) {
            //             t.isApplyEmp = true;
            //             t.tableData = res.data;
            //         }
            //     })
            // },
            getAgree: function (agree) {
                const AGREES = {
                    1: '待审核',
                    2: '审核通过',
                    3: '审核未通过'
                }
                return AGREES[agree];
            },
            getTime: function (time) {
                let date = new Date(time);
                return date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            },
            handleSizeChange: function (val) {
                const t = this;
                t.pageSize = val;
                this.axios.post('/zteoa/receive/queryList', {
                    currPage: t.currPage,
                    pageSize: val
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            handleCurrentChange: function (val) {
                const t = this;
                t.currPage = val;
                this.axios.post('/zteoa/receive/queryList', {
                    currPage: val,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            getTotal: function () {
                const t = this;
                this.axios.post('/zteoa/receive/queryTotal', {
                    bid: t.search
                })
                    .then(res => {
                        t.total = res.data;
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '服务器异常' + res,
                            type: 'error'
                        });
                    })
            },
            getCtotal: function () {
                const t = this;
                this.axios.post('/zteoa/receive/queryTotal', {
                    bid: t.search
                })
                    .then(res => {
                        t.ctotal = res.data;
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '服务器异常' + res,
                            type: 'error'
                        });
                    })
            },
            addReceive: function () {
                this.receive = {
                    id: '',
                    num: '',
                    category: '',
                    reason: '',
                    createTime: '',
                    agree: '',
                    eid: '',
                    pid: '',
                    bid: '',
                    emp: {
                        name: '',
                    },
                    product: {
                        name: '',
                    }
                };
                this.addShow = true;
            },
            showReceive: function (receive) {
                this.receive = receive;
                this.show = true;
            },
            updateReceive: function (receive) {
                this.receive = receive;
                this.updateShow = true;
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            subAddReceive: function (receive) {
                let t = this;
                this.axios.post('/zteoa/receive/add', {
                    bid: t.receive.bid,
                    pid: t.receive.pid,
                    num: t.receive.num,
                    category: t.receive.category,
                    reason: t.receive.reason,
                })
                    .then(res => {
                        if (res.data) {
                            t.addShow = false;
                            this.$message({
                                showClose: true,
                                message: '添加用品申请成功',
                                type: 'success'
                            });
                            t.initReceive();
                        } else {
                            this.$message({
                                showClose: true,
                                message: '添加用品申请失败，服务器异常',
                                type: 'error'
                            });
                        }
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '更新失败，服务器异常',
                            type: 'error'
                        });
                        console.log(res);
                    })
            },
            subUpdateReceive: function (receive) {
                let t = this;
                this.axios.post('/zteoa/receive/update', {
                    id: t.receive.id,
                    pid: t.receive.product.id,
                    num: t.receive.num,
                    category: t.receive.category,
                    reason: t.receive.reason,
                })
                    .then(res => {
                        if (res.data) {
                            t.updateShow = false;
                            this.$message({
                                showClose: true,
                                message: '更新用品申请成功',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                showClose: true,
                                message: '更新用品申请失败，服务器异常',
                                type: 'error'
                            });
                        }
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '更新失败，服务器异常',
                            type: 'error'
                        });
                        console.log(res);
                    })
            },
            applySuccess: function (receive) {
                let t = this;
                this.axios.get('/zteoa/receive/isAuthority')
                    .then(res => {
                        if (res.data) {
                            this.axios.post('/zteoa/receive/update', {
                                id: receive.id,
                                agree: 2
                            })
                                .then(res => {
                                    if (res.data) {
                                        t.receive.agree = 2;
                                        t.$message({
                                            showClose: true,
                                            message: '审核状态更新成功',
                                            type: 'success'
                                        });
                                    } else {
                                        t.$message({
                                            showClose: true,
                                            message: '审核状态更新失败，服务器异常',
                                            type: 'error'
                                        });
                                    }
                                })
                        }
                    })
            },
            applyError: function (receive) {
                let t = this;
                this.axios.get('/zteoa/receive/isAuthority')
                    .then(res => {
                        if (res.data) {
                            this.axios.post('/zteoa/receive/update', {
                                id: receive.id,
                                agree: 3
                            })
                                .then(res => {
                                    if (res.data) {
                                        t.receive.agree = 3;
                                        t.$message({
                                            showClose: true,
                                            message: '审核状态更新成功',
                                            type: 'success'
                                        });
                                    } else {
                                        t.$message({
                                            showClose: true,
                                            message: '审核状态更新失败，服务器异常',
                                            type: 'error'
                                        });
                                    }
                                })
                        }
                    })
            }
        }
    }
</script>

<style>
    .demo-table-expand {
        font-size: 0;
    }

    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }

    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>