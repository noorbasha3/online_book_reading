const catalog = [
  {id:"alice",title:"Alice's Adventures in Wonderland",author:"Lewis Carroll",category:"Fantasy",year:1865,description:"Follow Alice down the rabbit hole into a wonderfully strange world.",color:"#6b8c79",ink:"#fff4d6",label:"A CURIOUS\nADVENTURE",url:"https://www.gutenberg.org/ebooks/11"},
  {id:"pride",title:"Pride and Prejudice",author:"Jane Austen",category:"Novel",year:1813,description:"A sparkling classic of manners, first impressions, and romance.",color:"#a75f67",ink:"#fff0df",label:"PRIDE &\nPREJUDICE",url:"https://www.gutenberg.org/ebooks/1342"},
  {id:"sherlock",title:"The Adventures of Sherlock Holmes",author:"Arthur Conan Doyle",category:"Adventure",year:1892,description:"Fourteen enduring mysteries featuring the famous consulting detective.",color:"#344f68",ink:"#f2dfb5",label:"SHERLOCK\nHOLMES",url:"https://www.gutenberg.org/ebooks/1661"},
  {id:"frankenstein",title:"Frankenstein",author:"Mary Wollstonecraft Shelley",category:"Fantasy",year:1818,description:"A gothic landmark exploring ambition, creation, and responsibility.",color:"#414b43",ink:"#e8dfc8",label:"FRANKENSTEIN",url:"https://www.gutenberg.org/ebooks/84"},
  {id:"moby",title:"Moby-Dick",author:"Herman Melville",category:"Adventure",year:1851,description:"A sweeping sea adventure and the obsessive pursuit of a white whale.",color:"#345b68",ink:"#f3e4c4",label:"MOBY-DICK",url:"https://www.gutenberg.org/ebooks/2701"},
  {id:"siddhartha",title:"Siddhartha",author:"Hermann Hesse",category:"Philosophy",year:1922,description:"A reflective journey through spiritual searching and self-discovery.",color:"#b47d4c",ink:"#fff0d6",label:"SIDDHARTHA",url:"https://www.gutenberg.org/ebooks/2500"},
  {id:"dorian",title:"The Picture of Dorian Gray",author:"Oscar Wilde",category:"Novel",year:1890,description:"A gothic novel about beauty, vanity, and the price of a hidden life.",color:"#486b50",ink:"#f4e6c4",label:"DORIAN GRAY",url:"https://www.gutenberg.org/ebooks/174"},
  {id:"littlewomen",title:"Little Women",author:"Louisa May Alcott",category:"Novel",year:1868,description:"The beloved story of the March sisters growing up, together and apart.",color:"#a76b55",ink:"#fff0dc",label:"LITTLE WOMEN",url:"https://www.gutenberg.org/ebooks/514"}
];
const state = {filter:"All",query:"",uploads:[]};
const $ = selector => document.querySelector(selector);
const bookGrid = $("#bookGrid");
const readerDialog = $("#readerDialog");
let objectUrls = [];

