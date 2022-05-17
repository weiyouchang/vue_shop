<template>
  <div class="right-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="RightList" style="width: 100%" border stripe>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="权限路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      RightList: [],
    };
  },
  created() {
    this.getRightList();
  },
  methods: {
    async getRightList() {
      const { data: res } = await this.$http.get(`rights/list`);
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.$message.success("获取数据成功");
      //   console.log(res);
      this.RightList = res.data;
    },
  },
};
</script>

<style>
</style>