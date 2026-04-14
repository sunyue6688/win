/**
 * 成本计算引擎
 * 基于设计文档 §3 实现 32 字段全量项目数据计算
 */

import type { DataStoreState, ComputedProject, ProjectWarning } from './types';

/**
 * 计算全量项目数据
 */
export function computeProjects(state: DataStoreState): ComputedProject[] {
  const {
    projects,
    projectLogs,
    departmentLogs,
    procurements,
    manualCosts,
    staff,
    logStandards,
  } = state;

  // 如果没有导入数据，返回空数组（或者后续可以决定是否 fallback 到 mock）
  if (!projects || projects.length === 0) return [];

  const internalStaffNames = new Set(staff.map(s => s.name));
  const sharedLogTaskNames = new Set(
    logStandards.filter(s => s.is_shared === '是' || s.is_shared === true).map(s => s.item_name)
  );

  // 1. 计算部门分摊成本总额
  // SUMIF(部门日志, 任务名在分摊标准中, 金额)
  const totalSharedDeptCost = departmentLogs
    .filter(log => sharedLogTaskNames.has(log.task_name))
    .reduce((sum, log) => sum + (log.amount || 0), 0);
  
  // 均摊到每个项目 (暂时简单均摊，后续可按比例)
  const perProjectSharedCost = projects.length > 0 ? totalSharedDeptCost / projects.length : 0;

  return projects.map(p => {
    // A. 基础字段映射
    const contractAmount = p.contract_amount || 0;
    const receivedPayment = p.received_payment || 0;
    const totalPlanDeliveryCost = p.total_plan_delivery_cost || p.est_external_total || 0;
    const totalPlanCost = p.total_plan_cost || (p.est_external_total + p.est_internal) || 0;

    // B. 实际成本拆解
    
    // 1. 内部人力成本 (project_logs 中内部人员且归属本部门的金额)
    const internalHRCost = projectLogs
      .filter(log => log.project_code === p.code || log.project_name === p.name)
      .filter(log => internalStaffNames.has(log.reporter) && log.department === '是')
      .reduce((sum, log) => sum + (log.amount || 0), 0);
    
    const actualInternalCost = (internalHRCost / 10000) + perProjectSharedCost; // 转换为万元

    // 2. 实际交付成本 = 外部部门已发生 (projects 表列) + 外采合同 (procurements 研发/运营外采)
    const externalDeptIncurred = p.external_dept_cost || 0;
    const externalProcurementIncurred = procurements
      .filter(pr => pr.project_code === p.code || pr.project_name === p.name)
      .filter(pr => pr.type === '研发外采' || pr.type === '运营外采')
      .reduce((sum, pr) => sum + (pr.cumulative_paid || 0), 0) / 10000;

    const actualDeliveryCost = externalDeptIncurred + externalProcurementIncurred;

    // 3. 实际商务成本 = 外采合同 (商务外采) + 手动录入 (外包人员成本2 + 商务其他)
    const businessProcurementIncurred = procurements
      .filter(pr => pr.project_code === p.code || pr.project_name === p.name)
      .filter(pr => pr.type === '商务外采')
      .reduce((sum, pr) => sum + (pr.cumulative_paid || 0), 0) / 10000;
    
    // 手动录入的分摊（暂时分摊到所有项目，或匹配项目类型）
    const manualBusinessCost = manualCosts
      .filter(c => (c.item === '外包人员成本2' || c.item === '商务其他成本') && c.project_type === p.project_type)
      .reduce((sum, c) => sum + (c.amount || 0), 0) / (projects.filter(proj => proj.project_type === p.project_type).length || 1);

    const actualBusinessCost = businessProcurementIncurred + manualBusinessCost;

    // 4. 总成本
    const actualCost = actualInternalCost + actualDeliveryCost + actualBusinessCost;

    // C. 指标计算
    const progress = parseFloat(String(p.progress_estimate).replace('%', '')) || 0;
    const deliveryCostRatio = actualCost > 0 ? (actualDeliveryCost / actualCost) * 100 : 0;
    const deliveryCostProgress = totalPlanDeliveryCost > 0 ? (actualDeliveryCost / totalPlanDeliveryCost) * 100 : 0;
    const planProfitRate = contractAmount > 0 ? ((contractAmount - actualCost) / contractAmount) * 100 : 0;

    // D. 预警判定
    const warnings: ProjectWarning[] = [];
    if (actualBusinessCost / contractAmount > 0.10) {
      warnings.push({ field: 'actualBusinessCost', rule: '>10%', message: '商务成本占比超过 10%' });
    }
    if (actualDeliveryCost / contractAmount > 0.1844) {
      warnings.push({ field: 'actualDeliveryCost', rule: '>18.44%', message: '交付外部成本占比超过 18.44%' });
    }
    if (deliveryCostProgress > progress) {
      warnings.push({ field: 'deliveryCostProgress', rule: '>projectProgress', message: '交付成本消耗进度超过项目进度' });
    }

    return {
      id: p.code || p.id,
      name: p.name,
      district: p.region,
      status: p.status,
      projectType: p.project_type,
      sales: p.sales,
      pm: p.pm,
      clientName: p.client,
      contractSignDate: p.contract_date,
      performanceDeadline: p.deadline,
      contractAmount,
      receivedPayment,
      pendingPayment: p.pending_payment || 0,
      totalPlanCost,
      totalPlanDeliveryCost,
      totalPlanBusinessCost: p.total_plan_business_cost || p.est_business_cost || 0,
      actualCost,
      actualInternalCost,
      actualDeliveryCost,
      actualDeliveryExternalDept: externalDeptIncurred,
      actualDeliveryExternalProcurement: externalProcurementIncurred,
      actualBusinessCost,
      actualBusinessExternalProcurement: businessProcurementIncurred,
      actualBusinessCentralProcurement: manualBusinessCost,
      progress,
      deliveryCostRatio,
      deliveryCostProgress,
      planProfitRate,
      externalHRRatioLimit: p.external_hr_limit || 30,
      pendingExternalPayment: p.procurement_pending || 0,
      pendingPaymentNote: p.payment_note || '',
      projectRisk: p.risk || '',
      warnings,
    } as ComputedProject;
  });
}
