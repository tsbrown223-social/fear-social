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
    Exploring:{bg:"#E8FBF0",color:"#14532D"}, Finance:{bg:"#E8FBF0",color:"#14532D"},
    Tech:{bg:"#EEF2FF",color:"#3730A3"}, "Brand Management":{bg:"#F4F0FF",color:"#5B21B6"},
    Fashion:{bg:"#FDF2F8",color:"#9D174D"}, Food:{bg:"#FFF7ED",color:"#C2410C"},
    Health:{bg:"#F0FDFA",color:"#0F766E"}, Psychology:{bg:"#ECFEFF",color:"#155E75"},
    Creative:{bg:"#FFF1F2",color:"#BE123C"}, Education:{bg:"#F0F9FF",color:"#0369A1"},
    Other:{bg:"#F3F4F6",color:"#6B7280"},
    Networking:{bg:"#FFF7ED",color:"#C2410C"}, Growth:{bg:"#F0FDFA",color:"#0F766E"},
  }
};
const fmt=n=>Number(n||0).toLocaleString();

const css = `
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;overflow-x:hidden;}
.a11y-large-text{font-size:112%;}
.a11y-large-text input,.a11y-large-text textarea,.a11y-large-text button{font-size:1rem!important;}
.a11y-high-contrast{filter:contrast(1.12);}
.a11y-reduce-motion *{animation:none!important;transition:none!important;scroll-behavior:auto!important;}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important;}}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
input,textarea,select{outline:none;font-family:inherit;}button{font-family:inherit;cursor:pointer;}::placeholder{color:${C.dim};}
button:disabled{cursor:not-allowed!important;filter:saturate(.75)!important;}
a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,[role="button"]:focus-visible,label.bs:focus-within{outline:3px solid rgba(22,199,78,.72)!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(22,199,78,.16)!important;}
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;}
.skip-link{position:fixed;left:16px;top:12px;z-index:10000;background:#fff;color:#0D0F14;border:2px solid #16C74E;border-radius:999px;padding:10px 16px;font-weight:900;transform:translateY(-160%);transition:transform .15s ease;text-decoration:none;}
.skip-link:focus{transform:translateY(0);}
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
.ch{box-shadow:0 10px 32px rgba(13,15,20,0.035);}
.bs{transition:all 0.15s ease;}.bs:hover{transform:translateY(-2px);filter:brightness(1.08);}.bs:active{transform:scale(0.96);}
.nl:hover{color:#16C74E!important;}
.if:focus{border-color:#16C74E!important;box-shadow:0 0 0 3px rgba(22,199,78,0.18)!important;}
input[type="search"]::-webkit-search-decoration,input[type="search"]::-webkit-search-cancel-button,input[type="search"]::-webkit-search-results-button,input[type="search"]::-webkit-search-results-decoration{display:none;}
.desktop-app-search{background-image:none!important;}
.uh:hover{background:rgba(22,199,78,0.06);border-radius:10px;}
.profile-link{cursor:pointer;border-radius:12px;}
.profile-link:focus-visible{outline:3px solid rgba(22,199,78,0.35);outline-offset:3px;}
.mobile-bottom-nav{display:none;}
.cookie-notice{left:auto!important;right:18px!important;bottom:18px!important;}
.cookie-card{max-width:330px!important;display:block!important;padding:15px!important;}
.cookie-actions{display:flex;margin-top:14px;}
.cookie-actions button{flex:1;}
.theme-toggle-label{display:inline;}
.verify-shell{background:radial-gradient(circle at 50% 0%, rgba(22,199,78,0.24), transparent 34%), #050506;}
.verify-card{background:linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));}
.verify-code-input{font-variant-numeric:tabular-nums;}
.theme-light{background:#F7F8FA;color:#0D0F14;}
.theme-light .landing-root{background:#F7F8FA!important;}
.theme-light .landing-hero{background:radial-gradient(circle at 50% 0%, rgba(22,199,78,0.12), transparent 48%), #F7F8FA!important;}
.theme-light .landing-hero h1,.theme-light .landing-platform h2,.theme-light .landing-launch h2,.theme-light .landing-cta h2{color:#0D0F14!important;}
.theme-light .landing-hero p{color:#44505F!important;}
.theme-light .landing-hero p:first-of-type{color:#0D0F14!important;}
.theme-light .landing-badge{background:#E8FBF0!important;border-color:#B8F5CE!important;}
.theme-light .landing-badge span:last-child{color:#0D0F14!important;}
.theme-light .landing-proof-row div:last-child div:first-child{color:#0D0F14!important;}
.theme-light .landing-proof-row div:last-child div:last-child{color:#687080!important;}
.theme-light .landing-ticker{background:#FFFFFF!important;border-color:#E6EAF0!important;}
.theme-light .landing-ticker span{color:#687080!important;}
.theme-light .landing-platform,.theme-light .landing-launch,.theme-light .landing-cta,.theme-light .landing-footer{background:#F7F8FA!important;}
.theme-light .landing-platform p,.theme-light .landing-launch p,.theme-light .landing-cta p{color:#5C6675!important;}
.theme-light .landing-feature-grid .ch,.theme-light .landing-testimonial-grid .ch{background:#FFFFFF!important;border-color:#E5E9F0!important;box-shadow:0 18px 55px rgba(13,15,20,0.06)!important;}
.theme-light .landing-card-title{color:#0D0F14!important;}
.theme-light .landing-card-copy{color:#5C6675!important;}
.theme-light .icon-badge{background:#F1F4F8!important;border-color:#E1E6EE!important;}
.theme-light .landing-footer{border-top-color:#E5E9F0!important;}
.theme-light .landing-footer div:first-child{color:#0D0F14!important;}
.theme-light .landing-footer div:nth-child(2),.theme-light .landing-footer button{color:#687080!important;}
.theme-light .landing-cta button:last-child{background:#FFFFFF!important;color:#0D0F14!important;border-color:#E1E6EE!important;}
.theme-dark .app-view{background:#050506!important;color:#F7F8FA!important;}
.theme-dark .app-topbar{background:rgba(11,12,14,0.96)!important;border-bottom-color:#252830!important;}
.theme-dark .app-topbar-logo,.theme-dark .app-view h1,.theme-dark .app-view h2,.theme-dark .app-view b,.theme-dark .app-view strong{color:#F7F8FA!important;}
.theme-dark .app-shell,.theme-dark .directory-wrap{color:#F7F8FA!important;}
.theme-dark .desktop-feed-side>div,.theme-dark .mobile-profile-summary,.theme-dark .composer-card,.theme-dark .post-card,.theme-dark .directory-grid .ch,.theme-dark .message-list,.theme-dark .message-panel,.theme-dark .profile-stats>div,.theme-dark .edit-sheet{background:#101114!important;border-color:#252830!important;}
.theme-dark .app-view [style*="background: rgb(255, 255, 255)"],.theme-dark .app-view [style*="background: #fff"],.theme-dark .app-view [style*="background: #FFFFFF"],.theme-dark .app-view [style*="background: rgb(240, 242, 245)"],.theme-dark .app-view [style*="background: #F0F2F5"]{background:#15171C!important;border-color:#2C313A!important;color:#F7F8FA!important;}
.theme-dark .app-view [style*="color: rgb(13, 15, 20)"],.theme-dark .app-view [style*="color: #0D0F14"],.theme-dark .app-view [style*="color: rgb(42, 45, 56)"],.theme-dark .app-view [style*="color: #2A2D38"]{color:#F7F8FA!important;}
.theme-dark .app-view .message-bubble[style*="background: rgb(22, 199, 78)"]{background:#16C74E!important;color:#fff!important;}
.theme-dark .app-view .activity-unread{background:rgba(22,199,78,0.14)!important;border-color:rgba(22,199,78,0.32)!important;}
.theme-dark .app-view input,.theme-dark .app-view textarea,.theme-dark .app-view select,.theme-dark .desktop-app-search{background:#0B0C0E!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .app-view p,.theme-dark .app-view .directory-title,.theme-dark .app-view article p{color:rgba(255,255,255,0.72)!important;}
.theme-dark .app-view [style*="color: rgb(107, 114, 128)"],.theme-dark .app-view [style*="color: #6B7280"],.theme-dark .app-view [style*="color: rgb(156, 163, 175)"],.theme-dark .app-view [style*="color: #9CA3AF"]{color:rgba(255,255,255,0.48)!important;}
.theme-dark .mobile-bottom-nav{background:rgba(16,17,20,0.96)!important;border-color:#252830!important;}
.theme-dark .mobile-bottom-nav button.active{background:rgba(22,199,78,0.16)!important;}
.theme-dark .signup-form-panel,.theme-dark .signup-form-panel>div,.theme-dark .cookie-card{background:#101114!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .signup-form-panel input,.theme-dark .signup-form-panel [style*="background: rgb(240, 242, 245)"]{background:#0B0C0E!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .signup-form-panel div,.theme-dark .signup-form-panel label,.theme-dark .cookie-card p,.theme-dark .cookie-card b{color:rgba(255,255,255,0.72)!important;}
.app-view button,.app-view input,.app-view textarea{max-width:100%;}
.app-view button,.app-view label.bs{line-height:1.15;overflow-wrap:normal;word-break:keep-all;}
.app-view button{white-space:nowrap;}
.post-card,.composer-card,.directory-grid .ch,.message-panel,.message-list,.profile-hero,.edit-sheet{overflow-wrap:anywhere;}
.post-media-grid img,.post-media-grid video{max-width:100%;}
.composer-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;overflow:visible!important;}
.composer-actions .post-type-btn,.composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{min-height:38px;white-space:nowrap!important;word-break:keep-all!important;overflow:hidden;text-overflow:ellipsis;display:inline-flex!important;align-items:center;justify-content:center;line-height:1.1;}
.composer-actions .post-type-btn{min-width:82px;flex:0 0 auto;}
.composer-actions .post-type-btn[data-label="Milestone"]{min-width:112px;}
.composer-actions .composer-media-btn{min-width:142px;flex:0 0 auto;}
.composer-actions .composer-publish-btn{min-width:118px;flex:0 0 auto;}
.filter-row{flex-wrap:wrap;overflow:visible!important;}
.filter-row button{white-space:nowrap!important;word-break:keep-all!important;overflow:hidden;text-overflow:ellipsis;}
.filter-row::-webkit-scrollbar{display:none;}
.market-hero{background:linear-gradient(135deg, rgba(13,15,20,0.98), rgba(22,199,78,0.88));}
.match-meter{height:7px;border-radius:999px;background:rgba(22,199,78,0.13);overflow:hidden;}
.match-meter span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#16C74E,#8BFFAD);}
@media(max-width:980px){
  [style*="grid-template-columns: 270px minmax(0,1fr) 310px"]{grid-template-columns:1fr!important;}
  [style*="position: sticky"]{position:static!important;}
}
@media(max-width:1180px){
  .composer-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;}
  .composer-actions .post-type-btn,.composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{width:100%!important;min-width:0!important;margin-left:0!important;padding-left:10px!important;padding-right:10px!important;}
  .composer-actions .composer-media-btn{grid-column:span 2;}
  .composer-actions .composer-publish-btn{grid-column:3 / span 1;}
}
@media(max-width:760px){
  body{background:${C.bg};}
  .app-view{overflow-x:hidden!important;}
  .ch:hover{transform:none;box-shadow:none;}
  .desktop-app-tabs,.desktop-app-search,.desktop-signout,.desktop-feed-side{display:none!important;}
  .mobile-bottom-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:10px;right:10px;bottom:10px;z-index:500;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);border:1px solid ${C.border};border-radius:18px;padding:7px;box-shadow:0 18px 60px rgba(13,15,20,.18);}
  .mobile-bottom-nav button{min-width:0;height:52px;border:none;background:transparent;border-radius:12px;padding:7px 2px;color:${C.muted};font-size:10px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;}
  .mobile-bottom-nav button.active{background:${C.aLight};color:${C.accent};}
  .mobile-bottom-nav span{font-size:17px;line-height:1;}
  .app-topbar{min-height:62px!important;padding:8px 12px!important;gap:8px!important;flex-wrap:nowrap!important;}
  .app-topbar-logo{font-size:19px!important;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}
  .app-topbar>button{flex-shrink:0;}
  .app-shell{padding:14px 12px 104px!important;width:100%!important;}
  .feed-grid{display:block!important;}
  .mobile-profile-summary{display:block!important;}
  .composer-card{border-radius:18px!important;padding:14px!important;}
  .composer-card>div{gap:10px!important;}
  .composer-card textarea{min-height:92px!important;font-size:16px!important;}
  .composer-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;overflow:visible!important;padding-bottom:2px;}
  .composer-actions .post-type-btn,.composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{min-width:0!important;width:100%!important;padding:10px 8px!important;}
  .composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{grid-column:1/-1!important;margin-left:0!important;}
  .post-card{border-radius:18px!important;margin-bottom:12px!important;}
  .post-card>div:first-child{padding:16px!important;}
  .post-media-grid{grid-template-columns:1fr!important;}
  .post-media-grid>div{min-height:220px!important;}
  .groups-create-grid{grid-template-columns:1fr!important;}
  .post-actions{padding:10px 14px!important;gap:8px!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
  .post-actions button{font-size:13px!important;justify-content:center!important;margin-left:0!important;min-width:0!important;}
  .comment-row{display:grid!important;grid-template-columns:1fr!important;}
  .comment-row button{width:100%!important;}
  .filter-row{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;overflow:visible!important;gap:7px!important;}
  .filter-row button{min-width:0!important;padding:10px 8px!important;overflow:hidden;text-overflow:ellipsis;}
  .directory-grid{grid-template-columns:1fr!important;}
  .directory-wrap{padding-bottom:86px!important;}
  .directory-title{font-size:32px!important;}
  .messages-grid{grid-template-columns:1fr!important;min-height:auto!important;}
  .message-list{display:flex!important;overflow-x:auto!important;gap:10px!important;padding:10px!important;}
  .message-list button{min-width:220px!important;}
  .message-panel{min-height:55vh!important;}
  .message-bubble{max-width:86%!important;}
  .profile-hero{padding:0!important;border-radius:20px!important;}
  .profile-hero-row{display:grid!important;grid-template-columns:82px minmax(0,1fr)!important;align-items:end!important;gap:12px!important;margin-top:-32px!important;}
  .profile-hero-row>div:first-child{width:82px!important;height:82px!important;font-size:24px!important;}
  .profile-hero-copy{padding-top:34px!important;min-width:0!important;}
  .profile-hero h1{font-size:30px!important;}
  .profile-edit-button,.profile-action-row{grid-column:1/-1;width:100%!important;margin-left:0!important;justify-content:stretch!important;}
  .profile-action-row button{flex:1!important;justify-content:center!important;}
  .profile-stats{grid-template-columns:repeat(2,1fr)!important;}
  .edit-modal{align-items:flex-end!important;padding:0!important;}
  .edit-sheet{width:100%!important;border-radius:22px 22px 0 0!important;max-height:88vh!important;overflow:auto!important;padding:22px!important;}
  .profile-photo-editor{align-items:flex-start!important;flex-direction:column!important;}
  .profile-photo-editor>div:last-child{width:100%!important;}
  .edit-actions{display:grid!important;grid-template-columns:1fr!important;}
  .edit-actions button{width:100%!important;}
  .landing-nav{height:auto!important;padding:14px 18px!important;}
  .landing-nav>div{height:52px!important;padding:0 8px 0 16px!important;}
  .landing-nav-links{display:none!important;}
  .landing-nav-actions{gap:6px!important;flex-shrink:0;}
  .landing-nav-a11y{display:none!important;}
  .landing-nav-login,.landing-nav-join{padding:8px 12px!important;font-size:12px!important;}
  .theme-toggle-label{display:none!important;}
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
  .cookie-notice{left:12px!important;right:12px!important;bottom:12px!important;}
  .cookie-card{max-width:none!important;border-radius:18px!important;}
  .cookie-actions{display:grid!important;grid-template-columns:1fr!important;}
  .signup-root{display:block!important;background:${C.dark}!important;min-height:100vh!important;}
  .signup-copy{display:none!important;}
  .signup-form-panel{width:100%!important;min-height:100vh!important;padding:82px 22px 32px!important;}
  .signup-form-panel>div{max-width:440px!important;margin:0 auto!important;}
  .verify-shell{padding:20px 14px!important;align-items:flex-start!important;}
  .verify-card{padding:24px!important;border-radius:24px!important;margin-top:34px!important;}
  .verify-card h1{font-size:34px!important;}
  .verify-card .verify-actions{grid-template-columns:1fr!important;}
  .toast-stack{left:12px!important;right:12px!important;top:12px!important;}
  .toast-stack>div{min-width:0!important;width:100%!important;}
  [aria-label="Open accessibility settings"]{bottom:82px!important;left:12px!important;width:44px!important;height:44px!important;}
  [style*="grid-template-columns: 310px 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(5,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
  input[placeholder="Search founders, posts, tags"]{width:100%!important;max-width:none!important;}
}
`;

