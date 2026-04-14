/**
 * 总览看板聚合计算
 */

import type { DataStoreState, ComputedProject } from './types';
import { DepartmentOverview, CostCategory } from '../mockData';

/**
 * 聚合部门总览数据
 */
export function computeOverview(
  state: DataStoreState,
  computedProjects: ComputedProject[]
): DepartmentOverview {
  // 1. 收入与利润汇总
  const contractRevenue = computedProjects.reduce((s, p) => s + p.contractAmount, 0);
  const actualRevenue = computedProjects.reduce((s, p) => s + p.receivedPayment, 0);
  const totalActualCost = computedProjects.reduce((s, p) => s + p.actualCost, 0);
  const totalPlanCost = computedProjects.reduce((s, p) => s + p.totalPlanCost, 0);
  
  // 年度计划收入 (来自 annualTargets)
  const planRevenue = state.annualTargets.reduce((s, t) => s + (t.plan_contract || 0), 0) / 10000;

  // 2. 成本分类树构建
  const costCategories: CostCategory[] = [
    {
      key: 'external',
      name: '外部成本',
      level: 1,
      plan: computedProjects.reduce((s, p) => s + (p.totalPlanDeliveryCost + p.totalPlanBusinessCost), 0),
      actual: computedProjects.reduce((s, p) => s + (p.actualDeliveryCost + p.actualBusinessCost), 0),
      q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
      children: [
        {
          key: 'delivery',
          name: '交付成本',
          level: 2,
          plan: computedProjects.reduce((s, p) => s + p.totalPlanDeliveryCost, 0),
          actual: computedProjects.reduce((s, p) => s + p.actualDeliveryCost, 0),
          q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
          children: [
            {
              key: 'delivery-external-dept',
              name: '外部门成本',
              level: 3,
              plan: 0, // 计划列在基础导入里暂缺
              actual: computedProjects.reduce((s, p) => s + p.actualDeliveryExternalDept, 0),
              q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
            },
            {
              key: 'delivery-external-proc',
              name: '外采成本',
              level: 3,
              plan: 0,
              actual: computedProjects.reduce((s, p) => s + p.actualDeliveryExternalProcurement, 0),
              q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
            }
          ]
        },
        {
          key: 'business',
          name: '商务成本',
          level: 2,
          plan: computedProjects.reduce((s, p) => s + p.totalPlanBusinessCost, 0),
          actual: computedProjects.reduce((s, p) => s + p.actualBusinessCost, 0),
          q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
          children: [
            {
              key: 'business-external-proc',
              name: '外采成本',
              level: 3,
              plan: 0,
              actual: computedProjects.reduce((s, p) => s + p.actualBusinessExternalProcurement, 0),
              q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
            },
            {
              key: 'business-central-proc',
              name: '集采',
              level: 3,
              plan: 0,
              actual: computedProjects.reduce((s, p) => s + p.actualBusinessCentralProcurement, 0),
              q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
            }
          ]
        }
      ]
    },
    {
      key: 'internal',
      name: '内部成本',
      level: 1,
      isInternal: true,
      plan: 0,
      actual: computedProjects.reduce((s, p) => s + p.actualInternalCost, 0),
      q1: 0, q2: 0, current: 0, remaining: 0, usagePct: 0,
    }
  ];

  // 计算树节点的汇总与百分比
  const fillStats = (cat: CostCategory) => {
    if (cat.children) {
      cat.children.forEach(fillStats);
      // 如果下级有 plan/actual，汇总到上级 (虽然这里我已经手动汇总了，但可以作为二次校准)
      // cat.plan = cat.children.reduce((s, c) => s + c.plan, 0);
      // cat.actual = cat.children.reduce((s, c) => s + c.actual, 0);
    }
    cat.usagePct = cat.plan > 0 ? (cat.actual / cat.plan) * 100 : 0;
    cat.remaining = cat.plan - cat.actual;
    cat.current = cat.actual;
  };
  costCategories.forEach(fillStats);

  // 3. 项目状态统计
  const projectStats = {
    total: computedProjects.length,
    inProgress: computedProjects.filter(p => p.status === '交付中').length,
    signed: computedProjects.filter(p => p.contractAmount > 0).length,
    pending: computedProjects.filter(p => p.status === '待评估' as any).length, // 兼容性字段
    completed: computedProjects.filter(p => p.status === '已结项').length,
    existing: computedProjects.filter(p => p.projectType === '存量').length,
    newProjects: computedProjects.filter(p => p.projectType === '新增').length,
    delivering: computedProjects.filter(p => p.status === '交付中').length,
    acceptanceDone: computedProjects.filter(p => p.status === '验收完成').length,
    maintenance: computedProjects.filter(p => p.status === '已验收运维中').length,
    closed: computedProjects.filter(p => p.status === '已结项').length,
  };

  return {
    year: new Date().getFullYear(),
    contractRevenue,
    actualRevenue,
    planRevenue,
    totalPlanCost,
    totalActualCost,
    costRatio: contractRevenue > 0 ? (totalPlanCost / contractRevenue) * 100 : 0,
    costRatioLimit: 30,
    actualProfit: contractRevenue - totalActualCost,
    planProfit: contractRevenue - totalPlanCost,
    costCategories,
    projectStats,
  };
}
