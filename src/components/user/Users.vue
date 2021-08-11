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
          <el-button type="primary" @click="addDialogVisble = true">添加用戶</el-button>
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
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="設定" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="刪除" placement="top">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
        <!-- 下方分頁列 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!-- 添加用戶的對話框 -->
      <el-dialog
        title="添加用戶"
        :visible.sync="addDialogVisble"
        @close="addDialogClosed"
        width="50%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
          <el-form-item label="用戶名稱" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密碼" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="電子信箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手機號碼" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adduser">取 消</el-button>
          <el-button type="primary" @click="adduser">確 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用戶的對話框 -->
      <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="deitDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用戶名稱">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="電子信箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手機號碼" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    var checkEmail = (rule, value, cb) => {
      // 正則
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      return cb(new Error('請輸入正確的電子信箱'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^09[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      return cb(new Error('請輸入正確的手機號碼'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userlist: [],
      total: 0,
      // 添加用戶的對話框顯示隱藏
      addDialogVisble: false,
      // 添加用戶的表單數據
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '請輸入用戶名', trigger: 'blur' },
          { min: 3, max: 10, message: '用戶名長度請在 3~10 之間', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '請輸入密碼', trigger: 'blur' },
          { min: 6, max: 15, message: '密碼長度請在 6~15 之間', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '請輸入電子信箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '請輸入手機號碼', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '請輸入電子信箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '請輸入手機號碼', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
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
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    adduser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('新增用戶失敗')
        }
        this.$message.success('新增用戶成功')
        this.addDialogVisble = false // 隱藏對話框
        this.getUserLise() // 成功後刷新用戶列表
      })
    },
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查詢用戶訊息失敗')
      }
      this.editForm = res.data
      console.log(this.editForm)
    },
    deitDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用戶訊息失敗')
        }

        this.editDialogVisible = false
        this.getUserLise()
        this.$message.success('更新用戶訊息成功')
      })
    },
    async removeUserById (id) {
      const comfirmResult = await this.$confirm('此操作將永久刪除該用戶, 是否繼續?', '提示', {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(comfirmResult)
      // 按確認會返回一個promise 透過await返回'confirm'
      // 取消則會返回一個'chacel'
      if (comfirmResult !== 'confirm') {
        return this.$message.info('已經取消刪除')
      }
      console.log('確認刪除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('刪除用戶失敗')
      }
      this.$message.success('刪除用戶成功')
      this.getUserLise()
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
