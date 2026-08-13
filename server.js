const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const uploads = path.join(ROOT, 'uploads');
const dataDir = path.join(ROOT, 'data');
const dataFile = path.join(dataDir, 'school-data.json');
fs.mkdirSync(uploads, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const defaults = {
 school_name:'Al-Azan Educational Complex', tagline:'Character Building with Education', eyebrow:'A Grand Welfare Educational Project in South Punjab',
 about_title:'A welfare-based educational project in South Punjab',
 about_text:'Al-Azan Educational Complex is a grand welfare based educational project located in South Punjab, approximately two kilometers from the city of Alipur on Jatoi Road. A total area of twenty kanals has been allocated for this project, where construction is progressing in phases according to a comprehensive and well organized master plan.',
 about_text_2:'By the grace and blessings of Almighty Allah and through the beneficence of His Beloved Messenger, the first phase was completed within a remarkably short period of one year and three months. During this phase, the first building named “Umar bin Abdul Aziz (RA) Block” was constructed over an area of 15,571 square feet and is now fully operational for educational activities.',
 vision:'To contribute towards establishment of an exemplary society by nurturing the younger generation with balanced integration of religious and contemporary education.',
 mission:'Promotion and dissemination of religious sciences aligned with modern needs and advancements.\nCultivating capable, ethical and well-rounded individuals through high-quality education and comprehensive training.\nAddressing social issues, intellectual confusion, moral decline and rising intolerance through educational and ethical initiatives.\nStrengthening societal morals by promoting Islamic ethical values and principles.\nEmpowering underprivileged communities toward self-sufficiency and sustainable development.',
 objectives:'Revival and dissemination of the sciences of the Quran and Hadith.\nRectification of beliefs and understanding of fundamental jurisprudential rulings in light of authentic Islamic teachings and moral purification (tazkiyah).\nPromotion of the Islamic concept of moderation (wasatiyyah).\nEquipping individuals with essential life skills for personal and societal development.\nPreparing distinguished scholars and leaders capable of addressing future intellectual, academic and social challenges.',
 facilities:'Aesthetic, spacious & well-ventilated buildings\nWAPDA & solar electricity backup\nLarge, well-maintained playgrounds\nRobust CCTV security system\nEfficient parental communication\nScholarship programs\nHigh-quality hostel facilities\nTraining & character building programs\nFull-day education for non-residential students\nManaged cafeteria services',
 future_goals:'Establishment of a modern Computer Lab for basic Computer Science and Information Technology education.\nInstallation of CCTV cameras for effective security monitoring and campus safety.\nDevelopment of a Digital Language Lab for specialized Spoken English and Arabic training.\nEstablishment of a well-equipped library to promote research, reading and academic excellence.\nProvision of air-conditioned classrooms for a comfortable learning environment.\nDevelopment of an online portal enabling parents to monitor students’ academic performance and progress.',
 future_projects:'Virtual Academy · Al-Azan Grammar School · Islamic College · Dar-ul-Uloom of Islamic Studies · Proposed Islamic University',
 admission_title:'Admissions are open for Class 5 & 6 with Hifz-ul-Quran', admission_text:'Admissions are open only for Class 5 and 6 with Hifz-ul-Quran.\nAge limit: 9 to 11 years.\nB-Form is required as proof of age.', admission_link:'https://bit.ly/AlAzanAdmission',
 address:'Jatoi Road, 2 Kilometers from Alipur, District Muzaffargarh, Punjab, Pakistan.', email:'alazanedu786@gmail.com', phone:'+92 333 7436422', chairman_name:'Mufti Irshad Hussain Saeedi', chairman_role:'Founding Chairman', slogan:'Character building institution with religious and contemporary education',
 logo:'/assets/Logo Al Azan/Logo Al Azan-1.png', chairman_image:'/assets/chairman.jpg', building_image:'/assets/building.png'
};

function freshStore(){return {site:{...defaults}, students:[], staff:[], classes:[], announcements:[], gallery:[], counters:{students:1,staff:1,classes:1,announcements:1,gallery:1}};}
let store;
try { store = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile,'utf8')) : freshStore(); }
catch { store = freshStore(); }
store.site = {...defaults, ...(store.site||{})};
for (const k of ['students','staff','classes','announcements','gallery']) if(!Array.isArray(store[k])) store[k]=[];
store.counters = store.counters || {};
for (const k of ['students','staff','classes','announcements','gallery']) if(!Number.isInteger(store.counters[k])) store.counters[k]=(store[k].reduce((m,x)=>Math.max(m,Number(x.id)||0),0)+1);
function persist(){fs.writeFileSync(dataFile, JSON.stringify(store,null,2),'utf8');}
persist();
function nextId(type){const id=store.counters[type]++; persist(); return id;}
function removeFile(url){if(!url || !url.startsWith('/uploads/')) return; const f=path.join(ROOT,url.replace(/^\//,'')); if(fs.existsSync(f)) try{fs.unlinkSync(f);}catch{} }

app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({extended:true}));
app.use(session({ secret: process.env.SESSION_SECRET || 'change-this-secret', resave:false, saveUninitialized:false, cookie:{httpOnly:true,sameSite:'lax',maxAge:8*60*60*1000} }));
app.use('/uploads', express.static(uploads));
// Serve the supplied school assets (logo, chairman, building, brochure source images).
app.use('/assets', express.static(path.join(ROOT,'assets')));
app.use(express.static(path.join(ROOT,'Public')));

const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,uploads),filename:(_,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase();cb(null,`${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)}});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(_,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
function auth(req,res,next){if(req.session.admin)return next();res.status(401).json({error:'Unauthorized'});}
function saveSite(body){for(const [k,v] of Object.entries(body||{})) store.site[k]=String(v??''); persist();}

app.post('/api/login',(req,res)=>{const password=req.body.password||'';if(password&&(password===process.env.ADMIN_PASSWORD||(!process.env.ADMIN_PASSWORD&&password==='admin123'))){req.session.admin=true;return res.json({ok:true});}res.status(401).json({error:'Invalid password'});});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/me',(req,res)=>res.json({admin:!!req.session.admin}));
app.get('/api/public/site',(req,res)=>res.json(store.site));
app.get('/api/public/staff',(req,res)=>res.json([...store.staff].sort((a,b)=>(a.sort_order-b.sort_order)||a.id-b.id)));
app.get('/api/public/classes',(req,res)=>res.json(store.classes.filter(x=>x.status==='Active').sort((a,b)=>(a.name||'').localeCompare(b.name||'')||(a.section||'').localeCompare(b.section||''))));
app.get('/api/public/announcements',(req,res)=>res.json([...store.announcements].filter(x=>x.status==='Published').sort((a,b)=>b.id-a.id)));
app.get('/api/public/gallery',(req,res)=>res.json([...store.gallery].sort((a,b)=>(a.sort_order-b.sort_order)||b.id-a.id)));

app.get('/api/site',auth,(req,res)=>res.json(store.site));
app.put('/api/site',auth,(req,res)=>{saveSite(req.body||{});res.json({ok:true,site:store.site});});
app.post('/api/site/image',auth,upload.single('image'),(req,res)=>{if(!req.file)return res.status(400).json({error:'Image is required.'});const key=req.body.key;if(!['logo','chairman_image','building_image'].includes(key))return res.status(400).json({error:'Invalid image key.'});removeFile(store.site[key]);const url=`/uploads/${req.file.filename}`;saveSite({[key]:url});res.json({ok:true,url});});

app.get('/api/students',auth,(req,res)=>{const q=(req.query.q||'').trim().toLowerCase();const cls=(req.query.class_name||'').trim();let rows=store.students.filter(s=>!cls||s.class_name===cls);if(q) rows=rows.filter(s=>[s.name,s.father_name,s.admission_no,s.class_name,s.phone].some(v=>String(v||'').toLowerCase().includes(q)));res.json(rows.sort((a,b)=>b.id-a.id));});
app.post('/api/students',auth,upload.single('photo'),(req,res)=>{try{const d=req.body;if(!d.admission_no||!d.name)return res.status(400).json({error:'Admission No and student name are required.'});if(store.students.some(s=>s.admission_no===d.admission_no))return res.status(400).json({error:'Admission No already exists.'});const row={id:nextId('students'),admission_no:d.admission_no,name:d.name,father_name:d.father_name||'',class_name:d.class_name||'',section:d.section||'',dob:d.dob||'',bform:d.bform||'',phone:d.phone||'',address:d.address||'',photo:req.file?`/uploads/${req.file.filename}`:'',status:d.status||'Active',created_at:new Date().toISOString()};store.students.push(row);persist();res.json({ok:true,id:row.id});}catch(e){res.status(400).json({error:e.message});}});
app.put('/api/students/:id',auth,upload.single('photo'),(req,res)=>{const old=store.students.find(s=>s.id==req.params.id);if(!old)return res.status(404).json({error:'Student not found'});const d=req.body;if(store.students.some(s=>s.id!=old.id&&s.admission_no===d.admission_no))return res.status(400).json({error:'Admission No already exists.'});if(req.file){removeFile(old.photo);old.photo=`/uploads/${req.file.filename}`;}Object.assign(old,{admission_no:d.admission_no,name:d.name,father_name:d.father_name||'',class_name:d.class_name||'',section:d.section||'',dob:d.dob||'',bform:d.bform||'',phone:d.phone||'',address:d.address||'',status:d.status||'Active'});persist();res.json({ok:true});});
app.delete('/api/students/:id',auth,(req,res)=>{const i=store.students.findIndex(s=>s.id==req.params.id);if(i<0)return res.status(404).json({error:'Student not found'});removeFile(store.students[i].photo);store.students.splice(i,1);persist();res.json({ok:true});});
app.get('/api/stats',auth,(req,res)=>{const total=store.students.length,active=store.students.filter(s=>s.status==='Active').length;const map={};for(const s of store.students) map[s.class_name]=(map[s.class_name]||0)+1;const classes=Object.entries(map).map(([class_name,count])=>({class_name,count})).sort((a,b)=>a.class_name.localeCompare(b.class_name));res.json({total,active,classes,staff:store.staff.length,announcements:store.announcements.length});});

app.get('/api/staff',auth,(req,res)=>res.json([...store.staff].sort((a,b)=>(a.sort_order-b.sort_order)||a.id-b.id)));
app.post('/api/staff',auth,upload.single('photo'),(req,res)=>{const d=req.body;if(!d.name)return res.status(400).json({error:'Name is required.'});const row={id:nextId('staff'),name:d.name,role:d.role||'',bio:d.bio||'',photo:req.file?`/uploads/${req.file.filename}`:'',sort_order:Number(d.sort_order||0)};store.staff.push(row);persist();res.json({ok:true,id:row.id});});
app.put('/api/staff/:id',auth,upload.single('photo'),(req,res)=>{const old=store.staff.find(s=>s.id==req.params.id);if(!old)return res.status(404).json({error:'Staff member not found'});const d=req.body;if(req.file){removeFile(old.photo);old.photo=`/uploads/${req.file.filename}`;}Object.assign(old,{name:d.name,role:d.role||'',bio:d.bio||'',sort_order:Number(d.sort_order||0)});persist();res.json({ok:true});});
app.delete('/api/staff/:id',auth,(req,res)=>{const i=store.staff.findIndex(s=>s.id==req.params.id);if(i>=0){removeFile(store.staff[i].photo);store.staff.splice(i,1);persist();}res.json({ok:true});});

app.get('/api/classes',auth,(req,res)=>res.json([...store.classes].sort((a,b)=>(a.name||'').localeCompare(b.name||'')||(a.section||'').localeCompare(b.section||''))));
app.post('/api/classes',auth,(req,res)=>{const d=req.body;if(!d.name)return res.status(400).json({error:'Class name is required.'});const row={id:nextId('classes'),name:d.name,section:d.section||'',teacher:d.teacher||'',description:d.description||'',status:d.status||'Active'};store.classes.push(row);persist();res.json({ok:true,id:row.id});});
app.put('/api/classes/:id',auth,(req,res)=>{const row=store.classes.find(x=>x.id==req.params.id);if(!row)return res.status(404).json({error:'Class not found'});const d=req.body;Object.assign(row,{name:d.name,section:d.section||'',teacher:d.teacher||'',description:d.description||'',status:d.status||'Active'});persist();res.json({ok:true});});
app.delete('/api/classes/:id',auth,(req,res)=>{store.classes=store.classes.filter(x=>x.id!=req.params.id);persist();res.json({ok:true});});

app.get('/api/announcements',auth,(req,res)=>res.json([...store.announcements].sort((a,b)=>b.id-a.id)));
app.post('/api/announcements',auth,(req,res)=>{const d=req.body;if(!d.title)return res.status(400).json({error:'Title is required.'});const row={id:nextId('announcements'),title:d.title,body:d.body||'',date:d.date||new Date().toISOString().slice(0,10),status:d.status||'Published'};store.announcements.push(row);persist();res.json({ok:true,id:row.id});});
app.put('/api/announcements/:id',auth,(req,res)=>{const row=store.announcements.find(x=>x.id==req.params.id);if(!row)return res.status(404).json({error:'Announcement not found'});const d=req.body;Object.assign(row,{title:d.title,body:d.body||'',date:d.date||'',status:d.status||'Published'});persist();res.json({ok:true});});
app.delete('/api/announcements/:id',auth,(req,res)=>{store.announcements=store.announcements.filter(x=>x.id!=req.params.id);persist();res.json({ok:true});});

app.get('/api/gallery',auth,(req,res)=>res.json([...store.gallery].sort((a,b)=>(a.sort_order-b.sort_order)||b.id-a.id)));
app.post('/api/gallery',auth,upload.single('image'),(req,res)=>{if(!req.file)return res.status(400).json({error:'Image is required.'});const row={id:nextId('gallery'),title:req.body.title||'',image:`/uploads/${req.file.filename}`,sort_order:Number(req.body.sort_order||0)};store.gallery.push(row);persist();res.json({ok:true,id:row.id});});
app.delete('/api/gallery/:id',auth,(req,res)=>{const i=store.gallery.findIndex(x=>x.id==req.params.id);if(i>=0){removeFile(store.gallery[i].image);store.gallery.splice(i,1);persist();}res.json({ok:true});});

app.post('/api/sms/bulk',auth,async(req,res)=>{const {message,studentIds,className}=req.body||{};if(!message)return res.status(400).json({error:'Message is required.'});if(!process.env.TWILIO_ACCOUNT_SID||!process.env.TWILIO_AUTH_TOKEN||!process.env.TWILIO_FROM_NUMBER)return res.status(503).json({error:'SMS is not configured. Add Twilio credentials to .env first.'});const twilio=require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);let rows;if(Array.isArray(studentIds)&&studentIds.length){rows=store.students.filter(s=>studentIds.map(String).includes(String(s.id))&&s.phone);}else if(className){rows=store.students.filter(s=>s.status==='Active'&&s.phone&&s.class_name===className);}else{rows=store.students.filter(s=>s.status==='Active'&&s.phone);}const results=[];for(const s of rows){try{const r=await twilio.messages.create({body:message,to:s.phone,from:process.env.TWILIO_FROM_NUMBER});results.push({id:s.id,ok:true,sid:r.sid});}catch(e){results.push({id:s.id,ok:false,error:e.message});}}res.json({ok:true,sent:results.filter(x=>x.ok).length,total:results.length,results});});

app.get('*',(req,res)=>res.sendFile(path.join(ROOT,'Public','index.html')));
app.listen(PORT,()=>console.log(`Al-Azan website running on http://localhost:${PORT}`));
