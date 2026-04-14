/**
 * Excel 列映射配置中心
 * 将 Excel 中文表头映射为数据库/前端使用的标准字段名
 */

import type { ColumnMapping } from './types';

/**
 * 1. 项目全量台账 (projects)
 */
export const PROJECTS_MAPPING: ColumnMapping[] = [
  { excelHeader: '序号', dbField: 'seq', type: 'number' },
  { excelHeader: '区域', dbField: 'region', type: 'text', required: true },
  { excelHeader: '项目名称', dbField: 'name', type: 'text', required: true },
  { excelHeader: '项目编号', dbField: 'code', type: 'text' },
  { excelHeader: '项目类型', dbField: 'project_type', type: 'text' },
  { excelHeader: '项目经理', dbField: 'pm', type: 'text' },
  { excelHeader: '销售经理', dbField: 'sales', type: 'text' },
  { excelHeader: '甲方', dbField: 'client', type: 'text' },
  { excelHeader: '合同金额（万元）', dbField: 'contract_amount', type: 'number' },
  { excelHeader: '合同签订时间', dbField: 'contract_date', type: 'date' },
  { excelHeader: '履约截止时间', dbField: 'deadline', type: 'date' },
  { excelHeader: '已回款（万元）', dbField: 'received_payment', type: 'number' },
  { excelHeader: '待回款（万元）', dbField: 'pending_payment', type: 'number' },
  { excelHeader: '项目状态', dbField: 'status', type: 'text' },
  { excelHeader: '预估外部部门投入（全量）', dbField: 'est_external_dept', type: 'number' },
  { excelHeader: '预估商务费用', dbField: 'est_business_cost', type: 'number' },
  { excelHeader: '预计外采投入（扣除商务和过单）', dbField: 'est_procurement_net', type: 'number' },
  { excelHeader: '预计外采投入（总量）', dbField: 'est_procurement_total', type: 'number' },
  { excelHeader: '预估外部投入总和（外部部门+外采）', dbField: 'est_external_total', type: 'number' },
  { excelHeader: '预估内部投入', dbField: 'est_internal', type: 'number' },
  { excelHeader: '已外采', dbField: 'actual_procurement', type: 'number' },
  { excelHeader: '外采已付款', dbField: 'procurement_paid', type: 'number' },
  { excelHeader: '外采待付款', dbField: 'procurement_pending', type: 'number' },
  { excelHeader: '待付款说明', dbField: 'payment_note', type: 'text' },
  { excelHeader: '外部部门已发生成本', dbField: 'external_dept_cost', type: 'number' },
  { excelHeader: '内部部门已发生成本（日志）', dbField: 'internal_dept_cost', type: 'number' },
  { excelHeader: '报销成本', dbField: 'reimbursement_cost', type: 'number' },
  { excelHeader: '项目已发生成本', dbField: 'total_cost_incurred', type: 'number' },
  { excelHeader: '项目成本进度', dbField: 'cost_progress', type: 'text' },
  { excelHeader: '项目进度预估', dbField: 'progress_estimate', type: 'text' },
  { excelHeader: '项目风险', dbField: 'risk', type: 'text' },
  { excelHeader: '季度重点工作', dbField: 'quarterly_focus', type: 'text' },
  { excelHeader: '周工作进展', dbField: 'weekly_progress', type: 'text' },
  { excelHeader: '工作计划', dbField: 'weekly_plan', type: 'text' },
];

/**
 * 2. 外采及付款计划跟踪 (procurements)
 */
export const PROCUREMENTS_MAPPING: ColumnMapping[] = [
  { excelHeader: '序号', dbField: 'seq', type: 'number' },
  { excelHeader: '外采类型', dbField: 'type', type: 'text' },
  { excelHeader: '所属区域', dbField: 'region', type: 'text' },
  { excelHeader: '所属项目名称', dbField: 'project_name', type: 'text' },
  { excelHeader: '项目编号', dbField: 'project_code', type: 'text' },
  { excelHeader: '项目经理', dbField: 'pm', type: 'text' },
  { excelHeader: '外采状态', dbField: 'status', type: 'text' },
  { excelHeader: '外采合同名称', dbField: 'contract_name', type: 'text' },
  { excelHeader: '外采单位', dbField: 'vendor', type: 'text' },
  { excelHeader: '合同总金额', dbField: 'contract_amount', type: 'number' },
  { excelHeader: '累计已付款', dbField: 'cumulative_paid', type: 'number' },
  { excelHeader: 'Q1实际付款', dbField: 'q1_actual', type: 'number' },
  { excelHeader: 'Q2预计付款', dbField: 'q2_estimated', type: 'number' },
  { excelHeader: 'Q3预计付款', dbField: 'q3_estimated', type: 'number' },
  { excelHeader: 'Q4预计付款', dbField: 'q4_estimated', type: 'number' },
  { excelHeader: '备注', dbField: 'note', type: 'text' },
];

