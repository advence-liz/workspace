import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Tabs,
  Row,
  Col,
  Drawer,
  Divider,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  RightOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  planRoute,
  planRoundTrip,
  exploreDestinations,
  RouteResult,
  RoundTripResult,
  ExploreDestination,
} from '@/api/route';
import { getAvailableCities } from '@/api/flight';
import { getDefaultOrigin, setOriginCookie } from '@/utils/cookie';

// ─── 工具函数 ───────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function formatDate(dt: string): string {
  return dayjs(dt).format('MM-DD HH:mm');
}

// ─── 单程方案时间线 ─────────────────────────────────────────

interface RouteTimelineProps {
  route: RouteResult;
  color?: string;
}

function RouteTimeline({ route, color = 'blue' }: RouteTimelineProps) {
  const items: any[] = [];

  route.segments.forEach((seg, idx) => {
    items.push({
      color,
      children: (
        <div>
          <Space size={4}>
            <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{seg.flightNo}</Tag>
            <span style={{ fontWeight: 500 }}>{seg.origin}</span>
            <ArrowRightOutlined style={{ fontSize: 10, color: '#999' }} />
            <span style={{ fontWeight: 500 }}>{seg.destination}</span>
          </Space>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
            {formatDate(seg.departureTime)} → {formatDate(seg.arrivalTime)}
            <span style={{ marginLeft: 8, color: '#bbb' }}>({formatDuration(seg.duration)})</span>
          </div>
        </div>
      ),
    });

    // 中转停留
    if (idx < route.layovers.length) {
      const layover = route.layovers[idx];
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined style={{ fontSize: 10 }} />,
        children: (
          <div style={{ color: '#aaa', fontSize: 12 }}>
            在 <strong>{layover.city}</strong> 候机 {formatDuration(layover.duration)}
          </div>
        ),
      });
    }
  });

  return <Timeline items={items} style={{ marginTop: 8 }} />;
}

// ─── 往返方案卡片 ───────────────────────────────────────────

interface RoundTripCardProps {
  result: RoundTripResult;
  index: number;
}

function RoundTripCard({ result, index }: RoundTripCardProps) {
  const isDirectBoth = result.outbound.transferCount === 0 && result.return.transferCount === 0;

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <Space>
          <span style={{ color: '#666' }}>方案 {index}</span>
          {isDirectBoth
            ? <Tag color="green">双向直飞</Tag>
            : <Tag color="blue">含中转</Tag>
          }
          <Tag icon={<ClockCircleOutlined />} color="default">
            总计 {formatDuration(result.totalDuration)}
          </Tag>
        </Space>
      }
    >
      {/* 去程 */}
      <div style={{ marginBottom: 4 }}>
        <Tag color="blue" style={{ marginBottom: 6 }}>✈ 去程</Tag>
        <span style={{ color: '#888', fontSize: 12 }}>
          {formatDuration(result.outbound.totalDuration)}
          {result.outbound.transferCount > 0 && `  ·  ${result.outbound.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={result.outbound} color="blue" />

      <Divider style={{ margin: '8px 0' }} dashed />

      {/* 返程 */}
      <div style={{ marginBottom: 4 }}>
        <Tag color="orange" style={{ marginBottom: 6 }}>↩ 返程</Tag>
        <span style={{ color: '#888', fontSize: 12 }}>
          {formatDuration(result.return.totalDuration)}
          {result.return.transferCount > 0 && `  ·  ${result.return.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={result.return} color="orange" />
    </Card>
  );
}

// ─── 探索目的地卡片 ─────────────────────────────────────────

interface ExploreCardProps {
  dest: ExploreDestination;
  onViewAll: () => void;
}

