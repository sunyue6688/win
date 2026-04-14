/**
 * 核心类型定义
 */

export interface ColumnMapping {
  excelHeader: string;
  dbField: string;
  type: 'text' | 'number' | 'date' | 'percent';
  required?: boolean;
}


export interface DataStoreState {
  projects: any[];
  procurements: any[];
  acceptanceProjects: any[];
  opportunities: any[];
  projectLogs: any[];
  opportunityLogs: any[];
  departmentLogs: any[];
  staff: any[];
  logStandards: any[];
  projectOpportunityMapping: any[];
  annualTargets: any[];
  manualCosts: any[];
  importBatches: any[];
}

export interface DataStoreContextType extends DataStoreState {
  importData: (tableName: string, rows: any[], fileName: string) => void;
  clearTable: (tableName: string) => void;
  rollbackBatch: (batchId: string) => void;
  addManualCost: (cost: any) => void;
  deleteManualCost: (id: string) => void;
}


export interface ProjectWarning {
  field: string;
  rule: string;
  message: string;
}

export interface ComputedProject {
  id: string;
  name: string;
  district: string;
  status: string;
  projectType: '存量' | '新增';
  sales: string;
  pm: string;
  clientName: string;
  contractSignDate: string;
  performanceDeadline: string;
  contractAmount: number;
  receivedPayment: number;
  pendingPayment: number;
  totalPlanCost: number;
  totalPlanDeliveryCost: number;
  totalPlanBusinessCost: number;
  actualCost: number;
  actualInternalCost: number;
  actualDeliveryCost: number;
  actualDeliveryExternalDept: number;
  actualDeliveryExternalProcurement: number;
  actualBusinessCost: number;
  actualBusinessExternalProcurement: number;
  actualBusinessCentralProcurement: number;
  progress: number;
  deliveryCostRatio: number;
  deliveryCostProgress: number;
  planProfitRate: number;
  externalHRRatioLimit: number;
  pendingExternalPayment: number;
  pendingPaymentNote: string;
  projectRisk: string;
  warnings: ProjectWarning[];
}