/**
 * 3. Q2验收项目 (acceptance_projects)
 */
export const ACCEPTANCE_MAPPING: ColumnMapping[] = [
  { excelHeader: '序号', dbField: 'seq', type: 'number' },
  { excelHeader: '区域', dbField: 'region', type: 'text' },
  { excelHeader: '项目名称', dbField: 'name', type: 'text' },
  { excelHeader: '项目经理', dbField: 'pm', type: 'text' },
  { excelHeader: '销售经理', dbField: 'sales', type: 'text' },
  { excelHeader: '甲方', dbField: 'client', type: 'text' },
  { excelHeader: '合同金额', dbField: 'contract_amount', type: 'number' },
  { excelHeader: '合同签订时间', dbField: 'contract_date', type: 'date' },
  { excelHeader: '履约截止时间', dbField: 'deadline', type: 'date' },
  { excelHeader: '已回款', dbField: 'received_payment', type: 'number' },
  { excelHeader: '待回款', dbField: 'pending_payment', type: 'number' },
  { excelHeader: '验收情况', dbField: 'acceptance_status', type: 'text' },
  { excelHeader: '回款情况', dbField: 'payment_status', type: 'text' },
  { excelHeader: '风险', dbField: 'risk', type: 'text' },
];

/**
 * 4. 商机表 (opportunities)
 */
export const OPPORTUNITIES_MAPPING: ColumnMapping[] = [
  { excelHeader: '序号', dbField: 'seq', type: 'number' },
  { excelHeader: '区县', dbField: 'region', type: 'text', required: true },
  { excelHeader: '销售', dbField: 'sales', type: 'text' },
  { excelHeader: '与市场的预算匹配', dbField: 'budget_match', type: 'text' },
  { excelHeader: '下一步工作', dbField: 'next_step', type: 'text' },
  { excelHeader: '商机总额（万元）', dbField: 'opp_total_amount', type: 'number' },
  { excelHeader: '费用差额', dbField: 'expense_diff', type: 'number' },
  { excelHeader: '铺排测算商机总额', dbField: 'plan_estimated_total', type: 'number' },
  { excelHeader: '新就业群体', dbField: 'scene_xingjiu', type: 'text' },
  { excelHeader: '人民建议征集', dbField: 'scene_renminjianyi', type: 'text' },
  { excelHeader: '社会热点信息', dbField: 'scene_redian', type: 'text' },
  { excelHeader: '一张图', dbField: 'scene_yizhangtu', type: 'text' },
  { excelHeader: '两个覆盖', dbField: 'scene_lianggefugai', type: 'text' },
  { excelHeader: '行业协会商会', dbField: 'scene_xiehui', type: 'text' },
  { excelHeader: '预算情况', dbField: 'budget_status', type: 'text' },
  { excelHeader: '备注', dbField: 'note', type: 'text' },
  { excelHeader: '市场下一步工作', dbField: 'market_next_step', type: 'text' },
];

/**
 * 5. 项目日志明细汇总 (project_logs)
 */
export const PROJECT_LOGS_MAPPING: ColumnMapping[] = [
  { excelHeader: '项目名称', dbField: 'project_name', type: 'text' },
  { excelHeader: '项目编号', dbField: 'project_code', type: 'text' },
  { excelHeader: '项目经理', dbField: 'pm', type: 'text' },
  { excelHeader: '项目归属部门', dbField: 'department', type: 'text' },
  { excelHeader: '任务名称', dbField: 'task_name', type: 'text' },
  { excelHeader: '工作内容', dbField: 'content', type: 'text' },
  { excelHeader: '工时', dbField: 'hours', type: 'number' },
  { excelHeader: '工时金额', dbField: 'amount', type: 'number' },
  { excelHeader: '流程状态', dbField: 'status', type: 'text' },
  { excelHeader: '填报人', dbField: 'reporter', type: 'text' },
  { excelHeader: '填报部门', dbField: 'reporter_dept', type: 'text' },
  { excelHeader: '日期', dbField: 'date', type: 'date' },
];

/**
 * 6. 商机日志明细汇总 (opportunity_logs)
 */
