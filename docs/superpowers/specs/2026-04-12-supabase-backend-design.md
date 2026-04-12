# Supabase 后端 + Excel 导入方案设计

> 版本：V1.0
> 日期：2026-04-12
> 状态：已确认
> 技术栈：Supabase (PostgreSQL) + React 前端改造

---

## 一、技术架构

### 1.1 整体架构

```
┌─────────────────┐      ┌─────────────────┐
│   前端 (React)   │ ←── │   Supabase      │
│   现有代码       │     │   云端托管       │
│                 │     │   PostgreSQL     │
│   localhost:5173 │ HTTPS│   Row Level Sec │
└─────────────────┘     └─────────────────┘
```

### 1.2 技术选型

| 类型 | 技术 |
|------|------|
| 数据库 | Supabase (托管 PostgreSQL) |
| 托管管理界面 | Supabase Studio（网页版，类似 phpMyAdmin） |
| 前端数据层 | Supabase JS Client (`@supabase/supabase-js`) |
| Excel 解析 | `xlsx` (SheetJS) |
| 固定配置初始化 | Supabase Studio 手动导入 Excel |

---

## 二、数据库表结构

### 2.1 固定配置表

#### `annual_targets` — 年度计划目标

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| year | int | 年度 |
| project_type | text | 增量项目 / 存量项目 |
| project_scope | text | 市级 / 区县市州 / 其他 / 存量 |
| plan_contract | numeric | 全年计划签约 |
| plan_payment | numeric | 全年计划回款 |

对应数据：
| project_type | project_scope | plan_contract | plan_payment |
|------|------|------|------|
| 增量项目 | 市级 | 20,800,000 | 9,700,000 |
| 增量项目 | 区县市州 | 9,000,000 | 7,400,000 |
| 增量项目 | 其他 | 2,000,000 | 1,600,000 |
| 存量项目 | 存量 | 0 | 3,650,000 |

#### `staff` — 内部人员名单

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 姓名 |
| role | text | 角色（部门负责人/项目经理/销售/解决方案/售前/产品/研发/运营） |
| department | text | 所属部门 |
| is_active | boolean | 是否在职 |

#### `log_standards` — 日志标准

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| item_name | text | 子项名称 |
| project_phase | boolean | 是否适用于项目阶段 |
| opportunity_phase | boolean | 是否适用于商机阶段 |
| department_log | boolean | 是否适用于部门日志 |
| is_shared | boolean | 部门日志是否分摊（=是时计入分摊成本） |
| description | text | 填报说明 |

is_shared = true 的任务（分摊=是）：新就业群体、人民建议征集、行业协会商会、社会热点信息、两个覆盖、一张图、乘云会客厅、AI数字社区、市场营销

#### `project_opportunity_mapping` — 项目与商机编号映射

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| uid | text | $主表唯一标识 |
| project_name | text | 项目名称 |
| project_code | text | 项目编号 (TP...) |
| opportunity_code | text | 商机编号 (TB...) |
| opportunity_name | text | 商机名称 |

---

### 2.2 可变数据表（通过 Excel 导入更新）

#### `projects` — 项目全量台账

