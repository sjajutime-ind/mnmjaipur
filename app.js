const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function toast(title, msg){
  const t = $("#toast");
  if(!t) return;
  t.innerHTML = `<b>${escapeHtml(title)}</b><small>${escapeHtml(msg)}</small>`;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 3200);
}

function initActiveNav(){
  const page = document.body.getAttribute("data-page");
  if(!page) return;
  $$("[data-nav]").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("data-nav")===page);
  });
}

function initDrawer(){
  const openBtn = $("#openDrawer");
  const drawer = $("#mobileDrawer");
  const closeBtn = $("#closeDrawer");
  if(!openBtn || !drawer) return;

  function open(){ drawer.classList.add("open"); }
  function close(){ drawer.classList.remove("open"); }

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  drawer.addEventListener("click", (e)=>{
    if(e.target === drawer) close();
  });
  $$(".drawerPanel a", drawer).forEach(a=>a.addEventListener("click", close));
}

function initHeroSlider(){
  const slider = $("#heroSlider");
  if(!slider) return;
  const slides = $$(".hSlide", slider);
  const dots = $$(".hDot", slider);
  if(slides.length===0) return;
  let idx = 0;
  function show(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach((s,k)=>s.classList.toggle("active", k===idx));
    dots.forEach((d,k)=>d.classList.toggle("active", k===idx));
  }
  dots.forEach((d,k)=>d.addEventListener("click", ()=>show(k)));
  show(0);
  setInterval(()=>show(idx+1), 4200);
}

function initDemoForms(){
  $$("form[data-demo]").forEach(form=>{
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      toast("Demo mode", "Form submitted (UI only). Connect this page with Laravel backend later.");
      form.reset();
    });
  });
}

function kmDistance(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
async function getMyLocation(){
  return new Promise((resolve, reject)=>{
    if(!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos)=>resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      (err)=>reject(err),
      {enableHighAccuracy:false, timeout: 6000, maximumAge: 60000}
    );
  });
}

/* Sponsored ads */
function renderSponsoredAds(container, category){
  if(!container) return;
  const ads = (window.MOCK_ADS || []).filter(a => !category || a.category===category).slice(0,2);
  if(ads.length === 0){
    container.innerHTML = `<div class="card"><div class="cardBd"><div class="help">Sponsored ads will appear here based on the search category.</div></div></div>`;
    return;
  }
  container.innerHTML = ads.map(a=>`
    <div class="card">
      <div class="cardHd">
        <div>
          <h3 style="margin:0">Sponsored: ${escapeHtml(a.title)}</h3>
          <small>${escapeHtml(a.category)}</small>
        </div>
        <span class="pill accent">AD</span>
      </div>
      <div class="cardBd">
        <div class="help">${escapeHtml(a.text)}</div>
        <div class="help" style="margin-top:10px"><b>Contact:</b> ${escapeHtml(a.phone)} • <b>Location:</b> ${escapeHtml(a.area)}</div>
      </div>
      <div class="cardFt">
        <a class="btn yellow" href="${escapeHtml(a.ctaHref)}">View</a>
      </div>
    </div>
  `).join("");
}

