import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, CreatePlayerDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: dto.name,
        shortName: dto.shortName,
        players: dto.players && dto.players.length > 0 ? {
          create: dto.players.map(p => ({
            name: p.name,
            role: p.role,
          })),
        } : undefined,
      },
      include: {
        players: true,
      },
    });
  }

  async findAllTeams() {
    return this.prisma.team.findMany({
      include: {
        players: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneTeam(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        players: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }
    return team;
  }

  async addPlayerToTeam(teamId: string, dto: CreatePlayerDto) {
    await this.findOneTeam(teamId);
    return this.prisma.player.create({
      data: {
        name: dto.name,
        role: dto.role,
        teamId: teamId,
      },
    });
  }

  async deleteTeam(id: string) {
    await this.findOneTeam(id);
    return this.prisma.team.delete({
      where: { id },
    });
  }
}
