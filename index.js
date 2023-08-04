const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const app = express();
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const conn = mysql.createConnection({
    host: 'localhost',
    database: 'timetable',
    user: 'root',
    password: ''
});



app.get('/adminregister',(req,res)=>{
    res.sendFile(__dirname+'/public'+'/adminregister.html');
});

app.post('/adminregister',(req,res)=>{
    const aname=req.body.name;
    const ausername=req.body.username;
    const apassword=req.body.password;
    

    conn.query('INSERT INTO admin(name,username,password) values (?,?,?)',[aname,ausername,apassword],(error,results)=>{});
    res.sendFile(__dirname + '/public' + '/adminlogin.html');
});

app.get('/adminlogin',(req,res)=>{
    res.sendFile(__dirname+'/public'+'/adminlogin.html');
});

app.post('/adminlogin', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
    const query = `SELECT * FROM admin WHERE username='${username}' AND password='${password}'`;
    conn.query(query, function(err, rows) {
      if (err) throw err;
      req.session.username=username;
     
      if (rows.length > 0) {
        if(req.session.username){
          
          
          //console.log(username);
         res.sendFile(__dirname+'/public'+'/adminmainpage.html')
      }
        //res.status(200).send('Login successful');
      } else {
        res.status(401).send('Invalid login credentials');
      }
    });
  });
  
app.get('/facultyregister',(req,res)=>{
    res.sendFile(__dirname+'/public'+'/facultyregister.html');
});

app.post('/facultyregister',(req,res)=>{
    const fname=req.body.name;
    const fusername=req.body.username;
    const fpassword=req.body.password;
    

    conn.query('INSERT INTO faculty(name,username,password) values (?,?,?)',[fname,fusername,fpassword],(error,results)=>{});
    res.sendFile(__dirname + '/public' + '/facultylogin.html');
});




app.get('/facultylogin',(req,res)=>{
    res.sendFile(__dirname+'/public'+'/facultylogin.html');
});

// Define a route for login validation
app.post('/facultylogin', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
   
    const query = `SELECT * FROM faculty WHERE username='${username}' AND password='${password}'`;
    conn.query(query, function(err, rows) {
      if (err) throw err;
  
      req.session.username=username;
      if (rows.length > 0) {
        //const username=req.session.username;
        if(req.session.username){
          
          const username=req.session.username;
          //console.log(username);
          conn.query('SELECT * FROM maintable WHERE name=(SELECT name FROM faculty WHERE username=?)',[username],(error,results)=>{
              res.render(__dirname+'/show'+'/facultyview',{results:results});
          });
      }
        //console.log(username);
       // res.status(200).send('Login successful');
        
      } else {
        res.status(401).send('Invalid login credentials');
      }
      
    });
  });


  app.get('/amainpage',(req,res)=>{
    res.sendFile(__dirname + '/public' +'/amainpage.html');
  })


  app.get('/adminmainpage',(req,res)=>{
    res.sendFile(__dirname + '/public' +'/adminmainpage.html');
  })

  app.post('/adminmainpage',(req,res)=>{
    const { year, section } = req.body;
    var days=['mon','tue','wed','thu','fri','sat']
  for (let i = 1; i <= 8; i++) {
      const hour = i;
      for( let j=0;j < days.length;j++){
        const subjectName = req.body[`subname${i}${days[j]}`];
        const facultyName = req.body[`facname${i}${days[j]}`]; 
    
        conn.query('SELECT * FROM maintable WHERE year=? and section=? and day=? and hour=?',[year,section,days[j],hour],(error,results)=>{
            if (results.length > 0)
            {
                conn.query('DELETE FROM maintable WHERE year=? and section=? and day=? AND hour=?',[year,section,days[j],hour],(error,results)=>{});
            }
            conn.query('INSERT INTO maintable(name, section, year, subject, hour, day) VALUES (?,?,?,?,?,?)',[facultyName,section,year,subjectName,hour,days[j]],(error,results)=>{});
            conn.query('DELETE FROM maintable WHERE hour=? or subject=? or name=?',['','',''],(error,results)=>{});
        });
    }
  }
    //res.sendFile(__dirname+'/public'+'/cdashboard.html');
    res.sendFile(__dirname + '/public' +'/homepage.html');
});



/*app.post('/amainpage',(req,res)=>{
  const { year, section, day } = req.body;
  for (let i = 1; i <= 8; i++) {
      const hour = i;
      const subjectName = req.body[`subname${i}`];
      const facultyName = req.body[`facname${i}`]; 
    

      conn.query('SELECT * FROM newtable WHERE year=? and section=? and day=? and hour=?',[year,section,day,hour],(error,results)=>{
          if (results.length > 0)
          {
              conn.query('DELETE FROM newtable WHERE year=? and section=? and day=? AND hour=?',[year,section,day,hour],(error,results)=>{});
          }
          conn.query('INSERT INTO newtable(name, section, year, subject, hour, day) VALUES (?,?,?,?,?,?)',[facultyName,section,year,subjectName,hour,day],(error,results)=>{});
          conn.query('DELETE FROM newtable WHERE hour=? or subject=? or name=?',['','',''],(error,results)=>{});
      });
  }
  //res.sendFile(__dirname+'/public'+'/cdashboard.html');
  res.send("Inserted into database successfully....")
});*/

app.get('/fulltimetable',(req,res)=>{
  res.sendFile(__dirname + '/public' +'/fulltimetable.html');
});


app.post('/fulltimetable',(req,res)=>{
  const ayear=req.body.year;
  const asection=req.body.section;
  conn.query('SELECT * FROM maintable where year=? and section=? ORDER BY hour',[ayear,asection],(error,results,fields)=>{
      if(error) throw error;
      res.render(__dirname+'/show'+'/adminview',{results:results});
  })
});


app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/public' +'/homepage.html');
})




app.listen(4100, () => {
    console.log("Server is running on port 4100");
});