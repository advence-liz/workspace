import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  message,
  Divider,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Steps,
  Table,
  Tag,
  Modal,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ThunderboltOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
  initializeDiscoverAirports,
  initializeDiscoverFlights,
  triggerCrawler,
  queryCrawlerLogs,
  getCrawlerLogDetail,
  getCrawlerLogStats,
  cleanOldLogs,
  cleanAllLogs,
  type CrawlerLog,
  type LogStats,
} from '@/api/flight';

dayjs.extend(duration);

const { Title, Paragraph, Text } = Typography;

function DataManagement() {
  const [discoverForm] = Form.useForm();
  const [refreshForm] = Form.useForm();
  const [allForm] = Form.useForm();

  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);

  const [discoverResult, setDiscoverResult] = useState<{
    airportCount?: number;
    flightCount?: number;
  }>({});
  const [refreshResult, setRefreshResult] = useState<{ count?: number }>({});
  const [allResult, setAllResult] = useState<{ count?: number }>({});

  // 日志相关状态
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [logsFilter, setLogsFilter] = useState<{
    taskType?: string;
    status?: string;
  }>({});
  const [selectedLog, setSelectedLog] = useState<CrawlerLog | null>(null);
  const [logDetailVisible, setLogDetailVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // 默认 5 秒
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [logStats, setLogStats] = useState<LogStats | null>(null);

  // 加载执行日志
  const loadLogs = async (page = 1, pageSize = 10) => {
    setLogsLoading(true);
    try {
      const result = await queryCrawlerLogs({
        ...logsFilter,
        page,
        pageSize,
      });
      setLogs(result.logs);
      setLogsPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error) {
      message.error('加载日志失败');
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  // 加载日志统计
  const loadLogStats = async () => {
    try {
      const stats = await getCrawlerLogStats();
      setLogStats(stats);
    } catch (error) {
      console.error('加载统计失败', error);
    }
  };

  // 查看日志详情
  const handleViewLogDetail = async (log: CrawlerLog) => {
    try {
      const detail = await getCrawlerLogDetail(log.id);
      setSelectedLog(detail);
      setLogDetailVisible(true);
    } catch (error) {
      message.error('加载日志详情失败');
      console.error(error);
    }
  };

  // 初始加载
  useEffect(() => {
    loadLogs();
    loadLogStats();
  }, [logsFilter]);

  // 自动刷新逻辑
  useEffect(() => {
    // 清除旧的定时器
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

    // 如果开启自动刷新，设置新的定时器
    if (autoRefresh) {
      autoRefreshTimerRef.current = setInterval(() => {
        loadLogs(logsPagination.current, logsPagination.pageSize);
        loadLogStats();
      }, refreshInterval * 1000);
    }

    // 清理函数
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, logsPagination.current, logsPagination.pageSize]);

  // 切换自动刷新
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      message.success(`已开启自动刷新（每 ${refreshInterval} 秒）`);
    } else {
      message.info('已关闭自动刷新');
    }
  };

  // 发现机场
  const handleDiscoverAirports = async (values: { days: number }) => {
    setDiscoverLoading(true);
    try {
      const result = await initializeDiscoverAirports(values.days);
      if (result.success) {
        message.success(result.message);
        setDiscoverResult({
          airportCount: result.airportCount,
          flightCount: result.flightCount,
        });
        // 刷新日志
        loadLogs(logsPagination.current, logsPagination.pageSize);
        loadLogStats();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('机场发现失败');
      console.error(error);
    } finally {
      setDiscoverLoading(false);
    }
  };

  // 发现航班
  const handleRefreshFlights = async (values: { days: number }) => {
    setRefreshLoading(true);
    try {
      const result = await initializeDiscoverFlights(values.days);
      if (result.success) {
        message.success(result.message);
        setRefreshResult({ count: result.count });
        // 刷新日志
        loadLogs(logsPagination.current, logsPagination.pageSize);
        loadLogStats();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('航班发现失败');
      console.error(error);
    } finally {
      setRefreshLoading(false);
    }
  };

  // 一键初始化
  const handleInitializeAll = async () => {
    setAllLoading(true);
    try {
      const result = await triggerCrawler();
      if (result.success) {
        message.success(`一键初始化完成！共爬取 ${result.count} 条航班`);
        setAllResult({ count: result.count });
        // 刷新日志
        loadLogs(logsPagination.current, logsPagination.pageSize);
        loadLogStats();
      } else {
        message.error('一键初始化失败');
      }
    } catch (error) {
      message.error('一键初始化失败');
      console.error(error);
    } finally {
      setAllLoading(false);
    }
  };

  // 清理旧日志
  const handleCleanOldLogs = () => {
    Modal.confirm({
      title: '清理旧日志',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>将清理 90 天前的日志记录。</p>
          <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请确认！</p>
        </div>
      ),
      okText: '确认清理',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await cleanOldLogs(90);
          message.success(result.message);
          loadLogs(logsPagination.current, logsPagination.pageSize);
          loadLogStats();
        } catch (error) {
          message.error('清理失败');
          console.error(error);
        }
      },
    });
  };

  // 清理所有日志
  const handleCleanAllLogs = () => {
    Modal.confirm({
      title: '清理所有日志',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ 危险操作！将删除所有日志记录！
          </p>
          <p>此操作不可恢复，请谨慎操作！</p>
        </div>
      ),
      okText: '确认清理',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await cleanAllLogs();
          message.success(result.message);
          loadLogs(1, logsPagination.pageSize);
          loadLogStats();
        } catch (error) {
          message.error('清理失败');
          console.error(error);
        }
      },
    });
  };

  // 任务类型映射
  const taskTypeMap = {
    discover_airports: '发现机场',
    refresh_flights: '发现航班',
    full_initialize: '一键初始化',
  };

  // 状态映射
  const statusMap = {
    running: { text: '执行中', color: 'processing' },
    success: { text: '成功', color: 'success' },
    failed: { text: '失败', color: 'error' },
  };

  // 日志表格列
  const logColumns: ColumnsType<CrawlerLog> = [
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: string) => taskTypeMap[type as keyof typeof taskTypeMap] || type,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return (
          <Tag color={statusInfo?.color}>{statusInfo?.text || status}</Tag>
        );
      },
    },
    {
      title: '爬取天数',
      dataIndex: 'days',
      key: 'days',
      render: (days?: number) => days ? `${days} 天` : '-',
    },
    {
      title: '机场数',
      dataIndex: 'airportCount',
      key: 'airportCount',
    },
    {
      title: '航班数',
      dataIndex: 'flightCount',
      key: 'flightCount',
    },
    {
      title: '执行时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: number) => {
        if (!duration) return '-';
        const d = dayjs.duration(duration, 'seconds');
        if (duration < 60) {
          return `${duration} 秒`;
        } else if (duration < 3600) {
          return `${d.minutes()} 分 ${d.seconds()} 秒`;
        } else {
          return `${d.hours()} 小时 ${d.minutes()} 分`;
        }
      },
    },
    {
      title: '执行时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CrawlerLog) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewLogDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数据管理</Title>
      <Paragraph type="secondary">
        管理航班数据的爬取和更新，支持分步执行或一键初始化
      </Paragraph>

      <Divider />

      {/* 使用说明 */}
      <Alert
        message="使用说明"
        description={
          <div>
            <p>
              <strong>首次使用：</strong>建议使用"一键初始化"快速获取所有数据
            </p>
            <p>
              <strong>定期更新：</strong>使用"发现航班"更新航班数据（推荐每天执行）
            </p>
            <p>
              <strong>分步执行：</strong>如需自定义时间范围，可分别执行"发现机场"和"发现航班"
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 执行流程 */}
      <Card title="执行流程" style={{ marginBottom: 24 }}>
        <Steps
          items={[
            {
              title: '发现机场',
              description: '从种子机场爬取数据，发现所有可用机场',
              icon: <DatabaseOutlined />,
            },
            {
              title: '发现航班',
              description: '基于已发现的机场，全量爬取航班数据',
              icon: <ReloadOutlined />,
            },
            {
              title: '完成',
              description: '数据已就绪，可以开始查询',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </Card>

      <Row gutter={24}>
        {/* 一键初始化 */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                一键初始化（推荐）
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Paragraph type="secondary">
              自动执行"发现机场"和"发现航班"两个步骤，使用默认配置（发现机场
              1 天，发现航班 7 天）
            </Paragraph>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                loading={allLoading}
                onClick={handleInitializeAll}
                block
              >
                开始一键初始化
              </Button>

              {allResult.count !== undefined && (
                <Card size="small">
                  <Statistic
                    title="爬取结果"
                    value={allResult.count}
                    suffix="条航班"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              )}
            </Space>
          </Card>
        </Col>

        {/* 发现机场 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                步骤 1：发现机场
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Paragraph type="secondary">
              从种子机场爬取航班数据，自动发现所有可用的出发地和目的地机场
            </Paragraph>

            <Form
              form={discoverForm}
              layout="vertical"
              onFinish={handleDiscoverAirports}
              initialValues={{ days: 1 }}
            >
              <Form.Item
                name="days"
                label="爬取天数"
                rules={[{ required: true, message: '请输入爬取天数' }]}
                extra="建议 1 天即可快速发现所有机场"
              >
                <InputNumber
                  min={1}
                  max={7}
                  style={{ width: '100%' }}
                  addonAfter="天"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<DatabaseOutlined />}
                  loading={discoverLoading}
                  block
                >
                  开始发现机场
                </Button>
              </Form.Item>
            </Form>

            {(discoverResult.airportCount !== undefined ||
              discoverResult.flightCount !== undefined) && (
              <Card size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="发现机场"
                      value={discoverResult.airportCount}
                      suffix="个"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="临时航班"
                      value={discoverResult.flightCount}
                      suffix="条"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </Card>
        </Col>

        {/* 发现航班 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReloadOutlined />
                步骤 2：发现航班
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Paragraph type="secondary">
              基于已发现的机场，全量爬取指定天数的航班数据
            </Paragraph>

            <Form
              form={refreshForm}
              layout="vertical"
              onFinish={handleRefreshFlights}
              initialValues={{ days: 7 }}
            >
              <Form.Item
                name="days"
                label="爬取天数"
                rules={[{ required: true, message: '请输入爬取天数' }]}
                extra="建议 7-30 天，天数越多爬取时间越长"
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  addonAfter="天"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<ReloadOutlined />}
                  loading={refreshLoading}
                  block
                >
                  开始发现航班
                </Button>
              </Form.Item>
            </Form>

            {refreshResult.count !== undefined && (
              <Card size="small">
                <Statistic
                  title="爬取航班"
                  value={refreshResult.count}
                  suffix="条"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            )}
          </Card>
        </Col>
      </Row>

      {/* 注意事项 */}
      <Alert
        message="注意事项"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>
              <Text strong>执行顺序：</Text>
              首次使用必须先执行"发现机场"，再执行"发现航班"
            </li>
            <li>
              <Text strong>时间范围：</Text>
              发现机场建议 1 天（快速发现），发现航班建议 7-30 天（获取完整数据）
            </li>
            <li>
              <Text strong>执行时间：</Text>
              爬取时间与天数和机场数量成正比，请耐心等待
            </li>
            <li>
              <Text strong>数据更新：</Text>
              发现航班会清理旧数据并重新爬取，确保数据最新
            </li>
            <li>
              <Text strong>频率控制：</Text>
              建议每天执行一次，避免频繁爬取对服务器造成压力
            </li>
          </ul>
        }
        type="warning"
        showIcon
      />

      <Divider />

      {/* 执行日志 */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            执行日志
          </Space>
        }
        extra={
          <Space size="large">
            {logStats && (
              <Space size="large">
                <Statistic
                  title="总执行次数"
                  value={logStats.total}
                  valueStyle={{ fontSize: 16 }}
                />
                <Statistic
                  title="成功"
                  value={logStats.successCount}
                  valueStyle={{ fontSize: 16, color: '#3f8600' }}
                />
                <Statistic
                  title="失败"
                  value={logStats.failedCount}
                  valueStyle={{ fontSize: 16, color: '#cf1322' }}
                />
                <Statistic
                  title="今日执行"
                  value={logStats.todayCount}
                  valueStyle={{ fontSize: 16, color: '#1890ff' }}
                />
              </Space>
            )}
            <Button
              type={autoRefresh ? 'primary' : 'default'}
              icon={<SyncOutlined spin={autoRefresh} />}
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? `自动刷新中 (${refreshInterval}s)` : '自动刷新'}
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleCleanOldLogs}
            >
              清理旧日志
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleCleanAllLogs}
            >
              清理所有
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="任务类型"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setLogsFilter({ ...logsFilter, taskType: value })}
            >
              <Select.Option value="discover_airports">发现机场</Select.Option>
              <Select.Option value="refresh_flights">发现航班</Select.Option>
              <Select.Option value="full_initialize">一键初始化</Select.Option>
            </Select>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setLogsFilter({ ...logsFilter, status: value })}
            >
              <Select.Option value="running">执行中</Select.Option>
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
            </Select>
            {autoRefresh && (
              <Select
                value={refreshInterval}
                style={{ width: 120 }}
                onChange={(value) => {
                  setRefreshInterval(value);
                  message.info(`刷新间隔已设置为 ${value} 秒`);
                }}
              >
                <Select.Option value={3}>3 秒</Select.Option>
                <Select.Option value={5}>5 秒</Select.Option>
                <Select.Option value={10}>10 秒</Select.Option>
                <Select.Option value={30}>30 秒</Select.Option>
                <Select.Option value={60}>60 秒</Select.Option>
              </Select>
            )}
          </Space>
        </Space>

        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          loading={logsLoading}
          pagination={{
            ...logsPagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              loadLogs(page, pageSize);
            },
          }}
        />
      </Card>

      {/* 日志详情 Modal */}
      <Modal
        title="执行日志详情"
        open={logDetailVisible}
        onCancel={() => setLogDetailVisible(false)}
        width={800}
        footer={null}
      >
        {selectedLog && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="任务类型" value={taskTypeMap[selectedLog.taskType as keyof typeof taskTypeMap]} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="状态"
                  value={statusMap[selectedLog.status as keyof typeof statusMap]?.text}
                  valueStyle={{
                    color: selectedLog.status === 'success' ? '#3f8600' : selectedLog.status === 'failed' ? '#cf1322' : '#1890ff',
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic title="爬取天数" value={selectedLog.days || '-'} suffix="天" />
              </Col>
              <Col span={12}>
                <Statistic title="发现机场" value={selectedLog.airportCount} suffix="个" />
              </Col>
              <Col span={12}>
                <Statistic title="爬取航班" value={selectedLog.flightCount} suffix="条" />
              </Col>
              <Col span={12}>
                <Statistic
                  title="执行时长"
                  value={selectedLog.duration ? `${Math.floor(selectedLog.duration / 60)}:${(selectedLog.duration % 60).toString().padStart(2, '0')}` : '-'}
                  suffix={selectedLog.duration ? '分:秒' : ''}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="开始时间"
                  value={dayjs(selectedLog.startTime).format('YYYY-MM-DD HH:mm:ss')}
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="结束时间"
                  value={selectedLog.endTime ? dayjs(selectedLog.endTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
            </Row>

            {selectedLog.details && (
              <div>
                <Title level={5}>详细信息</Title>
                <pre style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: 'auto',
                }}>
                  {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.errorMessage && (
              <Alert
                message="错误信息"
                description={selectedLog.errorMessage}
                type="error"
                showIcon
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}

export default DataManagement;
