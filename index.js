import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import {
  createPost,
  deletePost,
  getAllPosts,
  getOnePost,
  updatePost,
  addComment,
  deleteComment,
} from './controllers/postControllers.js';
import {
  registerValidation,
  itemValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from './validations.js';
import { createItem, deleteItem, getItems, getOneItem } from './controllers/itemController.js';
import checkAuth from './utils/chechAuth.js';
import { getMe, login, register } from './controllers/userController.js';
import { upload } from './utils/multer.js';
import handleValidationErrors from './utils/handleValidationErrors.js';

// Подключение к базе данных MongoDB
mongoose
  .connect(
    'mongodb+srv://vanjarl04111626:04111626@cluster0.r5u7kmb.mongodb.net/myProject?retryWrites=true&w=majority',
  )
  .then(() => {
    console.log('MongoDB OK');
  })
  .catch((err) => {
    console.log('Error connecting', err);
  });

// Создание объекта приложения Express
const app = express();
app.use(cors());
const port = 4444;

// Подключение middleware для обработки JSON в запросах
app.use(express.json());

// Подключение middleware для обслуживания статических файлов из папки 'uploads'
app.use('/uploads', express.static('uploads'));

//! Download files
// Обработчик POST-запроса на маршруте '/upload' для загрузки файлов
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    // Проверка наличия загруженного файла
    if (req.file) {
      // Используем path.join для генерации правильного пути
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    }
  } catch (e) {
    // Логирование ошибки в случае возникновения исключения
    console.log(e);
  }
});

//! Registration
// Обработчики запросов для регистрации новых пользователей
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.get('/auth/me', checkAuth, getMe);

//! POST
// Обработчики запросов для операций с постами
app.get('/posts', getAllPosts);
app.get('/posts/:id', getOnePost);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, createPost);
app.delete('/posts/:id', checkAuth, deletePost);
app.delete('/posts/:id/comment/:commentId', checkAuth, deleteComment);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, updatePost);
app.post(
  '/posts/:id/comment',
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  addComment,
);

//! ITEMS
// Обработчики запросов для операций с товарами
app.post('/items', itemValidation, handleValidationErrors, createItem);
app.get('/items', getItems);
app.get('/items/:id', getOneItem);
app.delete('/items/:id', checkAuth, deleteItem);

// Запуск сервера на указанном порту
app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server is running on port ${port}`);
});
