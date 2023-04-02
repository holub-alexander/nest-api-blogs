// import { Module } from '@nestjs/common';
// import { PostsController } from './posts.controller';
// import { PostsService } from './posts.service';
// import { PostsQueryRepository } from './repositories/posts.query.repository';
// import { PostsWriteRepository } from './repositories/posts.write.repository';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Post, PostSchema } from '../schemas/post.schema';
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: Post.name, schema: PostSchema },
//     ]),
//   ],
//   controllers: [PostsController],
//   providers: [
//     PostsQueryRepository,
//     PostsWriteRepository,
//     PostsService,
//   ],
// })
// export class PostsModule {}
