import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Put('me')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(userId, updateUserDto, userId);
  }

  @Delete('me')
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.remove(userId, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
