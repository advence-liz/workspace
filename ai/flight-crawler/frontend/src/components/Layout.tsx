import { useState } from 'react';
import { Layout as AntLayout, Menu, Drawer, Button, Grid, Modal, Input, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CompassOutlined, AimOutlined, DatabaseOutlined, UnorderedListOutlined, EnvironmentOutlined, GlobalOutlined, HddOutlined, MenuOutlined, FieldTimeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { getAdminToken, setAdminToken, clearAdminToken } from '@/utils/auth';

const { Header, Content } = AntLayout;
const { useBreakpoint } = Grid;

const ADMIN_PATHS = [
  '/flight-management',
  '/airport-management',
  '/data-management',
  '/cache-management',
  '/cron-management',
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const isAdmin = !!getAdminToken();

  const handleLogin = () => {
    if (!tokenInput.trim()) {
      message.warning('请输入 Token');
      return;
    }
    setAdminToken(tokenInput.trim());
    setLoginVisible(false);
    setTokenInput('');
    message.success('已进入管理模式');
    // 强制刷新以更新菜单
    window.location.reload();
  };

  const handleLogout = () => {
    clearAdminToken();
    // 如果当前在管理页面，跳回首页
    if (ADMIN_PATHS.some(p => location.pathname.startsWith(p))) {
      navigate('/destination');
    }
    message.info('已退出管理模式');
    window.location.reload();
  };

  const allMenuItems = [
    { key: '/destination', icon: <CompassOutlined />, label: '目的地查询' },
    { key: '/flight-map', icon: <GlobalOutlined />, label: '航线地图' },
    { key: '/route-planner', icon: <AimOutlined />, label: '行程规划' },
    { key: '/flight-management', icon: <UnorderedListOutlined />, label: '航班管理', adminOnly: true },
    { key: '/airport-management', icon: <EnvironmentOutlined />, label: '机场管理', adminOnly: true },
    { key: '/data-management', icon: <DatabaseOutlined />, label: '数据管理', adminOnly: true },
    { key: '/cache-management', icon: <HddOutlined />, label: '缓存管理', adminOnly: true },
    { key: '/cron-management', icon: <FieldTimeOutlined />, label: '定时任务', adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  const currentPath = location.pathname === '/' ? '/destination' : location.pathname;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 16px' : '0 50px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'white',
          fontSize: isMobile ? '16px' : '20px',
          marginRight: isMobile ? '16px' : '50px',
          whiteSpace: 'nowrap',
        }}>
          <img src="/logo.svg" alt="logo" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36 }} />
          {!isMobile && '随心飞分析工具'}
        </div>

        {isMobile ? (
          <>
            <span style={{ color: 'white', flex: 1, fontSize: 16 }}>随心飞分析工具</span>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ color: 'white' }}
            />
            <Drawer
              title="导航菜单"
              placement="right"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              footer={
                isAdmin
                  ? <Button danger icon={<LockOutlined />} block onClick={() => { setDrawerVisible(false); handleLogout(); }}>退出管理模式</Button>
                  : <Button icon={<UnlockOutlined />} block onClick={() => { setDrawerVisible(false); setLoginVisible(true); }}>进入管理模式</Button>
              }
            >
              <Menu
                mode="inline"
                selectedKeys={[currentPath]}
                items={menuItems}
                onClick={({ key }) => { navigate(key); setDrawerVisible(false); }}
              />
            </Drawer>
          </>
        ) : (
          <>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[currentPath]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ flex: 1, minWidth: 0 }}
            />
            {isAdmin ? (
              <Button
                type="text"
                icon={<LockOutlined />}
                onClick={handleLogout}
                style={{ color: '#faad14', marginLeft: 8, whiteSpace: 'nowrap' }}
              >
                退出管理
              </Button>
            ) : (
              <Button
                type="text"
                icon={<UnlockOutlined />}
                onClick={() => setLoginVisible(true)}
                style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 8, whiteSpace: 'nowrap' }}
              >
                管理员
              </Button>
            )}
          </>
        )}
      </Header>

      <Content style={{ padding: isMobile ? '16px' : '24px', background: '#f0f2f5' }}>
        <Outlet />
      </Content>

      <Modal
        title={<><UnlockOutlined /> 进入管理模式</>}
        open={loginVisible}
        onOk={handleLogin}
        onCancel={() => { setLoginVisible(false); setTokenInput(''); }}
        okText="确认"
        cancelText="取消"
      >
        <Input.Password
          placeholder="请输入管理员 Token"
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          onPressEnter={handleLogin}
          style={{ marginTop: 16 }}
          autoFocus
        />
      </Modal>
    </AntLayout>
  );
}

export default Layout;
