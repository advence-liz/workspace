import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  DatePicker,
  Button,
  Space,
  message,
  InputNumber,
  Timeline,
  Tag,
  Empty,
  Select,
  Radio,
  Divider,
} from 'antd';

const { RangePicker } = DatePicker;
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { planRoute, planRoundTrip, RouteResult } from '@/api/route';
import { getAvailableCities } from '@/api/flight';

function RoutePlanner() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  // 加载可用城市列表
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await getAvailableCities();
        setAvailableOrigins(cities.origins);
        setAvailableDestinations(cities.destinations);
      } catch (error) {
        console.error('加载城市列表失败', error);
      }
    };
    loadCities();
  }, []);

  const handlePlan = async (values: any) => {
    setLoading(true);
    try {
      if (tripType === 'roundTrip') {
        // 往返行程：调用独立的往返接口
        if (!values.returnDate) {
          message.error('往返行程必须选择返程日期');
          setLoading(false);
          return;
        }

        const result = await planRoundTrip({
          origin: values.origin,
          destination: values.destination,
          departureDate: values.departureDate.format('YYYY-MM-DD'),
          returnDate: values.returnDate.format('YYYY-MM-DD'),
          maxTransfers: values.maxTransfers || 0, // 往返默认直飞
          minLayoverHours: values.minLayoverHours || 2,
          maxLayoverHours: values.maxLayoverHours || 24,
        });

        // 转换往返结果为统一格式用于渲染
        const convertedRoutes: RouteResult[] = result.routes.map(rt => ({
          segments: [...rt.outbound.segments, ...rt.return.segments],
          totalDuration: rt.totalDuration,
          transferCount: rt.totalTransferCount,
          layovers: [...rt.outbound.layovers, ...rt.return.layovers],
          score: rt.score,
        }));

        setRoutes(convertedRoutes);
        if (convertedRoutes.length === 0) {
          message.warning('未找到合适的往返方案');
        } else {
          const modeText = values.destination ? '往返' : '自动发现往返';
          message.success(`找到 ${convertedRoutes.length} 个${modeText}方案`);
        }
      } else {
        // 单程行程：调用单程接口
        let departureDate: string;
        let endDate: string | undefined;

        if (dateMode === 'range' && values.dateRange) {
          // 单程区间模式
          const [start, end] = values.dateRange;
          departureDate = start.format('YYYY-MM-DD');
          endDate = end.format('YYYY-MM-DD');
        } else if (values.departureDate) {
          // 单程固定日期模式
          departureDate = values.departureDate.format('YYYY-MM-DD');
        } else {
          message.error('请选择出发日期');
          setLoading(false);
          return;
        }

        const result = await planRoute({
          origin: values.origin,
          destination: values.destination,
          departureDate,
          endDate,
          maxTransfers: values.maxTransfers || 2,
          minLayoverHours: values.minLayoverHours || 2,
          maxLayoverHours: values.maxLayoverHours || 24,
        });

        setRoutes(result.routes);
        if (result.routes.length === 0) {
          message.warning('未找到合适的行程方案');
        } else {
          const modeText = dateMode === 'range' ? '区间单程' : '单程';
          message.success(`找到 ${result.routes.length} 个${modeText}方案`);
        }
      }
    } catch (error) {
      message.error('行程规划失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const renderRoute = (route: RouteResult, index: number, isRoundTrip: boolean) => {
    // 如果是往返行程，需要找到去程和返程的分界点
    let outboundEndIndex = route.segments.length;
    let outboundDuration = route.totalDuration;
    let outboundTransfers = route.transferCount;
    let returnDuration = 0;
    let returnTransfers = 0;

    if (isRoundTrip) {
      // 找到返程的起点（destination 变回 origin）
      const values = form.getFieldsValue();
      for (let i = 0; i < route.segments.length; i++) {
        if (route.segments[i].origin === values.destination) {
          outboundEndIndex = i;
          break;
        }
      }

      // 计算去程统计
      outboundDuration = route.segments.slice(0, outboundEndIndex).reduce((sum, seg) => sum + seg.duration, 0);
      outboundTransfers = outboundEndIndex - 1;

      // 计算返程统计
      returnDuration = route.segments.slice(outboundEndIndex).reduce((sum, seg) => sum + seg.duration, 0);
      returnTransfers = route.segments.length - outboundEndIndex - 1;

      // 加上中转停留时间
      for (let i = 0; i < outboundEndIndex - 1; i++) {
        if (route.layovers[i]) {
          outboundDuration += route.layovers[i].duration;
        }
      }
      for (let i = outboundEndIndex - 1; i < route.layovers.length; i++) {
        if (route.layovers[i]) {
          returnDuration += route.layovers[i].duration;
        }
      }
    }

    return (
      <Card
        key={index}
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <span>方案 {index + 1}</span>
            {isRoundTrip && <Tag color="purple">往返</Tag>}
            <Tag color="blue">
              <ClockCircleOutlined /> 总时长 {formatDuration(route.totalDuration)}
            </Tag>
            <Tag color="green">总计 {route.transferCount} 次中转</Tag>
          </Space>
        }
      >
        {isRoundTrip && (
          <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '4px' }}>
            <Space size="large">
              <div>
                <Tag color="blue">✈️ 去程</Tag>
                <span style={{ marginLeft: 8 }}>
                  {formatDuration(outboundDuration)} · {outboundTransfers}次中转
                </span>
              </div>
              <div>
                <Tag color="orange">✈️ 返程</Tag>
                <span style={{ marginLeft: 8 }}>
                  {formatDuration(returnDuration)} · {returnTransfers}次中转
                </span>
              </div>
            </Space>
          </div>
        )}
        <Timeline
          items={route.segments.map((segment, idx) => {
            const items: any[] = [];

            // 添加返程分隔标识
            if (isRoundTrip && idx === outboundEndIndex) {
              items.push({
                color: 'orange',
                children: (
                  <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold', fontSize: '14px' }}>
                    <Tag color="orange" style={{ fontSize: '14px' }}>✈️ 返程开始</Tag>
                  </div>
                ),
              });
            }

            items.push({
              color: idx < outboundEndIndex ? 'blue' : 'orange',
              children: (
                <div>
                  <div>
                    <strong>{segment.flightNo}</strong> {segment.origin} → {segment.destination}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    {dayjs(segment.departureTime).format('MM-DD HH:mm')} -{' '}
                    {dayjs(segment.arrivalTime).format('MM-DD HH:mm')} |{' '}
                    {formatDuration(segment.duration)}
                  </div>
                </div>
              ),
            });

            // 添加中转停留时间
            if (idx < route.layovers.length) {
              const layover = route.layovers[idx];
              items.push({
                color: 'gray',
                dot: <ClockCircleOutlined />,
                children: (
                  <div style={{ color: '#888' }}>
                    在 {layover.city} 停留 {formatDuration(layover.duration)}
                  </div>
                ),
              });
            }

            return items;
          }).flat()}
        />
      </Card>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="智能行程规划">
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePlan}
          initialValues={{
            departureDate: dayjs(),
            dateRange: [dayjs(), dayjs().add(7, 'day')],
            maxTransfers: 2,
            minLayoverHours: 2,
            maxLayoverHours: 24,
            tripType: 'oneWay',
            dateMode: 'single',
          }}
        >
          <Form.Item name="tripType" label="行程类型">
            <Radio.Group onChange={(e) => setTripType(e.target.value)}>
              <Radio.Button value="oneWay">单程</Radio.Button>
              <Radio.Button value="roundTrip">往返</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {tripType === 'oneWay' && (
            <Form.Item name="dateMode" label="日期模式">
              <Radio.Group onChange={(e) => setDateMode(e.target.value)}>
                <Radio.Button value="single">固定日期</Radio.Button>
                <Radio.Button value="range">日期区间</Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <Space size="large" style={{ width: '100%' }} wrap>
            <Form.Item
              name="origin"
              label="出发地"
              rules={[{ required: true, message: '请选择出发地' }]}
            >
              <Select
                placeholder="请选择出发地"
                style={{ width: 200 }}
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
              name="destination"
              label={tripType === 'roundTrip' ? '目的地（可选，不填自动发现）' : '目的地（可选）'}
            >
              <Select
                placeholder={tripType === 'roundTrip' ? '不填则自动发现往返' : '不填则展示所有航班'}
                style={{ width: 240 }}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableDestinations.map((city) => (
                  <Select.Option key={city} value={city}>
                    {city}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {tripType === 'oneWay' && dateMode === 'single' && (
              <Form.Item
                name="departureDate"
                label="出发日期"
                rules={[{ required: true, message: '请选择出发日期' }]}
              >
                <DatePicker placeholder="选择固定日期" />
              </Form.Item>
            )}

            {tripType === 'oneWay' && dateMode === 'range' && (
              <Form.Item
                name="dateRange"
                label="日期区间"
                rules={[{ required: true, message: '请选择日期区间' }]}
              >
                <RangePicker placeholder={['开始日期', '结束日期']} />
              </Form.Item>
            )}

            {tripType === 'roundTrip' && (
              <>
                <Form.Item
                  name="departureDate"
                  label="出发日期"
                  rules={[{ required: true, message: '请选择出发日期' }]}
                >
                  <DatePicker placeholder="选择出发日期" />
                </Form.Item>
              </>
            )}

            {tripType === 'roundTrip' && (
              <Form.Item
                name="returnDate"
                label="返程日期"
                rules={[
                  { required: true, message: '请选择返程日期' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const departureDate = getFieldValue('departureDate');
                      if (!value || !departureDate || value.isAfter(departureDate)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('返程日期必须晚于出发日期'));
                    },
                  }),
                ]}
              >
                <DatePicker placeholder="选择返程日期" />
              </Form.Item>
            )}

            <Form.Item name="maxTransfers" label="最大中转次数">
              <InputNumber min={0} max={3} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="minLayoverHours" label="最短停留时间（小时）">
              <InputNumber min={1} max={24} style={{ width: 150 }} />
            </Form.Item>

            <Form.Item name="maxLayoverHours" label="最长停留时间（小时）">
              <InputNumber min={1} max={48} style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              开始规划
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {routes.length > 0 ? (
        <Card title={`推荐方案（共 ${routes.length} 个）`}>
          {routes.map((route, index) => renderRoute(route, index, tripType === 'roundTrip'))}
        </Card>
      ) : (
        !loading && (
          <Card>
            <Empty description="暂无行程方案，请先进行查询" />
          </Card>
        )
      )}
    </Space>
  );
}

export default RoutePlanner;
