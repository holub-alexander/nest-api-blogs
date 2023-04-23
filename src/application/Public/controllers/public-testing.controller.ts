import { Controller, Delete, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllCommand } from '../../Testing/handlers/delete-all.handler';

@SkipThrottle()
@Controller('testing')
export class PublicTestingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.commandBus.execute(new DeleteAllCommand());
  }
}
