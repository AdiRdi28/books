require('dotenv').config()
const express = require('express')
const router = express.Router()
const fs = require('fs');

// const DB = require('../DB/db.json')
const dataFile = fs.readFileSync('./DB/db.json');
const DB = JSON.parse(dataFile);
// console.log(myObject);

//----------------------------------------------------------------
//โจทย์ข้อที่ 1 
// 1. API สำหรับดึงข้อมูลรายการหนังสือทั้งหมด 
//     - สามารถค้นหาข้อมูลหนังสือทั้งหมดได้
//     - สามารถค้นหา เฉพาะหมวดหนังสือที่ส่งค่าไปได้ (เช่น category =  Kids)
//----------------------------------------------------------------

router.get('/', (req, res) => {
  const category = req.query.category; // รับค่า category จาก query parameter
  const books = DB;
  
  if (category) {
    // กรองหนังสือใน books เฉพาะที่ตรงกับ category
    const filteredBooks = books.filter(book => book.category === category);

    if (filteredBooks.length === 0) {
      // ไม่พบหนังสือในหมวดหมู่ที่ระบุ
      res.status(404).json({
        success: false,
        message: 'ไม่พบหนังสือในหมวดหมู่ที่ระบุ',
      });return
    } else {
      res.status(200).json({
        success: true,
        data: filteredBooks,
      });return
    }
  } else {
    // ถ้าไม่ระบุ category ให้คืนหนังสือทั้งหมด
    res.status(200).json({
      success: true,
      data: books,
    });return
  }
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 2
// 2. API สำหรับดึงข้อมูลหนังสือเฉพาะ book id ที่ส่งเข้ามา 
//----------------------------------------------------------------

router.get('/filterById/:id', (req, res) => {
  const books = DB;
  const id = req.params.id;
  const booksById = books.filter(book => book.book_id === Number(id));

   if (booksById.length > 0) {
    res.status(200).json({
      success: true,
      data: booksById,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "ไม่พบหนังสือที่มีรหัส ID ที่ระบุ",
    });
  }

  return
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 3
// 3. API สำหรับเพิ่มข้อมูลหนังสือ
//----------------------------------------------------------------

router.post('/store', (req, res) => {
  const books = DB;
  const lastId  = books[books.length - 1];
  const newBook = req.body; // รับข้อมูลใหม่จาก body ของ request
  // เพิ่มข้อมูลใหม่ลงใน DB
  const newObj = {
    book_id: Number(lastId.book_id) + 1,
    category: newBook.category,
    book_name: newBook.book_name,
    description: newBook.description,
    detail: newBook.detail
  }

  books.push(newObj);
  const newData = JSON.stringify(books);
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });

  res.status(200).json({
    success: true,
    data: newObj, // ส่งข้อมูลที่เพิ่มใหม่กลับไป
  });
  return
 
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 4
// 4. API สำหรับแก้ไขข้อมูลหนังสือเฉพาะ book id ที่ส่งเข้ามา 
//----------------------------------------------------------------

router.put('/update/:id', (req, res) => {
  let books = DB;
  const updateId  = req.params.id;
  const newBook = req.body; // รับข้อมูลใหม่จาก body ของ request

  const objectToUpdate = books.find(book => book.book_id === Number(updateId));
  if(objectToUpdate) {
    objectToUpdate.category = newBook.category,
    objectToUpdate.book_name = newBook.book_name,
    objectToUpdate.description = newBook.description,
    objectToUpdate.detail = newBook.detail
  }
  
  const index = books.findIndex(book => book.book_id === updateId);
  if(index !== -1){
    books[index] = objectToUpdate;
  }

  const newData = JSON.stringify(books);
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });
  if (objectToUpdate) {
    res.status(200).json({
      success: true,
      data: books,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "ไม่พบหนังสือที่มีรหัส ID ที่ระบุ",
    });
  }

  return
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 5
// 5. API สำหรับลบข้อมูลหนังสือเฉพาะ book id ที่ส่งเข้ามา
//----------------------------------------------------------------

router.delete('/delete/:id', (req, res) => {
  let books = DB;
  const deleteId = req.params.id;
  const index = books.findIndex(book => book.book_id === Number(deleteId));
  if (index !== -1) {
    books.splice(index, 1);
  }

  const newData = JSON.stringify(books);
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });

  res.status(200).json({
    success: true,
    data: books, // ส่งข้อมูลที่เพิ่มใหม่กลับไป
  });
  return
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 6
// 6. API สำหรับสรุปจำนวนหนังสือตามหมวดหนังสือ
//----------------------------------------------------------------

router.get('/summaryByType', (req, res) => {
  const books = DB;
  // set array category
  const uniqueCategories = books.reduce((categories, item) => {
    categories.add(item.category);
    return categories;
  }, new Set());
  const uniqueCategoriesArray = Array.from(uniqueCategories);
  const categoryCounts = {};

  // นับตาม category
  uniqueCategoriesArray.forEach(category => {
    const count = books.filter(item => item.category === category).length;
    categoryCounts[category] = count;
  });

  res.status(200).json({
    success: true,
    data: categoryCounts, // ส่งข้อมูลที่เพิ่มใหม่กลับไป
  });
  return
});

module.exports = router