function esc(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCatalog(){
  const q=state.query.trim().toLowerCase();
  const visible=catalog.filter(b=>(state.filter==="All"||b.category===state.filter)&&(!q||`${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q)));
  $("#bookCount").textContent=`${visible.length} ${visible.length===1?"book":"books"}`;
  bookGrid.innerHTML=visible.length?visible.map(b=>`<article class="book-card">
    <div class="cover-art" style="background:linear-gradient(145deg,${b.color},${b.color}dd)">
      <div class="cover-label" style="background:${b.color};color:${b.ink}"><small>OPEN SHELF CLASSICS</small><strong>${esc(b.label).replace(/\n/g,"<br>")}</strong><em>${b.year}</em><small>${esc(b.author.toUpperCase())}</small></div>
    </div>
    <h3>${esc(b.title)}</h3><p class="book-author">${esc(b.author)} · ${b.year}</p><p class="book-description">${esc(b.description)}</p>
    <div class="book-actions"><a class="read-button" href="${b.url}" target="_blank" rel="noopener noreferrer">Read free ↗</a><a class="source-button" href="${b.url}" target="_blank" rel="noopener noreferrer" aria-label="Open source for ${esc(b.title)}">Source</a></div>
  </article>`).join(""):`<div class="empty-results"><h3>No books found</h3><p>Try another title or category.</p></div>`;
  document.querySelectorAll(".filter").forEach(button=>button.classList.toggle("active",button.dataset.filter===state.filter));
}
function persistUploads(){
  // File bytes are stored locally in IndexedDB; only metadata is kept in memory.
  renderUploads();
}
function openReader(title,content,meta="Your uploaded book"){
  $("#readerTitle").textContent=title;
  $("#readerMeta").textContent=meta;
  $("#readerContent").innerHTML=content;
  readerDialog.showModal();
}
function formatText(text){
  return text.split(/\n\s*\n/).map(block=>`<p>${esc(block).replace(/\n/g,"<br>")}</p>`).join("");
}
function renderUploads(){
  const list=$("#uploadList");
  if(!state.uploads.length){list.innerHTML='<div class="empty-shelf">Your shelf is waiting for its first book.</div>';return;}
  list.innerHTML=state.uploads.map((item,index)=>`<article class="uploaded-item">
    <div class="uploaded-icon">${esc(item.ext.toUpperCase())}</div>
    <div class="uploaded-info"><strong>${esc(item.name)}</strong><small>${formatBytes(item.size)} · Stored in this browser</small></div>
    <div class="uploaded-actions"><button data-open-upload="${index}">Read</button><button class="delete-upload" data-delete-upload="${index}">Remove</button></div>
  </article>`).join("");
}
function formatBytes(bytes){if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/(1024*1024)).toFixed(1)} MB`;}
function showStatus(message,isError=false){const el=$("#uploadStatus");el.textContent=message;el.style.color=isError?"#a34f40":"var(--green)";}
function saveUploadToDB(file,record){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("OpenShelfLibrary",1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("files"))request.result.createObjectStore("files",{keyPath:"id"});};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result;const tx=db.transaction("files","readwrite");
      tx.objectStore("files").put({...record,blob:file});
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};
    };
  });
}
function getUploadFromDB(id){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("OpenShelfLibrary",1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("files"))request.result.createObjectStore("files",{keyPath:"id"});};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{const db=request.result;const tx=db.transaction("files","readonly");const req=tx.objectStore("files").get(id);req.onsuccess=()=>{resolve(req.result||null);db.close();};req.onerror=()=>{reject(req.error);db.close();};};
  });
}
function getAllUploads(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("OpenShelfLibrary",1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("files"))request.result.createObjectStore("files",{keyPath:"id"});};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{const db=request.result;const tx=db.transaction("files","readonly");const req=tx.objectStore("files").getAll();req.onsuccess=()=>{resolve(req.result||[]);db.close();};req.onerror=()=>{reject(req.error);db.close();};};
  });
}
function deleteUploadFromDB(id){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("OpenShelfLibrary",1);
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{const db=request.result;const tx=db.transaction("files","readwrite");tx.objectStore("files").delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};};
  });
}
async function loadUploads(){
  try{
    const saved=await getAllUploads();
    state.uploads=saved.map(({blob,...metadata})=>metadata).sort((a,b)=>b.added-a.added);
    renderUploads();
  }catch{showStatus("Local file storage is unavailable in this browser. Try another browser.",true);}
}
async function handleFiles(files){
  if(!files.length)return;
  const accepted=[];
  for(const file of files){
    const ext=file.name.split(".").pop().toLowerCase();
    if(!["pdf","epub","txt","text"].includes(ext)){showStatus(`${file.name}: unsupported format. Choose PDF, EPUB, or TXT.`,true);continue;}
    if(file.size>30*1024*1024){showStatus(`${file.name}: files must be 30 MB or smaller.`,true);continue;}
    accepted.push({file,ext});
  }
  if(!accepted.length)return;
  showStatus("Saving your books to this browser…");
  try{
    for(const {file,ext} of accepted){
      const record={id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`,name:file.name,ext,size:file.size,type:file.type||"",added:Date.now()};
      await saveUploadToDB(file,record);
    }
    await loadUploads();
    showStatus(`${accepted.length} book${accepted.length===1?"":"s"} added to your private shelf.`);
    $("#fileInput").value="";
  }catch(error){showStatus("Could not save file. Browser storage may be full or unavailable.",true);}
}
async function readUploaded(index){
  const item=state.uploads[index];if(!item)return;
  try{
    const stored=await getUploadFromDB(item.id);if(!stored){showStatus("That file could not be found in browser storage.",true);return;}
    const file=stored.blob;
    if(item.ext==="txt"||item.ext==="text"){
      const text=await file.text();
      openReader(item.name,formatText(text),`Plain text · ${formatBytes(item.size)}`);
    }else if(item.ext==="pdf"){
      const url=URL.createObjectURL(file);objectUrls.push(url);
      openReader(item.name,`<iframe title="${esc(item.name)}" src="${url}" style="width:100%;height:65vh;border:0"></iframe>`,"PDF · displayed using your browser's PDF viewer");
    }else if(item.ext==="epub"){
      const url=URL.createObjectURL(file);objectUrls.push(url);
      openReader(item.name,`<div class="epub-fallback"><h3>EPUB reader</h3><p>Your EPUB file is saved safely in this browser. This lightweight version does not include an EPUB rendering engine.</p><p>You can open the file with a free EPUB reader app, or extend this site with a trusted EPUB library such as epub.js.</p><a class="button primary" href="${url}" download="${esc(item.name)}">Download your EPUB</a></div>`,"EPUB · saved locally");
    }
  }catch{showStatus("Unable to open this file in the browser.",true);}
}
$("#filters").addEventListener("click",event=>{const button=event.target.closest("[data-filter]");if(!button)return;state.filter=button.dataset.filter;renderCatalog();});
$("#searchInput").addEventListener("input",event=>{state.query=event.target.value;renderCatalog();});
$("#fileInput").addEventListener("change",event=>handleFiles([...event.target.files]));
$("#uploadTop").addEventListener("click",()=>$("#mybooks").scrollIntoView({behavior:"smooth"}));
$("#heroUpload").addEventListener("click",()=>$("#mybooks").scrollIntoView({behavior:"smooth"}));
$("#uploadList").addEventListener("click",async event=>{
  const open=event.target.closest("[data-open-upload]");
  const remove=event.target.closest("[data-delete-upload]");
  if(open)await readUploaded(Number(open.dataset.openUpload));
  if(remove){const item=state.uploads[Number(remove.dataset.deleteUpload)];if(!item)return;try{await deleteUploadFromDB(item.id);await loadUploads();showStatus("Book removed from your shelf.");}catch{showStatus("Could not remove this file.",true);}}
});
$("#clearUploads").addEventListener("click",()=>{if(state.uploads.length)$("#confirmDialog").showModal();else showStatus("Your shelf is already empty.");});
$("#cancelClear").addEventListener("click",()=>$("#confirmDialog").close());
$("#confirmClear").addEventListener("click",async()=>{
  try{
    const saved=await getAllUploads();
    await Promise.all(saved.map(item=>deleteUploadFromDB(item.id)));
    state.uploads=[];renderUploads();$("#confirmDialog").close();showStatus("Your uploaded shelf has been cleared.");
  }catch{showStatus("Could not clear local files.",true);}
});
$("#closeReader").addEventListener("click",()=>readerDialog.close());
$("#readerCloseBottom").addEventListener("click",()=>readerDialog.close());
readerDialog.addEventListener("close",()=>{$("#readerContent").innerHTML="";objectUrls.forEach(url=>URL.revokeObjectURL(url));objectUrls=[];});
$("#menuToggle").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#nav").querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>$("#nav").classList.remove("open")));

renderCatalog();
loadUploads();
