const express = require("express");
const bodyParser = require("body-parser");
const {urlencoded} = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.set("strictQuery", true)
mongoose.connect("mongodb+srv://kaleligabriel:test123@cluster1.1jdul4t.mongodb.net/todolistDB", {useNewUrlParser: true});
// mongoose.connect('mongodb+srv://kaleligabriel:test123@Cluster0.mongodb.net/Newtodolist?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });


const itemsSchema = new mongoose.Schema ({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);


const reviseCat = new Item({
    name:"Read for Computer graphics Cat"
});
const research = new Item({
    name:"Research Methodology chapter 2"
});
const eat = new Item({
    name:"Eat a fruit"
});
const defaultItems = [reviseCat, research, eat];


app.get("/", function(req, res){
    Item.find({}).then((foundItems) =>{
    if(foundItems.length === 0){
        try{
            Item.insertMany(defaultItems);
            console.log("Successfully added")
        }catch(error){
            console.log(error)
        }
        res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    }).catch((err) =>{
        console.error(err)
    })
});


app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    });
    if(listName == "Today"){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name: listName}).then((foundList) =>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        }).catch((error) =>{
            console.error(error)
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == "Today"){
        Item.findByIdAndDelete(checkedItemId).then((deletedItem) => {
        console.log(`Deleted item: ${deletedItem}`);
        res.redirect("/")
        })
        .catch((error) => {
            console.error(error);
        });
    }else{
        List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:checkedItemId}}}).then((foundList) =>{
            res.redirect("/"+listName)
        })
        .catch((error)=>{
            console.error(error)
        })
    }
});

const listSchema = new mongoose.Schema({
    name:String,
    items: [itemsSchema]
})
const List = mongoose.model("List", listSchema)

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:req.params.customListName}).then((foundListName) =>{
        if(foundListName){
            //create a new List
            res.render("list", {listTitle: foundListName.name, newListItems: foundListName.items})
        }else{
            //show existing list
            const list = new List({
            name:customListName,
            items:defaultItems
            });
            list.save()
        }res.redirect("/"+ customListName)
            
    })
    .catch((error) =>{
        console.error(error);
    });
})            

app.listen("3000", function(){
    console.log("Server is running on port 3000");
});