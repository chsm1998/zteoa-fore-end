<template>
    <div>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="申请编号" width="50">
                </el-table-column>
                <el-table-column align="center" prop="emp.name" label="申请人">
                </el-table-column>
                <el-table-column align="center" prop="boardroom.name" label="申请会议室">
                </el-table-column>
                <el-table-column align="center" label="申请时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.createTime) }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="开始时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.start) }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="结束时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.end) }}</span>
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
                    <template slot-scope="BoardroomApply">
                        <el-button-group>
                            <el-button size="small" @click="showBoardroomApply(BoardroomApply.row)" icon="el-icon-search"></el-button>
                            <template v-if="getUpdate() && BoardroomApply.row.agree == 1">
                                <el-button size="small" @click="applySuccess(BoardroomApply.row)" type="success">通过审核</el-button>
                                <el-button size="small" @click="applyError(BoardroomApply.row)" type="danger">不通过审核</el-button>
                            </template>
                            <template v-if="eid == BoardroomApply.row.eid && BoardroomApply.row.agree == 1">
                                <el-button size="small" @click="updateApply(BoardroomApply.row)" type="primary">修改申请信息</el-button>
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
        <el-dialog title="会议申请信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="申请编号">
                    <span>{{ boardroomApply.id }}</span>
                </el-form-item>
                <el-form-item label="申请人">
                    <span>{{ boardroomApply.emp.name }}</span>
                </el-form-item>
                <el-form-item label="申请会议室">
                    <span>{{ boardroomApply.boardroom.name }}</span>
                </el-form-item>
                <el-form-item label="申请时间">
                    <span>{{ getTime(boardroomApply.createTime) }}</span>
                </el-form-item>
                <el-form-item label="开始时间">
                    <span>{{ getTime(boardroomApply.start) }}</span>
                </el-form-item>
                <el-form-item label="结束时间">
                    <span>{{ getTime(boardroomApply.end) }}</span>
                </el-form-item>
                <el-form-item label="审核状态">
                    <span>{{ getAgree(boardroomApply.agree) }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="会议申请信息" :visible.sync="updateShow" :center="true">
            <el-form :model="boardroomApply" status-icon label-width="100px">
                <el-form-item label="使用时间">
                    <el-date-picker @change="timeChange" :editable="false" :picker-options="pickerBeginDateBefore" v-model="value" value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="会议室名称">
                    <el-input readonly v-model="boardroomApply.boardroom.name"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="subUpdateApply('boardroom')">修改</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'boardroomApply',
        data: function () {
            return {
                tableData: [],
                pageSizes: [5, 10, 15, 20],
                add: false,
                update: false,
                select: false,
                deletes: false,
                authoritys: [],
                emps: '',
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
                value: [],
                // isApplyEmp: 'false',
                boardroomApply: {
                    id: '',
                    start: '',
                    end: '',
                    createTime: '',
                    agree: '',
                    eid: '',
                    emp: {
                        name: '',
                    },
                    boardroom: {
                        name: '',
                    }
                },
                boardrooms: [],
            }
        },
        created() {
            this.getAuthoritys();
            this.getEmp();
            this.getEid();
            this.initBoardroomApply();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initBoardroomApply: function () {
                const t = this;
                // this.isApplyEmpF();
                this.axios.post('/zteoa/boardroomApply/queryList', {
                    currPage: t.currPage,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            tableRowClassName: function ({ row, rowIndex }) {
                if (row.agree == 3) {
                    return 'warning-row';
                } else if (row.agree == 2) {
                    return 'success-row';
                }
            },
            getEmp: function () {
                let t = this;
                this.axios.get("/zteoa/emp/getEmp")
                    .then(res => {
                        t.emps = res.data;
                    })
            },
            getUpdate: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.update;
            },
            getDelete: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.deletes;
            },
            getAdd: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.add;
            },
            getState: function () {
                let t = this;
                this.authoritys.forEach(authority => {
                    if (authority.type == 1) {
                        t.select = authority.authority;
                    } else if (authority.type == 2) {
                        t.deletes = authority.authority;
                    } else if (authority.type == 3) {
                        t.update = authority.authority;
                    } else {
                        t.add = authority.authority;
                    }
                });
            },
            getAuthoritys: function () {
                let t = this;
                this.axios.get("/zteoa/product/getAuthoritys")
                    .then(res => {
                        t.authoritys = res.data;
                        this.getState();
                    })
            },
            getEid: function () {
                let t = this;
                this.axios.get('/zteoa/emp/getEmp')
                    .then(res => {
                        t.eid = res.data.id;
                    })
            },
            timeChange: function (dates) {
                this.boardroomApply.start = dates[0];
                this.boardroomApply.end = dates[1];
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
                this.axios.post('/zteoa/boardroomApply/queryList', {
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
                this.axios.post('/zteoa/boardroomApply/queryList', {
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
                this.axios.post('/zteoa/boardroomApply/queryTotal', {
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
                this.axios.post('/zteoa/boardroomApply/queryTotal', {
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
            showBoardroomApply: function (boardroomApply) {
                this.boardroomApply = boardroomApply;
                this.show = true;
            },
            updateApply: function (boardroomApply) {
                this.boardroomApply = boardroomApply;
                this.updateShow = true;
                this.value[0] = new Date(this.boardroomApply.start);
                this.value[1] = new Date(this.boardroomApply.end);
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            subUpdateApply: function (boardroomApply) {
                let t = this;
                this.axios.post('/zteoa/boardroomApply/newUpdate', {
                    id: t.boardroomApply.id,
                    start: t.boardroomApply.start,
                    end: t.boardroomApply.end,
                    bid: t.boardroomApply.boardroom.id
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.updateShow = false;
                            this.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.initBoardroomApply();
                            this.getTotal();
                            this.getCtotal();
                        } else {
                            this.$message({
                                showClose: true,
                                message: res.data.message,
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
            applySuccess: function (boardroomApply) {
                let t = this;
                this.axios.post('/zteoa/boardroomApply/update', {
                    id: boardroomApply.id,
                    start: boardroomApply.start,
                    end: boardroomApply.end,
                    bid: boardroomApply.bid,
                    agree: 2
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.boardroomApply.agree = 2;
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.initBoardroomApply();
                            this.getTotal();
                            this.getCtotal();
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            applyError: function (boardroomApply) {
                let t = this;
                this.axios.post('/zteoa/boardroomApply/update', {
                    id: boardroomApply.id,
                    start: boardroomApply.start,
                    end: boardroomApply.end,
                    bid: boardroomApply.bid,
                    agree: 3
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.boardroomApply.agree = 3;
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.initBoardroomApply();
                            this.getTotal();
                            this.getCtotal();
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
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

    .el-table .warning-row {
        background: oldlace;
    }

    .el-table .success-row {
        background: #f0f9eb;
    }
</style>