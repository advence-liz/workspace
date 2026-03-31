import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Card,
  Form,
  DatePicker,
  Button,
  Select,
  Space,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Radio,
  Grid,
  Drawer,
  Descriptions,
} from 'antd';
import { SearchOutlined, SwapOutlined, ArrowRightOutlined, NodeIndexOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { queryDestinations, getAvailableCities, DestinationResult, discoverTransferDestinations, TransferRoundTripDest, TransferOneWayDest } from '@/api/flight';
import { getDefaultOrigin, setOriginCookie, getDefaultDateRange } from '@/utils/cookie';

const { useBreakpoint } = Grid;

// ─── 主页面 ──────────────────────────────────────────────────
function FlightMap() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'return' | 'oneway' | 'transfer'>('all');
  const [transferRoundTrip, setTransferRoundTrip] = useState<TransferRoundTripDest[]>([]);
  const [transferOneWay, setTransferOneWay] = useState<TransferOneWayDest[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [nodeDrawer, setNodeDrawer] = useState<{ open: boolean; node: any }>({ open: false, node: null });
  // 用 ref 存最新的点击处理逻辑，配合 onEvents 的稳定引用，避免闭包过期又不触发重绑定
  const clickHandlerRef = useRef<(params: any) => void>(() => {});
  // 防止移动端 touch 触发多次 click，300ms 内只响应一次
  const lastClickTimeRef = useRef<number>(0);
  // onEvents 必须是稳定引用，否则 echarts-for-react 每次 render 都重新绑定，导致 Drawer 一闪而过
  const stableOnEvents = useMemo(() => ({
    click: (params: any) => {
      const now = Date.now();
      if (now - lastClickTimeRef.current < 300) return;
      lastClickTimeRef.current = now;
      clickHandlerRef.current(params);
    }
  }), []);

  const doSearch = async (originVal: string, startDate: string, endDate: string, flightType: string) => {
    setLoading(true);
    setTransferRoundTrip([]);
    setTransferOneWay([]);
    try {
      const result = await queryDestinations({
        origin: originVal,
        startDate,
        endDate,
        flightType: (flightType || '2666权益卡航班') as '666权益卡航班' | '2666权益卡航班',
      });
      setDestinations(result.destinations);
      setOrigin(originVal);
      setOriginCookie(originVal);
      if (result.totalCount === 0) message.warning('未找到航班数据');
    } catch {
      message.error('查询失败，请稍后重试');
      return;
    } finally {
      setLoading(false);
    }

    // 主查询完成后，异步触发中转目的地发现（不阻塞主流程）
    setTransferLoading(true);
    discoverTransferDestinations({
      origin: originVal,
      departureDate: startDate,
      endDate,
      maxTransfers: 1,
    }).then(transferResult => {
      setTransferRoundTrip(transferResult.roundTrip);
      setTransferOneWay(transferResult.oneWay);
    }).catch(() => {
      // 中转查询失败不阻断主流程
    }).finally(() => {
      setTransferLoading(false);
    });
  };

  useEffect(() => {
    // 优先读取 URL 参数（从行程规划页面返回时携带）
    const urlOrigin = searchParams.get('origin');
    const urlDepartureDate = searchParams.get('departureDate');
    const urlReturnDate = searchParams.get('returnDate');

    const defaultOrigin = urlOrigin || getDefaultOrigin();
    form.setFieldValue('origin', defaultOrigin);
    if (urlDepartureDate && urlReturnDate) {
      form.setFieldValue('dateRange', [dayjs(urlDepartureDate), dayjs(urlReturnDate)]);
    }

    // 加载城市列表，完成后自动触发初始查询
    getAvailableCities()
      .then(c => {
        setAvailableOrigins(c.cityList?.length ? c.cityList : c.origins);
        // 如果没有 URL 参数提供日期，使用今天~今天+30天（与目的地查询保持一致，命中缓存）
        if (!urlDepartureDate && !urlReturnDate) {
          const [defStart, defEnd] = getDefaultDateRange();
          form.setFieldValue('dateRange', [dayjs(defStart), dayjs(defEnd)]);
        }
        // 自动触发初始查询
        const values = form.getFieldsValue();
        const dateRange = values.dateRange || [];
        const [start, end] = dateRange;
        if (start && end) {
          doSearch(defaultOrigin, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), values.flightType || '2666权益卡航班');
        }
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (values: any) => {
    const [startDate, endDate] = values.dateRange;
    await doSearch(values.origin, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), values.flightType);
  };

  const returnDests = destinations.filter(d => d.hasReturn);
  const onewayDests = destinations.filter(d => !d.hasReturn);

  const visibleDests = useMemo(() => {
    if (viewMode === 'return') return returnDests;
    if (viewMode === 'oneway') return onewayDests;
    if (viewMode === 'transfer') return [];
    return destinations;
  }, [destinations, viewMode, returnDests, onewayDests]);

  // 在 transfer 模式下只显示中转节点；其他模式叠加中转节点
  const showTransfer = viewMode === 'all' || viewMode === 'transfer';

  const chartOption = useMemo(() => {
    const hasDirectDests = visibleDests.length > 0;
    const hasTransferDests = showTransfer && (transferRoundTrip.length > 0 || transferOneWay.length > 0);
    if (!origin || (!hasDirectDests && !hasTransferDests)) return null;

    // 响应式缩放：移动端缩小 20%，PC 端保持原尺寸
    const scale = isMobile ? 0.8 : 1;

    // 节点：出发地固定在画布中心
    const nodes: any[] = [
      {
        id: origin,
        name: origin,
        symbol: 'circle',
        symbolSize: isMobile ? 32 : 6,
        itemStyle: { color: 'rgba(0,0,0,0)', borderWidth: 0 },
        label: { show: true, color: '#facc15', fontWeight: 700, fontSize: Math.round(14 * scale), position: 'bottom' as const, distance: 4 },
        category: 0,
        fixed: !isMobile,
        ...(isMobile ? {} : { x: 400, y: 330 }),
      },
    ];

    const edges: any[] = [];
    const addedNodeIds = new Set<string>([origin]);

    // 直飞目的地
    visibleDests.forEach(dest => {
      const isReturn = dest.hasReturn;
      if (!addedNodeIds.has(dest.destination)) {
        nodes.push({
          id: dest.destination,
          name: dest.destination,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: 'rgba(0,0,0,0)', borderWidth: 0 },
          label: {
            show: true,
            color: isReturn ? '#4ade80' : '#60a5fa',
            fontSize: Math.round(12 * scale),
            fontWeight: isReturn ? 600 : 400,
            position: 'bottom' as const,
            distance: 4,
          },
          category: isReturn ? 1 : 2,
          flightCount: dest.flightCount,
          returnFlightCount: dest.returnFlightCount,
          hasReturn: isReturn,
          availableDates: dest.availableDates,
          returnAvailableDates: dest.returnAvailableDates,
          nodeType: 'direct',
        });
        addedNodeIds.add(dest.destination);
      }

      edges.push({
        source: origin,
        target: dest.destination,
        lineStyle: {
          color: isReturn ? '#4ade80' : '#60a5fa',
          width: (isReturn ? 2 : 1) * scale,
          opacity: isReturn ? 0.8 : 0.45,
          curveness: 0.15,
        },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 7 * scale],
        value: dest.flightCount,
        hasReturn: isReturn,
      });

      if (isReturn) {
        edges.push({
          source: dest.destination,
          target: origin,
          lineStyle: { color: '#a3e635', width: 1.5 * scale, opacity: 0.5, curveness: 0.15, type: 'dashed' },
          symbol: ['none', 'arrow'],
          symbolSize: [0, 6 * scale],
          value: dest.returnFlightCount,
          hasReturn: true,
          isReturn: true,
        });
      }
    });

    // 中转目的地
    if (showTransfer) {
      const addTransferNode = (city: string, isRoundTrip: boolean, via: string, outboundCount: number, returnCount?: number) => {
        if (!addedNodeIds.has(city)) {
          nodes.push({
            id: city,
            name: city,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: 'rgba(0,0,0,0)', borderWidth: 0 },
            label: {
              show: true,
              color: isRoundTrip ? '#fb923c' : '#94a3b8',
              fontSize: Math.round(11 * scale),
              fontWeight: isRoundTrip ? 500 : 400,
              position: 'bottom' as const,
              distance: 4,
            },
            category: isRoundTrip ? 3 : 4,
            nodeType: 'transfer',
            isRoundTrip,
            via,
            outboundCount,
            returnCount,
          });
          addedNodeIds.add(city);
        }

        // 中转虚线边（经由城市 → 目的地，或 origin → 目的地虚线）
        edges.push({
          source: origin,
          target: city,
          lineStyle: {
            color: isRoundTrip ? '#fb923c' : '#94a3b8',
            width: 1 * scale,
            opacity: 0.35,
            curveness: 0.25,
            type: 'dashed',
          },
          symbol: ['none', 'arrow'],
          symbolSize: [0, 5 * scale],
          isTransfer: true,
          isRoundTrip,
          via,
          outboundCount,
          returnCount,
        });
      };

      transferRoundTrip.forEach(item => {
        const outSeg = item.outboundRoutes[0].segments;
        const via = outSeg.length > 1 ? outSeg.slice(0, -1).map((s: any) => s.destination).join('、') : '';
        addTransferNode(item.city, true, via, item.outboundCount, item.returnCount);
      });

      transferOneWay.forEach(item => {
        const outSeg = item.routes[0].segments;
        const via = outSeg.length > 1 ? outSeg.slice(0, -1).map((s: any) => s.destination).join('、') : '';
        addTransferNode(item.city, false, via, item.routeCount);
      });
    }

    return {
      backgroundColor: '#0f172a',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontSize: Math.round(13 * scale) },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const d = params.data;
            const titleSize = Math.round(14 * scale);
            const subtitleSize = Math.round(12 * scale);
            const textSize = Math.round(13 * scale);

            if (d.id === origin) {
              return `<div style="font-weight:700;font-size:${titleSize}px;color:#facc15">${d.name}</div><div style="color:#94a3b8;margin-top:${Math.round(2 * scale)}px;font-size:${subtitleSize}px">出发地</div>`;
            }
            if (d.nodeType === 'transfer') {
              const lines = [
                `<div style="font-weight:700;font-size:${titleSize}px;margin-bottom:${Math.round(4 * scale)}px">${d.name}</div>`,
                d.via ? `<div style="color:#fb923c;font-size:${subtitleSize}px">经 ${d.via} 中转</div>` : '',
                `<div style="font-size:${textSize}px">去程：<b style="color:#fb923c">${d.outboundCount} 条方案</b></div>`,
              ];
              if (d.isRoundTrip) {
                lines.push(`<div style="font-size:${textSize}px">返程：<b style="color:#fb923c">${d.returnCount} 条方案</b></div>`);
                lines.push(`<div style="margin-top:${Math.round(4 * scale)}px;color:#fb923c;font-size:${subtitleSize}px">⇄ 中转往返</div>`);
              } else {
                lines.push(`<div style="margin-top:${Math.round(4 * scale)}px;color:#94a3b8;font-size:${subtitleSize}px">→ 中转单程</div>`);
              }
              return lines.join('');
            }
            const lines = [
              `<div style="font-weight:700;font-size:${titleSize}px;margin-bottom:${Math.round(4 * scale)}px">${d.name}</div>`,
              `<div style="font-size:${textSize}px">✈ 去程：<b style="color:#60a5fa">${d.flightCount} 班</b>（${d.availableDates?.length} 天）</div>`,
            ];
            if (d.hasReturn) {
              lines.push(`<div style="font-size:${textSize}px">↩ 返程：<b style="color:#4ade80">${d.returnFlightCount} 班</b>（${d.returnAvailableDates?.length} 天）</div>`);
              lines.push(`<div style="margin-top:${Math.round(4 * scale)}px;color:#4ade80;font-size:${subtitleSize}px">⇄ 可往返</div>`);
            } else {
              lines.push(`<div style="margin-top:${Math.round(4 * scale)}px;color:#64748b;font-size:${subtitleSize}px">→ 仅单程</div>`);
            }
            return lines.join('');
          }
          if (params.dataType === 'edge') {
            const d = params.data;
            const titleSize = Math.round(13 * scale);
            const textSize = Math.round(12 * scale);
            if (d.isTransfer) {
              return `<div style="color:${d.isRoundTrip ? '#fb923c' : '#94a3b8'};font-size:${titleSize}px">⇌ 中转${d.isRoundTrip ? '往返' : '单程'}</div><div style="font-size:${textSize}px">${d.source} → ${d.target}${d.via ? `（经 ${d.via}）` : ''}</div>`;
            }
            if (d.isReturn) {
              return `<div style="color:#a3e635;font-size:${titleSize}px">↩ 返程航线</div><div style="font-size:${textSize}px">${d.source} → ${d.target}：${d.value} 班</div>`;
            }
            return `<div style="color:${d.hasReturn ? '#4ade80' : '#60a5fa'};font-size:${titleSize}px">✈ 去程航线</div><div style="font-size:${textSize}px">${d.source} → ${d.target}：${d.value} 班</div>`;
          }
          return '';
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: '保存为图片',
            backgroundColor: '#0f172a',
            pixelRatio: 2,
          },
        },
        iconStyle: { borderColor: '#94a3b8' },
        top: 12,
        left: 12,
      },
      legend: isMobile ? { show: false } : {
        data: [
          { name: '出发地', icon: 'none', textStyle: { color: '#facc15', fontWeight: 700 } },
          { name: '可往返', icon: 'none', textStyle: { color: '#4ade80', fontWeight: 600 } },
          { name: '仅单程', icon: 'none', textStyle: { color: '#60a5fa' } },
          { name: '中转往返', icon: 'none', textStyle: { color: '#fb923c', fontWeight: 500 } },
          { name: '中转单程', icon: 'none', textStyle: { color: '#94a3b8' } },
        ],
        textStyle: { color: '#94a3b8' },
        top: 12,
        right: 16,
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          nodes,
          edges,
          categories: [
            { name: '出发地' },
            { name: '可往返' },
            { name: '仅单程' },
            { name: '中转往返' },
            { name: '中转单程' },
          ],
          center: ['50%', '50%'],
          zoom: isMobile ? 0.85 : 0.6,
          force: {
            repulsion: isMobile ? 400 : 600,
            gravity: isMobile ? 0.35 : 0.25,
            edgeLength: isMobile ? [140, 260] : [200, 360],
            layoutAnimation: true,
            friction: 0.6,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: isMobile ? 3 : 4 },
          },
          label: {
            position: 'bottom',
            distance: 4,
          },
          edgeSymbol: ['none', 'arrow'],
          lineStyle: { curveness: 0.15 },
        },
      ],
    };
  }, [origin, visibleDests, showTransfer, transferRoundTrip, transferOneWay, isMobile]);

  // 每次 render 更新 ref，确保点击时读到最新的 isMobile/origin
  clickHandlerRef.current = (params: any) => {
    if (params.dataType !== 'node' || params.data?.id === origin) return;
    if (isMobile) {
      setNodeDrawer({ open: true, node: params.data });
    } else {
      const values = form.getFieldsValue();
      const [startDate, endDate] = values.dateRange || [];
      const start = startDate ? startDate.format('YYYY-MM-DD') : '';
      const end = endDate ? endDate.format('YYYY-MM-DD') : '';
      const p = new URLSearchParams({
        tab: 'plan',
        origin,
        destination: params.data.id,
        departureDate: start,
        departureDateEnd: end,
        returnDate: start,
        returnDateEnd: end,
      });
      navigate(`/route-planner?${p.toString()}`);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Form
          form={form}
          layout={isMobile ? 'vertical' : 'inline'}
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
                  <Select placeholder="请选择出发地" showSearch style={{ width: '100%' }}
                    filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                    options={availableOrigins.map(c => ({ value: c, label: c }))} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="dateRange" label="日期范围" rules={[{ required: true }]}>
                  <DatePicker.RangePicker style={{ width: '100%' }}
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
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} block>查询</Button>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <>
              <Form.Item name="origin" label="出发地" rules={[{ required: true, message: '请选择出发地' }]}>
                <Select placeholder="请选择出发地" style={{ width: 180 }} showSearch
                  filterOption={(input, option) => (option?.value?.toString() || '').includes(input)}
                  options={availableOrigins.map(c => ({ value: c, label: c }))} />
              </Form.Item>
              <Form.Item name="dateRange" label="日期范围" rules={[{ required: true }]}>
                <DatePicker.RangePicker />
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

      {destinations.length > 0 && (
        <Card
          styles={{ body: { padding: 0 } }}
          title={
            <div>
              <div style={{ marginBottom: isMobile ? 12 : 0 }}>
                <span>航线关系图</span>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={8} sm={8} md={8}>
                  <Statistic
                    value={returnDests.length}
                    suffix={isMobile ? '' : '个可往返'}
                    title={isMobile ? '可往返' : undefined}
                    valueStyle={{ color: '#4ade80', fontSize: isMobile ? 16 : 18 }}
                    prefix={<SwapOutlined />}
                  />
                </Col>
                <Col xs={8} sm={8} md={8}>
                  <Statistic
                    value={onewayDests.length}
                    suffix={isMobile ? '' : '个仅单程'}
                    title={isMobile ? '仅单程' : undefined}
                    valueStyle={{ color: '#60a5fa', fontSize: isMobile ? 16 : 18 }}
                    prefix={<ArrowRightOutlined />}
                  />
                </Col>
                <Col xs={8} sm={8} md={8}>
                  <Statistic
                    value={transferRoundTrip.length + transferOneWay.length}
                    suffix={transferLoading ? (isMobile ? '...' : '搜索中...') : (isMobile ? '' : '个中转')}
                    title={isMobile ? '中转' : undefined}
                    valueStyle={{ color: '#fb923c', fontSize: isMobile ? 16 : 18 }}
                    prefix={<NodeIndexOutlined />}
                  />
                </Col>
              </Row>
            </div>
          }
          extra={
            isMobile ? (
              <Radio.Group
                value={viewMode}
                onChange={e => setViewMode(e.target.value)}
                size="small"
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="all">全</Radio.Button>
                <Radio.Button value="return">往返</Radio.Button>
                <Radio.Button value="oneway">单程</Radio.Button>
                <Radio.Button value="transfer">中转</Radio.Button>
              </Radio.Group>
            ) : (
              <Space>
                <Space size={6}>
                  <Tag color="warning">出发地</Tag>
                  <Tag color="success">可往返</Tag>
                  <Tag color="processing">仅单程</Tag>
                  <Tag color="orange">中转</Tag>
                </Space>
                <Radio.Group
                  value={viewMode}
                  onChange={e => setViewMode(e.target.value)}
                  size="small"
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="return">仅往返</Radio.Button>
                  <Radio.Button value="oneway">仅单程</Radio.Button>
                  <Radio.Button value="transfer">仅中转</Radio.Button>
                </Radio.Group>
              </Space>
            )
          }
        >
          {chartOption ? (
            <ReactECharts
              option={chartOption}
              style={{ height: isMobile ? Math.round(window.innerHeight * 0.62) : 660, background: '#0f172a' }}
              opts={{ renderer: 'canvas' }}
              showLoading={loading}
              onEvents={stableOnEvents}
            />
          ) : (
            <div style={{ height: isMobile ? Math.round(window.innerHeight * 0.62) : 660, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#475569' }}>
              暂无数据
            </div>
          )}
          <div style={{ padding: '8px 16px', background: '#0f172a', color: '#475569', fontSize: isMobile ? 11 : 12, borderTop: '1px solid #1e293b' }}>
            {isMobile ? (
              <span>提示：双指缩放 · 点击节点查看详情 · <span style={{ color: '#60a5fa' }}>点击目的地跳转规划</span></span>
            ) : (
              <span>提示：可拖拽节点调整布局 · 滚轮缩放 · 悬浮节点查看详情 · <span style={{ color: '#60a5fa' }}>点击目的地节点跳转行程规划</span></span>
            )}
          </div>
        </Card>
      )}

      {/* 移动端：节点详情底部抽屉 */}
      <Drawer
        open={nodeDrawer.open}
        onClose={() => setNodeDrawer({ open: false, node: null })}
        placement="bottom"
        height="auto"
        title={nodeDrawer.node ? (
          <Space>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{nodeDrawer.node.name}</span>
            {nodeDrawer.node.nodeType === 'direct' && nodeDrawer.node.hasReturn && <Tag color="success">可往返</Tag>}
            {nodeDrawer.node.nodeType === 'direct' && !nodeDrawer.node.hasReturn && <Tag color="processing">仅单程</Tag>}
            {nodeDrawer.node.nodeType === 'transfer' && nodeDrawer.node.isRoundTrip && <Tag color="orange">中转往返</Tag>}
            {nodeDrawer.node.nodeType === 'transfer' && !nodeDrawer.node.isRoundTrip && <Tag color="default">中转单程</Tag>}
          </Space>
        ) : null}
        styles={{ body: { paddingTop: 12, paddingBottom: 24 } }}
      >
        {nodeDrawer.node && (() => {
          const n = nodeDrawer.node;
          const isTransfer = n.nodeType === 'transfer';
          return (
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <Descriptions column={2} size="small">
                {!isTransfer && (
                  <>
                    <Descriptions.Item label="去程航班">{n.flightCount} 班</Descriptions.Item>
                    {n.hasReturn && <Descriptions.Item label="返程航班">{n.returnFlightCount} 班</Descriptions.Item>}
                    {n.availableDates?.length > 0 && (
                      <Descriptions.Item label="去程日期" span={2}>
                        <Space size={4} wrap>
                          <CalendarOutlined style={{ color: '#60a5fa' }} />
                          {n.availableDates.slice(0, 5).join('、')}
                          {n.availableDates.length > 5 && `…共${n.availableDates.length}天`}
                        </Space>
                      </Descriptions.Item>
                    )}
                    {n.hasReturn && n.returnAvailableDates?.length > 0 && (
                      <Descriptions.Item label="返程日期" span={2}>
                        <Space size={4} wrap>
                          <CalendarOutlined style={{ color: '#4ade80' }} />
                          {n.returnAvailableDates.slice(0, 5).join('、')}
                          {n.returnAvailableDates.length > 5 && `…共${n.returnAvailableDates.length}天`}
                        </Space>
                      </Descriptions.Item>
                    )}
                  </>
                )}
                {isTransfer && (
                  <>
                    {n.via && <Descriptions.Item label="中转经由" span={2}>{n.via}</Descriptions.Item>}
                    <Descriptions.Item label="去程方案">{n.outboundCount} 条</Descriptions.Item>
                    {n.isRoundTrip && <Descriptions.Item label="返程方案">{n.returnCount} 条</Descriptions.Item>}
                  </>
                )}
              </Descriptions>
              <Button
                type="primary"
                block
                size="large"
                icon={<SearchOutlined />}
                onClick={() => {
                  const values = form.getFieldsValue();
                  const [startDate, endDate] = values.dateRange || [];
                  const start = startDate ? startDate.format('YYYY-MM-DD') : '';
                  const end = endDate ? endDate.format('YYYY-MM-DD') : '';
                  const p = new URLSearchParams({
                    tab: 'plan',
                    origin,
                    destination: n.id,
                    departureDate: start,
                    departureDateEnd: end,
                    returnDate: start,
                    returnDateEnd: end,
                  });
                  setNodeDrawer({ open: false, node: null });
                  navigate(`/route-planner?${p.toString()}`);
                }}
              >
                规划 {origin} → {nodeDrawer.node.name} 行程
              </Button>
            </Space>
          );
        })()}
      </Drawer>
    </Space>
  );
}

export default FlightMap;
