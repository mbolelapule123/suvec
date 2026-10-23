import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// Local-only SMTP sink. No messages leave this process and no real mailbox is used.
const messages=[];
let rejectMail=false;
const sockets=new Set();
const smtp=createServer(socket=>{
 sockets.add(socket);socket.on('close',()=>sockets.delete(socket));
 let buffer='',authStep=0,data=false,body='',recipients=[];
 socket.write('220 localhost SMTP test sink\r\n');
 socket.on('data',chunk=>{
  buffer+=chunk;
  while(buffer.includes('\r\n')){
   const index=buffer.indexOf('\r\n');const line=buffer.slice(0,index);buffer=buffer.slice(index+2);
   if(data){if(line==='.') {data=false;messages.push({recipients,body});socket.write('250 Accepted\r\n');}else body+=line+'\n';continue;}
   if(authStep){socket.write(authStep===1?'334 UGFzc3dvcmQ6\r\n':'235 Authenticated\r\n');authStep=authStep===1?2:0;continue;}
   if(/^EHLO|^HELO/.test(line))socket.write('250-localhost\r\n250 AUTH LOGIN PLAIN\r\n');
   else if(line==='AUTH LOGIN'){authStep=1;socket.write('334 VXNlcm5hbWU6\r\n');}
   else if(line.startsWith('AUTH PLAIN'))socket.write('235 Authenticated\r\n');
   else if(line.startsWith('MAIL FROM'))socket.write(rejectMail?'550 Rejected for test\r\n':'250 OK\r\n');
   else if(line.startsWith('RCPT TO')){recipients.push(line);socket.write('250 OK\r\n');}
   else if(line==='DATA'){data=true;socket.write('354 Send message\r\n');}
   else if(line==='QUIT'){socket.end('221 Goodbye\r\n');}
   else socket.write('250 OK\r\n');
  }
 });
});
await new Promise(resolve=>smtp.listen(0,'127.0.0.1',resolve));
const directory=await mkdtemp(join(tmpdir(),'suvec-mail-test-'));
const configPath=join(directory,'config.php');
const php=spawn(process.env.PHP_BINARY||'php',['-S','127.0.0.1:8088','-t','server/php'],{env:{...process.env,SUVEC_MAIL_CONFIG:configPath},stdio:'ignore'});
let startupError;
php.on('error',error=>{startupError=error;});
const valid={kind:'contact',name:'QA Visitor',email:'visitor@example.com',phone:'+260000000000',company:'Example',service:'Transport quote',message:'Please transport a test load.',website:'',consent:'yes'};
async function request(data,{method='POST',origin='https://suvec.org',contentType='application/json'}={}){
 const response=await fetch('http://127.0.0.1:8088/enquiry.php',{method,headers:{Origin:origin,'Content-Type':contentType},...(method==='POST'?{body:typeof data==='string'?data:JSON.stringify(data)}:{})});
 const text=await response.text();
 try{return {status:response.status,body:JSON.parse(text)}}catch{throw new Error(`Unexpected PHP response (${response.status}): ${text}`)}
}
try{
 let ready=false;
 for(let i=0;i<60;i++){if(startupError)throw startupError;try{await request(null,{method:'GET'});ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}
 assert.ok(ready,'PHP test server did not start. Set PHP_BINARY to a PHP 8.1+ executable.');
 assert.equal((await request(null,{method:'GET'})).status,405);
 assert.equal((await request(valid,{origin:'https://example.com'})).status,403);
 assert.equal((await request('{broken')).status,400);
 assert.equal((await request(valid,{contentType:'text/plain'})).status,415);
 assert.equal((await request({...valid,email:'invalid'})).status,422);
 assert.equal((await request({...valid,name:'Name\r\nBcc: attacker@example.com'})).status,422);
 assert.equal((await request({...valid,kind:'quote'})).status,422);
 assert.equal((await request({...valid,website:'spam.example'})).status,400);
 assert.equal((await request({...valid,consent:''})).status,422);
 assert.equal((await request(valid)).status,503);
 console.log('PASS method, origin, payload, validation, honeypot and missing configuration');
 const port=smtp.address().port;
 const path=directory.replaceAll('\\','/').replaceAll("'","\\'");
 await writeFile(configPath,`<?php return ['smtp_host'=>'127.0.0.1','smtp_port'=>${port},'smtp_encryption'=>'','smtp_username'=>'info@suvec.org','smtp_password'=>'local-test-only','rate_directory'=>'${path}/rate'];`);
 const sent=await request(valid);
 assert.equal(sent.status,200);assert.equal(sent.body.ok,true);
 assert.equal(messages.length,1);assert.deepEqual(messages[0].recipients,['RCPT TO:<info@suvec.org>']);
 assert.match(messages[0].body,/Reply-To: QA Visitor <visitor@example.com>/);
 assert.match(messages[0].body,/Please transport a test load/);
 assert.equal((await request({...valid,kind:'quote',collection:'Lusaka',delivery:'Ndola'})).status,200);
 assert.equal((await request({...valid,kind:'career',experience:'5 years'})).status,200);
 assert.equal(messages.length,3);
 console.log('PASS real PHPMailer SMTP submission to local sink, recipient, Reply-To, contact, quote and career messages');
 rejectMail=true;
 assert.equal((await request(valid)).status,502);
 assert.equal(messages.length,3);
 rejectMail=false;
 assert.equal((await request(valid)).status,200);
 const limited=await request(valid);
 assert.equal(limited.status,429);assert.equal(limited.body.ok,false);
 console.log('PASS transport rejection, truthful failure response and rate limiting');
}finally{
 if(php.exitCode===null&&!startupError)await new Promise(resolve=>{php.once('exit',resolve);php.kill();});
 for(const socket of sockets)socket.destroy();
 await new Promise(resolve=>smtp.close(resolve));
 await rm(directory,{recursive:true,force:true});
}
