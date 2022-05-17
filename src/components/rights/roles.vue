<template>
  <div class="role-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-button type="primary">添加角色</el-button>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="rolelist" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbuttom', i1 === 0 ? 'bdtop' : '', 'venter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5"
                ><el-tag closable @close="removeTagByid(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag
                ><i class="el-icon-caret-right"></i
              ></el-col>
              <!-- 二级，三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['bdtop', i2 === 0 ? '' : 'bdtop', 'venter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeTagByid(scope.row, item2.id)"
                      >{{ item2.authName
                      }}<i class="el-icon-caret-right"></i></el-tag
                  ></el-col>
                  <el-col :span="13">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeTagByid(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            >
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-row
              ><el-button size="mini" type="primary" icon="el-icon-edit"
                >修改</el-button
              >
              <el-button size="mini" type="danger" icon="el-icon-delete"
                >删除</el-button
              >
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="setUserRightDialog(scope.row)"
                >设置</el-button
              ></el-row
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加权限对话框 -->
    <el-dialog title="提示" :visible.sync="setRightdDialog" width="50%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightlist"
        :props="rightProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="keyarr"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolelist: [],
      //   弹窗的状态
      setRightdDialog: false,
      //   权限列表
      rightlist: [],
      // 树形控件
      rightProps: {
        label: "authName",
        children: "children",
      },
      keyarr: [],
      // 角色id
      roueid: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get(`roles`);
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.rolelist = res.data;
      // console.log(res);
    },
    // 移除权限
    async removeTagByid(role, id) {
      const com = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (com !== "confirm") return this.$message.info("取消删除");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      role.children = res.data;
    },
    // 添加权限操作
    async setUserRightDialog(role) {
      const { data: res } = await this.$http.get(`rights/tree`);
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.rightlist = res.data;
      // console.log(res);
      //递归获取
      this.getRoleRightId(role, this.keyarr);
      this.roueid = role.id;
      this.setRightdDialog = true;
    },
    getRoleRightId(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getRoleRightId(item, arr);
      });
    },
    async allotRight() {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      console.log(arr);
      const str = arr.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roueid}/rights`,
        { rids: str }
      );
      if (res.meta.status !== 200) return this.$message.error("修改权限失败");
      this.$message.success("修改权限成功");
      this.getRolesList();
      this.setRightdDialog = false;
    },
  },
};
</script >

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid;
  color: #eee;
}
.bdbuttom {
  border-bottom: 1px solid;
  color: #eee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>