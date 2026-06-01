import { useState, useEffect, useCallback } from "react";

const GR = "linear-gradient(135deg, #111318 0%, #16C74E 100%)";
const GR2 = "linear-gradient(135deg, #0a0c0f 0%, #0d2018 60%, #16C74E 100%)";
const GRT = { background:GR, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };
const C = {
  bg:"#F0F2F5", card:"#FFFFFF", border:"#E2E6EE", accent:"#16C74E",
  aLight:"#E8FBF0", aSoft:"#B8F5CE", text:"#0D0F14", tSoft:"#2A2D38",
  muted:"#6B7280", dim:"#9CA3AF", dark:"#0C0D10", dCard:"#1A1D24",
  dBorder:"#252830", coral:"#E53935",
  ind:{
    Tech:{bg:"#EEF2FF",color:"#3730A3"}, Finance:{bg:"#E8FBF0",color:"#14532D"},
    Fashion:{bg:"#FDF2F8",color:"#9D174D"}, Food:{bg:"#FFF7ED",color:"#C2410C"},
    Health:{bg:"#F0FDFA",color:"#0F766E"}, Other:{bg:"#F3F4F6",color:"#6B7280"},
    Networking:{bg:"#FFF7ED",color:"#C2410C"}, Growth:{bg:"#F0FDFA",color:"#0F766E"},
  }
};
const fmt=n=>Number(n||0).toLocaleString();

const css = `
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
input,textarea,select{outline:none;font-family:inherit;}button{font-family:inherit;cursor:pointer;}::placeholder{color:${C.dim};}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(22,199,78,0.3);}50%{box-shadow:0 0 50px rgba(22,199,78,0.7);}}
@keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);}}
@keyframes heartbeat{0%,100%{transform:scale(1);}25%{transform:scale(1.4);}50%{transform:scale(1.1);}75%{transform:scale(1.3);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
.fu{animation:fadeUp 0.45s ease forwards;}
.glow{animation:glow 2s ease-in-out infinite;}
.ticker{animation:ticker 32s linear infinite;}
.ch{transition:all 0.22s ease;}.ch:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(22,199,78,0.12);border-color:rgba(22,199,78,0.3)!important;}
.bs{transition:all 0.15s ease;}.bs:hover{transform:translateY(-2px);filter:brightness(1.08);}.bs:active{transform:scale(0.96);}
.nl:hover{color:#16C74E!important;}
.if:focus{border-color:#16C74E!important;box-shadow:0 0 0 3px rgba(22,199,78,0.18)!important;}
input[type="search"]::-webkit-search-decoration,input[type="search"]::-webkit-search-cancel-button,input[type="search"]::-webkit-search-results-button,input[type="search"]::-webkit-search-results-decoration{display:none;}
.desktop-app-search{background-image:none!important;}
.uh:hover{background:rgba(22,199,78,0.06);border-radius:10px;}
.mobile-bottom-nav{display:none;}
@media(max-width:980px){
  [style*="grid-template-columns: 270px minmax(0,1fr) 310px"]{grid-template-columns:1fr!important;}
  [style*="position: sticky"]{position:static!important;}
}
@media(max-width:760px){
  body{background:${C.bg};}
  .ch:hover{transform:none;box-shadow:none;}
  .desktop-app-tabs,.desktop-app-search,.desktop-signout,.desktop-feed-side{display:none!important;}
  .mobile-bottom-nav{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:12px;right:12px;bottom:12px;z-index:500;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);border:1px solid ${C.border};border-radius:18px;padding:8px;box-shadow:0 18px 60px rgba(13,15,20,.18);}
  .mobile-bottom-nav button{min-width:0;border:none;background:transparent;border-radius:12px;padding:8px 4px;color:${C.muted};font-size:10px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:4px;}
  .mobile-bottom-nav button.active{background:${C.aLight};color:${C.accent};}
  .mobile-bottom-nav span{font-size:17px;line-height:1;}
  .app-topbar{min-height:62px!important;padding:8px 14px!important;gap:10px!important;flex-wrap:nowrap!important;}
  .app-topbar-logo{font-size:20px!important;flex:1;}
  .app-shell{padding:14px 12px 96px!important;}
  .feed-grid{display:block!important;}
  .mobile-profile-summary{display:block!important;}
  .composer-card{border-radius:18px!important;padding:14px!important;}
  .composer-card textarea{min-height:92px!important;font-size:16px!important;}
  .composer-actions{overflow-x:auto;padding-bottom:2px;}
  .composer-actions button{flex-shrink:0;}
  .post-card{border-radius:18px!important;margin-bottom:12px!important;}
  .post-card>div:first-child{padding:16px!important;}
  .post-actions{padding:10px 14px!important;gap:10px!important;}
  .post-actions button{font-size:13px!important;}
  .directory-grid{grid-template-columns:1fr!important;}
  .directory-wrap{padding-bottom:86px!important;}
  .directory-title{font-size:32px!important;}
  .messages-grid{grid-template-columns:1fr!important;min-height:auto!important;}
  .message-list{display:flex!important;overflow-x:auto!important;gap:10px!important;padding:10px!important;}
  .message-list button{min-width:220px!important;}
  .message-panel{min-height:55vh!important;}
  .message-bubble{max-width:86%!important;}
  .profile-hero{padding:22px!important;border-radius:20px!important;}
  .profile-hero-row{align-items:flex-start!important;flex-wrap:wrap!important;}
  .profile-hero h1{font-size:30px!important;}
  .profile-stats{grid-template-columns:repeat(2,1fr)!important;}
  .edit-modal{align-items:flex-end!important;padding:0!important;}
  .edit-sheet{width:100%!important;border-radius:22px 22px 0 0!important;max-height:88vh!important;overflow:auto!important;}
  .landing-nav{height:auto!important;padding:14px 18px!important;}
  .landing-nav-links{display:none!important;}
  .landing-hero{min-height:92vh!important;padding:104px 18px 58px!important;justify-content:flex-start!important;}
  .landing-hero h1{font-size:46px!important;line-height:1.08!important;}
  .landing-hero p{font-size:16px!important;margin-bottom:32px!important;}
  .landing-email{flex-direction:column!important;gap:8px!important;border-radius:30px!important;padding:8px!important;}
  .landing-email input,.landing-email button{width:100%!important;}
  .landing-email input{padding:13px 16px!important;}
  .landing-email button{padding:14px 18px!important;}
  .landing-section{padding:64px 18px!important;}
  .landing-section h2{font-size:40px!important;line-height:1.08!important;}
  .landing-feature-grid,.landing-testimonial-grid,.pricing-grid{grid-template-columns:1fr!important;}
  .landing-stats{grid-template-columns:repeat(2,1fr)!important;}
  .signup-root{display:block!important;background:${C.dark}!important;min-height:100vh!important;}
  .signup-copy{display:none!important;}
  .signup-form-panel{width:100%!important;min-height:100vh!important;padding:82px 22px 32px!important;}
  .toast-stack{left:12px!important;right:12px!important;top:12px!important;}
  .toast-stack>div{min-width:0!important;width:100%!important;}
  [style*="grid-template-columns: 310px 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(5,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
  input[placeholder="Search founders, posts, tags"]{width:100%!important;max-width:none!important;}
}
`;

