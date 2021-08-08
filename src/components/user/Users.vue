<template>
  <div>
      <!-- 麵包屑 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
        <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片區 -->
      <el-card>
          <!-- 搜索區 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserLise">
                <el-button slot="append" icon="el-icon-search" @click="getUserLise"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary">添加用戶</el-button>
            </el-col>
          </el-row>
          <!-- 表格區 -->
          <el-table :data="userlist" border stripe>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="電子信箱" prop="email"></el-table-column>
            <el-table-column label="電話" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="狀態" prop="mg_state">
              <!-- 使用作用域插槽獲取列表「行」中的數據 實現切換操作 -->
              <template slot-scope="scope">
                <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch> | ({{scope.row.mg_state}})
              </template>
            </el-table-column>
            <!-- 操作按鈕 -->
            <el-table-column label="操作" width="180px">
              <template> <!-- 案例中 template這有一個solt-scope="scope" 若不使用插槽的話 也不必使用template標籤-->
                <el-tooltip class="item" effect="dark" content="設定" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="刪除" placement="top">
                  <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
                  <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
      </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userlist: [],
      total: 0
    }
  },
  created () {
    this.getUserLise()
  },
  methods: {
    async getUserLise () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('獲取用戶列表失敗！')
      }
      console.log(res.data)
      this.userlist = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserLise()
    },
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserLise()
    },
    // 監聽switch開關狀態變化 並傳值給後端進行修改 put
    async userStateChanged (userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用戶更新狀態失敗')
      }
      this.$message.success('用戶更新狀態成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table {
    margin-top: 15px;
    font-size: 12px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>
