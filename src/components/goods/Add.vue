<template>
  <div class="add-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" show-icon> </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRoles"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="tabPosition"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0"
            ><el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addForm.goods_price"
                type="number"
              ></el-input> </el-form-item
            ><el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addForm.goods_number"
                type="number"
              ></el-input> </el-form-item
            ><el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader></el-form-item
          ></el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyData"
              :key="item.attr_id"
            >
              <!-- 复习框区域 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyData"
              :key="item.attr_id"
              ><el-input v-model="item.attr_vals"></el-input
            ></el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3"
            ><el-upload
              class="upload-demo"
              :action="actionURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="headleSussess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload></el-tab-pane
          >
          <el-tab-pane label="商品内容" name="4"
            ><quill-editor v-model="addForm.goods_introduce"></quill-editor
            ><el-button type="primary" class="addBtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="提示" :visible.sync="viewDialogVisible" width="50%">
      <img :src="previewPath" alt="" class="view" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      activeIndex: "0",
      tabPosition: "left",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addFormRoles: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      //   商品分类数据
      catelist: [],
      //级联配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //动态参数列表数组
      manyData: [],
      //静态属性
      onlyData: [],
      // 图片url
      actionURL: "http://127.0.0.1:8888/api/private/v1/upload",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //
      previewPath: "",
      //
      viewDialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类数据失败");
      this.catelist = res.data;
      // console.log(this.catelist);
    },
    //
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      // console.log(this.addForm.goods_cat);
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200) this.$message.error("获取数据失败");
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200) this.$message.error("获取数据失败");
        this.onlyData = res.data;
      }
    },
    //
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.viewDialogVisible = true;
    },
    //
    handleRemove(file) {
      const filePath = file.response.data.tem_path;
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      this.addForm.pics.splice(i, 1);
    },
    //
    headleSussess(response) {
      const picInfo = { pic: response.data.tem_path };
      this.addForm.pics.push(picInfo);
    },
    add() {
      this.$refs.addFormRef.validate(async (val) => {
        if (!val) return this.$message.error("请填写必要的表单项");
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        //
        this.manyData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        //
        this.onlyData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // console. log(form);
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.$router.push("/goods");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.view {
  width: 100%;
}
.addBtn {
  margin-top: 10px;
}
</style>