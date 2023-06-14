const express = require('express')
const formidable = require('formidable');
const path = require("path")
const app = express()
const port = 3000
const fs = require("fs")
const fsAsync = require("fs").promises
const cors = require('cors');
app.use(express.json());
app.use(express.static('uploads'))
app.use(cors({
    origin: '*'
}));
app.listen(port, () => {
  console.log(`App running on port ${port}`)
})
const root = path.join(__dirname,"uploads")
const getFiles = async () => {
        console.log(root)
         const data = fs.readdirSync(root)
        let list = [];
         for (let i = 0; i < data.length; i++) {
            const p = data[i] //=path.join(root,data[i])
            list.push(encodeURI(p))
         }
  
         return list;
}
app.get("/", async (req,res) => {     
    const files = await getFiles()
    console.log(files)
    res.json({files:files})
})



app.post('/upload', (req, res) => {
    let form = formidable({});

    console.log("a")
    form.uploadDir = path.join(__dirname,"uploads")
    console.log(form.uploadDir)
    form.on('file', async function(field, file) {
            let name = file.name
            ext = ".jpg"
            let name2 = name.replace(ext,"")
            let i=1
            while(fs.existsSync(path.join(form.uploadDir,name))) {
                name = name2 + "-copy"+i+ext
                i++
            }
            await fsAsync.rename(file.path, path.join(form.uploadDir, name));
    }); 

    form.parse(req, function (err, fields, files) {
       
        res.send("tu madre")
        
    });
});

app.get('/renameFile', async function(req,res)
{
    let oldname= req.query.current;
    let newname = req.query.name
    let ext  = path.extname(oldname);
    let name = newname + ext;
    let filepath = path.join(root,name)
   
    let i=1
    while(fs.existsSync(filepath)) {
        let name = newname + "["+i+"]"+ext
        filepath = (path.join(root,name))
        i++
    }
    await fsAsync.rename(path.join(root,oldname),filepath)

    res.send("A")
})



app.get('/delete/', async (req, res) => {
    const filepath = path.join(root,req.query.name)
    try {
        if(fs.existsSync(filepath))
        {
                await fsAsync.rm(filepath,{recursive: true, force: true})
                res.send("plik usunięty")
    }   } 
    catch {
        console.log("E")
    }
    
})
app.post('/deleteMultiple/', async (req, res) => {
    const files = req.body
    for (let file of files) {

    const filepath = path.join(root,decodeURI(file))
    console.log(filepath)
    try {
        if(fs.existsSync(filepath))
        {
                await fsAsync.rm(filepath,{recursive: true, force: true})

    }   } 
    catch {
        console.log("E")
    }
}
    res.send("A")
    
})
