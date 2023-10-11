require('dotenv').config()
const express = require('express')
const router = express.Router()
const fs = require('fs');

const dataFile = fs.readFileSync('./DB/db.json');
const DB = JSON.parse(dataFile);

//----------------------------------------------------------------
//โจทย์ข้อที่ 1 
// 1. API สำหรับดึงข้อมูลรายการหนังสือทั้งหมด 
//     - สามารถค้นหาข้อมูลหนังสือทั้งหมดได้
//     - สามารถค้นหา เฉพาะหมวดหนังสือที่ส่งค่าไปได้ (เช่น category =  Kids)
//----------------------------------------------------------------

router.get('/', (req, res) => {
  const category = req.query.category;                                          // รับค่า category จาก query parameter 
  const books = DB;                                                             // นำ DB มาเก็บไว้ในตัวแปร books
  
  if (category) {                                                               // ตรวจสอบว่า category มีค่าหรือไม่
    const filteredBooks = books.filter(book => book.category === category);     // กรองหนังสือใน books เฉพาะที่ตรงกับ category

    if (filteredBooks.length === 0) {                                           // ตรวจสอบว่า filteredBooks มีค่าเท่ากับ 0 หรือไม่ (ไม่พบข้อมูล category ที่ค้นหา)
      res.status(404).json({
        success: false,
        message: 'ไม่พบหนังสือในหมวดหมู่ที่ระบุ',
      });return
    } else {                                                                    // ในกรณีที่พบข้อมูลจะ return ข้อมูลที่พบ
      res.status(200).json({
        success: true,
        data: filteredBooks,
      });return
    }
  } else {                                                                      // ในกรณีไม่ระบุ category จะแสดงรายการหนังสือทั้งหมด
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
  const books = DB;                                                           // นำ DB มาเก็บไว้ในตัวแปร books
  const id = req.params.id;                                                   // นำ req.params.id (id ที่ต้องการจะ filter) มาเก็บไว้ในตัวแปร
  const booksById = books.filter(book => book.book_id === Number(id));        // filter หาข้อมูลใน DB ตาม id ที่ส่งมาแล้วเก็บไว้ในตัวแปร booksById

   if (booksById.length > 0) {                                                // ตรวจสอบว่า booksById มีค่ามากกว่า 0 หรือไม่ (ถ้ามากกว่าเท่ากับมีข้อมูล)
    res.status(200).json({                                                    
      success: true,
      data: booksById,
    });
  } else {                                                                    // ในกรณีที่ไม่พบข้อมูล
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
  const books = DB;                                                          // นำ DB มาเก็บไว้ในตัวแปร books
  const lastId  = books[books.length - 1];                                   // ตรวจสอบ id ล่าสุดใน DB
  const newBook = req.body;                                                  // รับข้อมูลใหม่จาก body ของ request ที่ส่งมา

  const newObj = {                                                           // เพิ่มข้อมูลใหม่ลงใน DB
    book_id: Number(lastId.book_id) + 1,
    category: newBook.category,
    book_name: newBook.book_name,
    description: newBook.description,
    detail: newBook.detail
  }

  books.push(newObj);                                                       // push ชุดข้อมูล newObj ลงใน books
  const newData = JSON.stringify(books);                                    // แปรง books ให้เป็น Json
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {            // นำข้อมูลใหม่มาเขียนเข้าไปในไฟล์ 
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });

  res.status(200).json({
    success: true,
    data: newObj,                                                           // ส่งข้อมูลที่เพิ่มใหม่กลับไป
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
  const newBook = req.body;                                                // รับข้อมูลใหม่จาก body ของ request

  const objectToUpdate = books.find(book => book.book_id === Number(updateId)); // find หา id ที่ต้องการอัพเดท
  if(objectToUpdate) {                                                     // ตรวจสอบว่า objectToUpdate มีค่าหรือไม่
    objectToUpdate.category = newBook.category,
    objectToUpdate.book_name = newBook.book_name,
    objectToUpdate.description = newBook.description,
    objectToUpdate.detail = newBook.detail
  }
  
  const newData = JSON.stringify(books);                                  // แปรง books ให้เป็น Json
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {          // นำข้อมูลใหม่แก้ไขเข้าไปในไฟล์
    if (err) {                                                                
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });
  if (objectToUpdate) {                                                  // update สำเร็จแสดงผลข้อมูล
    res.status(200).json({
      success: true,
      data: books,
    });
  } else {                                                              // กรณี update ไม่สำเร็จ
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
  let books = DB;                                                      // นำ DB มาเก็บไว้ในตัวแปร books
  const deleteId = req.params.id;                                      // นำ req.params.id (id ที่ต้องการจะลบ) มาเก็บไว้ในตัวแปร
  const index = books.findIndex(book => book.book_id === Number(deleteId)); // filter หาข้อมูลใน DB ตาม deleteId ที่ส่งมาแล้วเก็บไว้ในตัวแปร index
  if (index !== -1) {                                                  // ตรวจสอบว่าพบข้อมูลไหม
    books.splice(index, 1);                                            // ลบข้อมูล arrays ตำแหน่งดังกล่าว
  }

  const newData = JSON.stringify(books);                               // แปรง books ให้เป็น Json
  fs.writeFile("./DB/db.json", newData, 'utf8', function (err) {       // นำข้อมูลใหม่เหลือเขียนเข้าไปในไฟล์
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
      console.log("JSON file has been saved.");
  });

  res.status(200).json({
    success: true,
    data: books, 
  });
  return
});

//----------------------------------------------------------------
//โจทย์ข้อที่ 6
// 6. API สำหรับสรุปจำนวนหนังสือตามหมวดหนังสือ
//----------------------------------------------------------------

router.get('/summaryByType', (req, res) => {
  const books = DB;

  const uniqueCategories = books.reduce((categories, item) => {       // reduce หา category ที่ไม่ซ้ำกันและนำมาเก็บไว้ในตัวแปร 
    categories.add(item.category);                                      
    return categories;
  }, new Set());
  const uniqueCategoriesArray = Array.from(uniqueCategories);         // แปลง uniqueCategories ให้เป็น array
  const categoryCounts = {};                                          // สร้างตัวแปร Obj ไว้เพื่อเก็บประเภท category

  uniqueCategoriesArray.forEach(category => {                         // loop หาข้อมูลใน DB ทั้งหมดเพื่อหา category พร้อม count จำนวนตามหมวดหมู่
    const count = books.filter(item => item.category === category).length;
    categoryCounts[category] = count;
  });

  res.status(200).json({
    success: true,
    data: categoryCounts, 
  });
  return
});

module.exports = router