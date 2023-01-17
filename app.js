const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");

dotenv.config({path: './config.env'});

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use(cors());

//Setting up Database 
const DB = process.env.DATABASE;
mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log("connection successful");
}).catch((err) => console.log(err));
mongoose.set('strictQuery', true);
const notesSchema = new mongoose.Schema({
  title:String,
  content:String
});

const Notes = mongoose.model('NOTES', notesSchema);

let notes = [];


//Get all post request
app.get("/", function(req, res){
  Notes.find({}, (err, notes)=>{
    if(err) console.log(err);
    res.status(201).json({
        success:true,
        notes
    })
  })
});

//get note by id
app.get("/:id", function(req, res){
  const id = req.params.id;
  Notes.findById(id, (err, notes)=>{
    if(err) console.log(err);
    res.status(201).json({
        success:true,
        notes
    })
  })
});

//Creating a note
app.post("/compose/:id", async function(req, res){
  var id = null;
  id = req.params.id;
  if(req.params.id === 'undefined'){
    const note = new Notes({
    title:req.body.title,
    content: req.body.content
    });
  note.save().then(()=> console.log("Note saved"));
  return res.status(201).json({
    success:true,
    note
  });

}else{
  const notes = await Notes.findById(id, (err, note) =>{
      if(err) console.log(err);
        note.title = req.body.title;
        note.content = req.body.content;
        note.save().then(()=> console.log("Note Saved"));
    return res.status(201).json({
      success:true,
      note
    });
    }
  )
    
  
}
});


//Delete Request
app.get("/delete/:id", (req, res)=>{
  const id = req.params.id;
  Notes.findByIdAndDelete(id, (err,deleted)=>{
    if(err) console.log(err);
  });
  res.status(201).json({
    success:true,
    message:"Note deleted successfully"
  });
});

if(process.env.NODE_ENV == 'production'){
  app.use(express.static("client/build"));
}

app.listen(process.env.PORT||5000, function() {
  console.log("Server started on port 5000");
});