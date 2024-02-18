import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { BlogsWriteRepository } from '../../repositories/blogs.write.repository';
import { CheckAccessToBlogCommand } from '../../../Blogger/handlers/check-access-to-blog.handler';
import { NotFoundException } from '@nestjs/common';

export class DeleteBlogForBloggerCommand {
  constructor(public id: string, public userLogin: string) {}
}

@CommandHandler(DeleteBlogForBloggerCommand)
export class DeleteBlogForBloggerHandler {
  constructor(private readonly commandBus: CommandBus, private readonly blogsWriteRepository: BlogsWriteRepository) {}

  public async execute(command: DeleteBlogForBloggerCommand) {
    await this.commandBus.execute(new CheckAccessToBlogCommand(command.id, command.userLogin));

    const isDeleted = await this.blogsWriteRepository.deleteOne(command.id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }
}
