import postModel from '../models/postScheme.js';
import commentModel from '../models/commentScheme.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
  try {
    // Check if a post with the same title already exists
    const existingTitlePost = await postModel.findOne({ title: req.body.title });
    const existingTextPost = await postModel.findOne({ text: req.body.text });

    if (existingTitlePost) {
      return res.status(400).json({ message: 'Стаття із таким заголовком вже існує' });
    }
    if (existingTextPost) {
      return res.status(400).json({ message: 'Стаття з таким текстом вже існує' });
    }
    const doc = new postModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нажаль сталася помилка	. Спробуйте будь-ласка пізніше',
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = new commentModel({
      text: req.body.text,
      post: postId,
      user: req.userId,
    });

    const comment = await doc.save();

    const result = await postModel.updateOne({ _id: postId }, { $push: { comments: comment } });
    console.log('🚀 ~ file: postControllers.js:47 ~ addComment ~ result:', result);
    res.json(comment);
  } catch (err) {
    //! Обработка ошибок валидации Mongoose
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Не вдалося додати коментар' });
    }
  }
};

export const deleteComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const doc = await commentModel.findOneAndDelete({
      _id: commentId,
    });

    if (doc) {
      // Успішно видалено з коментарів, тепер видаляємо з посту
      const result = await postModel.updateOne({ _id: postId }, { $pull: { comments: commentId } });
      console.log('🚀 ~ file: postControllers.js:71 ~ deleteComment ~ result:', result);

      if (result.modifiedCount > 0) {
        console.log(`Коментар ${commentId} видалено з поста ${postId}`);
      } else {
        console.log(`Коментар ${commentId} не знайдено в пості ${postId}`);
      }
      res.json({ 'Коментар видалено': doc });
    } else {
      return { message: 'Коментар не знайдено' };
    }
  } catch (err) {
    console.error(`Помилка при видаленні коментаря та оновленні поста: ${err.message}`);
    return { message: 'Не вдалося видалити коментар' };
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page, limitPosts, sortBy, tag, limitComments } = req.query;
    const skippedPosts = limitPosts * (page - 1);
    const conditions = {};
    if (tag) {
      conditions.tags = tag;
    }
    const posts = await postModel
      .find(conditions)
      .sort({ [sortBy]: -1 })
      .skip(skippedPosts)
      .limit(limitPosts)
      .populate('user')
      .exec();

    const comments = await commentModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limitComments)
      .populate('user');

    const amount = await postModel.find(conditions).count();

    if (!posts || posts.length === 0) {
      return res.json({ message: 'Нет доступных статей' });
    }
    res.json({ posts, amount, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const getOnePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const doc = await postModel
      .findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            viewsCount: 1,
          },
        },
      )
      .populate('user')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          model: 'user',
        },
      })
      .exec();
    // Think about second populate up here

    if (!doc) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить статью' });
  }
};

const deleteAllCommentsForPost = async (postId) => {
  try {
    const deletedComments = await commentModel.deleteMany({ post: postId });
    console.log(`Удалено ${deletedComments.deletedCount} комментариев к посту с id ${postId}`);
  } catch (error) {
    console.error(`Ошибка при удалении комментариев к посту: ${error.message}`);
  }
};
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const doc = await postModel.findOneAndDelete({ _id: postId });

    if (doc) {
      await deleteAllCommentsForPost(postId);
      res.json({ 'Следующая статья удалена': doc });
    } else {
      res.status(404).json({ message: 'Статья не найдена' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить статью' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await postModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.imageUrl,
        user: req.userId,
      },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Стаття не знайдена' });
    }
    if (result.modifiedCount === 0) {
      return res.json({ message: 'В статті немає оновлень' });
    } else {
      res.json({ message: 'Стаття оновлена' });
    }
  } catch (err) {
    res.status(500).json({
      message: 'Не вдалося оновити дані',
    });
  }
};
