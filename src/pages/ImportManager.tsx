import { useState, useRef, useMemo } from 'react';
import { Card, Typography, Button, Toast, Table, Space, Tag, Tabs, Empty } from '@douyinfe/semi-ui';
import { IconUpload, IconDelete, IconHistory, IconImport } from '@douyinfe/semi-icons';
import * as XLSX from 'xlsx';
import { useStore } from '../lib/store';
import { FILE_NAME_CONTAINS, TABLE_MAP_CONFIG } from '../lib/excelMapping';
import type { ColumnMapping } from '../lib/types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ========== 类型定义 ==========

interface PreviewData {
  fileName: string;
  tableName: string;
  tableLabel: string;
  columns: any[];
  rows: Record<string, any>[];
  rawHeaders: string[]; // 原始 Excel 表头
}

// ========== 辅助函数 ==========

/**
 * 识别目标表
 */
function matchTable(fileName: string): { table: string; label: string } | null {
  for (const [keyword, table] of Object.entries(FILE_NAME_CONTAINS)) {
    if (fileName.includes(keyword)) {
      // 简单根据表名返回一个中文标签（也可以从 excelMapping 获取更多信息）
      const labels: Record<string, string> = {
        projects: '项目全量台账',
        procurements: '外采及付款计划',
        acceptance_projects: 'Q2验收项目',
        opportunities: '商机表',
        project_logs: '项目日志明细',
        opportunity_logs: '商机日志明细',
        department_logs: '部门日志明细汇总',
        project_opportunity_mapping: '项目与商机编号映射',
        staff: '内部人员名单',
        log_standards: '日志标准',
      };
      return { table, label: labels[table] || table };
    }
  }
  return null;
}

// ========== 主组件 ==========

export default function ImportManager() {
  const { importData, importBatches, rollbackBatch } = useStore();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- 选择文件 ----------
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // ---------- 文件选中后解析 ----------
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const matched = matchTable(fileName);

    if (!matched) {
      Toast.warning({
        content: `未识别文件对应的数据表。请确保文件名包含：台账、外采、商机、日志、映射 等`,
        duration: 5,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const mapping = TABLE_MAP_CONFIG[matched.table];
    if (!mapping) {
      Toast.error(`未配置表「${matched.table}」的列映射`);
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 策略：跳过前几行元数据行
        // 先获取全量数据（含表头）
        const tempJson: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        // 寻找到达标题行的 index (根据匹配程度判断)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(tempJson.length, 10); i++) {
          const row = tempJson[i];
          const matchCount = mapping.filter(m => row.includes(m.excelHeader)).length;
          if (matchCount >= mapping.length * 0.3 || matchCount >= 3) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          Toast.error('未能识别 Excel 中的列标题，请确认模板是否正确');
          return;
        }

        const rawHeaders = tempJson[headerRowIndex] as string[];
        const dataRows = tempJson.slice(headerRowIndex + 1);

        // 转换为对象并映射字段
        const normalizedRows = dataRows.map(row => {
          const obj: Record<string, any> = {};
          mapping.forEach(m => {
            const colIndex = rawHeaders.indexOf(m.excelHeader);
            if (colIndex !== -1) {
              let val = row[colIndex];
              // 简单类型转换
              if (m.type === 'number') val = parseFloat(String(val).replace(/,/g, '')) || 0;
              if (m.type === 'date' && typeof val === 'number') {
                // SheetJS 数字日期转字符串
                const date = XLSX.SSF.parse_date_code(val);
                val = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
              }
              obj[m.dbField] = val;
            }
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v !== '' && v !== 0 && v !== undefined));

        setPreview({
          fileName,
          tableName: matched.table,
          tableLabel: matched.label,
          rawHeaders: rawHeaders.filter(h => h),
          columns: mapping.map(m => ({
            title: m.excelHeader,
            dataIndex: m.dbField,
            key: m.dbField,
            width: 120,
          })),
          rows: normalizedRows,
        });

        Toast.success(`解析成功：识别到 ${normalizedRows.length} 条数据`);
      } catch (err) {
        console.error(err);
        Toast.error('文件解析失败');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsArrayBuffer(file);
  };

  // ---------- 执行导入 ----------
  const handleConfirmImport = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      importData(preview.tableName, preview.rows, preview.fileName);
      setPreview(null);
      setActiveTab('2'); // 切换到记录页
    } catch (err) {
      Toast.error('导入失败');
    } finally {
      setLoading(false);
    }
  };

  // ========== 渲染 ==========

  return (
    <div style={{ padding: 0 }}>
      <Title heading={3} style={{ marginBottom: 24 }}>导入管理</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="line">
        <TabPane tab={<Space><IconImport />上传导入</Space>} itemKey="1">
          <div style={{ marginTop: 20 }}>
            <Card
              style={{
                border: '2px dashed #E5E7EB',
                background: '#FAFAF9',
                textAlign: 'center',
                padding: '40px 0',
                cursor: 'pointer',
              }}
              onClick={handleSelectFile}
            >
              <IconUpload size="extra-large" style={{ color: '#94A3B8', fontSize: 48, marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>点击选择 Excel 文件进行解析</div>
              <Text type="tertiary" size="small" style={{ marginTop: 8, display: 'block' }}>
                系统将自动跳过头部元数据行，并根据预设规则进行列映射
              </Text>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
              />
            </Card>

            {preview && (
              <Card
                title={
                  <Space>
                    <Text strong>数据预览</Text>
                    <Tag color="blue">{preview.tableLabel}</Tag>
                    <Text type="tertiary">识别成功 {preview.rows.length} 行</Text>
                  </Space>
                }
                style={{ marginTop: 24 }}
                headerExtraContent={
                  <Space>
                    <Button type="tertiary" onClick={() => setPreview(null)}>取消</Button>
                    <Button theme="solid" type="primary" loading={loading} onClick={handleConfirmImport}>
                      确认导入
                    </Button>
                  </Space>
                }
              >
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  <Table
                    dataSource={preview.rows.slice(0, 10)}
                    columns={preview.columns}
                    pagination={false}
                    size="small"
                    rowKey={(_, i) => String(i)}
                  />
                </div>
                {preview.rows.length > 10 && (
                  <Text type="tertiary" size="small" style={{ marginTop: 12, display: 'block' }}>
                    仅预览前 10 条数据...
                  </Text>
                )}
              </Card>
            )}
          </div>
        </TabPane>

        <TabPane tab={<Space><IconHistory />导入记录</Space>} itemKey="2">
          <div style={{ marginTop: 20 }}>
            {importBatches.length === 0 ? (
              <Empty description="暂无导入记录" />
            ) : (
              <Table
                dataSource={importBatches}
                pagination={{ pageSize: 10 }}
                size="small"
                rowKey="id"
                columns={[
                  { title: '导入时间', dataIndex: 'uploaded_at', key: 'time', render: (t) => new Date(t).toLocaleString() },
                  { title: '文件名', dataIndex: 'file_name', key: 'fileName' },
                  { title: '目标表', dataIndex: 'table_name', key: 'table' },
                  { title: '行数', dataIndex: 'row_count', key: 'count' },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s) => <Tag color={s === '成功' ? 'green' : 'orange'}>{s}</Tag>
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (record) => (
                      <Button
                        disabled={record.status === '已回滚'}
                        type="danger"
                        size="small"
                        onClick={() => rollbackBatch(record.id)}
                      >
                        回退
                      </Button>
                    )
                  }
                ]}
              />
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}
