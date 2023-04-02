// import { Module } from '@nestjs/common';
// import { BlogsController } from './blogs.controller';
// import { BlogsService } from './blogs.service';
// import { BlogsQueryRepository } from './repositories/blogs.query.repository';
// import { BlogsWriteRepository } from './repositories/blogs.write.repository';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Blog, BlogSchema } from '../schemas/blog.schema';
//
// @Module({
//   imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
//   controllers: [BlogsController],
//   providers: [BlogsService, BlogsQueryRepository, BlogsWriteRepository],
//   exports: [BlogsWriteRepository],
// })
// export class BlogsModule {}
