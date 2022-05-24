<template>
  <div class="good-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateInfo">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else> 三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-search"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[2, 5, 7, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类弹窗 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRoles"
        ref="addCateRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称：">
          <el-cascader
            expand-trigger="hover"
            v-model="CateKeys"
            :options="parentCateList"
            :props="parenCateInfo"
            @change="parentHandleChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      //添加分类弹窗的显示与否
      addCateDialogVisible: false,
      //添加分类对象
      addCateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0,
      },
      //对象规则
      addCateRoles: {
        cat_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      parentCateList: [],
      //配置对象
      parenCateInfo: {
        value: "cat_id",
        label: "cat_name",
        chhildren: "children",
      },
      //所选父层级
      CateKeys: [],
    };
  },
  created() {
    this.gerGoodsList();
  },
  methods: {
    async gerGoodsList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取等级失败");
      this.catelist = res.data.result;
      this.total = res.data.total;
      // console.log(res);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.gerGoodsList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.gerGoodsList();
    },
    addCateInfo() {
      this.getParantCateList();
      this.addCateDialogVisible = true;
    },
    async getParantCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: { type: 2 },
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取父级分类失败");
      this.parentCateList = res.data;
      // console.log(res);
    },
    parentHandleChange() {
      console.log(this.CateKeys);
      if (this.CateKeys.length > 0) {
        this.addCateForm.cat_pid = this.CateKeys[this.CateKeys.length - 1];
        this.addCateForm.cat_level = this.CateKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateRef.validate(async (val) => {
        if (!val) return;
        const { data: res } = await this.$http.post(
          `categories`,
          this.addCateForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.gerGoodsList();
        this.addCateDialogVisible = false;
      });
    },
    addCateClose() {
      this.$refs.addCateRef.resetFields();
      this.CateKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
  },
};
</script>

<style lang="less" scope>
</style>