对应 Excel：【项目经理表】社工业务项目进展台账 - Sheet "全量台账"

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| seq | int | 序号 |
| region | text | 区域 |
| name | text | 项目名称 |
| code | text | 项目编号 (TP...) |
| project_type | text | 项目类型（新增/存量）|
| pm | text | 项目经理 |
| sales | text | 销售经理 |
| client | text | 甲方 |
| contract_amount | numeric | 合同金额（万元）|
| contract_date | date | 合同签订时间 |
| deadline | date | 履约截止时间 |
| received_payment | numeric | 已回款（万元）|
| pending_payment | numeric | 待回款（万元）|
| status | text | 项目状态（交付中/验收完成/已验收运维中/已结项）|
| est_external_dept | numeric | 预估外部部门投入（全量）|
| est_business_cost | numeric | 预估商务费用 |
| est_procurement_net | numeric | 预计外采投入（扣除商务和过单）|
| est_procurement_total | numeric | 预计外采投入（总量）|
| est_external_total | numeric | 预估外部投入总和（外部部门+外采）|
| est_internal | numeric | 预估内部投入 |
| actual_procurement | numeric | 已外采 |
| procurement_paid | numeric | 外采已付款 |
| procurement_pending | numeric | 外采待付款 |
| payment_note | text | 待付款说明 |
| external_dept_cost | numeric | 外部部门已发生成本 |
| internal_dept_cost | numeric | 内部部门已发生成本（日志）|
| reimbursement_cost | numeric | 报销成本 |
| total_cost_incurred | numeric | 项目已发生成本 |
| cost_progress | text | 项目成本进度 |
| progress_estimate | text | 项目进度预估 |
| risk | text | 项目风险 |
| quarterly_focus | text | 季度重点工作 |
| weekly_progress | text | 4.7-4.12周工作进展 |
| weekly_plan | text | 4.13-4.19工作计划 |
| total_plan_cost | numeric | 总计划成本（万元）【后续Excel补充列】|
| total_plan_delivery_cost | numeric | 总计划交付成本（万元）【后续Excel补充列】|
| total_plan_business_cost | numeric | 总计划商务成本（万元）【后续Excel补充列】|
| internal_to_external_project_cost | numeric | 部门人员投入非本部门项目人力成本（内部人员投到其他部门项目的工时金额）【待确认】|
| import_batch_id | uuid | 导入批次（关联溯源）|

#### `procurements` — 外采及付款计划跟踪

对应 Excel：【项目经理表】社工业务项目进展台账 - Sheet "外采及付款计划跟踪"

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| seq | int | 序号 |
| type | text | 外采类型（研发外采/运营外采/商务外采）|
| region | text | 所属区域 |
| project_name | text | 所属项目名称 |
| project_code | text | 所属项目编号 |
| pm | text | 项目经理 |
| status | text | 外采状态 |
| contract_name | text | 外采合同名称 |
| vendor | text | 外采单位 |
| contract_amount | numeric | 合同总金额 |
| cumulative_paid | numeric | 累计已付款 |
| q1_actual | numeric | Q1实际付款 |
| q2_estimated | numeric | Q2预计付款 |
| q3_estimated | numeric | Q3预计付款 |
| q4_estimated | numeric | Q4预计付款 |
| note | text | 外采说明 |
| import_batch_id | uuid | 导入批次 |

#### `acceptance_projects` — Q2验收项目

对应 Excel：【项目经理表】社工业务项目进展台账 - Sheet "Q2验收项目"

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| seq | int | 序号 |
| region | text | 区域 |
| name | text | 项目名称 |
| pm | text | 项目经理 |
| sales | text | 销售经理 |
| client | text | 甲方 |
| contract_amount | numeric | 合同金额 |
| contract_date | date | 合同签订时间 |
| deadline | date | 履约截止时间 |
| received_payment | numeric | 已回款 |
| pending_payment | numeric | 待回款 |
| acceptance_status | text | 验收情况 |
| payment_status | text | 回款情况 |
| risk | text | 风险 |
| import_batch_id | uuid | 导入批次 |

#### `opportunities` — 商机表

对应 Excel：【项目经理表】商机表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| seq | int | 序号 |
| region | text | 区县 |
| sales | text | 销售 |
| budget_match | text | 与市场的预算匹配 |
| next_step | text | 下一步工作 |
| opp_total_amount | numeric | 商机总额（万元）|
| expense_diff | numeric | 费用差额 |
| plan_estimated_total | numeric | 铺排测算商机总额 |
| scene_xingjiu | text | 新就业群体 |
| scene_renminjianyi | text | 人民建议征集 |
| scene_redian | text | 社会热点信息 |
| scene_yizhangtu | text | 一张图 |
| scene_lianggefugai | text | 两个覆盖 |
| scene_xiehui | text | 行业协会商会 |
| budget_status | text | 预算情况 |
| note | text | 备注 |
| market_next_step | text | 市场下一步工作 |
| import_batch_id | uuid | 导入批次 |

