<template>
    <div>
        <el-row>
            <el-col :offset="4" :span="10" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="name" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入商品名称" clearable>
                    <el-select class="wid" :clearable="true" :remote="true" @change="categoryChange" @focus="getCategorys" v-model="category.id"
                        slot="prepend" placeholder="职位选择">
                        <el-option v-for="item in categorys" :key="item.id" :label="item.category" :value="item.id"></el-option>
                    </el-select>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button v-if="getAdd()" @click="addProduct" type="primary" icon="el-icon-circle-plus">用品采购</el-button>
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
                        <el-button-group>
                            <el-button v-if="select" size="small" @click="showProduct(Product.row)" icon="el-icon-search"></el-button>
                            <el-button v-if="getUpdate()" size="small" @click="updateProduct(Product.row)" type="primary" icon="el-icon-edit"></el-button>
                            <el-button v-if="getDelete()" size="small" @click="deleteProduct(Product)" type="danger" icon="el-icon-delete"></el-button>
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
        <el-dialog title="采购用品" :visible.sync="addShow" :center="true">
            <el-form :model="product" status-icon :rules="rules" ref="product" label-width="100px">
                <el-form-item label="用品名称" prop="name">
                    <el-select @change="showPro" v-model="product.name" default-first-option filterable="" allow-create="" n placeholder="请选择用品名称">
                        <el-option v-for="item in productNames" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
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
                    <el-input-number v-model="product.num" label="用品库存"></el-input-number>
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
                productNames: {},
                category: {
                    id: ''
                },
                categorys: [],
            }
        },
        created() {
            this.getAuthoritys();
            this.getEmp();
            this.getProducts();
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
            showPro: function (test) {
                this.productNames.forEach(pro => {
                    if (pro.id == test) {
                        this.product = pro;
                    }
                })
            },
            getProducts: function () {
                this.axios.get('/zteoa/product/queryAll')
                .then(res => {
                    this.productNames = res.data;
                })
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
            },
            showProduct: function (product) {
                this.product = product;
                this.show = true;
            },
            updateProduct: function (product) {
                let t = this;
                t.getCategorys();
                this.product = product;
                t.updateShow = true;
            },
            deleteProduct: function (product) {
                let t = this;
                t.axios.get('/zteoa/product/delete', {
                    params: {
                        id: product.row.id
                    }
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.initProduct();
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
                        this.axios.post('/zteoa/product/update', {
                            id: t.product.id,
                            name: t.product.name,
                            price: t.product.price,
                            num: t.product.num,
                            categoryId: t.product.category.id
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.initProduct();
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
            addSubmitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/product/add', {
                            id: t.product.id,
                            name: t.product.name,
                            price: t.product.price,
                            num: t.product.num,
                            categoryId: t.product.category.id
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.initProduct();
                                    t.getTotal();
                                    t.addShow = false;
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