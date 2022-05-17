<template>
  <el-container class="home-comtainer">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout"> 退出</el-button></el-header
    >
    <el-container>
      <el-aside :width="isCollspe ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCosllpe">|||</div>
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollspe"
          collapse-transition
          router
          :default-active="ativepath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconfontObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="getindex('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.gerMenuList();
    this.ativepath = window.sessionStorage.getItem("indexpath");
  },
  data() {
    return {
      menuList: [],
      iconfontObj: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollspe: false,
      ativepath: "",
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async gerMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      // console.log(res);
    },
    toggleCosllpe() {
      this.isCollspe = !this.isCollspe;
    },
    getindex(index) {
      window.sessionStorage.setItem("indexpath", index);
      this.ativepath = index;
    },
  },
};
</script>

<style lang="less" scoped>
.home-comtainer {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>