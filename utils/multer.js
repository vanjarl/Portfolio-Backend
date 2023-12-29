import multer from 'multer';
// Конфигурация multer для обработки файлов
const storage = multer.diskStorage({
  // Определение папки, в которую будут сохраняться файлы
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Файлы будут сохранены в папку 'uploads/'
  },
  // Определение имени файла при сохранении (используется оригинальное имя файла)
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// Массив разрешенных типов файлов
const types = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg'];

// Функция для фильтрации файлов по типу
const fileFilter = (req, file, cb) => {
  // Проверка, входит ли тип файла в разрешенные
  if (types.includes(file.mimetype)) {
    cb(null, true); // Файл принимается
  } else {
    cb(null, false); // Файл отклоняется
  }
};

// Создание объекта multer с использованием определенной конфигурации
export const upload = multer({ storage, fileFilter });
