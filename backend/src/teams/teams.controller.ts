import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, CreatePlayerDto } from './dto/create-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.createTeam(createTeamDto);
  }

  @Get()
  findAllTeams() {
    return this.teamsService.findAllTeams();
  }

  @Get(':id')
  findOneTeam(@Param('id') id: string) {
    return this.teamsService.findOneTeam(id);
  }

  @Post(':id/players')
  addPlayerToTeam(@Param('id') id: string, @Body() createPlayerDto: CreatePlayerDto) {
    return this.teamsService.addPlayerToTeam(id, createPlayerDto);
  }

  @Delete(':id')
  deleteTeam(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }
}
