import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import DailyRotateFile = require('winston-daily-rotate-file');

// 日志目录
const logDir = path.join(process.cwd(), 'logs');

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, context, stack }) => {
    const contextStr = context ? `[${context}]` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${stackStr}`;
  }),
);

// 控制台输出格式（带颜色）
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context }) => {
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${contextStr} ${message}`;
  }),
);

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),

    // 所有日志文件（按日期分割）
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      level: 'info',
      maxSize: '20m', // 单个文件最大 20MB
      maxFiles: '14d', // 保留 14 天
      zippedArchive: true, // 压缩旧日志
    }),

    // 错误日志文件
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d', // 错误日志保留 30 天
      zippedArchive: true,
    }),

    // 调试日志文件（开发环境）
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new DailyRotateFile({
            dirname: logDir,
            filename: 'debug-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            format: logFormat,
            level: 'debug',
            maxSize: '20m',
            maxFiles: '7d', // 调试日志保留 7 天
            zippedArchive: true,
          }),
        ]
      : []),
  ],
};
