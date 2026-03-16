-- 测试数据插入脚本
-- 用于快速验证功能

-- 清空现有数据（可选）
-- DELETE FROM flights;

-- 插入测试航班数据
INSERT INTO flights (flightNo, origin, destination, departureTime, arrivalTime, price, availableSeats, cardType, crawledAt, createdAt, updatedAt)
VALUES
-- 北京出发的航班
('HU7101', '北京', '上海', '2026-04-15 08:00:00', '2026-04-15 10:30:00', 299, 100, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7102', '北京', '广州', '2026-04-15 09:00:00', '2026-04-15 12:00:00', 399, 80, '666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7103', '北京', '成都', '2026-04-15 10:00:00', '2026-04-15 12:30:00', 350, 120, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7104', '北京', '深圳', '2026-04-15 11:00:00', '2026-04-15 14:00:00', 450, 60, '2666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7105', '北京', '杭州', '2026-04-15 13:00:00', '2026-04-15 15:00:00', 280, 90, '全部', datetime('now'), datetime('now'), datetime('now')),

-- 上海出发的航班（用于中转）
('HU7201', '上海', '三亚', '2026-04-15 14:00:00', '2026-04-15 17:00:00', 450, 70, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7202', '上海', '厦门', '2026-04-15 15:00:00', '2026-04-15 17:00:00', 320, 85, '666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7203', '上海', '昆明', '2026-04-15 16:00:00', '2026-04-15 19:00:00', 480, 55, '全部', datetime('now'), datetime('now'), datetime('now')),

-- 广州出发的航班（用于中转）
('HU7301', '广州', '三亚', '2026-04-15 15:00:00', '2026-04-15 16:30:00', 199, 95, '2666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7302', '广州', '海口', '2026-04-15 16:00:00', '2026-04-15 17:30:00', 250, 110, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7303', '广州', '重庆', '2026-04-15 17:00:00', '2026-04-15 19:30:00', 380, 75, '666权益卡', datetime('now'), datetime('now'), datetime('now')),

-- 成都出发的航班（用于中转）
('HU7401', '成都', '三亚', '2026-04-15 16:00:00', '2026-04-15 19:00:00', 520, 65, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7402', '成都', '拉萨', '2026-04-15 14:00:00', '2026-04-15 16:30:00', 680, 45, '2666权益卡', datetime('now'), datetime('now'), datetime('now')),

-- 深圳出发的航班
('HU7501', '深圳', '三亚', '2026-04-15 17:00:00', '2026-04-15 18:30:00', 280, 100, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7502', '深圳', '桂林', '2026-04-15 18:00:00', '2026-04-15 19:30:00', 350, 80, '666权益卡', datetime('now'), datetime('now'), datetime('now')),

-- 不同日期的航班（用于日期范围查询）
('HU7106', '北京', '上海', '2026-04-16 08:30:00', '2026-04-16 11:00:00', 320, 90, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7107', '北京', '广州', '2026-04-16 09:30:00', '2026-04-16 12:30:00', 420, 70, '666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7108', '北京', '成都', '2026-04-17 10:30:00', '2026-04-17 13:00:00', 370, 100, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7109', '北京', '深圳', '2026-04-18 11:30:00', '2026-04-18 14:30:00', 470, 55, '2666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7110', '北京', '杭州', '2026-04-19 13:30:00', '2026-04-19 15:30:00', 300, 85, '全部', datetime('now'), datetime('now'), datetime('now'));

-- 查看插入的数据
SELECT COUNT(*) as total_flights FROM flights;
SELECT origin, COUNT(*) as flight_count FROM flights GROUP BY origin;
SELECT destination, MIN(price) as min_price FROM flights GROUP BY destination ORDER BY min_price;