const Tag=({label,style={}})=><span style={{fontSize:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",borderRadius:4,padding:"2px 8px",whiteSpace:"nowrap",...style}}>{label}</span>;
const IT=({label})=>{const s=C.ind[label]||C.ind.Other;return <Tag label={label} style={{background:s.bg,color:s.color}}/>;};
const Av=({i,size=40,grad=false,online=false,style={}})=>(
  <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:grad?GR:C.aLight,border:grad?"none":`1.5px solid ${C.aSoft}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.3,color:grad?"#fff":C.accent,...style}}>{i}</div>
    {online&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.27,height:size*0.27,borderRadius:"50%",background:C.accent,border:"2px solid #fff"}}/>}
  </div>
);
const GBtn=({children,onClick,sm=false,lg=false,full=false,style={}})=>(
  <button onClick={onClick} className="bs" style={{background:GR,color:"#fff",border:"none",borderRadius:9,fontWeight:700,padding:lg?"15px 40px":sm?"7px 16px":"11px 24px",fontSize:lg?17:sm?12:14,cursor:"pointer",letterSpacing:0.2,boxShadow:"0 4px 20px rgba(22,199,78,0.3)",whiteSpace:"nowrap",width:full?"100%":"auto",...style}}>{children}</button>
);
const GhostBtn=({children,onClick,style={}})=>(
  <button onClick={onClick} className="bs" style={{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`,borderRadius:9,fontWeight:700,padding:"10px 22px",fontSize:14,cursor:"pointer",...style}}>{children}</button>
);

function useToast(){
  const [toasts,setToasts]=useState([]);
  const notify=useCallback((msg,type="success")=>{const id=Date.now()+Math.random();setToasts(ts=>[...ts,{id,msg,type}]);setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),3500);},[]);
  const remove=useCallback(id=>setToasts(ts=>ts.filter(t=>t.id!==id)),[]);
  return{toasts,notify,remove};
}

function useLocalState(key, fallback){
  const [value,setValue]=useState(()=>{
    try{
      const saved=localStorage.getItem(key);
      return saved?JSON.parse(saved):fallback;
    }catch{
      return fallback;
    }
  });
  useEffect(()=>{
    try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  },[key,value]);
  return [value,setValue];
}

function getSessionToken(){
  try{
    let token=localStorage.getItem("fear-session-token");
    if(!token){
      token=crypto.randomUUID();
      localStorage.setItem("fear-session-token",token);
    }
    return token;
  }catch{
    return "browser-session";
  }
}

function hasSessionToken(){
  try{return Boolean(localStorage.getItem("fear-session-token"));}catch{return false;}
}

function clearSessionToken(){
  try{
    localStorage.removeItem("fear-session-token");
    localStorage.removeItem("fear-screen");
  }catch{}
}

function consumeOAuthToken(){
  try{
    const hash=window.location.hash||"";
    const token=new URLSearchParams(hash.includes("?")?hash.split("?")[1]:"").get("token");
    if(token){
      localStorage.setItem("fear-session-token",token);
      window.history.replaceState(null,"","#app");
      return true;
    }
  }catch{}
  return false;
}

try{
  const version="real-users-v1";
  if(localStorage.getItem("fear-data-version")!==version){
    ["fear-posts","fear-people","fear-events","fear-mentors","fear-messages","fear-stats"].forEach(key=>localStorage.removeItem(key));
    localStorage.setItem("fear-data-version",version);
  }
}catch{}

async function api(path,options={}){
  const headers={"content-type":"application/json","x-fear-token":getSessionToken(),...(options.headers||{})};
  const res=await fetch(`/api${path}`,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(data.token){
    try{localStorage.setItem("fear-session-token",data.token);}catch{}
  }
  if(!res.ok) throw new Error(data.error||"Request failed");
  return data;
}

const ToastCtx=({toasts,remove})=>(
  <div className="toast-stack" style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
    {toasts.map(t=>(
      <div key={t.id} onClick={()=>remove(t.id)} style={{background:t.type==="success"?C.accent:t.type==="error"?"#EF4444":"#3B82F6",color:"#fff",borderRadius:12,padding:"13px 18px",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",animation:"popIn 0.25s ease",minWidth:240}}>
        <span style={{fontSize:18}}>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}</span>{t.msg}
      </div>
    ))}
  </div>
);

const REAL_STATS={profiles:0,waitlist:0,posts:0,comments:0,likes:0,saves:0,connections:0,rsvps:0,mentorRequests:0,messages:0,events:0,mentors:0};
const cleanUsername=value=>String(value||"").toLowerCase().replace(/^@+/,"").replace(/[^a-z0-9._]+/g,"_").replace(/[._]{2,}/g,"_").replace(/^[._]+|[._]+$/g,"").slice(0,30);
const scrollToSection=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});

const POSTS=[];
const PEOPLE=[];
const MENTORS=[];
const EVENTS=[];
const DEALS=[];
const GROUPS=[];
const INITIAL_MESSAGES=[];

