<template>
  <div class="list-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="goodsInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"
          ><el-button type="primary" @click="goAddPage"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px"
          ><template slot-scope="scope">{{
            scope.row.add_time | dateFormat
          }}</template></el-table-column
        >
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope"
            ><el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button
            ><el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button
          ></template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="goodsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询商品参数
      goodsInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //   商品总数
      total: 0,
      //商品列表数组
      goodslist: [],
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //   获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get(`goods`, {
        params: this.goodsInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");

      this.$message.success("获取商品列表成功");
      console.log(res);
      this.goodslist = res.data.goods;
      this.total = res.data.total;
    },
    //根据页获取数据
    handleSizeChange(newSize) {
      this.goodsInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //根据页数
    handleCurrentChange(newNum) {
      this.goodsInfo.pagenum = newNum;
      this.getGoodsList();
    },
    //删除商品
    async removeById(id) {
      const con = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (con !== "confirm") return this.$message.info("操作以取消");
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success("删除成功");
      this.getGoodsList();
    },
    // 添加商品页面
    goAddPage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style lang="less" scoped>
.el-col {
  margin-right: 15px;
}
</style>