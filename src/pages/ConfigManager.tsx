/**
 * 固定配置管理
 */
import { useState } from 'react';
import { Card, Tabs, Typography, Space, Table, Button, Tag, Modal, Form, Input, Select } from '@douyinfe/semi-ui';
import { IconSetting, IconUserGroup, IconList, IconPlus } from '@douyinfe/semi-icons';
import { useStore } from '../lib/store';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function ConfigManager() {
  const { annualTargets, staff, logStandards, addStaff } = useStore();
  const [showAddStaff, setShowAddStaff] = useState(false);

  return (
    <div style={{ padding: 0 }}>
      <Title heading={3} style={{ marginBottom: 24 }}>固定配置</Title>

      <Tabs type="line">
        <TabPane tab={<Space><IconSetting />年度计划数据</Space>} itemKey="1">
          <Card style={{ marginTop: 16 }}>
            <Table
              dataSource={annualTargets}
              pagination={false}
              size="small"
              columns={[
                { title: '年份', dataIndex: 'year', key: 'year', render: () => '2026' },
                { title: '项目类型', dataIndex: 'project_type', key: 'type' },
                { title: '项目范围', dataIndex: 'project_scope', key: 'scope' },
                { title: '全期计划签约', dataIndex: 'plan_contract', key: 'contract', render: (v) => (v / 10000).toLocaleString() + ' 万' },
                { title: '全期计划回款', dataIndex: 'plan_payment', key: 'payment', render: (v) => (v / 10000).toLocaleString() + ' 万' },
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab={<Space><IconUserGroup />内部人员名单</Space>} itemKey="2">
          <Card style={{ marginTop: 16 }}>
            <Table
              dataSource={staff}
              pagination={{ pageSize: 15 }}
              size="small"
              columns={[
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '角色', dataIndex: 'role', key: 'role' },
                { title: '所属部门', dataIndex: 'department', key: 'dept' },
                {
                  title: '状态',
                  dataIndex: 'is_active',
                  key: 'status',
                  render: (v) => <Tag color={v === '是' ? 'green' : 'grey'}>{v === '是' ? '在职' : '离职'}</Tag>
                },
              ]}
            />
            <Button
              icon={<IconPlus />}
              theme="light"
              style={{ marginTop: 16 }}
              onClick={() => setShowAddStaff(true)}
            >
              添加人员
            </Button>

            <Modal
              title="添加人员"
              visible={showAddStaff}
              onOk={() => setShowAddStaff(false)}
              onCancel={() => setShowAddStaff(false)}
              footer={null}
            >
              <Form
                layout="vertical"
                onSubmit={(values: any) => {
                  addStaff(values);
                  setShowAddStaff(false);
                }}
              >
                <Form.Input field="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} />
                <Form.Select field="role" label="角色" style={{ width: '100%' }} rules={[{ required: true, message: '请选择角色' }]}>
                  <Select.Option value="项目经理">项目经理</Select.Option>
                  <Select.Option value="销售">销售</Select.Option>
                  <Select.Option value="研发">研发</Select.Option>
                  <Select.Option value="运营">运营</Select.Option>
                  <Select.Option value="售前">售前</Select.Option>
                  <Select.Option value="产品">产品</Select.Option>
                </Form.Select>
                <Form.Input field="department" label="所属部门" />
                <Button theme="solid" type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
                  确认添加
                </Button>
              </Form>
            </Modal>
          </Card>
        </TabPane>

        <TabPane tab={<Space><IconList />日志标准</Space>} itemKey="3">
          <Card style={{ marginTop: 16 }}>
            <Table
              dataSource={logStandards}
              pagination={{ pageSize: 15 }}
              size="small"
              columns={[
                { title: '子项名称', dataIndex: 'item_name', key: 'name' },
                { title: '是否分摊', dataIndex: 'is_shared', key: 'shared', render: (v) => (v === '是' || v === true ? <Tag color="blue">分摊</Tag> : <Text type="tertiary">不分摊</Text>) },
                { title: '填报说明', dataIndex: 'description', key: 'desc' },
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
