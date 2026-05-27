# JEECG 页面编辑器与 UI 配置方案

## 1. 建设目标

新增要求的核心目标是：非技术人员可以在 JEECG 后台通过拖拽组件、调整样式和绑定数据源，直接修改 App 的部分用户界面；变更保存后可预览、发布、持久化，并在生产环境准确渲染，同时不破坏已有课程、视频、消息等核心功能。

本方案将该能力定义为“配置化页面系统”，首期优先支持：

- App 首页运营区。
- 活动页/专题页。
- 信息聚合页。
- 课程推荐区块。

核心学习页面如课程详情、播放器、我的课程、登录流程仍采用前端代码实现，不纳入首期拖拽编辑范围。

## 2. 与 JEECG 能力的关系

JEECG 官方门户设计能力支持 PC 和移动端门户设计、组件添加、组件拖拽调整位置、组件大小调整、样式和内容配置、移动端独立样式设置。首期应优先评估是否直接启用该能力。

同时，JEECG 官方 APP 代码生成文档说明 APP 端代码生成仅支持列表和表单页面，其他页面需要自行开发。因此，本项目的移动端复杂首页不应依赖 JEECG 直接生成 App 页面源码，而应采用：

后台 JEECG 页面编辑器生成配置 -> 后端持久化 schema -> App 拉取 schema -> App 内置渲染器渲染。

## 3. 推荐实现路径

### 3.1 方案 A：直接使用 JEECG 门户设计作为编辑器

适用条件：

- 项目授权版本包含门户设计能力。
- 官方组件能满足首页和专题页的主要编辑需求。
- 移动端样式配置能力经过验证，可以满足 App 预览要求。

优点：

- 启动快，减少自研编辑器成本。
- 官方已有拖拽、样式配置、PC/移动端切换能力。
- 与 JEECG 权限体系、菜单体系更容易集成。

风险：

- 商业授权和版本能力需要确认。
- 官方门户偏后台门户场景，App 首页运营组件可能需要定制。
- 需要确认配置数据结构是否便于移动端消费。

### 3.2 方案 B：在 JEECG 后台扩展自定义 App 页面编辑器

适用条件：

- 当前 JEECG 版本不包含门户设计。
- App 首页样式和组件更偏移动端，需要完全控制 schema。
- 希望保持移动端渲染结构长期稳定。

优点：

- schema 可完全按 App 渲染器设计。
- 组件白名单、安全策略、版本兼容更可控。
- 可复用 JEECG 权限、菜单、Online 表单、文件上传和字典能力。

风险：

- 首期需要额外开发编辑器界面。
- 需要前后端定义配置协议和预览流程。

### 3.3 推荐结论

推荐采用“方案 A 优先验证，方案 B 作为落地兜底”的组合策略：

1. 先验证当前 JEECG 版本是否可启用门户设计/页面设计能力。
2. 如果可用，将其作为后台编辑入口，并扩展 App 组件和数据源。
3. 如果不可用，在 JEECG 后台新增自定义页面编辑器，但仍复用 JEECG 权限、菜单、文件、字典和发布流程。
4. 无论采用哪种编辑入口，最终对 App 输出统一 JSON schema，保证移动端渲染协议不被后台编辑器实现绑定。

## 4. 首期组件白名单

| 组件类型 | 用途 | 配置项 | 数据源 |
| --- | --- | --- | --- |
| `banner` | 首页轮播 | 高度、圆角、自动播放、图片、跳转链接 | 手动选择图片和链接 |
| `noticeBar` | 公告条 | 图标、背景色、文字颜色、滚动方式 | 信息分类或手动文本 |
| `imageNav` | 图标导航 | 列数、图标、标题、跳转 | 手动配置 |
| `courseList` | 课程列表 | 标题、展示数量、横滑/纵向、卡片样式 | 课程分类、手动选课 |
| `infoList` | 资讯/公告列表 | 标题、展示数量、摘要开关 | 信息分类 |
| `topicCard` | 专题卡片 | 封面、标题、描述、跳转 | 专题或手动链接 |
| `richText` | 说明文本 | 富文本内容、字号、颜色 | 手动编辑 |
| `spacer` | 留白 | 高度、背景色 | 无 |

首期不开放自定义 HTML、任意 CSS、任意 JavaScript、远程脚本、WebView 嵌入。

## 5. 配置数据结构

页面 schema 示例：

```json
{
  "schemaVersion": "1.0.0",
  "pageCode": "app_home",
  "pageName": "App首页",
  "version": 12,
  "minAppVersion": "1.0.0",
  "theme": {
    "primaryColor": "#F04D45",
    "backgroundColor": "#FFFFFF"
  },
  "components": [
    {
      "id": "cmp_banner_001",
      "type": "banner",
      "visible": true,
      "style": {
        "height": 160,
        "radius": 8,
        "marginTop": 12,
        "marginHorizontal": 16
      },
      "props": {
        "autoplay": true,
        "interval": 3000
      },
      "dataSource": {
        "mode": "manual",
        "items": [
          {
            "title": "免费公开课",
            "imageUrl": "https://cdn.example.com/banner/open-course.png",
            "linkType": "course",
            "linkValue": "course_10001"
          }
        ]
      }
    }
  ]
}
```

设计原则：

- `schemaVersion` 控制协议版本。
- `version` 控制发布版本。
- `minAppVersion` 防止旧 App 渲染不兼容配置。
- `type` 必须在组件白名单内。
- `style` 只允许枚举或数值 token，不允许任意 CSS 字符串。
- `dataSource` 支持手动配置和动态绑定。

