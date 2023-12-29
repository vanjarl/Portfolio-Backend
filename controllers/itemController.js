import itemModel from '../models/itemScheme.js';

export const createItem = async (req, res) => {
  try {
    const existingImg = await itemModel.findOne({ imageUrl: req.body.imageUrl });

    if (existingImg) {
      return res.status(400).json({
        message: 'Послуга з таким зображенням вже існує',
      });
    }
    const existingTitle = await itemModel.findOne({ title: req.body.title });

    if (existingTitle) {
      return res.status(400).json({
        message: 'Послуга з такою назвою вже існує',
      });
    }

    const doc = new itemModel({
      imageUrl: req.body.imageUrl,
      title: req.body.title,
      category: req.body.category,
      rating: req.body.rating,
      text: req.body.text,
      priceList: req.body.priceList,
      userId: req.body.userId,
    });
    const item = await doc.save();
    res.json(item);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нажаль на сервері сталася помилка. Спробуйте будь-ласка пізніше',
    });
  }
};

export const getItems = async (req, res) => {
  try {
    const query = req.query;
    const { limit, sortBy, order, page, category } = query;
    console.log(sortBy);
    const skippedItems = parseInt(limit, 10) * (parseInt(page, 10) - 1);
    const arrange = order === 'asc' ? 1 : -1;

    const conditions = {};

    if (category) {
      conditions.category = parseInt(category, 10);
    }

    // const aggregationPipeline = [
    //   // {
    //   //   $addFields: {
    //   //     price: {
    //   //       $min: {
    //   //         $concatArrays: [
    //   //           {
    //   //             $cond: {
    //   //               if: {
    //   //                 $ne: ['$priceList.middle', undefined],
    //   //               },
    //   //               then: '$priceList.middle.price',
    //   //               else: [],
    //   //             },
    //   //           },
    //   //           {
    //   //             $cond: {
    //   //               if: {
    //   //                 $ne: ['$priceList.senior', undefined],
    //   //               },
    //   //               then: '$priceList.senior.price',
    //   //               else: [],
    //   //             },
    //   //           },
    //   //         ],
    //   //       },
    //   //     },
    //   //   },
    //   // },
    //   {
    //     $addFields: {
    //       price: {
    //         $concatArrays: [
    //           '$priceList.middle' ? ['$priceList.middle.price'] : [],
    //           '$priceList.senior' ? ['$priceList.senior.price'] : [],
    //         ],
    //       },
    //     },
    //   },
    // ];

    const aggregationPipeline = [
      {
        $addFields: {
          price: {
            $min: {
              $concatArrays: [
                {
                  $cond: {
                    if: {
                      $and: [
                        { $isArray: '$priceList.middle.price' },
                        { $ne: ['$priceList.middle.price', null] },
                      ],
                    },
                    then: '$priceList.middle.price',
                    else: [],
                  },
                },
                {
                  $cond: {
                    if: {
                      $and: [
                        { $isArray: '$priceList.senior.price' },
                        { $ne: ['$priceList.senior.price', null] },
                      ],
                    },
                    then: '$priceList.senior.price',
                    else: [],
                  },
                },
              ],
            },
          },
        },
      },
    ];

    console.log(aggregationPipeline);
    const items = await itemModel
      .aggregate(aggregationPipeline)
      .sort({ [sortBy]: arrange })
      .skip(skippedItems)
      .limit(parseInt(limit, 10))
      .exec();

    console.log(
      'Middle Prices:',
      items.map((item) => item.priceList.middle),
    );

    console.log(
      'Senior Prices:',
      items.map((item) => item.priceList.senior),
    );
    console.log(
      'Condition 1:',
      items.map((item) => ({
        middle: '$priceList.middle.price',
        result: item.priceList.middle ? item.priceList.middle.price : [],
      })),
    );
    console.log(
      'Condition 2:',
      items.map((item) => ({
        senior: '$priceList.senior.price',
        result: item.priceList.senior ? item.priceList.senior.price : [],
      })),
    );
    console.log(
      'Prices after $addFields:',
      items.map((item) => item.price),
    );

    const amount = await itemModel.countDocuments(conditions);
    console.log(items.price);
    // const items = await itemModel.aggregate(aggregationPipeline);

    res.json({ items, amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении данных' });
  }
};

export const getOneItem = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await itemModel.findOne({ _id: id });
    if (!data) {
      return res.status(404).json({ message: 'Послуга не знайдена' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося отримати послугу' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const postId = req.params.id;
    const doc = await itemModel.findOneAndDelete({ _id: postId });

    if (doc) {
      res.json({ ' Видалено': doc });
    } else {
      res.status(404).json({ message: 'Послуга не знайдена' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не вдалося видалити послугу' });
  }
};
