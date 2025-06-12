import { registerAs } from '@nestjs/config';
import { type MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const CONFIG_DATABASE = 'database' as const;

interface CreateConfig extends MongooseModuleFactoryOptions {
  databaseName: string;
  connectionName?: string;
}

const createDatabaseConfig = (userName: string, password: string, hostName: string, port: string, config: CreateConfig) => {
  const { connectionName, databaseName, ...options } = config;

  // 判断是否为本地连接
  const isLocal = hostName === 'localhost' || hostName === '127.0.0.1';

  // 构建 URI
  let uri: string;
  if (isLocal) {
    // 本地 MongoDB 连接
    // 大多数本地 MongoDB 安装默认不启用认证
    // 如果启用了认证，需要确保用户存在且有正确权限
    if (userName && password && userName.trim() !== '' && password.trim() !== '') {
      uri = `mongodb://${userName}:${password}@${hostName}:${port}/${databaseName}?authSource=admin`;
    } else {
      // 无认证连接（本地开发常用）
      uri = `mongodb://${hostName}:${port}/${databaseName}`;
    }
  } else {
    // MongoDB Atlas 云端连接
    uri = `mongodb+srv://${userName}:${password}@${hostName}.mongodb.net/${databaseName}`;
  }

  // 添加调试日志
  console.log(`[Database Config] Connecting to: ${uri.replace(/:([^:@]+)@/, ':***@')}`);

  return {
    uri,
    connectionName: config.connectionName || `app_${config.databaseName}`,
    options: {
      maxPoolSize: 50,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority' as const,
      ...options,
    },
  };
};

export interface DatabaseConfig {
  main: ReturnType<typeof createDatabaseConfig>;
}

export const databaseConfig = registerAs(CONFIG_DATABASE, () => {
  const USER_NAME = process.env.MONGODB_USER_NAME as string;
  const PASSWORD = process.env.MONGODB_USER_PASSWORD as string;
  const HOST_NAME = process.env.MONGODB_HOST_NAME as string;
  const PORT = process.env.MONGODB_PORT || '27017';

  console.log(`[Database Config] Environment variables:`, {
    USER_NAME: USER_NAME ? '***' : 'empty',
    PASSWORD: PASSWORD ? '***' : 'empty',
    HOST_NAME,
    PORT,
  });

  return {
    main: createDatabaseConfig(USER_NAME, PASSWORD, HOST_NAME, PORT, {
      databaseName: 'main', // MongoDB 会自动创建此数据库
    }),
  };
});
