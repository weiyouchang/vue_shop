<template>
  <div class="user-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8"
          ><el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="adddialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="stateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              size="mini"
              @click="editUserInfo(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="delUserinfo(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-star-off"
                circle
                size="mini"
                @click="serUserRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户信息弹窗 -->
    <el-dialog
      title="请输入用户信息"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="dialogVisibleClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input> </el-form-item
        ><el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input> </el-form-item
        ><el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input> </el-form-item
        ><el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改信息弹窗 -->
    <el-dialog
      title="修改信息"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editrules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="editForm.username"
            disabled
          ></el-input> </el-form-item
        ><el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input> </el-form-item
        ><el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的弹窗 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="removeSeletedBox"
      ref="allotFormRef"
    >
      <div>
        <p>用户名：{{ userinfo.username }}</p>
        <p>角色：{{ userinfo.role_name }}</p>
        <div>
          分配角色：<el-select v-model="value" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRolesDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // email 自定义验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]))+/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    // mobile 自定义验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号码"));
    };
    return {
      //获取用户列表的查询参数
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2,
      },
      // 用户列表数组
      userlist: [],
      // 用户总数
      total: 0,
      //控制添加用户弹窗的显示与隐藏
      adddialogVisible: false,
      //控制修改用户弹窗的显示与隐藏
      editdialogVisible: false,
      //添加的用户信息
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //添加信息的验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //要修改的用户信息对象
      editForm: {},
      //修改用户信息的的验证规则
      editrules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //分配角色的弹窗显示与否
      setRoleDialogVisible: false,
      //用户信息
      userinfo: {},
      // 角色列表
      rolesList: [],
      //角色id
      value: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    //更新页数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 更新页码
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getUserList();
    },
    // 更新用户状态
    async stateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) return this.$message.error("更新状态失败");
      this.$message.success("更新状态成功");
    },
    //添加弹窗关闭后重置表单
    dialogVisibleClose() {
      this.$refs.addFormRef.resetFields();
    },
    //提交添加的用户信息
    addUser() {
      this.$refs.addFormRef.validate(async (val) => {
        console.log(val);
        if (!val) return;
        console.log(this.addForm);
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.adddialogVisible = false;
        this.getUserList();
      });
    },
    // 获取要修改用户信息
    async editUserInfo(id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status != 200) return this.$message.error("获取信息失败");
      this.editForm = res.data;
      this.editdialogVisible = true;
    },
    // 弹窗关闭重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //提交修改信息
    editUser() {
      this.$refs.editFormRef.validate(async (val) => {
        if (!val) return;
        //发起提交请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status != 200) return this.$message.error("提交失败");
        this.$message.success("修改成功");
        this.getUserList();
        this.editdialogVisible = false;
      });
    },
    // 删除用户
    async delUserinfo(id) {
      const message = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (message !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(`users/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success("删除成功");
      this.getUserList();
    },
    //弹窗关闭后重置表单
    removeSeletedBox() {
      this.value = "";
      this.userinfo = "";
    },
    //获取角色列表
    async serUserRoles(userinfo) {
      this.userinfo = userinfo;

      const { data: res } = await this.$http.get(`roles`);
      if (res.meta.status !== 200) return this.$message.error("获取角色失败");
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    //分配角色
    async setRolesDialog() {
      if (!this.value) return this.$message.error("请分配一个角色");
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        { rid: this.value }
      );
      if (res.meta.status != 200) return this.$message.error("分配失败");
      this.$message.success("分配成功");
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
  },
};
</script>

<style>
</style>