import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  DatePicker,
  Button,
  Table,
  Space,
  message,
  Select,
  Tag,
  Modal,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  queryDestinations,
  DestinationResult,
  getAvailableCities,
  queryRoundTripFlights,
  RoundTripFlights,
  Flight,
} from '@/api/flight';

const { RangePicker } = DatePicker;

function DestinationQuery() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null);
  const [roundTripFlights, setRoundTripFlights] = useState<RoundTripFlights | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 加载可用城市列表
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await getAvailableCities();
        setAvailableOrigins(cities.origins);
      } catch (error) {
        console.error('加载城市列表失败', error);
      }
    };
    loadCities();
  }, []);

  const handleSearch = async (values: any) => {
    setLoading(true);
    try {
      const [startDate, endDate] = values.dateRange;
      const result = await queryDestinations({
        origin: values.origin,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        flightType: values.flightType,
      });

      setDestinations(result.destinations);
      message.success(`查询成功！共找到 ${result.totalCount} 个目的地`);
    } catch (error) {
      message.error('查询失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleShowFlightDetails = async (destination: DestinationResult) => {
    setSelectedDestination(destination);
    setIsModalVisible(true);
    setDetailLoading(true);

    try {
      const values = form.getFieldsValue();
      const [startDate, endDate] = values.dateRange;

      const flights = await queryRoundTripFlights({
        origin: values.origin,
        destination: destination.destination,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        flightType: values.flightType,
      });

      setRoundTripFlights(flights);
    } catch (error) {
      message.error('加载航班详情失败');
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<DestinationResult> = [
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      render: (text: string, record: DestinationResult) => (
        <Space>
          <strong>{text}</strong>
          {record.hasReturn && (
            <Tag color="success">可往返</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '权益标签',
      dataIndex: 'cardTypes',
      key: 'cardTypes',
      render: (cardTypes: string[]) => (
        <Space>
          {cardTypes.map((type) => (
            <Tag
              key={type}
              color={type === '666权益卡航班' ? 'blue' : 'green'}
            >
              {type.replace('权益卡航班', '')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '去程航班',
      dataIndex: 'flightCount',
      key: 'flightCount',
      sorter: (a: DestinationResult, b: DestinationResult) =>
        a.flightCount - b.flightCount,
      render: (count: number, record: DestinationResult) => (
        <div>
          <div>{count} 班</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.availableDates.length} 天可选
          </div>
        </div>
      ),
    },
    {
      title: '返程航班',
      key: 'returnFlights',
      render: (_: any, record: DestinationResult) => {
        if (!record.hasReturn) {
          return <span style={{ color: '#999' }}>无返程</span>;
        }
        return (
          <div>
            <div>{record.returnFlightCount} 班</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.returnAvailableDates?.length} 天可选
            </div>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DestinationResult) => (
        <Button
          type="link"
          onClick={() => handleShowFlightDetails(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const flightDetailColumns: ColumnsType<Flight> = [
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
    },
    {
      title: '出发时间',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '到达时间',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '权益卡类型',
      dataIndex: 'cardType',
      key: 'cardType',
      render: (cardType: string) => {
        const types = cardType.split(',').map(t => t.trim());
        return (
          <Space>
            {types.map((type) => (
              <Tag
                key={type}
                color={type === '666权益卡航班' ? 'blue' : 'green'}
              >
                {type.replace('权益卡航班', '')}
              </Tag>
            ))}
          </Space>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="目的地查询">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          initialValues={{
            flightType: '全部',
            dateRange: [dayjs(), dayjs().add(30, 'day')],
          }}
        >
          <Form.Item
            name="origin"
            label="出发地"
            rules={[{ required: true, message: '请选择出发地' }]}
          >
            <Select
              placeholder="请选择出发地"
              style={{ width: 180 }}
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableOrigins.map((city) => (
                <Select.Option key={city} value={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="日期范围"
            rules={[{ required: true, message: '请选择日期范围' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item name="flightType" label="权益卡类型">
            <Select style={{ width: 180 }}>
              <Select.Option value="全部">全部权益卡</Select.Option>
              <Select.Option value="666权益卡航班">666权益卡航班</Select.Option>
              <Select.Option value="2666权益卡航班">2666权益卡航班</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {destinations.length > 0 && (
        <Card title={`查询结果（共 ${destinations.length} 个目的地）`}>
          <Table
            columns={columns}
            dataSource={destinations}
            rowKey="destination"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      )}

      <Modal
        title={`${form.getFieldValue('origin')} ⇄ ${selectedDestination?.destination} - 往返航班详情`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 去程航班 */}
          <div>
            <h3 style={{ marginBottom: 16 }}>
              去程航班：{form.getFieldValue('origin')} → {selectedDestination?.destination}
            </h3>
            <Table
              columns={flightDetailColumns}
              dataSource={roundTripFlights?.outboundFlights || []}
              rowKey="id"
              loading={detailLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条航班`,
              }}
            />
          </div>

          {/* 返程航班 */}
          <div>
            <h3 style={{ marginBottom: 16 }}>
              返程航班：{selectedDestination?.destination} → {form.getFieldValue('origin')}
            </h3>
            {roundTripFlights?.returnFlights && roundTripFlights.returnFlights.length > 0 ? (
              <Table
                columns={flightDetailColumns}
                dataSource={roundTripFlights.returnFlights}
                rowKey="id"
                loading={detailLoading}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `共 ${total} 条航班`,
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                暂无返程航班
              </div>
            )}
          </div>
        </Space>
      </Modal>
    </Space>
  );
}

export default DestinationQuery;