#### `project_logs` — 项目日志明细

对应 Excel：【OA】项目日志明细汇总（超管）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| project_name | text | 项目名称 |
| project_code | text | 项目编号 |
| pm | text | 项目经理 |
| department | text | 项目归属部门 |
| task_name | text | 任务名称 |
| content | text | 工作内容 |
| hours | numeric | 工时 |
| amount | numeric | 工时金额 |
| status | text | 流程状态 |
| reporter | text | 填报人 |
| reporter_dept | text | 填报部门 |
| date | date | 日期 |
| period_start | date | 日志开始日期 |
| period_end | date | 日志截止日期 |
| import_batch_id | uuid | 导入批次 |

#### `opportunity_logs` — 商机日志明细

对应 Excel：【OA】商机日志明细汇总（超管）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| opp_name | text | 商机名称 |
| opp_code | text | 商机编号 |
| sales | text | 销售经理 |
| sales_dept | text | 销售归属部门 |
| task_type | text | 任务类型 |
| content | text | 工作内容 |
| hours | numeric | 工时 |
| amount | numeric | 工时金额 |
| status | text | 流程状态 |
| reporter | text | 填报人 |
| reporter_dept | text | 填报部门 |
| date | date | 日期 |
| period_start | date | 日志开始日期 |
| period_end | date | 日志截止日期 |
| import_batch_id | uuid | 导入批次 |

#### `department_logs` — 部门日志明细

对应 Excel：【OA】部门日志明细汇总（超管）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| dept_name | text | 日志部门名称 |
| task_name | text | 日志任务名称 |
| content | text | 工作内容 |
| hours | numeric | 工时 |
| amount | numeric | 日志工时金额（部门内） |
| external_amount | numeric | 日志工时金额（部门外）【待确认用途】|
| status | text | 流程状态 |
| reporter | text | 填报人 |
| reporter_dept | text | 填报部门 |
| date | date | 日期 |
| period_start | date | 日志开始日期 |
| period_end | date | 日志截止日期 |
| import_batch_id | uuid | 导入批次 |

---

### 2.3 管理表

#### `manual_costs` — 手动录入的成本项

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| item | text | 项目（外包人员成本1/外包人员成本2/商务其他成本）|
| year | int | 年度 |
| quarter | int | 季度 |
| amount | numeric | 金额 |
| project_type | text | 增量/存量 |
| note | text | 备注 |

#### `import_batches` — 导入批次记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| file_name | text | 上传的文件名 |
| table_name | text | 导入的目标表名 |
| row_count | int | 导入行数 |
| uploaded_by | text | 上传人（超管/管理员）|
| uploaded_at | timestamp | 上传时间 |
| status | text | 状态（成功/失败/已回滚）|

---

## 三、成本计算规则

### 3.1 项目全量字段（32字段）与数据来源对照

#### 可直接从 Excel 列读取的字段

| # | 字段 | Excel 来源 |
|---|------|------|
| 1 | id | 项目编号 (TP...) |
| 2 | name | 项目名称 |
| 3 | district | 区域 |
| 4 | status | 项目状态（交付中/验收完成/已验收运维中/已结项）|
| 5 | projectType | 项目类型（新增/存量）|
| 6 | sales | 销售经理 |
| 7 | pm | 项目经理 |
| 8 | contractAmount | 合同金额 |
| 9 | receivedPayment | 已回款 |
| 10 | clientName | 甲方 |
| 11 | contractSignDate | 合同签订时间 |
| 12 | performanceDeadline | 履约截止时间 |
| 19 | actualDeliveryExternalDept | 外部部门已发生成本 |
| 24 | progress | 项目成本进度 |
| 29 | pendingPayment | 待回款 |
| 30 | pendingExternalPayment | 外采待付款 |
| 31 | pendingPaymentNote | 待付款说明 |
| 32 | projectRisk | 项目风险 |