function ExploreCard({ dest, onViewAll }: ExploreCardProps) {
  const out = dest.bestOutbound;
  const ret = dest.bestReturn;
  const outFirst = out.segments[0];
  const outLast = out.segments[out.segments.length - 1];
  const retFirst = ret.segments[0];
  const retLast = ret.segments[ret.segments.length - 1];
  const isDirect = out.transferCount === 0 && ret.transferCount === 0;

  return (
    <Card
      hoverable
      size="small"
      style={{ height: '100%' }}
      title={
        <Space>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{dest.city}</span>
          {isDirect && <Tag color="green" style={{ fontSize: 11 }}>直飞往返</Tag>}
        </Space>
      }
      extra={
        <Button type="link" size="small" icon={<RightOutlined />} onClick={onViewAll}>
          全部方案
        </Button>
      }
    >
      {/* 去程最优 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#1677ff', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
          ✈ 去程 · {formatDuration(out.totalDuration)}
          {out.transferCount > 0 && <span style={{ color: '#aaa' }}>（{out.transferCount}中转）</span>}
        </div>
        <Space size={4} style={{ fontSize: 13 }}>
          <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{outFirst?.flightNo}</Tag>
          <span>{formatDate(outFirst?.departureTime)}</span>
          <span style={{ color: '#bbb' }}>→</span>
          <span>{formatDate(outLast?.arrivalTime)}</span>
        </Space>
      </div>

      {/* 返程最优 */}
      <div>
        <div style={{ color: '#fa8c16', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
          ↩ 返程 · {formatDuration(ret.totalDuration)}
          {ret.transferCount > 0 && <span style={{ color: '#aaa' }}>（{ret.transferCount}中转）</span>}
        </div>
        <Space size={4} style={{ fontSize: 13 }}>
          <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{retFirst?.flightNo}</Tag>
          <span>{formatDate(retFirst?.departureTime)}</span>
          <span style={{ color: '#bbb' }}>→</span>
          <span>{formatDate(retLast?.arrivalTime)}</span>
        </Space>
      </div>

      {/* 底部方案数 */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0', color: '#aaa', fontSize: 11 }}>
        去程 {dest.outboundCount} 个方案 · 返程 {dest.returnCount} 个方案
      </div>
    </Card>
  );
}

// ─── 探索 Tab ──────────────────────────────────────────────

interface UrlParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tab: string;
}

interface ExploreTabProps {
  cities: string[];
  urlParams?: UrlParams;
}

function ExploreTab({ cities, urlParams }: ExploreTabProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExploreDestination[]>([]);
  const [drawerDest, setDrawerDest] = useState<ExploreDestination | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roundTripRoutes, setRoundTripRoutes] = useState<RoundTripResult[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // URL params 优先，否则用 cookie 默认值
    const origin = urlParams?.origin || getDefaultOrigin();
    form.setFieldValue('origin', origin);

    // 如果有 URL 日期参数，填入表单
    if (urlParams?.departureDate) {
      form.setFieldValue('departureDate', dayjs(urlParams.departureDate));
    }
    if (urlParams?.returnDate) {
      form.setFieldValue('returnDate', dayjs(urlParams.returnDate));
    }

    // cities 加载完成后自动触发一次查询
    if (cities.length > 0 && !triggeredRef.current) {
      triggeredRef.current = true;
      form.submit();
    }
  }, [cities]);

  const handleSearch = async (values: any) => {
    setLoading(true);
    setResults([]);
    try {
      const [depStart, depEnd] = values.departureRange || [];
      const [retStart, retEnd] = values.returnRange || [];
      const resp = await exploreDestinations({
        origin: values.origin,
        departureDate: depStart.format('YYYY-MM-DD'),
        departureDateEnd: depEnd.format('YYYY-MM-DD'),
        returnDate: retStart.format('YYYY-MM-DD'),
        returnDateEnd: retEnd.format('YYYY-MM-DD'),
        maxTransfers: 0,
      });
      setResults(resp.destinations);
      setOriginCookie(values.origin);
      if (resp.destinations.length === 0) {
        message.warning('未找到可往返的目的地，请换个日期试试');
      } else {
        message.success(`发现 ${resp.destinations.length} 个可往返目的地`);
      }
    } catch {
      message.error('查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = async (dest: ExploreDestination) => {
    setDrawerDest(dest);
    setDrawerOpen(true);
    setRoundTripRoutes([]);
    setLoadingRoutes(true);

    try {
      const values = form.getFieldsValue();
      const [depStart, depEnd] = values.departureRange || [];
      const [retStart, retEnd] = values.returnRange || [];
      const resp = await planRoundTrip({
        origin: values.origin,
        destination: dest.city,
        departureDate: depStart.format('YYYY-MM-DD'),
        departureDateEnd: depEnd.format('YYYY-MM-DD'),
        returnDate: retStart.format('YYYY-MM-DD'),
        returnDateEnd: retEnd.format('YYYY-MM-DD'),
        maxTransfers: 0,
      });
      setRoundTripRoutes(resp.routes);
    } catch {
      message.error('加载方案失败');
    } finally {
      setLoadingRoutes(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          initialValues={{
            departureRange: [dayjs().add(3, 'day'), dayjs().add(5, 'day')],
            returnRange: [dayjs().add(10, 'day'), dayjs().add(12, 'day')],
          }}
        >
          <Form.Item name="origin" rules={[{ required: true, message: '请选择出发地' }]}>
            <Select
              placeholder="出发地"
              style={{ width: 160 }}
              showSearch
              filterOption={(input, option) =>
                (option?.value?.toString() || '').includes(input)
              }
              options={cities.map(c => ({ value: c, label: c }))}
            />
          </Form.Item>

          <Form.Item name="departureRange" label="去程日期" rules={[{ required: true, message: '请选择去程日期范围' }]}>
            <DatePicker.RangePicker placeholder={['去程最早', '去程最晚']} style={{ width: 240 }} />
          </Form.Item>

          <Form.Item name="returnRange" label="返程日期" rules={[{ required: true, message: '请选择返程日期范围' }]}>
            <DatePicker.RangePicker placeholder={['返程最早', '返程最晚']} style={{ width: 240 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              探索目的地
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" tip="正在发现可往返目的地..." />
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div style={{ marginBottom: 12, color: '#666' }}>
            共找到 <strong>{results.length}</strong> 个可往返目的地（按综合评分排序）
          </div>
          <Row gutter={[12, 12]}>
            {results.map((dest) => (
              <Col key={dest.city} xs={24} sm={12} lg={8}>
                <ExploreCard dest={dest} onViewAll={() => handleViewAll(dest)} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {!loading && results.length === 0 && (
        <Card>
          <Empty description="填写出发地和日期，探索所有能往返的目的地" />
        </Card>
      )}

      {/* 目的地详情 Drawer */}
      <Drawer
        title={
          drawerDest ? (
            <Space>
              <span>{form.getFieldValue('origin')}</span>
              <SwapOutlined />
              <span>{drawerDest.city}</span>
              <Tag color="blue">{form.getFieldValue('departureDate')?.format('MM-DD')} 去</Tag>
              <Tag color="orange">{form.getFieldValue('returnDate')?.format('MM-DD')} 回</Tag>
            </Space>
          ) : '往返方案'
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {loadingRoutes ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="加载方案中..." />
          </div>
        ) : roundTripRoutes.length > 0 ? (
          <>
            <div style={{ marginBottom: 12, color: '#666' }}>共 {roundTripRoutes.length} 个往返方案</div>
            {roundTripRoutes.map((rt, idx) => (
              <RoundTripCard key={idx} result={rt} index={idx + 1} />
            ))}
          </>
        ) : (
          <Empty description="暂无方案" />
        )}
      </Drawer>
    </div>
  );
}

// ─── 规划 Tab ──────────────────────────────────────────────

interface PlanTabProps {
  cities: string[];
  urlParams?: UrlParams;
}

function PlanTab({ cities, urlParams }: PlanTabProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oneWayRoutes, setOneWayRoutes] = useState<RouteResult[]>([]);
  const [roundTripRoutes, setRoundTripRoutes] = useState<RoundTripResult[]>([]);

  useEffect(() => {
    const origin = urlParams?.origin || getDefaultOrigin();
    form.setFieldValue('origin', origin);

    if (urlParams?.destination) {
      form.setFieldValue('destination', urlParams.destination);
    }
    if (urlParams?.departureDate) {
      form.setFieldValue('departureDate', dayjs(urlParams.departureDate));
    }
    if (urlParams?.returnDate) {
      form.setFieldValue('returnDate', dayjs(urlParams.returnDate));
    }
  }, []);

  // 有 destination 时（来自跳转），cities 加载后自动触发
  useEffect(() => {
    if (cities.length > 0 && urlParams?.destination && urlParams?.departureDate) {
      form.submit();
    }
  }, [cities]);

  const handleSearch = async (values: any) => {
    setLoading(true);
    setOneWayRoutes([]);
    setRoundTripRoutes([]);

    try {
      const [depStart, depEnd] = values.departureRange || [];
      const departureDate = depStart.format('YYYY-MM-DD');
      const departureDateEnd = depEnd ? depEnd.format('YYYY-MM-DD') : departureDate;
      const [retStart, retEnd] = values.returnRange || [];
      const returnDate = retStart?.format('YYYY-MM-DD');
      const returnDateEnd = retEnd ? retEnd.format('YYYY-MM-DD') : returnDate;

      if (returnDate) {
        // 有返程日期范围：查往返
        const resp = await planRoundTrip({
          origin: values.origin,
          destination: values.destination,
          departureDate,
          departureDateEnd,
          returnDate,
          returnDateEnd,
          maxTransfers: values.maxTransfers ?? 0,
          minLayoverHours: 2,
          maxLayoverHours: 24,
        });
        setRoundTripRoutes(resp.routes);
        setOriginCookie(values.origin);
        if (resp.routes.length === 0) {
          message.warning('未找到合适的往返方案');
        } else {
          message.success(`找到 ${resp.routes.length} 个往返方案`);
        }
      } else {
        // 无返程日期：查单程（支持去程日期范围）
        const resp = await planRoute({
          origin: values.origin,
          destination: values.destination,
          departureDate,
          endDate: departureDateEnd !== departureDate ? departureDateEnd : undefined,
          maxTransfers: values.maxTransfers ?? 2,
          minLayoverHours: 2,
          maxLayoverHours: 24,
        });
        setOneWayRoutes(resp.routes);
        setOriginCookie(values.origin);
        if (resp.routes.length === 0) {
          message.warning('未找到合适的单程方案');
        } else {
          message.success(`找到 ${resp.routes.length} 个单程方案`);
        }
      }
    } catch {
      message.error('查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const isRoundTrip = roundTripRoutes.length > 0;
  const hasResults = oneWayRoutes.length > 0 || roundTripRoutes.length > 0;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          initialValues={{
            departureRange: [dayjs().add(3, 'day'), dayjs().add(5, 'day')],
            maxTransfers: 0,
          }}
        >
          <Form.Item name="origin" rules={[{ required: true, message: '请选择出发地' }]}>
            <Select
              placeholder="出发地"
              style={{ width: 150 }}
              showSearch
              filterOption={(input, option) =>
                (option?.value?.toString() || '').includes(input)
              }
              options={cities.map(c => ({ value: c, label: c }))}
            />
          </Form.Item>

          <Form.Item name="destination" rules={[{ required: true, message: '请选择目的地' }]}>
            <Select
              placeholder="目的地"
              style={{ width: 150 }}
              showSearch
              filterOption={(input, option) =>
                (option?.value?.toString() || '').includes(input)
              }
              options={cities.map(c => ({ value: c, label: c }))}
            />
          </Form.Item>

          <Form.Item name="departureRange" label="去程日期" rules={[{ required: true, message: '请选择去程日期' }]}>
            <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: 220 }} />
          </Form.Item>

          <Form.Item name="returnRange" label="返程日期（可选）">
            <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: 220 }} allowEmpty={[true, true]} />
          </Form.Item>

          <Form.Item name="maxTransfers" label="最多中转">
            <InputNumber min={0} max={2} style={{ width: 70 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              查询路线
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" tip="正在规划路线..." />
        </div>
      )}

      {!loading && hasResults && (
        <div>
          <div style={{ marginBottom: 12, color: '#666' }}>
            共 {isRoundTrip ? roundTripRoutes.length : oneWayRoutes.length} 个方案
            {isRoundTrip ? '（往返）' : '（单程）'}
          </div>

          {isRoundTrip
            ? roundTripRoutes.map((rt, idx) => (
                <RoundTripCard key={idx} result={rt} index={idx + 1} />
              ))
            : oneWayRoutes.map((route, idx) => (
                <Card
                  key={idx}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={
                    <Space>
                      <span style={{ color: '#666' }}>方案 {idx + 1}</span>
                      {route.transferCount === 0
                        ? <Tag color="green">直飞</Tag>
                        : <Tag color="blue">{route.transferCount} 次中转</Tag>
                      }
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        {formatDuration(route.totalDuration)}
                      </Tag>
                    </Space>
                  }
                >
                  <RouteTimeline route={route} color="blue" />
                </Card>
              ))
          }
        </div>
      )}

      {!loading && !hasResults && (
        <Card>
          <Empty description="选择出发地、目的地和日期查询路线方案" />
        </Card>
      )}
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────

function RoutePlanner() {
  const [cities, setCities] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('explore');

  // 从 URL params 解析初始参数
  const urlParams = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || '',
    tab: searchParams.get('tab') || 'explore',
  };

  useEffect(() => {
    getAvailableCities()
      .then(({ origins, destinations }) => {
        const all = Array.from(new Set([...origins, ...destinations])).sort();
        setCities(all);
      })
      .catch(() => {});

    // 如果有 URL params，切换到对应 tab
    if (urlParams.tab) {
      setActiveTab(urlParams.tab);
    }
  }, []);

  const tabItems = [
    {
      key: 'explore',
      label: (
        <Space>
          <SearchOutlined />
          探索 · 找目的地
        </Space>
      ),
      children: <ExploreTab cities={cities} urlParams={urlParams} />,
    },
    {
      key: 'plan',
      label: (
        <Space>
          <SwapOutlined />
          规划 · 查路线
        </Space>
      ),
      children: <PlanTab cities={cities} urlParams={urlParams} />,
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
}

export default RoutePlanner;
