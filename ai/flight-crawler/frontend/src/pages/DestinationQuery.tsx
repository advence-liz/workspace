import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Row,
  Col,
  Statistic,
  Tooltip,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  SwapOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  MinusCircleOutlined,
  AimOutlined,
  SendOutlined,
} from '@ant-design/icons';
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
import { getDefaultOrigin, setOriginCookie } from '@/utils/cookie';

const { RangePicker } = DatePicker;

// ─── 目的地气泡卡片 ──────────────────────────────────────────

interface DestCardProps {
  dest: DestinationResult;
  onClick: () => void;
  onPlan: () => void;
}

function DestCard({ dest, onClick, onPlan }: DestCardProps) {
  const canReturn = dest.hasReturn;

  return (
    <Tooltip
      title={
        canReturn
          ? `去程 ${dest.flightCount} 班 / ${dest.availableDates.length} 天  ·  返程 ${dest.returnFlightCount} 班 / ${dest.returnAvailableDates?.length} 天`
          : `去程 ${dest.flightCount} 班 / ${dest.availableDates.length} 天  ·  无返程`
      }
    >
      <div
        style={{
          cursor: 'pointer',
          border: `1.5px solid ${canReturn ? '#52c41a' : '#d9d9d9'}`,
          borderRadius: 8,
          padding: '10px 14px',
          background: canReturn ? '#f6ffed' : '#fafafa',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = canReturn
            ? '0 2px 8px rgba(82,196,26,0.35)'
            : '0 2px 8px rgba(0,0,0,0.12)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
      >
        {/* 城市名 + 往返图标 */}
        <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          {canReturn
            ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: 13 }} />
            : <MinusCircleOutlined style={{ color: '#bfbfbf', fontSize: 13 }} />
          }
          <span style={{
            fontWeight: 600,
            fontSize: 14,
            color: canReturn ? '#135200' : '#595959',
          }}>
            {dest.destination}
          </span>
        </div>

        {/* 去程 / 返程航班数 */}
        <div onClick={onClick} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
          <span style={{ color: '#1677ff' }}>
            ✈ {dest.flightCount} 班
          </span>
          {canReturn ? (
            <>
              <SwapOutlined style={{ color: '#52c41a', fontSize: 10 }} />
              <span style={{ color: '#52c41a' }}>
                {dest.returnFlightCount} 班
              </span>
            </>
          ) : (
            <span style={{ color: '#bfbfbf' }}>
              <ArrowRightOutlined style={{ fontSize: 10 }} /> 无返程
            </span>
          )}
        </div>

        {/* 权益卡标签 + 去规划按钮 */}
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {dest.cardTypes.map(type => (
              <Tag
                key={type}
                color={type === '666权益卡航班' ? 'blue' : 'green'}
                style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px', marginBottom: 0 }}
              >
                {type.replace('权益卡航班', '')}
              </Tag>
            ))}
          </div>
          <Button
            type="link"
            size="small"
            icon={<SendOutlined />}
            style={{ padding: '0 2px', fontSize: 11, height: 'auto', color: canReturn ? '#52c41a' : '#1677ff' }}
            onClick={e => { e.stopPropagation(); onPlan(); }}
          >
            规划
          </Button>
        </div>
      </div>
    </Tooltip>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

function DestinationQuery() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null);
  const [roundTripFlights, setRoundTripFlights] = useState<RoundTripFlights | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 跳转到行程规划
  const goToPlan = (dest: DestinationResult) => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.dateRange || [];
    const params = new URLSearchParams({
      tab: 'plan',
      origin: values.origin || '',
      destination: dest.destination,
      departureDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      returnDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    });
    navigate(`/route-planner?${params.toString()}`);
  };

  const goToExplore = () => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.dateRange || [];
    const params = new URLSearchParams({
      tab: 'explore',
      origin: values.origin || '',
      departureDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      returnDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    });
    navigate(`/route-planner?${params.toString()}`);
  };

  useEffect(() => {
    // 读取 cookie 设置默认出发地
    form.setFieldValue('origin', getDefaultOrigin());
    getAvailableCities()
      .then(cities => {
        setAvailableOrigins(cities.origins);
        // 城市列表加载完成后自动触发一次查询
        form.submit();
      })
      .catch(console.error);
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
      setOriginCookie(values.origin);
      message.success(`查询成功，共 ${result.totalCount} 个目的地`);
    } catch {
      message.error('查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = async (dest: DestinationResult) => {
    setSelectedDestination(dest);
    setIsModalVisible(true);
    setDetailLoading(true);
    try {
      const values = form.getFieldsValue();
      const [startDate, endDate] = values.dateRange;
      const flights = await queryRoundTripFlights({
        origin: values.origin,
        destination: dest.destination,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        flightType: values.flightType,
      });
      setRoundTripFlights(flights);
    } catch {
      message.error('加载航班详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 统计
  const returnCount = destinations.filter(d => d.hasReturn).length;
  const oneWayCount = destinations.filter(d => !d.hasReturn).length;

  // 表格列
  const columns: ColumnsType<DestinationResult> = [
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      render: (text: string, record: DestinationResult) => (
        <Space>
          <strong>{text}</strong>
          {record.hasReturn
            ? <Tag color="success" icon={<SwapOutlined />}>可往返</Tag>
            : <Tag color="default" icon={<ArrowRightOutlined />}>仅单程</Tag>
          }
        </Space>
      ),
    },
    {
      title: '权益标签',
      dataIndex: 'cardTypes',
      key: 'cardTypes',
      render: (cardTypes: string[]) => (
        <Space>
          {cardTypes.map(type => (
            <Tag key={type} color={type === '666权益卡航班' ? 'blue' : 'green'}>
              {type.replace('权益卡航班', '')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '去程',
      dataIndex: 'flightCount',
      key: 'flightCount',
      render: (count: number, record: DestinationResult) => (
        <div>
          <span style={{ color: '#1677ff', fontWeight: 500 }}>{count} 班</span>
          <div style={{ fontSize: 12, color: '#999' }}>{record.availableDates.length} 天可选</div>
        </div>
      ),
    },
    {
      title: '返程',
      key: 'returnFlights',
      render: (_: any, record: DestinationResult) =>
        record.hasReturn ? (
          <div>
            <span style={{ color: '#52c41a', fontWeight: 500 }}>{record.returnFlightCount} 班</span>
            <div style={{ fontSize: 12, color: '#999' }}>{record.returnAvailableDates?.length} 天可选</div>
          </div>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DestinationResult) => (
        <Space size={0}>
          <Button type="link" size="small" onClick={() => handleShowDetail(record)}>
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<AimOutlined />}
            onClick={() => goToPlan(record)}
          >
            去规划
          </Button>
        </Space>
      ),
    },
  ];

  const flightDetailColumns: ColumnsType<Flight> = [
    { title: '航班号', dataIndex: 'flightNo', key: 'flightNo' },
    {
      title: '出发时间',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (t: string) => dayjs(t).format('MM-DD HH:mm'),
    },
    {
      title: '到达时间',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (t: string) => dayjs(t).format('MM-DD HH:mm'),
    },
    {
      title: '权益卡',
      dataIndex: 'cardType',
      key: 'cardType',
      render: (cardType: string) => (
        <Space>
          {cardType.split(',').map(t => t.trim()).map(type => (
            <Tag key={type} color={type === '666权益卡航班' ? 'blue' : 'green'}>
              {type.replace('权益卡航班', '')}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 搜索表单 */}
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
          <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
            <Select
              placeholder="请选择出发地"
              style={{ width: 180 }}
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableOrigins.map(city => (
                <Select.Option key={city} value={city}>{city}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="日期范围" rules={[{ required: true, message: '请选择日期范围' }]}>
            <RangePicker />
          </Form.Item>

          <Form.Item name="flightType" label="权益卡类型">
            <Select style={{ width: 160 }}>
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
        <>
          {/* ── 可视化概览区 ── */}
          <Card>
            {/* 统计摘要 */}
            <Row gutter={24} style={{ marginBottom: 20 }}>
              <Col>
                <Statistic
                  title="可往返目的地"
                  value={returnCount}
                  suffix="个"
                  valueStyle={{ color: '#52c41a', fontSize: 28 }}
                  prefix={<SwapOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="仅单程目的地"
                  value={oneWayCount}
                  suffix="个"
                  valueStyle={{ color: '#8c8c8c', fontSize: 28 }}
                  prefix={<ArrowRightOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="目的地总数"
                  value={destinations.length}
                  suffix="个"
                  valueStyle={{ fontSize: 28 }}
                />
              </Col>
            </Row>

            {/* 可往返目的地气泡 */}
            {returnCount > 0 && (
              <>
                <Divider orientation="left" style={{ margin: '0 0 12px' }}>
                  <Space>
                    <CheckCircleFilled style={{ color: '#52c41a' }} />
                    <span style={{ color: '#52c41a', fontWeight: 600 }}>可往返（{returnCount} 个）</span>
                    <span style={{ color: '#999', fontSize: 12, fontWeight: 400 }}>点击查看航班详情</span>
                    <Button
                      type="link"
                      size="small"
                      icon={<AimOutlined />}
                      style={{ padding: 0, fontSize: 12 }}
                      onClick={goToExplore}
                    >
                      前往行程规划
                    </Button>
                  </Space>
                </Divider>
                <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
                  {destinations.filter(d => d.hasReturn).map(dest => (
                    <Col key={dest.destination}>
                      <DestCard dest={dest} onClick={() => handleShowDetail(dest)} onPlan={() => goToPlan(dest)} />
                    </Col>
                  ))}
                </Row>
              </>
            )}

            {/* 仅单程目的地气泡 */}
            {oneWayCount > 0 && (
              <>
                <Divider orientation="left" style={{ margin: '0 0 12px' }}>
                  <Space>
                    <MinusCircleOutlined style={{ color: '#bfbfbf' }} />
                    <span style={{ color: '#8c8c8c', fontWeight: 600 }}>仅单程（{oneWayCount} 个）</span>
                  </Space>
                </Divider>
                <Row gutter={[10, 10]}>
                  {destinations.filter(d => !d.hasReturn).map(dest => (
                    <Col key={dest.destination}>
                      <DestCard dest={dest} onClick={() => handleShowDetail(dest)} onPlan={() => goToPlan(dest)} />
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Card>

          {/* ── 详细表格 ── */}
          <Card title={`全部目的地（${destinations.length} 个）`}>
            <Table
              columns={columns}
              dataSource={destinations}
              rowKey="destination"
              rowClassName={record => record.hasReturn ? '' : 'row-one-way'}
              pagination={{ pageSize: 15, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
            />
          </Card>
        </>
      )}

      {/* 往返航班详情 Modal */}
      <Modal
        title={
          <Space>
            <span>{form.getFieldValue('origin')}</span>
            <SwapOutlined style={{ color: '#52c41a' }} />
            <span>{selectedDestination?.destination}</span>
            {selectedDestination?.hasReturn
              ? <Tag color="success">可往返</Tag>
              : <Tag color="default">仅单程</Tag>
            }
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1100}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 10, color: '#1677ff' }}>
              ✈ 去程：{form.getFieldValue('origin')} → {selectedDestination?.destination}
              <span style={{ fontWeight: 400, color: '#999', marginLeft: 8, fontSize: 13 }}>
                共 {roundTripFlights?.outboundFlights?.length || 0} 班
              </span>
            </div>
            <Table
              columns={flightDetailColumns}
              dataSource={roundTripFlights?.outboundFlights || []}
              rowKey="id"
              loading={detailLoading}
              size="small"
              pagination={{ pageSize: 5, showSizeChanger: false, showTotal: total => `共 ${total} 班` }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 10, color: '#52c41a' }}>
              ↩ 返程：{selectedDestination?.destination} → {form.getFieldValue('origin')}
              <span style={{ fontWeight: 400, color: '#999', marginLeft: 8, fontSize: 13 }}>
                共 {roundTripFlights?.returnFlights?.length || 0} 班
              </span>
            </div>
            {roundTripFlights?.returnFlights?.length ? (
              <Table
                columns={flightDetailColumns}
                dataSource={roundTripFlights.returnFlights}
                rowKey="id"
                loading={detailLoading}
                size="small"
                pagination={{ pageSize: 5, showSizeChanger: false, showTotal: total => `共 ${total} 班` }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#bfbfbf', background: '#fafafa', borderRadius: 6 }}>
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