#### 需要 Excel 补充列的字段

| # | 字段 | Excel 来源 |
|---|------|------|
| 13 | totalPlanCost | 总计划成本【后续 Excel 补充列】|
| 14 | totalPlanDeliveryCost | 总计划交付成本【后续 Excel 补充列】|
| 15 | totalPlanBusinessCost | 总计划商务成本【后续 Excel 补充列】|

#### 需要计算逻辑的复合字段

| # | 字段 | 计算公式 | 数据来源 |
|---|------|------|------|
| 16 | actualCost | actualInternalCost + actualDeliveryCost + actualBusinessCost | 见 3.2 |
| 17 | actualInternalCost | 部门人员投入本部门项目人力成本 + 部门日志向项目分摊成本 | 见 3.2 |
| 17b | internalToExternalProjectCost | 部门人员投入非本部门项目人力成本 | projects.internal_to_external_project_cost |
| 18 | actualDeliveryCost | actualDeliveryExternalDept + actualDeliveryExternalProcurement | 20 + 19 |
| 20 | actualDeliveryExternalProcurement | SUM(procurements where type=研发/运营外采, by project) | procurements 表 |
| 21 | actualBusinessCost | actualBusinessExternalProcurement + actualBusinessCentralProcurement | 22 + 23 |
| 22 | actualBusinessExternalProcurement | SUM(procurements where type=商务外采, by project) + 外包人员成本2 | procurements + manual_costs |
| 23 | actualBusinessCentralProcurement | 商务其他成本 | manual_costs |
| 25 | deliveryCostRatio | actualDeliveryCost / actualCost | 自动计算 |
| 26 | deliveryCostProgress | actualDeliveryCost / totalPlanDeliveryCost | 自动计算 |
| 27 | planProfitRate | (contractAmount - actualCost) / contractAmount | 自动计算 |
| — | managementCost | 部门人员投入本部门日志 + 外部门投入本部门日志 | department_logs 汇总 |
| — | deliveryCost | 部门人员投入本部门项目人力成本 + 部门日志向项目分摊成本 + actualDeliveryCost | 项目管理视角 |
| — | businessCost | actualBusinessCost | 实际商务成本 |

### 3.2 三项人力成本的计算逻辑

#### 部门人员投入本部门项目人力成本
```
来源：project_logs
条件：reporter ∈ staff.name AND department = '是'
汇总：SUM(amount)
公式：SUMIF(项目日志, 项目归属部门="是" AND 填报人∈内部人员, 工时金额)
```

#### 外部门投入本部门项目人力成本
```
来源：project_logs
条件：reporter ∉ staff.name
汇总：SUM(amount)
公式：SUM(项目日志中填报人不在内部名单的工时金额)
```

#### 部门人员投入非本部门项目人力成本
```
来源：project_logs
条件：reporter ∈ staff.name AND department = '非'
汇总：SUM(amount)
```

#### 部门日志向项目分摊成本
```
来源：department_logs + log_standards
条件：task_name ∈ log_standards.item_name AND log_standards.is_shared = true
汇总：SUM(amount)
公式：SUMIF(部门日志, 日志任务∈日志标准.分摊=是的任务名, 工时金额)
```

#### 外部门投入本部门日志
```
来源：department_logs
条件：reporter ∉ staff.name
汇总：SUM(external_amount)
注：external_amount 字段用途待确认（见待确认问题2）
```

### 3.3 预警规则

| 预警条件 | 预警动作 |
|------|------|
| 商务成本 > 10% | 该项目行标红 + ⚠️ |
| 交付成本（外）> 18.44% | 该项目行标红 + ⚠️ |
| 交付成本消耗进度 > 项目进度 | 进度列标红 |

