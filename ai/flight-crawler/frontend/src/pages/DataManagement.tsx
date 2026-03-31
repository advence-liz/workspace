import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  message,
  Divider,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Modal,
  DatePicker,
  Descriptions,
  InputNumber,
  Input,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getAdminToken, setAdminToken } from '@/utils/auth';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
  initializeDiscoverAirports,
  initializeDiscoverFlights,
  queryCrawlerLogs,
  getCrawlerLogDetail,
  getCrawlerLogStats,
  getSubLogs,
  stopCrawler,
  cleanOldLogs,
  cleanAllLogs,
  type CrawlerLog,
  type LogStats,
  type DiscoverAirportsExecutionPlan,
} from '@/api/flight';

dayjs.extend(duration);

const { Title, Paragraph, Text } = Typography;

function DataManagement() {
  const [discoverForm] = Form.useForm();
  const [refreshForm] = Form.useForm();

  // Admin Token 相关状态
  const [adminToken, setAdminTokenState] = useState(getAdminToken);
  const [tokenInput, setTokenInput] = useState(getAdminToken);

  // 发现机场相关状态
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<any>(null);
  const [discoverPlan, setDiscoverPlan] = useState<DiscoverAirportsExecutionPlan | null>(null);

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{
    executionPlan?: any;
    executionResult?: any;
  }>({});

  // 执行计划相关状态
  const [executionPlan, setExecutionPlan] = useState<any>(null);

  // 停止任务
  const [stopLoading, setStopLoading] = useState(false);



  // 日志相关状态
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [logsFilter] = useState<{
    taskType?: string;
    status?: string;
  }>({});
  const [selectedLog, setSelectedLog] = useState<CrawlerLog | null>(null);
  const [logDetailVisible, setLogDetailVisible] = useState(false);
  const [subLogs, setSubLogs] = useState<CrawlerLog[]>([]);
  const [subLogsLoading, setSubLogsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5); // 默认 5 秒
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [logStats, setLogStats] = useState<LogStats | null>(null);

  // 加载执行日志
  const loadLogs = async (page = 1, pageSize = 10) => {
    setLogsLoading(true);
    try {
      const result = await queryCrawlerLogs({
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
      setSubLogs([]);

      // 如果是发现航班父任务，加载子任务列表
      if (log.taskType === 'refresh_flights') {
        setSubLogsLoading(true);
        try {
          const subs = await getSubLogs(log.id);
          setSubLogs(subs);
        } catch {
          // 子任务加载失败不影响主详情展示
        } finally {
          setSubLogsLoading(false);
        }
      }
    } catch (error) {
      message.error('加载日志详情失败');
      console.error(error);
    }
  };


  // 初始加载
  useEffect(() => {
    loadLogs();
    loadLogStats();
    // 默认天数为 1，自动生成初始执行计划
    handleDiscoverDaysChange(1);
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
        // 如果详情弹窗打开且是发现航班父任务，同步刷新子任务列表
        if (logDetailVisible && selectedLog?.taskType === 'refresh_flights') {
          getSubLogs(selectedLog.id).then(subs => setSubLogs(subs)).catch(() => {});
        }
      }, refreshInterval * 1000);
    }

    // 清理函数
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, logsPagination.current, logsPagination.pageSize, logDetailVisible, selectedLog]);

  // 停止当前运行中的任务
  const handleStop = () => {
    Modal.confirm({
      title: '确认停止任务',
      icon: <ExclamationCircleOutlined />,
      content: '将强制停止当前运行中的爬虫任务，锁将被释放，任务状态标记为失败。确定继续？',
      okText: '确认停止',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setStopLoading(true);
        try {
          const result = await stopCrawler();
          if (result.stopped) {
            message.success(`任务已停止（ID: ${result.taskId}）`);
          } else {
            message.info(result.message);
          }
          loadLogs(1, logsPagination.pageSize);
          loadLogStats();
        } catch (error: any) {
          message.error(`停止失败: ${error.message || '未知错误'}`);
        } finally {
          setStopLoading(false);
        }
      },
    });
  };

  // 天数变化时自动生成执行计划
  const handleDiscoverDaysChange = async (days: number | null) => {
    if (!days || days < 1 || days > 7) {
      setDiscoverPlan(null);
      return;
    }
    try {
      const result = await initializeDiscoverAirports({ days, planOnly: true });
      if (result.executionPlan) {
        setDiscoverPlan(result.executionPlan);
      }
    } catch {
      setDiscoverPlan(null);
    }
  };

  // 发现机场
  const handleDiscoverAirports = async (values: any) => {
    const { days } = values;
    if (!days || days < 1 || days > 7) {
      message.error('请输入 1-7 之间的天数');
      return;
    }

    setDiscoverLoading(true);
    try {
      const result = await initializeDiscoverAirports({ days, planOnly: false });
      message.success(
        `发现机场完成！发现 ${result.airportCount} 个机场，爬取 ${result.flightCount} 条航班`
      );
      setDiscoverResult(result);
      setDiscoverPlan(null);
      discoverForm.resetFields();
      // 刷新日志
      loadLogs(1, logsPagination.pageSize);
      loadLogStats();
    } catch (error: any) {
      message.error(`发现机场失败: ${error.message || '未知错误'}`);
      console.error(error);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleDateRangeChange = async (dates: any) => {
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      setExecutionPlan(null);
      return;
    }

    try {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');

      const result = await initializeDiscoverFlights({
        startDate,
        endDate,
        planOnly: true,
      });

      if (result.success) {
        setExecutionPlan(result.executionPlan);
      }
    } catch (error) {
      console.error('生成执行计划失败', error);
    }
  };

  // 发现航班
  const handleRefreshFlights = async (values: any) => {
    const { dateRange } = values;
    if (!dateRange || dateRange.length !== 2) {
      message.error('请选择开始日期和结束日期');
      return;
    }

    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');

    setRefreshLoading(true);
    try {
      const result = await initializeDiscoverFlights({
        startDate,
        endDate,
        planOnly: false,
      });

      if (result.success) {
        // 异步模式：立即返回，后台执行
        if (result.taskId) {
          message.success(
            `任务已创建（ID: ${result.taskId}），正在后台执行，请在下方日志中查看进度`,
            5
          );

          // 自动开启日志自动刷新
          setAutoRefresh(true);

          // 清空表单和计划
          refreshForm.resetFields();
          setExecutionPlan(null);

          // 立即刷新日志列表（新任务会显示为 running 状态）
          loadLogs(1, logsPagination.pageSize);
          loadLogStats();

          // 清空之前的执行结果
          setRefreshResult({});
        } else {
          // 同步模式（向后兼容）
          message.success(
            `航班发现完成！成功 ${result.executionResult?.successTasks} 个任务，失败 ${result.executionResult?.failedTasks} 个，共爬取 ${result.executionResult?.totalCount} 条航班`
          );
          setRefreshResult({
            executionPlan: result.executionPlan,
            executionResult: result.executionResult,
          });
          // 刷新日志
          loadLogs(1, logsPagination.pageSize);
          loadLogStats();
          // 清空表单和计划
          refreshForm.resetFields();
          setExecutionPlan(null);
        }
      } else {
        message.error('任务创建失败：已有任务在执行中');
      }
    } catch (error: any) {
      message.error(`任务创建失败: ${error.message || '未知错误'}`);
      console.error(error);
    } finally {
      setRefreshLoading(false);
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
    refresh_flights_daily: '单日爬取',
    full_initialize: '一键初始化',
  };

  // 状态映射
  const statusMap = {
    pending: { text: '等待中', color: 'default' },
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
        let icon = null;
        if (status === 'success') {
          icon = <CheckCircleOutlined />;
        } else if (status === 'failed') {
          icon = <ExclamationCircleOutlined />;
        } else if (status === 'running') {
          icon = <SyncOutlined spin />;
        } else if (status === 'pending') {
          icon = <ClockCircleOutlined />;
        }
        return (
          <Tag color={statusInfo?.color} icon={icon}>{statusInfo?.text || status}</Tag>
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
      title: '爬取时间范围',
      dataIndex: 'details',
      key: 'dateRange',
      render: (details?: string) => {
        if (!details) return '-';
        try {
          const d = JSON.parse(details);
          // 兼容三种结构：
          // 1. d.dateRange（顶层数组，discover_airports / refresh_flights 写入时）
          // 2. d.executionPlan.dateRange（refresh_flights 父任务完成后写入）
          // 3. d.date（refresh_flights_daily 子任务单日字段）
          const range: string[] | undefined =
            (Array.isArray(d.dateRange) && d.dateRange.length > 0 ? d.dateRange : null) ??
            (Array.isArray(d.executionPlan?.dateRange) && d.executionPlan.dateRange.length > 0 ? d.executionPlan.dateRange : null) ??
            (d.date ? [d.date] : null);
          if (!range) return '-';
          const start = range[0];
          const end = range[range.length - 1];
          return start === end ? start : `${start} ~ ${end}`;
        } catch {
          return '-';
        }
      },
    },
    {
      title: '爬取结果',
      dataIndex: 'flightCount',
      key: 'flightCount',
      render: (count?: number) => {
        if (count === undefined) return '-';
        return <span style={{ color: '#3f8600', fontWeight: 'bold' }}>{count} 条</span>;
      },
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: number) => {
        if (!duration) return '-';
        const d = dayjs.duration(duration * 1000, 'milliseconds');
        if (d.asSeconds() < 60) {
          return `${Math.round(d.asSeconds())} 秒`;
        }
        return `${Math.round(d.asMinutes())} 分钟`;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CrawlerLog) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewLogDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数据管理</Title>
      <Paragraph type="secondary">
        管理航班数据的爬取和更新
      </Paragraph>

      {/* Admin Token 配置（仅生产环境显示） */}
      {import.meta.env.PROD && (
        <Card
          size="small"
          style={{ marginBottom: 24, background: '#fafafa' }}
        >
          <Space align="center" style={{ width: '100%' }}>
            <Text strong style={{ whiteSpace: 'nowrap' }}>管理员 Token：</Text>
            <Input.Password
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="输入管理员 Token（未配置时留空）"
              style={{ width: 320 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => {
                setAdminToken(tokenInput);
                setAdminTokenState(tokenInput);
                message.success(tokenInput ? 'Token 已保存' : 'Token 已清除');
              }}
            >
              保存
            </Button>
            {adminToken && (
              <Text type="success" style={{ fontSize: 12 }}>✓ Token 已配置</Text>
            )}
          </Space>
        </Card>
      )}

      <Divider />

      {/* 使用说明 */}
      <Alert
        message="使用说明"
        description={
          <div>
            <p>
              <strong>发现机场：</strong>爬取指定天数的航班数据，自动发现所有可用机场
            </p>
            <p>
              <strong>发现航班：</strong>选择日期范围，系统将自动拆分为多个每日任务并行执行，最大化提效
            </p>
            <p>
              <strong>执行计划：</strong>选择日期后会自动生成执行计划，显示任务数量和预计耗时
            </p>
            <p>
              <strong>实时监控：</strong>在下方日志表格可以实时查看执行进度和结果
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 发现机场卡片 */}
      <Card
        title={
          <Space>
            <ReloadOutlined />
            发现机场
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          爬取指定天数的航班数据，自动发现所有可用机场
        </Paragraph>

        <Form
          form={discoverForm}
          layout="vertical"
          onFinish={handleDiscoverAirports}
        >
          <Form.Item
            name="days"
            label="爬取天数"
            rules={[
              { required: true, message: '请输入爬取天数' },
              { type: 'number', min: 1, max: 7, message: '请输入 1-7 之间的天数' },
            ]}
            initialValue={1}
          >
            <InputNumber
              min={1}
              max={7}
              placeholder="请输入 1-7 之间的天数"
              style={{ width: '100%' }}
              onChange={handleDiscoverDaysChange}
            />
          </Form.Item>

          {/* 执行计划预览 */}
          {discoverPlan && (
            <div style={{ marginBottom: 16 }}>
              {/* 整体计划摘要 */}
              <Card
                size="small"
                style={{ marginBottom: 12, background: '#f0f5ff' }}
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>执行计划摘要</Text>
                  </Space>
                }
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="总天数">{discoverPlan.totalDays} 天</Descriptions.Item>
                  <Descriptions.Item label="总任务数">{discoverPlan.totalTasks} 个</Descriptions.Item>
                  <Descriptions.Item label="种子机场数">{discoverPlan.seedAirports.length} 个</Descriptions.Item>
                  <Descriptions.Item label="最大并发">3 个 page</Descriptions.Item>
                  <Descriptions.Item label="预计耗时">{discoverPlan.estimatedTime}</Descriptions.Item>
                  <Descriptions.Item label="日期范围">
                    {discoverPlan.dateRange[0]} ~ {discoverPlan.dateRange[discoverPlan.dateRange.length - 1]}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 种子机场 */}
              <Card
                size="small"
                style={{ marginBottom: 12, background: '#f6ffed' }}
                title={<Text strong>🌍 种子机场（{discoverPlan.seedAirports.length} 个）</Text>}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {discoverPlan.seedAirports.map((airport, idx) => (
                    <Tag key={idx} color="green">{airport}</Tag>
                  ))}
                </div>
              </Card>

              {/* 每日任务 */}
              <Card
                size="small"
                style={{ background: '#fffbe6' }}
                title={<Text strong>📅 每日任务详情</Text>}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {discoverPlan.taskList.map(task => (
                    <Card
                      key={task.taskId}
                      size="small"
                      style={{ background: '#fafafa' }}
                      title={`任务 ${task.taskId}：${task.date}`}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="爬虫配置">{task.crawlerInfo.description}</Descriptions.Item>
                        <Descriptions.Item label="预期航班数">{task.crawlerInfo.expectedFlights} 班</Descriptions.Item>
                        <Descriptions.Item label="最大并发">{task.crawlerInfo.maxConcurrency} 个 page</Descriptions.Item>
                        <Descriptions.Item label="预计耗时">{task.estimatedTaskTime}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  ))}
                </Space>
              </Card>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<ReloadOutlined />}
              loading={discoverLoading}
              block
            >
              开始发现机场
            </Button>
          </Form.Item>
        </Form>

        {/* 发现机场结果 */}
        {discoverResult && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="发现机场数"
                  value={discoverResult.airportCount}
                  suffix="个"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="爬取航班数"
                  value={discoverResult.flightCount}
                  suffix="条"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        )}
      </Card>

      <Divider />

      {/* 发现航班卡片 */}
      <Card
        title={
          <Space>
            <ReloadOutlined />
            按时间范围发现航班
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary">
          选择日期范围，系统将自动拆分为每日任务并行执行
        </Paragraph>

        <Form
          form={refreshForm}
          layout="vertical"
          onFinish={handleRefreshFlights}
        >
          <Form.Item
            name="dateRange"
            label="选择日期范围"
            rules={[{ required: true, message: '请选择日期范围' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              onChange={handleDateRangeChange}
            />
          </Form.Item>

          {/* 执行计划预览 */}
          {executionPlan && (
            <div style={{ marginBottom: 16 }}>
              {/* 整体计划摘要 */}
              <Card
                size="small"
                style={{ marginBottom: 12, background: '#f0f5ff' }}
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>执行计划摘要</Text>
                  </Space>
                }
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="总天数">
                    {executionPlan.totalDays} 天
                  </Descriptions.Item>
                  <Descriptions.Item label="总任务数">
                    {executionPlan.totalTasks} 个
                  </Descriptions.Item>
                  <Descriptions.Item label="总机场数">
                    {executionPlan.totalAirports} 个
                  </Descriptions.Item>
                  <Descriptions.Item label="并发度">
                    {(executionPlan as any).dateConcurrency ?? 10} 个日期/批，每日 {(executionPlan as any).airportConcurrency ?? 3} 个机场并发
                  </Descriptions.Item>
                  <Descriptions.Item label="预计耗时">
                    {executionPlan.estimatedTime}（仅供参考，实际取决于航班数量）
                  </Descriptions.Item>
                  <Descriptions.Item label="日期范围">
                    {executionPlan.dateRange[0]} ~ {executionPlan.dateRange[executionPlan.dateRange.length - 1]}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 城市列表 */}
              <Card
                size="small"
                style={{ marginBottom: 12, background: '#f6ffed' }}
                title={
                  <Space>
                    <Text strong>🌍 爬取城市列表 ({executionPlan.totalAirports} 个)</Text>
                  </Space>
                }
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {executionPlan.airportList.map((airport: string, idx: number) => (
                    <Tag key={idx} color="green">
                      {airport}
                    </Tag>
                  ))}
                </div>
              </Card>

              {/* 子任务详情 */}
              <Card
                size="small"
                style={{ background: '#fffbe6' }}
                title={
                  <Space>
                    <Text strong>📅 每日任务详情</Text>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {executionPlan.taskList.map((task: any) => (
                    <Card
                      key={task.taskId}
                      size="small"
                      style={{ background: '#fafafa' }}
                      title={`任务 ${task.taskId}: ${task.date}`}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="爬虫配置">
                          {task.crawlerInfo.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="预期航班数">
                          {task.crawlerInfo.expectedFlights} 班
                        </Descriptions.Item>
                        <Descriptions.Item label="最大并发数">
                          {task.crawlerInfo.maxConcurrency} 个机场并行
                        </Descriptions.Item>
                        <Descriptions.Item label="预计耗时">
                          {task.estimatedTaskTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="爬取城市">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {task.airportNames.map((name: string, idx: number) => (
                              <Tag key={idx}>
                                {name}
                              </Tag>
                            ))}
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  ))}
                </Space>
              </Card>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<ReloadOutlined />}
              loading={refreshLoading}
              block
            >
              开始执行
            </Button>
          </Form.Item>
        </Form>

        {/* 执行结果 */}
        {refreshResult.executionResult && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="成功任务"
                  value={refreshResult.executionResult.successTasks}
                  suffix="个"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="失败任务"
                  value={refreshResult.executionResult.failedTasks}
                  suffix="个"
                  valueStyle={{ color: refreshResult.executionResult.failedTasks > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="爬取航班"
                  value={refreshResult.executionResult.totalCount}
                  suffix="条"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        )}
      </Card>

      <Divider />

      {/* 日志统计 */}
      {logStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="总任务数"
                value={logStats.total}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="成功"
                value={logStats.successCount}
                valueStyle={{ fontSize: '24px', color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="失败"
                value={logStats.failedCount}
                valueStyle={{ fontSize: '24px', color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="执行中"
                value={logStats.runningCount}
                valueStyle={{ fontSize: '24px', color: '#faad14' }}
              />
              {logStats.runningCount > 0 && (
                <Button
                  danger
                  size="small"
                  loading={stopLoading}
                  onClick={handleStop}
                  style={{ marginTop: 8, width: '100%' }}
                >
                  停止任务
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* 执行日志 */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            执行日志
          </Space>
        }
        extra={
          <Space>
            {logStats && logStats.runningCount > 0 && (
              <Button
                danger
                size="small"
                loading={stopLoading}
                icon={<ExclamationCircleOutlined />}
                onClick={handleStop}
              >
                停止任务
              </Button>
            )}
            <Button
              type="text"
              size="small"
              icon={autoRefresh ? <SyncOutlined spin /> : <SyncOutlined />}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '关闭自动刷新' : '开启自动刷新'}
            </Button>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleCleanOldLogs}
            >
              清理旧日志
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleCleanAllLogs}
            >
              清理所有
            </Button>
          </Space>
        }
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          loading={logsLoading}
          pagination={{
            current: logsPagination.current,
            pageSize: logsPagination.pageSize,
            total: logsPagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            loadLogs(pagination.current, pagination.pageSize);
          }}
          rowClassName={(record) =>
            record.status === 'running' ? 'running-task-row' : ''
          }
        />
      </Card>

      {/* 日志详情模态框 */}
      <Modal
        title="日志详情"
        open={logDetailVisible}
        onCancel={() => setLogDetailVisible(false)}
        footer={null}
        width={860}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
      >
        {selectedLog && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="任务 ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="任务类型">
              {taskTypeMap[selectedLog.taskType as keyof typeof taskTypeMap] || selectedLog.taskType}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[selectedLog.status as keyof typeof statusMap]?.color}>
                {statusMap[selectedLog.status as keyof typeof statusMap]?.text || selectedLog.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="爬取机场数">{selectedLog.airportCount}</Descriptions.Item>
            <Descriptions.Item label="爬取航班数">{selectedLog.flightCount}</Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {dayjs(selectedLog.startTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {selectedLog.endTime && (
              <Descriptions.Item label="结束时间">
                {dayjs(selectedLog.endTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedLog.duration && (
              <Descriptions.Item label="耗时">
                {dayjs.duration(selectedLog.duration * 1000, 'milliseconds').format('HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedLog.errorMessage && (
              <Descriptions.Item label="错误信息">
                <Text type="danger">{selectedLog.errorMessage}</Text>
              </Descriptions.Item>
            )}
            {selectedLog.details && (() => {
              try {
                const details = typeof selectedLog.details === 'string'
                  ? JSON.parse(selectedLog.details)
                  : selectedLog.details;

                return (
                  <>
                    {/* 任务日期 */}
                    {details.date && (
                      <Descriptions.Item label="任务日期">
                        {details.date}
                      </Descriptions.Item>
                    )}

                    {/* 任务 ID */}
                    {details.taskId && (
                      <Descriptions.Item label="任务 ID">
                        {details.taskId}
                      </Descriptions.Item>
                    )}

                    {/* 机场列表 */}
                    {(details.airports || details.airportNames) && (
                      <Descriptions.Item label="机场列表">
                        <div style={{ maxHeight: 200, overflow: 'auto' }}>
                          {(details.airports || details.airportNames).map((airport: string) => (
                            <Tag key={airport} style={{ marginBottom: 4 }}>
                              {airport}
                            </Tag>
                          ))}
                        </div>
                      </Descriptions.Item>
                    )}

                    {/* 日期范围（仅 discover_airports 任务） */}
                    {details.dateRange && (
                      <Descriptions.Item label="日期范围">
                        {Array.isArray(details.dateRange)
                          ? details.dateRange.join(', ')
                          : details.dateRange}
                      </Descriptions.Item>
                    )}

                    {/* 种子机场（仅 discover_airports 任务） */}
                    {details.seedAirports && (
                      <Descriptions.Item label="种子机场">
                        {details.seedAirports.map((airport: string) => (
                          <Tag key={airport} color="blue" style={{ marginBottom: 4 }}>
                            {airport}
                          </Tag>
                        ))}
                      </Descriptions.Item>
                    )}

                    {/* 发现的机场列表 */}
                    {details.discoveredAirports && details.discoveredAirports.length > 0 && (
                      <Descriptions.Item label={`发现机场（${details.discoveredAirports.length} 个）`}>
                        <div style={{ maxHeight: 120, overflow: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {details.discoveredAirports.map((airport: string) => (
                            <Tag key={airport} color="green" style={{ marginBottom: 4 }}>{airport}</Tag>
                          ))}
                        </div>
                      </Descriptions.Item>
                    )}

                    {/* 各任务爬取结果（结构化展示，兼容对象格式和数组格式） */}
                    {details.taskResults && (
                      (() => {
                        // discover_airports: { "机场@日期": count }
                        // refresh_flights: [{ taskId, date, success, count }]
                        const isArray = Array.isArray(details.taskResults);
                        const rows: { key: string; airport?: string; date: string; count: number; success: boolean }[] = isArray
                          ? details.taskResults.map((t: any) => ({
                              key: `${t.taskId}-${t.date}`,
                              date: t.date,
                              count: t.count,
                              success: t.success,
                            }))
                          : Object.entries(details.taskResults as Record<string, number>)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([key, count]) => {
                                const [airport, date] = key.split('@');
                                return { key, airport, date, count: count as number, success: (count as number) > 0 };
                              });

                        if (rows.length === 0) return null;
                        return (
                          <Descriptions.Item label={`任务明细（${rows.length} 个）`}>
                            <div style={{ maxHeight: 300, overflow: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                  <tr style={{ background: '#f0f0f0', position: 'sticky', top: 0 }}>
                                    {!isArray && <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid #e0e0e0' }}>机场</th>}
                                    <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid #e0e0e0' }}>日期</th>
                                    <th style={{ padding: '4px 8px', textAlign: 'right', border: '1px solid #e0e0e0' }}>航班数</th>
                                    <th style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>状态</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map(row => (
                                    <tr key={row.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                      {!isArray && <td style={{ padding: '3px 8px', border: '1px solid #e0e0e0' }}>{row.airport}</td>}
                                      <td style={{ padding: '3px 8px', border: '1px solid #e0e0e0' }}>{row.date}</td>
                                      <td style={{ padding: '3px 8px', textAlign: 'right', border: '1px solid #e0e0e0', color: row.count > 0 ? '#3f8600' : '#999', fontWeight: row.count > 0 ? 600 : 400 }}>
                                        {row.count}
                                      </td>
                                      <td style={{ padding: '3px 8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                                        <Tag color={row.success ? 'success' : 'default'} style={{ margin: 0 }}>
                                          {row.success ? '成功' : (isArray ? '失败' : '无数据')}
                                        </Tag>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Descriptions.Item>
                        );
                      })()
                    )}

                    {/* 执行计划（主任务日志，结构化展示） */}
                    {details.executionPlan && (
                      <Descriptions.Item label="执行计划">
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <div>
                            <Tag>总天数：{details.executionPlan.totalDays} 天</Tag>
                            <Tag>总任务：{details.executionPlan.totalTasks} 个</Tag>
                            <Tag>机场数：{details.executionPlan.totalAirports} 个</Tag>
                            <Tag color="blue">预计耗时：{details.executionPlan.estimatedTime}</Tag>
                          </div>
                          {details.executionPlan.dateRange && (
                            <div style={{ fontSize: 12, color: '#666' }}>
                              日期范围：{details.executionPlan.dateRange[0]} ~ {details.executionPlan.dateRange[details.executionPlan.dateRange.length - 1]}
                            </div>
                          )}
                        </Space>
                      </Descriptions.Item>
                    )}


                    {/* 其他详细信息（排除已结构化展示的字段） */}
                    {Object.keys(details).filter(key =>
                      !['date', 'taskId', 'airports', 'airportNames', 'dateRange', 'seedAirports',
                        'executionPlan', 'taskResults', 'discoveredAirports',
                        'totalDeleted', 'totalSaved', 'failedAirports'].includes(key)
                    ).length > 0 && (
                      <Descriptions.Item label="其他信息">
                        <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(details).filter(([key]) =>
                                !['date', 'taskId', 'airports', 'airportNames', 'dateRange', 'seedAirports',
                                  'executionPlan', 'taskResults', 'discoveredAirports',
                                  'totalDeleted', 'totalSaved', 'failedAirports'].includes(key)
                              )
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </Descriptions.Item>
                    )}
                  </>
                );
              } catch (e) {
                // 如果解析失败，显示原始内容
                return (
                  <Descriptions.Item label="详细信息">
                    <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                      {typeof selectedLog.details === 'string'
                        ? selectedLog.details
                        : JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </Descriptions.Item>
                );
              }
            })()}
          </Descriptions>
        )}

        {/* 子任务列表（仅发现航班父任务展示） */}
        {selectedLog?.taskType === 'refresh_flights' && (
          <>
            <Divider orientation="left" style={{ marginTop: 20 }}>
              子任务明细（每日爬取任务）
            </Divider>
            <Table
              loading={subLogsLoading}
              dataSource={subLogs}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: subLogsLoading ? '加载中...' : '暂无子任务记录' }}
              columns={[
                {
                  title: '日期',
                  key: 'date',
                  render: (_: any, record: CrawlerLog) => {
                    try {
                      const d = record.details ? JSON.parse(record.details) : {};
                      // 兼容 d.date（旧格式）和 d.dateRange（新格式）
                      if (d.date) return d.date;
                      if (d.dateRange?.length) return d.dateRange[0];
                      return '-';
                    } catch { return '-'; }
                  },
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const map: Record<string, { text: string; color: string; icon?: React.ReactNode }> = {
                      pending: { text: '等待中', color: 'default', icon: <ClockCircleOutlined /> },
                      running: { text: '执行中', color: 'processing', icon: <SyncOutlined spin /> },
                      success: { text: '成功', color: 'success', icon: <CheckCircleOutlined /> },
                      failed: { text: '失败', color: 'error', icon: <ExclamationCircleOutlined /> },
                    };
                    const info = map[status];
                    return <Tag color={info?.color} icon={info?.icon}>{info?.text || status}</Tag>;
                  },
                },
                {
                  title: '机场数',
                  dataIndex: 'airportCount',
                  key: 'airportCount',
                  render: (v: number) => v || '-',
                },
                {
                  title: '航班数',
                  dataIndex: 'flightCount',
                  key: 'flightCount',
                  render: (v: number) => (
                    <span style={{ color: '#3f8600', fontWeight: 'bold' }}>{v || 0} 条</span>
                  ),
                },
                {
                  title: '耗时',
                  dataIndex: 'duration',
                  key: 'duration',
                  render: (v?: number) => {
                    if (!v) return '-';
                    return v < 60 ? `${v}s` : `${Math.round(v / 60)}m`;
                  },
                },
                {
                  title: '错误',
                  dataIndex: 'errorMessage',
                  key: 'errorMessage',
                  render: (v?: string) => v
                    ? <Text type="danger" style={{ fontSize: 12 }}>{v}</Text>
                    : '-',
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default DataManagement;

// CSS 样式：高亮正在执行的任务
const style = document.createElement('style');
style.textContent = `
  .running-task-row {
    background-color: #e6f7ff !important;
  }
`;
document.head.appendChild(style);
