<template>
    <div>
        <el-row>
            <el-col :offset="6" :span="8" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="zProductName" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入会议室设施" clearable>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <!-- <el-button @click="addBoardroomFacilities" type="primary" icon="el-icon-circle-plus">申请会议设施</el-button> -->
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="设施编号">
                </el-table-column>
                <el-table-column align="center" prop="zProductName" label="设施名称">
                </el-table-column>
                <el-table-column align="center" prop="num" label="设施数量">
                </el-table-column>
                <el-table-column align="center" prop="zBroomName" label="所属会议室">
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template slot-scope="BoardroomFacilities">
                        <el-button-group>
                            <el-button v-if="select" size="small" @click="showBoardroomFacilities(BoardroomFacilities.row)" icon="el-icon-search"></el-button>
                            <el-button v-if="getUpdate()" size="small" @click="updateBoardroomFacilities(BoardroomFacilities.row)" type="primary" icon="el-icon-edit"></el-button>
                            <el-button v-if="getDelete()" size="small" @click="deleteBoardroomFacilities(BoardroomFacilities)" type="danger" icon="el-icon-delete"></el-button>
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
        <el-dialog title="设施信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="设施编号">
                    <span>{{ boardroomFacilities.id }}</span>
                </el-form-item>
                <el-form-item label="设施名称">
                    <span>{{ boardroomFacilities.zProductName }}</span>
                </el-form-item>
                <el-form-item label="设施数量">
                    <span>{{ boardroomFacilities.num}}</span>
                </el-form-item>
                <el-form-item label="所属会议室">
                    <span>{{ boardroomFacilities.zBroomName }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改设施信息" :visible.sync="updateShow" :center="true">
            <el-form :model="boardroomFacilities" status-icon :rules="rules" ref="boardroomFacilities" label-width="100px">
                <el-form-item label="设施名称" prop="zProductName">
                    <el-input readonly v-model="boardroomFacilities.zProductName"></el-input>
                </el-form-item>
                <el-form-item label="设施数量" prop="num">
                    <el-input v-model="boardroomFacilities.num"></el-input>
                </el-form-item>
                <el-form-item label="所属会议室" prop="zBroomName">
                    <el-select v-model="boardroomFacilities.bid" filterable placeholder="请选择当前职位">
                        <el-option v-for="item in boardrooms" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('boardroomFacilities')">修改</el-button>
                    <el-button @click="resetForm('boardroomFacilities')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'boardroomFacilities',
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
                load: true,
                show: false,
                updateShow: false,
                addShow: false,
                boardroomFacilities: {
                    id: '',
                    num: '',
                    zBroomName: '',
                    zProductName: ''
                },
                boardrooms: [],
            }
        },
        created() {
            this.getAuthoritys();
            this.getEmp();
            this.initBoardroomFacilities();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initBoardroomFacilities: function () {
                const t = this;
                this.axios.post('/zteoa/boardroomFacilities/queryList', {
                    currPage: t.currPage,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
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
            handleSelect: function (item) {
                const t = this;
                this.axios.post('/zteoa/boardroomFacilities/queryList', {
                    zProductName: t.search,
                    currPage: 1,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.getTotal();
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            handleSizeChange: function (val) {
                const t = this;
                t.pageSize = val;
                this.axios.post('/zteoa/boardroomFacilities/queryList', {
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
                this.axios.post('/zteoa/boardroomFacilities/queryList', {
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
                this.axios.post('/zteoa/boardroomFacilities/queryTotal', {
                    zProductName: t.search
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
                this.axios.post('/zteoa/boardroomFacilities/queryTotal', {
                    zProductName: t.search
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
            querySearch: function (queryString, cb) {
                const t = this;
                this.axios.post('/zteoa/boardroomFacilities/queryList', {
                    zProductName: t.search,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            addBoardroomFacilities: function () {
                let t = this;
                this.boardroomFacilities = '';
                t.addShow = true;
            },
            showBoardroomFacilities: function (boardroomFacilities) {
                this.boardroomFacilities = boardroomFacilities;
                this.show = true;
            },
            updateBoardroomFacilities: function (boardroomFacilities) {
                let t = this;
                this.boardroomFacilities = boardroomFacilities;
                t.updateShow = true;
            },
            deleteBoardroomFacilities: function (boardroomFacilities) {
                let t = this;
                t.axios.get('/zteoa/boardroomFacilities/delete', {
                    params: {
                        id: boardroomFacilities.row.id
                    }
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            t.total--;
                            t.ctotal--;
                            t.tableData.splice(boardroomFacilities.$index, 1);
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
                    .catch(res => {
                        t.$message({
                            showClose: true,
                            message: '服务器异常',
                            type: 'error'
                        });
                    })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/boardroomFacilities/update', {
                            id: t.boardroomFacilities.id,
                            name: t.boardroomFacilities.name,
                            address: t.boardroomFacilities.address,
                            use: t.boardroomFacilities.use
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.initBoardroomFacilities();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: res.data.message,
                                        type: 'success'
                                    });
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
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            // addSubmitForm(formName) {
            //     this.$refs[formName].validate((valid) => {
            //         let t = this;
            //         if (valid) {
            //             this.axios.post('/zteoa/boardroomFacilities/add', {
            //                 name: t.boardroomFacilities.name,
            //                 address: t.boardroomFacilities.address,
            //                 use: t.boardroomFacilities.use
            //             })
            //                 .then(res => {
            //                     if (res.data) {
            //                         t.initBoardroomFacilities();
            //                         t.getTotal();
            //                         t.addShow = false;
            //                         this.$message({
            //                             showClose: true,
            //                             message: '添加成功',
            //                             type: 'success'
            //                         });
            //                         ctotal++;
            //                     } else {
            //                         this.$message({
            //                             showClose: true,
            //                             message: '更新失败，请检查会议室id',
            //                             type: 'error'
            //                         });
            //                     }
            //                 })
            //                 .catch(res => {
            //                     this.$message({
            //                         showClose: true,
            //                         message: '更新失败，服务器异常',
            //                         type: 'error'
            //                     });
            //                 })
            //         } else {
            //             console.log('error submit!!');
            //             return false;
            //         }
            //     });
            // },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
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