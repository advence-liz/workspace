import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'antd';
import { SearchOutlined, SwapOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { queryDestinations, getAvailableCities, DestinationResult } from '@/api/flight';
import { getDefaultOrigin, setOriginCookie } from '@/utils/cookie';

// ─── 主页面 ──────────────────────────────────────────────────
function FlightMap() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'return' | 'oneway'>('all');
  const doSearch = async (originVal: string, startDate: string, endDate: string, flightType: string) => {
    setLoading(true);
    try {
      const result = await queryDestinations({
        origin: originVal,
        startDate,
        endDate,
        flightType: (flightType || '全部') as '全部' | '666权益卡' | '2666权益卡',
      });
      setDestinations(result.destinations);
      setOrigin(originVal);
      setOriginCookie(originVal);
      if (result.totalCount === 0) message.warning('未找到航班数据');
    } catch {
      message.error('查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultOrigin = getDefaultOrigin();
    form.setFieldValue('origin', defaultOrigin);

    // 加载城市列表，完成后自动触发初始查询
    getAvailableCities()
      .then(c => {
        setAvailableOrigins(c.origins);
        // 自动触发初始查询
        const values = form.getFieldsValue();
        const [start, end] = values.dateRange;
        doSearch(defaultOrigin, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), values.flightType || '全部');
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
    return destinations;
  }, [destinations, viewMode, returnDests, onewayDests]);

  const chartOption = useMemo(() => {
    if (!origin || visibleDests.length === 0) return null;

    // 节点：出发地固定在画布中心（50%, 50%）
    const nodes: any[] = [
      {
        id: origin,
        name: origin,
        symbolSize: 48,
        itemStyle: { color: '#facc15' },
        label: {
          show: true,
          color: '#1a1a1a',
          fontWeight: 700,
          fontSize: 13,
        },
        category: 0,
        fixed: true,
        x: 0,
        y: 0,
      },
    ];

    const edges: any[] = [];

    visibleDests.forEach(dest => {
      const isReturn = dest.hasReturn;

      nodes.push({
        id: dest.destination,
        name: dest.destination,
        symbolSize: Math.max(20, Math.min(38, dest.flightCount * 1.2 + 14)),
        itemStyle: {
          color: isReturn ? '#4ade80' : '#60a5fa',
          borderColor: isReturn ? '#16a34a' : '#2563eb',
          borderWidth: 1.5,
        },
        label: {
          show: true,
          color: '#e2e8f0',
          fontSize: 11,
        },
        category: isReturn ? 1 : 2,
        flightCount: dest.flightCount,
        returnFlightCount: dest.returnFlightCount,
        hasReturn: isReturn,
        availableDates: dest.availableDates,
        returnAvailableDates: dest.returnAvailableDates,
      });

      // 去程边
      edges.push({
        source: origin,
        target: dest.destination,
        lineStyle: {
          color: isReturn ? '#4ade80' : '#60a5fa',
          width: isReturn ? 2 : 1,
          opacity: isReturn ? 0.8 : 0.45,
          curveness: 0.15,
        },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 7],
        value: dest.flightCount,
        hasReturn: isReturn,
      });

      // 返程边（反向，虚线）
      if (isReturn) {
        edges.push({
          source: dest.destination,
          target: origin,
          lineStyle: {
            color: '#a3e635',
            width: 1.5,
            opacity: 0.5,
            curveness: 0.15,
            type: 'dashed',
          },
          symbol: ['none', 'arrow'],
          symbolSize: [0, 6],
          value: dest.returnFlightCount,
          hasReturn: true,
          isReturn: true,
        });
      }
    });

    return {
      backgroundColor: '#0f172a',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontSize: 13 },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const d = params.data;
            if (d.id === origin) {
              return `<div style="font-weight:700;font-size:14px;color:#facc15">${d.name}</div><div style="color:#94a3b8;margin-top:2px">出发地</div>`;
            }
            const lines = [
              `<div style="font-weight:700;font-size:14px;margin-bottom:6px">${d.name}</div>`,
              `<div>✈ 去程：<b style="color:#60a5fa">${d.flightCount} 班</b>（${d.availableDates?.length} 天）</div>`,
            ];
            if (d.hasReturn) {
              lines.push(`<div>↩ 返程：<b style="color:#4ade80">${d.returnFlightCount} 班</b>（${d.returnAvailableDates?.length} 天）</div>`);
              lines.push(`<div style="margin-top:6px;color:#4ade80;font-size:12px">⇄ 可往返</div>`);
            } else {
              lines.push(`<div style="margin-top:6px;color:#64748b;font-size:12px">→ 仅单程</div>`);
            }
            return lines.join('');
          }
          if (params.dataType === 'edge') {
            const d = params.data;
            if (d.isReturn) {
              return `<div style="color:#a3e635">↩ 返程航线</div><div>${d.source} → ${d.target}：${d.value} 班</div>`;
            }
            return `<div style="color:${d.hasReturn ? '#4ade80' : '#60a5fa'}">✈ 去程航线</div><div>${d.source} → ${d.target}：${d.value} 班</div>`;
          }
          return '';
        },
      },
      legend: {
        data: [
          { name: '出发地', icon: 'circle', itemStyle: { color: '#facc15' } },
          { name: '可往返', icon: 'circle', itemStyle: { color: '#4ade80' } },
          { name: '仅单程', icon: 'circle', itemStyle: { color: '#60a5fa' } },
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
          ],
          center: ['50%', '50%'],
          zoom: 0.6,
          force: {
            repulsion: 500,
            gravity: 0.12,
            edgeLength: [180, 320],
            layoutAnimation: true,
            friction: 0.6,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 4 },
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
  }, [origin, visibleDests]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
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
              style={{ width: 160 }}
              showSearch
              filterOption={(input, option) =>
                (option?.value?.toString() || '').includes(input)
              }
              options={availableOrigins.map(c => ({ value: c, label: c }))}
            />
          </Form.Item>

          <Form.Item name="dateRange" label="日期范围" rules={[{ required: true }]}>
            <DatePicker.RangePicker />
          </Form.Item>

          <Form.Item name="flightType" label="权益卡">
            <Select style={{ width: 140 }}>
              <Select.Option value="全部">全部权益卡</Select.Option>
              <Select.Option value="666权益卡航班">666权益卡</Select.Option>
              <Select.Option value="2666权益卡航班">2666权益卡</Select.Option>
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
        <Card
          styles={{ body: { padding: 0 } }}
          title={
            <Space size="large">
              <span>航线关系图</span>
              <Row gutter={24}>
                <Col>
                  <Statistic
                    value={returnDests.length}
                    suffix="个可往返"
                    valueStyle={{ color: '#4ade80', fontSize: 18 }}
                    prefix={<SwapOutlined />}
                  />
                </Col>
                <Col>
                  <Statistic
                    value={onewayDests.length}
                    suffix="个仅单程"
                    valueStyle={{ color: '#60a5fa', fontSize: 18 }}
                    prefix={<ArrowRightOutlined />}
                  />
                </Col>
              </Row>
            </Space>
          }
          extra={
            <Space>
              <Space size={6}>
                <Tag color="warning">出发地</Tag>
                <Tag color="success">可往返</Tag>
                <Tag color="processing">仅单程</Tag>
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
              </Radio.Group>
            </Space>
          }
        >
          {chartOption ? (
            <ReactECharts
              option={chartOption}
              style={{ height: 660, background: '#0f172a' }}
              opts={{ renderer: 'canvas' }}
              showLoading={loading}
              onEvents={{
                click: (params: any) => {
                  // 点击目的地节点（非出发地）跳转到行程规划
                  if (params.dataType === 'node' && params.data?.id !== origin) {
                    const values = form.getFieldsValue();
                    const [startDate, endDate] = values.dateRange || [];
                    const p = new URLSearchParams({
                      tab: 'plan',
                      origin,
                      destination: params.data.id,
                      departureDate: startDate ? startDate.format('YYYY-MM-DD') : '',
                      returnDate: endDate ? endDate.format('YYYY-MM-DD') : '',
                    });
                    navigate(`/route-planner?${p.toString()}`);
                  }
                },
              }}
            />
          ) : (
            <div style={{ height: 660, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#475569' }}>
              暂无数据
            </div>
          )}
          <div style={{ padding: '8px 16px', background: '#0f172a', color: '#475569', fontSize: 12, borderTop: '1px solid #1e293b' }}>
            提示：可拖拽节点调整布局 · 滚轮缩放 · 悬浮节点查看详情 · <span style={{ color: '#60a5fa' }}>点击目的地节点跳转行程规划</span>
          </div>
        </Card>
      )}
    </Space>
  );
}

export default FlightMap;
