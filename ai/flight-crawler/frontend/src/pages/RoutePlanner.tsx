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
  Divider,
  Spin,
  Drawer,
  Grid,
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
import { getDefaultOrigin, setOriginCookie, getDefaultDateRange } from '@/utils/cookie';

const { useBreakpoint } = Grid;

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
  compact?: boolean;
}

function RoundTripCard({ result, index, compact }: RoundTripCardProps) {
  const isDirectBoth = result.outbound.transferCount === 0 && result.return.transferCount === 0;

  const header = (
    <Space size={4}>
      <span style={{ color: '#666', fontSize: 12 }}>#{index}</span>
      {isDirectBoth ? <Tag color="green" style={{ margin: 0 }}>双直飞</Tag> : <Tag color="blue" style={{ margin: 0 }}>含中转</Tag>}
      <Tag icon={<ClockCircleOutlined />} color="default" style={{ margin: 0 }}>总 {formatDuration(result.totalDuration)}</Tag>
    </Space>
  );

  const body = (
    <>
      <div style={{ marginBottom: 4 }}>
        <Tag color="blue">✈ 去程</Tag>
        <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
          {formatDuration(result.outbound.totalDuration)}
          {result.outbound.transferCount > 0 && ` · ${result.outbound.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={result.outbound} color="blue" />
      <Divider style={{ margin: '8px 0' }} dashed />
      <div style={{ marginBottom: 4 }}>
        <Tag color="orange">↩ 返程</Tag>
        <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
          {formatDuration(result.return.totalDuration)}
          {result.return.transferCount > 0 && ` · ${result.return.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={result.return} color="orange" />
    </>
  );

  if (compact) {
    return (
      <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>{header}</div>
        {body}
      </div>
    );
  }

  return (
    <Card size="small" style={{ height: '100%' }} title={header}>
      {body}
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
  const isDirect = out.transferCount === 0 && ret.transferCount === 0;

  return (
    <Card
      size="small"
      style={{ height: '100%' }}
      title={
        <Space>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{dest.city}</span>
          {isDirect
            ? <Tag color="green" style={{ fontSize: 11 }}>直飞往返</Tag>
            : <Tag color="orange" style={{ fontSize: 11 }}>含中转</Tag>
          }
        </Space>
      }
      extra={
        <Button type="link" size="small" icon={<RightOutlined />} onClick={onViewAll}>
          更多组合
        </Button>
      }
    >
      <div style={{ marginBottom: 4 }}>
        <Tag color="blue">✈ 去程</Tag>
        <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
          {formatDuration(out.totalDuration)}
          {out.transferCount > 0 && ` · ${out.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={out} color="blue" />

      <Divider dashed style={{ margin: '8px 0' }} />

      <div style={{ marginBottom: 4 }}>
        <Tag color="orange">↩ 返程</Tag>
        <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
          {formatDuration(ret.totalDuration)}
          {ret.transferCount > 0 && ` · ${ret.transferCount} 次中转`}
        </span>
      </div>
      <RouteTimeline route={ret} color="orange" />

      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #f0f0f0', color: '#aaa', fontSize: 11 }}>
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
  departureDateEnd?: string;
  returnDate: string;
  returnDateEnd?: string;
  tab: string;
  maxTransfers?: string;
}

interface ExploreTabProps {
  cities: string[];
  urlParams?: UrlParams;
  dateRange: { minDate: string | null; maxDate: string | null };
}

function ExploreTab({ cities, urlParams, dateRange }: ExploreTabProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExploreDestination[]>([]);
  const [drawerDest, setDrawerDest] = useState<ExploreDestination | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roundTripRoutes, setRoundTripRoutes] = useState<RoundTripResult[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const triggeredRef = useRef(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (cities.length === 0 || !dateRange.minDate) return;

    // URL params 优先，否则用 cookie 默认值
    const origin = urlParams?.origin || getDefaultOrigin();
    form.setFieldValue('origin', origin);

    // 去程：URL 参数 > 默认今天~一个月后
    if (urlParams?.departureDate) {
      const dep = dayjs(urlParams.departureDate);
      form.setFieldValue('departureRange', [dep, dep.add(2, 'day')]);
    } else {
      const [defStart, defEnd] = getDefaultDateRange();
      form.setFieldValue('departureRange', [dayjs(defStart), dayjs(defEnd)]);
    }

    // 返程：URL 参数 > 默认今天~一个月后
    if (urlParams?.returnDate) {
      const ret = dayjs(urlParams.returnDate);
      form.setFieldValue('returnRange', [ret, ret.add(2, 'day')]);
    } else {
      const [defStart, defEnd] = getDefaultDateRange();
      form.setFieldValue('returnRange', [dayjs(defStart), dayjs(defEnd)]);
    }

    // 自动触发一次查询
    if (!triggeredRef.current) {
      triggeredRef.current = true;
      form.submit();
    }
  }, [cities, dateRange.minDate]);

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
        maxTransfers: 1,
        flightType: values.flightType === '666权益卡航班' ? '666权益卡航班' : undefined,
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
        maxTransfers: 1,
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
          layout={isMobile ? 'vertical' : 'inline'}
          onFinish={handleSearch}
          initialValues={{ flightType: '2666权益卡航班' }}
        >
          {isMobile ? (
            <Row gutter={[8, 8]}>
              <Col xs={24}>
                <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                  <Select placeholder="出发地" showSearch style={{ width: '100%' }}
                    filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                    options={cities.map(c => ({ value: c, label: c }))} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="departureRange" label="去程日期" rules={[{ required: true, message: '请选择去程日期' }]}>
                  <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: '100%' }}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body} placement="bottomLeft" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="returnRange" label="返程日期" rules={[{ required: true, message: '请选择返程日期' }]}>
                  <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: '100%' }}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body} placement="bottomLeft" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="flightType" label="权益卡类型">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="666权益卡航班">666</Select.Option>
                    <Select.Option value="2666权益卡航班">2666</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} block>探索</Button>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <>
              <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                <Select placeholder="出发地" style={{ width: 180 }} showSearch
                  filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                  options={cities.map(c => ({ value: c, label: c }))} />
              </Form.Item>
              <Form.Item name="departureRange" label="去程日期" rules={[{ required: true }]}>
                <DatePicker.RangePicker placeholder={['最早', '最晚']} />
              </Form.Item>
              <Form.Item name="returnRange" label="返程日期" rules={[{ required: true }]}>
                <DatePicker.RangePicker placeholder={['最早', '最晚']} />
              </Form.Item>
              <Form.Item name="flightType" label="权益卡">
                <Select style={{ width: 80 }}>
                  <Select.Option value="666权益卡航班">666</Select.Option>
                  <Select.Option value="2666权益卡航班">2666</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  探索
                </Button>
              </Form.Item>
            </>
          )}
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

      <Drawer
        title={
          drawerDest ? (
            <Space>
              <span>{form.getFieldValue('origin')}</span>
              <SwapOutlined />
              <span>{drawerDest.city}</span>
            </Space>
          ) : '更多往返组合'
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={680}
      >
        {loadingRoutes ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="加载方案中..." />
          </div>
        ) : roundTripRoutes.length > 0 ? (
          <>
            <div style={{ marginBottom: 12, color: '#666' }}>共 {roundTripRoutes.length} 个往返组合</div>
            {roundTripRoutes.map((rt, idx) => (
              <RoundTripCard key={idx} result={rt} index={idx + 1} compact />
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
  dateRange: { minDate: string | null; maxDate: string | null };
}

function PlanTab({ cities, urlParams, dateRange }: PlanTabProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oneWayRoutes, setOneWayRoutes] = useState<RouteResult[]>([]);
  const [roundTripRoutes, setRoundTripRoutes] = useState<RoundTripResult[]>([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (cities.length === 0 || !dateRange.minDate) return;

    const origin = urlParams?.origin || getDefaultOrigin();
    form.setFieldValue('origin', origin);

    if (urlParams?.destination) {
      form.setFieldValue('destination', urlParams.destination);
    }

    // 去程：URL 参数 > 默认今天~一个月后
    if (urlParams?.departureDate) {
      const dep = dayjs(urlParams.departureDate);
      const depEnd = urlParams.departureDateEnd ? dayjs(urlParams.departureDateEnd) : dep.add(2, 'day');
      form.setFieldValue('departureRange', [dep, depEnd]);
    } else {
      const [defStart, defEnd] = getDefaultDateRange();
      form.setFieldValue('departureRange', [dayjs(defStart), dayjs(defEnd)]);
    }

    // 返程：URL 参数有 returnDate 时设置；来自跳转且无 returnDate 时清空（单程）；否则默认
    if (urlParams?.returnDate) {
      const ret = dayjs(urlParams.returnDate);
      const retEnd = urlParams.returnDateEnd ? dayjs(urlParams.returnDateEnd) : ret.add(2, 'day');
      form.setFieldValue('returnRange', [ret, retEnd]);
    } else if (urlParams?.destination) {
      form.setFieldValue('returnRange', [null, null]);
    } else {
      const [defStart, defEnd] = getDefaultDateRange();
      form.setFieldValue('returnRange', [dayjs(defStart), dayjs(defEnd)]);
    }

    // maxTransfers URL 参数优先
    if (urlParams?.maxTransfers !== undefined) {
      form.setFieldValue('maxTransfers', parseInt(urlParams.maxTransfers, 10));
    }

    // 有目的地时（来自跳转）自动触发查询
    if (urlParams?.destination) {
      form.submit();
    }
  }, [cities, dateRange.minDate]);

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

      const flightType = values.flightType === '666权益卡航班' ? '666权益卡航班' : undefined;

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
          flightType,
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
          flightType,
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
          layout={isMobile ? 'vertical' : 'inline'}
          onFinish={handleSearch}
          initialValues={{ maxTransfers: 1, flightType: '2666权益卡航班' }}
        >
          {isMobile ? (
            <Row gutter={[8, 8]}>
              <Col xs={12}>
                <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                  <Select placeholder="出发地" showSearch style={{ width: '100%' }}
                    filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                    options={cities.map(c => ({ value: c, label: c }))} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请选择目的地' }]}>
                  <Select placeholder="目的地" showSearch style={{ width: '100%' }}
                    filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                    options={cities.map(c => ({ value: c, label: c }))} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="departureRange" label="去程日期" rules={[{ required: true, message: '请选择去程日期' }]}>
                  <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: '100%' }}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body} placement="bottomLeft" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="returnRange" label="返程日期">
                  <DatePicker.RangePicker placeholder={['最早', '最晚']} style={{ width: '100%' }} allowEmpty={[true, true]}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body} placement="bottomLeft" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="maxTransfers" label="最大中转次数">
                  <InputNumber min={0} max={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="flightType" label="权益卡类型">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="666权益卡航班">666</Select.Option>
                    <Select.Option value="2666权益卡航班">2666</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} block>查询</Button>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <>
              <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                <Select placeholder="出发地" style={{ width: 100 }} showSearch
                  filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                  options={cities.map(c => ({ value: c, label: c }))} />
              </Form.Item>
              <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请选择目的地' }]}>
                <Select placeholder="目的地" style={{ width: 100 }} showSearch
                  filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                  options={cities.map(c => ({ value: c, label: c }))} />
              </Form.Item>
              <Form.Item name="departureRange" label="去程">
                <DatePicker.RangePicker placeholder={['最早', '最晚']} />
              </Form.Item>
              <Form.Item name="returnRange" label="返程">
                <DatePicker.RangePicker placeholder={['最早', '最晚']} allowEmpty={[true, true]} />
              </Form.Item>
              <Form.Item name="maxTransfers" label="中转">
                <InputNumber min={0} max={2} style={{ width: 60 }} />
              </Form.Item>
              <Form.Item name="flightType" label="权益卡">
                <Select style={{ width: 80 }}>
                  <Select.Option value="666权益卡航班">666</Select.Option>
                  <Select.Option value="2666权益卡航班">2666</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>查询</Button>
              </Form.Item>
            </>
          )}
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
          <Row gutter={[12, 12]}>
            {isRoundTrip
              ? roundTripRoutes.map((rt, idx) => (
                  <Col key={idx} xs={24} sm={12} lg={8}>
                    <RoundTripCard result={rt} index={idx + 1} />
                  </Col>
                ))
              : oneWayRoutes.map((route, idx) => (
                  <Col key={idx} xs={24} sm={12} lg={8}>
                    <Card
                      size="small"
                      style={{ height: '100%' }}
                      title={
                        <Space>
                          <span style={{ color: '#666', fontSize: 12 }}>#{idx + 1}</span>
                          {route.transferCount === 0
                            ? <Tag color="green" style={{ margin: 0 }}>直飞</Tag>
                            : <Tag color="blue" style={{ margin: 0 }}>{route.transferCount} 次中转</Tag>
                          }
                          <Tag icon={<ClockCircleOutlined />} color="default" style={{ margin: 0 }}>
                            {formatDuration(route.totalDuration)}
                          </Tag>
                        </Space>
                      }
                    >
                      <RouteTimeline route={route} color="blue" />
                    </Card>
                  </Col>
                ))
            }
          </Row>
        </div>
      )}

      {!loading && !hasResults && (
        <Card>
          <Empty description="选择出发地、目的地和日期查询方案" />
        </Card>
      )}
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────

function RoutePlanner() {
  const [cities, setCities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ minDate: string | null; maxDate: string | null }>({ minDate: null, maxDate: null });
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('explore');

  // 从 URL params 解析初始参数
  const urlParams = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    departureDateEnd: searchParams.get('departureDateEnd') || undefined,
    returnDate: searchParams.get('returnDate') || '',
    returnDateEnd: searchParams.get('returnDateEnd') || undefined,
    tab: searchParams.get('tab') || 'explore',
    maxTransfers: searchParams.get('maxTransfers') || undefined,
  };

  useEffect(() => {
    getAvailableCities()
      .then(({ cityList, origins, destinations, minDate, maxDate }) => {
        // 优先使用城市维度列表（北京/上海各出现一次），兼容旧接口
        const all = cityList?.length
          ? cityList
          : Array.from(new Set([...origins, ...destinations])).sort();
        setCities(all);
        setDateRange({ minDate, maxDate });
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
      children: <ExploreTab cities={cities} urlParams={urlParams} dateRange={dateRange} />,
    },
    {
      key: 'plan',
      label: (
        <Space>
          <SwapOutlined />
          规划 · 查路线
        </Space>
      ),
      children: <PlanTab cities={cities} urlParams={urlParams} dateRange={dateRange} />,
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
