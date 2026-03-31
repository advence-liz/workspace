import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  message,
  Table,
  Modal,
  Select,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Switch,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
  queryAirportsWithPagination,
  updateAirport,
  deleteAirport,
  batchDeleteAirports,
  getAirportStats,
  type Airport,
  type AirportStats,
} from '@/api/airport';

const { Title, Paragraph } = Typography;

function AirportManagement() {
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<any>({});
  const [sorter] = useState<any>({
    sortBy: 'name',
    sortOrder: 'ASC',
  });

  // 编辑模态框
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // 统计模态框
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [airportStats, setAirportStats] = useState<AirportStats | null>(null);

  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    enabledCount: 0,
    disabledCount: 0,
    totalFlights: 0,
  });

  // 首次加载机场数据
  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async (
    page?: number,
    pageSize?: number,
    newFilters?: any,
    newSorter?: any,
  ) => {
    setLoading(true);
    try {
      const currentPage = page ?? pagination.current;
      const currentPageSize = pageSize ?? pagination.pageSize;
      const currentFilters = newFilters ?? filters;
      const currentSorter = newSorter ?? sorter;

      const params: any = {
        page: currentPage,
        pageSize: currentPageSize,
        ...currentFilters,
        ...currentSorter,
      };

      const result = await queryAirportsWithPagination(params);

      setAirports(result.airports);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });

      // 计算统计数据
      const enabledCount = result.airports.filter((a) => a.enableCrawl).length;
      const disabledCount = result.airports.filter((a) => !a.enableCrawl).length;

      setStats({
        total: result.total,
        enabledCount,
        disabledCount,
        totalFlights: 0, // 后续计算
      });
    } catch (error) {
      message.error('加载机场数据失败');
      console.error('加载机场数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (values: any) => {
    const newFilters: any = {};

    if (values.city) newFilters.city = values.city;
    if (values.name) newFilters.name = values.name;
    if (values.enableCrawl !== undefined) newFilters.enableCrawl = values.enableCrawl;

    setFilters(newFilters);
    loadAirports(1, pagination.pageSize, newFilters, sorter);
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters({});
    loadAirports(1, pagination.pageSize, {}, sorter);
  };

  // 编辑机场
  const handleEditAirport = (record: Airport) => {
    setSelectedAirport(record);
    editForm.setFieldsValue({
      name: record.name,
      city: record.city,
      enableCrawl: record.enableCrawl,
    });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedAirport) return;

      await updateAirport(selectedAirport.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      loadAirports(pagination.current, pagination.pageSize, filters, sorter);
    } catch (error) {
      console.error('保存失败', error);
    }
  };

  // 快速切换启用状态
  const handleToggleEnable = async (record: Airport) => {
    try {
      await updateAirport(record.id, { enableCrawl: !record.enableCrawl });
      message.success('更新成功');
      loadAirports(pagination.current, pagination.pageSize, filters, sorter);
    } catch (error) {
      message.error('更新失败');
      console.error('更新失败', error);
    }
  };

  // 查看统计
  const handleViewStats = async (record: Airport) => {
    try {
      const stats = await getAirportStats(record.id);
      setAirportStats(stats);
      setStatsModalVisible(true);
    } catch (error) {
      message.error('获取统计信息失败');
      console.error('获取统计信息失败', error);
    }
  };

  // 删除机场
  const handleDeleteAirport = (record: Airport) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除机场 "${record.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAirport(record.id);
          message.success('删除成功');
          loadAirports(pagination.current, pagination.pageSize, filters, sorter);
        } catch (error) {
          message.error('删除失败');
          console.error('删除失败', error);
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的机场');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个机场吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteAirports(selectedRowKeys as number[]);
          message.success(`成功删除 ${selectedRowKeys.length} 个机场`);
          setSelectedRowKeys([]);
          loadAirports(1, pagination.pageSize, filters, sorter);
        } catch (error) {
          message.error('删除失败');
          console.error('删除失败', error);
        }
      },
    });
  };

  // 导出 Excel
  const handleExportExcel = () => {
    if (airports.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    const exportData = airports.map((airport) => ({
      '机场名': airport.name,
      '城市': airport.city,
      '启用状态': airport.enableCrawl ? '启用' : '禁用',
      '发现时间': dayjs(airport.discoveredAt).format('YYYY-MM-DD HH:mm:ss'),
      '更新时间': dayjs(airport.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '机场数据');

    // 设置列宽
    const columnWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `机场数据_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success('导出成功');
  };

  // 表格列定义
  const columns: ColumnsType<Airport> = [
    {
      title: '机场名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: '启用状态',
      dataIndex: 'enableCrawl',
      key: 'enableCrawl',
      width: 120,
      render: (enableCrawl: boolean, record: Airport) => (
        <Switch
          checked={enableCrawl}
          onChange={() => handleToggleEnable(record)}
          disabled
        />
      ),
    },
    {
      title: '发现时间',
      dataIndex: 'discoveredAt',
      key: 'discoveredAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: Airport) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewStats(record)}
          >
            统计
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAirport(record)}
            disabled
          >
            编辑
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAirport(record)}
            disabled
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>机场管理</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总机场数"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="启用数"
              value={stats.enabledCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="禁用数"
              value={stats.disabledCount}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="关联航班"
              value={airports.length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选表单 */}
      <Card style={{ marginBottom: '24px' }}>
        <Form
          form={filterForm}
          layout="vertical"
          onValuesChange={handleFilterChange}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="name" label="机场名">
                <Input
                  placeholder="输入机场名"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="city" label="城市">
                <Input
                  placeholder="输入城市名"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="enableCrawl" label="启用状态">
                <Select
                  placeholder="选择启用状态"
                  allowClear
                  options={[
                    { label: '启用', value: true },
                    { label: '禁用', value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ paddingTop: '32px' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => loadAirports(1, pagination.pageSize, filters, sorter)}
                >
                  查询
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilters}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExportExcel}
          >
            导出 Excel
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={airports}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 个机场`,
          }}
          onChange={(newPagination, _, newSorter) => {
            const newSorterObj: any = {};
            if (newSorter && 'field' in newSorter && newSorter.field) {
              newSorterObj.sortBy = newSorter.field;
              newSorterObj.sortOrder = newSorter.order === 'ascend' ? 'ASC' : 'DESC';
            }
            loadAirports(
              newPagination.current,
              newPagination.pageSize,
              filters,
              newSorterObj.sortBy ? newSorterObj : sorter,
            );
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title="编辑机场"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="机场名"
            rules={[{ required: true, message: '请输入机场名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="enableCrawl"
            label="启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 统计信息模态框 */}
      <Modal
        title="机场统计"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
      >
        {airportStats && (
          <div>
            <Paragraph>
              <strong>机场名：</strong> {airportStats.airportName}
            </Paragraph>
            <Paragraph>
              <strong>城市：</strong> {airportStats.city}
            </Paragraph>
            <Paragraph>
              <strong>启用状态：</strong>{' '}
              <Tag color={airportStats.enableCrawl ? 'green' : 'default'}>
                {airportStats.enableCrawl ? '启用' : '禁用'}
              </Tag>
            </Paragraph>
            <Paragraph>
              <strong>总关联航班数：</strong> {airportStats.totalFlights}
            </Paragraph>
            <Paragraph>
              <strong>作为出发地的航班数：</strong> {airportStats.asOriginCount}
            </Paragraph>
            <Paragraph>
              <strong>作为目的地的航班数：</strong> {airportStats.asDestinationCount}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AirportManagement;
