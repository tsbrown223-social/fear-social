import { useState, useEffect, useCallback } from "react";

const GR = "linear-gradient(135deg, #111318 0%, #16C74E 100%)";
const GR2 = "linear-gradient(135deg, #0a0c0f 0%, #0d2018 60%, #16C74E 100%)";
const GRT = { background:GR, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };
const C = {
  bg:"#F0F2F5", card:"#FFFFFF", border:"#E2E6EE", accent:"#16C74E",
  aLight:"#E8FBF0", aSoft:"#B8F5CE", text:"#0D0F14", tSoft:"#2A2D38",
  muted:"#6B7280", dim:"#9CA3AF", dark:"#0C0D10", dCard:"#1A1D24",
  dBorder:"#252830", coral:"#E53935", navy:"#1E2235",
  ind:{
    Tech:{bg:"#EEF2FF",color:"#3730A3"}, Finance:{bg:"#E8FBF0",color:"#14532D"},
    Fashion:{bg:"#FDF2F8",color:"#9D174D"}, Food:{bg:"#FFF7ED",color:"#C2410C"},
    Health:{bg:"#F0FDFA",color:"#0F766E"}, Other:{bg:"#F3F4F6",color:"#6B7280"},
    Networking:{bg:"#FFF7ED",color:"#C2410C"}, Growth:{bg:"#F0FDFA",color:"#0F766E"},
  }
};
const SS = { Idea:{bg:"#ECEEF4",color:"#1E2235"}, Building:{bg:"#E8FBF0",color:"#16C74E"}, Launched:{bg:"#F3F4F6",color:"#6B7280"} };

