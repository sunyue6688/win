/**
 * 登录页面
 */
import { useState } from 'react';
import { Card, Form, Button, Typography, Space, Select, Toast } from '@douyinfe/semi-ui';
import { IconLock, IconUser } from '@douyinfe/semi-icons';
import { COLORS } from '../styles/theme';

const { Title, Text } = Typography;

interface Props {
  onLogin: (role: 'boss' | 'admin') => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: any) => {
    const { role, password } = values;
    setLoading(true);

    // 模拟简单验证逻辑
    setTimeout(() => {
      setLoading(false);
      if ((role === 'boss' && password === '888888') || (role === 'admin' && password === '666666')) {
        Toast.success('登录成功');
        onLogin(role);
      } else {
        Toast.error('密码错误，请重新输入');
      }
    }, 600);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    }}>
      <Card
        style={{ width: 400, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
             width: 48,
             height: 48,
             borderRadius: 12,
             backgroundColor: COLORS.primary,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             margin: '0 auto 16px',
          }}>
            <IconLock style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <Title heading={3}>成本管理系统</Title>
          <Text type="tertiary">请选择角色并输入密码登录</Text>
        </div>

        <Form layout="vertical" onSubmit={handleSubmit} labelPosition="top">
          <Form.Select
            field="role"
            label="账号角色"
            initValue="boss"
            placeholder="请选择角色"
            style={{ width: '100%' }}
            prefix={<IconUser />}
          >
            <Select.Option value="boss">超级管理员 (boss)</Select.Option>
            <Select.Option value="admin">管理员 (admin)</Select.Option>
          </Form.Select>

          <Form.Input
            field="password"
            label="登录密码"
            mode="password"
            placeholder="请输入密码"
            style={{ width: '100%' }}
            prefix={<IconLock />}
          />

          <Button
            theme="solid"
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginTop: 24, height: 40 }}
          >
            登录
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="quaternary" size="small">
            超级管理员：888888 | 管理员：666666
          </Text>
        </div>
      </Card>
    </div>
  );
}