/* Business directory */
function renderBusinessResults(list, container){
  if(!container) return;
  if(!list || list.length===0){
    container.innerHTML = `<div class="card"><div class="cardBd"><b>No results found.</b><div class="help">Try changing filters (category / pincode / distance).</div></div></div>`;
    return;
  }
  container.innerHTML = list.map(b=>`
    <div class="card">
      <div class="cardHd">
        <div>
          <h3 style="margin:0">${escapeHtml(b.name)}</h3>
          <small>${escapeHtml(b.type)} • ${escapeHtml(b.area)} • ${escapeHtml(b.pincode)}</small>
        </div>
        <span class="pill">${escapeHtml(b.samaj ? "Maheshwari" : "Open")}</span>
      </div>
      <div class="cardBd">
        <div class="help"><b>Owner:</b> ${escapeHtml(b.owner)}</div>
        <div class="help"><b>Phone:</b> ${escapeHtml(b.phone)} • <b>WhatsApp:</b> ${escapeHtml(b.whatsapp)}</div>
        <div class="help"><b>Address:</b> ${escapeHtml(b.address)}</div>
        <div class="help"><b>Discount:</b> ${escapeHtml(b.discount || "—")}</div>
        <div class="help" style="margin-top:8px"><b>Tags:</b> ${(b.tags||[]).map(t=>`<span class="pill" style="margin-right:6px">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="help" style="margin-top:6px"><b>Distance:</b> ${b.distanceKm!=null ? `${b.distanceKm.toFixed(1)} km` : "Enable “Near me”"}</div>
        <hr class="sep">
        <details>
          <summary class="btn">Contact / Chat Form</summary>
          <div style="padding:12px 0 0" class="form">
            <div class="field"><label>Your Name</label><input placeholder="Enter your name"></div>
            <div class="field"><label>Your Mobile</label><input placeholder="Enter mobile number"></div>
            <div class="field"><label>Message</label><textarea placeholder="Write your requirement..."></textarea></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button class="btn primary" type="button" onclick="toast('Message sent (demo)','Connect this with backend to deliver chat/email.')">Send Message</button>
              <a class="btn" href="tel:${escapeHtml(b.phone)}">Call</a>
              <a class="btn" href="https://wa.me/${escapeHtml(String(b.whatsapp).replace(/\D/g,''))}" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </details>
      </div>
    </div>
  `).join("");
}

async function initBusinessSearch(){
  if(document.body.getAttribute("data-page") !== "business-search") return;
  const form = $("#businessSearchForm");
  const resultsEl = $("#businessResults");
  const adsEl = $("#sponsoredAds");
  const nearToggle = $("#nearMe");
  const distSel = $("#distanceKm");
  const types = [...new Set((window.MOCK_BUSINESSES||[]).map(x=>x.type))].sort();
  const typeSel = $("#businessType");
  if(typeSel){
    typeSel.innerHTML = `<option value="">All types</option>` + types.map(t=>`<option>${escapeHtml(t)}</option>`).join("");
  }

  let myLoc = null;

  async function updateMyLoc(){
    if(!nearToggle?.checked){ myLoc = null; return; }
    try{
      myLoc = await getMyLocation();
      toast("Location enabled", "Showing results within selected distance.");
    }catch(e){
      myLoc = null;
      nearToggle.checked = false;
      toast("Location blocked", "Allow location permission to use “Near me” filter.");
    }
  }

  async function run(){
    const q = ($("#q")?.value||"").toLowerCase().trim();
    const type = ($("#businessType")?.value||"").trim();
    const pincode = ($("#pincode")?.value||"").trim();
    const tag = ($("#tag")?.value||"").toLowerCase().trim();
    const distance = Number(distSel?.value || 10);

    await updateMyLoc();

    let list = (window.MOCK_BUSINESSES||[]).map(x=>({...x}));
    if(q) list = list.filter(b => [b.name,b.owner,b.address,b.area].some(v=>String(v).toLowerCase().includes(q)));
    if(type) list = list.filter(b => b.type === type);
    if(pincode) list = list.filter(b => String(b.pincode) === String(pincode));
    if(tag) list = list.filter(b => (b.tags||[]).some(t=>String(t).toLowerCase().includes(tag)));

    if(myLoc){
      list = list.map(b=>({ ...b, distanceKm: kmDistance(myLoc.lat, myLoc.lng, b.lat, b.lng) }))
                 .filter(b=>b.distanceKm <= distance)
                 .sort((a,b)=>a.distanceKm-b.distanceKm);
    }

    renderSponsoredAds(adsEl, type || "");
    renderBusinessResults(list, resultsEl);
  }

  form?.addEventListener("submit", (e)=>{ e.preventDefault(); run(); });
  $("#btnReset")?.addEventListener("click", ()=>{ form.reset(); myLoc=null; run(); });
  nearToggle?.addEventListener("change", ()=>run());
  run();
}

/* Jobs */
function renderJobResults(list, container){
  if(!container) return;
  if(!list || list.length===0){
    container.innerHTML = `<div class="card"><div class="cardBd"><b>No jobs found.</b><div class="help">Try changing filters (type / location / keyword).</div></div></div>`;
    return;
  }
  container.innerHTML = list.map(j=>`
    <div class="card">
      <div class="cardHd">
        <div>
          <h3 style="margin:0">${escapeHtml(j.title)}</h3>
          <small>${escapeHtml(j.company)} • ${escapeHtml(j.location)} • ${escapeHtml(j.pincode)}</small>
        </div>
        <span class="pill">${escapeHtml(j.jobType)}</span>
      </div>
      <div class="cardBd">
        <div class="help"><b>Experience:</b> ${escapeHtml(j.experience)} • <b>Salary:</b> ${escapeHtml(j.salary)}</div>
        <div class="help" style="margin-top:8px">${escapeHtml(j.desc)}</div>
        <div class="help" style="margin-top:10px"><b>Skills:</b> ${(j.skills||[]).map(s=>`<span class="pill" style="margin-right:6px">${escapeHtml(s)}</span>`).join("")}</div>
        <hr class="sep">
        <details>
          <summary class="btn">Apply (Demo)</summary>
          <div style="padding:12px 0 0" class="form">
            <div class="field"><label>Your Name</label><input placeholder="Enter your name"></div>
            <div class="field"><label>Mobile</label><input placeholder="Enter mobile number"></div>
            <div class="field"><label>Email</label><input placeholder="Enter email"></div>
            <div class="field"><label>Message</label><textarea placeholder="Write a short message..."></textarea></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button class="btn primary" type="button" onclick="toast('Applied (demo)','Connect backend to store application and notify employer.')">Submit Application</button>
              <a class="btn" href="tel:${escapeHtml(j.phone)}">Call HR</a>
              <a class="btn" href="https://wa.me/${escapeHtml(String(j.whatsapp).replace(/\D/g,''))}" target="_blank" rel="noreferrer">WhatsApp HR</a>
            </div>
          </div>
        </details>
      </div>
    </div>
  `).join("");
}
function initJobSearch(){
  if(document.body.getAttribute("data-page") !== "jobs-search") return;
  const sel = $("#jobType");
  const types = [...new Set((window.MOCK_JOBS||[]).map(x=>x.jobType))].sort();
  if(sel) sel.innerHTML = `<option value="">All</option>` + types.map(t=>`<option>${escapeHtml(t)}</option>`).join("");
  const form = $("#jobSearchForm");
  const results = $("#jobResults");

  function run(){
    const q = ($("#q")?.value||"").toLowerCase().trim();
    const type = ($("#jobType")?.value||"").trim();
    const pincode = ($("#pincode")?.value||"").trim();
    const skill = ($("#skill")?.value||"").toLowerCase().trim();
    let list = (window.MOCK_JOBS||[]).map(x=>({...x}));
    if(q) list = list.filter(j => [j.title,j.company,j.location,j.desc].some(v=>String(v).toLowerCase().includes(q)));
    if(type) list = list.filter(j => j.jobType === type);
    if(pincode) list = list.filter(j => String(j.pincode) === String(pincode));
    if(skill) list = list.filter(j => (j.skills||[]).some(s=>String(s).toLowerCase().includes(skill)));
    renderJobResults(list, results);
  }

  form?.addEventListener("submit", (e)=>{ e.preventDefault(); run(); });
  $("#btnReset")?.addEventListener("click", ()=>{ form.reset(); run(); });
  run();
}

/* Resumes */
function renderResumeResults(list, container){
  if(!container) return;
  if(!list || list.length===0){
    container.innerHTML = `<div class="card"><div class="cardBd"><b>No resumes found.</b><div class="help">Try changing filters.</div></div></div>`;
    return;
  }
  container.innerHTML = list.map(r=>`
    <div class="card">
      <div class="cardHd">
        <div>
          <h3 style="margin:0">${escapeHtml(r.name)}</h3>
          <small>${escapeHtml(r.role)} • ${escapeHtml(r.location)} • ${escapeHtml(r.pincode)}</small>
        </div>
        <span class="pill">${escapeHtml(r.experience)}</span>
      </div>
      <div class="cardBd">
        <div class="help"><b>Education:</b> ${escapeHtml(r.education)} • <b>Expected:</b> ${escapeHtml(r.expected)}</div>
        <div class="help" style="margin-top:10px"><b>Skills:</b> ${(r.skills||[]).map(s=>`<span class="pill" style="margin-right:6px">${escapeHtml(s)}</span>`).join("")}</div>
        <div class="help" style="margin-top:6px"><b>Availability:</b> ${escapeHtml(r.availability)}</div>
        <hr class="sep">
        <details>
          <summary class="btn">Contact Candidate</summary>
          <div style="padding:12px 0 0" class="form">
            <div class="field"><label>Your Company</label><input placeholder="Company name"></div>
            <div class="field"><label>Message</label><textarea placeholder="Write details of job offer..."></textarea></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button class="btn primary" type="button" onclick="toast('Message sent (demo)','Connect backend to send SMS/email or internal chat.')">Send</button>
              <a class="btn" href="tel:${escapeHtml(r.phone)}">Call</a>
              <a class="btn" href="https://wa.me/${escapeHtml(String(r.whatsapp).replace(/\D/g,''))}" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </details>
      </div>
    </div>
  `).join("");
}
function initResumeSearch(){
  if(document.body.getAttribute("data-page") !== "resume-search") return;
  const form = $("#resumeSearchForm");
  const results = $("#resumeResults");

  function run(){
    const q = ($("#q")?.value||"").toLowerCase().trim();
    const pincode = ($("#pincode")?.value||"").trim();
    const skill = ($("#skill")?.value||"").toLowerCase().trim();
    const exp = ($("#exp")?.value||"").trim();
    let list = (window.MOCK_RESUMES||[]).map(x=>({...x}));
    if(q) list = list.filter(r => [r.name,r.role,r.location,r.education].some(v=>String(v).toLowerCase().includes(q)));
    if(pincode) list = list.filter(r => String(r.pincode) === String(pincode));
    if(skill) list = list.filter(r => (r.skills||[]).some(s=>String(s).toLowerCase().includes(skill)));
    if(exp) list = list.filter(r => r.experience === exp);
    renderResumeResults(list, results);
  }

  form?.addEventListener("submit", (e)=>{ e.preventDefault(); run(); });
  $("#btnReset")?.addEventListener("click", ()=>{ form.reset(); run(); });
  run();
}

document.addEventListener("DOMContentLoaded", ()=>{
  initActiveNav();
  initDrawer();
  initHeroSlider();
  initDemoForms();
  initBusinessSearch();
  initJobSearch();
  initResumeSearch();
});