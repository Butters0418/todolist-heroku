const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [];



const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  // 接收封包
  let body = '';
  req.on('data',(chunk)=>{
    // console.log(chunk);
    body += chunk;
  })

  // console.log(req.url);
  // console.log(req.method);

  if(req.url === '/todos' && req.method === 'GET'){
    res.writeHead(200,headers);
    res.write(JSON.stringify({
      "status" : "success",
      "data" : todos,
    }))
    res.end();
  }else if (req.url === '/todos' && req.method === 'POST'){
    // body 組成後要做的事，把接收到的todo重新建立為一筆todo物件並給id後 push 進 todos ，再寫出來
    req.on('end',()=>{
      // 利用 try catch 確保接收到不正確的格式也不會中止程式
      try {
        const title = JSON.parse(body).title;
        if(title !== undefined) {
          const todo = {
            "title": title,
            "id": uuidv4(),
          }
          todos.push(todo);  
          res.writeHead(200,headers);
          res.write(JSON.stringify({
            "status" : "success",
            "data" : todos,
          }))
          res.end();
        }else {
          errorHandle(res);
        }
      
      }catch(err){
        errorHandle(res);
      }
    })
  }else if (req.url === '/todos' && req.method === 'DELETE'){
    //直接設長度為0，清空 todos
    todos.length = 0;
    res.writeHead(200,headers);
    res.write(JSON.stringify({
      "status" : "success",
      "data" : todos,
    }))
    res.end();
  }else if (req.url.startsWith('/todos/') && req.method === 'DELETE'){
    const id = req.url.split('/').pop();
    // 檢查索引值，該id 是否存在在資料中
    const index = todos.findIndex((el)=>{
      return el.id === id;
    })
    console.log(id,index)
    if(index !== -1) {
      // 刪除陣列
      todos.splice(index,1);
      res.writeHead(200,headers);
      res.write(JSON.stringify({
        "status" : "success",
        "data" : todos,
      }))
      res.end();
    }else {
      errorHandle(res);
    }
  } else if(req.url.startsWith('/todos/') && req.method === 'PATCH'){
    req.on('end',()=>{
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex((el)=>{
          return el.id === id;
        })
        console.log(title,index);
        if(title !== undefined && index !== -1) {
          todos[index].title = title;
          res.writeHead(200,headers);
          res.write(JSON.stringify({
            "status" : "success",
            "data" : todos,
          }))
          res.end();
        }else {
          errorHandle(res);
        }

      }catch(err){
        errorHandle(res);
      }
    })
  } else if (req.method === 'OPTIONS'){
    // 跨網址的東西
    res.writeHead(200,headers);
    res.end();
  }else {
    res.writeHead(404,headers);
    res.write(JSON.stringify({
      "status" : "false",
      "message" : "無此網頁",
    }))
    res.end();
  }
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 8080);