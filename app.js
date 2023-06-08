const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const _= require("lodash");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/toDoListV2",{ useNewUrlParser: true , useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const itemSchema = new mongoose.Schema({
  itemName:String
});

const Item = mongoose.model("item",itemSchema);


const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List = mongoose.model("list",listSchema);


app.get("/",(req,res)=>{
      Item.find(function(err,items){
        res.render("list",{listTitle:"Today",newListItems:items});
      })

})

app.get("/about",(req,res)=>{
  res.render("about",{});
})

app.get("/:customListName",(req,res)=>{
  const listName = _.capitalize(req.params.customListName);
  List.findOne({name:listName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const newList = new List({
          name:listName,
          items:[]
        });
        newList.save();
        res.redirect("/"+listName);

      }
      else
      {
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  })
})


app.post("/",(req,res)=>{
  const newItem = req.body.newItem;
  const listName = req.body.list;
  const insertItem = new Item({
    itemName:newItem
  });
  if(listName==="Today")
  {
    insertItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err)
      {
        foundList.items.push(insertItem);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
  }

})

app.post("/delete",(req,res)=>{
  const deleteItem = req.body.checkboxItem;
  const listName = req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(deleteItem,function(err){
      if(!err)
      {
        console.log("Item Deleted Successfully");
        res.redirect("/");
      }
    })
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }

})



app.listen("3000",()=>{
  console.log("Application is running on port 3000");
})
