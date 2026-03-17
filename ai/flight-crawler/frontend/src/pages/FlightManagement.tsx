import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  message,
  Table,
  Modal,
  DatePicker,
  Select,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
  queryFlightsWithPagination,
  updateFlight,
  deleteFlight,
  batchDeleteFlights,
  getAvailableCities,
  type Flight,
} from '@/api/flight';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// 获取权益卡类型的完整说明
const getCardTypeDescription = (cardType: string): string => {
  if (cardType === '666权益卡航班') {
    return '666权益卡航班 (666/2666权益卡会员可用)';
  }
  if (cardType === '2666权益卡航班') {
    return '2666权益卡航班 (仅2666权益卡会员可用)';
  }
  return cardType;
};

function FlightManagement() {
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<any>({});
  const [sorter, setSorter] = useState<any>({
    sortBy: 'departureTime',
    sortOrder: 'DESC',
  });

  // 编辑模态框
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // 城市列表
  const [cities, setCities] = useState<{ origins: string[]; destinations: string[] }>({
    origins: [],
    destinations: [],
  });

  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    todayCount: 0,
    cardType666Count: 0,
    cardType2666Count: 0,
  });

  // 加载城市列表
  useEffect(() => {
    loadCities();
  }, []);

  // 首次加载航班数据
  useEffect(() => {
    loadFlights();
  }, []);

  const loadCities = async () => {
    try {
      const result = await getAvailableCities();
      setCities(result);
    } catch (error) {
      console.error('加载城市列表失败', error);
    }
  };

  const loadFlights = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    newFilters = filters,
    newSorter = sorter,
  ) => {
    setLoading(true);
    try {
      const result = await queryFlightsWithPagination({
        page,
        pageSize,
        ...newFilters,
        ...newSorter,
      });

      setFlights(result.flights);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });

      // 计算统计数据
      const today = dayjs().format('YYYY-MM-DD');
      setStats({
        total: result.total,
        todayCount: result.flights.filter((f) =>
          dayjs(f.departureTime).format('YYYY-MM-DD') === today
        ).length,
        cardType666Count: result.flights.filter((f) => f.cardType === '666权益卡航班').length,
        cardType2666Count: result.flights.filter((f) => f.cardType === '2666权益卡航班').length,
      });
    } catch (error) {
      message.error('加载航班数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选
  const handleFilter = (values: any) => {
    const newFilters: any = {};

    if (values.origin) newFilters.origin = values.origin;
    if (values.destination) newFilters.destination = values.destination;
    if (values.cardType) newFilters.cardType = values.cardType;
    if (values.flightNo) newFilters.flightNo = values.flightNo;

    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.startDate = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }

    setFilters(newFilters);
    loadFlights(1, pagination.pageSize, newFilters, sorter);
  };

  // 重置筛选
  const handleResetFilter = () => {
    filterForm.resetFields();
    setFilters({});
    loadFlights(1, pagination.pageSize, {}, sorter);
  };

  // 表格变化（分页、排序）
  const handleTableChange = (newPagination: any, _filters: any, newSorter: any) => {
    const sortConfig = {
      sortBy: newSorter.field || 'departureTime',
      sortOrder: newSorter.order === 'ascend' ? 'ASC' : 'DESC',
    };
    setSorter(sortConfig);
    loadFlights(newPagination.current, newPagination.pageSize, filters, sortConfig);
  };

  // 编辑
  const handleEdit = (record: Flight) => {
    setSelectedFlight(record);
    editForm.setFieldsValue({
      flightNo: record.flightNo,
      origin: record.origin,
      destination: record.destination,
      departureTime: dayjs(record.departureTime),
      arrivalTime: dayjs(record.arrivalTime),
      availableSeats: record.availableSeats,
      aircraftType: record.aircraftType,
      cardType: record.cardType,
    });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async (values: any) => {
    if (!selectedFlight) return;

    try {
      await updateFlight(selectedFlight.id, {
        ...values,
        departureTime: values.departureTime.toISOString(),
        arrivalTime: values.arrivalTime.toISOString(),
      });
      message.success('更新成功');
      setEditModalVisible(false);
      loadFlights();
    } catch (error: any) {
      message.error(`更新失败: ${error.message || '未知错误'}`);
    }
  };

  // 删除
  const handleDelete = (id: number, flightNo: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除航班 ${flightNo} 吗？此操作不可恢复！`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteFlight(id);
          message.success('删除成功');
          loadFlights();
        } catch (error: any) {
          message.error(`删除失败: ${error.message || '未知错误'}`);
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的航班');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 条航班吗？此操作不可恢复！`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await batchDeleteFlights(selectedRowKeys as number[]);
          message.success(result.message);
          setSelectedRowKeys([]);
          loadFlights();
        } catch (error: any) {
          message.error(`批量删除失败: ${error.message || '未知错误'}`);
        }
      },
    });
  };

  // 导出
  const handleExport = () => {
    if (flights.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    const exportData = flights.map((flight) => ({
      航班号: flight.flightNo,
      出发地: flight.origin,
      目的地: flight.destination,
      起飞时间: dayjs(flight.departureTime).format('YYYY-MM-DD HH:mm'),
      到达时间: dayjs(flight.arrivalTime).format('YYYY-MM-DD HH:mm'),
      权益卡类型: getCardTypeDescription(flight.cardType),
      可用座位: flight.availableSeats || '-',
      机型: flight.aircraftType || '-',
      爬取时间: flight.crawledAt ? dayjs(flight.crawledAt).format('YYYY-MM-DD HH:mm') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '航班数据');
    XLSX.writeFile(wb, `航班数据_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`);
    message.success('导出成功');
  };

  // 表格列配置
  const columns: ColumnsType<Flight> = [
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
      width: 120,
      sorter: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '出发地',
      dataIndex: 'origin',
      key: 'origin',
      width: 120,
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      width: 120,
    },
    {
      title: '起飞时间',
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: 160,
      sorter: true,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '到达时间',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: 160,
      sorter: true,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '权益卡类型',
      dataIndex: 'cardType',
      key: 'cardType',
      width: 180,
      render: (type) => {
        if (type === '666权益卡航班') {
          return (
            <Tag color="blue" title="666和2666权益卡会员都可以兑换">
              {type}
            </Tag>
          );
        }
        if (type === '2666权益卡航班') {
          return (
            <Tag color="green" title="仅2666权益卡会员可以兑换">
              {type}
            </Tag>
          );
        }
        return <Tag>{type}</Tag>;
      },
    },
    {
      title: '可用座位',
      dataIndex: 'availableSeats',
      key: 'availableSeats',
      width: 100,
      render: (seats) => seats || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_: any, record: Flight) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.flightNo)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>航班管理</Title>
      <Paragraph type="secondary">
        查看、编辑、删除航班数据，支持筛选、搜索和导出功能
      </Paragraph>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="总航班数" value={stats.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="今日航班" value={stats.todayCount} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                666权益卡航班 (666/2666可用)
              </div>
              <Statistic value={stats.cardType666Count} valueStyle={{ color: '#1890ff' }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                2666权益卡航班 (仅2666可用)
              </div>
              <Statistic value={stats.cardType2666Count} valueStyle={{ color: '#52c41a' }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选表单 */}
      <Card title="筛选条件" style={{ marginBottom: 24 }}>
        <Form form={filterForm} layout="inline" onFinish={handleFilter}>
          <Form.Item name="origin" label="出发地">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              style={{ width: 150 }}
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {cities.origins.map((city) => (
                <Select.Option key={city} value={city} label={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="destination" label="目的地">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              style={{ width: 150 }}
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {cities.destinations.map((city) => (
                <Select.Option key={city} value={city} label={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="日期范围">
            <RangePicker />
          </Form.Item>

          <Form.Item name="cardType" label="权益卡类型">
            <Select placeholder="请选择" allowClear style={{ width: 200 }}>
              <Select.Option value="全部">全部</Select.Option>
              <Select.Option value="666权益卡航班">666权益卡航班 (666/2666权益卡会员可用)</Select.Option>
              <Select.Option value="2666权益卡航班">2666权益卡航班 (仅2666权益卡会员可用)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="flightNo" label="航班号">
            <Input placeholder="请输入" allowClear style={{ width: 150 }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleResetFilter} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 航班数据表格 */}
      <Card
        title="航班数据"
        extra={
          <Space>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出 Excel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={flights}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title="编辑航班"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="flightNo" label="航班号" rules={[{ required: true, message: '请输入航班号' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请输入出发地' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="departureTime" label="起飞时间" rules={[{ required: true, message: '请选择起飞时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="arrivalTime" label="到达时间" rules={[{ required: true, message: '请选择到达时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="cardType" label="权益卡类型" rules={[{ required: true, message: '请选择权益卡类型' }]}>
            <Select>
              <Select.Option value="666权益卡航班">666权益卡航班 (666/2666权益卡会员可用)</Select.Option>
              <Select.Option value="2666权益卡航班">2666权益卡航班 (仅2666权益卡会员可用)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="availableSeats" label="可用座位">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="aircraftType" label="机型">
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default FlightManagement;