function Navbar({setScreen,notify}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  const links=[["Features","platform"],["Network","activity"],["Community","cta"],["Pricing","pricing"]];
  return(
    <div className="landing-nav" style={{position:"fixed",top:18,left:0,right:0,zIndex:100,padding:"0 32px",display:"flex",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{width:"min(1120px,100%)",height:58,borderRadius:999,background:scrolled?"rgba(255,255,255,0.94)":"rgba(255,255,255,0.86)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.22)",boxShadow:"0 24px 70px rgba(0,0,0,0.22)",display:"flex",alignItems:"center",padding:"0 10px 0 22px",transition:"all 0.3s",pointerEvents:"auto"}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:21,color:"#050506",letterSpacing:0,flex:1}}>fear<span style={{color:C.accent}}>.</span>social</div>
      <div className="landing-nav-links" style={{display:"flex",gap:2,marginRight:14}}>
        {links.map(([label,id])=>(
          <button key={label} onClick={()=>scrollToSection(id)} className="nl bs" style={{background:"none",border:"none",color:"#555B66",fontSize:13,fontWeight:700,padding:"9px 13px",cursor:"pointer",borderRadius:999}}>{label}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setScreen(hasSessionToken()?"app":"login")} className="bs" style={{background:"#fff",border:"1px solid #E4E7EC",borderRadius:999,padding:"9px 17px",color:"#111318",fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Log in</button>
        <button onClick={()=>setScreen("signup")} className="bs" style={{background:"#111318",border:"1px solid #111318",borderRadius:999,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:900,whiteSpace:"nowrap"}}>Join free</button>
      </div>
      </div>
    </div>
  );
}

function LandingPage({setScreen,notify}){
  const [email,setEmail]=useState("");
  const [joined,setJoined]=useState(false);
  const [stats,setStats]=useState(REAL_STATS);
  useEffect(()=>{
    let active=true;
    fetch("/api/stats").then(res=>res.json()).then(data=>{if(active)setStats(data.stats||REAL_STATS);}).catch(()=>{});
    return()=>{active=false;};
  },[]);
  const joinWaitlist=async()=>{
    if(!email)return notify("Enter your email first","error");
    try{
      await api("/waitlist",{method:"POST",body:JSON.stringify({email})});
      setJoined(true);
    }catch(err){
      notify(err.message||"Could not save email","error");
    }
  };
  const ticker=[`${fmt(stats.profiles)} verified profiles · `,`${fmt(stats.waitlist)} waitlist emails · `,`${fmt(stats.posts)} member posts · `,`${fmt(stats.comments)} comments · `,`${fmt(stats.connections)} connections · `,`${fmt(stats.rsvps)} event RSVPs · `];
  const statRows=[["Profiles",stats.profiles],["Waitlist Emails",stats.waitlist],["Posts",stats.posts],["Comments",stats.comments],["Connections",stats.connections]];
  return(
    <div style={{background:"#050506",minHeight:"100vh",overflowX:"hidden"}}>
      <div className="landing-hero" style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"148px 32px 96px",textAlign:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"0 0 auto 0",height:"62vh",background:"radial-gradient(circle at 50% 0%, rgba(22,199,78,0.16), transparent 48%)",pointerEvents:"none"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:999,padding:"8px 16px",marginBottom:32,cursor:"pointer",position:"relative"}} className="bs fu" onClick={()=>setScreen("signup")}>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:13,fontWeight:800,color:"#F7F8FA"}}>Multiplayer for founders</span>
        </div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(52px,7vw,104px)",fontWeight:800,color:"#fff",lineHeight:0.96,letterSpacing:0,marginBottom:28,maxWidth:1080,position:"relative"}} className="fu">
          One network for<br/><span style={{color:C.accent}}>tomorrow's founders.</span>
        </h1>
        <p style={{fontSize:19,color:"rgba(255,255,255,0.62)",lineHeight:1.75,maxWidth:650,marginBottom:38,position:"relative"}} className="fu">
          Meet serious builders, post progress, find collaborators, and keep your founder network moving in one focused social platform.
        </p>
        {joined?(
          <div style={{display:"flex",alignItems:"center",gap:16,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"20px 28px",animation:"popIn 0.3s ease",position:"relative"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:19}}>You're on the list.</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginTop:3}}>Check your inbox — we'll be in touch soon.</div>
            </div>
            <button onClick={()=>setScreen("signup")} className="bs" style={{marginLeft:8,background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"10px 16px",fontSize:13,fontWeight:900}}>Enter app</button>
          </div>
        ):(
          <div style={{display:"flex",gap:8,maxWidth:560,width:"100%",background:"#fff",borderRadius:999,padding:6,boxShadow:"0 30px 90px rgba(0,0,0,0.32)",position:"relative"}} className="fu landing-email">
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinWaitlist()} placeholder="you@example.com" className="if" style={{flex:1,background:"transparent",border:"none",borderRadius:999,padding:"14px 18px",color:"#111318",fontSize:16,transition:"all 0.2s"}}/>
            <button onClick={joinWaitlist} className="bs" style={{background:"#111318",color:"#fff",border:"none",borderRadius:999,padding:"13px 22px",fontSize:14,fontWeight:900,whiteSpace:"nowrap"}}>Get early access</button>
          </div>
        )}
        <div style={{fontSize:12,color:"rgba(255,255,255,0.32)",marginTop:16}}>Real profiles · Live database counts · No fake activity</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginTop:54,position:"relative"}} className="fu">
          <div style={{display:"flex"}}>{["TB","EP","BP","AR"].map((ini,idx)=><div key={ini} style={{width:40,height:40,borderRadius:"50%",background:"#101114",border:"2.5px solid #050506",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",marginLeft:idx===0?0:-13}}>{ini}</div>)}</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",fontWeight:600}}>{fmt(stats.profiles)} verified profiles</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.28)"}}>{fmt(stats.waitlist)} waitlist emails captured</div>
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"#0B0C0E",padding:"14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",width:"max-content"}} className="ticker">
          {[...ticker,...ticker].map((t,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap",paddingRight:4}}><span style={{color:C.accent}}>✦</span> {t}</span>)}
        </div>
      </div>
      <div id="platform" className="landing-section" style={{padding:"118px 52px",maxWidth:1180,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:76}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>The Platform</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.6vw,72px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1,marginBottom:18}}>Everything a founder network should remember.</h2>
        </div>
        <div className="landing-feature-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {[["🤝","Real Connections","Find co-founders and collaborators who get what you're going through."],["🧠","Mentor Access","Mentor requests are tracked by the backend as users request intros."],["📣","Build in Public","Share wins and struggles. Posts, comments, likes, and saves are counted live."],["💼","Opportunities","Co-founder matching, jobs, and gigs can be listed once details are verified."],["📅","Events","RSVP totals come directly from the platform database."],["⚡","FEAR Pro","Premium tools are planned and will show real pricing only when active.",true]].map(([icon,title,desc,pro],i)=>(
            <div key={i} className="ch" style={{background:i%2===0?"#101114":"#0B0C0E",border:"1px solid rgba(255,255,255,0.09)",borderRadius:18,padding:"30px 26px",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.04)"}}>
              <div style={{width:48,height:48,borderRadius:14,background:pro?"#18271E":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:22,border:"1px solid rgba(255,255,255,0.08)"}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:18,color:"#fff",marginBottom:10}}>{title}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.52)",lineHeight:1.72}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#F7F8FA",borderTop:"1px solid #ECEFF3",borderBottom:"1px solid #ECEFF3",padding:"64px 52px"}}>
        <div className="landing-stats" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {statRows.map(([l,n])=>(
            <div key={l} style={{textAlign:"center",padding:"28px 16px",background:"#fff",border:"1px solid #EAECF0",borderRadius:18}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:42,fontWeight:800,letterSpacing:0,color:"#111318"}}>{fmt(n)}</div>
              <div style={{fontSize:12,color:"#687080",marginTop:7,fontWeight:700}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="activity" className="landing-section" style={{padding:"110px 52px",maxWidth:1200,margin:"0 auto"}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,4rem,62px)",fontWeight:800,color:"#fff",letterSpacing:0,textAlign:"center",marginBottom:64}}>Live platform activity</h2>
        <div className="landing-testimonial-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[{q:`${fmt(stats.posts)} posts are stored in the live database from real platform activity.`,name:"Posts",stage:"Cloudflare D1",av:"PO"},{q:`${fmt(stats.mentorRequests)} mentor requests have been submitted by users.`,name:"Mentors",stage:"Cloudflare D1",av:"ME"},{q:`${fmt(stats.messages)} messages have been sent through the platform.`,name:"Messages",stage:"Cloudflare D1",av:"DM"}].map((t,i)=>(
            <div key={i} className="ch" style={{background:"#101114",borderRadius:18,padding:"30px",border:"1px solid rgba(255,255,255,0.09)"}}>
              <div style={{fontSize:40,color:C.accent,marginBottom:20,lineHeight:1}}>"</div>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.75)",lineHeight:1.8,marginBottom:24,fontStyle:"italic"}}>{t.q}</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}><Av i={t.av} size={40} grad/><div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{t.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>{t.stage}</div></div></div>
            </div>
          ))}
        </div>
      </div>
      <div id="pricing" className="landing-section" style={{background:"#fff",borderTop:"1px solid #ECEFF3",padding:"110px 52px"}}>
        <div style={{maxWidth:880,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Access</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,4.2vw,64px)",fontWeight:800,color:"#111318",letterSpacing:0,lineHeight:1,marginBottom:56}}>Start free. Upgrade only when it is real.</h2>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left"}}>
            {[{name:"Free",price:"Available",period:"now",features:["Social feed & posts","Discover & connect","Events access","DMs","Waitlist capture"],grad:false},{name:"FEAR Pro",price:"Planned",period:"not active",features:["Premium tools planned","AI assistant planned","Checkout required before launch","No active paid plan yet"],grad:true}].map((p,i)=>(
              <div key={i} className="ch" style={{background:p.grad?"#111318":"#F7F8FA",border:`1px solid ${p.grad?"#111318":"#EAECF0"}`,borderRadius:22,padding:"38px 34px",position:"relative",overflow:"hidden",boxShadow:p.grad?"0 28px 80px rgba(0,0,0,0.18)":"none"}}>
                <div style={{position:"relative"}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:p.grad?C.accent:"#687080",textTransform:"uppercase",marginBottom:10}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:30}}><span style={{fontFamily:"Georgia,serif",fontSize:54,fontWeight:800,color:p.grad?"#fff":"#111318"}}>{p.price}</span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.34)":"#687080"}}>/{p.period}</span></div>
                  <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:34}}>
                    {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:11}}><span style={{width:20,height:20,borderRadius:"50%",background:p.grad?"rgba(22,199,78,0.18)":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.accent,fontWeight:700,flexShrink:0,border:p.grad?"none":"1px solid #EAECF0"}}>✓</span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.62)":"#555B66"}}>{f}</span></div>)}
                  </div>
                  {p.grad?<button onClick={()=>setScreen("signup")} className="bs" style={{width:"100%",background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"13px 18px",fontSize:14,fontWeight:900}}>Join Pro waitlist →</button>:<button onClick={()=>setScreen("signup")} className="bs" style={{width:"100%",background:"#111318",color:"#fff",border:"none",borderRadius:999,padding:"13px 18px",fontSize:14,fontWeight:900}}>Get started →</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div id="cta" style={{padding:"118px 52px",textAlign:"center",position:"relative",overflow:"hidden",background:"#050506"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:18,position:"relative"}}>Community</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(42px,5.2vw,84px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:0.98,marginBottom:24,position:"relative"}}>Build with people<br/>who are also building.</h2>
        <p style={{fontSize:18,color:"rgba(255,255,255,0.54)",lineHeight:1.75,margin:"0 auto 38px",maxWidth:560,position:"relative"}}>A social layer for serious founders: profiles, posts, messages, events, and numbers pulled from your real backend.</p>
        <button onClick={()=>setScreen("signup")} className="bs" style={{position:"relative",background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"15px 24px",fontSize:15,fontWeight:900,boxShadow:"0 18px 50px rgba(22,199,78,0.28)"}}>Join fear.social free →</button>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",background:"#050506",padding:"32px 52px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:18,color:"#fff"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.22)"}}>© 2026 fear.social · Empowering tomorrow's founders today.</div>
        <div style={{display:"flex",gap:20}}>{["Privacy","Terms","Contact"].map(l=><button key={l} onClick={()=>notify(`${l} page is being prepared`,"info")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">{l}</button>)}</div>
      </div>
    </div>
  );
}


function SignupPage({setScreen,notify,setProfile,initialMode="signup"}){
  const [mode,setMode]=useState(initialMode);
  const [form,setForm]=useState({name:"",username:"",email:""});
  const [login,setLogin]=useState({identifier:"",password:""});
  const [code,setCode]=useState("");
  const [step,setStep]=useState(0);
  const valid=form.name&&form.username&&form.email;
  const loginValid=login.identifier&&login.password;
  const requestCode=async()=>{
    if(!valid)return;
    try{
      await api("/auth/request-code",{method:"POST",body:JSON.stringify({email:form.email,username:form.username})});
      setStep(1);
      notify("Verification code sent");
    }catch(err){
      notify(err.message||"Could not send verification code","error");
    }
  };
  const loginWithPassword=async()=>{
    if(!loginValid)return;
    try{
      const saved=await api("/auth/login",{method:"POST",body:JSON.stringify(login)});
      setProfile(p=>({...p,...saved.profile}));
      setScreen("app");
      notify("Signed in");
    }catch(err){
      notify(err.message||"Could not sign in","error");
    }
  };
  const signInWithGoogle=async()=>{
    try{
      const data=await api("/auth/google/start",{method:"GET"});
      if(data.redirectUrl) window.location.href=data.redirectUrl;
    }catch(err){
      notify(err.message||"Google sign-in is not configured yet","error");
    }
  };
  const enterApp=async()=>{
    const nextProfile={name:form.name,username:form.username,handle:`@${form.username}`,email:form.email};
    try{
      const saved=await api("/auth/verify",{method:"POST",body:JSON.stringify({email:form.email,code,profile:nextProfile})});
      setProfile(p=>({...p,...saved.profile}));
    }catch(err){
      notify(err.message||"Could not verify email","error");
      return;
    }
    setScreen("app");
    notify("Welcome to fear.social!");
  };
  if(step===1) return(
    <div style={{minHeight:"100vh",background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#fff",borderRadius:24,padding:36,width:"min(440px,100%)",boxShadow:"0 30px 100px rgba(0,0,0,.28)"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:700,color:C.text,marginBottom:8,letterSpacing:0}}>Verify your email</div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:24}}>Enter the 6-digit code sent to {form.email}.</div>
        <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} onKeyDown={e=>e.key==="Enter"&&code.length===6&&enterApp()} placeholder="000000" inputMode="numeric" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${code.length===6?C.accent:C.border}`,borderRadius:12,padding:"16px",fontSize:24,fontWeight:900,letterSpacing:4,textAlign:"center",color:C.text,marginBottom:16}}/>
        <GBtn full onClick={enterApp} style={{opacity:code.length===6?1:.45,pointerEvents:code.length===6?"auto":"none"}}>Verify and enter →</GBtn>
        <button onClick={requestCode} className="bs" style={{marginTop:14,width:"100%",background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Send a new code</button>
      </div>
    </div>
  );
  if(step===2) return(
    <div style={{minHeight:"100vh",background:GR,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:440}}>
        <div style={{fontSize:72,marginBottom:30}}>🌱</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:44,fontWeight:700,color:"#fff",marginBottom:12,letterSpacing:0}}>You're in, {form.name.split(" ")[0]}.</div>
        <div style={{fontSize:17,color:"rgba(255,255,255,0.6)",lineHeight:1.8,marginBottom:44}}>Welcome to a community that turns fear into fuel.</div>
        <GBtn lg onClick={enterApp} style={{background:"#fff",color:C.accent,boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>Enter fear.social →</GBtn>
      </div>
    </div>
  );
  return(
    <div className="signup-root" style={{minHeight:"100vh",background:C.dark,display:"flex"}}>
      <div className="signup-copy" style={{flex:1,background:GR2,display:"flex",alignItems:"center",justifyContent:"center",padding:72}}>
        <div style={{maxWidth:520}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:56,fontWeight:700,color:"#fff",letterSpacing:0,lineHeight:1.02,marginBottom:28}}>The community<br/>you've been<br/>looking for.</div>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.42)",lineHeight:1.85,marginBottom:44}}>Real profiles, posts, and activity counts. One platform built for you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["🤝","Connect with founders at your exact stage"],["🧠","Request mentor intros"],["📣","Build in public with real support"],["⚡","Find co-founders, jobs, and gigs"]].map(([icon,text])=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
                <span style={{fontSize:15,color:"rgba(255,255,255,0.55)"}}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="signup-form-panel" style={{width:520,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:56}}>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{display:"flex",gap:8,background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:28}}>
            <button onClick={()=>setMode("signup")} className="bs" style={{flex:1,border:"none",borderRadius:9,padding:"10px 12px",fontSize:13,fontWeight:900,color:mode==="signup"?"#fff":C.muted,background:mode==="signup"?C.accent:"transparent"}}>Sign up</button>
            <button onClick={()=>setMode("login")} className="bs" style={{flex:1,border:"none",borderRadius:9,padding:"10px 12px",fontSize:13,fontWeight:900,color:mode==="login"?"#fff":C.muted,background:mode==="login"?C.accent:"transparent"}}>Log in</button>
          </div>
          {mode==="signup"?<>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Sign up</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>Create your fear.social account.</div>
          <button onClick={signInWithGoogle} className="bs" style={{width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 16px",fontSize:14,fontWeight:900,color:C.text,marginBottom:18}}>Sign up with Google</button>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {[["Full name","text","Your name","name"],["Username","text","username","username"],["Email","email","you@example.com","email"]].map(([label,type,ph,key])=>(
              <div key={key}>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>{label}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:key==="username"?cleanUsername(e.target.value):e.target.value}))} placeholder={ph} className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${form[key]?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
                {key==="username"&&form.username&&<div style={{fontSize:12,color:C.muted,marginTop:6}}>Your profile will be @{form.username}</div>}
              </div>
            ))}
            <GBtn full onClick={requestCode} style={{opacity:valid?1:0.45,pointerEvents:valid?"auto":"none"}}>Send verification code →</GBtn>
            <div style={{fontSize:12,color:C.dim,textAlign:"center"}}>Free forever · No credit card</div>
          </div>
          </>:<>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Log in</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>Access your existing fear.social account.</div>
          <button onClick={signInWithGoogle} className="bs" style={{width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 16px",fontSize:14,fontWeight:900,color:C.text,marginBottom:18}}>Continue with Google</button>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Username or email</label>
              <input value={login.identifier} onChange={e=>setLogin(l=>({...l,identifier:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginWithPassword()} placeholder="username or email" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${login.identifier?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
              <input type="password" value={login.password} onChange={e=>setLogin(l=>({...l,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginWithPassword()} placeholder="Password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${login.password?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
            </div>
            <GBtn full onClick={loginWithPassword} style={{opacity:loginValid?1:0.45,pointerEvents:loginValid?"auto":"none"}}>Log in →</GBtn>
            <button onClick={()=>setMode("signup")} className="bs" style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Need an account? Sign up</button>
          </div>
          </>}
        </div>
      </div>
    </div>
  );
}

function PlatformApp({notify,setScreen,signOut,profile,setProfile}){
  const [view,setView]=useLocalState("fear-view","feed");
  const [posts,setPosts]=useLocalState("fear-posts",POSTS);
  const [people,setPeople]=useLocalState("fear-people",PEOPLE);
  const [events,setEvents]=useLocalState("fear-events",EVENTS);
  const [mentors,setMentors]=useLocalState("fear-mentors",MENTORS);
  const [messages,setMessages]=useLocalState("fear-messages",INITIAL_MESSAGES);
  const [stats,setStats]=useLocalState("fear-stats",REAL_STATS);
  const [filter,setFilter]=useState("All");
  const [composer,setComposer]=useState("");
  const [postType,setPostType]=useState("Update");
  const [commentInputs,setCommentInputs]=useState({});
  const [openComments,setOpenComments]=useState({});
  const [query,setQuery]=useState("");
  const [editProfile,setEditProfile]=useState(false);
  const [profileDraft,setProfileDraft]=useState(profile);
  const applyBackendState=useCallback((data)=>{
    if(data.profile){
      setProfile(p=>({...p,...data.profile}));
      setProfileDraft(p=>({...p,...data.profile}));
    }
    if(data.posts)setPosts(data.posts);
    if(data.people)setPeople(data.people);
    if(data.events)setEvents(data.events);
    if(data.mentors)setMentors(data.mentors);
    if(data.messages)setMessages(data.messages);
    if(data.stats)setStats(data.stats);
  },[setEvents,setMentors,setMessages,setPeople,setPosts,setProfile,setStats]);
  const callBackend=useCallback(async(path,options={})=>{
    const data=await api(path,options);
    applyBackendState(data);
    return data;
  },[applyBackendState]);
  useEffect(()=>{
    let active=true;
    api("/bootstrap").then(data=>{if(active)applyBackendState(data);}).catch(()=>notify("Offline mode: changes are saved in this browser","info"));
    return()=>{active=false;};
  },[applyBackendState,notify]);
  const tabs=[
    ["feed","Feed"],
    ["discover","Discover"],
    ["events","Events"],
    ["mentors","Mentors"],
    ["messages","Messages"],
    ["groups","Groups"],
    ["opportunities","Deals"],
  ];
  const mobileTabs=[
    ["feed","Feed","⌂"],
    ["discover","Find","◇"],
    ["messages","DMs","✉"],
    ["mentors","Mentors","★"],
    ["profile","Me","●"],
  ];
  const initials=(profile.name||"Your Name").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()||"YO";
  const visiblePosts=posts.filter(p=>(filter==="All"||p.tag===filter)&&(query.trim()===""||`${p.user} ${p.content} ${p.tag}`.toLowerCase().includes(query.toLowerCase())));
  const unread=messages.reduce((n,m)=>n+(m.thread.length>2?1:0),0);
  const statCards=[
    ["Posts",fmt(stats.posts)],
    ["Following",fmt(people.filter(p=>p.connected).length)],
    ["Saved",fmt(posts.filter(p=>p.saved).length)],
    ["RSVPs",fmt(events.filter(e=>e.going).length)],
  ];
  const publish=async()=>{
    if(!composer.trim())return notify("Write something before publishing","error");
    const optimistic={
      id:Date.now(),user:profile.name||"Your Name",handle:profile.handle||"@yourhandle",av:"YO",
      tag:profile.industry||"Tech",stage:profile.stage?.toLowerCase().includes("launched")?"Launched":"Building",
      time:"Just now",type:postType,content:composer.trim(),likes:0,comments:[],saved:false,liked:false,isNew:true
    };
    setPosts(ps=>[optimistic,...ps]);
    setComposer("");
    try{
      await callBackend("/posts",{method:"POST",body:JSON.stringify({content:optimistic.content,type:postType,tag:optimistic.tag,stage:optimistic.stage})});
      notify(`${postType} published`);
    }catch(err){
      notify("Published locally. Cloud sync failed.","error");
    }
  };
  const connect=async id=>{
    setPeople(ps=>ps.map(p=>p.id===id?{...p,connected:!p.connected,followers:p.connected?p.followers-1:p.followers+1}:p));
    try{await callBackend(`/people/${id}/connect`,{method:"POST"});}catch{}
  };
  const rsvp=async id=>{
    setEvents(es=>es.map(e=>e.id===id?{...e,going:!e.going,attending:e.going?e.attending-1:e.attending+1}:e));
    try{await callBackend(`/events/${id}/rsvp`,{method:"POST"});}catch{}
  };
  const requestMentor=async id=>{
    setMentors(ms=>ms.map(m=>(m.id||m.name)===id?{...m,requested:!m.requested,sessions:m.requested?m.sessions:m.sessions+1}:m));
    try{await callBackend(`/mentors/${id}/request`,{method:"POST"});}catch{}
  };
  const togglePostAction=async(id,action)=>{
    setPosts(ps=>ps.map(p=>{
      if(p.id!==id)return p;
      if(action==="like")return {...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1};
      return {...p,saved:!p.saved};
    }));
    try{await callBackend(`/posts/${id}/${action}`,{method:"POST"});}catch{}
  };
  const addComment=async id=>{
    const text=commentInputs[id]?.trim();
    if(!text)return;
    setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,{user:profile.name||"You",av:"YO",text,time:"Just now"}]}:p));
    setCommentInputs(ci=>({...ci,[id]:""}));
    try{
      await callBackend(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({text})});
      notify("Comment posted");
    }catch{
      notify("Comment saved locally. Cloud sync failed.","error");
    }
  };
  const sendMessage=async id=>{
    const thread=messages.find(m=>m.id===id);
    const text=thread?.draft?.trim();
    if(!text)return;
    setMessages(ms=>ms.map(m=>{
      if(m.id!==id||!m.draft.trim())return m;
      notify(`Message sent to ${m.name}`);
      return {...m,thread:[...m.thread,{id:Date.now(),text:m.draft.trim(),author:"you",time:"Just now"}],draft:""};
    }));
    try{await callBackend(`/messages/${id}/send`,{method:"POST",body:JSON.stringify({text})});}catch{}
  };
  const saveProfile=async()=>{
    const username=cleanUsername(profileDraft.username||profileDraft.handle||profileDraft.name);
    const nextDraft={...profileDraft,username,handle:`@${username}`};
    setProfile(nextDraft);
    setEditProfile(false);
    try{
      const data=await callBackend("/profile",{method:"PUT",body:JSON.stringify({profile:nextDraft})});
      setProfile(p=>({...p,...data.profile}));
      notify("Profile updated");
    }catch{
      notify("Profile saved locally. Cloud sync failed.","error");
    }
  };
  const SectionTitle=({eyebrow,title,action})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,marginBottom:20}}>
      <div>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:7}}>{eyebrow}</div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:36,lineHeight:1.05,letterSpacing:0,color:C.text}}>{title}</h1>
      </div>
      {action}
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div className="app-topbar" style={{position:"sticky",top:0,zIndex:200,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(18px)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",minHeight:68,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div className="app-topbar-logo" onClick={()=>setView("feed")} style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:C.text,cursor:"pointer",whiteSpace:"nowrap"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div className="desktop-app-tabs" style={{display:"flex",gap:3,overflowX:"auto",flex:1}}>
          {tabs.map(([id,label])=><button key={id} onClick={()=>setView(id)} className="bs nl" style={{background:view===id?C.aLight:"transparent",border:"none",borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:view===id?800:600,color:view===id?C.accent:C.muted,whiteSpace:"nowrap"}}>{label}{id==="messages"&&unread>0?` ${unread}`:""}</button>)}
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search founders, posts, tags" className="if desktop-app-search" style={{width:240,maxWidth:"32vw",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:C.text}}/>
        <button onClick={()=>notify(`${unread} notifications`,"info")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",position:"relative"}}>🔔<span style={{position:"absolute",top:-6,right:-6,width:17,height:17,borderRadius:"50%",background:C.coral,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span></button>
        <button onClick={()=>setEditProfile(true)} style={{background:"none",border:"none"}}><Av i={initials} size={38} grad online/></button>
        <button onClick={signOut} className="bs desktop-signout" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,color:C.muted,fontWeight:700}}>Sign out</button>
      </div>
      <div className="app-shell" style={{maxWidth:1320,margin:"0 auto",padding:"28px"}}>
        {view==="feed"&&(
          <div className="feed-grid" style={{display:"grid",gridTemplateColumns:"270px minmax(0,1fr) 310px",gap:22,alignItems:"start"}}>
            <aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}><Av i={initials} size={54} grad online/><div><div style={{fontWeight:900,color:C.text}}>{profile.name||"Your Name"}</div><div style={{fontSize:12,color:C.dim}}>{profile.handle||"@yourhandle"} · {profile.location||"Denver, CO"}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{statCards.map(([k,v])=><div key={k} className="uh" style={{background:C.bg,borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:C.text}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{k}</div></div>)}</div>
              </div>
              <div style={{background:GR,borderRadius:18,padding:20,color:"#fff"}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,opacity:.65,marginBottom:8}}>FEAR PRO</div>
                <div style={{fontWeight:900,fontSize:18,marginBottom:7}}>Founder operating system</div>
                <div style={{fontSize:13,opacity:.72,lineHeight:1.6,marginBottom:16}}>Premium tools are planned and will show pricing only when checkout is active.</div>
                <button onClick={()=>notify("Premium waitlist noted","info")} className="bs" style={{background:"#fff",border:"none",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.accent,width:"100%"}}>Join waitlist</button>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
                <div style={{fontWeight:900,fontSize:14,marginBottom:12}}>Live rooms</div>
                {GROUPS.map(g=><div key={g.id} className="uh" onClick={()=>notify(`Joined ${g.name}`)} style={{padding:"9px 6px",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{g.name}</div><div style={{fontSize:11,color:C.dim}}>{g.active}</div></div>)}
              </div>
            </aside>
            <main>
              <div className="mobile-profile-summary" style={{display:"none",background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:16,marginBottom:14}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av i={initials} size={46} grad online/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:900,color:C.text}}>{profile.name||"Your Name"}</div>
                    <div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.handle||"@yourhandle"} · {profile.industry||"Tech"}</div>
                  </div>
                  <button onClick={()=>setEditProfile(true)} style={{background:C.aLight,color:C.accent,border:"none",borderRadius:9,padding:"8px 11px",fontSize:12,fontWeight:900}}>Edit</button>
                </div>
              </div>
              <div className="composer-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,padding:20,marginBottom:18}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av i={initials} size={44} grad/>
                  <div style={{flex:1}}>
                    <textarea value={composer} onChange={e=>setComposer(e.target.value)} placeholder="Share a win, ask for feedback, or post what you're building..." className="if" style={{width:"100%",minHeight:104,resize:"vertical",background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:14,fontSize:14,color:C.text,lineHeight:1.6}}/>
                    <div className="composer-actions" style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}>
                      {["Update","Ask","Milestone","Hiring","Launch"].map(t=><button key={t} onClick={()=>setPostType(t)} className="bs" style={{background:postType===t?C.aLight:"#fff",border:`1px solid ${postType===t?C.aSoft:C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:800,color:postType===t?C.accent:C.muted}}>{t}</button>)}
                      <GBtn sm onClick={publish} style={{marginLeft:"auto",opacity:composer.trim()?1:.55}}>Publish</GBtn>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>{["All","Tech","Finance","Fashion","Food","Health"].map(t=><button key={t} onClick={()=>setFilter(t)} className="bs" style={{background:filter===t?C.accent:"#fff",color:filter===t?"#fff":C.muted,border:`1px solid ${filter===t?C.accent:C.border}`,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:800,whiteSpace:"nowrap"}}>{t}</button>)}</div>
              {visiblePosts.length===0&&<EmptyState title="No real posts yet" text="The feed is intentionally empty until a real account publishes a post."/>}
              {visiblePosts.map(p=>(
                <article key={p.id} className="ch post-card" style={{background:C.card,border:`1px solid ${p.isNew?C.aSoft:C.border}`,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:20}}>
                    <div style={{display:"flex",gap:12,alignItems:"start",marginBottom:12}}>
                      <Av i={p.av} size={45} grad={p.av==="YO"} online={["MK","SR","YO"].includes(p.av)}/>
                      <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:C.text}}>{p.user}</b><Tag label={p.type||p.stage} style={{background:C.aLight,color:C.accent}}/><IT label={p.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{p.handle} · {p.time} ago</div></div>
                    </div>
                    <p style={{fontSize:15,color:C.tSoft,lineHeight:1.75}}>{p.content}</p>
                  </div>
                  <div className="post-actions" style={{borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",gap:16,alignItems:"center"}}>
                    <button className="bs" onClick={()=>togglePostAction(p.id,"like")} style={{background:"none",border:"none",fontWeight:800,color:p.liked?C.coral:C.muted}}>{p.liked?"♥":"♡"} {p.likes}</button>
                    <button className="bs" onClick={()=>setOpenComments(o=>({...o,[p.id]:!o[p.id]}))} style={{background:"none",border:"none",fontWeight:800,color:openComments[p.id]?C.accent:C.muted}}>💬 {p.comments.length}</button>
                    <button className="bs" onClick={()=>{togglePostAction(p.id,"save");notify(p.saved?"Removed from saved":"Saved post");}} style={{background:"none",border:"none",fontWeight:800,color:p.saved?C.accent:C.muted,marginLeft:"auto"}}>{p.saved?"Saved":"Save"}</button>
                  </div>
                  {openComments[p.id]&&<div style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:16}}>{p.comments.map((c,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10}}><Av i={c.av} size={30}/><div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px",flex:1}}><b style={{fontSize:12}}>{c.user}</b><p style={{fontSize:13,color:C.tSoft,lineHeight:1.5}}>{c.text}</p></div></div>)}<div style={{display:"flex",gap:8}}><input value={commentInputs[p.id]||""} onChange={e=>setCommentInputs(ci=>({...ci,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(p.id)} placeholder="Write a comment..." className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}/><GBtn sm onClick={()=>addComment(p.id)}>Send</GBtn></div></div>}
                </article>
              ))}
            </main>
            <aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Suggested founders</b>{people.length===0&&<MiniEmpty text="Real users will appear here after they create accounts."/>}{people.slice(0,4).map(p=><div key={p.id} className="uh" style={{display:"flex",gap:10,alignItems:"center",padding:"12px 4px"}}><Av i={p.av} size={36} online={p.online}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{p.name}</div><div style={{fontSize:11,color:C.dim}}>{p.industry} · {p.stage}</div></div><button onClick={()=>{connect(p.id);notify(`${p.connected?"Unfollowed":"Following"} ${p.name}`);}} style={{background:p.connected?C.accent:C.aLight,color:p.connected?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11}}>{p.connected?"Following":"Follow"}</button></div>)}</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Next events</b>{events.length===0&&<MiniEmpty text="No real events are published yet."/>}{events.slice(0,3).map(e=><div key={e.id} className="uh" style={{padding:"12px 4px"}}><div style={{fontSize:13,fontWeight:800}}>{e.title}</div><div style={{fontSize:11,color:C.dim,margin:"3px 0 8px"}}>{e.date} · {fmt(e.attending)} RSVPs</div><button onClick={()=>{rsvp(e.id);notify(`${e.going?"Removed RSVP":"RSVP confirmed"}`);}} style={{background:e.going?C.accent:C.aLight,color:e.going?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11}}>{e.going?"Going":"RSVP"}</button></div>)}</div>
            </aside>
          </div>
        )}
        {view==="discover"&&<Directory title="Discover founders" eyebrow="Network" items={people.filter(p=>`${p.name} ${p.industry} ${p.bio}`.toLowerCase().includes(query.toLowerCase()))} render={p=><div key={p.id} className="ch" style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}><Av i={p.av} size={52} online={p.online}/><div style={{flex:1}}><b>{p.name}</b><div style={{fontSize:12,color:C.dim}}>{p.handle} · {p.loc}</div></div><IT label={p.industry}/></div><p style={bodyCopy}>{p.bio}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18}}><span style={{fontSize:12,color:C.muted}}>{fmt(p.followers)} verified connections</span><GBtn sm onClick={()=>{connect(p.id);notify(`${p.connected?"Disconnected from":"Connected with"} ${p.name}`);}}>{p.connected?"Connected":"Connect"}</GBtn></div></div>}/>}
        {view==="events"&&<Directory title="Events and rooms" eyebrow="Calendar" items={events} render={e=><div key={e.id} className="ch" style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{e.title}</b><IT label={e.tag}/></div><p style={bodyCopy}>{e.desc}</p><div style={{fontSize:13,color:C.muted,margin:"16px 0"}}>{e.date} · {e.time} · {e.type} · {fmt(e.attending)} RSVPs</div><GBtn sm onClick={()=>{rsvp(e.id);notify(e.going?"RSVP removed":"RSVP confirmed");}}>{e.going?"Going":"RSVP"}</GBtn></div>}/>}
        {view==="mentors"&&<Directory title="Verified mentors" eyebrow="Mentors" items={mentors} render={m=><div key={m.name} className="ch" style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}><Av i={m.av} size={52} grad/><div><b>{m.name}</b><div style={{fontSize:12,color:C.dim}}>{m.role}</div></div></div><p style={bodyCopy}>{m.bio}</p><div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"16px 0"}}>{m.tags.map(t=><Tag key={t} label={t} style={{background:C.aLight,color:C.accent}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.muted}}>{fmt(m.sessions)} requests</span><GBtn sm onClick={()=>{requestMentor(m.id||m.name);notify(m.requested?"Request withdrawn":"Mentor request sent");}}>{m.requested?"Requested":"Request"}</GBtn></div></div>}/>}
        {view==="messages"&&<MessagesView messages={messages} setMessages={setMessages} sendMessage={sendMessage}/>}
        {view==="groups"&&<Directory title="Founder groups" eyebrow="Rooms" items={GROUPS} render={g=><div key={g.id} className="ch" style={cardStyle}><b>{g.name}</b><p style={bodyCopy}>{g.desc}</p><div style={{fontSize:13,color:C.muted,margin:"14px 0"}}>{g.active}</div><GBtn sm onClick={()=>notify(`Joined ${g.name}`)}>Join room</GBtn></div>}/>}
        {view==="opportunities"&&<Directory title="Opportunities" eyebrow="Market" items={DEALS} render={d=><div key={d.id} className="ch" style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{d.title}</b><IT label={d.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:4}}>{d.company} · {d.budget}</div><p style={bodyCopy}>{d.desc}</p><GBtn sm onClick={()=>notify(`Saved ${d.title}`)}>Save opportunity</GBtn></div>}/>}
        {view==="profile"&&<ProfilePanel profile={profile} setEditProfile={setEditProfile} stats={statCards}/>}
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">
        {mobileTabs.map(([id,label,icon])=><button key={id} className={view===id?"active":""} onClick={()=>setView(id)}><span>{icon}</span>{label}{id==="messages"&&unread>0?` ${unread}`:""}</button>)}
      </nav>
      {editProfile&&<div className="edit-modal" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.58)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setEditProfile(false)}><div className="edit-sheet" style={{background:"#fff",borderRadius:22,padding:28,width:"min(520px,100%)",boxShadow:"0 30px 100px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}><SectionTitle eyebrow="Profile" title="Edit your founder card"/><label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>name<input value={profileDraft.name||""} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label><label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>username<input value={cleanUsername(profileDraft.username||profileDraft.handle||"")} onChange={e=>setProfileDraft(p=>{const username=cleanUsername(e.target.value);return {...p,username,handle:`@${username}`};})} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/><span style={{display:"block",fontSize:12,color:C.dim,textTransform:"none",fontWeight:600,marginTop:6}}>Your profile URL name is @{cleanUsername(profileDraft.username||profileDraft.handle||"username")}</span></label>{["location","industry","bio"].map(k=><label key={k} style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>{k}<input value={profileDraft[k]||""} onChange={e=>setProfileDraft(p=>({...p,[k]:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>)}<div style={{display:"flex",gap:10,justifyContent:"end",marginTop:20}}><GhostBtn onClick={()=>setEditProfile(false)}>Cancel</GhostBtn><GBtn onClick={saveProfile}>Save profile</GBtn></div></div></div>}
    </div>
  );
}

