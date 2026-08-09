import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'online',
      message: '🚀 CricV NestJS + PostgreSQL Backend API is running successfully!',
      timestamp: new Date().toISOString(),
      endpoints: {
        teams: '/teams',
      },
    };
  }
}
