import type { DataSource } from 'typeorm';
import BlogEntity from '../../entities/blog.entity';
import { SeederFactoryManager, Seeder } from 'typeorm-extension';
import UserEntity from '../../entities/user.entity';
import DeviceEntity from '../../entities/device.entity';
import PostEntity from '../../entities/post.entity';
import CommentEntity from '../../entities/comment.entity';
import ReactionEntity from '../../entities/reaction.entity';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const blogFactory = await factoryManager.get(BlogEntity);
    const userFactory = await factoryManager.get(UserEntity);
    const deviceFactory = await factoryManager.get(DeviceEntity);
    const postFactory = await factoryManager.get(PostEntity);
    const commentFactory = await factoryManager.get(CommentEntity);
    const reactionFactory = await factoryManager.get(ReactionEntity);

    const users = await userFactory.saveMany(15);
    const blogs = await blogFactory.saveMany(10);

    await Promise.allSettled(
      users.map((user) => {
        return deviceFactory.saveMany(1, { user_id: user.id });
      }),
    );

    const createdPosts = await Promise.all(
      blogs.map((blog) => {
        return postFactory.saveMany(2, { blog_id: blog.id });
      }),
    );

    const posts = createdPosts.flat();

    const createdComments = await Promise.all(
      posts.map((post, index) => {
        return commentFactory.saveMany(2, {
          user_id: users[0].id,
          blog_id: post.blog_id,
          post_id: post.id,
        });
      }),
    );

    const comments = createdComments.flat();

    await Promise.all(
      posts.slice(0, 4).map((post) => {
        return reactionFactory.saveMany(4, { type: 'post', comment_id: null, post_id: post.id, user_id: users[0].id });
      }),
    );

    await Promise.all(
      comments.slice(0, 4).map((comment) => {
        return reactionFactory.saveMany(4, {
          type: 'comment',
          comment_id: comment.id,
          post_id: null,
          user_id: users[0].id,
        });
      }),
    );
  }
}
