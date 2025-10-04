# User Profile 系统实现

## 📋 概述

这是一个完整的 User Profile 系统，包含前端和后端的完整实现，支持用户资料管理、饮食偏好设置、财务配置、通知管理和隐私控制。

## 🏗️ 系统架构

### 后端实现

- **数据库模型**: Prisma schema 定义
- **服务层**: ProfileService 处理业务逻辑
- **API 路由**: RESTful API 端点
- **数据验证**: 输入验证和错误处理

### 前端实现

- **React 组件**: 模块化的 UI 组件
- **状态管理**: useProfile Hook
- **类型安全**: TypeScript 接口定义
- **响应式设计**: 移动端适配

## 📁 文件结构

```
packages/
├── server/
│   ├── src/
│   │   ├── models/database/
│   │   │   └── schema.prisma                    # 数据库模型
│   │   ├── services/profile/
│   │   │   └── profileService.ts                # 业务逻辑服务
│   │   ├── routes/profile/
│   │   │   └── profileRoutes.ts                 # API路由
│   │   └── models/database/migrations/
│   │       └── 20250101000000_add_user_profile/
│   │           └── migration.sql                 # 数据库迁移
│   └── client/
│       └── src/
│           ├── hooks/
│           │   └── useProfile.ts                # 状态管理Hook
│           ├── pages/
│           │   ├── Profile.tsx                   # 主页面
│           │   └── ProfileTest.tsx              # 测试页面
│           ├── components/profile/
│           │   ├── BasicInfoSection.tsx         # 基本信息组件
│           │   ├── DietaryPreferencesSection.tsx # 饮食偏好组件
│           │   ├── FinancialSettingsSection.tsx  # 财务设置组件
│           │   ├── NotificationSettingsSection.tsx # 通知设置组件
│           │   └── PrivacySettingsSection.tsx   # 隐私设置组件
│           └── components/ui/                   # UI组件库
```

## 🚀 快速开始

### 1. 数据库设置

```bash
# 运行数据库迁移
npx prisma migrate dev --name add_user_profile

# 生成Prisma客户端
npx prisma generate
```

### 2. 后端启动

```bash
cd packages/server
npm install
npm run dev
```

### 3. 前端启动

```bash
cd packages/client
npm install
npm run dev
```

## 📊 功能特性

### 1. 基本信息管理

- ✅ 头像上传和压缩
- ✅ 个人信息编辑
- ✅ 位置自动检测
- ✅ 手机号验证
- ✅ 多语言支持

### 2. 饮食偏好设置

- ✅ 饮食限制选择
- ✅ 过敏信息管理
- ✅ 菜系偏好设置
- ✅ 口味偏好配置
- ✅ 营养目标设定

### 3. 财务设置

- ✅ 收入预算管理
- ✅ 预算分配可视化
- ✅ 储蓄目标设定
- ✅ 消费偏好配置
- ✅ 智能建议系统

### 4. 通知设置

- ✅ 多渠道通知配置
- ✅ 通知类型管理
- ✅ 免打扰时间设置
- ✅ 通知频率控制
- ✅ 时区设置

### 5. 隐私设置

- ✅ 资料可见性控制
- ✅ 数据使用权限
- ✅ 活动隐私管理
- ✅ 搜索权限设置
- ✅ 两步验证

## 🔧 API 接口

### 获取用户资料

```http
GET /api/users/profile
Authorization: Bearer <token>
```

### 更新用户资料

```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "section": "basicInfo",
  "data": {
    "name": "张三",
    "phone": {
      "countryCode": "+86",
      "number": "13800138000"
    }
  }
}
```

### 上传头像

```http
POST /api/users/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

avatar: <file>
```

## 🎨 组件使用

### 基本用法

```tsx
import { useProfile } from "@/hooks/useProfile";

function MyComponent() {
  const { profile, loading, error, updateProfile } = useProfile();

  const handleUpdate = async () => {
    await updateProfile("basicInfo", {
      name: "新姓名",
    });
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h1>{profile?.basicInfo?.name}</h1>
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
}
```

### 组件集成

```tsx
import Profile from "@/pages/Profile";
import BasicInfoSection from "@/components/profile/BasicInfoSection";

// 在主应用中添加路由
<Route path="/profile" component={Profile} />;
```

## 📱 响应式设计

- **移动端优先**: 所有组件都支持移动端
- **断点适配**: 支持 sm, md, lg, xl 断点
- **触摸友好**: 按钮和交互元素适合触摸操作
- **性能优化**: 懒加载和代码分割

## 🔒 安全特性

- **数据验证**: 前后端双重验证
- **权限控制**: 基于角色的访问控制
- **数据加密**: 敏感信息加密存储
- **CSRF 保护**: 跨站请求伪造保护
- **XSS 防护**: 跨站脚本攻击防护

## 🧪 测试

### 运行测试页面

访问 `/profile-test` 查看测试页面，包含：

- 资料完成度显示
- 各模块数据展示
- 更新功能测试
- 原始数据调试

### 手动测试

1. 打开浏览器开发者工具
2. 访问测试页面
3. 查看网络请求
4. 检查数据更新

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**

   ```bash
   # 检查环境变量
   echo $DATABASE_URL

   # 重新生成客户端
   npx prisma generate
   ```

2. **API 请求失败**

   ```bash
   # 检查服务器状态
   curl http://localhost:3000/health

   # 检查认证token
   # 确保请求头包含正确的Authorization
   ```

3. **组件渲染错误**

   ```bash
   # 检查依赖安装
   npm install

   # 检查TypeScript类型
   npm run type-check
   ```

## 📈 性能优化

- **图片压缩**: 头像自动压缩到 2MB 以下
- **懒加载**: 组件按需加载
- **缓存策略**: 合理的数据缓存
- **代码分割**: 路由级别的代码分割

## 🔄 数据流

```
用户操作 → 前端组件 → useProfile Hook → API请求 → 后端服务 → 数据库更新 → 响应返回 → 状态更新 → UI刷新
```

## 📝 开发指南

### 添加新字段

1. 更新 Prisma schema
2. 运行数据库迁移
3. 更新 TypeScript 接口
4. 修改服务层逻辑
5. 更新前端组件

### 添加新组件

1. 创建组件文件
2. 定义 Props 接口
3. 实现组件逻辑
4. 添加到主页面
5. 测试功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件
