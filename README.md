# 病历管理系统 · 前端（medical-frontend）

> 基于 **Vue 3 + Vite + Element Plus** 的前端应用，配套后端 [`medical_system`](../medical_system) 使用，用于个人练习前后端分离与医疗信息化业务场景。

**当前版本：`v0.5.0`**
（需要后端 `v0.10.0` 及以上：该版本提供科室管理接口与 `GET /records?patient_id=` 反向查询）

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [页面与路由](#页面与路由)
- [与后端的接口约定](#与后端的接口约定)
- [登录态与鉴权](#登录态与鉴权)
- [跨域与端口](#跨域与端口)
- [构建与部署](#构建与部署)
- [已知限制](#已知限制)
- [常见问题](#常见问题)
- [说明](#说明)

---

## 项目简介

本仓库是病历管理系统的**前端部分**，只负责界面与交互，数据全部来自后端 REST API。

前后端分离带来的两个约束，是理解本项目的前提：

1. **后端必须先启动**。前端不做任何数据模拟，后端没起，登录页点不动。
2. **两者来源不同域**。前端跑在 `5173`、后端跑在 `8000`，属于跨域请求，必须由后端放行（见[跨域与端口](#跨域与端口)）。

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 语言 | JavaScript（ES Module） | — |
| 框架 | Vue | 3.5.44 |
| 构建工具 | Vite | 8.3.5 |
| UI 组件库 | Element Plus | 2.14.7 |
| 图标 | @element-plus/icons-vue | 2.3.2 |
| 路由 | vue-router | 5.4.0 |
| HTTP 客户端 | axios | 1.20.0 |
| 开发环境 | Node.js / npm | 22.22.2 / 10.9.7 |

> 完整依赖清单见 [`package.json`](./package.json)。

## 目录结构

```text
medical-frontend/
├── public/
│   ├── favicon.svg          # 站点图标
│   └── icons.svg
├── src/
│   ├── views/
│   │   ├── Login.vue        # 登录页：POST /login，token 存入 localStorage
│   │   ├── Register.vue     # 注册页：GET /departments 拉科室，POST /register 提交
│   │   └── Dashboard.vue    # 主控台：患者管理 / 病历管理 / 科室管理（仅 admin），含各类弹窗与两个抽屉
│   ├── router/
│   │   └── index.js         # 路由表：/login、/register、/dashboard、/ 重定向
│   ├── utils/
│   │   └── request.js       # axios 实例 + 请求/响应拦截器（token 注入、401 跳转、错误弹窗）
│   ├── App.vue              # 根组件，只放 <router-view />
│   ├── main.js              # 入口：挂载 router 与 Element Plus
│   └── style.css            # 全局样式
├── index.html               # 页面模板（Vite 入口）
├── vite.config.js           # 构建配置
├── package.json
└── README.md                # 项目说明（本文件）
```

## 快速开始

### 1. 环境要求

| 项目 | 要求 |
| --- | --- |
| Node.js | 20.19+ 或 22.12+（Vite 8 的要求），本项目开发环境为 22.22.2 |
| 后端 | 已按 [`medical_system`](../medical_system) 的说明启动，监听 `8000` |

### 2. 安装依赖

**必须在 `medical-frontend` 目录内执行**：

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器打开 <http://localhost:5173>，会自动重定向到 `/login`。

### 4. 注册与登录

第一次使用先点登录页的「还没有账号？去注册」进入 `/register`，选角色（医生 / 护士）和科室后提交。**管理员不能自助注册**，需要用医生账号注册后再改库：`UPDATE users SET role = 'admin' WHERE username = '你的用户名';`。

登录成功后跳转 `/dashboard`，同时加载患者列表与病历列表；管理员会额外加载科室列表并看到「科室管理」标签页。

> 启动顺序不能颠倒：先 `/medical_system` 里 `uvicorn main:app --reload`，再前端 `npm run dev`。反了的话登录页会提示「服务器连接失败」。

## 页面与路由

| 路径 | 组件 | 说明 |
| --- | --- | --- |
| `/login` | `views/Login.vue` | 登录页，用户名 + 密码，成功后跳 `/dashboard`；底部有「还没有账号？去注册」 |
| `/register` | `views/Register.vue` | 注册页，用户名 / 密码 / 真实姓名 / 角色（医生、护士）/ 所属科室；**不需要登录**，科室下拉来自公开的 `GET /departments` |
| `/dashboard` | `views/Dashboard.vue` | 主控台：顶部标签页切换「患者管理」「病历管理」，管理员多一个「科室管理」 |
| `/` | — | 重定向到 `/login` |

`Dashboard.vue` 的内容由顶部标签页承载，左侧菜单只是导航：

| 标签页 | 可见角色 | 内容 |
| --- | --- | --- |
| 患者管理 | 全部 | 患者列表（ID / 姓名 / 性别 / 手机号 / 操作）+「+ 新增患者」弹窗 +「查看档案」抽屉 |
| 病历管理 | 全部 | 病历列表（病历号 / 患者姓名 / 类型 / 就诊时间 / 状态）+「+ 新增病历」弹窗 +「查看详情」抽屉 |
| 科室管理 | **仅 `admin`**（`v-if="isAdmin"`） | 科室列表 + 「+ 新增科室」弹窗，调用 `POST /departments` |

登录后前端先调 `GET /me`，用返回的 `role` 决定 `isAdmin` 是否为 `true`；管理员才会额外拉一次 `GET /departments` 并显示科室标签页。

**病历详情的交互**：点「查看详情」会重新调用 `GET /records/{id}` 取最新数据（而不是复用表格里的行数据），抽屉分「基本信息」与「病史信息」两块；`draft` 状态底部显示警示条与「确认无误，签名锁定」按钮，签名成功后抽屉切换为「已签名锁定」提示，同时把表格中该行状态改为「已签名」。

**患者档案的交互**：点患者行的「查看档案」会调 `GET /records?patient_id={id}`，抽屉里列出该患者的历史病历（病历号 / 类型 / 就诊时间 / 状态），每条带「查看」按钮，点开复用同一个病历详情抽屉。列表为空时显示「该患者暂无你接诊的记录」——因为医生的查询结果里只有自己接诊的那部分。

> 病历列表只返回 `patient_id`，表格里的患者姓名是前端用已加载的患者列表映射出来的，患者不在列表中时显示「未知患者」。

## 与后端的接口约定

前端目前依赖以下 11 个接口。请求统一走 `src/utils/request.js` 里的 axios 实例，**API 地址只在那一处配置**（`baseURL: 'http://localhost:8000'`），组件里不再出现完整 URL：

```javascript
import request from '../utils/request'

const res = await request.get('/records')   // 已是 response.data，不用再 .data
```

**拦截器做了什么**：

| 拦截器 | 行为 |
| --- | --- |
| `interceptors.request` | 自动从 `localStorage` 取 `token`，注入 `Authorization: Bearer xxx` |
| `interceptors.response`（成功） | 直接返回 `response.data`，组件少写一层 `.data` |
| `interceptors.response`（`401`） | 提示「登录已过期」，清除 token 并跳转 `/login` |
| `interceptors.response`（其他错误） | 取后端 `error.message` 统一弹窗；无响应时提示「服务器连接失败」 |

> 因为错误提示已在拦截器里统一处理，组件里的 `catch` 只做兜底（记录日志），不再重复弹窗——否则同一个错误会弹两次。

| 方法 | 路径 | 用途 | 鉴权 |
| --- | --- | --- | --- |
| `POST` | `/login` | 用户名密码换取令牌 | 否 |
| `POST` | `/register` | 医生 / 护士注册（注册页） | 否 |
| `GET` | `/departments` | 科室下拉数据源（注册页在未登录时调用，后端该接口公开） | 否 |
| `POST` | `/departments` | 新增科室（科室管理标签页，仅 `admin`） | 是 |
| `GET` | `/me` | 获取当前登录用户姓名与角色（`role` 决定是否显示科室管理） | 是 |
| `GET` | `/patients` | 患者列表 | 是 |
| `POST` | `/patients` | 新增患者 | 否 |
| `GET` | `/records` | 病历列表（默认取前 10 条；加 `?patient_id=` 即按患者查历史病历；非 `admin` 只返回自己接诊的） | 是 |
| `POST` | `/records` | 新增病历（后端仅 `doctor` 可调用） | 是 |
| `GET` | `/records/{record_id}` | 病历详情（两个抽屉的数据源） | 是 |
| `POST` | `/records/{record_id}/sign` | 签名锁定（仅接诊医生） | 是 |

**成功响应示例**（`POST /login`）：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**错误响应格式**（后端统一包装，前端直接取 `error.message` 展示）：

```json
{
  "error": {
    "code": 401,
    "message": "用户名或密码错误"
  }
}
```

## 登录态与鉴权

1. 登录成功后，前端把 `access_token` 存入 `localStorage`，key 为 `token`；
2. 之后每个受保护请求都带上请求头：

   ```javascript
   const config = {
     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
   }
   ```

3. 退出登录 = 删掉这个 key 并跳回 `/login`；
4. 令牌有效期 60 分钟，过期后后端返回 `401`，此时前端会清空 token 并跳回登录页。

> 第 2 步现在由 `src/utils/request.js` 的请求拦截器自动完成，组件里**不再手写 `headers`**；上面的写法保留在此，是为了说明拦截器到底替代了什么。

## 跨域与端口

前端 `5173`、后端 `8000`，浏览器会拦截跨域请求，因此后端 `main.py` 中配置了白名单：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**这意味着**：

- 前端必须跑在 `5173`；用 `--port` 改成别的端口，请求会被浏览器拦下（控制台报 CORS 错误）。
- 如果确实要换端口，得同时把新地址加进后端 `allow_origins` 并重启后端。

## 构建与部署

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建结果
```

路由使用 `createWebHistory`（HTML5 History 模式），部署到服务器时需要把未知路径回退到 `index.html`，否则刷新页面会 404。以 nginx 为例：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 已知限制

按当前学习阶段有意保留的简化，后续版本逐步处理：

- **API 地址仍写死在代码里**：`baseURL: 'http://localhost:8000'` 目前硬编码在 `src/utils/request.js`，虽然已从 8 处收敛到 1 处，但仍未走环境变量。计划改为 `.env` + `import.meta.env.VITE_API_BASE`。
- **没有全局状态库**：`isAdmin`、`departments`、`patients`、`records` 都放在 `Dashboard.vue` 的页面级 `ref` 里，登录态只存在 `localStorage` 的 `token` 中。好处是简单，代价是**每新增一个需要用户信息的页面，都要重新调一次 `GET /me`**。等页面变多再考虑 Pinia 或 `useUser()` 组合式函数。
- **科室只能增、不能改删**：`POST /departments` 与 `GET /departments` 已通，但没有编辑与删除入口（后端也未提供），打错名字只能改数据库。
- **注册页只有非空校验**：`Register.vue` 只检查用户名 / 密码 / 姓名是否填写，密码强度、用户名格式、科室是否必选都没有约束，错误最终由后端返回。
- **医生查他人患者会看到空列表**：`GET /records?patient_id=` 会叠加后端的数据隔离条件，医生点一个自己没接诊过的患者，返回空数组而不是 `403`，界面显示「该患者暂无你接诊的记录」。这是有意为之，但容易被误读成没数据。
- **`catch` 块多为空实现**：`Dashboard.vue` 有多处 `catch (error) { }`，因为错误提示已交给拦截器。但空 `catch` 会吞掉非 HTTP 异常（例如代码里的 `TypeError`），排查时会毫无线索，建议至少 `console.error(error)`。
- **无路由守卫**：`/dashboard` 没有全局守卫，未登录时靠组件内 `onMounted` 检查 token 后跳回登录页，会有一次闪烁。
- **请求超时固定 5 秒**：`request.js` 里 `timeout: 5000`，导出大列表或后端冷启动时可能误报「服务器连接失败」。
- **签名后没有修改入口**：病历一旦签名即只读，因为后端还没有修改接口；`signed` 状态的实际「防修改」要等后端补上 `PATCH /records/{id}` 后才真正生效。
- **列表没有分页控件**：`GET /records` 支持 `skip` / `limit`，但前端固定取前 10 条，没有翻页或加载更多；患者档案抽屉里也固定 `limit=10`。
- **状态文案只有两种**：`draft` 显示「草稿」、其余一律显示「已签名」。后端还支持 `amended` / `void`，前端尚未区分。
- **无测试、无 ESLint**：尚未引入单元测试与代码检查。

## 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 登录提示「服务器连接失败」 | 后端没启动，或端口不是 8000 | 先启动后端，访问 <http://localhost:8000/docs> 确认 |
| 控制台报 CORS 相关错误 | 前端端口不是 5173，或后端版本低于 v0.7.0 | 用默认 5173 启动；确认后端已加 CORS 中间件 |
| 登录成功但立刻被踢回登录页 | 后端未运行或令牌已过期，`/me` 返回 401 | 重新登录；检查后端日志 |
| `npm install` 报错 | 在错误目录执行（例如 `C:\project` 根目录） | `cd` 进 `medical-frontend` 再执行 |
| 点签名提示「该病历已被签名锁定」 | 该病历已是 `signed` 状态，后端返回 `400` | 属于正常行为；签名不可撤销，草稿阶段确认无误再签 |
| 点签名提示「你没有权限签名他人的病历」 | 该病历的 `doctor_id` 不是你登录的账号 | 换成创建该病历的医生账号，或改用管理员账号查看 |
| 登录后看不到「科室管理」标签页 | 该标签用 `v-if="isAdmin"` 控制，只有 `role` 为 `admin` 才渲染 | 管理员账号需改库获得：`UPDATE users SET role = 'admin' WHERE username = '你的用户名';` |
| 注册时选了科室就返回 `500` | 后端 `register_user` 的科室校验用了 `filter(department_id=...)`，SQLAlchemy 会抛 `TypeError` | 后端待修；临时可先不选科室（`department_id` 允许为空）完成注册 |

## 说明

本项目为个人学习项目，仅用于练习前端开发与前后端联调，**不可用于生产环境**。