---

## 四、Excel 导入工作流

### 4.1 导入流程

```
用户上传 Excel 文件
      ↓
系统识别文件类型（根据文件名/Sheet结构自动判断）
      ↓
预览数据（前10行 + 列映射确认）
      ↓
确认后导入 → 写入数据库 → 记录批次
      ↓
展示导入结果（成功行数、失败行数）
```

### 4.2 文件自动识别

| 文件名包含 | 目标表 |
|------|------|
| 商机日志明细汇总 | opportunity_logs |
| 项目日志明细汇总 | project_logs |
| 部门日志明细汇总 | 部门日志 | department_logs |
| 项目与商机编号映射 | project_opportunity_mapping |
| 社工业务项目进展台账 / 全量台账 | projects |
| 外采及付款计划跟踪 | procurements |
| Q2验收项目 | acceptance_projects |
| 商机表 | opportunities |
| 内部人员名单 | staff |
| 日志标准 | log_standards |

### 4.3 导入处理规则

- OA 导出 Excel 前1-2行为标题/元数据行，系统根据"数据源："关键字自动识别并跳过
- 合并单元格：openpyxl 读取后自动向下填充
- 整批导入在一个数据库事务中，失败则全部回滚
- 每条导入记录关联 `import_batch_id`，支持追溯

### 4.4 导入记录回溯

导入记录页面展示所有历史导入批次：
- 文件名、目标表、导入行数、时间、操作人
- 支持查看详情和撤销回滚

---

## 五、页面与菜单结构

### 5.1 完整菜单

```
├── 总览看板
├── 项目看板
├── 商机看板
│   ├── 漏斗分析
│   ├── 场景分布
│   └── 商机列表
├── 销售看板
├── 人员管理
│   ├── 人员工时总览
│   └── 人员列表
├── 导入管理
│   ├── 上传导入
│   └── 导入记录
└── 固定配置
    ├── 年度计划数据
    ├── 内部人员名单
    └── 日志标准
```

### 5.2 登录方式

系统启动时显示账号选择页面，输入超级管理员或管理员的固定密码即可使用。不设计管理后台。

---

## 六、前端改造方案

### 6.1 改造原则

保持现有 React 代码结构不变，替换 mock 数据为 Supabase API 调用。

### 6.2 新增文件结构

```
src/
├── lib/
│   └── supabase.ts       # Supabase 客户端初始化
├── api/
│   ├── projects.ts       # 项目相关 API
│   ├── opportunities.ts  # 商机相关 API
│   ├── overview.ts       # 总览看板 API
│   ├── sales.ts          # 销售看板 API
│   ├── staff.ts          # 人员管理 API
│   ├── cost.ts           # 成本计算 API
│   └── import.ts         # 导入相关 API
```

### 6.3 数据更新流程

```
Excel 导入 → Supabase 数据库 → 前端 API 调用 → 页面刷新展示新数据
```

---

## 七、后续扩展事项

以下内容在当前版本暂不实现，后续迭代添加：

1. 场景管理 — 统计各场景（新就业群体、人民建议征集等）的商机和项目分布
2. 角色权限后台 — 当前仅有内置两账号，后续如需可增加权限管理
3. 计划成本 Excel 列 — 待用户补充后映射到 totalPlanCost 等字段
4. 外部成本管理视角的完整看板展示 — 当前实现项目管理视角

---

## 八、待确认问题

以下问题需用户在后续阶段确认，实施时处理：

| # | 问题 | 说明 |
|---|------|------|
| 1 | department_logs.external_amount 的用途 | 原始部门日志中有一列"日志工时金额（部门外）"，用于哪些计算场景？ |
| 2 | 商机漏斗第三层"关联项目总额"取哪个字段 | 铺排测算商机总额 → 商机总额 → 关联项目总额，第三层取合同金额？已回款？还是其他？ |
