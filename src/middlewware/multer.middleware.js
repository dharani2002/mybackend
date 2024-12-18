import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)//should have own name check multer git
    }
  })
  
  export const upload = multer({ 
    storage,
})