const css = `
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
input,textarea,select{outline:none;font-family:inherit;}button{font-family:inherit;cursor:pointer;}::placeholder{color:${C.dim};}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(22,199,78,0.3);}50%{box-shadow:0 0 50px rgba(22,199,78,0.7);}}
@keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);}}
@keyframes heartbeat{0%,100%{transform:scale(1);}25%{transform:scale(1.4);}50%{transform:scale(1.1);}75%{transform:scale(1.3);}}
@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
.fu{animation:fadeUp 0.45s ease forwards;}
.glow{animation:glow 2s ease-in-out infinite;}
.ticker{animation:ticker 32s linear infinite;}
.ch{transition:all 0.22s ease;}.ch:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(22,199,78,0.12);border-color:rgba(22,199,78,0.3)!important;}
.bs{transition:all 0.15s ease;}.bs:hover{transform:translateY(-2px);filter:brightness(1.08);}.bs:active{transform:scale(0.96);}
.nl:hover{color:#16C74E!important;}
.if:focus{border-color:#16C74E!important;box-shadow:0 0 0 3px rgba(22,199,78,0.18)!important;}
.rh:hover{background:rgba(22,199,78,0.04);}
.uh:hover{background:rgba(22,199,78,0.06);border-radius:10px;}
@media(max-width:980px){
  [style*="grid-template-columns: 270px minmax(0,1fr) 310px"]{grid-template-columns:1fr!important;}
  [style*="position: sticky"]{position:static!important;}
}
@media(max-width:760px){
  [style*="grid-template-columns: 310px 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
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
  <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
    {toasts.map(t=>(
      <div key={t.id} onClick={()=>remove(t.id)} style={{background:t.type==="success"?C.accent:t.type==="error"?"#EF4444":"#3B82F6",color:"#fff",borderRadius:12,padding:"13px 18px",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",animation:"popIn 0.25s ease",minWidth:240}}>
        <span style={{fontSize:18}}>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}</span>{t.msg}
      </div>
    ))}
  </div>
);

const POSTS=[
  {id:1,user:"Maya Kim",handle:"@mayabuilds",av:"MK",tag:"Tech",stage:"Launched",time:"2h",content:"Hit 1,000 users in 30 days with zero ad spend. Here's the exact playbook — drop a comment if you want it.",likes:248,comments:[{user:"Jordan Lee",av:"JL",text:"Need this! 🙌",time:"1h"},{user:"Sofia R.",av:"SR",text:"How did you handle retention?",time:"45m"}],saved:false,liked:false},
  {id:2,user:"Jordan Lee",handle:"@jordanlaunch",av:"JL",tag:"Finance",stage:"Building",time:"5h",content:"Raised my first $10K from people I knew without making things awkward. One conversation changed everything.",likes:189,comments:[{user:"Cameron T.",av:"CT",text:"This is the post I needed today.",time:"4h"}],saved:false,liked:false},
  {id:3,user:"Priya Shah",handle:"@priyastartup",av:"PS",tag:"Fashion",stage:"Launched",time:"8h",content:"My first business failed. I'm posting this because no one talks about what comes after — the grief, the clarity, and how I rebuilt.",likes:412,comments:[],saved:false,liked:false},
  {id:4,user:"Raj K.",handle:"@rajbuilds",av:"RK",tag:"Health",stage:"Launched",time:"2d",content:"We just crossed $50K ARR. 18 months ago I had nothing but a Notion doc and a lot of fear.",likes:521,comments:[],saved:false,liked:false},
];
const PEOPLE=[
  {id:1,name:"Sofia R.",handle:"@sofiabuilds",av:"SR",stage:"Building",industry:"Food",mutual:3,loc:"Austin, TX",bio:"Building the future of artisan food delivery.",followers:892,connected:false,online:true},
  {id:2,name:"Ethan M.",handle:"@ethanmakes",av:"EM",stage:"Launched",industry:"Tech",mutual:7,loc:"San Francisco, CA",bio:"Shipped 4 apps. Obsessed with AI tooling.",followers:2104,connected:false,online:false},
  {id:3,name:"Aisha P.",handle:"@aishapriya",av:"AP",stage:"Idea",industry:"Health",mutual:2,loc:"New York, NY",bio:"Ex-nurse building tech to fix mental health.",followers:445,connected:false,online:true},
  {id:4,name:"Leo C.",handle:"@leocreates",av:"LC",stage:"Building",industry:"Fashion",mutual:5,loc:"Los Angeles, CA",bio:"Sustainable fashion marketplace.",followers:1230,connected:false,online:false},
];
const MENTORS=[
  {name:"Alexis Chen",role:"3× Founder · VC Partner",av:"AC",sessions:142,rating:4.9,tags:["SaaS","Fundraising"],bio:"Exited two companies. Now backing the next generation.",requested:false},
  {name:"Marcus Webb",role:"E-commerce Operator",av:"MW",sessions:89,rating:4.8,tags:["DTC","Shopify"],bio:"Scaled 4 brands past $1M.",requested:false},
  {name:"Destiny Okafor",role:"Head of Growth, Google",av:"DO",sessions:203,rating:5.0,tags:["Growth","Brand"],bio:"Obsessed with sustainable distribution.",requested:false},
];
const EVENTS=[
  {id:1,title:"Founder Fireside: From Idea to First $10K",host:"Alexis Chen",date:"Apr 26",time:"7:00 PM EST",type:"Virtual",tag:"Finance",spots:48,attending:12,going:false,desc:"A candid conversation about the messy first steps."},
  {id:2,title:"fear.social Meetup — Denver, CO",host:"fear.social Team",date:"May 3",time:"6:30 PM MT",type:"In-Person",tag:"Networking",spots:30,attending:24,going:false,desc:"IRL founder night. Good people, no pitch decks."},
  {id:3,title:"Build in Public: Live Product Teardown",host:"Marcus Webb",date:"May 10",time:"5:00 PM EST",type:"Virtual",tag:"Tech",spots:200,attending:89,going:false,desc:"We'll dissect 3 live products on stream."},
];
const DEALS=[
  {id:1,title:"Fractional growth lead",company:"Northstar AI",budget:"$4K/mo",tag:"Growth",desc:"Help a seed-stage AI team build the first repeatable acquisition channel."},
  {id:2,title:"Founding designer",company:"LoopCart",budget:"Equity + cash",tag:"Tech",desc:"Own product and brand design for a commerce workflow startup."},
  {id:3,title:"Beta customers wanted",company:"Atlas Health",budget:"Free pilot",tag:"Health",desc:"Mental wellness team looking for 10 founder-led companies to pilot."},
];
const GROUPS=[
  {id:1,name:"First 100 Customers",members:1284,active:"21 active now",desc:"Tactics, teardowns, and distribution experiments."},
  {id:2,name:"Solo Founders",members:936,active:"14 active now",desc:"Build rhythm, accountability, and emotional support."},
  {id:3,name:"Fundraising Room",members:611,active:"8 active now",desc:"Warm intros, deck critique, and investor updates."},
];
const INITIAL_MESSAGES=[
  {id:1,name:"Sofia R.",av:"SR",online:true,thread:["Loved your build-in-public post.", "Want to compare launch notes this week?"],draft:""},
  {id:2,name:"Ethan M.",av:"EM",online:false,thread:["I saw your post about fundraising.", "Happy to send over our angel update template."],draft:""},
  {id:3,name:"Aisha P.",av:"AP",online:true,thread:["That mentor session was excellent.", "I booked Alexis next week too."],draft:""},
];

function Navbar({view,setView,screen,setScreen,notify}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  if(screen==="app") return(
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 40px",display:"flex",alignItems:"center",height:64,gap:8}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:21,color:C.text,letterSpacing:0,marginRight:32,cursor:"pointer"}} onClick={()=>setScreen("landing")}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
      <div style={{display:"flex",gap:2}}>
        {["feed","discover","events","mentors","messages"].map(v=>(
          <button key={v} onClick={()=>setView(v)} className="bs nl" style={{background:view===v?C.aLight:"none",border:"none",padding:"7px 13px",fontSize:13,fontWeight:view===v?700:500,color:view===v?C.accent:C.muted,borderRadius:8,textTransform:"capitalize",transition:"all 0.15s"}}>{v}</button>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={()=>notify("4 new notifications","info")} className="bs" style={{background:"none",border:"none",fontSize:19,cursor:"pointer",position:"relative"}}>
          🔔<span style={{position:"absolute",top:-3,right:-3,width:16,height:16,background:C.coral,borderRadius:"50%",fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>4</span>
        </button>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,color:C.muted,cursor:"pointer"}} className="bs">Sign out</button>
        <Av i="YO" size={36} grad online style={{cursor:"pointer"}}/>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(13,15,20,0.97)":"transparent",backdropFilter:scrolled?"blur(24px)":"none",borderBottom:scrolled?`1px solid rgba(255,255,255,0.07)`:"none",padding:"0 48px",display:"flex",alignItems:"center",height:68,transition:"all 0.3s"}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:22,color:"#fff",letterSpacing:0,flex:1}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
      <div style={{display:"flex",gap:4,marginRight:32}}>
        {["Features","Mentors","Community","Pricing"].map(l=>(
          <button key={l} className="nl bs" style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",fontSize:14,fontWeight:500,padding:"7px 13px",cursor:"pointer",borderRadius:8}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setScreen("signup")} className="bs" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 18px",color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Log in</button>
        <GBtn sm onClick={()=>setScreen("signup")} style={{padding:"8px 20px"}}>Join Free →</GBtn>
      </div>
    </div>
  );
}

function LandingPage({setScreen,notify}){
  const [email,setEmail]=useState("");
  const [joined,setJoined]=useState(false);
  const [count,setCount]=useState(2847);
  useEffect(()=>{const t=setInterval(()=>setCount(c=>c+Math.floor(Math.random()*2)),8000);return()=>clearInterval(t);},[]);
  const joinWaitlist=async()=>{
    if(!email)return notify("Enter your email first","error");
    try{
      await api("/waitlist",{method:"POST",body:JSON.stringify({email})});
      setJoined(true);
    }catch(err){
      notify(err.message||"Could not save email","error");
    }
  };
  const ticker=["Maya raised $50K · ","Jordan found her co-founder · ","Raj hit $100K ARR · ","Priya launched her 2nd company · ","Cameron got into YC · ","Sofia closed her seed round · "];
  return(
    <div style={{background:C.dark,minHeight:"100vh",overflowX:"hidden"}}>
      <div style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"130px 32px 90px",textAlign:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle, rgba(22,199,78,0.09) 0%, transparent 68%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(90deg, transparent, rgba(22,199,78,0.5), transparent)"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"rgba(22,199,78,0.07)",border:"1px solid rgba(22,199,78,0.2)",borderRadius:22,padding:"7px 18px",marginBottom:38,cursor:"pointer"}} className="bs fu" onClick={()=>setScreen("signup")}>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:13,fontWeight:600,color:C.accent}}>{count.toLocaleString()} founders building right now</span>
          <span style={{fontSize:11,color:"rgba(22,199,78,0.5)"}}>→</span>
        </div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(44px,4.75rem,76px)",fontWeight:700,color:"#fff",lineHeight:1.12,letterSpacing:0,marginBottom:30,maxWidth:1000}} className="fu">
          Empowering<br/><span style={GRT}>tomorrow's founders</span><br/>today.
        </h1>
        <p style={{fontSize:19,color:"rgba(255,255,255,0.48)",lineHeight:1.8,maxWidth:540,marginBottom:56}} className="fu">
          Connect with driven founders. Get real mentorship. Build in public. Fear is just the beginning.
        </p>
        {joined?(
          <div style={{display:"flex",alignItems:"center",gap:16,background:"rgba(22,199,78,0.07)",border:"1px solid rgba(22,199,78,0.2)",borderRadius:18,padding:"22px 36px",animation:"popIn 0.3s ease"}}>
            <span style={{fontSize:36}}>🌱</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:19}}>You're on the list.</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginTop:3}}>Check your inbox — we'll be in touch soon.</div>
            </div>
            <GBtn sm onClick={()=>setScreen("signup")} style={{marginLeft:16}}>Enter App →</GBtn>
          </div>
        ):(
          <div style={{display:"flex",gap:10,maxWidth:560,width:"100%"}} className="fu">
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinWaitlist()} placeholder="you@example.com" className="if" style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"15px 20px",color:"#fff",fontSize:16,transition:"all 0.2s"}}/>
            <GBtn lg onClick={joinWaitlist} style={{whiteSpace:"nowrap"}}>Get Early Access →</GBtn>
          </div>
        )}
        <div style={{fontSize:12,color:"rgba(255,255,255,0.22)",marginTop:16}}>No credit card · Free forever · 30 second signup</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginTop:60}} className="fu">
          <div style={{display:"flex"}}>{["MK","JL","PS","CT","SR","EM"].map((ini,idx)=><div key={ini} style={{width:40,height:40,borderRadius:"50%",background:GR,border:"2.5px solid #0C0D10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",marginLeft:idx===0?0:-13}}>{ini}</div>)}</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",fontWeight:600}}>Joined by {count.toLocaleString()} founders</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.28)"}}>From 40+ countries · Growing daily</div>
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(22,199,78,0.02)",padding:"14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",width:"max-content"}} className="ticker">
          {[...ticker,...ticker].map((t,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap",paddingRight:4}}><span style={{color:C.accent}}>✦</span> {t}</span>)}
        </div>
      </div>
      <div style={{padding:"110px 52px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:76}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>The Platform</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,3.6rem,58px)",fontWeight:700,color:"#fff",letterSpacing:0,marginBottom:18}}>Built for the founders<br/>of tomorrow.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[["🤝","Real Connections","Find co-founders and collaborators who get what you're going through."],["🧠","Mentor Access","1:1 sessions with verified founders who've raised, scaled, and exited."],["📣","Build in Public","Share wins and struggles. The community shows up every single time."],["💼","Opportunities","Co-founder matching, jobs, internships — curated for ambitious founders."],["📅","Events","IRL meetups and virtual firesides. We bring the community to life."],["⚡","FEAR Pro — $9/mo","Unlimited mentor sessions, verified badge, exclusive events.",true]].map(([icon,title,desc,pro],i)=>(
            <div key={i} className="ch" style={{background:C.dCard,border:`1px solid ${C.dBorder}`,borderRadius:20,padding:"30px 26px"}}>
              <div style={{width:52,height:52,borderRadius:15,background:pro?GR:"rgba(22,199,78,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:22}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:18,color:"#fff",marginBottom:10}}>{title}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.42)",lineHeight:1.72}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.dCard,borderTop:`1px solid ${C.dBorder}`,borderBottom:`1px solid ${C.dBorder}`,padding:"64px 52px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
          {[["2,847+","Active Founders"],["40+","Countries"],["$2.4M","Raised by Members"],["142","Mentor Sessions/mo"],["98%","Would Recommend"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center",padding:"28px 16px"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:42,fontWeight:700,letterSpacing:0,...GRT}}>{n}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:7,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"110px 52px",maxWidth:1200,margin:"0 auto"}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(30px,3rem,48px)",fontWeight:700,color:"#fff",letterSpacing:0,textAlign:"center",marginBottom:64}}>"It changed everything."</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[{q:"Found my co-founder in two weeks. We're now at $8K MRR and just closed our pre-seed.",name:"Sofia R.",stage:"Food · Launched",av:"SR"},{q:"The mentors actually reply and care. That's rare. This platform is rare.",name:"Raj K.",stage:"Health · Launched",av:"RK"},{q:"Three months on fear.social: a community, a co-founder, and paying customers.",name:"Cameron T.",stage:"Tech · Building",av:"CT"}].map((t,i)=>(
            <div key={i} className="ch" style={{background:"rgba(255,255,255,0.025)",borderRadius:20,padding:"30px",border:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:40,color:C.accent,marginBottom:20,lineHeight:1}}>"</div>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.75)",lineHeight:1.8,marginBottom:24,fontStyle:"italic"}}>{t.q}</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}><Av i={t.av} size={40} grad/><div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{t.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>{t.stage}</div></div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.dCard,borderTop:`1px solid ${C.dBorder}`,padding:"110px 52px"}}>
        <div style={{maxWidth:880,margin:"0 auto",textAlign:"center"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(30px,3rem,48px)",fontWeight:700,color:"#fff",letterSpacing:0,marginBottom:56}}>Start free. Upgrade when ready.</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left"}}>
            {[{name:"Free",price:"$0",period:"forever",features:["Social feed & posts","Discover & connect","Events access","DMs","1 mentor intro/month"],grad:false},{name:"FEAR Pro",price:"$9",period:"per month",features:["Everything in Free","Unlimited mentor sessions","Verified founder badge","Full job board","Exclusive Pro events"],grad:true}].map((p,i)=>(
              <div key={i} className="ch" style={{background:p.grad?"transparent":C.dark,border:`1px solid ${p.grad?"rgba(22,199,78,0.4)":C.dBorder}`,borderRadius:24,padding:"38px 34px",position:"relative",overflow:"hidden"}}>
                {p.grad&&<div style={{position:"absolute",inset:0,background:GR2,opacity:0.4,borderRadius:24}}/>}
                <div style={{position:"relative"}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:p.grad?C.accent:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:10}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:30}}><span style={{fontFamily:"Georgia,serif",fontSize:54,fontWeight:700,color:"#fff"}}>{p.price}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.3)"}}>/{p.period}</span></div>
                  <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:34}}>
                    {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:11}}><span style={{width:20,height:20,borderRadius:"50%",background:p.grad?"rgba(22,199,78,0.18)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.accent,fontWeight:700,flexShrink:0}}>✓</span><span style={{fontSize:14,color:"rgba(255,255,255,0.62)"}}>{f}</span></div>)}
                  </div>
                  {p.grad?<GBtn onClick={()=>setScreen("signup")} full>Upgrade to Pro →</GBtn>:<GhostBtn onClick={()=>setScreen("signup")} style={{width:"100%",justifyContent:"center"}}>Get Started →</GhostBtn>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"110px 52px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(22,199,78,0.06) 0%, transparent 68%)",pointerEvents:"none"}}/>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(40px,4.75rem,76px)",fontWeight:700,color:"#fff",letterSpacing:0,marginBottom:20,position:"relative"}}>Stop building<br/><span style={GRT}>alone.</span></h2>
        <p style={{fontSize:17,color:"rgba(255,255,255,0.38)",marginBottom:48,position:"relative"}}>Your community is already here. Join them.</p>
        <GBtn lg onClick={()=>setScreen("signup")} style={{position:"relative"}} className="glow">Join fear.social — Free →</GBtn>
      </div>
      <div style={{borderTop:`1px solid ${C.dBorder}`,padding:"32px 52px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:18,color:"#fff"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.22)"}}>© 2026 fear.social · Empowering tomorrow's founders today.</div>
        <div style={{display:"flex",gap:20}}>{["Privacy","Terms","Contact"].map(l=><span key={l} style={{fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl">{l}</span>)}</div>
      </div>
    </div>
  );
}

function FeedView({notify}){
  const [posts,setPosts]=useState(POSTS);
  const [filter,setFilter]=useState("All");
  const [text,setText]=useState("");
  const [expandComments,setExpandComments]=useState({});
  const [commentInputs,setCommentInputs]=useState({});
  const toggleLike=id=>setPosts(ps=>ps.map(p=>p.id===id?{...p,likes:p.liked?p.likes-1:p.likes+1,liked:!p.liked}:p));
  const toggleSave=id=>{setPosts(ps=>ps.map(p=>p.id===id?{...p,saved:!p.saved}:p));notify("Post saved!");};
  const addComment=id=>{const txt=commentInputs[id];if(!txt?.trim())return;setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,{user:"You",av:"YO",text:txt,time:"Just now"}]}:p));setCommentInputs(ci=>({...ci,[id]:""}));notify("Comment posted!");};
  const submitPost=()=>{if(!text.trim())return;setPosts(ps=>[{id:Date.now(),user:"You",handle:"@yourhandle",av:"YO",tag:"Tech",stage:"Building",time:"Just now",content:text,likes:0,comments:[],saved:false,liked:false,isNew:true},...ps]);setText("");notify("Post published! 🚀");};
  return(
    <div style={{display:"grid",gridTemplateColumns:"260px 1fr 300px",gap:24,padding:"32px 40px",maxWidth:1280,margin:"0 auto",alignItems:"start"}}>
      <div style={{position:"sticky",top:80,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}><Av i="YO" size={50} grad online/><div><div style={{fontWeight:700,color:C.text,fontSize:15}}>Your Name</div><div style={{fontSize:12,color:C.muted}}>@yourhandle · Denver, CO</div></div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:`1px solid ${C.border}`,paddingTop:14}}>
            {[["12","Posts"],["248","Followers"],["91","Following"]].map(([v,l])=><div key={l} style={{textAlign:"center",cursor:"pointer",padding:"8px 4px",borderRadius:8}} className="uh" onClick={()=>notify(`${l}: ${v}`)}><div style={{fontWeight:700,fontSize:18,color:C.text}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{l}</div></div>)}
          </div>
        </div>
        <div style={{background:GR,borderRadius:16,padding:20}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",marginBottom:6}}>FEAR Pro</div>
          <div style={{fontWeight:700,color:"#fff",fontSize:15,marginBottom:6,lineHeight:1.4}}>Unlock mentors & more</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:16}}>$9/month. Cancel anytime.</div>
          <button onClick={()=>notify("Redirecting to Pro upgrade! ⚡")} className="bs" style={{background:"#fff",color:C.accent,border:"none",borderRadius:8,padding:"10px 16px",fontWeight:800,fontSize:13,width:"100%",cursor:"pointer"}}>Upgrade →</button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:12}}>🔥 Trending</div>
          {["#BuildInPublic","#FounderLife","#FirstRevenue","#CoFounderSearch"].map((t,i)=>(
            <div key={t} onClick={()=>notify(`Filtering by ${t}`)} style={{display:"flex",justifyContent:"space-between",marginBottom:10,cursor:"pointer",padding:"4px 6px",borderRadius:7}} className="uh">
              <span style={{fontSize:13,fontWeight:600,color:C.accent}}>{t}</span>
              <span style={{fontSize:11,color:C.dim}}>{[842,634,521,418][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:20,marginBottom:20}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
            <Av i="YO" size={42} grad/>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What are you building today?" className="if" style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",fontSize:14,color:C.text,resize:"none",minHeight:88,fontFamily:"inherit",transition:"all 0.2s",width:"100%"}}/>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            {[["📷","Photo"],["🎥","Video"],["📊","Poll"]].map(([icon,label])=>(
              <button key={label} onClick={()=>notify(`${label} coming soon`,"info")} className="bs" style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:5,color:C.muted,fontSize:12,padding:"5px 8px",borderRadius:7,cursor:"pointer"}}><span>{icon}</span>{label}</button>
            ))}
            <GBtn sm onClick={submitPost} style={{marginLeft:"auto",opacity:text.trim()?1:0.5}}>Publish</GBtn>
          </div>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:18,overflowX:"auto"}}>
          {["All","Tech","Finance","Fashion","Food","Health"].map(t=>(
            <button key={t} onClick={()=>setFilter(t)} className="bs" style={{background:filter===t?C.accent:"#fff",color:filter===t?"#fff":C.muted,border:`1.5px solid ${filter===t?C.accent:C.border}`,borderRadius:8,padding:"6px 16px",fontSize:13,fontWeight:600,whiteSpace:"nowrap",transition:"all 0.15s",cursor:"pointer",flexShrink:0}}>{t}</button>
          ))}
        </div>
        {posts.filter(p=>filter==="All"||p.tag===filter).map(p=>(
          <div key={p.id} className="ch" style={{background:C.card,border:`1px solid ${p.isNew?"rgba(22,199,78,0.4)":C.border}`,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
            <div style={{padding:"18px 20px 14px"}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <Av i={p.av} size={44} grad={p.av==="YO"} online={["MK","SR"].includes(p.av)}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:15,color:C.text}}>{p.user}</span>
                    <Tag label={p.stage} style={SS[p.stage]}/>
                    {p.isNew&&<Tag label="New" style={{background:C.aLight,color:C.accent}}/>}
                  </div>
                  <div style={{fontSize:12,color:C.dim,marginTop:2}}>{p.handle} · {p.time} ago</div>
                </div>
                <IT label={p.tag}/>
              </div>
              <p style={{fontSize:15,color:C.tSoft,lineHeight:1.78}}>{p.content}</p>
            </div>
            {p.img&&<img src={p.img} alt="" style={{width:"100%",maxHeight:290,objectFit:"cover",display:"block"}}/>}
            <div style={{padding:"11px 20px",display:"flex",alignItems:"center",gap:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>toggleLike(p.id)} className="bs" style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:6,color:p.liked?C.coral:C.muted,fontSize:14,fontWeight:p.liked?700:400,cursor:"pointer"}}>
                <span style={{fontSize:19,display:"inline-block",animation:p.liked?"heartbeat 0.4s ease":"none"}}>{p.liked?"♥":"♡"}</span>{p.likes}
              </button>
              <button onClick={()=>setExpandComments(ec=>({...ec,[p.id]:!ec[p.id]}))} className="bs" style={{background:"none",border:"none",color:expandComments[p.id]?C.accent:C.muted,fontSize:14,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>💬 {p.comments.length}</button>
              <button onClick={()=>notify("Link copied! 🔗")} className="bs" style={{background:"none",border:"none",color:C.muted,fontSize:14,marginLeft:"auto",cursor:"pointer"}}>Share ↗</button>
              <button onClick={()=>toggleSave(p.id)} className="bs" style={{background:"none",border:"none",color:p.saved?C.accent:C.dim,fontSize:18,cursor:"pointer"}}>{p.saved?"⊙":"○"}</button>
            </div>
            {expandComments[p.id]&&(
              <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 20px",background:C.bg,animation:"slideDown 0.2s ease"}}>
                {p.comments.map((cm,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                    <Av i={cm.av} size={30} style={{fontSize:10}}/>
                    <div style={{flex:1,background:"#fff",borderRadius:12,padding:"9px 13px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{cm.user} <span style={{color:C.dim,fontWeight:400}}>· {cm.time}</span></div>
                      <div style={{fontSize:13,color:C.tSoft,lineHeight:1.6}}>{cm.text}</div>
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",gap:10,marginTop:8}}>
                  <Av i="YO" size={30} style={{fontSize:10}}/>
                  <div style={{flex:1,display:"flex",gap:8}}>
                    <input value={commentInputs[p.id]||""} onChange={e=>setCommentInputs(ci=>({...ci,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(p.id)} placeholder="Write a comment..." className="if" style={{flex:1,background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 13px",fontSize:13,color:C.text,transition:"all 0.2s"}}/>
                    <button onClick={()=>addComment(p.id)} className="bs" style={{background:GR,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>↑</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{position:"sticky",top:80,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:16}}>Who to connect with</div>
          {PEOPLE.slice(0,4).map((u,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"6px",borderRadius:10}} className="uh">
              <Av i={u.av} size={36} online={u.online}/>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:C.text}}>{u.name}</div><div style={{fontSize:11,color:C.dim}}>{u.loc}</div></div>
              <button onClick={()=>notify(`Connected with ${u.name}! 🤝`)} className="bs" style={{background:C.aLight,color:C.accent,border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Follow</button>
            </div>
          ))}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14}}>📅 Upcoming Events</div>
          {EVENTS.slice(0,2).map(e=>(
            <div key={e.id} style={{marginBottom:13,paddingBottom:13,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} className="uh" onClick={()=>notify(`RSVP to: ${e.title}`)}>
              <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{e.title}</div>
              <div style={{fontSize:11,color:C.dim}}>{e.date} · {e.type} · {e.attending} attending</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignupPage({setScreen,notify,setProfile}){
  const [form,setForm]=useState({name:"",email:"",stage:""});
  const [step,setStep]=useState(0);
  const valid=form.name&&form.email&&form.stage;
  const enterApp=async()=>{
    const nextProfile={name:form.name,email:form.email,stage:form.stage};
    setProfile(p=>({...p,...nextProfile}));
    try{
      const saved=await api("/profile",{method:"PUT",body:JSON.stringify({profile:nextProfile})});
      setProfile(p=>({...p,...saved.profile}));
    }catch{}
    setScreen("app");
    notify("Welcome to fear.social! 🚀");
  };
  if(step===1) return(
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
    <div style={{minHeight:"100vh",background:C.dark,display:"flex"}}>
      <div style={{flex:1,background:GR2,display:"flex",alignItems:"center",justifyContent:"center",padding:72}}>
        <div style={{maxWidth:520}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:56,fontWeight:700,color:"#fff",letterSpacing:0,lineHeight:1.02,marginBottom:28}}>The community<br/>you've been<br/>looking for.</div>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.42)",lineHeight:1.85,marginBottom:44}}>2,847 founders. 40+ countries. One platform built for you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["🤝","Connect with founders at your exact stage"],["🧠","1:1 sessions with verified mentors"],["📣","Build in public with real support"],["⚡","Find co-founders, jobs, and gigs"]].map(([icon,text])=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
                <span style={{fontSize:15,color:"rgba(255,255,255,0.55)"}}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{width:520,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:56}}>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Create your profile</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>30 seconds. No spam.</div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {[["Full Name","text","Your name","name"],["Email","email","you@example.com","email"]].map(([label,type,ph,key])=>(
              <div key={key}>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>{label}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${form[key]?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
              </div>
            ))}
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Where are you?</label>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {["I have an idea","I'm actively building","I've already launched"].map(s=>(
                  <button key={s} onClick={()=>setForm(f=>({...f,stage:s}))} className="bs" style={{background:form.stage===s?C.accent:C.bg,border:`1.5px solid ${form.stage===s?C.accent:C.border}`,borderRadius:11,padding:"13px 16px",textAlign:"left",color:form.stage===s?"#fff":C.tSoft,fontSize:14,fontWeight:form.stage===s?600:400,transition:"all 0.15s",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                    <span style={{width:19,height:19,borderRadius:"50%",border:`2px solid ${form.stage===s?"rgba(255,255,255,0.5)":C.dim}`,background:form.stage===s?"rgba(255,255,255,0.2)":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {form.stage===s&&<span style={{width:7,height:7,borderRadius:"50%",background:"#fff",display:"block"}}/>}
                    </span>{s}
                  </button>
                ))}
              </div>
            </div>
            <GBtn full onClick={()=>valid&&setStep(1)} style={{opacity:valid?1:0.45,pointerEvents:valid?"auto":"none"}}>Join the Community →</GBtn>
            <div style={{fontSize:12,color:C.dim,textAlign:"center"}}>Free forever · No credit card</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryView({view,notify}){
  const content = {
    discover: {
      title: "Discover founders",
      eyebrow: "People",
      items: PEOPLE,
      render: (u)=>(
        <div key={u.id} className="ch" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <Av i={u.av} size={48} online={u.online}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,color:C.text,fontSize:16}}>{u.name}</div>
              <div style={{fontSize:12,color:C.dim}}>{u.handle} · {u.loc}</div>
            </div>
            <IT label={u.industry}/>
          </div>
          <p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginBottom:16}}>{u.bio}</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:C.muted}}>{u.followers.toLocaleString()} followers · {u.mutual} mutual</span>
            <GBtn sm onClick={()=>notify(`Connected with ${u.name}!`)}>Connect</GBtn>
          </div>
        </div>
      )
    },
    events: {
      title: "Upcoming events",
      eyebrow: "Events",
      items: EVENTS,
      render: (event)=>(
        <div key={event.id} className="ch" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:12}}>
            <div>
              <div style={{fontWeight:800,color:C.text,fontSize:17,marginBottom:5}}>{event.title}</div>
              <div style={{fontSize:12,color:C.dim}}>Hosted by {event.host}</div>
            </div>
            <IT label={event.tag}/>
          </div>
          <p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginBottom:18}}>{event.desc}</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:C.muted}}>{event.date} · {event.time} · {event.type}</span>
            <GBtn sm onClick={()=>notify(`RSVP saved for ${event.title}`)}>RSVP</GBtn>
          </div>
        </div>
      )
    },
    mentors: {
      title: "Verified mentors",
      eyebrow: "Mentors",
      items: MENTORS,
      render: (mentor)=>(
        <div key={mentor.name} className="ch" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <Av i={mentor.av} size={50} grad/>
            <div>
              <div style={{fontWeight:800,color:C.text,fontSize:17}}>{mentor.name}</div>
              <div style={{fontSize:12,color:C.dim}}>{mentor.role}</div>
            </div>
          </div>
          <p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginBottom:16}}>{mentor.bio}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
            {mentor.tags.map(tag=><Tag key={tag} label={tag} style={{background:C.aLight,color:C.accent}}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:C.muted}}>★ {mentor.rating} · {mentor.sessions} sessions</span>
            <GBtn sm onClick={()=>notify(`Mentor request sent to ${mentor.name}`)}>Request</GBtn>
          </div>
        </div>
      )
    },
    messages: {
      title: "Founder messages",
      eyebrow: "Inbox",
      items: PEOPLE.slice(0,3),
      render: (u,idx)=>(
        <div key={u.id} className="ch" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,display:"flex",alignItems:"center",gap:14}}>
          <Av i={u.av} size={44} online={u.online}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:C.text,fontSize:15}}>{u.name}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{["Want to compare launch notes this week?","I saw your post about fundraising.","That mentor session was excellent."][idx]}</div>
          </div>
          <GBtn sm onClick={()=>notify(`Opening chat with ${u.name}`)}>Reply</GBtn>
        </div>
      )
    }
  }[view];

  return(
    <div style={{padding:"40px",maxWidth:1080,margin:"0 auto"}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{content.eyebrow}</div>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:42,lineHeight:1.05,letterSpacing:0,color:C.text,marginBottom:28}}>{content.title}</h1>
      <div style={{display:"grid",gridTemplateColumns:view==="messages"?"1fr":"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
        {content.items.map(content.render)}
      </div>
    </div>
  );
}

function PlatformApp({notify,setScreen,profile,setProfile}){
  const [view,setView]=useLocalState("fear-view","feed");
  const [posts,setPosts]=useLocalState("fear-posts",POSTS);
  const [people,setPeople]=useLocalState("fear-people",PEOPLE);
  const [events,setEvents]=useLocalState("fear-events",EVENTS);
  const [mentors,setMentors]=useLocalState("fear-mentors",MENTORS);
  const [messages,setMessages]=useLocalState("fear-messages",INITIAL_MESSAGES);
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
  },[setEvents,setMentors,setMessages,setPeople,setPosts,setProfile]);
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
  const initials=(profile.name||"Your Name").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()||"YO";
  const visiblePosts=posts.filter(p=>(filter==="All"||p.tag===filter)&&(query.trim()===""||`${p.user} ${p.content} ${p.tag}`.toLowerCase().includes(query.toLowerCase())));
  const unread=messages.reduce((n,m)=>n+(m.thread.length>2?1:0),0);
  const statCards=[
    ["Posts",posts.filter(p=>p.av==="YO").length+12],
    ["Following",people.filter(p=>p.connected).length+91],
    ["Saved",posts.filter(p=>p.saved).length],
    ["RSVPs",events.filter(e=>e.going).length],
  ];
  const publish=async()=>{
    if(!composer.trim())return notify("Write something before publishing","error");
    const optimistic={
      id:Date.now(),user:profile.name||"Your Name",handle:profile.handle||"@yourhandle",av:"YO",
      tag:profile.industry||"Tech",stage:profile.stage?.includes("launched")?"Launched":"Building",
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
      return {...m,thread:[...m.thread,m.draft.trim()],draft:""};
    }));
    try{await callBackend(`/messages/${id}/send`,{method:"POST",body:JSON.stringify({text})});}catch{}
  };
  const saveProfile=async()=>{
    setProfile(profileDraft);
    setEditProfile(false);
    try{
      const data=await callBackend("/profile",{method:"PUT",body:JSON.stringify({profile:profileDraft})});
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
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(18px)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",minHeight:68,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div onClick={()=>setView("feed")} style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:C.text,cursor:"pointer",whiteSpace:"nowrap"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div style={{display:"flex",gap:3,overflowX:"auto",flex:1}}>
          {tabs.map(([id,label])=><button key={id} onClick={()=>setView(id)} className="bs nl" style={{background:view===id?C.aLight:"transparent",border:"none",borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:view===id?800:600,color:view===id?C.accent:C.muted,whiteSpace:"nowrap"}}>{label}{id==="messages"&&unread>0?` ${unread}`:""}</button>)}
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search founders, posts, tags" className="if" style={{width:240,maxWidth:"32vw",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:C.text}}/>
        <button onClick={()=>notify(`${unread||4} notifications`,"info")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",position:"relative"}}>🔔<span style={{position:"absolute",top:-6,right:-6,width:17,height:17,borderRadius:"50%",background:C.coral,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread||4}</span></button>
        <button onClick={()=>setEditProfile(true)} style={{background:"none",border:"none"}}><Av i={initials} size={38} grad online/></button>
        <button onClick={()=>setScreen("landing")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,color:C.muted,fontWeight:700}}>Sign out</button>
      </div>
      <div style={{maxWidth:1320,margin:"0 auto",padding:"28px"}}>
        {view==="feed"&&(
          <div style={{display:"grid",gridTemplateColumns:"270px minmax(0,1fr) 310px",gap:22,alignItems:"start"}}>
            <aside style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}><Av i={initials} size={54} grad online/><div><div style={{fontWeight:900,color:C.text}}>{profile.name||"Your Name"}</div><div style={{fontSize:12,color:C.dim}}>{profile.handle||"@yourhandle"} · {profile.location||"Denver, CO"}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{statCards.map(([k,v])=><div key={k} className="uh" style={{background:C.bg,borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:C.text}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{k}</div></div>)}</div>
              </div>
              <div style={{background:GR,borderRadius:18,padding:20,color:"#fff"}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,opacity:.65,marginBottom:8}}>FEAR PRO</div>
                <div style={{fontWeight:900,fontSize:18,marginBottom:7}}>Founder operating system</div>
                <div style={{fontSize:13,opacity:.72,lineHeight:1.6,marginBottom:16}}>Mentors, rooms, warm intros, and weekly accountability.</div>
                <button onClick={()=>notify("Pro checkout coming next")} className="bs" style={{background:"#fff",border:"none",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.accent,width:"100%"}}>Upgrade</button>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
                <div style={{fontWeight:900,fontSize:14,marginBottom:12}}>Live rooms</div>
                {GROUPS.map(g=><div key={g.id} className="uh" onClick={()=>notify(`Joined ${g.name}`)} style={{padding:"9px 6px",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{g.name}</div><div style={{fontSize:11,color:C.dim}}>{g.active}</div></div>)}
              </div>
            </aside>
            <main>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,padding:20,marginBottom:18}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av i={initials} size={44} grad/>
                  <div style={{flex:1}}>
                    <textarea value={composer} onChange={e=>setComposer(e.target.value)} placeholder="Share a win, ask for feedback, or post what you're building..." className="if" style={{width:"100%",minHeight:104,resize:"vertical",background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:14,fontSize:14,color:C.text,lineHeight:1.6}}/>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}>
                      {["Update","Ask","Milestone","Hiring","Launch"].map(t=><button key={t} onClick={()=>setPostType(t)} className="bs" style={{background:postType===t?C.aLight:"#fff",border:`1px solid ${postType===t?C.aSoft:C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:800,color:postType===t?C.accent:C.muted}}>{t}</button>)}
                      <GBtn sm onClick={publish} style={{marginLeft:"auto",opacity:composer.trim()?1:.55}}>Publish</GBtn>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>{["All","Tech","Finance","Fashion","Food","Health"].map(t=><button key={t} onClick={()=>setFilter(t)} className="bs" style={{background:filter===t?C.accent:"#fff",color:filter===t?"#fff":C.muted,border:`1px solid ${filter===t?C.accent:C.border}`,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:800,whiteSpace:"nowrap"}}>{t}</button>)}</div>
              {visiblePosts.map(p=>(
                <article key={p.id} className="ch" style={{background:C.card,border:`1px solid ${p.isNew?C.aSoft:C.border}`,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:20}}>
                    <div style={{display:"flex",gap:12,alignItems:"start",marginBottom:12}}>
                      <Av i={p.av} size={45} grad={p.av==="YO"} online={["MK","SR","YO"].includes(p.av)}/>
                      <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:C.text}}>{p.user}</b><Tag label={p.type||p.stage} style={{background:C.aLight,color:C.accent}}/><IT label={p.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{p.handle} · {p.time} ago</div></div>
                    </div>
                    <p style={{fontSize:15,color:C.tSoft,lineHeight:1.75}}>{p.content}</p>
                  </div>
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",gap:16,alignItems:"center"}}>
                    <button className="bs" onClick={()=>togglePostAction(p.id,"like")} style={{background:"none",border:"none",fontWeight:800,color:p.liked?C.coral:C.muted}}>{p.liked?"♥":"♡"} {p.likes}</button>
                    <button className="bs" onClick={()=>setOpenComments(o=>({...o,[p.id]:!o[p.id]}))} style={{background:"none",border:"none",fontWeight:800,color:openComments[p.id]?C.accent:C.muted}}>💬 {p.comments.length}</button>
                    <button className="bs" onClick={()=>{togglePostAction(p.id,"save");notify(p.saved?"Removed from saved":"Saved post");}} style={{background:"none",border:"none",fontWeight:800,color:p.saved?C.accent:C.muted,marginLeft:"auto"}}>{p.saved?"Saved":"Save"}</button>
                  </div>
                  {openComments[p.id]&&<div style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:16}}>{p.comments.map((c,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10}}><Av i={c.av} size={30}/><div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px",flex:1}}><b style={{fontSize:12}}>{c.user}</b><p style={{fontSize:13,color:C.tSoft,lineHeight:1.5}}>{c.text}</p></div></div>)}<div style={{display:"flex",gap:8}}><input value={commentInputs[p.id]||""} onChange={e=>setCommentInputs(ci=>({...ci,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(p.id)} placeholder="Write a comment..." className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}/><GBtn sm onClick={()=>addComment(p.id)}>Send</GBtn></div></div>}
                </article>
              ))}
            </main>
            <aside style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Suggested founders</b>{people.slice(0,4).map(p=><div key={p.id} className="uh" style={{display:"flex",gap:10,alignItems:"center",padding:"12px 4px"}}><Av i={p.av} size={36} online={p.online}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{p.name}</div><div style={{fontSize:11,color:C.dim}}>{p.industry} · {p.stage}</div></div><button onClick={()=>{connect(p.id);notify(`${p.connected?"Unfollowed":"Following"} ${p.name}`);}} style={{background:p.connected?C.accent:C.aLight,color:p.connected?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11}}>{p.connected?"Following":"Follow"}</button></div>)}</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Next events</b>{events.slice(0,3).map(e=><div key={e.id} className="uh" style={{padding:"12px 4px"}}><div style={{fontSize:13,fontWeight:800}}>{e.title}</div><div style={{fontSize:11,color:C.dim,margin:"3px 0 8px"}}>{e.date} · {e.attending} going</div><button onClick={()=>{rsvp(e.id);notify(`${e.going?"Removed RSVP":"RSVP confirmed"}`);}} style={{background:e.going?C.accent:C.aLight,color:e.going?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11}}>{e.going?"Going":"RSVP"}</button></div>)}</div>
            </aside>
          </div>
        )}
        {view==="discover"&&<Directory title="Discover founders" eyebrow="Network" items={people.filter(p=>`${p.name} ${p.industry} ${p.bio}`.toLowerCase().includes(query.toLowerCase()))} render={p=><div key={p.id} className="ch" style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}><Av i={p.av} size={52} online={p.online}/><div style={{flex:1}}><b>{p.name}</b><div style={{fontSize:12,color:C.dim}}>{p.handle} · {p.loc}</div></div><IT label={p.industry}/></div><p style={bodyCopy}>{p.bio}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18}}><span style={{fontSize:12,color:C.muted}}>{p.followers.toLocaleString()} followers</span><GBtn sm onClick={()=>{connect(p.id);notify(`${p.connected?"Disconnected from":"Connected with"} ${p.name}`);}}>{p.connected?"Connected":"Connect"}</GBtn></div></div>}/>}
        {view==="events"&&<Directory title="Events and rooms" eyebrow="Calendar" items={events} render={e=><div key={e.id} className="ch" style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{e.title}</b><IT label={e.tag}/></div><p style={bodyCopy}>{e.desc}</p><div style={{fontSize:13,color:C.muted,margin:"16px 0"}}>{e.date} · {e.time} · {e.type} · {e.attending}/{e.spots} going</div><GBtn sm onClick={()=>{rsvp(e.id);notify(e.going?"RSVP removed":"RSVP confirmed");}}>{e.going?"Going":"RSVP"}</GBtn></div>}/>}
        {view==="mentors"&&<Directory title="Verified mentors" eyebrow="Mentors" items={mentors} render={m=><div key={m.name} className="ch" style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}><Av i={m.av} size={52} grad/><div><b>{m.name}</b><div style={{fontSize:12,color:C.dim}}>{m.role}</div></div></div><p style={bodyCopy}>{m.bio}</p><div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"16px 0"}}>{m.tags.map(t=><Tag key={t} label={t} style={{background:C.aLight,color:C.accent}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.muted}}>★ {m.rating} · {m.sessions} sessions</span><GBtn sm onClick={()=>{requestMentor(m.id||m.name);notify(m.requested?"Request withdrawn":"Mentor request sent");}}>{m.requested?"Requested":"Request"}</GBtn></div></div>}/>}
        {view==="messages"&&<MessagesView messages={messages} setMessages={setMessages} sendMessage={sendMessage}/>}
        {view==="groups"&&<Directory title="Founder groups" eyebrow="Rooms" items={GROUPS} render={g=><div key={g.id} className="ch" style={cardStyle}><b>{g.name}</b><p style={bodyCopy}>{g.desc}</p><div style={{fontSize:13,color:C.muted,margin:"14px 0"}}>{g.members.toLocaleString()} members · {g.active}</div><GBtn sm onClick={()=>notify(`Joined ${g.name}`)}>Join room</GBtn></div>}/>}
        {view==="opportunities"&&<Directory title="Opportunities" eyebrow="Market" items={DEALS} render={d=><div key={d.id} className="ch" style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{d.title}</b><IT label={d.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:4}}>{d.company} · {d.budget}</div><p style={bodyCopy}>{d.desc}</p><GBtn sm onClick={()=>notify(`Saved ${d.title}`)}>Save opportunity</GBtn></div>}/>}
        {view==="profile"&&<ProfilePanel profile={profile} setEditProfile={setEditProfile} stats={statCards}/>}
      </div>
      {editProfile&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.58)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setEditProfile(false)}><div style={{background:"#fff",borderRadius:22,padding:28,width:"min(520px,100%)",boxShadow:"0 30px 100px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}><SectionTitle eyebrow="Profile" title="Edit your founder card"/>{["name","handle","location","industry","bio"].map(k=><label key={k} style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>{k}<input value={profileDraft[k]||""} onChange={e=>setProfileDraft(p=>({...p,[k]:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>)}<div style={{display:"flex",gap:10,justifyContent:"end",marginTop:20}}><GhostBtn onClick={()=>setEditProfile(false)}>Cancel</GhostBtn><GBtn onClick={saveProfile}>Save profile</GBtn></div></div></div>}
    </div>
  );
}

