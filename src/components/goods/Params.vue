<template>
  <div class="params-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意:只允许为第三级参数设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择区域 -->
      <el-row class="cat_opt">
        <el-col
          ><span>选择商品分类: </span>
          <!-- 级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectCateKey"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态表格区域 -->
          <el-table :data="manyTabData" border stripe>
            <el-table-column type="expand"
              ><template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeAttrVal(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template></el-table-column
            >
            <el-table-column type="index" label="#"></el-table-column
            ><el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                ></template
              ></el-table-column
            >
            ></el-table
          >
        </el-tab-pane>
        <!-- 静态参数 -->
        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态表格区域 -->
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand"
              ><template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeAttrVal(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template></el-table-column
            >
            <el-table-column type="index" label="#"></el-table-column
            ><el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                ></template
              ></el-table-column
            >
            ></el-table
          ></el-tab-pane
        >
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titletext"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      :title="'编辑' + titletext"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      catelist: [],
      //商品分类配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //级联选择框双向绑定到的数据
      selectCateKey: [],
      //被选中的标签名字
      activeName: "many",
      //动态参数表格数据
      manyTabData: [],
      //静态属性表格数据
      onlyTabData: [],
      //添加对话框显示与否
      addDialogVisible: false,
      //表单数据对象
      addForm: {
        attr_name: "",
      },
      addRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      //   控制编辑对话框的显示与否
      editDialogVisible: false,
      //修改表单数据对象
      editForm: { attr_name: "" },
      //   修改表单验证规则
      editRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`);
      if (res.meta.status != 200)
        return this.$message.error("获取商品分类失败");
      this.catelist = res.data;
      //   console.log(res.data);
    },
    //获取参数
    handleChange() {
      this.getParams();
    },
    //选中标签的处理函数
    handleTabClick() {
      this.getParams();
    },
    //获取参数信息
    async getParams() {
      //判断是否为三级分类
      if (this.selectCateKey.length !== 3) {
        this.selectCateKey = [];
        this.manyTabData = [];
        this.onlyTabData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) return this.$message.error("获取参数失败");
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTabData = res.data;
      } else {
        this.onlyTabData = res.data;
      }

      console.log(res.data);
    },
    //监听添加对话框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (val) => {
        if (!val) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.getParams();
      });
    },
    //监听编辑对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮，修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (val) => {
        if (!val) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_sel: this.activeName, attr_name: this.editForm.attr_name }
        );
        if (res.meta.status !== 200) this.$message.error("提交修改失败");
        this.$message.success("修改成功");
        this.getParams();
        this.editDialogVisible = false;
      });
    },
    // 编辑对话框的显示与否
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) this.$message.error("修改失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //删除参数
    async removeParams(attr_id) {
      const conf = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //   console.log(conf);
      if (conf !== "confirm") return this.$message.info("操作已取消");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success("删除成功");
      this.getParams();
    },
    //显示input输入框
    showInput(row) {
      row.inputVisible = true;
      //自动获得焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //按下enter健或者失去焦点都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //保存操作
      this.addAttrVals(row);
    },
    //删除参数可选项
    removeAttrVal(i, row) {
      row.attr_vals.splice(i, 1);
      this.addAttrVals(row);
    },
    //提交参数可选项
    async addAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("添加参数属性失败");
      this.$message.success("添加参数属性成功");
    },
  },
  computed: {
    idBtnDisabled() {
      if (this.selectCateKey.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectCateKey.length == 3) {
        return this.selectCateKey[2];
      }
      return null;
    },
    titletext() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.el-input {
  width: 120px;
}
</style>