const fs=require('fs')
const path=require('path')
const crypto=require('crypto')
const {createServer}=require('http')
// const filename=path.join(__dirname,'index.html')
const DATA_FILE=path.join(__dirname,'data','links.json')
const serverFile=async(filename,type,res)=>{    
    try { const data=await fs.promises.readFile(filename)
        res.writeHead(200,{'Content-Type':type})
        res.end(data);}
        catch(error){
            res.writeHead(404,{'Content-Type':type})
            res.end('404 Not found')
        }
    }
    const loadLinks=async()=>{
        try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        // console.log('empty json file');
        
        return {}; // return empty object if file doesn't exist yet
    }
    }
    const savedLinks=async(links)=>{
        await fs.promises.writeFile(DATA_FILE,JSON.stringify(links))
    }
    server=createServer(async(req,res)=>{
        if(req.method.toLowerCase()=='get'){
            if(req.url=='/'){
                return  serverFile(path.join(__dirname,'index.html'),'text/html',res)//we use return so that it exits the parent function after calling the function so that rest of the code doesnt executes by itself
            }
            else if(req.url=='/style.css')
               return  serverFile(path.join(__dirname,'style.css'),'text/css',res)

            else if(req.url=='/links'){
                const links=await loadLinks()
                 res.writeHead(200,{'Content-Type':'application/json'})
                 return res.end(JSON.stringify(links))
            }
            else{
                // res.writeHead(404, { 'Content-Type': 'text/plain' });
                // res.end('error')
                const links=await loadLinks()
                const shortCode=req.url.slice(1)
                console.log(shortCode);
                
                if(links[shortCode]){
                    res.writeHead(302,{Location:links[shortCode]})
                    return res.end()
                }
                else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Short URL not found');
    }
            }  
            
        }
        
        if(req.url=='/shorten' && req.method.toLowerCase()=='post'){
        // console.log('hi');
        
        let body='' 
        req.on('data',(chunk)=>body+=chunk)//whenever data comes this callback is executed
        req.on('end',async()=>{
            const links=await loadLinks()
            // console.log(body);
            const {url,shortCode}=JSON.parse(body)

            if(!url){
                res.writeHead(400,{'Content-Type':'text/plain'})
                res.end('url is required')
            }
            const finalShortCode=shortCode || crypto.randomBytes(4).toString(('hex'))
            
            if(links[finalShortCode]){
                res.writeHead(400,{'Content-Type':'text/plain'})
                res.end('short code exists')
                
            }
            links[finalShortCode]=url
            await savedLinks(links)
            res.writeHead(200,{'Content-Type':'application/json'})
            res.end(JSON.stringify({ shortCode: finalShortCode }));
        })
        }
})
const PORT =  3000;
server.listen(PORT, '0.0.0.0',()=>{console.log('server started');
})
 