## 6. 数据库持久化设计

### 6.1 页面主表 `edu_page`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | varchar(36) | 主键 |
| page_code | varchar(64) | 页面编码，如 `app_home` |
| page_name | varchar(100) | 页面名称 |
| page_type | varchar(32) | `home`、`topic`、`activity`、`info` |
| status | varchar(20) | `enabled`、`disabled` |
| remark | varchar(500) | 备注 |
| create_by/create_time/update_by/update_time | JEECG 标准字段 | 审计 |

### 6.2 页面版本表 `edu_page_version`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | varchar(36) | 主键 |
| page_id | varchar(36) | 页面 ID |
| version_no | int | 版本号，递增 |
| schema_version | varchar(20) | schema 协议版本 |
| config_json | longtext/json | 完整页面配置 |
| publish_status | varchar(20) | `draft`、`reviewing`、`published`、`archived` |
| min_app_version | varchar(20) | 最低 App 版本 |
| publish_time | datetime | 发布时间 |
| rollback_from_version | int | 回滚来源版本 |
| create_by/create_time/update_by/update_time | JEECG 标准字段 | 审计 |

### 6.3 页面发布表 `edu_page_publish`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | varchar(36) | 主键 |
| page_code | varchar(64) | 页面编码 |
| env | varchar(20) | `test`、`prod` |
| current_version_id | varchar(36) | 当前发布版本 |
| current_version_no | int | 当前发布版本号 |
| gray_rule_json | longtext/json | 灰度规则，首期可为空 |
| cache_key | varchar(128) | Redis 缓存键 |
| update_time | datetime | 发布时间 |

## 7. 保存、预览、发布流程

### 7.1 保存草稿

1. 运营在编辑器中拖拽组件并调整样式。
2. 前端编辑器生成 schema。
3. 后端校验组件类型、字段、样式范围、数据源权限。
4. 校验通过后写入 `edu_page_version`，状态为 `draft`。
5. 返回草稿版本号。

### 7.2 预览

1. 编辑器请求预览接口。
2. 后端返回指定草稿版本 schema。
3. 后台提供移动端预览容器，使用与 App 同源的渲染组件或 H5 预览包渲染。
4. 运营确认视觉效果和跳转。

### 7.3 发布

1. 运营点击发布。
2. 后端再次校验 schema。
3. 使用数据库事务：
   - 将当前已发布版本置为 `archived`。
   - 将目标版本置为 `published`。
   - 更新 `edu_page_publish.current_version_id`。
4. 刷新 Redis 缓存。
5. 记录发布日志。
6. App 下次拉取时按版本号更新。

### 7.4 回滚

1. 管理员选择历史已发布版本。
2. 系统复制历史配置生成新版本。
3. 新版本发布，旧版本归档。
4. App 获取新版本号后回滚到稳定 UI。

## 8. App 渲染策略

App 渲染层负责把 schema 转为真实 UI：

- 拉取：启动后请求 `/app/pages/app_home/published`。
- 缓存：本地保存最近一次可用 schema。
- 渲染：按 `components` 顺序渲染白名单组件。
- 容错：未知组件直接跳过，并上报埋点。
- 降级：接口失败时使用本地缓存；无缓存时展示内置默认首页。
- 版本：若 `minAppVersion` 大于当前 App 版本，忽略该 schema 并使用默认首页。
- 样式：只解析白名单样式字段，超出范围按默认值处理。

## 9. 生产环境准确渲染保障

为了确保后台配置和生产 App 展示一致，必须建立以下机制：

- 统一组件库：后台预览和 App 渲染使用同一份组件协议和样式 token。
- schema 校验：保存和发布时均做 JSON Schema 校验。
- 预览即生产：预览容器使用生产同版渲染组件，不使用后台临时 HTML 拼接。
- 版本锁定：App 请求返回明确 `version` 和 `schemaVersion`。
- 灰度发布：首期可按测试账号灰度；稳定后再全量。
- 回滚入口：后台页面版本列表提供一键回滚。
- 监控告警：页面 schema 拉取失败、组件渲染失败、未知组件出现时记录日志。

## 10. 与现有功能兼容

- 页面配置只改变展示层，不直接修改课程、课节、信息等业务数据。
- 组件的数据源通过后端接口读取，不能绕过课程上下架、报名授权、信息发布状态。
- 页面组件跳转必须使用统一路由协议，如 `course:courseId`、`info:postId`、`topic:topicId`。
- 对旧 App 版本保留默认首页，避免 schema 升级导致白屏。
- 删除组件不删除业务数据，只删除页面引用。
- 页面发布和课程发布相互独立，课程下架后相关组件自动不展示或展示空态。

## 11. 权限与审计

| 操作 | 权限建议 |
| --- | --- |
| 查看页面配置 | `edu:page:view` |
| 编辑草稿 | `edu:page:edit` |
| 预览草稿 | `edu:page:preview` |
| 发布页面 | `edu:page:publish` |
| 回滚页面 | `edu:page:rollback` |
| 删除草稿 | `edu:page:delete` |

发布、回滚、删除必须记录操作人、时间、版本号、IP、变更摘要。

## 12. 验收标准

- 非技术人员能在后台添加、删除、排序组件。
- 非技术人员能调整组件基础样式，如高度、圆角、间距、标题、颜色。
- 配置保存后刷新后台仍能恢复。
- 发布后 App 能展示对应版本。
- App 断网或接口异常时不会白屏。
- 旧版本 App 遇到未知组件不会崩溃。
- 可以从历史版本回滚到上一版。
- 页面配置不影响课程播放、登录、我的课程等核心功能。

