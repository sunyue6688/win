/**
 * 手动成本录入
 */
import { useState } from 'react';
import { Card, Typography, Table, Button, Form, Select, InputNumber, Space, Tag } from '@douyinfe/semi-ui';
import { IconPlus, IconDelete } from '@douyinfe/semi-icons';
import { useStore } from '../lib/store';

const { Title } = Typography;

export default function ManualCostManager() {
  const { manualCosts, addManualCost, deleteManualCost } = useStore();

  const handleAdd = (values: any) => {
    addManualCost(values);
    // 简单实现，UI 自动刷新由于 DataStore state 改变
  };

  return (
    <div style={{ padding: 0 }}>
      <Title heading={3} style={{ marginBottom: 24 }}>手动成本录入</Title>

      <Card title="新增成本项" style={{ marginBottom: 24 }}>
        <Form layout="horizontal" labelPosition="top" onSubmit={handleAdd}>
          <Form.Select field="item" label="成本项" style={{ width: 180 }} placeholder="请选择">
            <Select.Option value="外包人员成本1">外包人员成本 1</Select.Option>
            <Select.Option value="外包人员成本2">外包人员成本 2</Select.Option>
            <Select.Option value="商务其他成本">商务其他成本</Select.Option>
          </Form.Select>
          <Form.Select field="year" label="年度" style={{ width: 100 }} initValue={2026}>
            <Select.Option value={2026}>2026</Select.Option>
            <Select.Option value={2025}>2025</Select.Option>
          </Form.Select>
          <Form.Select field="quarter" label="季度" style={{ width: 100 }} placeholder="请选择">
            <Select.Option value={1}>Q1</Select.Option>
            <Select.Option value={2}>Q2</Select.Option>
            <Select.Option value={3}>Q3</Select.Option>
            <Select.Option value={4}>Q4</Select.Option>
          </Form.Select>
          <Form.InputNumber field="amount" label="金额 (元)" style={{ width: 150 }} hideButtons />
          <Form.Select field="project_type" label="适用项目类型" style={{ width: 150 }} placeholder="请选择">
            <Select.Option value="新增">增量项目</Select.Option>
            <Select.Option value="存量">存量项目</Select.Option>
          </Form.Select>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
            <Button theme="solid" type="primary" htmlType="submit" icon={<IconPlus />}>添加</Button>
          </div>
        </Form>
      </Card>

      <Card title="已录入记录">
        <Table
          dataSource={manualCosts}
          size="small"
          pagination={false}
          columns={[
            { title: '成本项', dataIndex: 'item', key: 'item' },
            { title: '年度', dataIndex: 'year', key: 'year' },
            { title: '季度', dataIndex: 'quarter', key: 'quarter', render: (v) => `Q${v}` },
            { title: '适用类型', dataIndex: 'project_type', key: 'type', render: (v) => <Tag>{v}</Tag> },
            { title: '金额 (元)', dataIndex: 'amount', key: 'amount', align: 'right', render: (v) => v?.toLocaleString() },
            {
              title: '操作',
              key: 'action',
              render: (_: unknown, record: any) => (
                <Button
                  icon={<IconDelete />}
                  type="danger"
                  size="small"
                  onClick={() => deleteManualCost(record.id)}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
