import { AppDataSource } from "../../infrastructure/database/data-source";
import { SystemLog } from "../../domain/entities/SystemLog";
import { Repository } from "typeorm";

export interface LogEntry {
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    timestamp?: string;
}

class LogService {
    // Remove constructor and private property initialization at startup
    // to avoid race condition with DataSource initialization.

    private get repository(): Repository<SystemLog> {
        return AppDataSource.getRepository(SystemLog);
    }

    async log(entry: LogEntry): Promise<void> {
        try {
            const log = new SystemLog();
            log.type = entry.type;
            log.message = entry.message;
            await this.repository.save(log);
        } catch (error) {
            console.error('Failed to save log to DB:', error);
        }
    }

    async getRecentLogs(limit: number = 50): Promise<LogEntry[]> {
        try {
            const logs = await this.repository.find({
                order: { timestamp: 'DESC' },
                take: limit || 20 // Safety fallback
            });

            return logs.map(log => ({
                type: log.type,
                message: log.message,
                timestamp: log.timestamp.toISOString()
            }));
        } catch (error) {
            console.error('Failed to fetch logs from DB:', error);
            // Return empty array to prevent frontend crash
            return [];
        }
    }
}

export default new LogService();
