<template>
    <div>
        <el-row>
            <el-col :offset="4" :span="10" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="name" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入商品名称" clearable>
                    <el-select class="wid" :clearable="true" :remote="true" @change="categoryChange" @focus="getCategorys" v-model="category.id" slot="prepend" placeholder="职位选择">
                        <el-option v-for="item in categorys" :key="item.id" :label="item.category" :value="item.id"></el-option>
                    </el-select>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button @click="addProduct" type="primary" icon="el-icon-circle-plus">添加用品</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="用品编号">
                </el-table-column>
                <el-table-column align="center" prop="name" label="用品名称">
                </el-table-column>
                <el-table-column align="center" prop="category.category" label="用品类别">
                </el-table-column>
                <el-table-column align="center" prop="price" label="用品单价">
                </el-table-column>
                <el-table-column align="center" prop="num" label="用品库存">
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template slot-scope="Product">
                        <el-button @click="showProduct(Product.row)" type="text" size="small">查看</el-button>
                        <el-button @click="updateProduct(Product.row)" type="text" size="small">修改</el-button>
                        <el-button @click="deleteProduct(Product)" type="text" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currPage" :page-sizes="pageSizes"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog title="用品信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="用品编号">
                    <span>{{ product.id }}</span>
                </el-form-item>
                <el-form-item label="用品名称">
                    <span>{{ product.name }}</span>
                </el-form-item>
                <el-form-item label="用品类别">
                    <span>{{ product.category.category }}</span>
                </el-form-item>
                <el-form-item label="用品单价">
                    <span>{{ product.price }}</span>
                </el-form-item>
                <el-form-item label="用品库存">
                    <span>{{ product.num }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改用品信息" :visible.sync="updateShow" :center="true">
            <el-form :model="product" status-icon :rules="rules" ref="product" label-width="100px">
                <el-form-item label="用品名称" prop="name">
                    <el-input v-model="product.name"></el-input>
                </el-form-item>
                <el-form-item label="用品类别">
                    <el-select v-model="product.category.id" placeholder="请选择用品类别">
                        <el-option v-for="item in categorys" :label="item.category" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="用品单价" prop="price">
                    <el-input v-model="product.price"></el-input>
                </el-form-item>
                <el-form-item label="用品库存" prop="num">
                    <el-input v-model="product.num"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('product')">修改</el-button>
                    <el-button @click="resetForm('product')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="添加用品" :visible.sync="addShow" :center="true">
            <el-form :model="product" status-icon :rules="rules" ref="product" label-width="100px">
                <el-form-item label="用品名称" prop="name">
                    <el-input v-model="product.name"></el-input>
                </el-form-item>
                <el-form-item label="用品类别">
                    <el-select :clearable="true" :remote="true" @focus="getCategorys" v-model="product.category.id" placeholder="请选择用品类别">
                        <el-option v-for="item in categorys" :label="item.category" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="用品单价" prop="price">
                    <el-input v-model="product.price"></el-input>
                </el-form-item>
                <el-form-item label="用品库存" prop="num">
                    <el-input v-model="product.num"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addSubmitForm('product')">添加</el-button>
                    <el-button @click="resetForm('product')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'product',
        data: function () {
            return {
                tableData: [],
                pageSizes: [5, 10, 15, 20],
                total: 1,
                ctotal: 1,
                search: '',
                currPage: 1,
                pageSize: 5,
                load: true,
                show: false,
                updateShow: false,
                addShow: false,
                product: {
                    id: '',
                    name: '',
                    price: '',
                    num: '',
                    category: {
                        id: '',
                        category: ''
                    }
                },
                category: {
                    id: ''
                },
                categorys: [],
            }
        },
        created() {
            this.initProduct();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initProduct: function () {
                const t = this;
                this.axios.post('/zteoa/product/queryList', {
                    currPage: this.currPage,
                    pageSize: this.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            categoryChange: function () {
                let t = this;
                this.axios.post('/zteoa/product/queryList', {
                    name: t.search,
                    categoryId: t.category.id,
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
            getCategorys: function () {
                const t = this;
                this.axios.get('/zteoa/productCategory/queryAll')
                    .then(res => {
                        t.categorys = res.data
                    })
            },
            handleSelect: function (item) {
                const t = this;
                this.axios.post('/zteoa/product/queryList', {
                    name: t.search,
                    categoryId: t.category.id,
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
                this.currPage = 1;
                this.axios.post('/zteoa/product/queryList', {
                    name: t.search,
                    categoryId: t.category.id,
                    currPage: 1,
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
                this.axios.post('/zteoa/product/queryList', {
                    name: t.search,
                    categoryId: t.category.id,
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
                this.axios.post('/zteoa/product/queryTotal', {
                    name: t.search,
                    categoryId: t.category.id
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
                this.axios.post('/zteoa/product/queryTotal', {
                    name: t.search
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
                this.axios.post('/zteoa/product/queryList', {
                    name: t.search,
                    categoryId: t.category.id,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            addProduct: function () {
                let t = this;
                this.axios.get('/zteoa/product/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            t.getCategorys();
                            t.product = {
                                id: '',
                                name: '',
                                price: '',
                                num: '',
                                category: {
                                    id: '',
                                    category: ''
                                }
                            };
                            t.addShow = true;
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            showProduct: function (product) {
                this.product = product;
                this.show = true;
            },
            updateProduct: function (product) {
                let t = this;
                this.axios.get('/zteoa/product/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            t.getCategorys();
                            this.product = product;
                            t.updateShow = true;
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            deleteProduct: function (product) {
                let t = this;
                this.axios.get('/zteoa/product/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.axios.get('/zteoa/product/delete', {
                                params: {
                                    id: product.row.id
                                }
                            })
                                .then(res => {
                                    if (res.data) {
                                        t.$message({
                                            showClose: true,
                                            message: '删除成功',
                                            type: 'success'
                                        });
                                        t.total--;
                                        t.ctotal--;
                                        t.tableData.splice(product.$index, 1);
                                    } else {
                                        t.$message({
                                            showClose: true,
                                            message: '服务器异常',
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
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/product/update', {
                            id: t.product.id,
                            name: t.product.name,
                            price: t.product.price,
                            num: t.product.num,
                            categoryId: t.product.category.id
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initProduct();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '更新成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查用品id',
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
            addSubmitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/product/add', {
                            name: t.product.name,
                            price: t.product.price,
                            num: t.product.num,
                            categoryId: t.product.category.id
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initProduct();
                                    t.getTotal();
                                    t.addShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查用品id',
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
                            })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
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

    .wid {
        width: 150px;
    }
</style>