const cardStyle={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22};
const bodyCopy={fontSize:14,color:C.tSoft,lineHeight:1.7,marginTop:12};
function EmptyState({title,text}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,textAlign:"center",color:C.muted}}><div style={{fontWeight:900,fontSize:18,color:C.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,lineHeight:1.65}}>{text}</div></div>;
}
function MiniEmpty({text}){
  return <div style={{fontSize:12,color:C.dim,lineHeight:1.55,marginTop:10,padding:"10px 0"}}>{text}</div>;
}
function Directory({eyebrow,title,items,render}){
  return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{eyebrow}</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>{title}</h1>{items.length===0?<EmptyState title="Nothing real here yet" text="This area will stay empty until real records are added in the backend."/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{items.map(render)}</div>}</div>;
}
function MessagesView({messages,setMessages,sendMessage}){
  const [active,setActive]=useState(messages[0]?.id);
  const thread=messages.find(m=>m.id===active)||messages[0];
  const messageText=msg=>typeof msg==="string"?msg:msg.text;
  const messageAuthor=msg=>typeof msg==="string"?"them":msg.author;
  if(messages.length===0)return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Inbox</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>Founder messages</h1><EmptyState title="No real messages yet" text="Direct messages will appear here after real conversations start."/></div>;
  return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Inbox</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>Founder messages</h1><div className="messages-grid" style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:18,minHeight:"70vh"}}><div className="message-list" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:12}}>{messages.map(m=><button key={m.id} onClick={()=>setActive(m.id)} className="uh" style={{width:"100%",display:"flex",gap:12,alignItems:"center",padding:12,border:"none",background:active===m.id?C.aLight:"transparent",borderRadius:12,textAlign:"left"}}><Av i={m.av} size={40} online={m.online}/><div><div style={{fontWeight:900,color:C.text}}>{m.name}</div><div style={{fontSize:12,color:C.dim}}>{messageText(m.thread[m.thread.length-1])}</div></div></button>)}</div>{thread&&<div className="message-panel" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,display:"flex",flexDirection:"column"}}><div style={{display:"flex",gap:12,alignItems:"center",paddingBottom:14,borderBottom:`1px solid ${C.border}`}}><Av i={thread.av} size={44} online={thread.online}/><div><b>{thread.name}</b><div style={{fontSize:12,color:C.dim}}>{thread.online?"Online now":"Usually replies today"}</div></div></div><div style={{flex:1,padding:"20px 0",display:"flex",flexDirection:"column",gap:10}}>{thread.thread.map((msg,i)=>{const mine=messageAuthor(msg)==="you";return <div className="message-bubble" key={typeof msg==="string"?i:msg.id||i} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"70%",background:mine?C.accent:C.bg,color:mine?"#fff":C.text,borderRadius:14,padding:"10px 13px",fontSize:14,lineHeight:1.5}}>{messageText(msg)}</div>;})}</div><div style={{display:"flex",gap:10}}><input value={thread.draft} onChange={e=>setMessages(ms=>ms.map(m=>m.id===thread.id?{...m,draft:e.target.value}:m))} onKeyDown={e=>e.key==="Enter"&&sendMessage(thread.id)} placeholder={`Message ${thread.name}`} className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",minWidth:0}}/><GBtn onClick={()=>sendMessage(thread.id)}>Send</GBtn></div></div>}</div></div>;
}
function ProfilePanel({profile,setEditProfile,stats}){
  return <div className="directory-wrap" style={{maxWidth:840}}><div className="profile-hero" style={{background:GR,borderRadius:24,padding:32,color:"#fff",marginBottom:18}}><div className="profile-hero-row" style={{display:"flex",alignItems:"center",gap:18}}><Av i={(profile.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()} size={72} style={{background:"#fff",color:C.accent}}/><div><h1 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0}}>{profile.name||"Your Name"}</h1><div style={{opacity:.75}}>{profile.handle||"@yourhandle"} · {profile.location||"Denver, CO"} · {profile.industry||"Tech"}</div></div><button onClick={()=>setEditProfile(true)} className="bs" style={{marginLeft:"auto",background:"#fff",color:C.accent,border:"none",borderRadius:10,padding:"10px 16px",fontWeight:900}}>Edit profile</button></div><p style={{marginTop:24,maxWidth:640,lineHeight:1.75,opacity:.82}}>{profile.bio||"Building in public, meeting ambitious founders, and turning fear into useful momentum."}</p></div><div className="profile-stats" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>{stats.map(([k,v])=><div key={k} style={cardStyle}><div style={{fontSize:26,fontWeight:900,color:C.text}}>{v}</div><div style={{fontSize:12,color:C.muted}}>{k}</div></div>)}</div></div>;
}

