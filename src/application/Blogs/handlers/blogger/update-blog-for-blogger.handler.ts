import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsWriteRepository } from '../../repositories/blogs.write.repository';
import { UpdateBlogDto } from '../../dto/update.dto';
import { CheckAccessToBlogCommand } from '../../../Blogger/handlers/check-access-to-blog.handler';

export class UpdateBlogForBloggerCommand {
  constructor(public id: string, public body: UpdateBlogDto, public userLogin: string) {}
}

@CommandHandler(UpdateBlogForBloggerCommand)
export class UpdateBlogForBloggerHandler {
  constructor(private readonly commandBus: CommandBus, private readonly blogsWriteRepository: BlogsWriteRepository) {}

  public async execute(command: UpdateBlogForBloggerCommand) {
    await this.commandBus.execute(new CheckAccessToBlogCommand(command.id, command.userLogin));

    const isUpdated = await this.blogsWriteRepository.updateOne(command.id, command.body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }
}