const Tag=({label,style={}})=><span style={{display:"inline-block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",fontSize:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",borderRadius:4,padding:"2px 8px",whiteSpace:"nowrap",wordBreak:"keep-all",verticalAlign:"middle",...style}}>{label}</span>;
const IT=({label,style={}})=>{const s=C.ind[label]||C.ind.Other;return <Tag label={label} style={{background:s.bg,color:s.color,...style}}/>;};
const safeImageUrl=url=>{
  const value=String(url||"").trim();
  if(!value)return "";
  if(value.startsWith("data:image/"))return value;
  try{
    const parsed=new URL(value);
    return parsed.protocol==="https:"?value:"";
  }catch{return "";}
};
const safeMediaUrl=(url,kind="image")=>{
  const value=String(url||"").trim();
  if(!value)return "";
  if(kind==="video"&&value.startsWith("data:video/"))return value;
  if(kind!=="video"&&value.startsWith("data:image/"))return value;
  try{
    const parsed=new URL(value);
    return parsed.protocol==="https:"?value:"";
  }catch{return "";}
};
const readImageFile=(file,maxSize=720)=>new Promise((resolve,reject)=>{
  if(!file?.type?.startsWith("image/"))return reject(new Error("Choose an image file"));
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Could not read image"));
  reader.onload=()=>{
    const img=new Image();
    img.onerror=()=>reject(new Error("Could not load image"));
    img.onload=()=>{
      const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
      const width=Math.max(1,Math.round(img.width*scale));
      const height=Math.max(1,Math.round(img.height*scale));
      const canvas=document.createElement("canvas");
      canvas.width=width;
      canvas.height=height;
      const ctx=canvas.getContext("2d");
      ctx.drawImage(img,0,0,width,height);
      resolve(canvas.toDataURL("image/jpeg",0.82));
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
});
const readPostMediaFile=file=>new Promise((resolve,reject)=>{
  if(!file)return reject(new Error("Choose a photo or video"));
  const isImage=file.type?.startsWith("image/");
  const isVideo=file.type?.startsWith("video/");
  if(!isImage&&!isVideo)return reject(new Error("Only photos and videos can be posted"));
  if(isVideo&&file.size>4*1024*1024)return reject(new Error("Videos need to be under 4 MB for now"));
  if(isImage)return readImageFile(file,1280).then(url=>resolve({id:`media_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"image",url,alt:file.name||"Post photo"})).catch(reject);
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Could not read video"));
  reader.onload=()=>resolve({id:`media_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"video",url:String(reader.result||""),alt:file.name||"Post video"});
  reader.readAsDataURL(file);
});
const Av=({i,size=40,src="",grad=false,online=false,style={}})=>{
  const image=safeImageUrl(src);
  return (
  <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:image?`center / cover no-repeat url("${image}")`:grad?GR:C.aLight,border:image?"1.5px solid rgba(255,255,255,0.35)":grad?"none":`1.5px solid ${C.aSoft}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.3,color:grad?"#fff":C.accent,overflow:"hidden",...style}}>{image?"":i}</div>
    {online&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.27,height:size*0.27,borderRadius:"50%",background:C.accent,border:"2px solid #fff"}}/>}
  </div>
  );
};
const GBtn=({children,onClick,sm=false,lg=false,full=false,className="",disabled=false,style={}})=>(
  <button disabled={disabled} onClick={onClick} className={`bs ${className}`.trim()} style={{background:GR,color:"#fff",border:"none",borderRadius:9,fontWeight:700,padding:lg?"15px 40px":sm?"7px 16px":"11px 24px",fontSize:lg?17:sm?12:14,cursor:disabled?"not-allowed":"pointer",letterSpacing:0.2,boxShadow:"0 4px 20px rgba(22,199,78,0.3)",whiteSpace:"nowrap",width:full?"100%":"auto",opacity:disabled?0.55:1,...style}}>{children}</button>
);
const GhostBtn=({children,onClick,style={}})=>(
  <button onClick={onClick} className="bs" style={{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`,borderRadius:9,fontWeight:700,padding:"10px 22px",fontSize:14,cursor:"pointer",...style}}>{children}</button>
);

const iconPaths = {
  check:<path d="M20 6 9 17l-5-5"/>,
  close:<path d="M18 6 6 18M6 6l12 12"/>,
  info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  sparkle:<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z"/>,
  network:<><circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><circle cx="12" cy="17" r="3"/><path d="m9.5 10.5 1.5 3M14.5 10.5 13 14M10 8h4"/></>,
  brain:<><path d="M9 4.5a3 3 0 0 0-3 3v.3A3.5 3.5 0 0 0 7.5 14H8v2.5a3 3 0 0 0 6 0V14h.5A3.5 3.5 0 0 0 16 7.8v-.3a3 3 0 0 0-5.1-2.1A3 3 0 0 0 9 4.5Z"/><path d="M10.5 5.5V18M8 10h3M13 10h3"/></>,
  megaphone:<><path d="M4 13h3l9 5V6l-9 5H4v2Z"/><path d="M7 13v5M18 9.5a4 4 0 0 1 0 5"/></>,
  briefcase:<><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7M4 12h16M11 12v2h2v-2"/></>,
  calendar:<><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
  zap:<path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z"/>,
  leaf:<path d="M20 4c-7.5.5-13 4.7-13 10.4 0 2.9 2.1 5.1 5 5.1 5.7 0 8.9-6.4 8-15.5Z M7 18c2.8-4.3 6.2-7.1 10-8.5"/>,
  home:<><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/></>,
  diamond:<path d="M12 3 21 12l-9 9-9-9 9-9Z"/>,
  mail:<><rect x="4" y="6" width="16" height="12" rx="2"/><path d="m4 8 8 6 8-6"/></>,
  star:<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>,
  bell:<><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  heart:<path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1Z"/>,
  comment:<><path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1.1-4.2A8 8 0 1 1 21 12Z"/></>,
  bookmark:<path d="M6 4h12v17l-6-4-6 4V4Z"/>,
  send:<><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></>,
  camera:<><path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"/><circle cx="12" cy="13.5" r="3.5"/></>,
  link:<><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/></>,
  eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon:<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"/>,
};
const Icon=({name,size=18,color="currentColor",strokeWidth=2,filled=false,style={}})=>(
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" style={{display:"block",flexShrink:0,...style}} fill={filled?"currentColor":"none"} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {iconPaths[name]||iconPaths.info}
  </svg>
);
const IconBadge=({name,pro=false,style={}})=>(
  <div className="icon-badge" style={{width:48,height:48,borderRadius:14,background:pro?"#18271E":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,border:"1px solid rgba(255,255,255,0.08)",color:C.accent,...style}}>
    <Icon name={name} size={24}/>
  </div>
);
const ThemeToggle=({themeMode,setThemeMode,compact=false,style={}})=>{
  const dark=themeMode==="dark";
  const next=dark?"light":"dark";
  return (
    <button
      onClick={()=>setThemeMode(next)}
      className="bs"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      style={{
        background:dark?"rgba(255,255,255,0.08)":"#fff",
        border:`1px solid ${dark?"rgba(255,255,255,0.16)":"#E4E7EC"}`,
        borderRadius:999,
        padding:compact?"9px 11px":"9px 14px",
        color:dark?"#fff":"#111318",
        fontSize:13,
        fontWeight:900,
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        gap:8,
        whiteSpace:"nowrap",
        boxShadow:dark?"none":"0 8px 28px rgba(13,15,20,0.08)",
        ...style,
      }}
    >
      <Icon name={dark?"sun":"moon"} size={16} color="currentColor"/>
      {!compact&&<span className="theme-toggle-label">{dark?"Light":"Dark"}</span>}
    </button>
  );
};

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
  try{return localStorage.getItem("fear-session-token")||"";}catch{return "";}
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
    ["fear-posts","fear-people","fear-events","fear-mentors","fear-messages","fear-groups","fear-stats"].forEach(key=>localStorage.removeItem(key));
    localStorage.setItem("fear-data-version",version);
  }
  const savedProfile=JSON.parse(localStorage.getItem("fear-profile")||"null");
  if(savedProfile&&(!savedProfile.email||savedProfile.name==="Your Name"||savedProfile.handle==="@yourhandle")){
    const cleaned={...savedProfile};
    if(cleaned.location==="Denver, CO")cleaned.location="";
    if(cleaned.industry==="Tech")cleaned.industry="Exploring";
    localStorage.setItem("fear-profile",JSON.stringify(cleaned));
  }
  const savedMessages=JSON.parse(localStorage.getItem("fear-messages")||"[]");
  if(!Array.isArray(savedMessages)||savedMessages.some(message=>!message||typeof message!=="object")){
    localStorage.removeItem("fear-messages");
  }
}catch{}

async function api(path,options={}){
  const token=getSessionToken();
  const headers={"content-type":"application/json",...(token?{"x-fear-token":token}:{}),...(options.headers||{})};
  const res=await fetch(`/api${path}`,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(data.token){
    try{localStorage.setItem("fear-session-token",data.token);}catch{}
  }
  if(!res.ok) throw new Error(data.error||"Request failed");
  return data;
}

const ToastCtx=({toasts,remove})=>(
  <div className="toast-stack" role="status" aria-live="polite" aria-atomic="true" style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
    {toasts.map(t=>(
      <button key={t.id} onClick={()=>remove(t.id)} aria-label={`Dismiss notification: ${t.msg}`} style={{background:t.type==="success"?C.accent:t.type==="error"?"#EF4444":"#3B82F6",color:"#fff",border:"none",borderRadius:12,padding:"13px 18px",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",animation:"popIn 0.25s ease",minWidth:240,textAlign:"left"}}>
        <Icon name={t.type==="success"?"check":t.type==="error"?"close":"info"} size={18} color="#fff"/>{t.msg}
      </button>
    ))}
  </div>
);

const REAL_STATS={profiles:0,waitlist:0,posts:0,comments:0,likes:0,saves:0,connections:0,rsvps:0,mentorRequests:0,messages:0,events:0,mentors:0};
const cleanUsername=value=>String(value||"").toLowerCase().replace(/^@+/,"").replace(/[^a-z0-9._]+/g,"_").replace(/[._]{2,}/g,"_").replace(/^[._]+|[._]+$/g,"").slice(0,30);
const profileMeta=profile=>[profile.handle||"@yourhandle",profile.location||"Location not set",profile.industry||"Exploring"].filter(Boolean).join(" · ");
const STOP_WORDS=new Set(["and","the","for","into","with","your","you","are","this","that","from","have","help","useful","momentum","building"]);
const activateOnEnter=(event,callback)=>{
  if(event.key==="Enter"||event.key===" "){
    event.preventDefault();
    callback();
  }
};
const scrollToSection=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});

const POSTS=[];
const PEOPLE=[];
const MENTORS=[];
const EVENTS=[];
const DEALS=[
  {id:"opp-brand-intern",title:"Brand Strategy Intern",company:"North Star Studio",type:"Job",tag:"Brand Management",budget:"Paid internship",location:"Remote",level:"First step",skills:["brand","social","research","campaigns"],desc:"Help build social campaign briefs, creator research lists, and launch decks for emerging consumer brands.",fit:["brand management","creative","marketing","social"]},
  {id:"opp-founder-content",title:"Founder Content Assistant",company:"Buildroom",type:"Gig",tag:"Creative",budget:"$400-$800/project",location:"Remote",level:"Beginner friendly",skills:["content","writing","editing","founders"],desc:"Turn founder updates into short posts, launch recaps, and lightweight newsletter drafts for early-stage operators.",fit:["writing","content","founder","creative","marketing"]},
  {id:"opp-local-events",title:"Campus Business Event Lead",company:"fear.social partners",type:"Opportunity",tag:"Networking",budget:"Revenue share",location:"Hybrid",level:"First step",skills:["events","community","sales","networking"],desc:"Host small business-starter meetups and help connect students, creators, and first-time operators in your city.",fit:["events","community","networking","sales","first step"]},
  {id:"opp-fashion-market",title:"Fashion Market Research Sprint",company:"Indie Label Lab",type:"Gig",tag:"Fashion",budget:"$250-$500",location:"Remote",level:"Beginner friendly",skills:["fashion","research","tiktok","retail"],desc:"Research emerging fashion categories, competitor drops, TikTok signals, and buyer personas for a small apparel brand.",fit:["fashion","research","brand","creative"]},
  {id:"opp-finance-ops",title:"Startup Finance Operations Assistant",company:"Seedstage CFO Co.",type:"Job",tag:"Finance",budget:"Part-time",location:"Remote",level:"Entry level",skills:["finance","ops","spreadsheets","client support"],desc:"Support invoice tracking, simple reports, and founder-facing admin workflows for small startup clients.",fit:["finance","operations","spreadsheets","business"]},
  {id:"opp-food-popup",title:"Food Pop-Up Launch Helper",company:"Neighborhood Test Kitchen",type:"Opportunity",tag:"Food",budget:"Stipend + sales bonus",location:"Local",level:"Hands-on",skills:["food","events","customer","operations"],desc:"Help plan, promote, and operate a weekend food pop-up while learning pricing, prep, and customer feedback loops.",fit:["food","operations","events","local"]},
  {id:"opp-health-community",title:"Wellness Community Coordinator",company:"Bright Routine",type:"Job",tag:"Health",budget:"Contract",location:"Remote",level:"Entry level",skills:["health","community","support","content"],desc:"Moderate community threads, collect member feedback, and help turn wellness conversations into useful resources.",fit:["health","community","content","support"]},
  {id:"opp-exploring-shadow",title:"Founder Shadow Week",company:"Operator Office",type:"Opportunity",tag:"Exploring",budget:"Unpaid learning sprint",location:"Remote",level:"No experience needed",skills:["learning","founders","operations","research"],desc:"Spend a week shadowing early business workflows, taking notes, and learning how ideas become actual operating tasks.",fit:["exploring","first step","founder","business","learning"]},
  {id:"opp-education-tutor",title:"Business Basics Tutor Creator",company:"Skillstack",type:"Gig",tag:"Education",budget:"$35/hr",location:"Remote",level:"Beginner friendly",skills:["education","business","content","teaching"],desc:"Create simple explainers for first-time business builders around pricing, outreach, customer interviews, and momentum.",fit:["education","teaching","business","content"]},
];
const GROUPS=[{
  id:"fear-official",
  name:"fear.",
  slug:"fear",
  desc:"Official fear.social updates, feature drops, founder notes, and internal announcements from the team.",
  kind:"official",
  member:true,
  invited:false,
  role:"member",
  memberCount:1,
  inviteCount:0,
  canInvite:false,
  canAnnounce:false,
  official:true,
  active:"Everyone starts here",
  announcements:[],
}];
const INITIAL_MESSAGES=[];

function Navbar({setScreen,notify,onOpenPanel,themeMode,setThemeMode}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  const links=[["Product","platform"],["Proof","activity"],["Pricing","pricing"],["Join","cta"]];
  return(
    <div className="landing-nav" style={{position:"fixed",top:18,left:0,right:0,zIndex:100,padding:"0 32px",display:"flex",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{width:"min(1120px,100%)",height:58,borderRadius:999,background:scrolled?"rgba(255,255,255,0.94)":"rgba(255,255,255,0.86)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.22)",boxShadow:"0 24px 70px rgba(0,0,0,0.22)",display:"flex",alignItems:"center",padding:"0 10px 0 22px",transition:"all 0.3s",pointerEvents:"auto"}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:21,color:"#050506",letterSpacing:0,flex:1}}>fear<span style={{color:C.accent}}>.</span>social</div>
      <div className="landing-nav-links" style={{display:"flex",gap:2,marginRight:14}}>
        {links.map(([label,id])=>(
          <button key={label} onClick={()=>scrollToSection(id)} className="nl bs" style={{background:"none",border:"none",color:"#555B66",fontSize:13,fontWeight:700,padding:"9px 13px",cursor:"pointer",borderRadius:999}}>{label}</button>
        ))}
      </div>
      <div className="landing-nav-actions" style={{display:"flex",gap:8}}>
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} compact/>
        <button onClick={()=>onOpenPanel("accessibility")} className="bs landing-nav-a11y" aria-label="Accessibility settings" style={{background:"#fff",border:"1px solid #E4E7EC",borderRadius:999,width:38,height:38,color:"#111318",fontSize:15,fontWeight:900,cursor:"pointer",whiteSpace:"nowrap"}}>Aa</button>
        <button onClick={()=>setScreen(hasSessionToken()?"app":"login")} className="bs landing-nav-login" style={{background:"#fff",border:"1px solid #E4E7EC",borderRadius:999,padding:"9px 17px",color:"#111318",fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Log in</button>
        <button onClick={()=>setScreen("signup")} className="bs landing-nav-join" style={{background:"#111318",border:"1px solid #111318",borderRadius:999,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:900,whiteSpace:"nowrap"}}>Join free</button>
      </div>
      </div>
    </div>
  );
}

function LandingPage({setScreen,notify,onOpenPanel}){
  const [email,setEmail]=useState("");
  const [joined,setJoined]=useState(false);
  const [stats,setStats]=useState(REAL_STATS);
  useEffect(()=>{
    let active=true;
    fetch("/api/stats").then(res=>res.json()).then(data=>{if(active)setStats(data.stats||REAL_STATS);}).catch(()=>{});
    return()=>{active=false;};
  },[]);
  const joinWaitlist=async()=>{
    if(!email||!email.includes("@"))return notify("Enter a valid email first","error");
    try{
      await api("/waitlist",{method:"POST",body:JSON.stringify({email})});
      setJoined(true);
      notify("Email saved. You're on the list.");
    }catch(err){
      notify(err.message||"Could not save email","error");
    }
  };
  const ticker=["First steps · ","Business ideas · ","Warm intros · ","Mentor requests · ","Build updates · ","Events · ","Private rooms · ","Opportunity alerts · "];
  const statRows=[["Beta status","Open"],["Emails captured",fmt(stats.waitlist)],["Access","Invite"],["Free plan","Live"],["Pro plan","$19/mo"]];
  const featureRows=[
    ["network","Builder Directory","Create a polished profile, discover people by ambition and industry, and turn cold browsing into warm introductions."],
    ["megaphone","Build Updates","Post progress, signal what you need, and keep mentors, collaborators, and early supporters close to the work."],
    ["brain","Mentor Requests","Route focused business asks through a cleaner workflow so advice becomes action instead of scattered DMs."],
    ["calendar","Events & Rooms","Coordinate live sessions, small-group rooms, and RSVP-based programming without leaving the network."],
    ["briefcase","Opportunities","Surface co-founder searches, pilot customers, jobs, and partnership leads where ambitious builders gather."],
    ["zap","FEAR Pro","A paid operating layer for people ready to move: advanced matching, priority mentor access, and AI prep tools.",true],
  ];
  const readinessRows=[
    ["Email Capture","Waitlist, account signup, and verification emails are wired through the backend so new demand is recorded immediately.","check"],
    ["Account System","Email verification, passwords, sessions, profiles, and privacy controls are in place.","user"],
    ["Growth Engine","Free access brings future founders and business starters in; Pro converts the most active members into a paid plan with clear upgrade value.","zap"],
  ];
  const pricingRows=[
    {name:"Free",price:"$0",period:"forever",note:"For anyone taking the first real step into business.",features:["Public profile and builder directory","Build updates, comments, likes, and saves","Basic discovery and connection tools","Events, rooms, and direct messages","Email verification and password login"],grad:false,button:"Join free"},
    {name:"FEAR Pro",price:"$19",period:"month",note:"Founding-member launch price.",features:["Priority mentor request routing","Advanced builder and co-founder matching","Private Pro rooms and office hours","Opportunity alerts and saved searches","AI prep notes for outreach and meetings"],grad:true,button:"Reserve Pro access"},
  ];
  return(
    <div className="landing-root" style={{background:"#050506",minHeight:"100vh",overflowX:"hidden"}}>
      <div className="landing-hero" style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"148px 32px 96px",textAlign:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"0 0 auto 0",height:"62vh",background:"radial-gradient(circle at 50% 0%, rgba(22,199,78,0.16), transparent 48%)",pointerEvents:"none"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:999,padding:"8px 16px",marginBottom:32,cursor:"pointer",position:"relative"}} className="landing-badge bs fu" onClick={()=>setScreen("signup")}>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:13,fontWeight:800,color:"#F7F8FA"}}>Now accepting first-step emails</span>
        </div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(52px,7vw,104px)",fontWeight:800,color:"#fff",lineHeight:0.96,letterSpacing:0,marginBottom:28,maxWidth:1080,position:"relative"}} className="fu">
          Your first step<br/><span style={{color:C.accent}}>is fear.</span>
        </h1>
        <p style={{fontSize:20,color:"rgba(255,255,255,0.76)",lineHeight:1.65,maxWidth:680,marginBottom:12,position:"relative",fontWeight:800}} className="fu">
          Empowering tomorrow's founders today.
        </p>
        <p style={{fontSize:18,color:"rgba(255,255,255,0.56)",lineHeight:1.75,maxWidth:720,marginBottom:38,position:"relative"}} className="fu">
          A sharper social network for future founders, early builders, and anyone ready to step into business before they know exactly where to begin.
        </p>
        {joined?(
          <div style={{display:"flex",alignItems:"center",gap:16,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"20px 28px",animation:"popIn 0.3s ease",position:"relative"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:800,color:"#fff",fontSize:19}}>You're on the access list.</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.48)",marginTop:3}}>Your email is saved. Create your account whenever you're ready.</div>
            </div>
            <button onClick={()=>setScreen("signup")} className="bs" style={{marginLeft:8,background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"10px 16px",fontSize:13,fontWeight:900}}>Create account</button>
          </div>
        ):(
          <div style={{display:"flex",gap:8,maxWidth:560,width:"100%",background:"#fff",borderRadius:999,padding:6,boxShadow:"0 30px 90px rgba(0,0,0,0.32)",position:"relative"}} className="fu landing-email">
            <input aria-label="Email address for invite request" autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinWaitlist()} placeholder="you@company.com" className="if" style={{flex:1,background:"transparent",border:"none",borderRadius:999,padding:"14px 18px",color:"#111318",fontSize:16,transition:"all 0.2s"}}/>
            <button onClick={joinWaitlist} className="bs" style={{background:"#111318",color:"#fff",border:"none",borderRadius:999,padding:"13px 22px",fontSize:14,fontWeight:900,whiteSpace:"nowrap"}}>Request invite</button>
          </div>
        )}
        <div style={{fontSize:12,color:"rgba(255,255,255,0.36)",marginTop:16}}>Email capture is live · Private beta access · No credit card required</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginTop:54,position:"relative"}} className="landing-proof-row fu">
          <div style={{display:"flex"}}>{["TB","EP","BP","AR"].map((ini,idx)=><div key={ini} style={{width:40,height:40,borderRadius:"50%",background:"#101114",border:"2.5px solid #050506",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",marginLeft:idx===0?0:-13}}>{ini}</div>)}</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",fontWeight:600}}>Built for first-time business builders</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.28)"}}>{fmt(stats.waitlist)} emails captured so far</div>
          </div>
        </div>
      </div>
      <div className="landing-ticker" style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"#0B0C0E",padding:"14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",width:"max-content"}} className="ticker">
          {[...ticker,...ticker].map((t,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap",paddingRight:12,display:"inline-flex",alignItems:"center",gap:6}}><Icon name="sparkle" size={12} color={C.accent}/> {t}</span>)}
        </div>
      </div>
      <div id="platform" className="landing-platform landing-section" style={{padding:"118px 52px",maxWidth:1180,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:76}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>The Platform</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.6vw,72px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1,marginBottom:18}}>Everything you need to turn intent into a first move.</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.5)",lineHeight:1.75,maxWidth:700,margin:"0 auto"}}>The product is structured around the workflows business starters repeat every week: clarity, introductions, updates, asks, events, and opportunity flow.</p>
        </div>
        <div className="landing-feature-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {featureRows.map(([icon,title,desc,pro],i)=>(
            <div key={i} className="ch" style={{background:i%2===0?"#101114":"#0B0C0E",border:"1px solid rgba(255,255,255,0.09)",borderRadius:18,padding:"30px 26px",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.04)"}}>
              <IconBadge name={icon} pro={pro}/>
              <div className="landing-card-title" style={{fontWeight:700,fontSize:18,color:"#fff",marginBottom:10}}>{title}</div>
              <div className="landing-card-copy" style={{fontSize:14,color:"rgba(255,255,255,0.52)",lineHeight:1.72}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#F7F8FA",borderTop:"1px solid #ECEFF3",borderBottom:"1px solid #ECEFF3",padding:"64px 52px"}}>
        <div className="landing-stats" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {statRows.map(([l,n])=>(
            <div key={l} style={{textAlign:"center",padding:"28px 16px",background:"#fff",border:"1px solid #EAECF0",borderRadius:18}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:42,fontWeight:800,letterSpacing:0,color:"#111318"}}>{n}</div>
              <div style={{fontSize:12,color:"#687080",marginTop:7,fontWeight:700}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="activity" className="landing-launch landing-section" style={{padding:"110px 52px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Launch Ready</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,4rem,62px)",fontWeight:800,color:"#fff",letterSpacing:0}}>The foundation is ready to accept real demand.</h2>
        </div>
        <div className="landing-testimonial-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {readinessRows.map(([title,desc,icon],i)=>(
            <div key={title} className="ch" style={{background:"#101114",borderRadius:18,padding:"30px",border:"1px solid rgba(255,255,255,0.09)"}}>
              <IconBadge name={icon} style={{marginBottom:20}}/>
              <div className="landing-card-title" style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:10}}>{title}</div>
              <p className="landing-card-copy" style={{fontSize:15,color:"rgba(255,255,255,0.62)",lineHeight:1.78}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div id="pricing" className="landing-pricing landing-section" style={{background:"#fff",borderTop:"1px solid #ECEFF3",padding:"110px 52px"}}>
        <div style={{maxWidth:980,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Access</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,4.2vw,64px)",fontWeight:800,color:"#111318",letterSpacing:0,lineHeight:1,marginBottom:16}}>A clean plan for free growth and paid power users.</h2>
          <p style={{fontSize:16,color:"#687080",lineHeight:1.75,maxWidth:680,margin:"0 auto 56px"}}>Start with a free profile, even if the business is still just an idea. Convert the most active members into FEAR Pro at a simple founding-member price when billing opens.</p>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left"}}>
            {pricingRows.map((p,i)=>(
              <div key={i} className="ch" style={{background:p.grad?"#111318":"#F7F8FA",border:`1px solid ${p.grad?"#111318":"#EAECF0"}`,borderRadius:22,padding:"38px 34px",position:"relative",overflow:"hidden",boxShadow:p.grad?"0 28px 80px rgba(0,0,0,0.18)":"none"}}>
                <div style={{position:"relative"}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:p.grad?C.accent:"#687080",textTransform:"uppercase",marginBottom:10}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:8}}><span style={{fontFamily:"Georgia,serif",fontSize:54,fontWeight:800,color:p.grad?"#fff":"#111318"}}>{p.price}</span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.34)":"#687080"}}>/{p.period}</span></div>
                  <div style={{fontSize:13,color:p.grad?"rgba(255,255,255,0.48)":"#687080",lineHeight:1.6,marginBottom:28}}>{p.note}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:34}}>
                    {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:11}}><span style={{width:20,height:20,borderRadius:"50%",background:p.grad?"rgba(22,199,78,0.18)":"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,flexShrink:0,border:p.grad?"none":"1px solid #EAECF0"}}><Icon name="check" size={12} color={C.accent} strokeWidth={3}/></span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.62)":"#555B66"}}>{f}</span></div>)}
                  </div>
                  <button onClick={()=>setScreen("signup")} className="bs" style={{width:"100%",background:p.grad?"#fff":"#111318",color:p.grad?"#111318":"#fff",border:"none",borderRadius:999,padding:"13px 18px",fontSize:14,fontWeight:900}}>{p.button} →</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,fontSize:13,color:"#687080",lineHeight:1.65}}>Paid plan path: validate Pro demand from the waitlist, open Stripe checkout for FEAR Pro, then add annual billing once monthly conversion is proven.</div>
        </div>
      </div>
      <div id="cta" className="landing-cta" style={{padding:"118px 52px",textAlign:"center",position:"relative",overflow:"hidden",background:"#050506"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:18,position:"relative"}}>Community</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(42px,5.2vw,84px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:0.98,marginBottom:24,position:"relative"}}>Build with people<br/>who are also building.</h2>
        <p style={{fontSize:18,color:"rgba(255,255,255,0.54)",lineHeight:1.75,margin:"0 auto 38px",maxWidth:620,position:"relative"}}>Get on the list, create your account, and start turning the idea in your head into relationships, action, and momentum.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",position:"relative"}}>
          <button onClick={()=>setScreen("signup")} className="bs" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"15px 24px",fontSize:15,fontWeight:900,boxShadow:"0 18px 50px rgba(22,199,78,0.28)"}}>Create free account →</button>
          <button onClick={()=>scrollToSection("pricing")} className="bs" style={{background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.16)",borderRadius:999,padding:"15px 24px",fontSize:15,fontWeight:900}}>See Pro plan</button>
        </div>
      </div>
      <div className="landing-footer" style={{borderTop:"1px solid rgba(255,255,255,0.08)",background:"#050506",padding:"32px 52px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:18,color:"#fff"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.22)"}}>© 2026 fear.social · Empowering tomorrow's founders today.</div>
        <div style={{display:"flex",gap:20}}>
          <button onClick={()=>onOpenPanel("privacy")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Privacy</button>
          <button onClick={()=>onOpenPanel("accessibility")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Accessibility</button>
          <button onClick={()=>notify("Contact: contact@fear.social","info")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Contact</button>
        </div>
      </div>
    </div>
  );
}


function SignupPage({setScreen,notify,setProfile,initialMode="signup",themeMode,setThemeMode}){
  const [mode,setMode]=useState(initialMode);
  useEffect(()=>{
    setMode(initialMode);
    setStep(0);
  },[initialMode]);
  const [form,setForm]=useState({name:"",username:"",email:"",password:"",confirmPassword:""});
  const [login,setLogin]=useState({identifier:"",password:""});
  const [passwordSetup,setPasswordSetup]=useState({identifier:"",code:"",password:"",confirmPassword:""});
  const [passwordStep,setPasswordStep]=useState(0);
  const [acceptedTerms,setAcceptedTerms]=useState(false);
  const [showTerms,setShowTerms]=useState(false);
  const [code,setCode]=useState("");
  const [step,setStep]=useState(0);
  const passwordReady=form.password.length>=8&&form.password===form.confirmPassword;
  const valid=form.name&&form.username&&form.email&&passwordReady&&acceptedTerms;
  const loginValid=login.identifier&&login.password;
  const passwordSetupReady=passwordSetup.password.length>=8&&passwordSetup.password===passwordSetup.confirmPassword;
  const requestCode=async()=>{
    if(!acceptedTerms)return notify("Accept the Terms and Conditions to continue","error");
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
  const requestPasswordCode=async()=>{
    if(!passwordSetup.identifier)return;
    try{
      await api("/auth/request-code",{method:"POST",body:JSON.stringify({identifier:passwordSetup.identifier,purpose:"password"})});
      setPasswordStep(1);
      notify("Password code sent");
    }catch(err){
      notify(err.message||"Could not send password code","error");
    }
  };
  const savePassword=async()=>{
    if(!passwordSetupReady||passwordSetup.code.length!==6)return;
    try{
      await api("/auth/password",{method:"POST",body:JSON.stringify({identifier:passwordSetup.identifier,code:passwordSetup.code,password:passwordSetup.password,purpose:"password"})});
      setLogin({identifier:passwordSetup.identifier,password:passwordSetup.password});
      setMode("login");
      setPasswordStep(0);
      notify("Password ready. You can log in now.");
    }catch(err){
      notify(err.message||"Could not set password","error");
    }
  };
  const enterApp=async()=>{
    const nextProfile={name:form.name,username:form.username,handle:`@${form.username}`,email:form.email};
    try{
      const saved=await api("/auth/verify",{method:"POST",body:JSON.stringify({email:form.email,code,profile:nextProfile,password:form.password,acceptedTerms:true,termsVersion:"2026-07-06"})});
      setProfile(p=>({...p,...saved.profile}));
    }catch(err){
      notify(err.message||"Could not verify email","error");
      return;
    }
    setScreen("app");
    notify("Welcome to fear.social!");
  };
  if(step===1) return(
    <div className="verify-shell" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg, rgba(255,255,255,0.04), transparent 34%, rgba(22,199,78,0.08))",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:24,left:24,fontFamily:"Georgia,serif",fontWeight:800,fontSize:23,color:"#fff",letterSpacing:0}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
      <div className="verify-card" style={{width:"min(560px,100%)",borderRadius:32,padding:38,boxShadow:"0 34px 120px rgba(0,0,0,.42)",border:"1px solid rgba(255,255,255,0.62)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:190,height:190,borderRadius:"50%",background:"rgba(22,199,78,0.13)",filter:"blur(2px)"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,marginBottom:28}}>
            <div style={{width:58,height:58,borderRadius:18,background:GR,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 18px 50px rgba(22,199,78,0.32)"}}><Icon name="mail" size={28} color="#fff"/></div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              {[0,1,2].map(i=><span key={i} style={{width:i===1?34:8,height:8,borderRadius:999,background:i<=1?C.accent:"#DDE3EC",display:"block"}}/> )}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:2.2,textTransform:"uppercase",color:C.accent,marginBottom:12}}>Email verification</div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:44,lineHeight:1,letterSpacing:0,color:C.text,marginBottom:14}}>Check your inbox.</h1>
          <p style={{fontSize:15,color:C.muted,lineHeight:1.75,marginBottom:22}}>We sent a 6-digit access code to <b style={{color:C.text}}>{form.email}</b>. Enter it below to unlock your fear.social profile.</p>
          <div style={{background:"#0D0F14",borderRadius:20,padding:18,marginBottom:18,color:"#fff",boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:C.accent,boxShadow:"0 0 0 6px rgba(22,199,78,0.14)"}}/>
              <span style={{fontSize:12,fontWeight:900,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,0.58)"}}>Secure code</span>
            </div>
            <input aria-label="Six digit email verification code" autoComplete="one-time-code" value={code} autoFocus onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} onKeyDown={e=>e.key==="Enter"&&code.length===6&&enterApp()} placeholder="000000" inputMode="numeric" className="if verify-code-input" style={{width:"100%",background:"#fff",border:`2px solid ${code.length===6?C.accent:"transparent"}`,borderRadius:16,padding:"18px 16px",fontSize:30,fontWeight:950,letterSpacing:8,textAlign:"center",color:C.text,boxShadow:code.length===6?"0 0 0 5px rgba(22,199,78,0.16)":"none",transition:"all .18s ease"}}/>
          </div>
          <div className="verify-actions" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"center"}}>
            <GBtn full disabled={code.length!==6} onClick={enterApp} style={{padding:"14px 18px",fontWeight:900}}>Verify and enter →</GBtn>
            <button onClick={requestCode} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:13,fontWeight:900,padding:"13px 15px",whiteSpace:"nowrap"}}>Resend code</button>
          </div>
          <button onClick={()=>setStep(0)} className="bs" style={{marginTop:16,width:"100%",background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Use a different email</button>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:24}}>
            {["Encrypted session","No card needed","Private beta"].map(text=><div key={text} style={{border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 8px",fontSize:11,fontWeight:800,color:C.muted,textAlign:"center",background:"#fff"}}>{text}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
  if(step===2) return(
    <div style={{minHeight:"100vh",background:GR,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:440}}>
        <div style={{width:72,height:72,borderRadius:22,background:"rgba(255,255,255,0.14)",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:30}}><Icon name="leaf" size={38} color="#fff"/></div>
        <div style={{fontFamily:"Georgia,serif",fontSize:44,fontWeight:700,color:"#fff",marginBottom:12,letterSpacing:0}}>You're in, {form.name.split(" ")[0]}.</div>
        <div style={{fontSize:17,color:"rgba(255,255,255,0.6)",lineHeight:1.8,marginBottom:44}}>Welcome to a community that turns fear into fuel.</div>
        <GBtn lg onClick={enterApp} style={{background:"#fff",color:C.accent,boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>Enter fear.social →</GBtn>
      </div>
    </div>
  );
  return(
    <div className="signup-root" style={{minHeight:"100vh",background:C.dark,display:"flex"}}>
      <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} style={{position:"fixed",top:18,right:18,zIndex:20}}/>
      <div className="signup-copy" style={{flex:1,background:GR2,display:"flex",alignItems:"center",justifyContent:"center",padding:72}}>
        <div style={{maxWidth:520}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:56,fontWeight:700,color:"#fff",letterSpacing:0,lineHeight:1.02,marginBottom:28}}>The community<br/>you've been<br/>looking for.</div>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.42)",lineHeight:1.85,marginBottom:44}}>Real profiles, posts, and activity counts. One platform built for you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["network","Connect with people around your exact interests"],["brain","Request mentor intros"],["megaphone","Build in public with real support"],["zap","Find co-founders, jobs, and gigs"]].map(([icon,text])=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.accent}}><Icon name={icon} size={19}/></div>
                <span style={{fontSize:15,color:"rgba(255,255,255,0.55)"}}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="signup-form-panel" style={{width:520,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:56}}>
        <div style={{width:"100%",maxWidth:400}}>
          <div role="tablist" aria-label="Account mode" style={{display:"flex",gap:8,background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:28}}>
            <button role="tab" aria-selected={mode==="signup"} onClick={()=>setMode("signup")} className="bs" style={{flex:1,border:"none",borderRadius:9,padding:"10px 12px",fontSize:13,fontWeight:900,color:mode==="signup"?"#fff":C.muted,background:mode==="signup"?C.accent:"transparent"}}>Sign up</button>
            <button role="tab" aria-selected={mode==="login"||mode==="password"} onClick={()=>setMode("login")} className="bs" style={{flex:1,border:"none",borderRadius:9,padding:"10px 12px",fontSize:13,fontWeight:900,color:mode==="login"||mode==="password"?"#fff":C.muted,background:mode==="login"||mode==="password"?C.accent:"transparent"}}>Log in</button>
          </div>
          {mode==="signup"?<>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Sign up</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>Create your fear.social account.</div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {[["Full name","text","Your name","name"],["Username","text","username","username"],["Email","email","you@example.com","email"]].map(([label,type,ph,key])=>(
              <div key={key}>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>{label}</label>
                <input aria-label={label} autoComplete={key==="name"?"name":key==="email"?"email":"username"} type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:key==="username"?cleanUsername(e.target.value):e.target.value}))} placeholder={ph} className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${form[key]?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
                {key==="username"&&form.username&&<div style={{fontSize:12,color:C.muted,marginTop:6}}>Your profile will be @{form.username}</div>}
              </div>
            ))}
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
              <input aria-label="Password" autoComplete="new-password" aria-describedby="signup-password-help" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Create a password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${form.password.length>=8?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
              <div id="signup-password-help" style={{fontSize:12,color:form.password&&form.password.length<8?"#D64545":C.muted,marginTop:6}}>Use at least 8 characters.</div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Confirm password</label>
              <input aria-label="Confirm password" autoComplete="new-password" aria-invalid={Boolean(form.confirmPassword&&form.confirmPassword!==form.password)} type="password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&requestCode()} placeholder="Confirm your password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${form.confirmPassword&&form.confirmPassword===form.password?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
              {form.confirmPassword&&form.confirmPassword!==form.password&&<div style={{fontSize:12,color:"#D64545",marginTop:6}}>Passwords need to match.</div>}
            </div>
            <label style={{display:"flex",alignItems:"flex-start",gap:10,border:`1px solid ${acceptedTerms?C.aSoft:C.border}`,background:acceptedTerms?C.aLight:C.bg,borderRadius:12,padding:13,cursor:"pointer"}}>
              <input aria-label="Agree to Terms and Conditions" type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)} style={{marginTop:2,accentColor:C.accent,flexShrink:0}}/>
              <span style={{fontSize:12,color:C.muted,lineHeight:1.55}}>I agree to the <button type="button" onClick={e=>{e.preventDefault();setShowTerms(true);}} style={{background:"none",border:"none",padding:0,color:C.accent,fontWeight:900,textDecoration:"underline",cursor:"pointer"}}>Terms and Conditions</button> and understand fear.social's privacy and community rules.</span>
            </label>
            <GBtn full disabled={!valid} onClick={requestCode}>Send verification code →</GBtn>
            <div style={{fontSize:12,color:C.dim,textAlign:"center"}}>Free forever · No credit card</div>
          </div>
          </>:mode==="login"?<>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Log in</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>Access your existing fear.social account.</div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Username or email</label>
              <input aria-label="Username or email" autoComplete="username" value={login.identifier} onChange={e=>setLogin(l=>({...l,identifier:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginWithPassword()} placeholder="username or email" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${login.identifier?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
              <input aria-label="Password" autoComplete="current-password" type="password" value={login.password} onChange={e=>setLogin(l=>({...l,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginWithPassword()} placeholder="Password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${login.password?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
            </div>
            <GBtn full disabled={!loginValid} onClick={loginWithPassword}>Log in →</GBtn>
            <button onClick={()=>{setMode("password");setPasswordStep(0);}} className="bs" style={{background:"transparent",border:"none",color:C.accent,fontSize:13,fontWeight:900}}>Set or reset password</button>
            <button onClick={()=>setMode("signup")} className="bs" style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Need an account? Sign up</button>
          </div>
          </>:<>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Set password</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:36}}>Use your email or username. We'll send a code to the email on that account.</div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {passwordStep===0?<>
              <div>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Username or email</label>
                <input aria-label="Username or email" autoComplete="username" value={passwordSetup.identifier} onChange={e=>setPasswordSetup(p=>({...p,identifier:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&requestPasswordCode()} placeholder="username or email" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${passwordSetup.identifier?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
              </div>
              <GBtn full disabled={!passwordSetup.identifier} onClick={requestPasswordCode}>Send password code →</GBtn>
            </>:<>
              <div>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Verification code</label>
                <input aria-label="Password reset verification code" autoComplete="one-time-code" value={passwordSetup.code} onChange={e=>setPasswordSetup(p=>({...p,code:e.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="000000" inputMode="numeric" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${passwordSetup.code.length===6?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,letterSpacing:4,transition:"all 0.2s"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>New password</label>
                <input aria-label="New password" autoComplete="new-password" type="password" value={passwordSetup.password} onChange={e=>setPasswordSetup(p=>({...p,password:e.target.value}))} placeholder="Create a password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${passwordSetup.password.length>=8?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
                <div style={{fontSize:12,color:passwordSetup.password&&passwordSetup.password.length<8?"#D64545":C.muted,marginTop:6}}>Use at least 8 characters.</div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,letterSpacing:0.8,color:C.muted,textTransform:"uppercase",display:"block",marginBottom:8}}>Confirm password</label>
                <input aria-label="Confirm new password" autoComplete="new-password" aria-invalid={Boolean(passwordSetup.confirmPassword&&passwordSetup.confirmPassword!==passwordSetup.password)} type="password" value={passwordSetup.confirmPassword} onChange={e=>setPasswordSetup(p=>({...p,confirmPassword:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&savePassword()} placeholder="Confirm your password" className="if" style={{width:"100%",background:C.bg,border:`1.5px solid ${passwordSetup.confirmPassword&&passwordSetup.confirmPassword===passwordSetup.password?C.accent:C.border}`,borderRadius:10,padding:"13px 16px",color:C.text,fontSize:15,transition:"all 0.2s"}}/>
                {passwordSetup.confirmPassword&&passwordSetup.confirmPassword!==passwordSetup.password&&<div style={{fontSize:12,color:"#D64545",marginTop:6}}>Passwords need to match.</div>}
              </div>
              <GBtn full disabled={!(passwordSetupReady&&passwordSetup.code.length===6)} onClick={savePassword}>Save password →</GBtn>
              <button onClick={requestPasswordCode} className="bs" style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Resend code</button>
            </>}
            <button onClick={()=>setMode("login")} className="bs" style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontWeight:800}}>Back to log in</button>
          </div>
          </>}
        </div>
      </div>
      {showTerms&&<TermsConditionsPanel onClose={()=>setShowTerms(false)}/>}
    </div>
  );
}

function PlatformApp({notify,setScreen,signOut,profile,setProfile,themeMode,setThemeMode}){
  const [view,setView]=useLocalState("fear-view","feed");
  const [posts,setPosts]=useLocalState("fear-posts",POSTS);
  const [people,setPeople]=useLocalState("fear-people",PEOPLE);
  const [events,setEvents]=useLocalState("fear-events",EVENTS);
  const [mentors,setMentors]=useLocalState("fear-mentors",MENTORS);
  const [messages,setMessages]=useLocalState("fear-messages",INITIAL_MESSAGES);
  const [groups,setGroups]=useLocalState("fear-groups",GROUPS);
  const [notifications,setNotifications]=useLocalState("fear-notifications",[]);
  const [unreadNotifications,setUnreadNotifications]=useLocalState("fear-unread-notifications",0);
  const [stats,setStats]=useLocalState("fear-stats",REAL_STATS);
  const [savedDeals,setSavedDeals]=useLocalState("fear-saved-deals",[]);
  const [filter,setFilter]=useState("All");
  const [feedMode,setFeedMode]=useLocalState("fear-feed-mode","forYou");
  const [composer,setComposer]=useState("");
  const [composerMedia,setComposerMedia]=useState([]);
  const [postType,setPostType]=useState("Update");
  const [commentInputs,setCommentInputs]=useState({});
  const [openComments,setOpenComments]=useState({});
  const [editingPost,setEditingPost]=useState(null);
  const [query,setQuery]=useState("");
  const [editProfile,setEditProfile]=useState(false);
  const [selectedProfile,setSelectedProfile]=useState(null);
  const [profileReturnView,setProfileReturnView]=useState("discover");
  const [activeConversationId,setActiveConversationId]=useState(null);
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
    if(data.groups)setGroups(data.groups);
    if(data.notifications)setNotifications(data.notifications);
    if(typeof data.unreadNotifications==="number")setUnreadNotifications(data.unreadNotifications);
    if(data.stats)setStats(data.stats);
  },[setEvents,setGroups,setMentors,setMessages,setNotifications,setPeople,setPosts,setProfile,setStats,setUnreadNotifications]);
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
  useEffect(()=>{
    if(view==="publicProfile"&&!selectedProfile) setView("discover");
  },[selectedProfile,setView,view]);
  const tabs=[
    ["feed","Feed"],
    ["discover","Discover"],
    ["events","Events"],
    ["mentors","Mentors"],
    ["messages","Messages"],
    ["notifications","Activity"],
    ["groups","Groups"],
    ["opportunities","Deals"],
  ];
  const mobileTabs=[
    ["feed","Feed","home"],
    ["discover","Find","diamond"],
    ["notifications","Activity","heart"],
    ["messages","DMs","mail"],
    ["profile","Me","user"],
  ];
  const initials=(profile.name||"Your Name").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()||"YO";
  const followedIds=new Set(people.filter(p=>p.connected).map(p=>p.id));
  const ownPost=p=>(profile.id&&p.userId===profile.id)||(profile.handle&&p.handle===profile.handle);
  const algorithmTerms=[profile.industry,profile.goal,profile.lookingFor,profile.headline].filter(Boolean).join(" ").toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>3);
  const postScore=p=>{
    const haystack=`${p.user} ${p.handle} ${p.content} ${p.tag} ${p.type}`.toLowerCase();
    let score=Number(p.likes||0)*2+(p.comments?.length||0)*3+(p.saved?4:0);
    if(ownPost(p))score+=8;
    if(p.followingAuthor||followedIds.has(p.userId))score+=28;
    if(profile.industry&&p.tag===profile.industry)score+=18;
    score+=algorithmTerms.reduce((total,term)=>total+(haystack.includes(term)?4:0),0);
    return score;
  };
  const visiblePosts=posts
    .filter(p=>(filter==="All"||p.tag===filter)&&(query.trim()===""||`${p.user} ${p.content} ${p.tag}`.toLowerCase().includes(query.toLowerCase())))
    .filter(p=>feedMode==="forYou"||p.followingAuthor||followedIds.has(p.userId)||ownPost(p))
    .map((p,index)=>({...p,_score:postScore(p),_index:index}))
    .sort((a,b)=>feedMode==="forYou"?(b._score-a._score)||(a._index-b._index):a._index-b._index);
  const opportunityTerms=[profile.industry,profile.goal,profile.lookingFor,profile.headline,profile.bio,profile.location].filter(Boolean).join(" ").toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>2&&!STOP_WORDS.has(term));
  const opportunityScore=deal=>{
    const haystack=[deal.title,deal.company,deal.type,deal.tag,deal.location,deal.level,deal.desc,...(deal.skills||[]),...(deal.fit||[])].join(" ").toLowerCase();
    let score=34;
    const reasons=[];
    if(profile.industry&&deal.tag===profile.industry){score+=26;reasons.push(`matches your ${profile.industry} field`);}
    if(deal.tag==="Exploring"||deal.level?.toLowerCase().includes("beginner")||deal.level?.toLowerCase().includes("first")){score+=10;reasons.push("friendly for a first step");}
    if(profile.location&&deal.location&&deal.location!=="Remote"&&deal.location!=="Local"&&deal.location.toLowerCase().includes(profile.location.toLowerCase().split(",")[0])){score+=12;reasons.push("near your location");}
    if(deal.location==="Remote"){score+=6;reasons.push("remote-friendly");}
    const matches=[...new Set(opportunityTerms.filter(term=>haystack.includes(term)))].slice(0,4);
    score+=matches.length*8;
    if(matches.length)reasons.push(`picks up ${matches.join(", ")}`);
    if((profile.lookingFor||"").toLowerCase().includes("mentor")&&deal.desc.toLowerCase().includes("shadow")){score+=10;reasons.push("helps you learn by watching operators");}
    return {score:Math.min(99,score),reasons:reasons.slice(0,3)};
  };
  const rankedDeals=DEALS.map((deal,index)=>({...deal,...opportunityScore(deal),saved:savedDeals.includes(deal.id),_index:index})).sort((a,b)=>(b.score-a.score)||(a._index-b._index));
  const toggleDealSave=id=>setSavedDeals(ids=>ids.includes(id)?ids.filter(savedId=>savedId!==id):[...ids,id]);
  const signalDealInterest=deal=>notify(`Interest noted for ${deal.title}`);
  const unread=unreadNotifications;
  const followerCount=Number(profile.followers||0);
  const statCards=[
    ["Posts",fmt(stats.posts)],
    ["Followers",fmt(followerCount)],
    ["Saved",fmt(posts.filter(p=>p.saved).length)],
    ["RSVPs",fmt(events.filter(e=>e.going).length)],
  ];
  const toPublicProfile=person=>({
    id:person.id||person.userId||"",
    name:person.name||person.user||"Founder",
    handle:person.handle||"@member",
    location:person.location||person.loc||"",
    industry:person.industry||person.tag||"Exploring",
    bio:person.bio||"Building in public, meeting ambitious people, and turning fear into momentum.",
    avatarUrl:person.avatarUrl||person.avatar_url||"",
    coverUrl:person.coverUrl||person.cover_url||"",
    headline:person.headline||"",
    website:person.website||"",
    lookingFor:person.lookingFor||person.looking_for||"",
    goal:person.goal||"",
    av:person.av,
    followers:Number(person.followers||0),
    mutual:Number(person.mutual||0),
    connected:Boolean(person.connected),
  });
  const openProfile=(source,returnView=view)=>{
    const sourceId=source?.id||source?.userId;
    const sourceHandle=source?.handle;
    const ownHandle=profile.handle;
    if((sourceId&&sourceId===profile.id)||(sourceHandle&&ownHandle&&sourceHandle===ownHandle)){
      setView("profile");
      requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}));
      return;
    }
    const match=people.find(p=>(sourceId&&(p.id===sourceId||p.userId===sourceId))||(sourceHandle&&p.handle===sourceHandle))||source;
    setProfileReturnView(returnView);
    setSelectedProfile(toPublicProfile(match));
    setView("publicProfile");
    requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}));
  };
  const activePublicProfile=selectedProfile&&(people.find(p=>p.id===selectedProfile.id)||selectedProfile);
  const publicProfile=activePublicProfile?toPublicProfile(activePublicProfile):null;
  const addComposerMedia=async event=>{
    const files=Array.from(event.target.files||[]).slice(0,4-composerMedia.length);
    event.target.value="";
    if(files.length===0)return;
    try{
      const next=await Promise.all(files.map(readPostMediaFile));
      setComposerMedia(media=>[...media,...next].slice(0,4));
      notify(next.length===1?"Media attached":`${next.length} files attached`);
    }catch(err){
      notify(err.message||"Could not attach that file","error");
    }
  };
  const removeComposerMedia=id=>setComposerMedia(media=>media.filter(item=>item.id!==id));
  const publish=async()=>{
    const media=composerMedia.filter(item=>safeMediaUrl(item.url,item.kind));
    if(!composer.trim()&&media.length===0)return notify("Write something or attach media before publishing","error");
    const optimistic={
      id:Date.now(),userId:profile.id||"",user:profile.name||"Your Name",handle:profile.handle||"@yourhandle",av:initials,avatarUrl:profile.avatarUrl||"",
      tag:profile.industry||"Exploring",
      time:"Just now",type:postType,content:composer.trim(),media,likes:0,comments:[],saved:false,liked:false,followingAuthor:false,isNew:true
    };
    setPosts(ps=>[optimistic,...ps]);
    setComposer("");
    setComposerMedia([]);
    try{
      await callBackend("/posts",{method:"POST",body:JSON.stringify({content:optimistic.content,type:postType,tag:optimistic.tag,media})});
      notify(`${postType} published`);
    }catch(err){
      notify("Published locally. Cloud sync failed.","error");
    }
  };
  const connect=async id=>{
    setPeople(ps=>ps.map(p=>p.id===id?{...p,connected:!p.connected,followers:p.connected?p.followers-1:p.followers+1}:p));
    try{await callBackend(`/people/${id}/connect`,{method:"POST"});}catch{}
  };
  const startMessage=async person=>{
    if(!person?.id)return;
    try{
      const data=await callBackend(`/people/${person.id}/message`,{method:"POST",body:JSON.stringify({})});
      const conversation=data.messages?.find(message=>message.userId===person.id);
      setActiveConversationId(conversation?.id||null);
      setView("messages");
      notify(`Message ${person.name}`);
    }catch(err){
      notify(err.message||"Could not open message","error");
    }
  };
  const markNotificationsRead=async(id="")=>{
    setNotifications(ns=>ns.map(n=>id&&n.id!==id?n:{...n,read:true}));
    if(!id)setUnreadNotifications(0);
    try{await callBackend("/notifications/read",{method:"POST",body:JSON.stringify({id})});}catch{}
  };
  const rsvp=async id=>{
    setEvents(es=>es.map(e=>e.id===id?{...e,going:!e.going,attending:e.going?e.attending-1:e.attending+1}:e));
    try{await callBackend(`/events/${id}/rsvp`,{method:"POST"});}catch{}
  };
  const requestMentor=async id=>{
    setMentors(ms=>ms.map(m=>(m.id||m.name)===id?{...m,requested:!m.requested,sessions:m.requested?m.sessions:m.sessions+1}:m));
    try{await callBackend(`/mentors/${id}/request`,{method:"POST"});}catch{}
  };
  const createGroup=async draft=>{
    const name=String(draft.name||"").trim();
    const description=String(draft.description||"").trim();
    if(name.length<2)return notify("Give the group a name","error");
    const localGroup={id:`local-group-${Date.now()}`,name,slug:cleanUsername(name),desc:description||`A focused room for ${name}.`,kind:"member",member:true,role:"admin",memberCount:1,inviteCount:0,canInvite:true,canAnnounce:true,official:false,active:"1 member · 0 pending invites",announcements:[]};
    setGroups(gs=>[localGroup,...gs]);
    try{
      await callBackend("/groups",{method:"POST",body:JSON.stringify({name,description})});
      notify(`${name} created`);
    }catch(err){
      notify(err.message||"Group saved locally. Cloud sync failed.","error");
    }
  };
  const joinGroup=async id=>{
    setGroups(gs=>gs.map(g=>g.id===id?{...g,member:true,invited:false,role:g.role==="invited"?"member":g.role||"member",memberCount:Number(g.memberCount||0)+1}:g));
    try{
      await callBackend(`/groups/${id}/join`,{method:"POST"});
      notify("Group joined");
    }catch(err){
      notify(err.message||"Could not join group","error");
    }
  };
  const inviteToGroup=async(groupId,userIds)=>{
    const ids=[...new Set((Array.isArray(userIds)?userIds:[userIds]).filter(Boolean))];
    if(ids.length===0)return notify("Choose someone to invite","error");
    setGroups(gs=>gs.map(g=>g.id===groupId?{...g,inviteCount:Number(g.inviteCount||0)+ids.length}:g));
    try{
      await callBackend(`/groups/${groupId}/invite`,{method:"POST",body:JSON.stringify({userIds:ids})});
      notify(ids.length===1?"Invite sent":"Invites sent");
    }catch(err){
      notify(err.message||"Could not send invite","error");
    }
  };
  const postGroupAnnouncement=async(groupId,draft)=>{
    const title=String(draft.title||"").trim();
    const body=String(draft.body||"").trim();
    if(!title||!body)return notify("Announcement title and body required","error");
    const localAnnouncement={id:`local-announcement-${Date.now()}`,title,body,author:profile.name||"You",handle:profile.handle||"",time:"Just now"};
    setGroups(gs=>gs.map(g=>g.id===groupId?{...g,announcements:[localAnnouncement,...(g.announcements||[])]}:g));
    try{
      await callBackend(`/groups/${groupId}/announcements`,{method:"POST",body:JSON.stringify({title,body})});
      notify("Announcement posted");
    }catch(err){
      notify(err.message||"Announcement saved locally. Cloud sync failed.","error");
    }
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
    setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,{user:profile.name||"You",handle:profile.handle||"@you",av:initials,avatarUrl:profile.avatarUrl||"",text,time:"Just now"}]}:p));
    setCommentInputs(ci=>({...ci,[id]:""}));
    try{
      await callBackend(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({text})});
      notify("Comment posted");
    }catch{
      notify("Comment saved locally. Cloud sync failed.","error");
    }
  };
  const beginEditPost=post=>setEditingPost({id:post.id,content:post.content,type:post.type||"Update",tag:post.tag||profile.industry||"Exploring"});
  const cancelEditPost=()=>setEditingPost(null);
  const savePostEdit=async id=>{
    const draft=editingPost;
    if(!draft||draft.id!==id)return;
    const content=draft.content.trim();
    if(!content)return notify("Post cannot be empty","error");
    setPosts(ps=>ps.map(p=>p.id===id?{...p,content,type:draft.type,tag:draft.tag,edited:true}:p));
    setEditingPost(null);
    try{
      await callBackend(`/posts/${id}`,{method:"PUT",body:JSON.stringify({content,type:draft.type,tag:draft.tag})});
      notify("Post updated");
    }catch(err){
      notify(err.message||"Post updated locally. Cloud sync failed.","error");
    }
  };
  const deletePost=async id=>{
    const post=posts.find(p=>p.id===id);
    if(!post||!ownPost(post))return notify("You can only delete your own posts","error");
    if(!window.confirm("Delete this post?"))return;
    setPosts(ps=>ps.filter(p=>p.id!==id));
    setEditingPost(e=>e?.id===id?null:e);
    try{
      await callBackend(`/posts/${id}`,{method:"DELETE"});
      notify("Post deleted");
    }catch(err){
      notify(err.message||"Post deleted locally. Cloud sync failed.","error");
    }
  };
  const sendMessage=async id=>{
    const thread=messages.find(m=>m.id===id);
    const text=thread?.draft?.trim();
    if(!text)return;
    const optimisticId=`local-message-${Date.now()}`;
    setMessages(ms=>ms.map(m=>{
      if(m.id!==id||!m.draft.trim())return m;
      notify(`Message sent to ${m.name}`);
      return {...m,thread:[...m.thread,{id:optimisticId,text:m.draft.trim(),author:"you",time:"Just now"}],draft:""};
    }));
    try{
      const data=await callBackend(`/messages/${id}/send`,{method:"POST",body:JSON.stringify({text})});
      setActiveConversationId(id);
      if(data.messages)setMessages(data.messages.map(message=>message.id===id?{...message,draft:""}:message));
    }catch(err){
      setMessages(ms=>ms.map(m=>m.id===id?{...m,draft:text,thread:m.thread.filter(message=>message.id!==optimisticId)}:m));
      notify(err.message||"Could not send message","error");
    }
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
  const uploadProfileImage=async(event,key="avatarUrl")=>{
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      const dataUrl=await readImageFile(file,key==="coverUrl"?1200:720);
      setProfileDraft(p=>({...p,[key]:dataUrl}));
      notify(key==="coverUrl"?"Cover photo ready":"Profile picture ready");
    }catch(err){
      notify(err.message||"Could not use that image","error");
    }finally{
      event.target.value="";
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
    <div className="app-view" style={{minHeight:"100vh",background:C.bg}}>
      <a className="skip-link" href="#app-main">Skip to main content</a>
      <div className="app-topbar" style={{position:"sticky",top:0,zIndex:200,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(18px)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",minHeight:68,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <button className="app-topbar-logo" aria-label="Go to feed" onClick={()=>setView("feed")} style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:C.text,cursor:"pointer",whiteSpace:"nowrap",background:"none",border:"none",padding:"6px 0",minHeight:36}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></button>
        <div className="desktop-app-tabs" role="navigation" aria-label="Main app navigation" style={{display:"flex",gap:3,overflowX:"auto",flex:1}}>
          {tabs.map(([id,label])=><button key={id} aria-current={view===id?"page":undefined} onClick={()=>setView(id)} className="bs nl" style={{background:view===id?C.aLight:"transparent",border:"none",borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:view===id?800:600,color:view===id?C.accent:C.muted,whiteSpace:"nowrap"}}>{label}{id==="notifications"&&unread>0?` ${unread}`:""}</button>)}
        </div>
        <input type="search" aria-label="Search founders, posts, and tags" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search founders, posts, tags" className="if desktop-app-search" style={{width:240,maxWidth:"32vw",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:C.text}}/>
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} compact/>
        <button onClick={()=>setView("notifications")} className="bs" aria-label={`${unread} unread notifications`} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",position:"relative",color:view==="notifications"?C.accent:C.muted}}><Icon name="heart" size={18} filled={view==="notifications"} color="currentColor"/>{unread>0&&<span style={{position:"absolute",top:-6,right:-6,minWidth:17,height:17,padding:"0 4px",borderRadius:999,background:C.coral,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}</button>
        <button onClick={()=>setEditProfile(true)} style={{background:"none",border:"none",padding:0}} aria-label="Edit profile"><Av i={initials} src={profile.avatarUrl} size={38} grad online/></button>
        <button onClick={signOut} className="bs desktop-signout" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,color:C.muted,fontWeight:700}}>Sign out</button>
      </div>
      <main id="app-main" className="app-shell" tabIndex={-1} style={{maxWidth:1320,margin:"0 auto",padding:"28px"}}>
        {view==="feed"&&(
          <div className="feed-grid" style={{display:"grid",gridTemplateColumns:"270px minmax(0,1fr) 310px",gap:22,alignItems:"start"}}>
            <aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}><Av i={initials} src={profile.avatarUrl} size={54} grad online/><div style={{minWidth:0}}><div style={{fontWeight:900,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.name||"Your Name"}</div><div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.handle||"@yourhandle"} · {profile.location||"Location not set"}</div></div></div>
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
                {groups.slice(0,4).map(g=><div key={g.id} className="uh" onClick={()=>setView("groups")} style={{padding:"9px 6px",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{g.name}</div><div style={{fontSize:11,color:C.dim}}>{g.active}</div></div>)}
              </div>
            </aside>
            <main>
              <div className="mobile-profile-summary" style={{display:"none",background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:16,marginBottom:14}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av i={initials} src={profile.avatarUrl} size={46} grad online/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:900,color:C.text}}>{profile.name||"Your Name"}</div>
                    <div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.handle||"@yourhandle"} · {profile.industry||"Exploring"}</div>
                  </div>
                  <button onClick={()=>setEditProfile(true)} style={{background:C.aLight,color:C.accent,border:"none",borderRadius:9,padding:"8px 11px",fontSize:12,fontWeight:900}}>Edit</button>
                </div>
              </div>
              <div role="tablist" aria-label="Feed mode" style={{display:"flex",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:6,marginBottom:14}}>
                {[["forYou","For You"],["following","Following"]].map(([id,label])=><button key={id} role="tab" aria-selected={feedMode===id} onClick={()=>setFeedMode(id)} className="bs" style={{flex:1,border:"none",borderRadius:11,padding:"11px 14px",fontSize:14,fontWeight:950,color:feedMode===id?"#fff":C.muted,background:feedMode===id?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>{id==="forYou"&&<Icon name="sparkle" size={15} color="currentColor"/>}{label}</button>)}
              </div>
              <div className="composer-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,padding:20,marginBottom:18}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av i={initials} src={profile.avatarUrl} size={44} grad/>
                  <div style={{flex:1}}>
                    <textarea aria-label="Create a post" value={composer} onChange={e=>setComposer(e.target.value)} placeholder="Share a win, ask for feedback, or post what you're building..." className="if" style={{width:"100%",minHeight:104,resize:"vertical",background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:14,fontSize:14,color:C.text,lineHeight:1.6}}/>
                    <MediaPreviewGrid media={composerMedia} onRemove={removeComposerMedia}/>
                    <div className="composer-actions" style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}>
                      {["Update","Ask","Milestone","Hiring","Launch"].map(t=><button key={t} data-label={t} aria-pressed={postType===t} onClick={()=>setPostType(t)} className="bs post-type-btn" style={{background:postType===t?C.aLight:"#fff",border:`1px solid ${postType===t?C.aSoft:C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:800,color:postType===t?C.accent:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.1}}>{t}</button>)}
                      <label className="bs composer-media-btn" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.text,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,whiteSpace:"nowrap",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}><Icon name="camera" size={15}/> Photo/video<input aria-label="Attach photos or videos to post" type="file" accept="image/*,video/*" multiple onChange={addComposerMedia} style={{display:"none"}}/></label>
                      <GBtn sm className="composer-publish-btn" disabled={!composer.trim()&&composerMedia.length===0} onClick={publish} style={{marginLeft:"auto"}}>Publish</GBtn>
                    </div>
                  </div>
                </div>
              </div>
              <div className="filter-row" role="toolbar" aria-label="Filter posts by field" style={{display:"flex",gap:8,marginBottom:16,overflow:"visible",flexWrap:"wrap"}}>{["All","Exploring","Finance","Brand Management","Creative","Food","Health"].map(t=><button key={t} aria-pressed={filter===t} onClick={()=>setFilter(t)} className="bs" style={{background:filter===t?C.accent:"#fff",color:filter===t?"#fff":C.muted,border:`1px solid ${filter===t?C.accent:C.border}`,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:800,whiteSpace:"nowrap"}}>{t}</button>)}</div>
              {visiblePosts.length===0&&<EmptyState title={feedMode==="following"?"No following posts yet":"No real posts yet"} text={feedMode==="following"?"Connect with people in Discover, then their posts will show up here.":"The For You feed will rank real posts around your field, goals, follows, and activity."}/>}
              {visiblePosts.map(p=>{
                const isOwner=ownPost(p);
                const isEditing=editingPost?.id===p.id;
                return (
                <article key={p.id} className="ch post-card" style={{background:C.card,border:`1px solid ${p.isNew?C.aSoft:C.border}`,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:20}}>
                    <div className="profile-link" role="button" tabIndex={0} onClick={()=>openProfile(p,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"feed"))} style={{display:"flex",gap:12,alignItems:"start",marginBottom:12}}>
                      <Av i={p.av} src={p.avatarUrl} size={45} grad={p.av===initials} online={Boolean(p.avatarUrl)||["MK","SR",initials].includes(p.av)}/>
                      <div style={{flex:1,minWidth:0}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:C.text}}>{p.user}</b><Tag label={p.type||"Update"} style={{background:C.aLight,color:C.accent}}/><IT label={p.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{p.handle} · {p.time} ago{p.edited?" · edited":""}</div></div>
                      {isOwner&&<div style={{display:"flex",gap:6,flexShrink:0}}><button onClick={e=>{e.stopPropagation();beginEditPost(p);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.text}}>Edit</button><button onClick={e=>{e.stopPropagation();deletePost(p.id);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.coral}}>Delete</button></div>}
                    </div>
                    {isEditing?(
                      <div style={{display:"grid",gap:10}}>
                        <textarea aria-label="Edit post content" value={editingPost.content} onChange={e=>setEditingPost(d=>({...d,content:e.target.value}))} className="if" autoFocus style={{width:"100%",minHeight:120,resize:"vertical",background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:13,fontSize:15,color:C.text,lineHeight:1.65}}/>
                        <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                          <button onClick={cancelEditPost} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:900,color:C.text}}>Cancel</button>
                          <GBtn sm onClick={()=>savePostEdit(p.id)}>Save changes</GBtn>
                        </div>
                      </div>
                    ):<>
                      {p.content&&<p style={{fontSize:15,color:C.tSoft,lineHeight:1.75}}>{p.content}</p>}
                      <MediaPreviewGrid media={p.media}/>
                    </>}
                  </div>
                  <div className="post-actions" style={{borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",gap:16,alignItems:"center"}}>
                    <button className="bs" onClick={()=>togglePostAction(p.id,"like")} style={{background:"none",border:"none",fontWeight:800,color:p.liked?C.coral:C.muted,display:"flex",alignItems:"center",gap:6}}><Icon name="heart" size={17} color="currentColor" filled={p.liked}/> {p.likes}</button>
                    <button className="bs" onClick={()=>setOpenComments(o=>({...o,[p.id]:!o[p.id]}))} style={{background:"none",border:"none",fontWeight:800,color:openComments[p.id]?C.accent:C.muted,display:"flex",alignItems:"center",gap:6}}><Icon name="comment" size={17} color="currentColor"/> {p.comments.length}</button>
                    <button className="bs" onClick={()=>{togglePostAction(p.id,"save");notify(p.saved?"Removed from saved":"Saved post");}} style={{background:"none",border:"none",fontWeight:800,color:p.saved?C.accent:C.muted,marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}><Icon name="bookmark" size={17} color="currentColor" filled={p.saved}/> {p.saved?"Saved":"Save"}</button>
                  </div>
                  {openComments[p.id]&&<div style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:16}}>{p.comments.map((c,i)=><div key={i} className="profile-link" role="button" tabIndex={0} onClick={()=>openProfile(c,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(c,"feed"))} style={{display:"flex",gap:10,marginBottom:10}}><Av i={c.av} src={c.avatarUrl} size={30}/><div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px",flex:1,minWidth:0}}><b style={{fontSize:12}}>{c.user}</b><p style={{fontSize:13,color:C.tSoft,lineHeight:1.5,overflowWrap:"anywhere"}}>{c.text}</p></div></div>)}<div className="comment-row" style={{display:"flex",gap:8}}><input aria-label={`Write a comment on ${p.user}'s post`} value={commentInputs[p.id]||""} onChange={e=>setCommentInputs(ci=>({...ci,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(p.id)} placeholder="Write a comment..." className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",minWidth:0}}/><GBtn sm onClick={()=>addComment(p.id)}>Send</GBtn></div></div>}
                </article>
              );})}
            </main>
            <aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Suggested founders</b>{people.length===0&&<MiniEmpty text="Real users will appear here after they create accounts."/>}{people.slice(0,4).map(p=><div key={p.id} className="uh profile-link" role="button" tabIndex={0} onClick={()=>openProfile(p,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"feed"))} style={{display:"flex",gap:10,alignItems:"center",padding:"12px 4px"}}><Av i={p.av} src={p.avatarUrl} size={36} online={p.online}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div><div style={{fontSize:11,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.industry||"Exploring"}</div></div><button onClick={e=>{e.stopPropagation();openProfile(p,"feed");}} style={{background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontWeight:900,fontSize:11,flexShrink:0}}>View</button><button onClick={e=>{e.stopPropagation();connect(p.id);notify(`${p.connected?"Unfollowed":"Following"} ${p.name}`);}} style={{background:p.connected?C.accent:C.aLight,color:p.connected?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11,flexShrink:0}}>{p.connected?"Following":"Follow"}</button></div>)}</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><b>Next events</b>{events.length===0&&<MiniEmpty text="No real events are published yet."/>}{events.slice(0,3).map(e=><div key={e.id} className="uh" style={{padding:"12px 4px"}}><div style={{fontSize:13,fontWeight:800}}>{e.title}</div><div style={{fontSize:11,color:C.dim,margin:"3px 0 8px"}}>{e.date} · {fmt(e.attending)} RSVPs</div><button onClick={()=>{rsvp(e.id);notify(`${e.going?"Removed RSVP":"RSVP confirmed"}`);}} style={{background:e.going?C.accent:C.aLight,color:e.going?"#fff":C.accent,border:"none",borderRadius:8,padding:"6px 10px",fontWeight:800,fontSize:11}}>{e.going?"Going":"RSVP"}</button></div>)}</div>
            </aside>
          </div>
        )}
        {view==="discover"&&<Directory title="Discover founders" eyebrow="Network" items={people.filter(p=>`${p.name} ${p.industry} ${p.bio}`.toLowerCase().includes(query.toLowerCase()))} render={p=><div key={p.id} className="ch profile-link" role="button" tabIndex={0} onClick={()=>openProfile(p,"discover")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"discover"))} style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:10,minWidth:0}}><Av i={p.av} src={p.avatarUrl} size={56} online={p.online}/><div style={{flex:"1 1 0",minWidth:0}}><b style={{display:"block",fontSize:18,lineHeight:1.15,overflowWrap:"anywhere",color:C.text}}>{p.name}</b><div style={{fontSize:12,color:C.dim,overflowWrap:"anywhere",marginTop:4}}>{p.handle} · {p.loc||"Location not set"}</div></div></div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}><IT label={p.industry||"Exploring"} style={{maxWidth:"100%"}}/>{p.headline&&<Tag label={p.headline} style={{background:C.aLight,color:C.accent,maxWidth:"100%"}}/>}</div><p style={bodyCopy}>{p.bio}</p>{p.lookingFor&&<div style={{fontSize:12,color:C.muted,marginTop:12,overflowWrap:"anywhere"}}><b style={{color:C.text}}>Looking for:</b> {p.lookingFor}</div>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginTop:18,minWidth:0,flexWrap:"wrap"}}><span style={{fontSize:12,color:C.muted,minWidth:120,flex:"1 1 auto",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmt(p.followers)} followers</span><button onClick={e=>{e.stopPropagation();openProfile(p,"discover");}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 13px",fontSize:12,fontWeight:900,color:C.text}}>View profile</button><GBtn sm onClick={e=>{e.stopPropagation();connect(p.id);notify(`${p.connected?"Disconnected from":"Connected with"} ${p.name}`);}}>{p.connected?"Connected":"Connect"}</GBtn></div></div>}/>}
        {view==="events"&&<Directory title="Events and rooms" eyebrow="Calendar" items={events} render={e=><div key={e.id} className="ch" style={cardStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{e.title}</b><IT label={e.tag}/></div><p style={bodyCopy}>{e.desc}</p><div style={{fontSize:13,color:C.muted,margin:"16px 0"}}>{e.date} · {e.time} · {e.type} · {fmt(e.attending)} RSVPs</div><GBtn sm onClick={()=>{rsvp(e.id);notify(e.going?"RSVP removed":"RSVP confirmed");}}>{e.going?"Going":"RSVP"}</GBtn></div>}/>}
        {view==="mentors"&&<Directory title="Verified mentors" eyebrow="Mentors" items={mentors} render={m=><div key={m.name} className="ch" style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}><Av i={m.av} size={52} grad/><div><b>{m.name}</b><div style={{fontSize:12,color:C.dim}}>{m.role}</div></div></div><p style={bodyCopy}>{m.bio}</p><div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"16px 0"}}>{m.tags.map(t=><Tag key={t} label={t} style={{background:C.aLight,color:C.accent}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.muted}}>{fmt(m.sessions)} requests</span><GBtn sm onClick={()=>{requestMentor(m.id||m.name);notify(m.requested?"Request withdrawn":"Mentor request sent");}}>{m.requested?"Requested":"Request"}</GBtn></div></div>}/>}
        {view==="messages"&&<MessagesView messages={messages} setMessages={setMessages} sendMessage={sendMessage} activeConversationId={activeConversationId}/>}
        {view==="notifications"&&<NotificationsView notifications={notifications} markRead={markNotificationsRead} openProfile={openProfile}/>}
        {view==="groups"&&<GroupsView groups={groups} people={people} createGroup={createGroup} joinGroup={joinGroup} inviteToGroup={inviteToGroup} postAnnouncement={postGroupAnnouncement}/>}
        {view==="opportunities"&&<OpportunitiesView deals={rankedDeals} savedDeals={savedDeals} toggleSave={toggleDealSave} signalInterest={signalDealInterest}/>}
        {view==="profile"&&<ProfilePanel profile={profile} setEditProfile={setEditProfile} stats={statCards}/>}
        {view==="publicProfile"&&publicProfile&&<PublicProfilePanel profile={publicProfile} onBack={()=>setView(profileReturnView)} onConnect={()=>{connect(publicProfile.id);notify(`${publicProfile.connected?"Disconnected from":"Connected with"} ${publicProfile.name}`);}} onMessage={()=>startMessage(publicProfile)}/>}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">
        {mobileTabs.map(([id,label,icon])=><button key={id} className={view===id?"active":""} aria-current={view===id?"page":undefined} onClick={()=>setView(id)} aria-label={id==="notifications"?`${label}, ${unread} unread`:label}><span><Icon name={icon} size={18} color="currentColor" filled={id==="notifications"&&unread>0}/></span>{label}{id==="notifications"&&unread>0?` ${unread}`:""}</button>)}
      </nav>
      {editProfile&&(
        <div className="edit-modal" role="dialog" aria-modal="true" aria-label="Edit your founder card" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.58)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setEditProfile(false)} onKeyDown={e=>e.key==="Escape"&&setEditProfile(false)}>
          <div className="edit-sheet" style={{background:"#fff",borderRadius:22,padding:28,width:"min(560px,100%)",boxShadow:"0 30px 100px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
            <SectionTitle eyebrow="Profile" title="Edit your founder card"/>
            <div style={{height:116,borderRadius:18,background:safeImageUrl(profileDraft.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profileDraft.coverUrl)}")`:GR,border:`1px solid ${C.border}`,marginBottom:44,position:"relative",overflow:"visible"}}>
              <div style={{position:"absolute",left:16,bottom:-34}}><Av i={initials} src={profileDraft.avatarUrl} size={78} grad style={{border:"4px solid #fff"}}/></div>
              <label className="bs" style={{position:"absolute",right:12,top:12,background:"rgba(255,255,255,0.92)",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer"}}><Icon name="camera" size={15}/> Cover<input aria-label="Upload cover photo" type="file" accept="image/*" onChange={e=>uploadProfileImage(e,"coverUrl")} style={{display:"none"}}/></label>
              <label className="bs" style={{position:"absolute",left:100,bottom:-26,background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer"}}><Icon name="camera" size={15}/> Photo<input aria-label="Upload profile picture" type="file" accept="image/*" onChange={e=>uploadProfileImage(e,"avatarUrl")} style={{display:"none"}}/></label>
            </div>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>name<input aria-label="Name" autoComplete="name" value={profileDraft.name||""} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>username<input aria-label="Username" autoComplete="username" value={cleanUsername(profileDraft.username||profileDraft.handle||"")} onChange={e=>setProfileDraft(p=>{const username=cleanUsername(e.target.value);return {...p,username,handle:`@${username}`};})} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/><span style={{display:"block",fontSize:12,color:C.dim,textTransform:"none",fontWeight:600,marginTop:6}}>Your profile URL name is @{cleanUsername(profileDraft.username||profileDraft.handle||"username")}</span></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>headline<input aria-label="Headline" value={profileDraft.headline||""} onChange={e=>setProfileDraft(p=>({...p,headline:e.target.value}))} placeholder="Brand builder, student founder, first-time operator..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {["location","industry"].map(k=><label key={k} style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>{k}<input aria-label={k==="industry"?"Industry":"Location"} autoComplete={k==="location"?"address-level2":undefined} value={profileDraft[k]||""} onChange={e=>setProfileDraft(p=>({...p,[k]:e.target.value}))} placeholder={k==="industry"?"Exploring, Brand Management...":"City, State"} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>looking for<input aria-label="Looking for" value={profileDraft.lookingFor||""} onChange={e=>setProfileDraft(p=>({...p,lookingFor:e.target.value}))} placeholder="Mentors, clients, cofounder..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
              <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>first step<input aria-label="First step" value={profileDraft.goal||""} onChange={e=>setProfileDraft(p=>({...p,goal:e.target.value}))} placeholder="Validate an idea, meet operators..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            </div>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>website or link<input aria-label="Website or link" autoComplete="url" value={profileDraft.website||""} onChange={e=>setProfileDraft(p=>({...p,website:e.target.value}))} placeholder="your site, portfolio, LinkedIn, store..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>bio<textarea aria-label="Bio" value={profileDraft.bio||""} onChange={e=>setProfileDraft(p=>({...p,bio:e.target.value}))} className="if" style={{display:"block",width:"100%",minHeight:96,resize:"vertical",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text,lineHeight:1.5}}/></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>profile visibility<select aria-label="Profile visibility" value={profileDraft.privacy||"public"} onChange={e=>setProfileDraft(p=>({...p,privacy:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text,background:"#fff"}}><option value="public">Public</option><option value="private">Private</option></select></label>
            <div className="edit-actions" style={{display:"flex",gap:10,justifyContent:"end",marginTop:20}}>
              <GhostBtn onClick={()=>setEditProfile(false)}>Cancel</GhostBtn>
              <GBtn onClick={saveProfile}>Save profile</GBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22,overflow:"hidden",minWidth:0};
const bodyCopy={fontSize:14,color:C.tSoft,lineHeight:1.7,marginTop:12};
function MediaPreviewGrid({media=[],onRemove}){
  const safe=(Array.isArray(media)?media:[]).map(item=>({...item,url:safeMediaUrl(item?.url,item?.kind)})).filter(item=>item.url);
  if(safe.length===0)return null;
  return <div className="post-media-grid" style={{display:"grid",gridTemplateColumns:safe.length===1?"1fr":"repeat(2,minmax(0,1fr))",gap:8,marginTop:12}}>{safe.map(item=><div key={item.id||item.url} style={{position:"relative",border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",background:C.bg,minHeight:safe.length===1?260:170}}>{item.kind==="video"?<video src={item.url} controls playsInline style={{display:"block",width:"100%",height:"100%",maxHeight:420,objectFit:"cover",background:"#000"}}/>:<img src={item.url} alt={item.alt||"Post photo"} style={{display:"block",width:"100%",height:"100%",maxHeight:520,objectFit:"cover"}}/>}{onRemove&&<button type="button" aria-label="Remove media" onClick={()=>onRemove(item.id)} className="bs" style={{position:"absolute",top:8,right:8,width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.5)",background:"rgba(13,15,20,0.78)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="close" size={16}/></button>}</div>)}</div>;
}
function EmptyState({title,text}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,textAlign:"center",color:C.muted}}><div style={{fontWeight:900,fontSize:18,color:C.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,lineHeight:1.65}}>{text}</div></div>;
}
function MiniEmpty({text}){
  return <div style={{fontSize:12,color:C.dim,lineHeight:1.55,marginTop:10,padding:"10px 0"}}>{text}</div>;
}
function Directory({eyebrow,title,items,render}){
  return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{eyebrow}</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>{title}</h1>{items.length===0?<EmptyState title="Nothing real here yet" text="This area will stay empty until real records are added in the backend."/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{items.map(render)}</div>}</div>;
}
function GroupsView({groups,people,createGroup,joinGroup,inviteToGroup,postAnnouncement}){
  const [draft,setDraft]=useState({name:"",description:""});
  const [inviteDraft,setInviteDraft]=useState({});
  const [announcementDraft,setAnnouncementDraft]=useState({});
  const resetDraft=()=>setDraft({name:"",description:""});
  const submitGroup=()=>{
    createGroup(draft);
    resetDraft();
  };
  const usableGroups=Array.isArray(groups)&&groups.length?groups:GROUPS;
  const invitePeople=(Array.isArray(people)?people:[]).slice(0,24);
  return <div className="directory-wrap"><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:18,marginBottom:22,flexWrap:"wrap"}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Rooms</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,color:C.text}}>Founder groups</h1></div><div style={{fontSize:13,color:C.muted,maxWidth:430,lineHeight:1.6}}>Create focused rooms, invite members, and keep everyone aligned with announcements.</div></div><div className="composer-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:18}}><div className="groups-create-grid" style={{display:"grid",gridTemplateColumns:"minmax(180px,0.8fr) minmax(220px,1.2fr) auto",gap:10,alignItems:"end"}}><label style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1,color:C.muted}}>Group name<input aria-label="Group name" value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} placeholder="NYC builders, Fashion founders..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:C.text}}/></label><label style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1,color:C.muted}}>Purpose<input aria-label="Group purpose" value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="What should people use this group for?" className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:C.text}}/></label><GBtn onClick={submitGroup} style={{height:42,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="network" size={16} color="#fff"/> Create group</GBtn></div></div><div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>{usableGroups.map(group=>{const selectedInvite=inviteDraft[group.id]||"";const announce=announcementDraft[group.id]||{title:"",body:""};return <article key={group.id} className="ch" style={{...cardStyle,padding:0,borderColor:group.official?C.aSoft:C.border}}><div style={{padding:20,background:group.official?GR:"transparent",color:group.official?"#fff":C.text}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div style={{minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><b style={{fontSize:22,overflowWrap:"anywhere"}}>{group.name}</b>{group.official&&<Tag label="Official" style={{background:"rgba(255,255,255,0.18)",color:"#fff"}}/>}{group.invited&&<Tag label="Invited" style={{background:"#fff",color:C.accent}}/>}</div><div style={{fontSize:12,opacity:group.official?0.82:1,color:group.official?"rgba(255,255,255,0.78)":C.muted,marginTop:5}}>{group.active}</div></div><div style={{width:44,height:44,borderRadius:14,background:group.official?"rgba(255,255,255,0.14)":C.aLight,color:group.official?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={group.official?"sparkle":"network"} size={22} color="currentColor"/></div></div><p style={{fontSize:14,lineHeight:1.65,marginTop:14,color:group.official?"rgba(255,255,255,0.82)":C.tSoft}}>{group.desc}</p></div><div style={{padding:20,display:"grid",gap:16}}>{!group.member&&<GBtn onClick={()=>joinGroup(group.id)} full>{group.invited?"Accept invite":"Join group"}</GBtn>}{group.canInvite&&<div style={{display:"grid",gap:9}}><div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>Invite users</div><div style={{display:"flex",gap:8}}><select aria-label={`Choose a person to invite to ${group.name}`} value={selectedInvite} onChange={e=>setInviteDraft(d=>({...d,[group.id]:e.target.value}))} className="if" style={{flex:1,minWidth:0,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text,background:"#fff"}}><option value="">Choose a person</option>{invitePeople.map(person=><option key={person.id} value={person.id}>{person.name} · {person.industry||"Exploring"}</option>)}</select><button onClick={()=>selectedInvite&&inviteToGroup(group.id,[selectedInvite])} className="bs" style={{border:"none",background:C.aLight,color:C.accent,borderRadius:10,padding:"10px 13px",fontSize:12,fontWeight:900,whiteSpace:"nowrap"}}>Invite</button></div>{invitePeople.length===0&&<MiniEmpty text="More invite options will appear as real users join."/>}</div>}{group.canAnnounce&&<div style={{display:"grid",gap:9}}><div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>Announcement</div><input aria-label={`Announcement title for ${group.name}`} value={announce.title} onChange={e=>setAnnouncementDraft(d=>({...d,[group.id]:{...announce,title:e.target.value}}))} placeholder={group.official?"New fear feature, launch note...":"Announcement title"} className="if" style={{border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text}}/><textarea aria-label={`Announcement body for ${group.name}`} value={announce.body} onChange={e=>setAnnouncementDraft(d=>({...d,[group.id]:{...announce,body:e.target.value}}))} placeholder="Share the update with this group..." className="if" style={{border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text,minHeight:86,resize:"vertical",lineHeight:1.5}}/><GBtn sm onClick={()=>{postAnnouncement(group.id,announce);setAnnouncementDraft(d=>({...d,[group.id]:{title:"",body:""}}));}}>Post announcement</GBtn></div>}<div><div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:9}}>Latest announcements</div>{(group.announcements||[]).length===0?<MiniEmpty text={group.official?"Admin feature updates will appear here.":"No announcements yet."}/>:<div style={{display:"grid",gap:8}}>{group.announcements.map(a=><div key={a.id} style={{border:`1px solid ${C.border}`,borderRadius:12,padding:12,background:C.bg}}><div style={{fontWeight:900,color:C.text,marginBottom:5,overflowWrap:"anywhere"}}>{a.title}</div><p style={{fontSize:13,lineHeight:1.55,color:C.tSoft,overflowWrap:"anywhere"}}>{a.body}</p><div style={{fontSize:11,color:C.dim,marginTop:8}}>{a.author} · {a.time} ago</div></div>)}</div>}</div></div></article>;})}</div></div>;
}
function OpportunitiesView({deals,savedDeals,toggleSave,signalInterest}){
  const [mode,setMode]=useState("matched");
  const [kind,setKind]=useState("All");
  const types=["All","Job","Gig","Opportunity"];
  const visible=deals.filter(deal=>(kind==="All"||deal.type===kind)&&(mode!=="saved"||savedDeals.includes(deal.id)));
  const top=deals[0];
  return <div className="directory-wrap"><section className="market-hero" style={{borderRadius:24,padding:"28px clamp(18px,4vw,38px)",color:"#fff",marginBottom:18,overflow:"hidden",position:"relative"}}><div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-end",flexWrap:"wrap",position:"relative",zIndex:1}}><div style={{maxWidth:720}}><div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",opacity:.74,marginBottom:10}}>Deals</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:42,letterSpacing:0,lineHeight:1.02}}>Opportunity matches built around your first move.</h1><p style={{fontSize:15,lineHeight:1.7,opacity:.78,marginTop:14}}>Jobs, gigs, and business openings are ranked by your profile field, goals, location, and what you say you are looking for.</p></div>{top&&<div style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:18,padding:16,minWidth:220}}><div style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1.2,opacity:.7}}>Best match</div><div style={{fontSize:28,fontWeight:950,marginTop:4}}>{top.score}%</div><div style={{fontSize:13,opacity:.82,marginTop:4}}>{top.title}</div></div>}</div></section><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:16}}><div style={{display:"flex",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:6}}>{[["matched","For You"],["saved","Saved"]].map(([id,label])=><button key={id} onClick={()=>setMode(id)} className="bs" style={{border:"none",borderRadius:10,padding:"9px 13px",fontSize:13,fontWeight:900,background:mode===id?C.accent:"transparent",color:mode===id?"#fff":C.muted}}>{label}</button>)}</div><div className="filter-row" style={{display:"flex",gap:8,flexWrap:"wrap"}}>{types.map(type=><button key={type} onClick={()=>setKind(type)} className="bs" style={{background:kind===type?C.aLight:"#fff",color:kind===type?C.accent:C.muted,border:`1px solid ${kind===type?C.aSoft:C.border}`,borderRadius:999,padding:"8px 13px",fontSize:12,fontWeight:900}}>{type}</button>)}</div></div>{visible.length===0?<EmptyState title={mode==="saved"?"No saved opportunities yet":"No matches yet"} text={mode==="saved"?"Save a few listings and they will live here.":"Add more to your profile so fear can tune your opportunity feed."}/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>{visible.map(deal=><article key={deal.id} className="ch" style={{...cardStyle,padding:0}}><div style={{padding:20,borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div style={{minWidth:0}}><div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}><IT label={deal.tag}/><Tag label={deal.type} style={{background:C.aLight,color:C.accent}}/></div><h2 style={{fontSize:21,lineHeight:1.12,color:C.text,overflowWrap:"anywhere"}}>{deal.title}</h2><div style={{fontSize:12,color:C.dim,marginTop:7}}>{deal.company} · {deal.budget} · {deal.location}</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:22,fontWeight:950,color:C.accent,lineHeight:1}}>{deal.score}%</div><div style={{fontSize:10,color:C.muted,fontWeight:900,textTransform:"uppercase",marginTop:4}}>match</div></div></div><div className="match-meter" style={{marginTop:16}}><span style={{width:`${deal.score}%`}}/></div></div><div style={{padding:20}}><p style={{fontSize:14,color:C.tSoft,lineHeight:1.7}}>{deal.desc}</p><div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:14}}>{(deal.reasons?.length?deal.reasons:["useful first-step signal"]).map(reason=><span key={reason} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:999,padding:"7px 9px",fontSize:11,fontWeight:800,color:C.muted}}>{reason}</span>)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:18,flexWrap:"wrap"}}><GBtn sm onClick={()=>signalInterest(deal)} style={{display:"inline-flex",alignItems:"center",gap:7}}><Icon name="send" size={14} color="#fff"/> I'm interested</GBtn><button onClick={()=>toggleSave(deal.id)} className="bs" style={{background:deal.saved?C.aLight:"#fff",border:`1px solid ${deal.saved?C.aSoft:C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:900,color:deal.saved?C.accent:C.text,display:"inline-flex",gap:7,alignItems:"center"}}><Icon name="bookmark" size={15} color="currentColor" filled={deal.saved}/>{deal.saved?"Saved":"Save"}</button></div></div></article>)}</div>}</div>;
}
function NotificationsView({notifications,markRead,openProfile}){
  const unread=notifications.filter(n=>!n.read).length;
  return <div className="directory-wrap" style={{maxWidth:760}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:14,marginBottom:22}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Activity</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,color:C.text}}>Notifications</h1></div>{unread>0&&<button onClick={()=>markRead()} className="bs" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"9px 13px",fontSize:12,fontWeight:900,color:C.accent}}>Mark all read</button>}</div><div role="status" aria-live="polite" style={{position:"absolute",left:-9999}}>{unread} unread notifications</div>{notifications.length===0?<EmptyState title="No notifications yet" text="New follows, comments, and messages will appear here."/>:<div style={{display:"grid",gap:10}}>{notifications.map(n=><div key={n.id} className={n.read?"":"activity-unread"} style={{background:C.card,border:`1px solid ${n.read?C.border:C.aSoft}`,borderRadius:18,padding:16,display:"flex",gap:13,alignItems:"center",minWidth:0}}><button onClick={()=>n.actor&&openProfile(n.actor,"notifications")} aria-label={n.actor?`Open ${n.actor.name}`:"Notification"} style={{background:"none",border:"none",padding:0}}><Av i={n.actor?.av||"FS"} src={n.actor?.avatarUrl} size={44} grad={!n.actor}/></button><div style={{flex:1,minWidth:0}}><div style={{fontWeight:n.read?700:900,color:C.text,lineHeight:1.35,overflowWrap:"anywhere"}}>{n.body}</div><div style={{fontSize:12,color:C.dim,marginTop:4,textTransform:"capitalize"}}>{n.type} · {n.time} ago</div></div>{!n.read&&<button onClick={()=>markRead(n.id)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 10px",fontSize:12,fontWeight:900,color:C.text,flexShrink:0}}>Read</button>}</div>)}</div>}</div>;
}
function MessagesView({messages,setMessages,sendMessage,activeConversationId}){
  const messageInitials=name=>String(name||"Conversation").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()||"DM";
  const safeMessages=(Array.isArray(messages)?messages:[]).map((message,index)=>{
    const source=message&&typeof message==="object"?message:{};
    return {
      ...source,
      id:source.id??`local-thread-${index}`,
      name:source.name||"Conversation",
      av:source.av||messageInitials(source.name||"Conversation"),
      avatarUrl:source.avatarUrl||"",
      online:Boolean(source.online),
      handle:source.handle||"",
      thread:Array.isArray(source.thread)?source.thread.filter(Boolean):[],
      draft:source.draft||"",
    };
  });
  const [active,setActive]=useState(safeMessages[0]?.id);
  useEffect(()=>{if(activeConversationId&&safeMessages.some(m=>m.id===activeConversationId))setActive(activeConversationId);},[activeConversationId,messages]);
  useEffect(()=>{if(!safeMessages.some(m=>m.id===active))setActive(safeMessages[0]?.id);},[active,messages]);
  const thread=safeMessages.find(m=>m.id===active)||safeMessages[0];
  const messageText=msg=>typeof msg==="string"?msg:String(msg?.text||"");
  const messageAuthor=msg=>typeof msg==="string"?"them":msg?.author||"them";
  if(safeMessages.length===0)return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Inbox</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>Founder messages</h1><EmptyState title="No real messages yet" text="Direct messages will appear here after real conversations start."/></div>;
  return <div className="directory-wrap"><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Inbox</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>Direct messages</h1><div className="messages-grid" style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:18,minHeight:"70vh"}}><div className="message-list" role="tablist" aria-label="Message conversations" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:12}}>{safeMessages.map(m=><button key={m.id} role="tab" aria-selected={active===m.id} onClick={()=>setActive(m.id)} className="uh" style={{width:"100%",display:"flex",gap:12,alignItems:"center",padding:12,border:"none",background:active===m.id?C.aLight:"transparent",borderRadius:12,textAlign:"left"}}><Av i={m.av} src={m.avatarUrl} size={40} online={m.online}/><div style={{minWidth:0}}><div style={{fontWeight:900,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div><div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{messageText(m.thread[m.thread.length-1])||"Start the conversation"}</div></div></button>)}</div>{thread&&<div className="message-panel" role="tabpanel" aria-label={`Conversation with ${thread.name}`} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,display:"flex",flexDirection:"column"}}><div style={{display:"flex",gap:12,alignItems:"center",paddingBottom:14,borderBottom:`1px solid ${C.border}`}}><Av i={thread.av} src={thread.avatarUrl} size={44} online={thread.online}/><div><b>{thread.name}</b><div style={{fontSize:12,color:C.dim}}>{thread.online?"Online now":thread.handle||"Direct message"}</div></div></div><div aria-live="polite" style={{flex:1,padding:"20px 0",display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>{thread.thread.length===0&&<div style={{alignSelf:"center",textAlign:"center",color:C.muted,fontSize:14,marginTop:40}}>Say hello and make the first step easy.</div>}{thread.thread.map((msg,i)=>{const mine=messageAuthor(msg)==="you";return <div className="message-bubble" key={typeof msg==="string"?i:msg.id||i} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"70%",background:mine?C.accent:C.bg,color:mine?"#fff":C.text,borderRadius:14,padding:"10px 13px",fontSize:14,lineHeight:1.5}}>{messageText(msg)}</div>;})}</div><div style={{display:"flex",gap:10}}><input aria-label={`Message ${thread.name}`} value={thread.draft||""} onChange={e=>setMessages(ms=>ms.map(m=>m.id===thread.id?{...m,draft:e.target.value}:m))} onKeyDown={e=>e.key==="Enter"&&sendMessage(thread.id)} placeholder={`Message ${thread.name}`} className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",minWidth:0}}/><GBtn onClick={()=>sendMessage(thread.id)} style={{display:"inline-flex",alignItems:"center",gap:8}}><Icon name="send" size={15} color="#fff"/> Send</GBtn></div></div>}</div></div>;
}
function ProfilePanel({profile,setEditProfile,stats}){
  const profileInitials=(profile.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  const detailRows=[["First step",profile.goal],["Looking for",profile.lookingFor],["Field",profile.industry||"Exploring"]].filter(([,v])=>v);
  return <div className="directory-wrap" style={{maxWidth:860}}><div className="profile-hero" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,overflow:"hidden",marginBottom:12,boxShadow:"0 18px 44px rgba(15,23,42,0.04)"}}><div style={{height:146,background:safeImageUrl(profile.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profile.coverUrl)}")`:GR}}/><div style={{padding:"0 28px 26px"}}><div className="profile-hero-row" style={{display:"grid",gridTemplateColumns:"104px minmax(0,1fr) auto",alignItems:"end",gap:18,marginTop:-38}}><Av i={profileInitials} src={profile.avatarUrl} size={104} style={{background:"#fff",color:C.accent,border:"6px solid #fff",boxShadow:"0 12px 28px rgba(15,23,42,0.12)"}}/><div className="profile-hero-copy" style={{minWidth:0,paddingTop:44}}><h1 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:0,overflowWrap:"anywhere",color:C.text,lineHeight:1.02}}>{profile.name||"Your Name"}</h1><div style={{color:C.muted,overflowWrap:"anywhere",marginTop:7,fontSize:14,fontWeight:700}}>{profileMeta(profile)}</div></div><button onClick={()=>setEditProfile(true)} className="bs profile-edit-button" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"11px 17px",fontWeight:900,alignSelf:"center",whiteSpace:"nowrap"}}>Edit profile</button></div>{profile.headline&&<div style={{fontSize:16,fontWeight:900,color:C.text,marginTop:18,overflowWrap:"anywhere"}}>{profile.headline}</div>}<p style={{marginTop:14,maxWidth:760,lineHeight:1.65,color:C.tSoft,overflowWrap:"anywhere",fontSize:15}}>{profile.bio||"Building in public, meeting ambitious founders, and turning fear into useful momentum."}</p>{profile.website&&<a href={profile.website} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.accent,fontWeight:900,fontSize:13,marginTop:12,textDecoration:"none",overflowWrap:"anywhere"}}><Icon name="link" size={15}/> {profile.website.replace(/^https?:\/\//,"")}</a>}<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>{detailRows.map(([k,v])=><span key={k} style={{background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}: {v}</span>)}</div></div></div><div className="profile-stats" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{stats.map(([k,v])=><div key={k} style={{...cardStyle,padding:18,borderRadius:16}}><div style={{fontSize:25,fontWeight:900,color:C.text,lineHeight:1}}>{v}</div><div style={{fontSize:12,color:C.muted,marginTop:6}}>{k}</div></div>)}</div></div>;
}
function PublicProfilePanel({profile,onBack,onConnect,onMessage}){
  const profileInitials=(profile.av||(profile.name||"FO").split(" ").map(s=>s[0]).slice(0,2).join("")).toUpperCase()||"FO";
  const stats=[
    ["Followers",fmt(profile.followers)],
    ["Mutuals",fmt(profile.mutual)],
    ["Field",profile.industry||"Exploring"],
  ];
  const details=[["First step",profile.goal],["Looking for",profile.lookingFor],["Headline",profile.headline]].filter(([,v])=>v);
  return <div className="directory-wrap" style={{maxWidth:860}}><button onClick={onBack} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"9px 14px",fontSize:13,fontWeight:900,color:C.text,marginBottom:14,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="close" size={14}/> Back</button><div className="profile-hero" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,overflow:"hidden",marginBottom:12,boxShadow:"0 18px 44px rgba(15,23,42,0.04)"}}><div style={{height:146,background:safeImageUrl(profile.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profile.coverUrl)}")`:GR}}/><div style={{padding:"0 28px 26px"}}><div className="profile-hero-row" style={{display:"grid",gridTemplateColumns:"104px minmax(0,1fr) auto",alignItems:"end",gap:18,marginTop:-38}}><Av i={profileInitials} src={profile.avatarUrl} size={104} style={{background:"#fff",color:C.accent,border:"6px solid #fff",boxShadow:"0 12px 28px rgba(15,23,42,0.12)"}} online/><div className="profile-hero-copy" style={{minWidth:0,paddingTop:44}}><h1 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:0,overflowWrap:"anywhere",color:C.text,lineHeight:1.02}}>{profile.name}</h1><div style={{color:C.muted,overflowWrap:"anywhere",marginTop:7,fontSize:14,fontWeight:700}}>{profileMeta(profile)}</div></div>{profile.id&&<div className="profile-action-row" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end",alignSelf:"center"}}><button onClick={onMessage} className="bs" style={{background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}><Icon name="send" size={15}/> Message</button><GBtn onClick={onConnect} style={{background:profile.connected?"#fff":GR,color:profile.connected?C.accent:"#fff",boxShadow:"none",whiteSpace:"nowrap"}}>{profile.connected?"Connected":"Connect"}</GBtn></div>}</div>{profile.headline&&<div style={{fontSize:16,fontWeight:900,color:C.text,marginTop:18,overflowWrap:"anywhere"}}>{profile.headline}</div>}<p style={{marginTop:14,maxWidth:760,lineHeight:1.65,color:C.tSoft,overflowWrap:"anywhere",fontSize:15}}>{profile.bio}</p>{profile.website&&<a href={profile.website} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.accent,fontWeight:900,fontSize:13,marginTop:12,textDecoration:"none",overflowWrap:"anywhere"}}><Icon name="link" size={15}/> {profile.website.replace(/^https?:\/\//,"")}</a>}<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>{details.map(([k,v])=><span key={k} style={{background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}: {v}</span>)}</div></div></div><div className="profile-stats" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{stats.map(([k,v])=><div key={k} style={{...cardStyle,padding:18,borderRadius:16}}><div style={{fontSize:typeof v==="string"&&v.length>12?15:24,fontWeight:900,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1}}>{v}</div><div style={{fontSize:12,color:C.muted,marginTop:6}}>{k}</div></div>)}</div></div>;
}

function ModalShell({title,eyebrow,onClose,children}){
  const titleId=`modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,.62)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={onClose} onKeyDown={e=>e.key==="Escape"&&onClose()}>
      <div style={{width:"min(760px,100%)",maxHeight:"88vh",overflow:"auto",background:"#fff",borderRadius:22,padding:28,boxShadow:"0 30px 100px rgba(0,0,0,.35)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"start",marginBottom:20}}>
          <div>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{eyebrow}</div>
            <h2 id={titleId} style={{fontFamily:"Georgia,serif",fontSize:34,lineHeight:1.05,color:C.text,letterSpacing:0}}>{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="bs" style={{width:38,height:38,borderRadius:"50%",border:`1px solid ${C.border}`,background:"#fff",color:C.text,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="close" size={18} color="currentColor"/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TermsConditionsPanel({onClose}){
  const section=(title,body)=><div style={{borderTop:`1px solid ${C.border}`,paddingTop:18,marginTop:18}}><h3 style={{fontSize:16,color:C.text,marginBottom:8}}>{title}</h3><p style={{fontSize:14,color:C.tSoft,lineHeight:1.75}}>{body}</p></div>;
  return (
    <ModalShell title="Terms and Conditions" eyebrow="Legal" onClose={onClose}>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18}}>Last updated July 6, 2026. These Terms govern access to and use of fear.social. They are a practical operating baseline and should be reviewed by legal counsel before broad public launch.</p>
      {section("Acceptance of Terms","By creating an account, checking the agreement box, accessing the platform, or using any fear.social feature, you agree to these Terms, the Privacy Policy, and any community or safety rules shown in the product. If you do not agree, do not create an account or use the service.")}
      {section("Purpose of the Platform","fear.social is designed to help people take practical first steps into business, entrepreneurship, projects, networking, mentorship, and professional collaboration. The service may include profiles, posts, comments, messaging, notifications, directories, events, rooms, opportunities, and future paid tools.")}
      {section("Eligibility","You must be legally able to agree to these Terms. fear.social is not intended for children under 13. If you are under the age of majority where you live, you should use the service only with permission from a parent or guardian.")}
      {section("Accounts and Security","You are responsible for accurate account information, keeping your password secure, and activity that happens through your account. Do not impersonate anyone, create misleading accounts, sell or transfer accounts without permission, or use another person's account. Notify contact@fear.social if you believe your account has been compromised.")}
      {section("User Content","You keep ownership of content you post, upload, message, or submit. You grant fear.social a worldwide, non-exclusive, royalty-free license to host, store, reproduce, display, process, transmit, and distribute that content as needed to operate, improve, protect, and promote the service. You represent that you have the rights needed to share your content.")}
      {section("Direct Messages and Communications","Direct messages are part of the service and may be stored, processed, moderated, or reviewed when needed for safety, abuse prevention, legal compliance, support, or platform operations. Do not use messages for harassment, spam, scams, unlawful offers, or unwanted solicitation.")}
      {section("Community Conduct","Do not harass, threaten, exploit, spam, deceive, discriminate against, or abuse other users. Do not post or send content that is hateful, sexually exploitative, violent, illegal, invasive of privacy, infringing, malicious, or designed to manipulate users or the platform.")}
      {section("Prohibited Uses","You may not scrape the service, attack the infrastructure, bypass security, upload malware, reverse engineer non-public systems, automate abusive activity, interfere with other users, misrepresent business opportunities, or use fear.social for unlawful, fraudulent, or harmful purposes.")}
      {section("Security Testing and Reports","If you believe you found a vulnerability, report it to contact@fear.social with steps to reproduce, affected URLs, timestamps, and any request IDs. Do not access other users' data, run denial-of-service testing, spam the service, or publicly disclose an issue before we have had a reasonable chance to investigate and fix it.")}
      {section("Business Opportunities and User Interactions","Users are responsible for evaluating collaborators, mentors, jobs, gigs, investments, services, advice, and opportunities they discover through fear.social. We do not guarantee any user's identity, qualifications, results, funding, employment, partnership, or business outcome.")}
      {section("No Professional Advice","fear.social does not provide legal, financial, tax, investment, medical, employment, or other professional advice. Content on the platform is for general community and informational purposes. Verify important decisions with qualified professionals.")}
      {section("Payments and Future Paid Plans","Some features may later require payment, subscription, checkout, or separate terms. Pricing, billing cycles, refunds, trials, plan limits, and availability may change before or after paid tools launch. Any paid feature will be presented before purchase.")}
      {section("Email, Verification, and Notifications","By signing up, you agree that fear.social may send verification, security, account, signup, transactional, and service-related emails to the email address on your account, including from contact@fear.social. You may also receive in-app notifications for follows, messages, comments, account activity, and platform updates.")}
      {section("Privacy and Data","Your use of fear.social is also governed by the Privacy Policy. The platform may collect account details, profile information, posts, messages, comments, activity data, device/session data, and other information needed to provide and secure the service.")}
      {section("Moderation and Enforcement","fear.social may remove content, limit visibility, suspend features, revoke access, delete accounts, preserve evidence, or report activity when we believe it is necessary to protect users, comply with law, enforce these Terms, or maintain platform integrity.")}
      {section("Intellectual Property","fear.social, its branding, logos, design, software, and platform features are owned by fear.social or its licensors. You may not copy, misuse, or present fear.social branding or platform materials as your own without permission.")}
      {section("Third-Party Links and Services","The platform may link to third-party websites, tools, profiles, payment systems, or services. fear.social is not responsible for third-party content, policies, availability, security, or transactions. Use third-party services at your own risk.")}
      {section("Service Changes and Availability","fear.social is an evolving product. Features may be changed, limited, paused, removed, or unavailable. Beta features may contain errors or downtime. We do not guarantee uninterrupted access, message delivery timing, data availability, or that all features will remain free or unchanged.")}
      {section("Disclaimers","The service is provided as is and as available, without warranties of any kind to the fullest extent permitted by law. fear.social does not guarantee business success, user behavior, opportunity quality, message delivery, or the accuracy of user-generated content.")}
      {section("Limitation of Liability","To the fullest extent permitted by law, fear.social and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, lost profits, lost opportunities, lost data, or harm arising from use of or inability to use the service.")}
      {section("Indemnity","You agree to defend, indemnify, and hold harmless fear.social and its operators from claims, damages, liabilities, losses, and expenses arising from your content, your use of the service, your violation of these Terms, or your violation of another person's rights.")}
      {section("Termination","You may stop using fear.social at any time. We may suspend or terminate access if we believe you violated these Terms, created risk, broke the law, abused the platform, or harmed users. You may request account deletion or data help by contacting contact@fear.social.")}
      {section("Changes to Terms","We may update these Terms as the product changes. Material updates may be shown in the app or sent by email. Continued use after updates means you accept the revised Terms. The version accepted at signup may be stored with your account.")}
      {section("Contact","Questions, account requests, legal notices, privacy concerns, or safety reports can be sent to contact@fear.social.")}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:24}}>
        <GBtn onClick={onClose}>I understand</GBtn>
      </div>
    </ModalShell>
  );
}

function PrivacyPolicyPanel({onClose,onOpenAccessibility}){
  const section=(title,body)=><div style={{borderTop:`1px solid ${C.border}`,paddingTop:18,marginTop:18}}><h3 style={{fontSize:16,color:C.text,marginBottom:8}}>{title}</h3><p style={{fontSize:14,color:C.tSoft,lineHeight:1.75}}>{body}</p></div>;
  return (
    <ModalShell title="Privacy Policy" eyebrow="Legal" onClose={onClose}>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18}}>Last updated June 1, 2026. This policy describes how fear.social collects, uses, stores, and protects information. It is a practical baseline and should be reviewed by legal counsel before broad public launch.</p>
      {section("Information We Collect","When someone signs up, joins the waitlist, posts, comments, messages, RSVPs, requests mentors, or edits a profile, fear.social may collect the information they provide, including name, username, email, profile details, messages, posts, comments, and account activity. We also store session and security data needed to keep accounts working.")}
      {section("How We Use Information","We use information to create accounts, verify email addresses, operate the social platform, send requested registration and waitlist notices, prevent abuse, improve reliability, and respond to user requests. We do not sell personal information.")}
      {section("Cookies and Local Storage","fear.social uses essential local storage for sign-in state, cookie preference storage, accessibility preferences, and basic app functionality. Optional analytics or marketing cookies should remain off unless you add those services and receive consent where required.")}
      {section("Sharing and Processors","Information may be processed by infrastructure providers used to run the site, including Cloudflare services for hosting, database, and serverless functions. Information may also be disclosed if required by law or needed to protect users, the service, or the public.")}
      {section("Security","The site uses HTTPS through Cloudflare, security headers, database-backed records, email verification, and restricted browser permissions. No internet service can guarantee that it is impossible to compromise, so security is maintained as an ongoing process.")}
      {section("User Choices","Users can request access, correction, or deletion of account data by contacting contact@fear.social. Accessibility controls are available in the site settings.")}
      {section("Children","fear.social is not intended for children under 13. If a child has submitted personal information, contact contact@fear.social so it can be removed.")}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:24}}>
        <GBtn onClick={onClose}>Done</GBtn>
        <GhostBtn onClick={onOpenAccessibility}>Accessibility settings</GhostBtn>
      </div>
    </ModalShell>
  );
}

function AccessibilityPanel({settings,setSettings,onClose}){
  const toggle=(key)=>setSettings(s=>({...s,[key]:!s[key]}));
  const row=(key,title,text)=>(
    <button role="switch" aria-checked={settings[key]} onClick={()=>toggle(key)} className="bs" style={{width:"100%",display:"flex",alignItems:"center",gap:14,textAlign:"left",background:settings[key]?C.aLight:"#fff",border:`1.5px solid ${settings[key]?C.aSoft:C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
      <span aria-hidden="true" style={{width:44,height:24,borderRadius:999,background:settings[key]?C.accent:"#D7DCE5",position:"relative",flexShrink:0}}><span style={{position:"absolute",top:3,left:settings[key]?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .15s"}}/></span>
      <span><b style={{display:"block",color:C.text,fontSize:15,marginBottom:3}}>{title}</b><span style={{display:"block",color:C.muted,fontSize:13,lineHeight:1.5}}>{text}</span></span>
    </button>
  );
  return (
    <ModalShell title="Accessibility Settings" eyebrow="Display" onClose={onClose}>
      <p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginBottom:18}}>These settings are saved in this browser and can be changed any time.</p>
      {row("largeText","Larger text","Increases readable text and form control sizing across the app.")}
      {row("highContrast","Higher contrast","Boosts visual contrast for users who need stronger separation.")}
      {row("reduceMotion","Reduce motion","Turns off animated transitions, ticker movement, and hover motion where possible.")}
      <div style={{display:"flex",gap:10,justifyContent:"end",marginTop:20}}>
        <GhostBtn onClick={()=>setSettings({largeText:false,highContrast:false,reduceMotion:false})}>Reset</GhostBtn>
        <GBtn onClick={onClose}>Save settings</GBtn>
      </div>
    </ModalShell>
  );
}

function CookieConsent({consent,setConsent,onManage}){
  if(consent.choice)return null;
  return (
    <div className="cookie-notice" role="region" aria-label="Cookie notice" style={{position:"fixed",left:18,right:18,bottom:18,zIndex:8500,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
      <div className="cookie-card" style={{maxWidth:920,width:"100%",background:"#fff",border:`1px solid ${C.border}`,borderRadius:20,padding:18,boxShadow:"0 24px 90px rgba(0,0,0,.22)",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",pointerEvents:"auto"}}>
        <div style={{flex:"1 1 320px"}}>
          <b style={{display:"block",fontSize:15,color:C.text,marginBottom:4}}>Cookie and privacy choices</b>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.55}}>Essential storage keeps sign-in and preferences working. Optional cookies stay off unless you allow them.</p>
        </div>
        <div className="cookie-actions" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>setConsent({choice:"essential",analytics:false,marketing:false})} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.text}}>Essential only</button>
          <button onClick={onManage} className="bs" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.accent}}>Manage</button>
          <button onClick={()=>setConsent({choice:"all",analytics:true,marketing:true})} className="bs" style={{background:"#111318",border:"none",borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,color:"#fff"}}>Accept all</button>
        </div>
      </div>
    </div>
  );
}

function CookieSettingsPanel({consent,setConsent,onClose}){
  const [draft,setDraft]=useState({analytics:Boolean(consent.analytics),marketing:Boolean(consent.marketing)});
  const save=()=>{setConsent({choice:"custom",analytics:draft.analytics,marketing:draft.marketing});onClose();};
  return (
    <ModalShell title="Cookie Settings" eyebrow="Privacy" onClose={onClose}>
      <div style={{display:"grid",gap:12}}>
        <div style={{border:`1px solid ${C.border}`,borderRadius:14,padding:16}}><b>Essential storage</b><p style={{fontSize:13,color:C.muted,lineHeight:1.55,marginTop:5}}>Required for login sessions, security, cookie preferences, and accessibility settings. Always on.</p></div>
        {["analytics","marketing"].map(key=>(
          <button key={key} role="switch" aria-checked={draft[key]} onClick={()=>setDraft(d=>({...d,[key]:!d[key]}))} className="bs" style={{border:`1px solid ${draft[key]?C.aSoft:C.border}`,background:draft[key]?C.aLight:"#fff",borderRadius:14,padding:16,textAlign:"left",display:"flex",justifyContent:"space-between",gap:18}}>
            <span><b style={{textTransform:"capitalize"}}>{key}</b><span style={{display:"block",fontSize:13,color:C.muted,lineHeight:1.55,marginTop:5}}>{key==="analytics"?"Optional product analytics if added later.":"Optional marketing or retargeting cookies if added later."}</span></span>
            <span style={{fontWeight:900,color:draft[key]?C.accent:C.dim}}>{draft[key]?"On":"Off"}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"end",marginTop:20}}>
        <GhostBtn onClick={()=>{setConsent({choice:"essential",analytics:false,marketing:false});onClose();}}>Essential only</GhostBtn>
        <GBtn onClick={save}>Save choices</GBtn>
      </div>
    </ModalShell>
  );
}

export default function App(){
  const {toasts,notify,remove}=useToast();
  const [openPanel,setOpenPanel]=useState(null);
  const [accessibility,setAccessibility]=useLocalState("fear-accessibility",{largeText:false,highContrast:false,reduceMotion:false});
  const [cookieConsent,setCookieConsent]=useLocalState("fear-cookie-consent",{choice:null,analytics:false,marketing:false});
  const [themeMode,setThemeMode]=useLocalState("fear-theme","dark");
  const [routeHash,setRouteHash]=useState(()=>window.location.hash||"");
  useEffect(()=>{
    const onHashChange=()=>setRouteHash(window.location.hash||"");
    window.addEventListener("hashchange",onHashChange);
    return()=>window.removeEventListener("hashchange",onHashChange);
  },[]);
  const initialScreen=consumeOAuthToken()||routeHash.startsWith("#app")?"app":routeHash.startsWith("#login")?"login":routeHash.startsWith("#signup")?"signup":"landing";
  const [screenState,setScreenState]=useLocalState("fear-screen",initialScreen);
  useEffect(()=>{
    if(initialScreen!==screenState) setScreenState(initialScreen);
  },[initialScreen,screenState,setScreenState]);
  const [profile,setProfile]=useLocalState("fear-profile",{
    name:"Your Name",
    handle:"@yourhandle",
    email:"",
    location:"",
    industry:"Exploring",
    bio:"Building in public, meeting ambitious founders, and turning fear into useful momentum.",
    avatarUrl:"",
  });
  const setScreen=useCallback((next)=>{
    setScreenState(next);
    const nextHash=next==="app"?"#app":next==="login"?"#login":next==="signup"?"#signup":"";
    if(nextHash){
      window.history.replaceState(null,"",nextHash);
      setRouteHash(nextHash);
    }else{
      window.history.replaceState(null,"",window.location.pathname);
      setRouteHash("");
    }
  },[setScreenState,setRouteHash]);
  const signOut=useCallback(()=>{
    clearSessionToken();
    setScreenState("landing");
    if(window.location.hash==="#app") window.history.replaceState(null,"#",window.location.pathname);
    notify("Signed out");
  },[notify,setScreenState]);
  const screen=screenState;
  const a11yClass=[`theme-${themeMode}`,accessibility.largeText&&"a11y-large-text",accessibility.highContrast&&"a11y-high-contrast",accessibility.reduceMotion&&"a11y-reduce-motion"].filter(Boolean).join(" ");
  return(
    <>
      <style>{css}</style>
      <ToastCtx toasts={toasts} remove={remove}/>
      <div className={a11yClass} style={{minHeight:"100vh",background:screen==="app"&&themeMode==="light"?C.bg:C.dark}}>
        {screen!=="signup"&&screen!=="login"&&screen!=="app"&&<Navbar setScreen={setScreen} notify={notify} onOpenPanel={setOpenPanel} themeMode={themeMode} setThemeMode={setThemeMode}/>}
        {screen==="landing"&&<LandingPage setScreen={setScreen} notify={notify} onOpenPanel={setOpenPanel}/>}
        {(screen==="signup"||screen==="login")&&<SignupPage setScreen={setScreen} notify={notify} setProfile={setProfile} initialMode={screen==="login"?"login":"signup"} themeMode={themeMode} setThemeMode={setThemeMode}/>}
        {screen==="app"&&<PlatformApp notify={notify} setScreen={setScreen} signOut={signOut} profile={profile} setProfile={setProfile} themeMode={themeMode} setThemeMode={setThemeMode}/>}
        <button onClick={()=>setOpenPanel("accessibility")} aria-label="Open accessibility settings" className="bs" style={{position:"fixed",left:18,bottom:cookieConsent.choice?18:128,zIndex:8400,width:48,height:48,borderRadius:"50%",border:`1px solid ${C.border}`,background:"#fff",boxShadow:"0 12px 40px rgba(0,0,0,.18)",color:C.text,fontWeight:900}}>Aa</button>
        <CookieConsent consent={cookieConsent} setConsent={setCookieConsent} onManage={()=>setOpenPanel("cookies")}/>
        {openPanel==="privacy"&&<PrivacyPolicyPanel onClose={()=>setOpenPanel(null)} onOpenAccessibility={()=>setOpenPanel("accessibility")}/>}
        {openPanel==="accessibility"&&<AccessibilityPanel settings={accessibility} setSettings={setAccessibility} onClose={()=>setOpenPanel(null)}/>}
        {openPanel==="cookies"&&<CookieSettingsPanel consent={cookieConsent} setConsent={setCookieConsent} onClose={()=>setOpenPanel(null)}/>}
      </div>
    </>
  );
}