export default function App(){
  const {toasts,notify,remove}=useToast();
  const initialScreen=consumeOAuthToken()||window.location.hash.startsWith("#app")?"app":"landing";
  const [screenState,setScreenState]=useLocalState("fear-screen",initialScreen);
  useEffect(()=>{
    if(initialScreen==="landing"&&screenState!=="landing") setScreenState("landing");
  },[]);
  const [profile,setProfile]=useLocalState("fear-profile",{
    name:"Your Name",
    handle:"@yourhandle",
    email:"",
    location:"Denver, CO",
    industry:"Tech",
    stage:"I'm actively building",
    bio:"Building in public, meeting ambitious founders, and turning fear into useful momentum.",
  });
  const setScreen=useCallback((next)=>{
    setScreenState(next);
    if(next==="app"&&window.location.hash!=="#app") window.history.replaceState(null,"","#app");
    if(next!=="app"&&window.location.hash==="#app") window.history.replaceState(null,"#",window.location.pathname);
  },[setScreenState]);
  const signOut=useCallback(()=>{
    clearSessionToken();
    setScreenState("landing");
    if(window.location.hash==="#app") window.history.replaceState(null,"#",window.location.pathname);
    notify("Signed out");
  },[notify,setScreenState]);
  const screen=screenState;
  return(
    <>
      <style>{css}</style>
      <ToastCtx toasts={toasts} remove={remove}/>
      <div style={{minHeight:"100vh",background:screen==="app"?C.bg:C.dark}}>
        {screen!=="signup"&&screen!=="login"&&screen!=="app"&&<Navbar setScreen={setScreen} notify={notify}/>}
        {screen==="landing"&&<LandingPage setScreen={setScreen} notify={notify}/>}
        {(screen==="signup"||screen==="login")&&<SignupPage setScreen={setScreen} notify={notify} setProfile={setProfile} initialMode={screen==="login"?"login":"signup"}/>}
        {screen==="app"&&<PlatformApp notify={notify} setScreen={setScreen} signOut={signOut} profile={profile} setProfile={setProfile}/>}
      </div>
    </>
  );
}
