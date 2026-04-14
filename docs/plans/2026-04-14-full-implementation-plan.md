# Win6688 成本管理系统 — 完整实施计划

> 日期：2026-04-14
> 状态：待执行
> 前置工作：QA 修复已完成（7 个 commit），代码已推送到 main

## Context

成本管理系统前端框架已搭好（8 个页面、Supabase 客户端、Excel 映射、类型定义全部就位），但 antigravity 的实现有几个关键断层：
1. 数据库表可能还没创建（migration SQL 存在但不确定已执行）
2. API 层全是 stub，实际数据流没跑通
3. 成本计算引擎只完成 75%，部分公式缺失
4. 多个页面功能不完整（配置管理只读、导出功能缺失、登出按钮缺失）

本计划的目标是：**把系统从"能跑的 demo"变成"能用的产品"**。

---

## Phase 1: 基础设施（必须先做）

### 1.1 验证并创建 Supabase 数据库表
- **文件**: `supabase/migrations/20260413000000_init_schema.sql`
- **操作**:
  - 检查 Supabase Dashboard 是否已有表
  - 如果没有，通过 Supabase SQL Editor 执行 migration
  - 验证所有 13 张表都已创建
  - 插入固定配置初始数据（annual_targets 4 行、log_standards、project_opportunity_mapping）
- **验证**: 在 Supabase Table Editor 中能看到所有表

### 1.2 AppShell 补全登出按钮
- **文件**: `src/layouts/AppShell.tsx`
- **操作**: 在顶部工具栏添加登出按钮，调用 `onLogout` 回调
- **验证**: 登录后能看到登出按钮，点击后回到登录页

### 1.3 补全 App.tsx 的 onLogout 传递
- **文件**: `src/App.tsx`
- **操作**: 将 `handleLogout` 传递给 `AppContent` → `AppShell`
- **验证**: 登出按钮能正常工作

---

## Phase 2: 核心数据流打通

### 2.1 成本计算引擎完善
- **文件**: `src/lib/costEngine.ts`
- **操作**:
  - 补全 32 字段公式中缺失的计算（外采成本按项目聚合、商务成本拆分等）
  - 确保两项预警规则生效：商务成本 > 10%、交付成本(外部) > 18.44%
  - 补充 `pendingExternalPayment`（挂账外采）的计算
- **验证**: 导入真实数据后，项目看板的成本数字和预警标签正确

### 2.2 总览聚合计算完善
- **文件**: `src/lib/computeOverview.ts`
- **操作**:
  - 使用 costEngine 的输出作为数据源（而不是直接查 projects 表）
  - 补全月度趋势、成本分类树的聚合逻辑
  - 对接 Dashboard 的 props 接口
- **验证**: 总览看板的 KPI 数字在有真实数据时与手动计算一致

### 2.3 Store 数据加载优化
- **文件**: `src/lib/store.tsx`
- **操作**:
  - 添加 loading 状态暴露（组件可在数据加载中显示骨架屏）
  - 处理 Supabase 查询失败的错误提示（区分"表不存在"和"网络错误"）
  - 清理 localStorage fallback 逻辑（生产环境不需要）
- **验证**: 首次加载时能看到 loading 状态

---

## Phase 3: 导入功能完善

### 3.1 ImportManager 边界情况处理
- **文件**: `src/pages/ImportManager.tsx`
- **操作**:
  - 空文件、非 Excel 文件的错误提示
  - 大文件（>5MB）的行数限制提示
  - 导入失败时的错误信息展示（不只是 Toast，在页面上也能看到）
  - 导入记录页增加「清空表」按钮（确认对话框）
- **验证**: 上传错误文件有清晰提示；导入成功后能在记录页看到

### 3.2 Excel 映射验证
- **文件**: `src/lib/excelMapping.ts`
- **操作**:
  - 用真实 Excel 文件测试所有 10 种映射
  - 确认 OA 标题行跳过逻辑正确
  - 确认合并单元格填充逻辑正确
  - 确认日期、金额、百分比类型转换正确