const cardStyle={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22};
const bodyCopy={fontSize:14,color:C.tSoft,lineHeight:1.7,marginTop:12};
function Directory({eyebrow,title,items,render}){
  return <div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{eyebrow}</div><h1 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>{title}</h1><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{items.map(render)}</div></div>;
}
function MessagesView({messages,setMessages,sendMessage}){
  const [active,setActive]=useState(messages[0]?.id);
  const thread=messages.find(m=>m.id===active)||messages[0];
  return <div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Inbox</div><h1 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>Founder messages</h1><div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:18,minHeight:"70vh"}}><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:12}}>{messages.map(m=><button key={m.id} onClick={()=>setActive(m.id)} className="uh" style={{width:"100%",display:"flex",gap:12,alignItems:"center",padding:12,border:"none",background:active===m.id?C.aLight:"transparent",borderRadius:12,textAlign:"left"}}><Av i={m.av} size={40} online={m.online}/><div><div style={{fontWeight:900,color:C.text}}>{m.name}</div><div style={{fontSize:12,color:C.dim}}>{m.thread[m.thread.length-1]}</div></div></button>)}</div>{thread&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,display:"flex",flexDirection:"column"}}><div style={{display:"flex",gap:12,alignItems:"center",paddingBottom:14,borderBottom:`1px solid ${C.border}`}}><Av i={thread.av} size={44} online={thread.online}/><div><b>{thread.name}</b><div style={{fontSize:12,color:C.dim}}>{thread.online?"Online now":"Usually replies today"}</div></div></div><div style={{flex:1,padding:"20px 0",display:"flex",flexDirection:"column",gap:10}}>{thread.thread.map((msg,i)=><div key={i} style={{alignSelf:i%2?"flex-start":"flex-end",maxWidth:"70%",background:i%2?C.bg:C.accent,color:i%2?C.text:"#fff",borderRadius:14,padding:"10px 13px",fontSize:14,lineHeight:1.5}}>{msg}</div>)}</div><div style={{display:"flex",gap:10}}><input value={thread.draft} onChange={e=>setMessages(ms=>ms.map(m=>m.id===thread.id?{...m,draft:e.target.value}:m))} onKeyDown={e=>e.key==="Enter"&&sendMessage(thread.id)} placeholder={`Message ${thread.name}`} className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}/><GBtn onClick={()=>sendMessage(thread.id)}>Send</GBtn></div></div>}</div></div>;
}
function ProfilePanel({profile,setEditProfile,stats}){
  return <div style={{maxWidth:840}}><div style={{background:GR,borderRadius:24,padding:32,color:"#fff",marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:18}}><Av i={(profile.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()} size={72} style={{background:"#fff",color:C.accent}}/><div><h1 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0}}>{profile.name||"Your Name"}</h1><div style={{opacity:.75}}>{profile.handle||"@yourhandle"} · {profile.location||"Denver, CO"} · {profile.industry||"Tech"}</div></div><button onClick={()=>setEditProfile(true)} className="bs" style={{marginLeft:"auto",background:"#fff",color:C.accent,border:"none",borderRadius:10,padding:"10px 16px",fontWeight:900}}>Edit profile</button></div><p style={{marginTop:24,maxWidth:640,lineHeight:1.75,opacity:.82}}>{profile.bio||"Building in public, meeting ambitious founders, and turning fear into useful momentum."}</p></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>{stats.map(([k,v])=><div key={k} style={cardStyle}><div style={{fontSize:26,fontWeight:900,color:C.text}}>{v}</div><div style={{fontSize:12,color:C.muted}}>{k}</div></div>)}</div></div>;
}

export default function App(){
  const {toasts,notify,remove}=useToast();
  const [screen,setScreen]=useState("landing");
  const [profile,setProfile]=useLocalState("fear-profile",{
    name:"Your Name",
    handle:"@yourhandle",
    email:"",
    location:"Denver, CO",
    industry:"Tech",
    stage:"I'm actively building",
    bio:"Building in public, meeting ambitious founders, and turning fear into useful momentum.",
  });
  return(
    <>
      <style>{css}</style>
      <ToastCtx toasts={toasts} remove={remove}/>
      <div style={{minHeight:"100vh",background:screen==="app"?C.bg:C.dark}}>
        {screen!=="signup"&&screen!=="app"&&<Navbar view="feed" setView={()=>{}} screen={screen} setScreen={setScreen} notify={notify}/>}
        {screen==="landing"&&<LandingPage setScreen={setScreen} notify={notify}/>}
        {screen==="signup"&&<SignupPage setScreen={setScreen} notify={notify} setProfile={setProfile}/>}
        {screen==="app"&&<PlatformApp notify={notify} setScreen={setScreen} profile={profile} setProfile={setProfile}/>}
      </div>
    </>
  );
}