export const OPPORTUNITY_LOGS_MAPPING: ColumnMapping[] = [
  { excelHeader: '商机名称', dbField: 'opp_name', type: 'text' },
  { excelHeader: '商机编号', dbField: 'opp_code', type: 'text' },
  { excelHeader: '销售经理', dbField: 'sales', type: 'text' },
  { excelHeader: '销售归属部门', dbField: 'sales_dept', type: 'text' },
  { excelHeader: '任务类型', dbField: 'task_type', type: 'text' },
  { excelHeader: '工作内容', dbField: 'content', type: 'text' },
  { excelHeader: '工时', dbField: 'hours', type: 'number' },
  { excelHeader: '工时金额', dbField: 'amount', type: 'number' },
  { excelHeader: '流程状态', dbField: 'status', type: 'text' },
  { excelHeader: '填报人', dbField: 'reporter', type: 'text' },
  { excelHeader: '填报部门', dbField: 'reporter_dept', type: 'text' },
  { excelHeader: '日期', dbField: 'date', type: 'date' },
];

/**
 * 7. 部门日志明细汇总 (department_logs)
 */
export const DEPARTMENT_LOGS_MAPPING: ColumnMapping[] = [
  { excelHeader: '日志部门名称', dbField: 'dept_name', type: 'text' },
  { excelHeader: '日志任务名称', dbField: 'task_name', type: 'text' },
  { excelHeader: '工作内容', dbField: 'content', type: 'text' },
  { excelHeader: '工时', dbField: 'hours', type: 'number' },
  { excelHeader: '日志工时金额（部门内）', dbField: 'amount', type: 'number' },
  { excelHeader: '日志工时金额（部门外）', dbField: 'external_amount', type: 'number' },
  { excelHeader: '流程状态', dbField: 'status', type: 'text' },
  { excelHeader: '填报人', dbField: 'reporter', type: 'text' },
  { excelHeader: '填报部门', dbField: 'reporter_dept', type: 'text' },
  { excelHeader: '日期', dbField: 'date', type: 'date' },
];

/**
 * 8. 项目与商机编号映射 (project_opportunity_mapping)
 */
export const MAPPING_MAPPING: ColumnMapping[] = [
  { excelHeader: '主表唯一标识', dbField: 'uid', type: 'text' },
  { excelHeader: '项目名称', dbField: 'project_name', type: 'text' },
  { excelHeader: '项目编号', dbField: 'project_code', type: 'text' },
  { excelHeader: '商机编号', dbField: 'opportunity_code', type: 'text' },
  { excelHeader: '商机名称', dbField: 'opportunity_name', type: 'text' },
];

/**
 * 9. 内部人员名单 (staff)
 */
export const STAFF_MAPPING: ColumnMapping[] = [
  { excelHeader: '姓名', dbField: 'name', type: 'text', required: true },
  { excelHeader: '角色', dbField: 'role', type: 'text' },
  { excelHeader: '所属部门', dbField: 'department', type: 'text' },
  { excelHeader: '是否在职', dbField: 'is_active', type: 'text' }, // 映射后转 boolean
];

/**
 * 10. 日志标准 (log_standards)
 */
export const LOG_STANDARDS_MAPPING: ColumnMapping[] = [
  { excelHeader: '子项名称', dbField: 'item_name', type: 'text', required: true },
  { excelHeader: '是否适用于项目阶段', dbField: 'project_phase', type: 'text' },
  { excelHeader: '是否适用于商机阶段', dbField: 'opportunity_phase', type: 'text' },
  { excelHeader: '是否适用于部门日志', dbField: 'department_log', type: 'text' },
  { excelHeader: '是否分摊', dbField: 'is_shared', type: 'text' },
  { excelHeader: '填报说明', dbField: 'description', type: 'text' },
];

/**
 * 表映射字典
 */
export const TABLE_MAP_CONFIG: Record<string, ColumnMapping[]> = {
  projects: PROJECTS_MAPPING,
  procurements: PROCUREMENTS_MAPPING,
  acceptance_projects: ACCEPTANCE_MAPPING,
  opportunities: OPPORTUNITIES_MAPPING,
  project_logs: PROJECT_LOGS_MAPPING,
  opportunity_logs: OPPORTUNITY_LOGS_MAPPING,
  department_logs: DEPARTMENT_LOGS_MAPPING,
  project_opportunity_mapping: MAPPING_MAPPING,
  staff: STAFF_MAPPING,
  log_standards: LOG_STANDARDS_MAPPING,
};

/**
 * 文件名自动识别规则
 */
export const FILE_NAME_CONTAINS: Record<string, string> = {
  '社工业务项目进展台账': 'projects',
  '全量台账': 'projects',
  '外采及付款计划跟踪': 'procurements',
  'Q2验收项目': 'acceptance_projects',
  '商机表': 'opportunities',
  '项目日志明细汇总': 'project_logs',
  '商机日志明细汇总': 'opportunity_logs',
  '部门日志明细汇总': 'department_logs',
  '项目与商机编号映射': 'project_opportunity_mapping',
  '内部人员名单': 'staff',
  '日志标准': 'log_standards',
};