- **验证**: 用真实 Excel 导入后，数据库中的数据格式正确

---

## Phase 4: 页面功能补全

### 4.1 项目看板 — 预警可视化
- **文件**: `src/pages/ProjectView.tsx`
- **操作**:
  - 预警行高亮红色 + ⚠️ 图标
  - 交付成本进度 > 项目进度时，进度列标红
  - 添加「预警规则说明」Tooltip
- **验证**: 超阈值的行有明显的视觉提示

### 4.2 商机看板 — 可视化补全
- **文件**: `src/pages/OpportunityView.tsx`
- **操作**:
  - 漏斗图数据修正（关联项目总额需要通过 mapping 查询）
  - 场景分布柱状图确认数据正确
  - 搜索功能测试
- **验证**: 无数据时显示 Empty 状态，有数据时图表正确渲染

### 4.3 配置管理 — 编辑功能
- **文件**: `src/pages/ConfigManager.tsx`
- **操作**:
  - 年度计划数据：支持编辑 plan_contract 和 plan_payment
  - 日志标准：支持编辑 is_shared 和 description
  - 人员管理：添加人员 Modal 已有，补充编辑和状态切换
- **验证**: 修改固定配置后，相关看板数据实时更新

### 4.4 成本录入 — 编辑功能
- **文件**: `src/pages/ManualCostManager.tsx`
- **操作**:
  - 添加编辑功能（点击行进入编辑模式）
  - 删除按钮已有，确认能正常工作
  - 添加合计行显示
- **验证**: 增删改都能正常工作

### 4.5 人员管理 — 工时计算验证
- **文件**: `src/pages/StaffView.tsx`
- **操作**:
  - 验证项目工时 / 商机工时 / 部门工时的计算逻辑
  - 无数据时显示 Empty 状态
  - 确认 Top 15 排行图数据正确
- **验证**: 导入日志数据后，人员工时数字与手动汇总一致

---

## Phase 5: 剩余功能

### 5.1 导出功能
- **文件**: `src/layouts/AppShell.tsx`（导出按钮）、新建 `src/utils/export.ts`
- **操作**: 将当前页面数据导出为 Excel（使用 xlsx 库的 write 功能）
- **验证**: 点击导出按钮下载 Excel 文件

### 5.2 销售看板数据源切换
- **文件**: `src/pages/SalesView.tsx`
- **操作**: 当前已通过 App.tsx 的 salesTargets 计算真实数据，确认无 bug
- **验证**: 有真实数据时销售看板数字正确

---

## 实施顺序和依赖关系

```
Phase 1 (基础设施)
  1.1 数据库表 ← 必须先做
  1.2 登出按钮 ← 独立
  1.3 onLogout 传递 ← 依赖 1.2

Phase 2 (核心数据流) ← 依赖 Phase 1.1
  2.1 成本计算引擎
  2.2 总览聚合计算 ← 依赖 2.1
  2.3 Store 优化 ← 独立

Phase 3 (导入功能) ← 依赖 Phase 1.1
  3.1 ImportManager 完善
  3.2 Excel 映射验证 ← 依赖 3.1

Phase 4 (页面补全) ← 依赖 Phase 2
  4.1 项目看板预警
  4.2 商机看板
  4.3 配置管理
  4.4 成本录入
  4.5 人员管理

Phase 5 (剩余功能) ← 依赖 Phase 4
  5.1 导出
  5.2 销售看板
```

## 验证计划

每个 Phase 完成后：
1. `npx vite build` 确保构建通过
2. 手动在浏览器中走一遍受影响的页面
3. 检查 console 有无新错误
4. git commit 并在关键节点 push

最终验收：
- 登录 → 各页面浏览 → 导入 Excel → 验证数据在各看板正确展示 → 编辑配置 → 导出
