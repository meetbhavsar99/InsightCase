import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Client')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER')
  getAllClients() {
    return this.clientService.getAllClients();
  }

  @Get(':id')
  getClient(@Param('id') id: string) {
    return this.clientService.getClient(id);
  }

  @Post()
  createClient(@Body() dto: CreateClientDto) {
    return this.clientService.createClient(dto);
  }

  @Patch(':id')
  updateClient(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.updateClient(id, dto);
  }

  @Delete(':id')
  deleteClient(@Param('id') id: string) {
    return this.clientService.deleteClient(id);
  }
}
