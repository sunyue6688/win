import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DataStoreState, DataStoreContextType, ColumnMapping } from './types';
import { supabase } from './supabase';
import { Toast } from '@douyinfe/semi-ui';

// ========== Context 创建 ==========

const StoreContext = createContext<DataStoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// ========== Table 列表 ==========
const BUSINESS_TABLES = [
  'projects', 'procurements', 'acceptance_projects', 'opportunities',
  'project_logs', 'opportunity_logs', 'department_logs', 'staff',
  'log_standards', 'project_opportunity_mapping', 'manual_costs'
];

// ========== Provider 组件 ==========

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DataStoreState>({
    projects: [],
    procurements: [],
    acceptanceProjects: [],
    opportunities: [],
    projectLogs: [],
    opportunityLogs: [],
    departmentLogs: [],
    staff: [],
    logStandards: [],
    projectOpportunityMapping: [],
    annualTargets: [
      { project_type: '增量项目', project_scope: '市级', plan_contract: 20800000, plan_payment: 9700000 },
      { project_type: '增量项目', project_scope: '区县市州', plan_contract: 9000000, plan_payment: 7400000 },
      { project_type: '增量项目', project_scope: '其他', plan_contract: 2000000, plan_payment: 1600000 },
      { project_type: '存量项目', project_scope: '存量', plan_contract: 0, plan_payment: 3650000 },
    ],
    manualCosts: [],
    importBatches: [],
  });

  // 1. 初始化从 Supabase 加载全量数据
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const newState: Partial<DataStoreState> = {};

      // 并行加载所有表
      const results = await Promise.all([
        ...BUSINESS_TABLES.map(table => supabase.from(table).select('*')),
        supabase.from('import_batches').select('*').order('uploaded_at', { ascending: false })
      ]);

      BUSINESS_TABLES.forEach((table, index) => {
        let actualKey = table;
        if (table === 'acceptance_projects') actualKey = 'acceptanceProjects';
        if (table === 'project_logs') actualKey = 'projectLogs';
        if (table === 'opportunity_logs') actualKey = 'opportunityLogs';
        if (table === 'department_logs') actualKey = 'departmentLogs';
        if (table === 'project_opportunity_mapping') actualKey = 'projectOpportunityMapping';
        if (table === 'log_standards') actualKey = 'logStandards';
        if (table === 'manual_costs') actualKey = 'manualCosts';
        
        const result = results[index];
        (newState as any)[actualKey] = result?.data || [];
      });

      const batchResult = results[results.length - 1];
      newState.importBatches = batchResult?.data || [];

      setState(prev => ({ ...prev, ...newState }));
    } catch (error) {
      console.error('Supabase fetch error:', error);
      // Fallback
      try {
        const saved = localStorage.getItem('win6688_datastore');
        if (saved) setState(JSON.parse(saved));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const importData = async (tableName: string, rows: any[], fileName: string) => {
    const batchId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
    const newBatch = {
      id: batchId,
      file_name: fileName,
      table_name: tableName,
      row_count: rows.length,
      uploaded_at: new Date().toISOString(),
      status: '成功',
    };

    try {
      await supabase.from('import_batches').insert(newBatch);
      const rowsWithBatch = rows.map(r => ({ ...r, import_batch_id: batchId }));
      const { error } = await supabase.from(tableName).insert(rowsWithBatch);
      if (error) throw error;
      Toast.success(`成功导入 ${rows.length} 条记录`);
      fetchAllData();
    } catch (error: any) {
      console.error('Import failed:', error);
      Toast.error('导入失败: ' + error.message);
    }
  };

  const clearTable = async (tableName: string) => {
    try {
      const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      fetchAllData();
    } catch (error: any) {
      Toast.error('操作失败: ' + error.message);
    }
  };

  const rollbackBatch = async (batchId: string) => {
    try {
      const batch = state.importBatches.find(b => b.id === batchId);
      if (!batch) return;
      
      const { error: dataError } = await supabase
        .from(batch.table_name)
        .delete()
        .eq('import_batch_id', batchId);
      
      if (dataError) throw dataError;

      await supabase
        .from('import_batches')
        .update({ status: '已回滚' })
        .eq('id', batchId);

      Toast.success('回滚成功');
      fetchAllData();
    } catch (error: any) {
      Toast.error('回滚失败: ' + error.message);
    }
  };

  const addManualCost = async (cost: any) => {
    try {
      const { error } = await supabase.from('manual_costs').insert(cost);
      if (error) throw error;
      fetchAllData();
    } catch (error: any) {
      Toast.error('添加失败: ' + error.message);
    }
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      importData,
      clearTable,
      rollbackBatch,
      addManualCost,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
