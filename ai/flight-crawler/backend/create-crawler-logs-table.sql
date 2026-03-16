-- 创建执行日志表
CREATE TABLE IF NOT EXISTS crawler_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskType VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  days INTEGER,
  airportCount INTEGER DEFAULT 0,
  flightCount INTEGER DEFAULT 0,
  details TEXT,
  errorMessage TEXT,
  startTime DATETIME,
  endTime DATETIME,
  duration INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_taskType_createdAt ON crawler_logs(taskType, createdAt);
CREATE INDEX IF NOT EXISTS idx_status_createdAt ON crawler_logs(status, createdAt);
