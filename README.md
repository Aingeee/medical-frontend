# 病历管理系统 · 前端（medical-frontend）

> 基于 **Vue 3 + Vite + Element Plus** 的前端应用，配套后端 [`medical_system`](../medical_system) 使用，用于个人练习前后端分离与医疗信息化业务场景。

**当前版本：`v0.3.0`**
（需要后端 `v0.8.0` 及以上：该版本提供病历详情、签名锁定与 CORS 白名单）

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
│   │   └── Dashboard.vue    # 主控台：患者管理 / 病历管理两个标签页，含新增弹窗、详情抽屉与签名
│   ├── router/
│   │   └── index.js         # 路由表：/login、/dashboard、/ 重定向
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

### 4. 登录

用后端 `POST /register` 注册过的账号登录，例如医生账号（`role` 为 `doctor`）。登录成功后跳转 `/dashboard`，同时加载患者列表与病历列表。

> 启动顺序不能颠倒：先 `/medical_system` 里 `uvicorn main:app --reload`，再前端 `npm run dev`。反了的话登录页会提示「服务器连接失败」。

## 页面与路由

| 路径 | 组件 | 说明 |
| --- | --- | --- |
| `/login` | `views/Login.vue` | 登录页，用户名 + 密码，成功后跳 `/dashboard` |
| `/dashboard` | `views/Dashboard.vue` | 主控台：顶部标签页切换「患者管理」「病历管理」，含新增弹窗、详情抽屉 |
| `/` | — | 重定向到 `/login` |

`Dashboard.vue` 的内容由顶部标签页承载，左侧菜单只是导航：

| 标签页 | 内容 |
| --- | --- |
| 患者管理 | 患者列表（ID / 姓名 / 性别 / 手机号）+「+ 新增患者」弹窗 |
| 病历管理 | 病历列表（病历号 / 患者姓名 / 类型 / 就诊时间 / 状态）+「+ 新增病历」弹窗 +「查看详情」抽屉 |

**病历详情的交互**：点「查看详情」会重新调用 `GET /records/{id}` 取最新数据（而不是复用表格里的行数据），抽屉分「基本信息」与「病史信息」两块；`draft` 状态底部显示警示条与「确认无误，签名锁定」按钮，签名成功后抽屉切换为「已签名锁定」提示，同时把表格中该行状态改为「已签名」。

> 病历列表只返回 `patient_id`，表格里的患者姓名是前端用已加载的患者列表映射出来的，患者不在列表中时显示「未知患者」。

## 与后端的接口约定

前端目前依赖以下 8 个接口，全部指向 `http://localhost:8000`：

| 方法 | 路径 | 用途 | 鉴权 |
| --- | --- | --- | --- |
| `POST` | `/login` | 用户名密码换取令牌 | 否 |
| `GET` | `/me` | 获取当前登录医生姓名 | 是 |
| `GET` | `/patients` | 患者列表 | 是 |
| `POST` | `/patients` | 新增患者 | 否 |
| `GET` | `/records` | 病历列表（默认取前 10 条） | 是 |
| `POST` | `/records` | 新增病历（后端仅 `doctor` 可调用） | 是 |
| `GET` | `/records/{record_id}` | 病历详情（抽屉数据源） | 是 |
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

> 当前是**最简实现**：没有 axios 实例、没有请求拦截器，每个页面自己拼 `config`。改用拦截器后，token 注入和 401 处理只需写一次。

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

- **接口地址硬编码**：`http://localhost:8000` 写死在 `Login.vue` 和 `Dashboard.vue` 里，共 8 个调用点（Login 1 个、Dashboard 7 个），换环境要逐个改。计划改为 `.env` + Vite 环境变量。
- **无路由守卫**：`/dashboard` 没有全局守卫，未登录时靠组件内 `onMounted` 检查 token 后跳回登录页，会有一次闪烁。
- **无统一请求层**：没有 axios 实例与拦截器，token 注入、错误处理在每个页面重复。
- **签名后没有修改入口**：病历一旦签名即只读，因为后端还没有修改接口；`signed` 状态的实际「防修改」要等后端补上 `PATCH /records/{id}` 后才真正生效。
- **列表没有分页控件**：`GET /records` 支持 `skip` / `limit`，但前端固定取前 10 条，没有翻页或加载更多。
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

## 说明

本项目为个人学习项目，仅用于练习前端开发与前后端联调，**不可用于生产环境**。
