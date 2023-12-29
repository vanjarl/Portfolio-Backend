import { body } from 'express-validator';

export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов и соответствовать требованиям')
    .isLength({ min: 5 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/)
    .withMessage(
      'Пароль должен содержать хотя бы одну строчную, одну заглавную букву, одну цифру и один из специальных символов',
    ),
  body('fullName', 'Укажите имя длиной минимум 3 символа').isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isString(),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 4 }),
];

// export const itemValidation = [body('imageUrl', 'Неверный формат cсылки на изображение').isURL()];
export const itemValidation = [
  body('imageUrl', 'Неверный формат cсылки на изображение').isString(),
];

//  TODO продумать на фронте условия к полям типа название и текст

export const postCreateValidation = [
  body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
  body('text', 'Введите текст статьи').isLength({ min: 10 }).isString(),
  body('tags', 'Неверный формат тэгов (укажите массив)').optional().isArray(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];

export const commentCreateValidation = [
  body('text', 'Введіть текст коментаря').isLength({ min: 3 }).isString(),
];
