import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Spin,
  Tabs,
  Badge,
  Grid,
} from 'antd';
import {
  SearchOutlined,
  SwapOutlined,
  ArrowRightOutlined,
  AimOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
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
  RouteResult,
  discoverTransferDestinations,
  TransferRoundTripDest,
  TransferOneWayDest,
} from '@/api/flight';
import { getDefaultOrigin, setOriginCookie, getDefaultDateRange } from '@/utils/cookie';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

// ─── 类型定义 ────────────────────────────────────────────────

type UnifiedRow =
  | { kind: 'direct'; dest: DestinationResult }
  | { kind: 'transfer-rt'; item: TransferRoundTripDest }
  | { kind: 'transfer-ow'; item: TransferOneWayDest };

// ─── 移动端卡片视图组件 ──────────────────────────────────────

interface DestinationCardProps {
  row: UnifiedRow;
  onShowDetail: (dest: DestinationResult) => void;
  onShowTransferRoutes: (city: string) => void;
  onPlan: (city: string) => void;
}

function DestinationCard({ row, onShowDetail, onShowTransferRoutes, onPlan }: DestinationCardProps) {
  const city = row.kind === 'direct' ? row.dest.destination : row.item.city;
  const isDirect = row.kind === 'direct';
  const isTransferRT = row.kind === 'transfer-rt';
  const isTransferOW = row.kind === 'transfer-ow';

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Space size={4}>
          <strong style={{ fontSize: 16 }}>{city}</strong>
          {isDirect && row.dest.hasReturn && (
            <Tag color="success" icon={<SwapOutlined />} style={{ margin: 0 }}>往返</Tag>
          )}
          {isDirect && !row.dest.hasReturn && (
            <Tag icon={<ArrowRightOutlined />} style={{ margin: 0 }}>单程</Tag>
          )}
          {isTransferRT && (
            <Tag color="orange" icon={<NodeIndexOutlined />} style={{ margin: 0 }}>中转往返</Tag>
          )}
          {isTransferOW && (
            <Tag color="orange" icon={<NodeIndexOutlined />} style={{ margin: 0 }}>中转单程</Tag>
          )}
        </Space>
      </div>

      {/* 航班信息 */}
      <div style={{ marginBottom: 8 }}>
        {isDirect ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#666', fontSize: 13 }}>✈ 去程</span>
              <span style={{ color: '#1677ff', fontWeight: 500 }}>
                {row.dest.flightCount} 班 · {row.dest.availableDates.length} 天
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginBottom: 6 }}>
              {row.dest.availableDates[0]} ~ {row.dest.availableDates[row.dest.availableDates.length - 1]}
            </div>
            {row.dest.hasReturn && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>↩ 返程</span>
                  <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    {row.dest.returnFlightCount} 班 · {row.dest.returnAvailableDates?.length} 天
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#bbb' }}>
                  {row.dest.returnAvailableDates?.[0]} ~ {row.dest.returnAvailableDates?.[row.dest.returnAvailableDates.length - 1]}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {isTransferRT && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>✈ 去程</span>
                  <span style={{ color: '#fa8c16', fontWeight: 500 }}>
                    {row.item.outboundCount} 条方案
                  </span>
                </div>
                {(() => {
                  const routes = row.item.outboundRoutes.filter((x: any) => x.transferCount > 0);
                  const best = routes[0];
                  return best ? (
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>
                      经 {best.segments.slice(0, -1).map((s: any) => s.destination).join('、')} · {Math.floor(best.totalDuration / 60)}h{best.totalDuration % 60}m
                    </div>
                  ) : null;
                })()}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>↩ 返程</span>
                  <span style={{ color: '#fa8c16', fontWeight: 500 }}>
                    {row.item.returnCount} 条方案
                  </span>
                </div>
                {(() => {
                  const routes = row.item.returnRoutes.filter((x: any) => x.transferCount > 0);
                  const best = routes[0];
                  return best ? (
                    <div style={{ fontSize: 11, color: '#999' }}>
                      经 {best.segments.slice(0, -1).map((s: any) => s.destination).join('、')} · {Math.floor(best.totalDuration / 60)}h{best.totalDuration % 60}m
                    </div>
                  ) : null;
                })()}
              </>
            )}
            {isTransferOW && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>✈ 去程</span>
                  <span style={{ color: '#fa8c16', fontWeight: 500 }}>
                    {row.item.routeCount} 条方案
                  </span>
                </div>
                {(() => {
                  const routes = row.item.routes.filter((x: any) => x.transferCount > 0);
                  const best = routes[0];
                  return best ? (
                    <div style={{ fontSize: 11, color: '#999' }}>
                      经 {best.segments.slice(0, -1).map((s: any) => s.destination).join('、')} · {Math.floor(best.totalDuration / 60)}h{best.totalDuration % 60}m
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </>
        )}
      </div>

      {/* 权益卡标签 */}
      {isDirect && (
        <div style={{ marginBottom: 8 }}>
          <Space size={2}>
            {row.dest.cardTypes.map(type => (
              <Tag key={type} color={type === '666权益卡航班' ? 'blue' : 'green'} style={{ margin: 0, fontSize: 11 }}>
                {type.replace('权益卡航班', '')}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {isDirect && (
          <Button type="primary" size="small" style={{ flex: 1 }} onClick={() => onShowDetail(row.dest)}>
            查看详情
          </Button>
        )}
        {(isTransferRT || isTransferOW) && (
          <Button
            type="primary"
            size="small"
            style={{ flex: 1, background: '#fa8c16', borderColor: '#fa8c16' }}
            icon={<NodeIndexOutlined />}
            onClick={() => onShowTransferRoutes(city)}
          >
            中转方案
          </Button>
        )}
        <Button size="small" style={{ flex: 1 }} icon={<AimOutlined />} onClick={() => onPlan(city)}>
          行程规划
        </Button>
      </div>
    </Card>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

function DestinationQuery() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null);
  const [roundTripFlights, setRoundTripFlights] = useState<RoundTripFlights | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 中转方案 Modal 状态（点击气泡后弹出，直接用已有数据）
  const [transferModalCity, setTransferModalCity] = useState<string | null>(null);

  // 中转目的地分区状态
  const [transferRoundTrip, setTransferRoundTrip] = useState<TransferRoundTripDest[]>([]);
  const [transferOneWay, setTransferOneWay] = useState<TransferOneWayDest[]>([]);
  const [discoverTransferLoading, setDiscoverTransferLoading] = useState(false);
  const [transferDiscovered, setTransferDiscovered] = useState(false);

  // 跳转到行程规划
  const goToPlan = (destination: string) => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.dateRange || [];
    // 直飞目的地：可往返的传 returnDate，仅单程的不传（避免查往返查不到结果）
    const directDest = destinations.find(d => d.destination === destination);
    const isDirectFlight = !!directDest;
    const canReturn = directDest?.hasReturn ?? false;
    // 中转目的地：判断是否有往返中转方案
    const hasTransferReturn = validTransferRoundTrip.some(i => i.city === destination);
    const shouldIncludeReturn = canReturn || hasTransferReturn;
    const params = new URLSearchParams({
      tab: 'plan',
      origin: values.origin || '',
      destination,
      departureDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      ...(endDate ? { departureDateEnd: endDate.format('YYYY-MM-DD') } : {}),
      // 往返：returnDate 用 startDate（最早可返程），returnDateEnd 用 endDate（最晚可返程）
      ...(shouldIncludeReturn && startDate ? { returnDate: startDate.format('YYYY-MM-DD') } : {}),
      ...(shouldIncludeReturn && endDate ? { returnDateEnd: endDate.format('YYYY-MM-DD') } : {}),
      maxTransfers: isDirectFlight ? '0' : '1',
    });
    navigate(`/route-planner?${params.toString()}`);
  };

  const goToExplore = () => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.dateRange || [];
    const start = startDate ? startDate.format('YYYY-MM-DD') : '';
    const end = endDate ? endDate.format('YYYY-MM-DD') : '';
    const params = new URLSearchParams({
      tab: 'explore',
      origin: values.origin || '',
      departureDate: start,
      departureDateEnd: end,
      returnDate: start,
      returnDateEnd: end,
    });
    navigate(`/route-planner?${params.toString()}`);
  };

  useEffect(() => {
    // 优先读取 URL 参数（从行程规划页面返回时携带）
    const urlOrigin = searchParams.get('origin');
    const urlDepartureDate = searchParams.get('departureDate');
    const urlReturnDate = searchParams.get('returnDate');

    form.setFieldValue('origin', urlOrigin || getDefaultOrigin());
    if (urlDepartureDate && urlReturnDate) {
      form.setFieldValue('dateRange', [dayjs(urlDepartureDate), dayjs(urlReturnDate)]);
    } else {
      const [defStart, defEnd] = getDefaultDateRange();
      form.setFieldValue('dateRange', [dayjs(defStart), dayjs(defEnd)]);
    }

    getAvailableCities()
      .then(cities => {
        setAvailableOrigins(cities.cityList?.length ? cities.cityList : cities.origins);
        // 城市列表加载完成后自动触发一次查询
        form.submit();
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (values: any) => {
    const [startDate, endDate] = values.dateRange;
    const queryParams = {
      origin: values.origin,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      flightType: values.flightType,
    };

    // 重置状态
    setDestinations([]);
    setTransferRoundTrip([]);
    setTransferOneWay([]);
    setTransferDiscovered(false);
    setLoading(true);

    // 第一步：仅查去程，立即渲染（无缓存，速度快）
    try {
      const fastResult = await queryDestinations({ ...queryParams, includeReturn: false });
      setDestinations(fastResult.destinations);
      setOriginCookie(values.origin);
    } catch {
      message.error('查询失败，请稍后重试');
      setLoading(false);
      return;
    }

    // 第二步：补充返程信息（有缓存命中时很快，无缓存时稍慢但不阻塞首屏）
    queryDestinations({ ...queryParams, includeReturn: true })
      .then(fullResult => {
        setDestinations(fullResult.destinations);
        message.success(`查询成功，共 ${fullResult.totalCount} 个目的地`);
      })
      .catch(() => {
        // 返程查询失败不影响已展示的去程数据
        message.warning('返程信息加载失败，仅显示去程数据');
      })
      .finally(() => {
        setLoading(false);
      });

    // 第三步：异步触发中转目的地发现（不阻塞前两步）
    setDiscoverTransferLoading(true);
    discoverTransferDestinations({
      origin: values.origin,
      departureDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      maxTransfers: 1,
    }).then(transferResult => {
      setTransferRoundTrip(transferResult.roundTrip);
      setTransferOneWay(transferResult.oneWay);
      setTransferDiscovered(true);
    }).catch(() => {
      // 中转查询失败不阻断主流程
    }).finally(() => {
      setDiscoverTransferLoading(false);
    });
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

  // 点击中转目的地气泡，弹出该城市的中转路线 Modal（直接用已有数据，无需再请求）
  const handleShowTransferRoutes = (city: string) => {
    setTransferModalCity(city);
  };

  // 统计
  const returnCount = destinations.filter(d => d.hasReturn).length;
  const oneWayCount = destinations.filter(d => !d.hasReturn).length;

  // 过滤掉「过滤直飞后无中转路线」的 item
  const validTransferRoundTrip = transferRoundTrip.filter(item =>
    item.outboundRoutes.some(r => r.transferCount > 0) &&
    item.returnRoutes.some(r => r.transferCount > 0),
  );
  const validTransferOneWay = transferOneWay.filter(item =>
    item.routes.some(r => r.transferCount > 0),
  );


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

  // 合并直飞 + 中转为统一数据
  const allRows: UnifiedRow[] = [
    ...destinations.map(d => ({ kind: 'direct' as const, dest: d })),
    ...validTransferRoundTrip.map(i => ({ kind: 'transfer-rt' as const, item: i })),
    ...validTransferOneWay.map(i => ({ kind: 'transfer-ow' as const, item: i })),
  ];

  const getCity = (r: UnifiedRow) =>
    r.kind === 'direct' ? r.dest.destination : r.item.city;

  const unifiedColumns: ColumnsType<UnifiedRow> = [
    {
      title: '目的地',
      width: 120,
      sorter: (a, b) => getCity(a).localeCompare(getCity(b)),
      render: (_, r) => {
        const city = getCity(r);
        if (r.kind === 'direct') {
          return (
            <Space size={4}>
              <strong>{city}</strong>
              {r.dest.hasReturn
                ? <Tag color="success" icon={<SwapOutlined />} style={{ margin: 0 }}>往返</Tag>
                : <Tag icon={<ArrowRightOutlined />} style={{ margin: 0 }}>单程</Tag>
              }
            </Space>
          );
        }
        return (
          <Space size={4}>
            <strong>{city}</strong>
            <Tag color="orange" icon={<NodeIndexOutlined />} style={{ margin: 0 }}>
              {r.kind === 'transfer-rt' ? '中转往返' : '中转单程'}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '去程',
      width: 140,
      sorter: (a, b) => {
        const ca = a.kind === 'direct' ? a.dest.flightCount : (a.kind === 'transfer-rt' ? a.item.outboundCount : a.item.routeCount);
        const cb = b.kind === 'direct' ? b.dest.flightCount : (b.kind === 'transfer-rt' ? b.item.outboundCount : b.item.routeCount);
        return ca - cb;
      },
      render: (_, r) => {
        if (r.kind === 'direct') {
          return (
            <div>
              <span style={{ color: '#1677ff', fontWeight: 500 }}>{r.dest.flightCount} 班</span>
              <span style={{ color: '#999', fontSize: 12, marginLeft: 6 }}>{r.dest.availableDates.length} 天</span>
              <div style={{ fontSize: 11, color: '#bbb' }}>
                {r.dest.availableDates[0]} ~ {r.dest.availableDates[r.dest.availableDates.length - 1]}
              </div>
            </div>
          );
        }
        const routes = r.kind === 'transfer-rt'
          ? r.item.outboundRoutes.filter(x => x.transferCount > 0)
          : r.item.routes.filter(x => x.transferCount > 0);
        const best = routes[0];
        const count = r.kind === 'transfer-rt' ? r.item.outboundCount : r.item.routeCount;
        return best ? (
          <div>
            <span style={{ color: '#fa8c16', fontWeight: 500 }}>{count} 条方案</span>
            <div style={{ fontSize: 11, color: '#999' }}>
              经 {best.segments.slice(0, -1).map(s => s.destination).join('、')} · {Math.floor(best.totalDuration / 60)}h{best.totalDuration % 60}m
            </div>
          </div>
        ) : <span style={{ color: '#bbb' }}>—</span>;
      },
    },
    {
      title: '返程',
      width: 140,
      sorter: (a, b) => {
        const ca = a.kind === 'direct' ? (a.dest.returnFlightCount ?? 0) : (a.kind === 'transfer-rt' ? a.item.returnCount : 0);
        const cb = b.kind === 'direct' ? (b.dest.returnFlightCount ?? 0) : (b.kind === 'transfer-rt' ? b.item.returnCount : 0);
        return ca - cb;
      },
      render: (_, r) => {
        if (r.kind === 'direct') {
          return r.dest.hasReturn ? (
            <div>
              <span style={{ color: '#52c41a', fontWeight: 500 }}>{r.dest.returnFlightCount} 班</span>
              <span style={{ color: '#999', fontSize: 12, marginLeft: 6 }}>{r.dest.returnAvailableDates?.length} 天</span>
              <div style={{ fontSize: 11, color: '#bbb' }}>
                {r.dest.returnAvailableDates?.[0]} ~ {r.dest.returnAvailableDates?.[r.dest.returnAvailableDates.length - 1]}
              </div>
            </div>
          ) : <span style={{ color: '#bfbfbf' }}>—</span>;
        }
        if (r.kind === 'transfer-rt') {
          const routes = r.item.returnRoutes.filter(x => x.transferCount > 0);
          const best = routes[0];
          return best ? (
            <div>
              <span style={{ color: '#fa8c16', fontWeight: 500 }}>{r.item.returnCount} 条方案</span>
              <div style={{ fontSize: 11, color: '#999' }}>
                经 {best.segments.slice(0, -1).map(s => s.destination).join('、')} · {Math.floor(best.totalDuration / 60)}h{best.totalDuration % 60}m
              </div>
            </div>
          ) : <span style={{ color: '#bfbfbf' }}>—</span>;
        }
        return <span style={{ color: '#bfbfbf' }}>—</span>;
      },
    },
    {
      title: '权益卡',
      width: 110,
      render: (_, r) => {
        if (r.kind !== 'direct') return <span style={{ color: '#bbb', fontSize: 12 }}>—</span>;
        return (
          <Space size={2}>
            {r.dest.cardTypes.map(type => (
              <Tag key={type} color={type === '666权益卡航班' ? 'blue' : 'green'} style={{ margin: 0, fontSize: 11 }}>
                {type.replace('权益卡航班', '')}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      width: 160,
      render: (_, r) => {
        const city = getCity(r);
        return (
          <Space size={0}>
            {r.kind === 'direct' && (
              <Button type="link" size="small" onClick={() => handleShowDetail(r.dest)}>详情</Button>
            )}
            {(r.kind === 'transfer-rt' || r.kind === 'transfer-ow') && (
              <Button type="link" size="small" style={{ color: '#fa8c16' }} icon={<NodeIndexOutlined />}
                onClick={() => handleShowTransferRoutes(city)}>
                方案
              </Button>
            )}
            <Button type="link" size="small" icon={<AimOutlined />} onClick={() => goToPlan(city)}>规划</Button>
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: isMobile ? (
        <span>全部 <Badge count={allRows.length} color="#999" showZero /></span>
      ) : (
        <span>全部 <Badge count={allRows.length} color="#999" /></span>
      ),
      data: allRows,
    },
    {
      key: 'return',
      label: isMobile ? (
        <span>往返 <Badge count={returnCount} color="#52c41a" showZero /></span>
      ) : (
        <span>直飞往返 <Badge count={returnCount} color="#52c41a" /></span>
      ),
      data: allRows.filter(r => r.kind === 'direct' && r.dest.hasReturn),
    },
    {
      key: 'oneway',
      label: isMobile ? (
        <span>单程 <Badge count={oneWayCount} color="#aaa" showZero /></span>
      ) : (
        <span>直飞单程 <Badge count={oneWayCount} color="#aaa" /></span>
      ),
      data: allRows.filter(r => r.kind === 'direct' && !r.dest.hasReturn),
    },
    {
      key: 'transfer',
      label: isMobile ? (
        <span>
          中转{' '}
          {discoverTransferLoading
            ? <Spin size="small" style={{ marginLeft: 2 }} />
            : <Badge count={validTransferRoundTrip.length + validTransferOneWay.length} color="#fa8c16" showZero />
          }
        </span>
      ) : (
        <span>
          中转可达{' '}
          {discoverTransferLoading
            ? <Spin size="small" style={{ marginLeft: 4 }} />
            : <Badge count={validTransferRoundTrip.length + validTransferOneWay.length} color="#fa8c16" />
          }
        </span>
      ),
      data: allRows.filter(r => r.kind !== 'direct'),
    },
  ];

  const [activeTab, setActiveTab] = useState('all');

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* 搜索表单 */}
      <Card bodyStyle={isMobile ? { padding: '12px' } : undefined}>
        <Form
          form={form}
          layout={isMobile ? "vertical" : "inline"}
          onFinish={handleSearch}
          initialValues={{
            flightType: '2666权益卡航班',
            dateRange: [dayjs(), dayjs().add(30, 'day')],
          }}
        >
          {isMobile ? (
            <Row gutter={[8, 8]}>
              <Col xs={24}>
                <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                  <Select
                    placeholder="请选择出发地"
                    style={{ width: '100%' }}
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
              </Col>

              <Col xs={24}>
                <Form.Item name="dateRange" label="日期范围" rules={[{ required: true, message: '请选择日期范围' }]}>
                  <RangePicker
                    style={{ width: '100%' }}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
                    placement="bottomLeft"
                  />
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
                <Form.Item label=" ">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={loading}
                    block
                  >
                    查询
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <>
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
                <Select style={{ width: 80 }}>
                  <Select.Option value="666权益卡航班">666</Select.Option>
                  <Select.Option value="2666权益卡航班">2666</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  查询
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Card>

      {destinations.length > 0 && (
        <Card
          bodyStyle={{ padding: 0 }}
          headStyle={isMobile ? { padding: '12px 16px' } : undefined}
          title={
            <Row gutter={isMobile ? [8, 8] : [16, 16]} align="middle">
              <Col xs={12} sm={8} md={6}>
                <Statistic title="直飞往返" value={returnCount} suffix="个"
                  valueStyle={{ color: '#52c41a', fontSize: isMobile ? 16 : 22 }} prefix={<SwapOutlined />} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="直飞单程" value={oneWayCount} suffix="个"
                  valueStyle={{ color: '#8c8c8c', fontSize: isMobile ? 16 : 22 }} prefix={<ArrowRightOutlined />} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="直飞合计" value={destinations.length} suffix="个"
                  valueStyle={{ fontSize: isMobile ? 16 : 22 }} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                {discoverTransferLoading
                  ? <Space><NodeIndexOutlined style={{ color: '#fa8c16' }} /><span style={{ color: '#fa8c16', fontSize: isMobile ? 12 : 14 }}>中转搜索中...</span><Spin size="small" /></Space>
                  : transferDiscovered && (
                    <Statistic title="中转可达" value={validTransferRoundTrip.length + validTransferOneWay.length} suffix="个"
                      valueStyle={{ color: '#fa8c16', fontSize: isMobile ? 16 : 22 }} prefix={<NodeIndexOutlined />} />
                  )
                }
              </Col>
              {!isMobile && (
                <Col xs={24} sm={24} md={24} style={{ textAlign: 'right' }}>
                  <Button type="link" icon={<AimOutlined />} onClick={goToExplore}>行程规划</Button>
                </Col>
              )}
            </Row>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            style={{ padding: isMobile ? '0 8px' : '0 16px' }}
            items={tabItems.map(t => ({
              key: t.key,
              label: t.label,
              children: isMobile ? (
                // 移动端：卡片视图
                <div style={{ padding: '12px 0' }}>
                  {t.data.length > 0 ? (
                    t.data.map(row => (
                      <DestinationCard
                        key={getCity(row)}
                        row={row}
                        onShowDetail={handleShowDetail}
                        onShowTransferRoutes={handleShowTransferRoutes}
                        onPlan={goToPlan}
                      />
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                      暂无数据
                    </div>
                  )}
                </div>
              ) : (
                // 桌面端：表格视图
                <Table<UnifiedRow>
                  columns={unifiedColumns}
                  dataSource={t.data}
                  rowKey={r => getCity(r)}
                  size="small"
                  pagination={{ pageSize: 20, showSizeChanger: true, showTotal: total => `共 ${total} 个目的地` }}
                  loading={loading}
                  scroll={{ x: 1000 }}
                />
              ),
            }))}
          />
        </Card>
      )}

      {/* 中转方案 Modal（直接使用已发现的数据，无需再请求） */}
      {(() => {
        const city = transferModalCity;
        const roundTripItem = transferRoundTrip.find(i => i.city === city);
        const oneWayItem = transferOneWay.find(i => i.city === city);
        const origin = form.getFieldValue('origin');

        const renderRoute = (route: RouteResult, label: string, color: string) => (
          <div style={{ border: `1px solid ${color === 'orange' ? '#ffd591' : '#91d5ff'}`, borderRadius: 8, padding: '12px 16px', background: color === 'orange' ? '#fff7e6' : '#e6f7ff', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Space>
                <Tag color={color}>{label}</Tag>
                <Space size={4}>
                  <ClockCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                  <span style={{ fontSize: 12, color: '#666' }}>
                    总耗时 {Math.floor(route.totalDuration / 60)}h{route.totalDuration % 60}m
                  </span>
                </Space>
                <Tag color="orange">{route.transferCount} 次中转</Tag>
              </Space>
              <span style={{ fontSize: 12, color: '#999' }}>评分 {route.score.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              {route.segments.map((seg, si) => (
                <>
                  <div key={`seg-${si}`} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, padding: '6px 10px', fontSize: 12, minWidth: 160 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{seg.origin} → {seg.destination}</div>
                    <div style={{ color: '#666' }}>
                      {seg.flightNo}&nbsp;
                      {new Date(seg.departureTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(seg.arrivalTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ color: '#999', fontSize: 11 }}>飞行 {Math.floor(seg.duration / 60)}h{seg.duration % 60}m</div>
                  </div>
                  {si < route.layovers.length && (
                    <div key={`layover-${si}`} style={{ textAlign: 'center', fontSize: 11, color: '#fa8c16', padding: '0 4px' }}>
                      <div>⏱</div>
                      <div>{route.layovers[si].city}</div>
                      <div>停 {Math.floor(route.layovers[si].duration / 60)}h{route.layovers[si].duration % 60}m</div>
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>
        );

        return (
          <Modal
            title={
              <Space>
                <NodeIndexOutlined style={{ color: '#fa8c16' }} />
                <span>中转方案：</span>
                <span>{origin}</span>
                <SwapOutlined style={{ color: '#fa8c16' }} />
                <span>{city}</span>
              </Space>
            }
            open={!!city}
            onCancel={() => setTransferModalCity(null)}
            width={screens.md ? 780 : '95%'}
            style={{ top: screens.md ? undefined : 20 }}
            footer={
              <Button
                type="primary"
                icon={<AimOutlined />}
                onClick={() => { setTransferModalCity(null); goToPlan(city!); }}
              >
                去行程规划
              </Button>
            }
          >
            {roundTripItem ? (
              <Space direction="vertical" style={{ width: '100%' }} size={0}>
                <div style={{ color: '#fa8c16', fontWeight: 600, marginBottom: 8 }}>
                  去程（共 {roundTripItem.outboundCount} 条，展示 Top {roundTripItem.outboundRoutes.length}）
                </div>
                {roundTripItem.outboundRoutes.filter(r => r.transferCount > 0).map((r, i) => renderRoute(r, `去程 #${i + 1}`, 'orange'))}
                <div style={{ color: '#fa8c16', fontWeight: 600, margin: '16px 0 8px' }}>
                  返程（共 {roundTripItem.returnCount} 条，展示 Top {roundTripItem.returnRoutes.length}）
                </div>
                {roundTripItem.returnRoutes.filter(r => r.transferCount > 0).map((r, i) => renderRoute(r, `返程 #${i + 1}`, 'orange'))}
              </Space>
            ) : oneWayItem ? (
              <Space direction="vertical" style={{ width: '100%' }} size={0}>
                <div style={{ color: '#8c8c8c', fontWeight: 600, marginBottom: 8 }}>
                  去程（共 {oneWayItem.routeCount} 条，展示 Top {oneWayItem.routes.length}）
                </div>
                {oneWayItem.routes.filter(r => r.transferCount > 0).map((r, i) => renderRoute(r, `去程 #${i + 1}`, 'blue'))}
                <div style={{ color: '#bfbfbf', fontSize: 13, marginTop: 12 }}>无返程方案</div>
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf' }}>无中转方案数据</div>
            )}
          </Modal>
        );
      })()}

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
        width={screens.md ? 1100 : '95%'}
        style={{ top: screens.md ? undefined : 20 }}
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
