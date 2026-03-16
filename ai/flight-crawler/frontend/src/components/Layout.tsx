import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CompassOutlined, AimOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Header, Content } = AntLayout;

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/destination',
      icon: <CompassOutlined />,
      label: '目的地查询',
    },
    {
      key: '/route-planner',
      icon: <AimOutlined />,
      label: '行程规划',
    },
    {
      key: '/data-management',
      icon: <DatabaseOutlined />,
      label: '数据管理',
    },
  ];

  const currentPath = location.pathname === '/' ? '/destination' : location.pathname;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', marginRight: '50px' }}>
          ✈️ 随心飞分析工具
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}

export default Layout;
