import { useState, useEffect, useCallback, useRef } from "react";

const GR = "linear-gradient(135deg, #090B0D 0%, #14171B 72%, #16C74E 100%)";
const GR2 = "linear-gradient(135deg, #050607 0%, #0B0D10 62%, #102417 100%)";
const GRT = { background:GR, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };
const OFFICIAL_FEAR_USER_ID = "fear-social-official";
const OFFICIAL_FEAR_HANDLE = "@fear.social";
const FEAR_BOARD_TOOLS = [
  {name:"fear.agency",icon:"megaphone",label:"Personal brand growth",copy:"Build your identity, promote yourself with purpose, and grow a personal brand people remember."},
  {name:"fear.style",icon:"heart",label:"Lifestyle and wellness",copy:"Track your goals, habits, health, and routines, then get personalized recommendations for improving your everyday life."},
  {name:"fear.prod",icon:"camera",label:"Photo, video and audio",copy:"Your first step for producing campaigns, videos, photography, recordings, and the media behind what you want to promote."},
  {name:"fearai",icon:"brain",label:"Learn, build and connect",copy:"Learn how AI works, shape an idea into a real product, and find the people who can help you build it."},
  {name:"fear.finance",icon:"briefcase",label:"Markets and financial news",copy:"Stay current with the market information, financial context, and news you need to remain informed and in the loop."},
];
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
html{scroll-behavior:smooth;background:#050506;min-height:100%;width:100%;overflow-x:clip;overflow-y:auto;overscroll-behavior-x:none;scrollbar-gutter:stable;}
body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;width:100%;max-width:100%;overflow-x:clip;overflow-y:visible;min-height:100dvh;overscroll-behavior-x:none;overscroll-behavior-y:auto;-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:auto;}
#root{width:100%;max-width:100%;min-height:100dvh;background:#050506;overflow-x:clip;}
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
@keyframes previewFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes previewSweep{0%{transform:translateX(-120%);opacity:0;}12%,70%{opacity:.9;}100%{transform:translateX(120%);opacity:0;}}
@keyframes signalRise{0%{transform:translateY(18px);opacity:0;}18%,82%{opacity:1;}100%{transform:translateY(-18px);opacity:0;}}
@keyframes softBlink{0%,100%{opacity:.45;}50%{opacity:1;}}
@keyframes orbitSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes ambientDrift{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(18px,-24px,0) scale(1.08);}}
@keyframes scanLine{0%{transform:translateY(-20%);opacity:0;}18%,72%{opacity:.65;}100%{transform:translateY(120%);opacity:0;}}
@keyframes cardBreath{0%,100%{transform:translateY(0) rotate(var(--tilt,0deg));}50%{transform:translateY(-8px) rotate(var(--tilt,0deg));}}
@keyframes cinematicSweep{0%{transform:translateX(-120%) rotate(12deg);opacity:0;}18%,70%{opacity:.55;}100%{transform:translateX(120%) rotate(12deg);opacity:0;}}
@keyframes haloPulse{0%,100%{transform:scale(.96);opacity:.44;}50%{transform:scale(1.08);opacity:.82;}}
@keyframes typeReveal{from{clip-path:inset(0 100% 0 0);filter:blur(5px);}70%{filter:blur(0);}to{clip-path:inset(0 0 0 0);filter:blur(0);}}
@keyframes caretBlink{0%,48%{opacity:1;}49%,100%{opacity:0;}}
@keyframes cueFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(7px);}}
@keyframes introBloom{0%{opacity:0;transform:scale(.92);filter:blur(18px);}45%{opacity:.85;}100%{opacity:1;transform:scale(1);filter:blur(0);}}
@keyframes cinematicFog{0%,100%{transform:translate3d(-2%,1%,0) scale(1);opacity:.68;}50%{transform:translate3d(2%,-2%,0) scale(1.08);opacity:.9;}}
@keyframes navReveal{from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fadeUp 0.45s ease forwards;}
.glow{animation:glow 2s ease-in-out infinite;}
.ticker{animation:ticker 32s linear infinite;}
.preview-float{animation:previewFloat 5.5s ease-in-out infinite;}
.preview-sweep{animation:previewSweep 4.8s ease-in-out infinite;}
.signal-rise{animation:signalRise 5s ease-in-out infinite;}
.soft-blink{animation:softBlink 2.6s ease-in-out infinite;}
.landing-root{cursor:default;}
.landing-flow-canvas{position:absolute;inset:0 0 auto 0;width:100%;height:100dvh;z-index:0;pointer-events:none;opacity:var(--intro-opacity,1);transition:opacity .12s linear;will-change:opacity;}
.landing-wave-field{filter:saturate(.92) contrast(1.04);mix-blend-mode:screen;}
.landing-cursor-glow{position:fixed;left:0;top:0;width:clamp(420px,42vw,650px);height:clamp(420px,42vw,650px);z-index:0;pointer-events:none;border-radius:50%;transform:translate3d(50vw,24vh,0) translate(-50%,-50%);background:radial-gradient(circle,rgba(22,199,78,.2) 0%,rgba(22,199,78,.09) 30%,rgba(22,199,78,.035) 48%,transparent 70%);filter:blur(14px);mix-blend-mode:screen;opacity:var(--intro-opacity,1);will-change:transform,opacity;}
.landing-flow-scrim{position:absolute;inset:0 0 auto 0;height:100dvh;z-index:0;pointer-events:none;background:radial-gradient(112% 92% at 50% 47%,rgba(5,5,6,.68) 0%,rgba(5,5,6,.58) 25%,rgba(5,5,6,.34) 54%,rgba(5,5,6,.08) 100%);}
.landing-flow-grain{position:absolute;inset:0 0 auto 0;height:100dvh;z-index:0;pointer-events:none;opacity:.11;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.34'/%3E%3C/svg%3E");mix-blend-mode:soft-light;}
.landing-progress{display:none;position:fixed;right:20px;top:18vh;width:3px;height:64vh;border-radius:999px;background:rgba(255,255,255,.08);z-index:80;overflow:hidden;}
.landing-progress span{display:block;width:100%;border-radius:999px;background:linear-gradient(180deg,#16C74E,#B8F5CE);box-shadow:0 0 22px rgba(22,199,78,.5);}
.landing-ambient{animation:ambientDrift 9s ease-in-out infinite;}
.landing-orbit{animation:orbitSpin 34s linear infinite;transform-origin:center;}
.landing-scan{animation:scanLine 5.5s ease-in-out infinite;}
.landing-motion-card{animation:cardBreath 6s ease-in-out infinite;}
.landing-cinematic-sweep{animation:cinematicSweep 8s ease-in-out infinite;}
.landing-halo{animation:haloPulse 4.4s ease-in-out infinite;}
.landing-magnetic{transition:transform .18s ease,border-color .18s ease,background .18s ease;}
.landing-magnetic:hover{transform:translateY(-6px) scale(1.015);border-color:rgba(22,199,78,.36)!important;}
.fear-board-tool{transition:transform .2s ease,border-color .2s ease,background .2s ease;}
.fear-board-tool:hover{transform:translateY(-4px);border-color:rgba(22,199,78,.38)!important;background:rgba(22,199,78,.07)!important;}
.fear-board-tool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
.fear-board-tool-grid .fear-board-tool:last-child{grid-column:1/-1;}
.fear-board-page-grid{display:grid;grid-template-columns:minmax(0,.82fr) minmax(420px,1.18fr);gap:40px;align-items:start;}
.fear-board-suite-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.fear-board-suite-grid .fear-board-tool:last-child{grid-column:1/-1;}
.landing-scroll-step{opacity:.62;transition:opacity .2s ease,transform .2s ease,border-color .2s ease;}
.landing-scroll-step:hover{opacity:1;transform:translateX(8px);border-color:rgba(22,199,78,.32)!important;}
.landing-world-node{transition:transform .18s ease,background .18s ease,border-color .18s ease;}
.landing-world-node:hover{transform:translateY(-6px) scale(1.02);background:rgba(22,199,78,.13)!important;border-color:rgba(22,199,78,.38)!important;}
.landing-immersive-stage .landing-sticky-world{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;align-content:center!important;min-height:560px!important;padding:26px!important;}
.landing-immersive-stage .landing-world-core{position:relative!important;left:auto!important;top:auto!important;transform:none!important;grid-column:1/-1!important;margin:0 auto 8px!important;width:132px!important;height:132px!important;font-size:31px!important;}
.landing-immersive-stage .landing-world-node{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;min-height:145px!important;margin:0!important;background:rgba(255,255,255,.065)!important;}
.landing-immersive-stage .landing-orbit-ring{display:none!important;}
.landing-immersive-stage .landing-scroll-step{opacity:1;}
.landing-immersive-stage h2{max-width:720px;}
.landing-cinema-card b{color:#fff;}
.landing-cinema-card p{color:rgba(255,255,255,.58);}
.landing-cinema-card{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.1);border-radius:28px;box-shadow:0 34px 120px rgba(0,0,0,.3);}
.landing-cinema-card:before{content:"";position:absolute;inset:-30% auto -30% -35%;width:32%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transform:rotate(12deg);animation:cinematicSweep 9s ease-in-out infinite;pointer-events:none;}
.landing-story-button{transition:transform .18s ease,border-color .18s ease,background .18s ease;}
.landing-story-button:hover{transform:translateX(8px);border-color:rgba(22,199,78,.42)!important;background:rgba(22,199,78,.12)!important;}
.landing-intro-copy{position:fixed;inset:0;width:100%;height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1;padding:0 16px;pointer-events:none;will-change:transform,opacity;transform:translate3d(0,var(--intro-y,0px),0) scale(var(--intro-scale,1));opacity:var(--intro-opacity,1);}
.landing-intro-copy:before{content:"";position:absolute;inset:18% auto auto 50%;width:min(720px,92vw);aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle, rgba(22,199,78,.2), rgba(22,199,78,.06) 42%, transparent 70%);filter:blur(18px);animation:introBloom 2.8s ease both, cinematicFog 9s ease-in-out infinite;pointer-events:none;}
.landing-intro-copy:after{content:"";position:absolute;left:50%;bottom:7vh;width:1px;height:72px;background:linear-gradient(180deg, transparent, rgba(22,199,78,.65), transparent);opacity:.7;animation:introBloom 2.8s ease 2.3s both;pointer-events:none;}
.landing-typed-headline{z-index:1;text-shadow:0 0 44px rgba(22,199,78,.13),0 24px 80px rgba(0,0,0,.62);}
.landing-type-line{display:block;width:max-content;max-width:100%;margin:0 auto;overflow:hidden;clip-path:inset(0 100% 0 0);animation:typeReveal 1.45s steps(18,end) forwards;color:#fff;}
.landing-type-line-second{animation-delay:1.55s;animation-duration:1.05s;color:#fff;}
.landing-fear-word{color:#16C74E;}
.landing-type-line-caret{position:relative;}
.landing-type-line-caret:after{content:"";display:inline-block;width:.08em;height:.82em;margin-left:.08em;background:#16C74E;vertical-align:-.05em;animation:caretBlink .78s steps(1,end) infinite;}
.landing-scroll-cue{animation:cueFloat 2.2s ease-in-out infinite;}
.landing-after-intro{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;margin-top:100dvh;padding:24px 0 0;will-change:transform,opacity;opacity:var(--after-opacity,0);transform:translate3d(0,var(--after-y,90px),0);}
.landing-hero{padding:0 32px 96px!important;justify-content:flex-start!important;min-height:205dvh!important;}
@media(prefers-reduced-motion:reduce){.landing-type-line{animation:none!important;clip-path:none!important;filter:none!important;}.landing-type-line-caret:after{display:none!important;}.landing-flow-canvas{opacity:.42!important;}.landing-cursor-glow{filter:blur(18px)!important;}}
.a11y-reduce-motion .landing-type-line{animation:none!important;clip-path:none!important;filter:none!important;}
.a11y-reduce-motion .landing-type-line-caret:after{display:none!important;}
.ch{transition:all 0.22s ease;}.ch:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(22,199,78,0.12);border-color:rgba(22,199,78,0.3)!important;}
.ch{box-shadow:0 10px 32px rgba(13,15,20,0.035);}
.bs{transition:all 0.15s ease;}.bs:hover{transform:translateY(-2px);filter:brightness(1.08);}.bs:active{transform:scale(0.96);}
.nl:hover{color:#16C74E!important;}
.if:focus{border-color:#16C74E!important;box-shadow:0 0 0 3px rgba(22,199,78,0.18)!important;}
input[type="search"]::-webkit-search-decoration,input[type="search"]::-webkit-search-cancel-button,input[type="search"]::-webkit-search-results-button,input[type="search"]::-webkit-search-results-decoration{display:none;}
.desktop-app-search{background-image:none!important;}
.mobile-app-search{display:none;}
.mobile-section-tabs{display:none;}
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
.theme-light{background:#F7F8FA;color:#0D0F14;min-height:100dvh;}
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
.theme-light .landing-product-peek,.theme-light .landing-workflow{background:#F7F8FA!important;}
.theme-light .landing-signal-engine{background:#FFFFFF!important;}
.theme-light .landing-product-peek h2,.theme-light .landing-workflow h2,.theme-light .landing-signal-engine h2{color:#0D0F14!important;}
.theme-light .landing-product-peek p,.theme-light .landing-workflow p,.theme-light .landing-signal-engine p{color:#5C6675!important;}
.theme-light .landing-mini-app{background:#FFFFFF!important;border-color:#E5E9F0!important;box-shadow:0 30px 90px rgba(13,15,20,0.1)!important;}
.theme-light .landing-mini-card{background:#F7F8FA!important;border-color:#E5E9F0!important;color:#0D0F14!important;}
.theme-light .landing-mini-card div,.theme-light .landing-mini-card p,.theme-light .landing-mini-card span:not([style*="background"]){color:#0D0F14!important;}
.theme-light .landing-mini-card button:first-of-type{background:#FFFFFF!important;color:#0D0F14!important;border-color:#D9E0EA!important;}
.theme-light .landing-mini-card button:last-of-type{background:#16C74E!important;color:#FFFFFF!important;border-color:#16C74E!important;}
.theme-light .landing-platform p,.theme-light .landing-launch p,.theme-light .landing-cta p{color:#5C6675!important;}
.theme-light .landing-feature-grid .ch,.theme-light .landing-testimonial-grid .ch{background:#FFFFFF!important;border-color:#E5E9F0!important;box-shadow:0 18px 55px rgba(13,15,20,0.06)!important;}
.theme-light .landing-card-title{color:#0D0F14!important;}
.theme-light .landing-card-copy{color:#5C6675!important;}
.theme-light .icon-badge{background:#F1F4F8!important;border-color:#E1E6EE!important;}
.theme-light .landing-footer{border-top-color:#E5E9F0!important;}
.theme-light .landing-footer div:first-child{color:#0D0F14!important;}
.theme-light .landing-footer div:nth-child(2),.theme-light .landing-footer button{color:#687080!important;}
.theme-light .landing-cta button:last-child{background:#FFFFFF!important;color:#0D0F14!important;border-color:#E1E6EE!important;}
.theme-light .landing-cinematic-root,.theme-light .landing-cinematic-root .landing-hero,.theme-light .landing-cinematic-root .landing-dark-section,.theme-light .landing-cinematic-root .landing-platform,.theme-light .landing-cinematic-root .landing-launch,.theme-light .landing-cinematic-root .landing-cta,.theme-light .landing-cinematic-root .landing-footer{background:#050506!important;}
.theme-light .landing-cinematic-root .landing-hero{background:radial-gradient(circle at 50% 0%, rgba(22,199,78,.16), transparent 48%), #050506!important;}
.theme-light .landing-cinematic-root .landing-hero h1,.theme-light .landing-cinematic-root .landing-hero p,.theme-light .landing-cinematic-root .landing-dark-section h2,.theme-light .landing-cinematic-root .landing-platform h2,.theme-light .landing-cinematic-root .landing-launch h2,.theme-light .landing-cinematic-root .landing-cta h2{color:#fff!important;}
.theme-light .landing-cinematic-root .landing-hero p,.theme-light .landing-cinematic-root .landing-dark-section p,.theme-light .landing-cinematic-root .landing-platform p,.theme-light .landing-cinematic-root .landing-launch p,.theme-light .landing-cinematic-root .landing-cta p{color:rgba(255,255,255,.58)!important;}
.theme-light .landing-cinematic-root .landing-badge{background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.12)!important;}
.theme-light .landing-cinematic-root .landing-badge span:last-child{color:#F7F8FA!important;}
.theme-light .landing-cinematic-root .landing-proof-row div:last-child div:first-child{color:rgba(255,255,255,.72)!important;}
.theme-light .landing-cinematic-root .landing-proof-row div:last-child div:last-child{color:rgba(255,255,255,.36)!important;}
.theme-light .landing-cinematic-root .landing-ticker{background:#0B0C0E!important;border-color:rgba(255,255,255,.08)!important;}
.theme-light .landing-cinematic-root .landing-ticker span{color:rgba(255,255,255,.32)!important;}
.theme-light .landing-cinematic-root .landing-mini-app{background:rgba(16,17,20,.92)!important;border-color:rgba(255,255,255,.12)!important;box-shadow:0 34px 110px rgba(0,0,0,.45)!important;}
.theme-light .landing-cinematic-root .landing-mini-card{background:#15171C!important;border-color:rgba(255,255,255,.09)!important;color:#fff!important;}
.theme-light .landing-cinematic-root .landing-mini-card div,.theme-light .landing-cinematic-root .landing-mini-card p,.theme-light .landing-cinematic-root .landing-mini-card span:not([style*="background"]){color:rgba(255,255,255,.72)!important;}
.theme-light .landing-cinematic-root .landing-testimonial-grid .ch{background:#101114!important;border-color:rgba(255,255,255,.09)!important;box-shadow:none!important;}
.theme-light .landing-cinematic-root .landing-testimonial-grid .landing-card-title{color:#fff!important;}
.theme-light .landing-cinematic-root .landing-testimonial-grid .landing-card-copy{color:rgba(255,255,255,.62)!important;}
.theme-dark{background:#050506;color:#F7F8FA;min-height:100dvh;}
.theme-dark .app-view{background:#050506!important;color:#F7F8FA!important;}
.theme-dark .app-topbar{background:rgba(11,12,14,0.96)!important;border-bottom-color:#252830!important;}
.theme-dark .app-topbar-logo,.theme-dark .app-view h1,.theme-dark .app-view h2,.theme-dark .app-view b,.theme-dark .app-view strong{color:#F7F8FA!important;}
.theme-dark .app-shell,.theme-dark .directory-wrap{color:#F7F8FA!important;}
.theme-dark .desktop-feed-side>div,.theme-dark .mobile-profile-summary,.theme-dark .composer-card,.theme-dark .post-card,.theme-dark .directory-grid .ch,.theme-dark .message-list,.theme-dark .message-panel,.theme-dark .profile-stats>div,.theme-dark .edit-sheet{background:#101114!important;border-color:#252830!important;}
.theme-dark .app-view [style*="background: rgb(255, 255, 255)"],.theme-dark .app-view [style*="background: #fff"],.theme-dark .app-view [style*="background: #FFFFFF"],.theme-dark .app-view [style*="background: rgb(240, 242, 245)"],.theme-dark .app-view [style*="background: #F0F2F5"]{background:#15171C!important;border-color:#2C313A!important;color:#F7F8FA!important;}
.theme-dark .app-view [style*="background: rgb(232, 251, 240)"],.theme-dark .app-view [style*="background: #E8FBF0"]{background:rgba(22,199,78,.14)!important;border-color:rgba(22,199,78,.34)!important;color:#CFFFE0!important;}
.theme-dark .app-view [style*="color: rgb(13, 15, 20)"],.theme-dark .app-view [style*="color: #0D0F14"],.theme-dark .app-view [style*="color: rgb(42, 45, 56)"],.theme-dark .app-view [style*="color: #2A2D38"]{color:#F7F8FA!important;}
.theme-dark .app-view .message-bubble[style*="background: rgb(22, 199, 78)"]{background:#16C74E!important;color:#fff!important;}
.theme-dark .app-view .activity-unread{background:rgba(22,199,78,0.14)!important;border-color:rgba(22,199,78,0.32)!important;}
.theme-dark .app-view input,.theme-dark .app-view textarea,.theme-dark .app-view select,.theme-dark .desktop-app-search{background:#0B0C0E!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .app-view p,.theme-dark .app-view .directory-title,.theme-dark .app-view article p{color:rgba(255,255,255,0.72)!important;}
.theme-dark .app-view [style*="color: rgb(107, 114, 128)"],.theme-dark .app-view [style*="color: #6B7280"],.theme-dark .app-view [style*="color: rgb(156, 163, 175)"],.theme-dark .app-view [style*="color: #9CA3AF"]{color:rgba(255,255,255,0.48)!important;}
.tag-chip{background:var(--tag-bg,transparent);color:var(--tag-color,currentColor);border:1px solid var(--tag-border,transparent);}
.theme-dark .industry-tag{--tag-bg:rgba(22,199,78,0.16)!important;--tag-color:#CFFFE0!important;--tag-border:rgba(22,199,78,0.42)!important;text-shadow:none!important;}
.theme-dark .profile-directory-card{background:#15171C!important;border-color:#343A46!important;box-shadow:0 22px 70px rgba(0,0,0,0.28)!important;}
.theme-dark .profile-card-meta{color:rgba(255,255,255,0.62)!important;}
.theme-dark .profile-card-body,.theme-dark .profile-card-looking,.theme-dark .profile-card-followers{color:rgba(255,255,255,0.78)!important;}
.theme-dark .profile-card-looking b{color:#fff!important;}
.theme-dark .profile-card-secondary-btn{background:#101114!important;color:#fff!important;border-color:#3A414D!important;}
.theme-dark .profile-card-secondary-btn:hover{background:#1A1D24!important;border-color:rgba(22,199,78,0.5)!important;}
.theme-dark .profile-stat-button[aria-pressed="true"]{background:rgba(22,199,78,.14)!important;border-color:rgba(22,199,78,.38)!important;}
.theme-dark .profile-stat-button[aria-pressed="true"] div{color:#CFFFE0!important;}
.theme-dark .fear-club-feature{background:#101114!important;border-color:#2C313A!important;}
.theme-dark .fear-club-feature p{color:rgba(255,255,255,.62)!important;}
.theme-dark .mobile-bottom-nav{background:rgba(16,17,20,0.96)!important;border-color:#252830!important;}
.theme-dark .mobile-bottom-nav button{color:rgba(255,255,255,0.62)!important;}
.theme-dark .mobile-bottom-nav button.active{background:rgba(22,199,78,0.16)!important;color:#fff!important;}
.theme-dark .dm-thread-button[data-active="true"]{background:linear-gradient(135deg,rgba(22,199,78,0.22),rgba(22,199,78,0.1))!important;border-color:rgba(22,199,78,0.42)!important;}
.theme-dark .dm-thread-button[data-active="true"] .dm-thread-name{color:#fff!important;}
.theme-dark .dm-thread-button[data-active="true"] .dm-thread-preview{color:rgba(255,255,255,0.72)!important;}
.theme-dark .dm-thread-button[data-active="false"] .dm-thread-preview{color:rgba(255,255,255,0.44)!important;}
.theme-dark .signup-form-panel,.theme-dark .signup-form-panel>div,.theme-dark .cookie-card{background:#101114!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .signup-form-panel input,.theme-dark .signup-form-panel [style*="background: rgb(240, 242, 245)"]{background:#0B0C0E!important;color:#F7F8FA!important;border-color:#252830!important;}
.theme-dark .signup-form-panel div,.theme-dark .signup-form-panel label,.theme-dark .cookie-card p,.theme-dark .cookie-card b{color:rgba(255,255,255,0.72)!important;}
.signup-form-panel .signup-fast-note,.theme-dark .signup-form-panel .signup-fast-note{background:#102A19!important;border-color:#2F8C4F!important;color:#E6FFEE!important;}
.theme-dark .signup-form-panel .signup-title{color:#F7F8FA!important;}
.app-view button,.app-view input,.app-view textarea{max-width:100%;}
.app-view button,.app-view label.bs{line-height:1.15;overflow-wrap:normal;word-break:keep-all;}
.app-view button{white-space:nowrap;}
.app-view *,.landing-root *,.signup-root *{min-width:0;}
.app-view,.landing-root,.signup-root,.verify-shell{width:100%;max-width:100%;}
.app-view img,.app-view video,.landing-root img,.landing-root video{max-width:100%;height:auto;}
.density-compact .app-shell{padding:18px!important;}
.density-compact .post-card,.density-compact .composer-card,.density-compact .ch{border-radius:14px!important;}
.density-compact .composer-card,.density-compact .post-card>div:first-child{padding:16px!important;}
.layout-focus .desktop-feed-side{display:none!important;}
.layout-focus .feed-grid{grid-template-columns:minmax(0,760px)!important;justify-content:center!important;}
.post-card,.composer-card,.directory-grid .ch,.message-panel,.message-list,.profile-hero,.edit-sheet{overflow-wrap:anywhere;}
.post-media-grid img,.post-media-grid video{max-width:100%;}
.suggested-people-card{overflow:hidden;}
.suggested-person-row{border-radius:14px;}
.suggested-person-row:hover{background:rgba(22,199,78,0.06);}
.suggested-person-main,.suggested-person-name,.suggested-person-meta{min-width:0;max-width:100%;}
.suggested-person-actions button,.suggested-follow-btn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1;}
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
.landing-root,.app-view,.signup-root,.verify-shell{min-height:100dvh;}
.landing-root{background:#050506;padding-bottom:env(safe-area-inset-bottom);}
.landing-section{scroll-margin-top:92px;}
.landing-footer{padding-bottom:calc(32px + env(safe-area-inset-bottom))!important;}
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
@media(min-width:761px) and (max-width:1180px){
  .landing-progress{display:none!important;}
  .landing-cinematic-root .landing-hero{min-height:auto!important;padding:92px 24px 68px!important;display:block!important;text-align:center!important;}
  .landing-intro-copy{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;min-height:clamp(500px,78dvh,680px)!important;transform:none!important;opacity:1!important;padding:68px 18px 30px!important;}
  .landing-after-intro{position:relative!important;margin-top:0!important;padding-top:0!important;opacity:1!important;transform:none!important;}
  .landing-why,.landing-launch{padding:72px 28px!important;}
  .landing-why{padding-bottom:38px!important;}
  .landing-launch{padding-top:46px!important;}
  .landing-launch>div:first-child{margin-bottom:40px!important;}
  .landing-why>div:last-child{gap:28px!important;}
  .landing-orbit,.landing-ambient,.landing-scan,.landing-motion-card{animation:none!important;}
}
@media(min-width:761px) and (max-width:1180px) and (max-height:760px){
  .landing-intro-copy{min-height:520px!important;padding-top:54px!important;}
  .landing-why,.landing-launch{padding-top:56px!important;padding-bottom:56px!important;}
  .landing-why{padding-bottom:34px!important;}
  .landing-launch{padding-top:42px!important;}
  .landing-launch>div:first-child{margin-bottom:32px!important;}
}
@media(max-width:760px){
  html,body,#root{width:100%;max-width:100%;overflow-x:clip;}
  body{background:#050506;-webkit-font-smoothing:antialiased;touch-action:auto;}
  .landing-cursor-glow{width:360px;height:360px;filter:blur(18px);background:radial-gradient(circle,rgba(22,199,78,.12) 0%,rgba(22,199,78,.05) 34%,transparent 70%);}
  .ticker,.preview-float,.preview-sweep,.signal-rise,.soft-blink,.landing-orbit,.landing-ambient,.landing-scan,.landing-motion-card{animation:none!important;}
  .landing-cinematic-sweep,.landing-halo{animation:none!important;}
  .landing-progress{display:none!important;}
  .fear-board-tool-grid,.fear-board-suite-grid{grid-template-columns:1fr!important;}
  .fear-board-tool-grid .fear-board-tool:last-child,.fear-board-suite-grid .fear-board-tool:last-child{grid-column:auto!important;}
  .fear-board-page{padding:104px 14px 44px!important;}
  .fear-board-intro{position:static!important;top:auto!important;}
  .fear-board-principles{grid-template-columns:1fr!important;}
  .landing-magnetic:hover,.landing-scroll-step:hover,.landing-world-node:hover{transform:none!important;}
  .app-view{width:100%!important;max-width:100%!important;overflow-x:clip!important;font-size:15px;background:#F4F6F8!important;}
  .app-view h1,.app-view h2,.app-view h3,.app-view p,.app-view div,.app-view span,.app-view a{max-width:100%;}
  .app-view p,.app-view h1,.app-view h2,.app-view h3{overflow-wrap:anywhere;}
  .app-view button,.app-view .bs,.app-view label.bs{min-height:44px;}
  .app-view input,.app-view textarea,.app-view select{font-size:16px!important;}
  .ch:hover{transform:none;box-shadow:none;}
  .desktop-app-tabs,.desktop-app-search,.desktop-signout,.desktop-feed-side{display:none!important;}
  .mobile-app-search{display:block;margin-bottom:12px;}
  .mobile-section-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 0 12px;gap:6px;overflow:visible;padding:2px 0 8px;}
  .mobile-section-tabs::-webkit-scrollbar{display:none;}
  .mobile-section-tabs button{width:100%;min-width:0;min-height:42px;border:1px solid ${C.border};border-radius:999px;background:${C.card};color:${C.muted};padding:8px 5px;font-size:11px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;box-shadow:0 10px 24px rgba(13,15,20,.04);overflow:hidden;text-overflow:ellipsis;}
  .mobile-section-tabs button svg{width:14px;height:14px;flex:0 0 auto;}
  .mobile-section-tabs button.active{background:${C.accent};border-color:${C.accent};color:#fff;}
  .theme-dark .mobile-section-tabs button{background:#101114!important;border-color:#252830!important;color:rgba(255,255,255,.66)!important;}
  .theme-dark .mobile-section-tabs button.active{background:#16C74E!important;border-color:#16C74E!important;color:#fff!important;}
  .mobile-bottom-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:500;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);border:1px solid ${C.border};border-radius:18px;padding:6px;box-shadow:0 18px 60px rgba(13,15,20,.18);}
  .mobile-bottom-nav button{min-width:0;height:50px;border:none;background:transparent;border-radius:12px;padding:6px 1px;color:${C.muted};font-size:9.5px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;line-height:1.05;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mobile-bottom-nav button.active{background:${C.aLight};color:${C.accent};}
  .mobile-bottom-nav span{font-size:16px;line-height:1;display:flex;}
  .mobile-bottom-nav svg{width:17px;height:17px;}
  .app-topbar{min-height:58px!important;padding:7px 10px!important;gap:7px!important;flex-wrap:nowrap!important;overflow:hidden!important;box-shadow:0 8px 28px rgba(13,15,20,.06)!important;}
  .app-topbar-logo{font-size:18px!important;flex:1 1 auto;min-width:0;max-width:42vw;overflow:hidden;text-overflow:ellipsis;}
  .app-topbar>button{flex:0 0 auto;}
  .app-topbar>button[aria-label="Edit profile"]>div>div{width:34px!important;height:34px!important;font-size:11px!important;}
  .app-topbar>button[aria-label*="unread notifications"],.app-topbar .theme-toggle-button,.app-topbar .app-invite-button{width:38px!important;height:38px!important;min-height:38px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;}
  .app-shell{padding:12px max(10px,env(safe-area-inset-left)) calc(104px + env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-right))!important;width:100%!important;max-width:100%!important;min-width:0!important;}
  .app-shell>*,.feed-grid>*,.directory-wrap,.messages-grid,.profile-hero{width:100%;max-width:100%;min-width:0;}
  .feed-grid{display:block!important;}
  .mobile-profile-summary{display:block!important;}
  .mobile-profile-summary{padding:14px!important;border-radius:16px!important;}
  .composer-card{border-radius:18px!important;padding:12px!important;box-shadow:0 12px 34px rgba(13,15,20,.06)!important;}
  .composer-card>div{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;}
  .composer-card>div>div:first-child{display:none!important;}
  .composer-card textarea{min-height:96px!important;font-size:16px!important;line-height:1.5!important;padding:12px!important;border-radius:14px!important;}
  .composer-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important;padding-bottom:2px;margin-top:10px!important;}
  .composer-actions .post-type-btn,.composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{min-width:0!important;width:100%!important;padding:10px 6px!important;min-height:46px!important;font-size:13px!important;border-radius:12px!important;}
  .composer-actions .post-type-btn[data-label="Milestone"]{font-size:12.5px!important;}
  .composer-actions .composer-media-btn,.composer-actions .composer-publish-btn{grid-column:1/-1!important;margin-left:0!important;}
  .composer-actions .composer-media-btn{font-size:14px!important;}
  .composer-actions .composer-publish-btn{font-size:15px!important;}
  .post-card{border-radius:18px!important;margin-bottom:12px!important;box-shadow:0 12px 34px rgba(13,15,20,.05)!important;}
  .post-card>div:first-child{padding:14px!important;}
  .post-card .profile-link{align-items:flex-start!important;}
  .post-card .profile-link>div:last-child{max-width:100%;}
  .post-media-grid{grid-template-columns:1fr!important;}
  .post-media-grid>div{min-height:220px!important;}
  .groups-create-grid{grid-template-columns:1fr!important;}
  .opportunity-form-grid{grid-template-columns:1fr!important;}
  .opportunity-form-actions{display:grid!important;grid-template-columns:1fr!important;}
  .opportunity-form-actions button{width:100%!important;justify-content:center!important;}
  .post-actions{padding:10px 12px!important;gap:6px!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
  .post-actions button{font-size:12px!important;justify-content:center!important;margin-left:0!important;min-width:0!important;padding:8px 2px!important;white-space:nowrap!important;}
  .post-actions svg{width:16px!important;height:16px!important;flex:0 0 auto;}
  .suggested-people-card{padding:16px!important;border-radius:18px!important;}
  .suggested-people-title{font-size:22px!important;margin-bottom:6px!important;}
  .suggested-person-row{grid-template-columns:44px minmax(0,1fr)!important;gap:12px!important;padding:14px 0!important;border-radius:12px!important;}
  .suggested-person-row>div:first-child>div:first-child{width:44px!important;height:44px!important;font-size:13px!important;}
  .suggested-person-row>div:first-child>div:nth-child(2){width:13px!important;height:13px!important;}
  .suggested-person-top{grid-template-columns:minmax(0,1fr) minmax(86px,auto)!important;gap:8px!important;}
  .suggested-person-name{font-size:15px!important;line-height:1.15!important;}
  .suggested-person-meta{font-size:12px!important;line-height:1.2!important;}
  .suggested-follow-btn{min-height:40px!important;border-radius:12px!important;font-size:13px!important;padding:8px 10px!important;}
  .suggested-person-actions{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;}
  .suggested-person-actions button{min-height:40px!important;font-size:12px!important;border-radius:12px!important;padding:8px 6px!important;}
  .comment-row{display:grid!important;grid-template-columns:1fr!important;}
  .comment-row button{width:100%!important;}
  .filter-row{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;overflow:visible!important;gap:7px!important;}
  .filter-row button{min-width:0!important;min-height:42px!important;padding:9px 6px!important;overflow:hidden;text-overflow:ellipsis;font-size:12px!important;border-radius:12px!important;}
  .directory-grid{grid-template-columns:1fr!important;}
  .directory-wrap{padding-bottom:86px!important;}
  .directory-title{font-size:30px!important;line-height:1.08!important;}
  .dm-e2ee-note{font-size:11.5px!important;line-height:1.45!important;padding:10px!important;border-radius:12px!important;margin-bottom:12px!important;}
  .messages-grid{grid-template-columns:1fr!important;min-height:auto!important;gap:12px!important;}
  .message-list{display:grid!important;grid-template-columns:1fr!important;overflow:visible!important;gap:8px!important;padding:10px!important;border-radius:16px!important;max-height:none!important;}
  .message-list .dm-thread-button{min-width:0!important;width:100%!important;min-height:64px!important;padding:10px!important;border:1px solid transparent!important;}
  .message-list .dm-thread-button[aria-selected="true"]{border-color:${C.aSoft}!important;}
  .dm-thread-button>div:first-child>div:first-child{width:38px!important;height:38px!important;font-size:12px!important;}
  .dm-thread-copy{flex:1 1 auto!important;min-width:0!important;overflow:hidden!important;}
  .dm-thread-copy span,.dm-thread-copy div{min-width:0!important;max-width:100%!important;}
  .message-panel{min-height:calc(100dvh - 245px)!important;border-radius:16px!important;padding:12px!important;overflow:hidden!important;}
  .message-panel-header{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;padding-bottom:12px!important;}
  .message-panel-header>div:first-child>div:first-child{width:44px!important;height:44px!important;font-size:13px!important;}
  .message-panel-actions{grid-column:1/-1!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important;}
  .message-panel-actions button{width:100%!important;min-height:40px!important;justify-content:center!important;}
  .message-feed{padding:14px 0!important;max-height:52dvh!important;overflow-y:auto!important;overscroll-behavior:contain!important;}
  .message-row{max-width:92%!important;}
  .message-bubble{max-width:100%!important;font-size:14px!important;line-height:1.45!important;word-break:break-word!important;overflow-wrap:anywhere!important;}
  .message-compose{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;padding-top:2px!important;}
  .message-compose input{width:100%!important;min-height:48px!important;}
  .message-compose button{width:100%!important;justify-content:center!important;min-height:48px!important;}
  .settings-grid{grid-template-columns:1fr!important;}
  .settings-grid button[role="switch"]{display:grid!important;grid-template-columns:40px minmax(0,1fr) 44px!important;align-items:center!important;gap:11px!important;}
  .settings-grid button[role="switch"]>span:nth-child(2){min-width:0!important;overflow:hidden!important;}
  .settings-grid button[role="switch"]>span:nth-child(2)>span{white-space:normal!important;overflow-wrap:anywhere!important;}
  .profile-hero{padding:0!important;border-radius:20px!important;}
  .profile-hero>div:first-child{height:118px!important;}
  .profile-hero-row{display:grid!important;grid-template-columns:72px minmax(0,1fr)!important;align-items:end!important;gap:11px!important;margin-top:-30px!important;}
  .profile-hero-row>div:first-child{width:72px!important;height:72px!important;}
  .profile-hero-row>div:first-child>div:first-child{width:72px!important;height:72px!important;font-size:22px!important;border-width:5px!important;}
  .profile-hero-row>div:first-child>div:nth-child(2){width:16px!important;height:16px!important;}
  .profile-hero-copy{padding-top:30px!important;min-width:0!important;}
  .profile-hero-copy>div{font-size:12.5px!important;line-height:1.35!important;white-space:normal!important;overflow-wrap:anywhere!important;}
  .profile-hero h1{font-size:25px!important;line-height:1.08!important;display:block!important;max-width:100%!important;}
  .profile-hero h1 span{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere!important;}
  .profile-hero [style*="padding: 0px 28px 26px"]{padding:0 16px 20px!important;}
  .profile-edit-button,.profile-action-row{grid-column:1/-1;width:100%!important;margin-left:0!important;justify-content:stretch!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:10px!important;}
  .profile-edit-button{grid-template-columns:1fr!important;}
  .profile-action-row button{width:100%!important;justify-content:center!important;min-height:44px!important;padding:10px 8px!important;font-size:13px!important;}
  .profile-detail-row{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;}
  .profile-detail-chip{white-space:normal!important;text-overflow:clip!important;line-height:1.3!important;width:100%!important;display:block!important;}
  .profile-stats{grid-template-columns:repeat(2,1fr)!important;}
  .profile-stats>div{min-width:0!important;}
  .profile-stats>div div:first-child{font-size:22px!important;white-space:normal!important;overflow-wrap:anywhere!important;}
  .profile-stat-button{padding:14px!important;min-height:76px!important;}
  .profile-danger-zone{padding:14px!important;border-radius:16px!important;}
  .profile-danger-zone>div{display:grid!important;grid-template-columns:1fr!important;}
  .profile-danger-zone button{width:100%!important;}
  .edit-modal{align-items:flex-end!important;padding:0!important;}
  .edit-sheet{width:100%!important;border-radius:22px 22px 0 0!important;max-height:88vh!important;overflow:auto!important;padding:22px!important;}
  .profile-photo-editor{align-items:flex-start!important;flex-direction:column!important;}
  .profile-photo-editor>div:last-child{width:100%!important;}
  .edit-actions{display:grid!important;grid-template-columns:1fr!important;}
  .edit-actions button{width:100%!important;}
  .landing-nav{height:auto!important;padding:10px 10px!important;top:0!important;position:fixed!important;z-index:9000!important;opacity:1!important;transform:none!important;pointer-events:auto!important;}
  .landing-nav>div{height:56px!important;padding:0 7px 0 14px!important;gap:8px!important;pointer-events:auto!important;}
  .landing-nav>div>div:first-child{font-size:19px!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
  .landing-nav-links{display:none!important;}
  .landing-nav-actions{gap:6px!important;flex-shrink:0;pointer-events:auto!important;}
  .landing-nav-login,.landing-nav-join{padding:9px 11px!important;font-size:12px!important;min-height:42px!important;position:relative!important;z-index:2!important;touch-action:manipulation!important;}
  .theme-toggle-label{display:none!important;}
  .landing-hero{min-height:auto!important;padding:0 16px 54px!important;justify-content:flex-start!important;}
  .landing-intro-copy{min-height:100dvh!important;justify-content:center!important;padding:0 2px!important;}
  .landing-intro-copy:before{width:112vw!important;filter:blur(16px)!important;}
  .landing-intro-copy:after{bottom:6vh!important;height:54px!important;}
  .landing-hero h1{font-size:39px!important;line-height:1.04!important;margin-bottom:0!important;width:100%!important;}
  .landing-type-line{white-space:nowrap!important;}
  .landing-after-intro{padding-top:56px!important;}
  .landing-hero p{font-size:15px!important;line-height:1.58!important;margin-bottom:20px!important;}
  .landing-subhead{font-size:16px!important;margin-bottom:8px!important;}
  .landing-hero-copy{font-size:14.5px!important;max-width:355px!important;margin-left:auto!important;margin-right:auto!important;}
  .landing-badge{max-width:100%!important;align-items:center!important;}
  .landing-badge span:last-child{white-space:normal!important;line-height:1.25!important;text-align:left!important;}
  .landing-email{flex-direction:column!important;gap:8px!important;border-radius:30px!important;padding:8px!important;}
  .landing-email input,.landing-email button{width:100%!important;}
  .landing-email input{padding:13px 16px!important;}
  .landing-email button{padding:14px 18px!important;}
  .landing-scroll-cue{margin-top:22px!important;min-height:44px!important;}
  .landing-proof-row{margin-top:24px!important;gap:12px!important;}
  .landing-proof-row>div:first-child>div{width:34px!important;height:34px!important;font-size:10px!important;margin-left:-10px!important;}
  .landing-proof-row>div:first-child>div:first-child{margin-left:0!important;}
  .landing-proof-row>div:last-child div:first-child{font-size:12px!important;}
  .landing-proof-row>div:last-child div:last-child{font-size:11px!important;}
  .landing-saved-card{width:100%!important;max-width:360px!important;display:grid!important;grid-template-columns:1fr!important;text-align:left!important;padding:18px!important;}
  .landing-saved-card button{margin-left:0!important;width:100%!important;}
  .landing-section{padding:62px 16px!important;}
  .landing-section h2{font-size:34px!important;line-height:1.08!important;overflow-wrap:anywhere!important;}
  .landing-scroll-step>div{display:grid!important;grid-template-columns:52px minmax(0,1fr)!important;gap:10px!important;align-items:start!important;}
  .landing-scroll-step>div>span:first-child{display:block!important;min-width:52px!important;font-size:28px!important;text-align:left!important;}
  .landing-scroll-step>div>div{min-width:0!important;}
  .landing-scroll-step p{margin-top:2px!important;}
  .landing-feature-grid,.landing-testimonial-grid,.pricing-grid{grid-template-columns:1fr!important;}
  .landing-peek-grid,.landing-workflow-grid,.landing-proof-grid,.landing-community-cards,.landing-signal-grid,.landing-journey-grid,.landing-reels-grid,.landing-cinema-grid{grid-template-columns:1fr!important;}
  .landing-cinema-stage{min-height:auto!important;padding:18px!important;}
  .landing-cinema-card{border-radius:22px!important;}
  .landing-cinema-stage>div:last-child{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;grid-template-columns:1fr!important;margin-top:14px!important;}
  .landing-story-button:hover{transform:none!important;}
  .landing-signal-grid .landing-mini-card{transform:none!important;}
  .landing-immersive-stage{min-height:auto!important;padding:64px 16px!important;}
  .landing-sticky-world{position:relative!important;top:auto!important;min-height:520px!important;}
  .landing-scroll-step{opacity:1!important;transform:none!important;}
  .landing-world-node{position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;transform:none!important;margin-bottom:10px!important;}
  .landing-orbit-ring{display:none!important;}
  .landing-mini-app{border-radius:22px!important;padding:12px!important;margin-top:34px!important;animation:none!important;}
  .landing-hero-preview{margin-top:42px!important;}
  .landing-mini-topbar{overflow:hidden!important;}
  .landing-mini-topbar>span:first-child{font-size:16px!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
  .landing-mini-topbar .mini-nav-pill,.landing-mini-topbar .mini-live{display:none!important;}
  .landing-mini-shell{grid-template-columns:1fr!important;}
  .landing-demo-tabs{display:grid!important;grid-template-columns:1fr 1fr!important;}
  .landing-demo-tabs button{width:100%!important;justify-content:center!important;min-width:0!important;padding:10px 8px!important;}
  .landing-mini-card{min-width:0!important;overflow:hidden!important;}
  .landing-mini-card div,.landing-mini-card span,.landing-mini-card p,.landing-mini-card button{min-width:0!important;max-width:100%!important;}
  .landing-mini-card [style*="white-space: nowrap"]{white-space:normal!important;}
  .landing-mini-card [style*="font-size: 34px"]{font-size:28px!important;}
  .landing-ticker{max-width:100vw!important;overflow:hidden!important;}
  .landing-mini-card [style*="grid-template-columns: 90px"]{grid-template-columns:1fr!important;}
  .landing-preview-layer{position:static!important;transform:none!important;margin-top:12px!important;}
  .landing-stats{grid-template-columns:repeat(2,1fr)!important;}
  .landing-stats>div{padding:22px 10px!important;border-radius:16px!important;}
  .landing-stat-value{font-size:30px!important;line-height:1.05!important;white-space:normal!important;overflow-wrap:anywhere!important;}
  .landing-stat-label{font-size:11px!important;line-height:1.2!important;white-space:normal!important;}
  .pricing-price-row{display:block!important;margin-bottom:10px!important;}
  .pricing-price-row span:first-child{font-size:42px!important;line-height:.95!important;}
  .pricing-price-row span:last-child{display:block!important;margin-top:4px!important;}
  .landing-cinematic-root{background:#050506!important;min-height:100dvh!important;overflow-x:clip!important;overflow-y:visible!important;}
  .landing-cinematic-root .landing-hero{min-height:auto!important;padding:92px 16px 48px!important;background:radial-gradient(circle at 50% 0%, rgba(22,199,78,.15), transparent 48%), #050506!important;display:block!important;text-align:center!important;}
  .landing-intro-copy{position:relative!important;inset:auto!important;height:auto!important;min-height:clamp(360px,58dvh,500px)!important;transform:none!important;opacity:1!important;z-index:2!important;padding:44px 0 20px!important;display:flex!important;justify-content:center!important;}
  .landing-intro-copy:before{top:6%!important;width:104vw!important;opacity:.9!important;}
  .landing-intro-copy:after{bottom:18px!important;height:46px!important;}
  .landing-typed-headline{font-size:clamp(42px,13vw,58px)!important;line-height:1.02!important;margin:0!important;text-wrap:balance!important;}
  .landing-after-intro{position:relative!important;margin-top:0!important;padding:0!important;opacity:1!important;transform:none!important;z-index:3!important;}
  .landing-badge{margin-bottom:18px!important;justify-content:center!important;}
  .landing-subhead{max-width:330px!important;margin-left:auto!important;margin-right:auto!important;}
  .landing-hero-copy{max-width:340px!important;margin-bottom:24px!important;}
  .landing-email{box-shadow:0 18px 54px rgba(0,0,0,.34)!important;}
  .landing-proof-row{justify-content:center!important;align-items:center!important;margin-top:24px!important;}
  .landing-hero-preview{margin-top:32px!important;box-shadow:0 22px 70px rgba(0,0,0,.42)!important;}
  .landing-ticker{margin-top:0!important;}
  .landing-section,.landing-dark-section,.landing-platform,.landing-launch,.landing-cta,.landing-immersive-stage{padding:54px 16px!important;}
  .landing-dark-section{border-top:1px solid rgba(255,255,255,.07)!important;}
  .landing-cinema-grid{gap:22px!important;}
  .landing-cinema-stage{min-height:auto!important;padding:12px!important;border-radius:24px!important;transform:none!important;}
  .landing-cinema-stage>div[style*="min-height: 520px"]{min-height:auto!important;padding:18px!important;padding-bottom:18px!important;}
  .landing-cinema-stage>div[style*="position: absolute"]{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;grid-template-columns:1fr!important;margin-top:18px!important;}
  .landing-cinema-stage h3{font-size:32px!important;line-height:1.05!important;}
  .landing-cinema-stage p{font-size:14px!important;line-height:1.6!important;}
  .landing-sticky-world{min-height:auto!important;padding:18px!important;}
  .landing-world-core{position:relative!important;left:auto!important;top:auto!important;transform:none!important;width:88px!important;height:88px!important;font-size:25px!important;margin:0 auto 16px!important;box-shadow:0 0 44px rgba(22,199,78,.26)!important;}
  .landing-world-node{width:100%!important;}
  .landing-world-node{position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;transform:none!important;margin:0 0 8px!important;padding:12px!important;border-radius:16px!important;width:100%!important;}
  .landing-world-node>div{margin-bottom:0!important;min-height:0!important;}
  .landing-world-node{min-height:0!important;}
  .landing-world-node p{display:none!important;}
  .landing-world-node span{width:30px!important;height:30px!important;border-radius:10px!important;}
  .landing-world-node b{font-size:14px!important;}
  .landing-platform{padding-top:58px!important;}
  .landing-product-peek,.landing-workflow,.landing-signal-engine,.landing-pricing{padding:56px 16px!important;}
  .landing-product-peek h2,.landing-workflow h2,.landing-signal-engine h2,.landing-pricing h2{font-size:34px!important;line-height:1.08!important;}
  .landing-product-peek p,.landing-workflow p,.landing-signal-engine p,.landing-pricing p{font-size:14.5px!important;line-height:1.65!important;}
  .landing-platform [style*="margin: 0px auto 76px"],.landing-platform [style*="margin-bottom: 76px"]{margin-bottom:34px!important;}
  .landing-feature-grid .ch{padding:18px!important;border-radius:16px!important;}
  .landing-feature-grid .icon-badge{width:38px!important;height:38px!important;border-radius:12px!important;margin-bottom:14px!important;}
  .landing-feature-grid .landing-card-title{font-size:16px!important;margin-bottom:7px!important;}
  .landing-feature-grid .landing-card-copy{font-size:13px!important;line-height:1.55!important;}
  .landing-signal-grid .landing-mini-card{grid-template-columns:42px minmax(0,1fr)!important;padding:12px!important;border-radius:16px!important;gap:10px!important;}
  .landing-signal-grid .landing-mini-card>div:first-child{width:42px!important;height:42px!important;border-radius:14px!important;font-size:12px!important;}
  .landing-signal-grid .landing-mini-card>div:last-child{display:none!important;}
  .landing-reels-grid{grid-template-columns:1fr!important;gap:12px!important;}
  .landing-reels-grid .landing-motion-card{min-height:auto!important;padding:10px!important;border-radius:20px!important;}
  .landing-reels-grid .landing-motion-card>div:first-child{inset:10px!important;border-radius:16px!important;}
  .landing-reels-grid .landing-motion-card>div:last-child{min-height:260px!important;padding:16px!important;}
  .landing-reels-grid p{font-size:24px!important;line-height:1.08!important;}
  .landing-workflow-grid .ch{padding:16px!important;border-radius:16px!important;}
  .landing-stats{grid-template-columns:repeat(2,1fr)!important;gap:8px!important;}
  .landing-stats>div{padding:18px 10px!important;}
  .landing-proof-grid{gap:12px!important;}
  .landing-community-cards .ch{padding:16px!important;border-radius:16px!important;}
  .landing-community-cards p{font-size:13px!important;line-height:1.55!important;}
  .landing-motion-card{min-height:auto!important;}
  .landing-reels-grid .landing-motion-card>div{min-height:300px!important;padding:16px!important;}
  .landing-launch{padding-top:58px!important;padding-bottom:58px!important;}
  .landing-why{padding-bottom:34px!important;}
  .landing-launch{padding-top:42px!important;}
  .landing-cta{min-height:auto!important;padding-top:64px!important;padding-bottom:64px!important;}
  .landing-cta h2{font-size:clamp(38px,12vw,58px)!important;}
  .landing-dark-section .landing-cinema-stage{display:none!important;}
  .landing-dark-section .landing-cinema-grid{gap:18px!important;}
  .landing-story-button{padding:14px!important;border-radius:16px!important;}
  .landing-story-button>span>span:last-child{display:none!important;}
  .landing-story-button b{font-size:16px!important;line-height:1.2!important;}
  .landing-immersive-stage .landing-sticky-world{display:none!important;}
  .landing-immersive-stage h2,.landing-dark-section h2{font-size:clamp(32px,10vw,42px)!important;line-height:1.04!important;}
  .landing-scroll-step{padding:14px!important;border-radius:16px!important;}
  .landing-scroll-step>div>span:first-child{font-size:22px!important;min-width:34px!important;}
  .landing-scroll-step>div{grid-template-columns:34px minmax(0,1fr)!important;}
  .landing-scroll-step div[style*="font-size: 18px"]{font-size:16px!important;}
  .landing-scroll-step p{font-size:13px!important;line-height:1.5!important;}
  .landing-product-peek .landing-mini-app{display:none!important;}
  .landing-product-peek .landing-demo-tabs{grid-template-columns:1fr 1fr!important;margin-top:14px!important;}
  .landing-product-peek .landing-demo-tabs button{border-radius:14px!important;min-height:44px!important;}
  .landing-platform .landing-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}
  .landing-platform .landing-feature-grid .ch{padding:14px!important;min-height:150px!important;}
  .landing-platform .landing-feature-grid .landing-card-copy{font-size:12px!important;line-height:1.42!important;display:-webkit-box!important;-webkit-line-clamp:3!important;-webkit-box-orient:vertical!important;overflow:hidden!important;}
  .landing-platform .landing-feature-grid .landing-card-title{font-size:14px!important;line-height:1.18!important;}
  .landing-platform .icon-badge{width:34px!important;height:34px!important;margin-bottom:10px!important;}
  .landing-signal-engine .landing-signal-grid{gap:18px!important;}
  .landing-signal-engine .landing-mini-card{min-height:0!important;}
  .landing-signal-engine [style*="Opportunity matches"]{margin-bottom:0!important;}
  .landing-reels-grid .landing-motion-card{min-height:0!important;}
  .landing-reels-grid .landing-motion-card:nth-child(n+3){display:none!important;}
  .landing-reels-grid .landing-motion-card>div{min-height:240px!important;}
  .landing-reels-grid .landing-motion-card>div:last-child{min-height:240px!important;}
  .landing-launch .landing-testimonial-grid{gap:10px!important;}
  .landing-launch .landing-testimonial-grid .ch{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;gap:12px!important;padding:15px!important;align-items:start!important;}
  .landing-launch .landing-testimonial-grid .icon-badge{width:40px!important;height:40px!important;margin:0!important;border-radius:14px!important;grid-column:1!important;grid-row:1 / span 2!important;}
  .landing-launch .landing-card-title{font-size:15px!important;line-height:1.2!important;margin:0 0 5px!important;grid-column:2!important;grid-row:1!important;}
  .landing-launch .landing-card-copy{font-size:12.5px!important;line-height:1.45!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;grid-column:2!important;grid-row:2!important;}
  .landing-workflow-grid{grid-template-columns:1fr 1fr!important;}
  .landing-workflow-grid .ch{min-height:0!important;padding:14px!important;}
  .landing-workflow-grid .ch p{display:none!important;}
  .landing-workflow-grid .ch div[style*="font-size: 18px"]{font-size:14px!important;line-height:1.2!important;}
  .landing-proof-grid>div[style*="background: #111318"],.landing-proof-grid>div[style*="background:#111318"]{display:none!important;}
  .landing-community-cards{grid-template-columns:1fr!important;}
  .landing-launch .landing-mini-app{display:none!important;}
  .landing-pricing .pricing-grid{gap:12px!important;}
  .landing-pricing .pricing-grid>div{padding:18px!important;}
  .landing-pricing .pricing-feature-list{gap:8px!important;margin-bottom:18px!important;}
  .landing-pricing .pricing-feature-list>div:nth-child(n+5){display:none!important;}
  .landing-pricing .pricing-feature-list span:last-child{font-size:13px!important;line-height:1.35!important;}
  .landing-pricing .pricing-price-row{margin-bottom:4px!important;}
  .landing-why>div,.landing-board>div{grid-template-columns:1fr!important;text-align:center!important;gap:24px!important;}
  .landing-why p,.landing-why .why-acronym-row{margin-left:auto!important;margin-right:auto!important;}
  .landing-board p{margin-left:auto!important;margin-right:auto!important;}
  .landing-board .fear-board-tool-grid{text-align:left!important;}
  .fear-board-page-grid{grid-template-columns:1fr!important;gap:24px!important;}
  .why-page-grid{grid-template-columns:1fr!important;gap:24px!important;}
  .why-page-grid h1,.why-page-grid p{text-align:left!important;}
  .why-about-grid{grid-template-columns:1fr!important;gap:18px!important;margin-top:36px!important;padding-top:24px!important;}
  .landing-footer{padding:24px 16px calc(28px + env(safe-area-inset-bottom))!important;gap:12px!important;justify-content:center!important;text-align:center!important;}
  .cookie-notice{left:12px!important;right:12px!important;bottom:calc(12px + env(safe-area-inset-bottom))!important;}
  .cookie-card{max-width:none!important;border-radius:18px!important;}
  .cookie-actions{display:grid!important;grid-template-columns:1fr!important;}
  .signup-root{display:block!important;background:linear-gradient(180deg,#F7F8FA 0%,#EAFBF1 100%)!important;min-height:100dvh!important;}
  .signup-copy{display:none!important;}
  .signup-form-panel{width:100%!important;min-height:100dvh!important;padding:74px 16px 28px!important;background:transparent!important;align-items:flex-start!important;}
  .signup-form-panel>div{max-width:440px!important;margin:0 auto!important;background:rgba(255,255,255,.96)!important;border:1px solid #E4E8F0!important;border-radius:24px!important;padding:22px!important;box-shadow:0 22px 70px rgba(13,15,20,.12)!important;}
  .signup-form-panel input{min-height:50px!important;border-radius:14px!important;}
  .signup-form-panel .bs{min-height:46px!important;}
  .verify-shell{padding:20px 14px!important;align-items:flex-start!important;}
  .verify-card{padding:24px!important;border-radius:24px!important;margin-top:34px!important;}
  .verify-card h1{font-size:34px!important;}
  .verify-card .verify-actions{grid-template-columns:1fr!important;}
  .toast-stack{left:12px!important;right:12px!important;top:12px!important;}
  .toast-stack>div{min-width:0!important;width:100%!important;}
  [style*="grid-template-columns: 310px 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(5,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
  input[placeholder="Search people, posts, tags"]{width:100%!important;max-width:none!important;}
}
@media(max-width:360px){
  .landing-nav>div{padding:0 6px 0 10px!important;gap:5px!important;}
  .landing-nav>div>div:first-child{font-size:17px!important;flex:0 0 94px!important;max-width:94px!important;overflow:visible!important;text-overflow:clip!important;}
  .landing-nav-actions{gap:4px!important;}
  .landing-nav-login,.landing-nav-join{padding:7px 8px!important;font-size:11px!important;min-height:36px!important;}
  .landing-hero{padding-left:12px!important;padding-right:12px!important;}
  .landing-hero h1{font-size:37px!important;}
  .landing-intro-copy{padding-left:0!important;padding-right:0!important;}
  .landing-hero-copy{font-size:14px!important;}
  .landing-badge{padding:8px 12px!important;}
  .landing-badge span:last-child{font-size:12px!important;}
  .mobile-section-tabs{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;}
  .mobile-section-tabs button{font-size:12px!important;padding:9px 6px!important;}
  .mobile-bottom-nav{left:6px!important;right:6px!important;padding:5px!important;}
  .mobile-bottom-nav button{font-size:9px!important;height:48px!important;}
  .app-shell{padding-left:8px!important;padding-right:8px!important;}
  .composer-card,.post-card,.mobile-profile-summary{border-radius:16px!important;}
}
.global-flow-wave{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:radial-gradient(ellipse at 50% 115%,rgba(22,199,78,.1),transparent 54%);opacity:.34;transition:opacity .45s ease;contain:strict;}
.global-flow-wave canvas{display:block;width:100%;height:100%;opacity:.92;filter:saturate(.9) contrast(1.04);}
.global-flow-wave-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,6,.3),transparent 30%,rgba(5,5,6,.18) 72%,rgba(5,5,6,.5));}
.global-flow-wave.is-fallback:before{content:"";position:absolute;inset:-20%;background:radial-gradient(ellipse at 42% 108%,rgba(22,199,78,.22),transparent 45%),radial-gradient(ellipse at 70% 86%,rgba(2,73,37,.2),transparent 38%);filter:blur(36px);animation:ambientDrift 12s ease-in-out infinite;}
.global-flow-wave[data-screen="landing"]{opacity:.24;}
.global-flow-wave[data-screen="signup"],.global-flow-wave[data-screen="login"]{opacity:.28;}
.global-flow-wave[data-screen="board"],.global-flow-wave[data-screen="why"]{opacity:.4;}
.theme-light .global-flow-wave{opacity:.07;filter:saturate(.55);}
.theme-light .global-flow-wave[data-screen="landing"],.theme-light .global-flow-wave[data-screen="board"],.theme-light .global-flow-wave[data-screen="why"]{opacity:.2;}
.landing-root,.signup-root,.verify-shell,.fear-board-page,.why-page,.app-view{position:relative;z-index:1;}
.theme-dark .app-view{background:rgba(5,5,6,.9)!important;}
.theme-dark .fear-board-page,.theme-dark .why-page{background:rgba(5,5,6,.82)!important;}
.theme-dark .signup-root{background:rgba(12,13,16,.9)!important;}
.theme-dark .verify-shell{background:radial-gradient(circle at 50% 0%,rgba(22,199,78,.14),transparent 34%),rgba(5,5,6,.84)!important;}
.landing-cinematic-root{background:rgba(5,5,6,.84)!important;}
.landing-cinematic-root .landing-dark-section,.landing-cinematic-root .landing-immersive-stage,.landing-cinematic-root .landing-signal-engine,.landing-cinematic-root .landing-workflow,.landing-cinematic-root .landing-why,.landing-cinematic-root .landing-board,.landing-cinematic-root .landing-footer{background-color:rgba(5,5,6,.84)!important;}
.app-topbar,.landing-nav,.app-shell{position:relative;z-index:2;}
@media(max-width:760px){
  .global-flow-wave{opacity:.22;}
  .global-flow-wave[data-screen="landing"]{opacity:.16;}
  .global-flow-wave[data-screen="signup"],.global-flow-wave[data-screen="login"]{opacity:.12;}
  .global-flow-wave[data-screen="app"]{opacity:.16;}
  .theme-dark .signup-root{background:linear-gradient(180deg,rgba(8,10,10,.95),rgba(5,5,6,.9))!important;}
}
@media(prefers-reduced-motion:reduce){.global-flow-wave.is-fallback:before{animation:none!important;}}
.a11y-reduce-motion .global-flow-wave.is-fallback:before{animation:none!important;}
.fs2-root{--fs-ink:#080A09;--fs-surface:#F3F6F4;--fs-muted:#A5ADA8;--fs-green:#16C74E;background:var(--fs-ink);color:#fff;min-height:100dvh;overflow:clip;position:relative;}
.fs2-root button{letter-spacing:0;}
.fs2-intro{height:112dvh;position:relative;display:grid;place-items:center;padding:24px;isolation:isolate;}
.fs2-intro-copy{position:fixed;inset:0;display:grid;place-items:center;padding:24px;pointer-events:none;z-index:1;opacity:var(--intro-opacity,1);transform:translate3d(0,var(--intro-y,0),0) scale(var(--intro-scale,1));will-change:transform,opacity;}
.fs2-intro h1{font-family:Georgia,serif;font-size:76px;line-height:.94;text-align:center;letter-spacing:0;max-width:900px;text-wrap:balance;text-shadow:0 18px 70px rgba(0,0,0,.58);}
.fs2-intro-line{display:block;width:max-content;max-width:100%;margin:auto;overflow:hidden;clip-path:inset(0 100% 0 0);animation:typeReveal 1.65s steps(24,end) forwards;}
.fs2-intro-line:last-child{animation-delay:1.7s;}
.fs2-intro-line:last-child:after{content:"";display:inline-block;width:.07em;height:.76em;background:var(--fs-green);margin-left:.08em;animation:caretBlink .78s steps(1,end) infinite;}
.fs2-flow{position:relative;z-index:2;margin-top:-12dvh;background:linear-gradient(180deg,transparent 0,#080A09 5%);}
.fs2-section{position:relative;padding:118px max(28px,calc((100vw - 1180px)/2));}
.fs2-eyebrow{display:flex;align-items:center;gap:10px;color:var(--fs-green);font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:22px;}
.fs2-eyebrow:before{content:"";width:30px;height:1px;background:currentColor;}
.fs2-opening{min-height:94dvh;display:grid;align-content:center;grid-template-columns:minmax(0,1.15fr) minmax(300px,.65fr);gap:80px;padding-top:168px;padding-bottom:110px;border-bottom:1px solid rgba(255,255,255,.07);}
.fs2-opening h2,.fs2-social h2,.fs2-why h2,.fs2-access h2,.fs2-cta h2{font-family:Georgia,serif;font-size:68px;line-height:.97;letter-spacing:0;text-wrap:balance;}
.fs2-opening-copy{align-self:end;padding-bottom:8px;}
.fs2-opening-copy p{color:rgba(255,255,255,.58);font-size:17px;line-height:1.75;margin-bottom:28px;}
.fs2-actions{display:flex;gap:10px;flex-wrap:wrap;}
.fs2-primary,.fs2-secondary{min-height:48px;border-radius:999px;padding:0 20px;font-size:14px;font-weight:900;border:1px solid transparent;display:inline-flex;align-items:center;justify-content:center;gap:9px;white-space:nowrap;}
.fs2-primary{background:var(--fs-green);color:#fff;box-shadow:0 18px 48px rgba(22,199,78,.2);}
.fs2-primary:hover{transform:translateY(-2px);box-shadow:0 24px 58px rgba(22,199,78,.28);}
.fs2-secondary{background:rgba(255,255,255,.06);color:#fff;border-color:rgba(255,255,255,.13);}
.fs2-secondary:hover{background:rgba(255,255,255,.1);}
.fs2-story{height:330dvh;position:relative;}
.fs2-story-sticky{height:100dvh;position:sticky;top:0;display:grid;grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);gap:70px;align-items:center;padding:88px max(28px,calc((100vw - 1180px)/2)) 56px;overflow:hidden;}
.fs2-story-copy{position:relative;min-height:390px;display:flex;flex-direction:column;justify-content:center;}
.fs2-story-number{font-family:Georgia,serif;color:rgba(255,255,255,.18);font-size:26px;margin-bottom:24px;}
.fs2-story-copy h2{font-family:Georgia,serif;font-size:60px;line-height:.96;letter-spacing:0;text-wrap:balance;margin-bottom:20px;}
.fs2-story-copy p{color:rgba(255,255,255,.56);font-size:16px;line-height:1.75;max-width:470px;}
.fs2-story-nav{display:flex;gap:8px;margin-top:34px;}
.fs2-story-nav button{width:40px;height:4px;border:0;border-radius:99px;background:rgba(255,255,255,.14);transition:width .3s ease,background .3s ease;color:transparent;overflow:hidden;font-size:0;}
.fs2-story-nav button.active{width:72px;background:var(--fs-green);}
.fs2-product-frame{height:min(600px,calc(100dvh - 170px));min-height:500px;background:rgba(245,248,246,.96);color:#101311;border-radius:14px;padding:12px;box-shadow:0 50px 150px rgba(0,0,0,.46);transform:perspective(1400px) rotateY(-2deg);transition:transform .45s ease;position:relative;overflow:hidden;}
.fs2-product-frame:hover{transform:perspective(1400px) rotateY(0deg) translateY(-4px);}
.fs2-product-bar{height:54px;background:#0C0E0D;color:#fff;border-radius:8px;display:flex;align-items:center;padding:0 16px;gap:18px;}
.fs2-product-brand{font-family:Georgia,serif;font-size:19px;font-weight:800;white-space:nowrap;}
.fs2-product-brand span{color:var(--fs-green);}
.fs2-product-tabs{display:flex;gap:4px;overflow:hidden;}
.fs2-product-tabs span{padding:7px 9px;color:rgba(255,255,255,.46);font-size:11px;font-weight:800;white-space:nowrap;}
.fs2-product-tabs span.active{background:#E2F8EA;color:#14823B;border-radius:6px;}
.fs2-live{margin-left:auto;font-size:10px;font-weight:900;color:#83EAA6;display:flex;align-items:center;gap:7px;white-space:nowrap;}
.fs2-live:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--fs-green);box-shadow:0 0 0 5px rgba(22,199,78,.1);}
.fs2-product-body{height:calc(100% - 64px);padding:24px;display:grid;align-content:stretch;background:linear-gradient(145deg,#F7FAF8,#E9EFEB);border-radius:8px;margin-top:10px;position:relative;overflow:hidden;}
.fs2-preview{display:grid;height:100%;animation:fadeUp .42s ease both;}
.fs2-profile-preview{grid-template-rows:150px auto;}
.fs2-cover{background:linear-gradient(120deg,#101812,#238A45 70%,#6DE48E);border-radius:7px;position:relative;overflow:hidden;}
.fs2-cover:after{content:"";position:absolute;inset:-30%;background:radial-gradient(circle,rgba(255,255,255,.2),transparent 34%);transform:translateX(28%);}
.fs2-profile-info{padding:0 22px 18px;position:relative;}
.fs2-avatar{width:96px;height:96px;border-radius:50%;background:#101311;color:#fff;border:6px solid #F5F8F6;display:grid;place-items:center;font-family:Georgia,serif;font-size:28px;font-weight:800;margin-top:-48px;position:relative;}
.fs2-profile-info h3{font-family:Georgia,serif;font-size:34px;margin:14px 0 5px;}
.fs2-profile-info p{color:#67706A;font-size:13px;line-height:1.55;max-width:480px;}
.fs2-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:20px;}
.fs2-stats div{padding:13px;background:#fff;border-radius:7px;}
.fs2-stats b{display:block;font-size:18px;}.fs2-stats span{font-size:10px;color:#7B837E;text-transform:uppercase;font-weight:800;letter-spacing:.8px;}
.fs2-people-preview{align-content:center;gap:10px;}
.fs2-person{display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:12px;background:#fff;padding:14px;border-radius:8px;}
.fs2-person-avatar{width:48px;height:48px;border-radius:50%;background:#E2F8EA;color:#14823B;display:grid;place-items:center;font-weight:900;}
.fs2-person b{display:block;font-size:14px;margin-bottom:3px;}.fs2-person small{display:block;color:#7B837E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fs2-person button{border:0;background:#101311;color:#fff;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:900;}
.fs2-message-preview{grid-template-columns:190px minmax(0,1fr);gap:10px;}
.fs2-thread-list,.fs2-thread{background:#fff;border-radius:8px;padding:14px;}
.fs2-thread-list b{font-size:12px;display:block;margin-bottom:16px;}.fs2-thread-person{padding:10px;border-radius:6px;margin-bottom:6px;font-size:11px;color:#626A65;}.fs2-thread-person.active{background:#E2F8EA;color:#146C34;font-weight:900;}
.fs2-thread{display:flex;flex-direction:column;}.fs2-thread-title{font-weight:900;font-size:14px;padding-bottom:12px;border-bottom:1px solid #E7ECE9;}.fs2-bubbles{display:flex;flex-direction:column;gap:10px;justify-content:center;flex:1;}.fs2-bubble{max-width:78%;padding:11px 13px;border-radius:12px;background:#EEF2EF;color:#4D554F;font-size:12px;line-height:1.5;}.fs2-bubble.mine{margin-left:auto;background:#16C74E;color:#fff;}
.fs2-opportunity-preview{align-content:center;}.fs2-opportunity{background:#fff;padding:26px;border-radius:8px;}.fs2-opportunity-top{display:flex;align-items:flex-start;gap:14px;}.fs2-company-mark{width:56px;height:56px;border-radius:8px;background:#101311;color:#fff;display:grid;place-items:center;font-family:Georgia,serif;font-size:22px;}.fs2-opportunity h3{font-size:24px;margin-bottom:5px;}.fs2-opportunity p{color:#6A726D;font-size:13px;line-height:1.6;}.fs2-opportunity-meta{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0;}.fs2-opportunity-meta span{background:#EFF4F0;padding:8px 10px;border-radius:5px;font-size:11px;font-weight:800;color:#58615B;}.fs2-opportunity button{background:#16C74E;color:#fff;border:0;border-radius:999px;padding:12px 16px;font-weight:900;}
.fs2-social{background:var(--fs-surface);color:#0B0E0C;min-height:110dvh;display:grid;align-content:center;}
.fs2-social .fs2-eyebrow{color:#12813A;}
.fs2-social-head{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.6fr);gap:72px;align-items:end;margin-bottom:80px;}
.fs2-social-head p{font-size:17px;line-height:1.75;color:#5E6861;}
.fs2-social-rail{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #CCD5CF;border-bottom:1px solid #CCD5CF;}
.fs2-social-item{padding:28px 24px;min-height:190px;border-right:1px solid #CCD5CF;display:flex;flex-direction:column;justify-content:space-between;}
.fs2-social-item:last-child{border-right:0;}.fs2-social-item span{font-family:Georgia,serif;font-size:30px;color:#18A646;}.fs2-social-item b{font-size:17px;margin-bottom:8px;display:block;}.fs2-social-item p{font-size:13px;line-height:1.6;color:#69726C;}
.fs2-why{min-height:100dvh;display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.7fr);gap:80px;align-items:center;background:linear-gradient(145deg,#0A0C0B,#101A13);}
.fs2-why-copy p{font-size:17px;line-height:1.8;color:rgba(255,255,255,.57);max-width:580px;margin:24px 0 30px;}
.fs2-acronym{display:grid;gap:2px;}
.fs2-acronym-row{display:grid;grid-template-columns:54px 1fr;align-items:center;gap:18px;padding:17px 0;border-bottom:1px solid rgba(255,255,255,.09);}
.fs2-acronym-row:last-child{border-bottom:0;}.fs2-acronym-row span{font-family:Georgia,serif;font-size:44px;color:var(--fs-green);}.fs2-acronym-row b{font-size:22px;font-weight:800;}
.fs2-access{background:#0A0C0B;}
.fs2-access-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.55fr);gap:70px;align-items:end;margin-bottom:62px;}
.fs2-access-head p{font-size:16px;line-height:1.7;color:rgba(255,255,255,.56);}
.fs2-plans{display:grid;grid-template-columns:1.08fr .92fr;gap:16px;}
.fs2-plan{background:#F3F6F4;color:#0B0E0C;border-radius:10px;padding:34px;min-height:360px;display:flex;flex-direction:column;}
.fs2-plan.pro{background:linear-gradient(145deg,#122018,#0B0E0C);color:#fff;box-shadow:inset 0 0 0 1px rgba(73,221,118,.18);}
.fs2-plan-label{font-size:11px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;color:#13843B;margin-bottom:24px;}.fs2-plan h3{font-family:Georgia,serif;font-size:42px;margin-bottom:10px;}.fs2-plan p{font-size:14px;line-height:1.65;color:#657069;max-width:520px;}.fs2-plan.pro p{color:rgba(255,255,255,.55);}
.fs2-plan-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:28px 0;}.fs2-plan-list span{font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px;}.fs2-plan-list span:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--fs-green);}
.fs2-plan .fs2-actions{margin-top:auto;}
.fs2-cta{min-height:90dvh;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 50% 65%,rgba(22,199,78,.2),transparent 34%),#080A09;}
.fs2-cta-inner{max-width:860px;}.fs2-cta p{font-size:18px;line-height:1.75;color:rgba(255,255,255,.57);max-width:620px;margin:24px auto 34px;}.fs2-cta .fs2-actions{justify-content:center;}
.fs2-footer{padding:28px max(24px,calc((100vw - 1180px)/2));display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;border-top:1px solid rgba(255,255,255,.08);background:#080A09;}.fs2-footer-brand{font-family:Georgia,serif;font-size:18px;font-weight:800;}.fs2-footer-brand span{color:var(--fs-green);}.fs2-footer small{color:rgba(255,255,255,.3);}.fs2-footer-links{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap;}.fs2-footer-links button{background:transparent;border:0;color:rgba(255,255,255,.46);font-size:11px;padding:8px;}
.app-view{background:rgba(7,9,8,.94)!important;}
.theme-dark .app-topbar{background:rgba(8,10,9,.88)!important;backdrop-filter:blur(24px)!important;min-height:64px!important;}
.theme-dark .desktop-feed-side>div,.theme-dark .mobile-profile-summary,.theme-dark .composer-card,.theme-dark .post-card,.theme-dark .directory-grid .ch,.theme-dark .message-list,.theme-dark .message-panel,.theme-dark .profile-stats>div,.theme-dark .edit-sheet{border-radius:12px!important;border-color:rgba(255,255,255,.08)!important;box-shadow:none!important;}
.theme-dark .app-view button{box-shadow:none!important;}
.theme-dark .app-view .glow{animation:none!important;}
.cookie-notice{left:50%!important;right:auto!important;bottom:14px!important;transform:translateX(-50%);width:min(760px,calc(100% - 28px));}
.cookie-card{max-width:760px!important;border-radius:12px!important;padding:12px 14px!important;gap:14px!important;flex-wrap:nowrap!important;}
.cookie-card>div:first-child{min-width:0;}.cookie-card p{font-size:12px!important;line-height:1.4!important;}.cookie-actions{margin-top:0!important;flex:0 0 auto;}.cookie-actions button{padding:9px 12px!important;font-size:11px!important;}
.signup-brand{position:fixed;top:20px;left:24px;z-index:20;background:rgba(255,255,255,.94);border:1px solid rgba(255,255,255,.55);color:#0D0F14;font-family:Georgia,serif;font-size:19px;font-weight:900;padding:8px 12px;border-radius:999px;box-shadow:0 12px 38px rgba(0,0,0,.14);}
.signup-brand span{color:#16C74E;}
.signup-copy{position:relative;overflow:hidden;}
.signup-copy:after{content:"";position:absolute;inset:auto -20% -42% 10%;height:70%;background:radial-gradient(ellipse,rgba(22,199,78,.2),transparent 65%);pointer-events:none;}
.signup-form-panel{min-height:100dvh;align-items:flex-start!important;padding-top:52px!important;padding-bottom:52px!important;overflow:visible;}

/* Product workspace: one visual language across every signed-in surface. */
.app-view{--app-bg:#080A09;--app-panel:#101311;--app-panel-2:#141815;--app-line:rgba(255,255,255,.09);--app-copy:#F5F7F5;--app-muted:rgba(245,247,245,.56);--app-soft:rgba(245,247,245,.72);background:var(--app-bg)!important;color:var(--app-copy)!important;isolation:isolate;}
.app-view:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(22,199,78,.035),transparent 24%),linear-gradient(90deg,transparent 49.95%,rgba(255,255,255,.018) 50%,transparent 50.05%);background-size:auto,72px 72px;mask-image:linear-gradient(180deg,#000,transparent 70%);}
.theme-light .app-view{--app-bg:#EEF2EF;--app-panel:#FFFFFF;--app-panel-2:#F6F8F6;--app-line:#D9E1DB;--app-copy:#0B0E0C;--app-muted:#67716A;--app-soft:#3F4942;background:var(--app-bg)!important;color:var(--app-copy)!important;}
.app-topbar{height:72px!important;min-height:72px!important;padding:0 max(20px,calc((100vw - 1440px)/2))!important;gap:12px!important;background:rgba(8,10,9,.88)!important;border-bottom:1px solid var(--app-line)!important;box-shadow:none!important;backdrop-filter:blur(22px) saturate(120%)!important;}
.theme-light .app-topbar{background:rgba(247,249,247,.9)!important;}
.app-topbar-logo{font-size:21px!important;color:var(--app-copy)!important;letter-spacing:0!important;margin-right:8px;}
.app-topbar-logo span:last-child{color:var(--app-copy)!important;}
.desktop-app-tabs{height:100%;align-items:center;gap:0!important;scrollbar-width:none;}
.desktop-app-tabs .nl{position:relative;height:100%;padding:0 11px!important;border-radius:0!important;background:transparent!important;color:var(--app-muted)!important;font-size:11px!important;letter-spacing:0!important;}
.desktop-app-tabs .nl[aria-current="page"]{color:var(--app-copy)!important;}
.desktop-app-tabs .nl[aria-current="page"]:after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:2px;background:#16C74E;border-radius:2px 2px 0 0;}
.desktop-app-search{height:40px!important;background:rgba(255,255,255,.045)!important;border-color:var(--app-line)!important;border-radius:8px!important;color:var(--app-copy)!important;}
.theme-light .desktop-app-search{background:#fff!important;}
.app-topbar>button:not(.app-topbar-logo):not(.nl){background:transparent!important;border-color:var(--app-line)!important;color:var(--app-muted)!important;border-radius:8px!important;}
.app-topbar>button:hover{color:var(--app-copy)!important;border-color:rgba(22,199,78,.38)!important;}
.app-connection-state{display:inline-flex;align-items:center;gap:6px;color:var(--app-muted);font-size:10px;font-weight:850;white-space:nowrap;}
.app-connection-state i{width:6px;height:6px;border-radius:50%;background:#16C74E;box-shadow:0 0 0 4px rgba(22,199,78,.1);}
.app-connection-state.offline i{background:#F1A23C;box-shadow:0 0 0 4px rgba(241,162,60,.1);}
.app-connection-state.connecting i{background:#8D9790;box-shadow:0 0 0 4px rgba(141,151,144,.1);animation:pulse 1.4s ease-in-out infinite;}
.app-shell{width:min(100%,1380px)!important;max-width:1380px!important;padding:38px 24px 110px!important;}
.app-view-intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.52fr);gap:48px;align-items:end;padding:26px 4px 32px;margin-bottom:20px;border-bottom:1px solid var(--app-line);position:relative;}
.app-view-intro-index{position:absolute;left:0;top:0;width:34px;height:2px;background:#16C74E;}
.app-view-intro span{display:block;color:#16C74E;font-size:10px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:10px;}
.app-view-intro h1{font-family:Georgia,serif!important;font-size:clamp(38px,4vw,62px)!important;line-height:.98!important;letter-spacing:0!important;color:var(--app-copy)!important;max-width:760px!important;}
.app-view-intro p{font-size:14px!important;line-height:1.7!important;color:var(--app-muted)!important;max-width:440px!important;margin:0!important;}
.app-view-intro + .directory-wrap > .view-local-heading{display:none!important;}
.feed-grid{grid-template-columns:228px minmax(0,1fr) 272px!important;gap:16px!important;}
.feed-main{min-width:0;}
.desktop-feed-side{top:94px!important;gap:12px!important;}
.desktop-feed-side>div,.mobile-profile-summary,.composer-card,.post-card,.message-list,.message-panel,.profile-hero,.profile-danger-zone,.settings-grid>div,.directory-grid>.ch,.directory-grid>div,.search-results-panel{background:var(--app-panel)!important;border:1px solid var(--app-line)!important;border-radius:10px!important;box-shadow:none!important;}
.desktop-feed-side>div{padding:16px!important;}
.desktop-feed-side>div[style*="background: linear-gradient"]{background:linear-gradient(145deg,#102017,#0B0F0C)!important;border-color:rgba(22,199,78,.2)!important;}
.feed-mode-switch{background:transparent!important;border:0!important;border-bottom:1px solid var(--app-line)!important;border-radius:0!important;padding:0!important;margin-bottom:14px!important;}
.feed-mode-switch button{place-items:start!important;text-align:left!important;padding:12px 2px 13px!important;background:transparent!important;border-radius:0!important;color:var(--app-muted)!important;position:relative;}
.feed-mode-switch button[aria-selected="true"]{color:var(--app-copy)!important;}
.feed-mode-switch button[aria-selected="true"]:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#16C74E;}
.fs-app-composer{padding:18px!important;background:#F2F6F3!important;border-color:#D9E4DC!important;color:#0B0E0C!important;margin-bottom:14px!important;}
.theme-dark .fs-app-composer textarea{background:#FFFFFF!important;border-color:#DCE4DE!important;color:#0B0E0C!important;}
.theme-dark .fs-app-composer textarea::placeholder{color:#7A847D!important;}
.theme-dark .fs-app-composer .post-type-btn,.theme-dark .fs-app-composer .composer-media-btn{background:transparent!important;color:#526059!important;border-color:#CFD9D2!important;}
.theme-dark .fs-app-composer .post-type-btn[aria-pressed="true"]{background:#DFF8E8!important;color:#12813A!important;border-color:#A9EBC0!important;}
.composer-actions{flex-wrap:wrap!important;}
.composer-publish-btn{background:#101311!important;color:#fff!important;border-radius:999px!important;}
.filter-row{padding:2px 0 10px!important;margin-bottom:10px!important;flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none;}
.filter-row button{background:transparent!important;border-color:var(--app-line)!important;color:var(--app-muted)!important;border-radius:999px!important;padding:8px 13px!important;}
.filter-row button[aria-pressed="true"]{background:#16C74E!important;border-color:#16C74E!important;color:#071009!important;}
.post-card{padding:20px!important;margin-bottom:12px!important;}
.post-card:hover{border-color:rgba(22,199,78,.25)!important;}
.directory-wrap{max-width:1180px;margin:0 auto;color:var(--app-copy)!important;}
.directory-title{color:var(--app-copy)!important;}
.directory-grid{gap:12px!important;}
.directory-grid>.ch,.directory-grid>div{transition:border-color .18s ease,transform .18s ease;}
.directory-grid>.ch:hover,.directory-grid>div:hover{border-color:rgba(22,199,78,.3)!important;transform:translateY(-2px);}
.messages-grid{grid-template-columns:292px minmax(0,1fr)!important;gap:12px!important;min-height:min(680px,calc(100dvh - 260px))!important;}
.message-list{padding:8px!important;}
.dm-thread-button{border-radius:7px!important;padding:11px!important;}
.dm-thread-button[data-active="true"]{background:#E2F8EA!important;border-color:#BCEFCC!important;}
.theme-dark .dm-thread-button[data-active="true"] *{color:#0B3A1D!important;}
.message-panel{padding:18px!important;min-height:560px;}
.message-panel-header{border-color:var(--app-line)!important;}
.message-feed{scrollbar-color:rgba(255,255,255,.18) transparent;}
.message-compose{padding-top:12px;border-top:1px solid var(--app-line);}
.message-compose input{background:var(--app-panel-2)!important;}
.dm-e2ee-note{background:rgba(22,199,78,.08)!important;border-color:rgba(22,199,78,.2)!important;color:#65DF89!important;border-radius:8px!important;font-weight:750!important;}
.profile-hero{border-radius:12px!important;}
.profile-stats{gap:8px!important;}
.profile-stat-button{background:var(--app-panel)!important;border-color:var(--app-line)!important;border-radius:8px!important;}
.profile-stat-button[aria-pressed="true"]{background:rgba(22,199,78,.1)!important;border-color:rgba(22,199,78,.28)!important;}
.profile-detail-chip,.industry-tag,.tag-chip{border-radius:4px!important;}
.profile-danger-zone{background:rgba(229,57,53,.04)!important;border-color:rgba(229,57,53,.2)!important;}
.settings-grid{gap:12px!important;}
.settings-grid>div{padding:22px!important;}
.market-hero,.groups-hero{border-radius:10px!important;border:1px solid rgba(22,199,78,.18)!important;background:linear-gradient(145deg,#0D1811,#111512)!important;}
.mobile-app-search,.mobile-section-tabs{display:none;}
.mobile-bottom-nav{box-shadow:none!important;}
.app-view~.toast-stack,.toast-stack{top:84px!important;}

@media(max-width:900px){
  .fs2-section{padding:84px 28px;}
  .fs2-opening,.fs2-social-head,.fs2-why,.fs2-access-head{grid-template-columns:1fr;gap:36px;}
  .fs2-opening{min-height:auto;padding-top:130px;padding-bottom:110px;}
  .fs2-opening h2,.fs2-social h2,.fs2-why h2,.fs2-access h2,.fs2-cta h2{font-size:54px;}
  .fs2-story-sticky{grid-template-columns:1fr;gap:26px;padding:92px 28px 32px;align-content:center;}
  .fs2-story-copy{min-height:230px;}.fs2-story-copy h2{font-size:48px;}.fs2-product-frame{height:440px;min-height:440px;transform:none;}.fs2-product-body{height:362px;padding:14px;}.fs2-cover{height:90px}.fs2-profile-preview{grid-template-rows:90px auto}.fs2-avatar{width:68px;height:68px;margin-top:-34px;border-width:4px;font-size:21px}.fs2-profile-info h3{font-size:26px;margin-top:8px}.fs2-stats{margin-top:12px}.fs2-message-preview{grid-template-columns:130px minmax(0,1fr)}
  .fs2-social-rail{grid-template-columns:repeat(2,1fr);}.fs2-social-item:nth-child(2){border-right:0}.fs2-social-item:nth-child(-n+2){border-bottom:1px solid #CCD5CF}
  .fs2-plans{grid-template-columns:1fr;}.fs2-footer{grid-template-columns:1fr;text-align:center}.fs2-footer-links{justify-content:center}
}
@media(max-width:600px){
  .fs2-intro{height:104dvh}.fs2-intro h1{font-size:44px;line-height:.98}.fs2-intro-copy{padding:16px}
  .fs2-flow{margin-top:-4dvh;background:linear-gradient(180deg,transparent,#080A09 2%)}
  .fs2-section{padding:68px 18px}.fs2-opening{padding-top:94px;padding-bottom:78px;gap:30px}.fs2-opening h2,.fs2-social h2,.fs2-why h2,.fs2-access h2,.fs2-cta h2{font-size:40px;line-height:1.02}.fs2-opening-copy p,.fs2-social-head p,.fs2-why-copy p,.fs2-cta p{font-size:15px}.fs2-primary,.fs2-secondary{width:100%;min-height:50px}
  .fs2-story{height:auto}.fs2-story-sticky{height:auto;position:relative;padding:78px 14px;display:block}.fs2-story-copy{min-height:0;padding:0 4px;margin-bottom:28px}.fs2-story-copy h2{font-size:40px;line-height:1}.fs2-story-copy p{font-size:14px}.fs2-story-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.fs2-story-nav button,.fs2-story-nav button.active{width:100%;height:38px;border-radius:999px;font-size:10px;color:rgba(255,255,255,.55);background:rgba(255,255,255,.07);font-weight:900}.fs2-story-nav button.active{color:#fff;background:var(--fs-green)}.fs2-product-frame{height:462px;min-height:462px;padding:8px;border-radius:10px}.fs2-product-bar{height:48px;padding:0 10px}.fs2-product-tabs span{display:none}.fs2-product-tabs span.active{display:block}.fs2-live{font-size:9px}.fs2-product-body{height:396px;margin-top:8px;padding:10px}.fs2-profile-info{padding:0 10px}.fs2-profile-info p{font-size:11px}.fs2-stats{grid-template-columns:1fr 1fr}.fs2-stats div:last-child{display:none}.fs2-people-preview{gap:7px}.fs2-person{grid-template-columns:42px minmax(0,1fr);padding:10px}.fs2-person-avatar{width:42px;height:42px}.fs2-person button{display:none}.fs2-message-preview{grid-template-columns:1fr}.fs2-thread-list{display:none}.fs2-opportunity{padding:18px}.fs2-opportunity h3{font-size:20px}.fs2-company-mark{width:46px;height:46px}.fs2-opportunity-meta span{padding:7px;font-size:10px}
  .fs2-social{min-height:auto}.fs2-social-head{margin-bottom:42px}.fs2-social-rail{grid-template-columns:1fr}.fs2-social-item{border-right:0!important;border-bottom:1px solid #CCD5CF!important;min-height:142px;padding:22px 4px}.fs2-social-item:last-child{border-bottom:0!important}.fs2-social-item span{font-size:24px}.fs2-social-item p{max-width:300px}
  .fs2-why{gap:54px}.fs2-acronym-row{grid-template-columns:42px 1fr;padding:13px 0}.fs2-acronym-row span{font-size:34px}.fs2-acronym-row b{font-size:18px}
  .fs2-access-head{margin-bottom:38px}.fs2-plan{padding:24px 18px;min-height:0}.fs2-plan h3{font-size:34px}.fs2-plan-list{grid-template-columns:1fr;margin:22px 0}.fs2-cta{min-height:78dvh}.fs2-footer{padding-bottom:calc(28px + env(safe-area-inset-bottom))}.fs2-footer-links{gap:0}
  .cookie-notice{width:calc(100% - 20px);bottom:calc(10px + env(safe-area-inset-bottom))!important}.cookie-card{display:block!important;padding:12px!important}.cookie-card>div:first-child b{font-size:13px!important}.cookie-card p{font-size:11px!important}.cookie-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px!important;margin-top:10px!important}.cookie-actions button{padding:8px 5px!important;font-size:10px!important;min-height:36px}
  .signup-brand{position:absolute;top:18px;left:18px;font-size:19px}.signup-form-panel{padding-top:72px!important;padding-bottom:110px!important}
}
@media(max-width:760px){
  .app-view{padding-bottom:0!important;}
  .toast-stack{top:70px!important;left:12px!important;right:12px!important;}
  .app-view:before{background:linear-gradient(180deg,rgba(22,199,78,.04),transparent 22%);}
  .app-topbar{height:60px!important;min-height:60px!important;padding:7px 12px!important;gap:7px!important;border-bottom-color:var(--app-line)!important;}
  .app-topbar-logo{font-size:19px!important;max-width:none!important;margin-right:auto!important;}
  .app-connection-state,.desktop-signout{display:none!important;}
  .app-topbar>button[aria-label="Edit profile"]>div>div{width:34px!important;height:34px!important;}
  .app-shell{padding:14px 12px calc(92px + env(safe-area-inset-bottom))!important;}
  .mobile-app-search{display:block!important;margin:0 0 10px!important;}
  .mobile-app-search input{height:44px!important;border-radius:8px!important;background:var(--app-panel)!important;border-color:var(--app-line)!important;box-shadow:none!important;padding:10px 12px!important;}
  .mobile-section-tabs{display:flex!important;gap:7px!important;overflow-x:auto!important;padding:0 0 12px!important;margin:0 0 8px!important;scrollbar-width:none;}
  .mobile-section-tabs button{flex:0 0 auto!important;min-height:38px!important;border-radius:999px!important;background:transparent!important;border:1px solid var(--app-line)!important;color:var(--app-muted)!important;padding:8px 12px!important;font-size:11px!important;}
  .mobile-section-tabs button.active{background:rgba(22,199,78,.12)!important;color:#65DF89!important;border-color:rgba(22,199,78,.3)!important;}
  .app-view-intro{grid-template-columns:1fr;gap:12px;padding:20px 2px 22px;margin-bottom:14px;}
  .app-view-intro h1{font-size:38px!important;line-height:1!important;overflow-wrap:normal!important;}
  .app-view-intro p{font-size:13px!important;line-height:1.6!important;}
  .feed-grid{display:block!important;}
  .mobile-profile-summary{display:block!important;padding:14px!important;margin-bottom:10px!important;}
  .feed-mode-switch{margin-bottom:10px!important;}
  .feed-mode-switch button{min-height:56px!important;padding:10px 2px!important;}
  .fs-app-composer{padding:14px!important;}
  .fs-app-composer>div{gap:9px!important;}
  .fs-app-composer>div>.avatar-shell{width:36px!important;height:36px!important;}
  .composer-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;}
  .composer-actions .post-type-btn{width:100%!important;min-height:38px!important;padding:7px 5px!important;font-size:10px!important;}
  .composer-actions .composer-media-btn{width:100%!important;min-height:40px!important;padding:7px 5px!important;font-size:11px!important;}
  .composer-publish-btn{grid-column:span 2!important;width:100%!important;min-height:42px!important;margin:0!important;}
  .filter-row{margin-left:-12px!important;margin-right:-12px!important;padding:2px 12px 10px!important;}
  .post-card{padding:16px!important;}
  .directory-wrap{padding-bottom:8px!important;}
  .directory-grid{grid-template-columns:1fr!important;}
  .messages-grid{display:block!important;min-height:0!important;}
  .message-list{max-height:232px;overflow-y:auto;margin-bottom:10px;}
  .message-panel{min-height:calc(100dvh - 350px)!important;padding:13px!important;}
  .message-panel-actions{width:100%!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
  .message-panel-actions button{width:100%!important;min-height:36px!important;padding:7px 5px!important;font-size:10px!important;}
  .message-row{max-width:88%!important;}
  .message-compose{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:7px!important;position:sticky;bottom:76px;background:var(--app-panel);padding:10px 0 2px;}
  .message-compose button{min-width:64px!important;}
  .profile-hero-row{grid-template-columns:76px minmax(0,1fr)!important;gap:12px!important;align-items:end!important;}
  .profile-hero-row>.profile-edit-button{grid-column:1/-1!important;width:100%!important;margin-top:4px!important;}
  .profile-hero-copy{padding-top:36px!important;}
  .profile-hero-copy h1{font-size:29px!important;}
  .profile-stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
  .settings-grid{grid-template-columns:1fr!important;}
  .mobile-bottom-nav{left:0!important;right:0!important;bottom:0!important;border-radius:0!important;border-width:1px 0 0!important;padding:5px 8px calc(5px + env(safe-area-inset-bottom))!important;background:rgba(8,10,9,.94)!important;backdrop-filter:blur(22px)!important;}
  .mobile-bottom-nav button{height:52px!important;border-radius:0!important;background:transparent!important;color:var(--app-muted)!important;position:relative;}
  .mobile-bottom-nav button.active{background:transparent!important;color:#63DF88!important;}
  .mobile-bottom-nav button.active:before{content:"";position:absolute;top:-5px;left:28%;right:28%;height:2px;background:#16C74E;}
}
@media(prefers-reduced-motion:reduce){.fs2-intro-line{animation:none;clip-path:none}.fs2-intro-line:last-child:after{display:none}.fs2-product-frame,.fs2-primary{transition:none!important}}
.a11y-reduce-motion .fs2-intro-line{animation:none!important;clip-path:none!important}.a11y-reduce-motion .fs2-intro-line:last-child:after{display:none!important}
@supports not (overflow:clip){
  html,body,#root,.app-view,.landing-cinematic-root{overflow-x:hidden!important;}
}
`;

const Tag=({label,style={},className=""})=><span className={`tag-chip ${className}`.trim()} style={{display:"inline-block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",fontSize:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",borderRadius:6,padding:"3px 9px",whiteSpace:"nowrap",wordBreak:"keep-all",verticalAlign:"middle",...style}}>{label}</span>;
const IT=({label,style={}})=>{const s=C.ind[label]||C.ind.Other;return <Tag label={label} className="industry-tag" style={{"--tag-bg":s.bg,"--tag-color":s.color,"--tag-border":"transparent",...style}}/>;};
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
const OBJECTIONABLE_PATTERNS=[
  {label:"hate or slur",pattern:/\b(nigger|faggot|kike|chink|spic|wetback|tranny|retard)\b/i},
  {label:"violent threat",pattern:/\b(kill yourself|kys|i will kill|i'm going to kill|shoot up|bomb threat)\b/i},
  {label:"explicit sexual content",pattern:/\b(porn|onlyfans|nude|nudes|blowjob|handjob|cumshot|deepthroat|hardcore sex)\b/i},
  {label:"sexual exploitation",pattern:/\b(child porn|cp\b|underage sex|minor sex)\b/i},
  {label:"harassment",pattern:/\b(doxx|dox|swat you|leak your address)\b/i},
];
const moderationIssue=value=>{
  const text=String(value||"");
  return OBJECTIONABLE_PATTERNS.find(entry=>entry.pattern.test(text))?.label||"";
};
const readImageFile=(file,maxSize=720,maxBytes=680000)=>new Promise((resolve,reject)=>{
  if(!file?.type?.startsWith("image/"))return reject(new Error("Choose an image file"));
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Could not read image"));
  reader.onload=()=>{
    const img=new Image();
    img.onerror=()=>reject(new Error("Could not load image"));
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      const ctx=canvas.getContext("2d");
      let scale=Math.min(1,maxSize/Math.max(img.width,img.height));
      let quality=0.82;
      let dataUrl="";
      for(let attempt=0;attempt<10;attempt+=1){
        const width=Math.max(1,Math.round(img.width*scale));
        const height=Math.max(1,Math.round(img.height*scale));
        canvas.width=width;
        canvas.height=height;
        ctx.clearRect(0,0,width,height);
        ctx.drawImage(img,0,0,width,height);
        dataUrl=canvas.toDataURL("image/jpeg",quality);
        if(dataUrl.length<=maxBytes)break;
        if(quality>0.58)quality-=0.08;
        else scale*=0.82;
      }
      if(dataUrl.length>maxBytes)return reject(new Error("That image is too large. Try a smaller photo."));
      resolve(dataUrl);
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
  if(isImage)return readImageFile(file,1280,680000).then(url=>resolve({id:`media_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"image",url,alt:file.name||"Post photo"})).catch(reject);
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Could not read video"));
  reader.onload=()=>resolve({id:`media_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"video",url:String(reader.result||""),alt:file.name||"Post video"});
  reader.readAsDataURL(file);
});
const Av=({i,size=40,src="",grad=false,online=false,style={}})=>{
  const image=safeImageUrl(src);
  const computedBackground=image?`center / cover no-repeat url("${image}")`:(style.background||style.backgroundColor||(grad?GR:C.aLight));
  const computedBorder=style.border||(image?"1.5px solid rgba(255,255,255,0.35)":grad?"none":`1.5px solid ${C.aSoft}`);
  const computedColor=style.color||(grad?"#fff":C.accent);
  return (
  <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.3,overflow:"hidden",...style,background:computedBackground,border:computedBorder,color:computedColor}}>{image?"":i}</div>
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
  arrowRight:<><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
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
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.4-.2-.1a1.8 1.8 0 0 0-2.1.2 1.8 1.8 0 0 0-.6 1.9V23h-6v-.5a1.8 1.8 0 0 0-.6-1.9 1.8 1.8 0 0 0-2.1-.2l-.2.1-2-3.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.5-1.2H3v-4h.1a1.8 1.8 0 0 0 1.5-1.2 1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.4.2.1a1.8 1.8 0 0 0 2.1-.2 1.8 1.8 0 0 0 .6-1.9V1h6v.5a1.8 1.8 0 0 0 .6 1.9 1.8 1.8 0 0 0 2.1.2l.2-.1 2 3.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.5 1.2h.1v4h-.1a1.8 1.8 0 0 0-1.5 1.2Z"/></>,
  lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon:<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"/>,
};
const Icon=({name,size=18,color="currentColor",strokeWidth=2,filled=false,style={}})=>(
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" style={{display:"block",flexShrink:0,...style}} fill={filled?"currentColor":"none"} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {iconPaths[name]||iconPaths.info}
  </svg>
);
const isVerifiedIdentity=person=>{
  const handle=String(person?.handle||"").toLowerCase();
  const email=String(person?.email||"").toLowerCase();
  const name=String(person?.name||person?.user||"").trim().toLowerCase();
  return Boolean(person?.verified)||handle==="@taylorbrown"||email==="tsbrown223@gmail.com"||name==="taylor brown";
};
const VerifiedBadge=({size=16})=>(
  <span aria-label="Verified account" title="Verified account" style={{width:size,height:size,minWidth:size,borderRadius:"50%",background:C.accent,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",flex:"0 0 auto",boxShadow:"0 0 0 2px rgba(22,199,78,0.12)",lineHeight:0,verticalAlign:"middle"}}>
    <svg viewBox="0 0 16 16" width={Math.round(size*0.68)} height={Math.round(size*0.68)} aria-hidden="true" focusable="false" style={{display:"block",overflow:"visible"}}>
      <path d="M4.3 8.25 6.75 10.7 11.8 5.45" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);
const NameWithVerified=({name,person,size=16,style={},nameStyle={}})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:6,minWidth:0,maxWidth:"100%",verticalAlign:"middle",...style}}>
    <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",...nameStyle}}>{name}</span>
    {isVerifiedIdentity(person)&&<VerifiedBadge size={size}/>}
  </span>
);
const IconBadge=({name,pro=false,style={}})=>(
  <div className="icon-badge" style={{width:48,height:48,borderRadius:14,background:pro?"#18271E":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,border:"1px solid rgba(255,255,255,0.08)",color:C.accent,...style}}>
    <Icon name={name} size={24}/>
  </div>
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

function clearAccountLocalData(){
  try{
    [
      "fear-session-token",
      "fear-screen",
      "fear-profile",
      "fear-view",
      "fear-posts",
      "fear-people",
      "fear-events",
      "fear-mentors",
      "fear-messages",
      "fear-groups",
      "fear-notifications",
      "fear-unread-notifications",
      "fear-stats",
      "fear-connections",
      "fear-user-deals",
      "fear-saved-deals",
      "fear-feed-mode",
      "fear-blocked-user-ids",
      "fear-data-version",
    ].forEach(key=>localStorage.removeItem(key));
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

class ApiError extends Error{
  constructor(message,{status=0,code="REQUEST_FAILED",requestId="",retryAfter=""}={}){
    super(message);
    this.name="ApiError";
    this.status=status;
    this.code=code;
    this.requestId=requestId;
    this.retryAfter=retryAfter;
  }
}

async function api(path,options={}){
  const token=getSessionToken();
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),options.timeout||15000);
  const requestId=crypto?.randomUUID?.()||`web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const hasBody=options.body!==undefined&&options.body!==null;
  const headers={
    accept:"application/json",
    "x-client-request-id":requestId,
    ...(hasBody?{"content-type":"application/json"}:{}),
    ...(token?{"x-fear-token":token}:{}),
    ...(options.headers||{}),
  };
  const abortFromCaller=()=>controller.abort();
  options.signal?.addEventListener?.("abort",abortFromCaller,{once:true});
  try{
    const res=await fetch(`/api${path}`,{...options,headers,credentials:"same-origin",signal:controller.signal});
    const data=await res.json().catch(()=>({}));
    if(data.token){
      try{localStorage.setItem("fear-session-token",data.token);}catch{}
    }
    if(!res.ok){
      if(res.status===401&&token){
        clearSessionToken();
        window.dispatchEvent(new CustomEvent("fear:session-expired"));
      }
      throw new ApiError(data.error||"We could not complete that request.",{
        status:res.status,
        code:data.code||`HTTP_${res.status}`,
        requestId:data.requestId||res.headers.get("x-request-id")||requestId,
        retryAfter:res.headers.get("retry-after")||"",
      });
    }
    return data;
  }catch(error){
    if(error instanceof ApiError)throw error;
    if(error?.name==="AbortError")throw new ApiError("The request took too long. Check your connection and try again.",{code:"REQUEST_TIMEOUT",requestId});
    throw new ApiError("fear.social could not reach the server. Check your connection and try again.",{code:"NETWORK_ERROR",requestId});
  }finally{
    window.clearTimeout(timeout);
    options.signal?.removeEventListener?.("abort",abortFromCaller);
  }
}

const E2EE_PREFIX="__fear_e2ee_v1__:";
const bytesToBase64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes=value=>Uint8Array.from(atob(String(value||"")),char=>char.charCodeAt(0));
const e2eePrivateKeyName=userId=>`fear-e2ee-private-${userId}`;
const e2eePublicKeyName=userId=>`fear-e2ee-public-${userId}`;
const parseE2EEPayload=value=>{
  const raw=String(value||"");
  if(!raw.startsWith(E2EE_PREFIX))return null;
  try{return JSON.parse(raw.slice(E2EE_PREFIX.length));}catch{return null;}
};
async function ensureE2EEIdentity(userId){
  if(!userId||!crypto?.subtle)return null;
  const privateName=e2eePrivateKeyName(userId);
  const publicName=e2eePublicKeyName(userId);
  let privateJwk=null;
  let publicJwk=null;
  try{
    privateJwk=JSON.parse(localStorage.getItem(privateName)||"null");
    publicJwk=JSON.parse(localStorage.getItem(publicName)||"null");
  }catch{}
  if(privateJwk?.kty==="EC"&&publicJwk?.kty==="EC")return {privateJwk,publicKey:publicJwk};
  const pair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"]);
  privateJwk=await crypto.subtle.exportKey("jwk",pair.privateKey);
  publicJwk=await crypto.subtle.exportKey("jwk",pair.publicKey);
  try{
    localStorage.setItem(privateName,JSON.stringify(privateJwk));
    localStorage.setItem(publicName,JSON.stringify(publicJwk));
  }catch{}
  return {privateJwk,publicKey:publicJwk};
}
async function deriveE2EEKey(privateJwk,otherPublicJwk){
  const privateKey=await crypto.subtle.importKey("jwk",privateJwk,{name:"ECDH",namedCurve:"P-256"},false,["deriveKey"]);
  const publicKey=await crypto.subtle.importKey("jwk",otherPublicJwk,{name:"ECDH",namedCurve:"P-256"},false,[]);
  return crypto.subtle.deriveKey({name:"ECDH",public:publicKey},privateKey,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encryptE2EEMessage(userId,recipientPublicKey,text){
  const identity=await ensureE2EEIdentity(userId);
  if(!identity?.publicKey||!recipientPublicKey)return null;
  const recipientEphemeral=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"]);
  const recipientPrivateJwk=await crypto.subtle.exportKey("jwk",recipientEphemeral.privateKey);
  const recipientSenderKey=await crypto.subtle.exportKey("jwk",recipientEphemeral.publicKey);
  const key=await deriveE2EEKey(recipientPrivateJwk,recipientPublicKey);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(text));
  const selfEphemeral=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"]);
  const selfPrivateJwk=await crypto.subtle.exportKey("jwk",selfEphemeral.privateKey);
  const selfSenderKey=await crypto.subtle.exportKey("jwk",selfEphemeral.publicKey);
  const selfKey=await deriveE2EEKey(selfPrivateJwk,identity.publicKey);
  const selfIv=crypto.getRandomValues(new Uint8Array(12));
  const selfCt=await crypto.subtle.encrypt({name:"AES-GCM",iv:selfIv},selfKey,new TextEncoder().encode(text));
  return {
    v:1,
    alg:"ECDH-P256+A256GCM",
    iv:bytesToBase64(iv),
    ct:bytesToBase64(ct),
    senderKey:recipientSenderKey,
    recipientKey:recipientPublicKey,
    self:{iv:bytesToBase64(selfIv),ct:bytesToBase64(selfCt),senderKey:selfSenderKey}
  };
}
async function decryptE2EEMessage(userId,msg,thread){
  const payload=parseE2EEPayload(typeof msg==="string"?msg:msg?.text);
  if(!payload)return typeof msg==="string"?msg:String(msg?.text||"");
  const mine=(typeof msg==="object"&&msg?.author==="you");
  const identity=await ensureE2EEIdentity(userId);
  const encryptedPart=mine&&payload.self?payload.self:payload;
  const otherPublicKey=encryptedPart.senderKey;
  if(!identity?.privateJwk||!otherPublicKey)return "Encrypted message unavailable on this device";
  try{
    const key=await deriveE2EEKey(identity.privateJwk,otherPublicKey);
    const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv:base64ToBytes(encryptedPart.iv)},key,base64ToBytes(encryptedPart.ct));
    return new TextDecoder().decode(decrypted);
  }catch{
    return "Encrypted message unavailable on this device";
  }
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
  {id:"opp-founder-content",title:"Career Content Assistant",company:"Buildroom",type:"Gig",tag:"Creative",budget:"$400-$800/project",location:"Remote",level:"Beginner friendly",skills:["content","writing","editing","career"],desc:"Turn early career updates into short posts, launch recaps, and lightweight newsletter drafts for people building proof.",fit:["writing","content","career","creative","marketing"]},
  {id:"opp-volunteer-community",title:"Volunteer Community Builder",company:"fear.social community",type:"Volunteer",tag:"Networking",budget:"Volunteer",location:"Remote",level:"First step",skills:["community","outreach","events","support"],desc:"Help welcome new members, surface useful resources, and support small community moments for people taking their first career step.",fit:["volunteer","community","networking","first step","support"]},
  {id:"opp-local-events",title:"Campus Career Event Lead",company:"fear.social partners",type:"Opportunity",tag:"Networking",budget:"Revenue share",location:"Hybrid",level:"First step",skills:["events","community","sales","networking"],desc:"Host small first-step meetups and help connect students, creators, career switchers, and early operators in your city.",fit:["events","community","networking","sales","first step"]},
  {id:"opp-fashion-market",title:"Fashion Market Research Sprint",company:"Indie Label Lab",type:"Gig",tag:"Fashion",budget:"$250-$500",location:"Remote",level:"Beginner friendly",skills:["fashion","research","tiktok","retail"],desc:"Research emerging fashion categories, competitor drops, TikTok signals, and buyer personas for a small apparel brand.",fit:["fashion","research","brand","creative"]},
  {id:"opp-finance-ops",title:"Finance Operations Assistant",company:"Seedstage CFO Co.",type:"Job",tag:"Finance",budget:"Part-time",location:"Remote",level:"Entry level",skills:["finance","ops","spreadsheets","client support"],desc:"Support invoice tracking, simple reports, and client-facing admin workflows for small growing teams.",fit:["finance","operations","spreadsheets","business"]},
  {id:"opp-food-popup",title:"Food Pop-Up Launch Helper",company:"Neighborhood Test Kitchen",type:"Opportunity",tag:"Food",budget:"Stipend + sales bonus",location:"Local",level:"Hands-on",skills:["food","events","customer","operations"],desc:"Help plan, promote, and operate a weekend food pop-up while learning pricing, prep, and customer feedback loops.",fit:["food","operations","events","local"]},
  {id:"opp-health-community",title:"Wellness Community Coordinator",company:"Bright Routine",type:"Job",tag:"Health",budget:"Contract",location:"Remote",level:"Entry level",skills:["health","community","support","content"],desc:"Moderate community threads, collect member feedback, and help turn wellness conversations into useful resources.",fit:["health","community","content","support"]},
  {id:"opp-exploring-shadow",title:"Career Shadow Week",company:"Operator Office",type:"Opportunity",tag:"Exploring",budget:"Unpaid learning sprint",location:"Remote",level:"No experience needed",skills:["learning","career","operations","research"],desc:"Spend a week shadowing real workflows, taking notes, and learning how interests become actual career paths.",fit:["exploring","first step","career","business","learning"]},
  {id:"opp-education-tutor",title:"Career Basics Tutor Creator",company:"Skillstack",type:"Gig",tag:"Education",budget:"$35/hr",location:"Remote",level:"Beginner friendly",skills:["education","career","content","teaching"],desc:"Create simple explainers for first-time career builders around outreach, interviews, projects, and momentum.",fit:["education","teaching","career","content"]},
];
const GROUPS=[{
  id:"fear-official",
  name:"fear.",
  slug:"fear",
  desc:"Official fear.social updates, feature drops, career notes, and internal announcements from the team.",
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

function Navbar({setScreen,notify,onOpenPanel,forceVisible=false}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>(window.innerHeight||720)*0.72);
    h();
    window.addEventListener("scroll",h,{passive:true});
    window.addEventListener("resize",h);
    return()=>{
      window.removeEventListener("scroll",h);
      window.removeEventListener("resize",h);
    };
  },[]);
  const visible=forceVisible||scrolled;
  const links=[["Product","platform"],["Why fear","why-fear"],["Proof","activity"],["Pricing","pricing"],["Board","board"],["Join","cta"]];
  const navTo=id=>{
    if(id==="why-fear") return setScreen("why");
    if(document.getElementById(id)) return scrollToSection(id);
    setScreen("landing");
    window.setTimeout(()=>scrollToSection(id),60);
  };
  return(
    <div className="landing-nav" style={{position:"fixed",top:18,left:0,right:0,zIndex:100,padding:"0 32px",display:"flex",justifyContent:"center",pointerEvents:"none",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(-16px)",transition:"opacity .35s ease, transform .35s ease"}}>
      <div style={{width:"min(1120px,100%)",height:58,borderRadius:999,background:visible?"rgba(255,255,255,0.94)":"rgba(255,255,255,0.86)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.22)",boxShadow:"0 24px 70px rgba(0,0,0,0.22)",display:"flex",alignItems:"center",padding:"0 10px 0 22px",transition:"all 0.3s",pointerEvents:visible?"auto":"none"}}>
      <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:21,color:"#050506",letterSpacing:0,flex:1}}>fear<span style={{color:C.accent}}>.</span>social</div>
      <div className="landing-nav-links" style={{display:"flex",gap:2,marginRight:14}}>
        {links.map(([label,id])=>(
          <button key={label} onClick={()=>navTo(id)} className="nl bs" style={{background:"none",border:"none",color:"#555B66",fontSize:13,fontWeight:700,padding:"9px 13px",cursor:"pointer",borderRadius:999}}>{label}</button>
        ))}
      </div>
      <div className="landing-nav-actions" style={{display:"flex",gap:8}}>
        <button onClick={()=>setScreen(hasSessionToken()?"app":"login")} className="bs landing-nav-login" style={{background:"#fff",border:"1px solid #E4E7EC",borderRadius:999,padding:"9px 17px",color:"#111318",fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Log in</button>
        <button onClick={()=>setScreen("signup")} className="bs landing-nav-join" style={{background:"#111318",border:"1px solid #111318",borderRadius:999,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:900,whiteSpace:"nowrap"}}>Join free</button>
      </div>
      </div>
    </div>
  );
}

function FlowWaveScene({screen,reducedMotion=false}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return undefined;
    let disposed=false;
    let renderer=null;
    let geometry=null;
    let material=null;
    let motesGeometry=null;
    let motesMaterial=null;
    let animationFrame=0;
    const parent=canvas.parentElement;
    const cleanup=[];
    const fail=()=>{
      canvas.dataset.ready="fallback";
      parent?.classList.add("is-fallback");
    };
    const init=async()=>{
      try{
        const THREE=await import(/* @vite-ignore */"https://unpkg.com/three@0.143.0/build/three.module.js");
        if(disposed)return;
        const mobile=window.matchMedia?.("(max-width: 760px)")?.matches;
        const coarse=window.matchMedia?.("(pointer: coarse)")?.matches;
        const scene3d=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(44,1,.1,180);
        camera.position.set(0,7.4,16);
        renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:"high-performance"});
        renderer.setClearColor(0x000000,0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1:1.35));
        geometry=new THREE.PlaneGeometry(42,74,mobile?54:116,mobile?88:176);
        const uniforms={
          uTime:{value:0},
          uStream:{value:0},
          uPointer:{value:new THREE.Vector2(0,0)},
          uPointerPower:{value:0},
          uWave:{value:1},
        };
        material=new THREE.ShaderMaterial({
          uniforms,
          transparent:true,
          depthWrite:false,
          blending:THREE.AdditiveBlending,
          vertexShader:`
            uniform float uTime;
            uniform float uStream;
            uniform float uWave;
            uniform float uPointerPower;
            uniform vec2 uPointer;
            varying float vEnergy;
            varying float vFade;
            vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
            vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
            vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
            float snoise(vec3 v){
              const vec2 C=vec2(1.0/6.0,1.0/3.0);
              const vec4 D=vec4(0.0,.5,1.0,2.0);
              vec3 i=floor(v+dot(v,C.yyy));
              vec3 x0=v-i+dot(i,C.xxx);
              vec3 g=step(x0.yzx,x0.xyz);
              vec3 l=1.0-g;
              vec3 i1=min(g.xyz,l.zxy);
              vec3 i2=max(g.xyz,l.zxy);
              vec3 x1=x0-i1+C.xxx;
              vec3 x2=x0-i2+C.yyy;
              vec3 x3=x0-D.yyy;
              i=mod289(i);
              vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
              float n_=1.0/7.0;
              vec3 ns=n_*D.wyz-D.xzx;
              vec4 j=p-49.0*floor(p*ns.z*ns.z);
              vec4 x_=floor(j*ns.z);
              vec4 y_=floor(j-7.0*x_);
              vec4 x=x_*ns.x+ns.yyyy;
              vec4 y=y_*ns.x+ns.yyyy;
              vec4 h=1.0-abs(x)-abs(y);
              vec4 b0=vec4(x.xy,y.xy);
              vec4 b1=vec4(x.zw,y.zw);
              vec4 s0=floor(b0)*2.0+1.0;
              vec4 s1=floor(b1)*2.0+1.0;
              vec4 sh=-step(h,vec4(0.0));
              vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
              vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
              vec3 p0=vec3(a0.xy,h.x);
              vec3 p1=vec3(a0.zw,h.y);
              vec3 p2=vec3(a1.xy,h.z);
              vec3 p3=vec3(a1.zw,h.w);
              vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
              p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
              vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
              m=m*m;
              return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
            }
            void main(){
              vec3 p=vec3(position.x,0.0,position.y);
              float travel=p.z+uStream;
              float broad=snoise(vec3(p.x*.09,travel*.065,uTime*.055));
              float detail=snoise(vec3(p.x*.22,travel*.16,uTime*.11+4.0));
              float wave=(broad*2.7+detail*.72)*uWave;
              float ridge=pow(max(0.0,broad),2.0)*2.2*uWave;
              p.y=wave+ridge-1.15;
              float pointerDistance=length(p.xz-uPointer);
              float pointerLift=exp(-pointerDistance*.32)*uPointerPower;
              p.y+=pointerLift*1.35;
              p.x+=(p.x-uPointer.x)*pointerLift*.025;
              vec4 mvPosition=modelViewMatrix*vec4(p,1.0);
              float perspective=clamp(19.0/-mvPosition.z,.38,2.2);
              gl_PointSize=(1.12+max(0.0,p.y)*.18+pointerLift*.55)*perspective;
              gl_Position=projectionMatrix*mvPosition;
              vEnergy=clamp((p.y+3.2)/7.2,0.0,1.0)+pointerLift*.22;
              vFade=smoothstep(38.0,8.0,length(p.xz));
            }
          `,
          fragmentShader:`
            varying float vEnergy;
            varying float vFade;
            void main(){
              vec2 q=gl_PointCoord-.5;
              float circle=smoothstep(.5,.12,length(q));
              vec3 deep=vec3(.006,.09,.045);
              vec3 bright=vec3(.20,.91,.53);
              vec3 color=mix(deep,bright,clamp(vEnergy,0.0,1.0));
              gl_FragColor=vec4(color,circle*vFade*(.32+vEnergy*.58));
            }
          `,
        });
        scene3d.add(new THREE.Points(geometry,material));

        const moteCount=mobile?42:110;
        const motePositions=new Float32Array(moteCount*3);
        for(let i=0;i<moteCount;i+=1){
          motePositions[i*3]=(Math.random()-.5)*34;
          motePositions[i*3+1]=Math.random()*8-1;
          motePositions[i*3+2]=-Math.random()*52+10;
        }
        motesGeometry=new THREE.BufferGeometry();
        motesGeometry.setAttribute("position",new THREE.BufferAttribute(motePositions,3));
        motesMaterial=new THREE.PointsMaterial({color:0x5eff9a,size:mobile?.035:.045,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending});
        const motes=new THREE.Points(motesGeometry,motesMaterial);
        scene3d.add(motes);

        const pointer={targetX:0,targetY:0,x:0,y:0,power:0,last:0};
        const onPointer=e=>{
          pointer.targetX=(e.clientX/window.innerWidth-.5)*2;
          pointer.targetY=(e.clientY/window.innerHeight-.5)*2;
          pointer.last=performance.now();
        };
        const onResize=()=>{
          const width=Math.max(1,window.innerWidth);
          const height=Math.max(1,window.innerHeight);
          camera.aspect=width/height;
          camera.updateProjectionMatrix();
          renderer?.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1:1.35));
          renderer?.setSize(width,height,false);
        };
        window.addEventListener("pointermove",onPointer,{passive:true});
        window.addEventListener("resize",onResize,{passive:true});
        cleanup.push(()=>window.removeEventListener("pointermove",onPointer),()=>window.removeEventListener("resize",onResize));
        onResize();
        const clock=new THREE.Clock();
        let smoothScroll=0;
        const renderFrame=()=>{
          if(disposed)return;
          const elapsed=clock.getElapsedTime();
          const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
          const scrollTarget=Math.min(1,window.scrollY/maxScroll);
          smoothScroll+=(scrollTarget-smoothScroll)*.055;
          pointer.x+=(pointer.targetX-pointer.x)*.12;
          pointer.y+=(pointer.targetY-pointer.y)*.12;
          const recentlyMoved=performance.now()-pointer.last<900;
          pointer.power+=(Number(recentlyMoved)-pointer.power)*.08;
          uniforms.uTime.value=elapsed;
          uniforms.uStream.value=elapsed*(mobile?.65:.9)+smoothScroll*18;
          uniforms.uWave.value=1+smoothScroll*.62;
          uniforms.uPointer.value.set(pointer.x*9,-7+(-pointer.y*.5+.5)*23);
          uniforms.uPointerPower.value=coarse?0:pointer.power;
          camera.position.x=pointer.x*.6;
          camera.position.y=7.4-smoothScroll*3.6+pointer.y*.22;
          camera.position.z=16-smoothScroll*4.8;
          camera.lookAt(pointer.x*.3,-.4-smoothScroll*.55,-7-smoothScroll*7);
          motes.rotation.y=elapsed*.006;
          renderer.render(scene3d,camera);
          canvas.dataset.ready="true";
          canvas.dataset.frames=String((Number(canvas.dataset.frames)||0)+1);
          if(!reducedMotion)animationFrame=requestAnimationFrame(renderFrame);
        };
        renderFrame();
      }catch{
        fail();
      }
    };
    init();
    return()=>{
      disposed=true;
      cancelAnimationFrame(animationFrame);
      cleanup.forEach(fn=>fn());
      geometry?.dispose();
      material?.dispose();
      motesGeometry?.dispose();
      motesMaterial?.dispose();
      renderer?.dispose();
    };
  },[reducedMotion]);
  return(
    <div className="global-flow-wave" data-screen={screen} aria-hidden="true">
      <canvas ref={canvasRef}/>
      <div className="global-flow-wave-scrim"/>
    </div>
  );
}

function LandingWaveField(){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext("2d",{alpha:true});
    if(!canvas||!ctx)return undefined;
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const coarse=window.matchMedia?.("(pointer: coarse)")?.matches;
    let width=1;
    let height=1;
    let ratio=1;
    let frame=0;
    let running=true;
    let visible=true;
    let lastTime=0;
    const pointer={targetX:0,targetY:0,x:0,y:0,activity:0,last:0};

    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      width=Math.max(1,Math.round(rect.width));
      height=Math.max(1,Math.round(rect.height));
      ratio=Math.min(window.devicePixelRatio||1,coarse?1.1:1.5);
      canvas.width=Math.round(width*ratio);
      canvas.height=Math.round(height*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
    };
    const move=event=>{
      pointer.targetX=Math.max(-1,Math.min(1,event.clientX/Math.max(1,width)*2-1));
      pointer.targetY=Math.max(-1,Math.min(1,event.clientY/Math.max(1,height)*2-1));
      pointer.last=performance.now();
    };
    const draw=time=>{
      if(!running)return;
      if(!reduced)frame=requestAnimationFrame(draw);
      if(!visible||document.hidden)return;
      const seconds=time*.001;
      const delta=Math.min(.05,Math.max(0,(time-lastTime)*.001));
      lastTime=time;
      pointer.x+=(pointer.targetX-pointer.x)*Math.min(1,delta*7.5);
      pointer.y+=(pointer.targetY-pointer.y)*Math.min(1,delta*7.5);
      const active=performance.now()-pointer.last<1500&&!coarse;
      pointer.activity+=(Number(active)-pointer.activity)*Math.min(1,delta*5.5);
      const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      const scroll=Math.max(0,Math.min(1,window.scrollY/maxScroll));
      const mobile=width<700;
      const rows=mobile?31:48;
      const columns=mobile?43:82;
      const horizon=height*(mobile?.30:.27)+scroll*height*.05;
      const stream=reduced?0:(seconds*.032)%1;

      ctx.clearRect(0,0,width,height);
      const atmosphere=ctx.createRadialGradient(width*.5,height*.58,0,width*.5,height*.58,Math.max(width,height)*.72);
      atmosphere.addColorStop(0,"rgba(13,112,55,.13)");
      atmosphere.addColorStop(.48,"rgba(3,40,20,.06)");
      atmosphere.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=atmosphere;
      ctx.fillRect(0,0,width,height);

      for(let row=0;row<rows;row+=1){
        const depth=(row/rows+stream)%1;
        const eased=Math.pow(depth,1.62);
        const baseY=horizon+eased*height*.82;
        const spread=width*(.18+depth*.46);
        const amplitude=(7+depth*43)*(1+scroll*.5);
        const points=[];
        for(let column=0;column<columns;column+=1){
          const across=column/(columns-1)*2-1;
          const worldX=across*7.5;
          const broad=Math.sin(worldX*.72+seconds*.42+depth*8.5)*.62;
          const detail=Math.sin(worldX*1.85-seconds*.27+depth*14.0)*.24;
          const cross=Math.cos(worldX*.38+depth*21.0-seconds*.18)*.18;
          const screenX=width*.5+across*spread;
          const pointerScreenX=width*.5+pointer.x*width*.34;
          const pointerScreenY=height*.5+pointer.y*height*.22;
          const distance=Math.hypot((screenX-pointerScreenX)/Math.max(1,width*.32),(baseY-pointerScreenY)/Math.max(1,height*.3));
          const lift=Math.exp(-distance*distance*4.6)*pointer.activity;
          const wave=broad+detail+cross;
          points.push({x:screenX,y:baseY-wave*amplitude-lift*(10+depth*38),energy:Math.max(0,Math.min(1,.48+wave*.27+lift*.34)),depth});
        }

        ctx.beginPath();
        points.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));
        ctx.strokeStyle=`rgba(35,190,92,${.012+depth*.045})`;
        ctx.lineWidth=.45+depth*.28;
        ctx.stroke();

        for(const point of points){
          const radius=.42+point.depth*1.18;
          const green=Math.round(116+point.energy*122);
          const red=Math.round(5+point.energy*43);
          const blue=Math.round(43+point.energy*82);
          ctx.beginPath();
          ctx.arc(point.x,point.y,radius,0,Math.PI*2);
          ctx.fillStyle=`rgba(${red},${green},${blue},${.11+point.depth*.28+point.energy*.13})`;
          ctx.fill();
        }
      }
      canvas.dataset.ready="true";
      canvas.dataset.frames=String((Number(canvas.dataset.frames)||0)+1);
    };

    resize();
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;},{threshold:0}):null;
    observer?.observe(canvas);
    const resizeObserver=window.ResizeObserver?new ResizeObserver(resize):null;
    resizeObserver?.observe(canvas);
    if(!resizeObserver)window.addEventListener("resize",resize,{passive:true});
    window.addEventListener("pointermove",move,{passive:true});
    draw(0);
    return()=>{
      running=false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizeObserver?.disconnect();
      if(!resizeObserver)window.removeEventListener("resize",resize);
      window.removeEventListener("pointermove",move);
    };
  },[]);
  return <canvas ref={canvasRef} className="landing-flow-canvas landing-wave-field" aria-hidden="true"/>;
}

function FearFlowCanvas(){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return;
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const coarse=window.matchMedia?.("(pointer: coarse)")?.matches;
    let width=1;
    let height=1;
    let ratio=1;
    let frame=0;
    let running=true;
    let visible=true;
    let tick=0;
    let particles=[];
    const pointer={x:0,y:0,active:false,lastMove:0};

    const palette=[
      [18,199,78],
      [70,235,130],
      [180,255,208],
      [27,144,78],
    ];
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      width=Math.max(1,Math.round(rect.width));
      height=Math.max(1,Math.round(rect.height));
      ratio=Math.min(window.devicePixelRatio||1,coarse ? 1.15 : 1.5);
      canvas.width=Math.round(width*ratio);
      canvas.height=Math.round(height*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.fillStyle="#050506";
      ctx.fillRect(0,0,width,height);
    };
    const makeParticle=(x,y,power=1)=>{
      const angle=Math.random()*Math.PI*2;
      const speed=(.35+Math.random()*1.8)*power;
      const color=palette[Math.floor(Math.random()*palette.length)];
      const life=70+Math.random()*115;
      return{
        x,y,px:x,py:y,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        seed:Math.random()*1000,
        phase:Math.random()*Math.PI*2,
        life,maxLife:life,
        width:.45+Math.random()*2.1,
        color,
      };
    };
    const splat=(x,y,power=1,count=8)=>{
      const cap=coarse ? 95 : 190;
      for(let i=0;i<count&&particles.length<cap;i++){
        const spread=(8+Math.random()*42)*power;
        const angle=Math.random()*Math.PI*2;
        particles.push(makeParticle(x+Math.cos(angle)*spread,y+Math.sin(angle)*spread,power));
      }
    };
    const loadBurst=()=>{
      particles=[];
      const count=coarse ? 54 : 110;
      for(let i=0;i<count;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.pow(Math.random(),.65)*Math.min(width,height)*.34;
        particles.push(makeParticle(width*.5+Math.cos(angle)*radius,height*.46+Math.sin(angle)*radius,1.25));
      }
    };
    const drawStatic=()=>{
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle="#050506";
      ctx.fillRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.5,height*.44,0,width*.5,height*.44,Math.max(width,height)*.55);
      glow.addColorStop(0,"rgba(22,199,78,.22)");
      glow.addColorStop(.38,"rgba(17,115,56,.12)");
      glow.addColorStop(1,"rgba(5,5,6,0)");
      ctx.fillStyle=glow;
      ctx.fillRect(0,0,width,height);
    };
    const move=e=>{
      if(e.clientY>height*1.08)return;
      pointer.x=e.clientX;
      pointer.y=e.clientY;
      pointer.active=true;
      pointer.lastMove=performance.now();
      splat(pointer.x,pointer.y,coarse ? 0.7 : 1,coarse ? 3 : 6);
    };
    const touchMove=e=>{
      const touch=e.touches?.[0];
      if(touch)move(touch);
    };
    const animate=now=>{
      if(!running)return;
      frame=requestAnimationFrame(animate);
      if(!visible||document.hidden||reduced)return;
      tick+=.012;
      const autoX=width*.5+Math.cos(tick*.78)*Math.min(width*.24,230);
      const autoY=height*.45+Math.sin(tick*1.12)*Math.min(height*.2,150);
      const usingPointer=pointer.active&&now-pointer.lastMove<1300;
      const targetX=usingPointer?pointer.x:autoX;
      const targetY=usingPointer?pointer.y:autoY;
      if(Math.floor(tick*100)%4===0)splat(targetX,targetY,.68,coarse ? 1 : 2);

      ctx.globalCompositeOperation="source-over";
      ctx.fillStyle="rgba(5,5,6,.052)";
      ctx.fillRect(0,0,width,height);
      ctx.globalCompositeOperation="lighter";
      const next=[];
      for(const p of particles){
        p.px=p.x;
        p.py=p.y;
        const flow=Math.sin((p.y+p.seed)*.008+tick*2.1)+Math.cos((p.x-p.seed)*.006-tick*1.4);
        const angle=flow*1.65+p.phase;
        p.vx=p.vx*.975+Math.cos(angle)*.055;
        p.vy=p.vy*.975+Math.sin(angle)*.055;
        const dx=targetX-p.x;
        const dy=targetY-p.y;
        const dist=Math.max(30,Math.hypot(dx,dy));
        if(dist<250){
          const pull=(1-dist/250)*.038;
          p.vx+=(-dy/dist)*pull*6+(dx/dist)*pull;
          p.vy+=(dx/dist)*pull*6+(dy/dist)*pull;
        }
        p.x+=p.vx;
        p.y+=p.vy;
        p.life-=1;
        const age=p.life/p.maxLife;
        if(p.life>0&&p.x>-80&&p.x<width+80&&p.y>-80&&p.y<height+80){
          const alpha=Math.sin(Math.PI*Math.min(1,age))*(coarse ? 0.18 : 0.25);
          const [r,g,b]=p.color;
          ctx.strokeStyle=`rgba(${r},${g},${b},${Math.max(0,alpha)})`;
          ctx.lineWidth=p.width*(.7+age);
          ctx.lineCap="round";
          ctx.beginPath();
          ctx.moveTo(p.px,p.py);
          ctx.quadraticCurveTo((p.px+p.x)*.5,(p.py+p.y)*.5,p.x,p.y);
          ctx.stroke();
          next.push(p);
        }
      }
      particles=next;
      ctx.globalCompositeOperation="source-over";
    };

    resize();
    reduced?drawStatic():loadBurst();
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;},{threshold:0}):null;
    observer?.observe(canvas);
    const resizeObserver=window.ResizeObserver?new ResizeObserver(()=>{resize();reduced?drawStatic():loadBurst();}):null;
    resizeObserver?.observe(canvas);
    if(!resizeObserver)window.addEventListener("resize",resize,{passive:true});
    window.addEventListener("pointermove",move,{passive:true});
    window.addEventListener("touchmove",touchMove,{passive:true});
    if(!reduced)frame=requestAnimationFrame(animate);
    return()=>{
      running=false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizeObserver?.disconnect();
      if(!resizeObserver)window.removeEventListener("resize",resize);
      window.removeEventListener("pointermove",move);
      window.removeEventListener("touchmove",touchMove);
    };
  },[]);
  return <canvas ref={canvasRef} className="landing-flow-canvas" aria-hidden="true"/>;
}

function LandingExperience({setScreen,notify,onOpenPanel}){
  const [activeChapter,setActiveChapter]=useState(0);
  const storyRef=useRef(null);
  const cursorGlowRef=useRef(null);
  useEffect(()=>{
    let frame=0;
    const move=e=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        if(cursorGlowRef.current)cursorGlowRef.current.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      });
    };
    const scroll=()=>{
      const doc=document.documentElement;
      const y=window.scrollY||0;
      const intro=Math.min(1,Math.max(0,y/Math.max(1,window.innerHeight*.88)));
      doc.style.setProperty("--intro-y",`${Math.round(intro*-150)}px`);
      doc.style.setProperty("--intro-scale",`${1-intro*.14}`);
      doc.style.setProperty("--intro-opacity",`${Math.max(0,1-intro*1.15)}`);
      const story=storyRef.current;
      if(story&&window.innerWidth>600){
        const rect=story.getBoundingClientRect();
        const travel=Math.max(1,story.offsetHeight-window.innerHeight);
        const progress=Math.min(1,Math.max(0,-rect.top/travel));
        const next=Math.min(3,Math.floor(progress*4));
        setActiveChapter(previous=>previous===next?previous:next);
      }
    };
    window.addEventListener("pointermove",move,{passive:true});
    window.addEventListener("scroll",scroll,{passive:true});
    scroll();
    return()=>{
      window.removeEventListener("pointermove",move);
      window.removeEventListener("scroll",scroll);
      if(frame)cancelAnimationFrame(frame);
    };
  },[]);

  const chapters=[
    {label:"01 / Identity",tab:"Profile",title:"Show people where you are going.",copy:"Build a profile around your direction, your work, and the opportunity you want next. You do not need the perfect title to become visible."},
    {label:"02 / People",tab:"Discover",title:"Find people already moving.",copy:"Discover students, creators, early professionals, and collaborators who understand the future you are trying to build."},
    {label:"03 / Conversation",tab:"Messages",title:"Turn interest into a real conversation.",copy:"Follow up, ask the clear question, and build relationships without needing a formal introduction first."},
    {label:"04 / Opportunity",tab:"Deals",title:"See the opening. Take the shot.",copy:"Find jobs, gigs, internships, projects, and volunteer roles that match the direction you want to move in."},
  ];
  const chapter=chapters[activeChapter]||chapters[0];
  const people=[
    ["NS","Nia Sol","Food · Looking for a first internship"],
    ["JK","Jules Kade","Fashion · Building a portfolio"],
    ["OP","Oren Pike","Exploring · Looking for collaborators"],
    ["MV","Mara Vale","Brand · Preparing a first pitch"],
  ];
  const socialMoves=[
    ["01","Be seen","Create a profile that makes your direction, questions, and progress visible."],
    ["02","Find people","Discover the students, operators, creators, and collaborators in your lane."],
    ["03","Start talking","Use posts, follows, groups, and DMs to turn curiosity into connection."],
    ["04","Move forward","Find opportunities and keep the relationships behind your next step moving."],
  ];
  const acronym=[["F","False"],["E","Evidence"],["A","Appearing"],["R","Real"]];

  const preview=()=>{
    if(activeChapter===1)return(
      <div className="fs2-preview fs2-people-preview">
        {people.map(([initials,name,detail])=><div className="fs2-person" key={name}><span className="fs2-person-avatar">{initials}</span><span><b>{name}</b><small>{detail}</small></span><button type="button">Connect</button></div>)}
      </div>
    );
    if(activeChapter===2)return(
      <div className="fs2-preview fs2-message-preview">
        <div className="fs2-thread-list"><b>Messages</b>{["Mara Vale","Nia Sol","Oren Pike"].map((name,index)=><div key={name} className={`fs2-thread-person ${index===0?"active":""}`}>{name}</div>)}</div>
        <div className="fs2-thread"><div className="fs2-thread-title">Mara Vale</div><div className="fs2-bubbles"><div className="fs2-bubble">I saw your post about brand work. Are you still looking for feedback?</div><div className="fs2-bubble mine">Yes. I am sending my first pitch this week. Could I ask you one question?</div><div className="fs2-bubble">Absolutely. Send it over.</div></div></div>
      </div>
    );
    if(activeChapter===3)return(
      <div className="fs2-preview fs2-opportunity-preview">
        <div className="fs2-opportunity"><div className="fs2-opportunity-top"><span className="fs2-company-mark">f.</span><div><h3>Community and content internship</h3><p>Early-stage team · Remote friendly · Entry level</p></div></div><div className="fs2-opportunity-meta"><span>Matched to your profile</span><span>Portfolio optional</span><span>Posted today</span></div><p>Help shape community stories, support social content, and learn how an early product grows from the inside.</p><button type="button" style={{marginTop:22}}>View opportunity</button></div>
      </div>
    );
    return(
      <div className="fs2-preview fs2-profile-preview">
        <div className="fs2-cover"/>
        <div className="fs2-profile-info"><div className="fs2-avatar">MV</div><h3>Mara Vale</h3><p>@mara.moves · Brand Management</p><p style={{marginTop:9}}>Building my first portfolio, looking for feedback, and finding people who make the next move feel possible.</p><div className="fs2-stats"><div><b>6</b><span>Posts</span></div><div><b>18</b><span>Followers</span></div><div><b>4</b><span>Saved roles</span></div></div></div>
      </div>
    );
  };

  return(
    <div className="landing-root landing-cinematic-root fs2-root">
      <LandingWaveField/>
      <div ref={cursorGlowRef} className="landing-cursor-glow" aria-hidden="true"/>
      <section className="fs2-intro" aria-labelledby="fs2-intro-title">
        <div className="landing-flow-scrim"/>
        <div className="landing-flow-grain"/>
        <div className="fs2-intro-copy">
          <h1 id="fs2-intro-title"><span className="fs2-intro-line">Your first step</span><span className="fs2-intro-line">is <span style={{color:C.accent}}>fear.</span></span></h1>
        </div>
      </section>

      <main className="fs2-flow">
        <section id="platform" className="fs2-section fs2-opening">
          <div>
            <div className="fs2-eyebrow">Early access is live</div>
            <h2>Your future should not depend on already knowing the right people.</h2>
          </div>
          <div className="fs2-opening-copy">
            <p>fear.social is a social network for the moment before momentum. Build a profile, find people in your direction, start conversations, and discover the opportunities that make your next move real.</p>
            <div className="fs2-actions"><button className="fs2-primary" onClick={()=>setScreen("signup")}>Create your account <Icon name="arrowRight" size={16}/></button><button className="fs2-secondary" onClick={()=>scrollToSection("activity")}>See how it works</button></div>
          </div>
        </section>

        <section ref={storyRef} className="fs2-story" aria-label="How fear.social moves with you">
          <div className="fs2-story-sticky">
            <div className="fs2-story-copy">
              <div className="fs2-story-number">{chapter.label}</div>
              <h2>{chapter.title}</h2>
              <p>{chapter.copy}</p>
              <div className="fs2-story-nav" aria-label="Product chapters">{chapters.map((item,index)=><button type="button" key={item.label} className={activeChapter===index?"active":""} aria-label={`Show ${item.tab}`} aria-pressed={activeChapter===index} onClick={()=>setActiveChapter(index)}>{item.tab}</button>)}</div>
            </div>
            <div className="fs2-product-frame" aria-label={`${chapter.tab} product preview`}>
              <div className="fs2-product-bar"><span className="fs2-product-brand">fear<span>.</span>social</span><div className="fs2-product-tabs">{chapters.map((item,index)=><span key={item.tab} className={activeChapter===index?"active":""}>{item.tab}</span>)}</div><span className="fs2-live">Product preview</span></div>
              <div className="fs2-product-body">{preview()}</div>
            </div>
          </div>
        </section>

        <section id="activity" className="fs2-section fs2-social">
          <div className="fs2-social-head"><div><div className="fs2-eyebrow">Social by design</div><h2>Built for the person you are becoming.</h2></div><p>This is not another job board and it is not only for founders. It is a network where the small moves before the breakthrough become visible, social, and easier to keep making.</p></div>
          <div className="fs2-social-rail">{socialMoves.map(([num,title,copy])=><div className="fs2-social-item" key={title}><span>{num}</span><div><b>{title}</b><p>{copy}</p></div></div>)}</div>
        </section>

        <section className="fs2-section fs2-why">
          <div className="fs2-why-copy"><div className="fs2-eyebrow">Why the name</div><h2>Fear feels like proof. It usually is not.</h2><p>False Evidence Appearing Real describes the moment uncertainty starts speaking like fact. The outcome is unknown, the first message feels exposed, and waiting feels safer. fear.social gives you somewhere to take the step anyway.</p><div className="fs2-actions"><button className="fs2-secondary" onClick={()=>setScreen("why")}>Read the story</button></div></div>
          <div className="fs2-acronym" aria-label="False Evidence Appearing Real">{acronym.map(([letter,word])=><div className="fs2-acronym-row" key={letter}><span>{letter}</span><b>{word}</b></div>)}</div>
        </section>

        <section id="pricing" className="fs2-section fs2-access">
          <div className="fs2-access-head"><div><div className="fs2-eyebrow">Start now. Grow later.</div><h2>Early access is open.</h2></div><p>The social platform is free to join today. FEAR Pro will add a focused toolkit for the work, habits, media, technology, and information behind your next chapter.</p></div>
          <div className="fs2-plans">
            <article className="fs2-plan"><div className="fs2-plan-label">Available now</div><h3>fear.social</h3><p>Your profile, people, posts, groups, messages, and opportunities in one social network built for first moves.</p><div className="fs2-plan-list"><span>Public or private profile</span><span>Posts, likes, comments, saves</span><span>People and groups</span><span>Messages and opportunities</span></div><div className="fs2-actions"><button className="fs2-primary" onClick={()=>setScreen("signup")}>Join free</button><button className="fs2-secondary" style={{color:"#111",borderColor:"#D7DED9",background:"#fff"}} onClick={()=>setScreen("login")}>Log in</button></div></article>
            <article id="board" className="fs2-plan pro"><div className="fs2-plan-label">Coming with FEAR Pro</div><h3>fear. board</h3><p>A future workspace connecting personal branding, lifestyle guidance, production, AI building, market intelligence, mentorship, and fear.club.</p><div className="fs2-plan-list"><span>fear.agency</span><span>fear.style</span><span>fear.prod</span><span>fearai + finance</span></div><div className="fs2-actions"><button className="fs2-secondary" onClick={()=>setScreen("board")}>Preview what is coming</button></div></article>
          </div>
        </section>

        <section id="cta" className="fs2-section fs2-cta">
          <div className="fs2-cta-inner"><div className="fs2-eyebrow" style={{justifyContent:"center"}}>Your move</div><h2>Become easier to find.<br/>Make the future easier to reach.</h2><p>Create your free account, tell people where you are going, and meet the ones who can help you move.</p><div className="fs2-actions"><button className="fs2-primary" onClick={()=>setScreen("signup")}>Take your first step <Icon name="arrowRight" size={16}/></button><button className="fs2-secondary" onClick={()=>setScreen("login")}>I already have an account</button></div></div>
        </section>
      </main>

      <footer className="fs2-footer"><div className="fs2-footer-brand">fear<span>.</span>social</div><small>© 2026 fear.social · Empowering tomorrow's founders today.</small><div className="fs2-footer-links"><button onClick={()=>setScreen("why")}>Why fear?</button><button onClick={()=>onOpenPanel("privacy")}>Privacy</button><button onClick={()=>onOpenPanel("terms")}>Terms</button><button onClick={()=>onOpenPanel("accessibility")}>Accessibility</button><button onClick={()=>notify("Contact: contact@fear.social","info")}>Contact</button></div></footer>
    </div>
  );
}

function LandingPage({setScreen,notify,onOpenPanel}){
  const [email,setEmail]=useState("");
  const [joined,setJoined]=useState(false);
  const [stats,setStats]=useState(REAL_STATS);
  const [activeDemo,setActiveDemo]=useState("feed");
  const [cursor,setCursor]=useState({x:50,y:24});
  const [scrollProgress,setScrollProgress]=useState(0);
  const cursorGlowRef=useRef(null);
  const cursorFrame=useRef(0);
  useEffect(()=>{
    let active=true;
    fetch("/api/stats").then(res=>res.json()).then(data=>{if(active)setStats(data.stats||REAL_STATS);}).catch(()=>{});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    const move=e=>{
      const w=window.innerWidth||1;
      const h=window.innerHeight||1;
      const next={x:(e.clientX/w)*100,y:(e.clientY/h)*100};
      if(cursorGlowRef.current){
        cursorGlowRef.current.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      }
      if(!cursorFrame.current){
        cursorFrame.current=requestAnimationFrame(()=>{
          cursorFrame.current=0;
          setCursor(next);
        });
      }
    };
    const scroll=()=>{
      const doc=document.documentElement;
      const max=Math.max(1,doc.scrollHeight-window.innerHeight);
      const y=window.scrollY||0;
      setScrollProgress(Math.min(100,Math.max(0,(y/max)*100)));
      const p=Math.min(1,Math.max(0,y/Math.max(1,(window.innerHeight||720)*0.9)));
      const after=Math.min(1,Math.max(0,(p-0.14)/0.52));
      doc.style.setProperty("--intro-y",`${Math.round(p*-180)}px`);
      doc.style.setProperty("--intro-scale",`${1-(p*0.2)}`);
      doc.style.setProperty("--intro-opacity",`${Math.max(0,1-(p*1.12))}`);
      doc.style.setProperty("--after-opacity",`${after}`);
      doc.style.setProperty("--after-y",`${Math.round((1-after)*90)}px`);
    };
    window.addEventListener("pointermove",move,{passive:true});
    window.addEventListener("scroll",scroll,{passive:true});
    scroll();
    return()=>{
      window.removeEventListener("pointermove",move);
      window.removeEventListener("scroll",scroll);
      if(cursorFrame.current)cancelAnimationFrame(cursorFrame.current);
    };
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
  const ticker=["First steps · ","Career starts · ","Warm intros · ","FEAR Pro mentorship · ","Build updates · ","Entry opportunities · ","Private rooms · ","People who get it · "];
  const statRows=[["Beta status","Open"],["Access","Invite"],["Free plan","Live"],["Pro plan","$19/mo"]];
  const demoTabs=[
    {id:"feed",label:"Feed",icon:"home",title:"A feed for people trying to become somebody.",copy:"Post what you are learning, ask for direction, share progress, and find people who are taking their first real step too.",metric:"Your Path"},
    {id:"discover",label:"Discover",icon:"diamond",title:"Find the people your future needs.",copy:"Meet students, creators, early professionals, operators, collaborators, and people moving toward the same kind of future.",metric:"Profiles"},
    {id:"messages",label:"DMs",icon:"mail",title:"Turn courage into a conversation.",copy:"Reach out, ask the question, follow up, and start building the relationships that can change what happens next.",metric:"Live DMs"},
    {id:"deals",label:"Deals",icon:"briefcase",title:"See openings that make the next step real.",copy:"Find jobs, gigs, internships, collabs, pilot customers, and first career opportunities tuned to where you want to go.",metric:"Matches"},
  ];
  const demo=demoTabs.find(t=>t.id===activeDemo)||demoTabs[0];
  const parallaxX=(cursor.x-50)/50;
  const parallaxY=(cursor.y-50)/50;
  const cinematicScenes=[
    {id:"feed",label:"01 / FEED",title:"Turn ambition into proof.",copy:"Post the question, the milestone, the first messy idea, or the thing you are trying to become known for.",icon:"home"},
    {id:"discover",label:"02 / PEOPLE",title:"Find the room before you feel ready.",copy:"Meet students, early builders, operators, and collaborators moving toward the same kind of future.",icon:"network"},
    {id:"deals",label:"03 / OPENINGS",title:"See the next door you can actually walk through.",copy:"Save jobs, gigs, volunteer roles, collabs, and first-step opportunities matched to your direction.",icon:"briefcase"},
  ];
  const workflowRows=[
    ["Create your card","Show who you are becoming, what you care about, what you are learning, and what opportunity you are trying to earn.","user"],
    ["Make the first move","Ask for advice, share what you are building, look for feedback, or say out loud what you want next.","megaphone"],
    ["Find your people","Follow people, start conversations, join groups, and meet the ones who make your future feel less far away.","network"],
    ["Turn hope into motion","Save opportunities, track signals, build relationships, and keep coming back to what moves you forward.","bell"],
  ];
  const communityCards=[
    ["Student with ambition","Looking for the first internship, first project, or first person who says, yes, you belong here."],
    ["Builder with no map","Has an idea, a skill, or a dream, but needs feedback, collaborators, and a place to start without pretending to know everything."],
    ["Future professional","Searching for jobs, gigs, projects, warm intros, and proof that the career they want can actually begin."],
  ];
  const liveSignals=[
    ["Mara Vale asked for portfolio feedback","Sample preview"],
    ["Jules Kade opened a fashion career group","Sample preview"],
    ["Kai Moss saved an operations role","Sample preview"],
    ["Nia Sol received a new career connection","Sample preview"],
  ];
  const journeyRows=[
    ["01","See who you can become","fear gives ambition a place to land: a profile, a direction, and a community built around the person you are trying to become."],
    ["02","Find the next real opening","Posts, opportunities, messages, groups, and profile signals help you see the people and paths that can move your future forward."],
    ["03","Turn curiosity into motion","One account becomes a place to ask, follow, message, save roles, post progress, and take the next step before confidence is perfect."],
  ];
  const worldNodes=[
    {label:"Profile",copy:"Show your goals, field, posts, and proof.",x:"8%",y:"18%",icon:"user"},
    {label:"Feed",copy:"Post progress, ask questions, and build in public.",x:"60%",y:"8%",icon:"home"},
    {label:"Deals",copy:"Find jobs, gigs, volunteer roles, and collabs.",x:"66%",y:"58%",icon:"briefcase"},
    {label:"Groups",copy:"Join rooms for fields, interests, and first moves.",x:"18%",y:"66%",icon:"network"},
    {label:"DMs",copy:"Turn interest into a real conversation.",x:"38%",y:"38%",icon:"mail"},
  ];
  const reelCards=[
    ["fear. daily","Your first step does not need to be perfect. It needs to be visible.","00:12"],
    ["opportunity drop","Three beginner-friendly ways to get career experience this week.","00:18"],
    ["outreach signal","Ask one clear question. Make it easy for the right person to help.","00:15"],
  ];
  const signalRows=[
    ["Find your people","See who is active, what they want to become, and who is close enough to help with the next step.","@mara.moves","Mara Vale"],
    ["Build career momentum","Turn posts, follows, groups, saved roles, and DMs into a clearer path toward work you actually want.","@jules.builds","Jules Kade"],
    ["Spot real opportunities","Surface useful jobs, gigs, collabs, and local openings before you even know what to search for.","@kai.starts","Kai Moss"],
  ];
  const demoPeople=[
    ["Builder","Nia Sol · Food · Looking for a first internship"],
    ["Builder","Jules Kade · Fashion · Building a portfolio"],
    ["Builder","Oren Pike · Exploring · Looking for collaborators"],
  ];
  const featureRows=[
    ["network","People Directory","Create a profile for the person you are becoming, then find students, operators, creators, and collaborators moving in the same direction."],
    ["megaphone","Progress Posts","Share what you are learning, what you need, what you are applying for, and what you are building so momentum becomes visible."],
    ["brain","Mentorship + fear.club","Launching with FEAR Pro: guided mentor introductions alongside curated events, live sessions, and rooms built for real connection.",true],
    ["calendar","Groups & Rooms","Join focused spaces around fields, careers, opportunities, and the first moves people usually make alone."],
    ["briefcase","Opportunities","Find entry jobs, gigs, internships, projects, volunteer roles, and career openings that match your ambition."],
    ["zap","FEAR Pro + fear. board","A future upgrade for growing your personal brand, improving your lifestyle, producing real work, building with AI, and staying current with markets.",true],
  ];
  const readinessRows=[
    ["A place to begin","Create an account when you do not know the perfect title yet. Start with curiosity, direction, and the next move in front of you.","check"],
    ["A profile with purpose","Show your goals, your field, your projects, your questions, and the opportunities you are trying to earn.","user"],
    ["A network with motion","Follow people, start conversations, join groups, save opportunities, and build toward the career or company you want.","zap"],
  ];
  const pricingRows=[
    {name:"Free",price:"$0",period:"forever",note:"For anyone ready to take the first real step toward their career, work, or future.",features:["Public profile and people directory","Progress posts, comments, likes, and saves","Discovery for people, groups, and opportunities","Direct messages, rooms, and community signals","Email verification and password login"],grad:false,button:"Join free"},
    {name:"FEAR Pro",price:"$19",period:"month",note:"Planned founding-member launch price. No charge today.",features:["FEAR Pro mentor program and guided introductions","fear.club events, live sessions, and member rooms","fear. board access when it launches","Personal-brand and lifestyle tools","Photo, video, audio, and creative production","AI building plus market and financial information"],grad:true,button:"Reserve Pro access"},
  ];
  return(
    <div className="landing-root landing-cinematic-root" style={{background:"#050506",minHeight:"100vh",overflowX:"hidden",position:"relative"}}>
      <div className="landing-progress" aria-hidden="true"><span style={{height:`${scrollProgress}%`}}/></div>
      <div className="landing-hero" style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"148px 32px 96px",textAlign:"center",overflow:"hidden"}}>
        <LandingWaveField/>
        <div ref={cursorGlowRef} className="landing-cursor-glow" aria-hidden="true"/>
        <div className="landing-flow-scrim" aria-hidden="true"/>
        <div className="landing-flow-grain" aria-hidden="true"/>
        <div className="landing-intro-copy">
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(52px,7vw,104px)",fontWeight:800,color:"#fff",lineHeight:0.96,letterSpacing:0,marginBottom:28,maxWidth:1080,position:"relative"}} className="landing-typed-headline">
            <span className="landing-type-line"><span>Your first step</span></span>
            <span className="landing-type-line landing-type-line-second landing-type-line-caret"><span>is </span><span className="landing-fear-word">fear.</span></span>
          </h1>
        </div>
        <div className="landing-after-intro">
          <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:999,padding:"8px 16px",marginBottom:32,cursor:"pointer",position:"relative"}} className="landing-badge bs fu" onClick={()=>setScreen("signup")}>
            <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:13,fontWeight:800,color:"#F7F8FA"}}>Early access is live</span>
          </div>
          <p style={{fontSize:20,color:"rgba(255,255,255,0.76)",lineHeight:1.65,maxWidth:680,marginBottom:12,position:"relative",fontWeight:800}} className="fu landing-subhead">
            The first leap into the future you want.
          </p>
          <p style={{fontSize:18,color:"rgba(255,255,255,0.56)",lineHeight:1.75,maxWidth:720,marginBottom:38,position:"relative"}} className="fu landing-hero-copy">
            Find direction, people, opportunities, and momentum before you feel fully ready. Your future does not start after confidence. It starts with a first step.
          </p>
          {joined?(
            <div style={{display:"flex",alignItems:"center",gap:16,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"20px 28px",animation:"popIn 0.3s ease",position:"relative"}} className="landing-saved-card">
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight:800,color:"#fff",fontSize:19}}>Your first move is saved.</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.48)",marginTop:3}}>Create your account when you are ready to find people, roles, and momentum.</div>
              </div>
              <button onClick={()=>setScreen("signup")} className="bs" style={{marginLeft:8,background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"10px 16px",fontSize:13,fontWeight:900}}>Create account</button>
            </div>
          ):(
            <div style={{display:"flex",gap:8,maxWidth:560,width:"100%",background:"#fff",borderRadius:999,padding:6,boxShadow:"0 30px 90px rgba(0,0,0,0.32)",position:"relative"}} className="fu landing-email">
              <input aria-label="Email address for invite request" autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinWaitlist()} placeholder="you@company.com" className="if" style={{flex:1,background:"transparent",border:"none",borderRadius:999,padding:"14px 18px",color:"#111318",fontSize:16,transition:"all 0.2s"}}/>
              <button onClick={joinWaitlist} className="bs" style={{background:"#111318",color:"#fff",border:"none",borderRadius:999,padding:"13px 22px",fontSize:14,fontWeight:900,whiteSpace:"nowrap"}}>Join early access</button>
            </div>
          )}
          <div style={{fontSize:12,color:"rgba(255,255,255,0.36)",marginTop:16}}>Free to start · Built for first moves · No credit card required</div>
          <button type="button" onClick={()=>scrollToSection("landing-entry")} className="landing-scroll-cue bs" style={{marginTop:30,display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.72)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:999,padding:"10px 15px",fontSize:12,fontWeight:900,letterSpacing:0.2}}>
            Scroll to enter
            <span aria-hidden="true" style={{width:24,height:24,borderRadius:"50%",background:"rgba(22,199,78,.14)",color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="zap" size={13}/></span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:16,marginTop:38,position:"relative"}} className="landing-proof-row fu">
            <div style={{display:"flex"}}>{["NR","MV","JK","KM"].map((ini,idx)=><div key={ini} style={{width:40,height:40,borderRadius:"50%",background:"#101114",border:"2.5px solid #050506",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",marginLeft:idx===0?0:-13}}>{ini}</div>)}</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",fontWeight:600}}>Built for anyone ready to begin</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.28)"}}>Open for first-step members</div>
            </div>
          </div>
        </div>
        <div className="landing-mini-app landing-hero-preview preview-float" aria-label="fear.social product preview" style={{width:"min(980px,100%)",marginTop:54,background:"rgba(16,17,20,0.92)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:28,padding:14,boxShadow:"0 34px 110px rgba(0,0,0,0.45)",position:"relative",overflow:"hidden"}}>
          <div className="preview-sweep" style={{position:"absolute",top:0,bottom:0,width:"38%",background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",pointerEvents:"none"}}/>
          <div className="landing-mini-topbar" style={{height:42,borderRadius:18,background:"#0B0C0E",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:8,padding:"0 12px",color:"rgba(255,255,255,0.52)",fontSize:12,fontWeight:800}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:18,color:"#fff",marginRight:8}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></span>
            {["Feed","Discover","Messages","Deals"].map(label=><span className="mini-nav-pill" key={label} style={{padding:"7px 10px",borderRadius:999,background:label==="Feed"?C.aLight:"transparent",color:label==="Feed"?C.accent:"rgba(255,255,255,0.42)"}}>{label}</span>)}
            <span className="mini-live" style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,color:"rgba(255,255,255,0.6)"}}><span className="soft-blink" style={{width:8,height:8,borderRadius:"50%",background:C.accent}}/> live product</span>
          </div>
          <div className="landing-mini-shell" style={{display:"grid",gridTemplateColumns:"1fr",gap:12,marginTop:12}}>
            <div className="landing-mini-card" style={{background:"radial-gradient(circle at 78% 18%, rgba(22,199,78,.18), transparent 34%), #15171C",border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:22,textAlign:"left",minHeight:250,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:22,top:22,width:90,height:90,borderRadius:"50%",background:"radial-gradient(circle, rgba(22,199,78,.24), transparent 70%)"}}/>
              <div style={{position:"relative",display:"flex",gap:12,alignItems:"flex-start",marginBottom:28}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:C.aLight,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>MV</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><b style={{fontSize:17,color:"#fff"}}>Mara Vale</b><span style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/></div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.42)",marginTop:3}}>Brand Management · first pitch</div>
                </div>
                <span style={{fontSize:11,color:C.accent,background:"rgba(22,199,78,0.12)",borderRadius:999,padding:"7px 10px",fontWeight:950}}>Launch</span>
              </div>
              <p style={{position:"relative",fontFamily:"Georgia,serif",fontSize:"clamp(24px,3vw,42px)",lineHeight:1.04,color:"#fff",letterSpacing:0,maxWidth:710,marginBottom:26}}>Looking for feedback before I send my first real pitch.</p>
              <div style={{position:"relative",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
                {[
                  ["New reply","mail"],
                  ["2 people saved it","bookmark"],
                  ["Brand gig matched","briefcase"],
                ].map(([label,icon],i)=><div key={label} style={{border:"1px solid rgba(255,255,255,.09)",background:i===0?"rgba(22,199,78,.14)":"rgba(255,255,255,.055)",borderRadius:16,padding:"13px 12px",display:"flex",alignItems:"center",gap:9,color:i===0?C.accent:"rgba(255,255,255,.66)",fontSize:12,fontWeight:900}}><Icon name={icon} size={15}/>{label}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="landing-entry" className="landing-ticker" style={{borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"#0B0C0E",padding:"14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",width:"max-content"}} className="ticker">
          {[...ticker,...ticker].map((t,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap",paddingRight:12,display:"inline-flex",alignItems:"center",gap:6}}><Icon name="sparkle" size={12} color={C.accent}/> {t}</span>)}
        </div>
      </div>
      <div className="landing-dark-section landing-section" style={{padding:"126px 52px",background:"radial-gradient(circle at 50% 8%, rgba(22,199,78,.16), transparent 42%), #050506",borderBottom:"1px solid rgba(255,255,255,.08)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"10% 8% auto",height:1,background:"linear-gradient(90deg, transparent, rgba(255,255,255,.26), transparent)",opacity:.45}}/>
        <div className="landing-cinema-grid" style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,.82fr) minmax(0,1.18fr)",gap:34,alignItems:"center",position:"relative"}}>
          <div>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:16}}>Cinematic Product</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(44px,5.4vw,88px)",lineHeight:.94,letterSpacing:0,color:"#fff",marginBottom:22}}>One focused place for the leap you keep putting off.</h2>
            <p style={{fontSize:17,lineHeight:1.86,color:"rgba(255,255,255,.6)",maxWidth:560,marginBottom:34}}>fear.social is for the moment before momentum: when you know the future you want, but need people, proof, direction, and one place to start.</p>
            <div style={{display:"grid",gap:12}}>
              {cinematicScenes.map(scene=>(
                <button key={scene.id} onMouseEnter={()=>setActiveDemo(scene.id)} onFocus={()=>setActiveDemo(scene.id)} onClick={()=>setActiveDemo(scene.id)} className="landing-story-button" aria-pressed={activeDemo===scene.id} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 40px",gap:14,alignItems:"center",textAlign:"left",background:activeDemo===scene.id?"rgba(22,199,78,.12)":"rgba(255,255,255,.045)",border:`1px solid ${activeDemo===scene.id?"rgba(22,199,78,.38)":"rgba(255,255,255,.095)"}`,borderRadius:18,padding:"17px 18px",color:"#fff"}}>
                  <span style={{minWidth:0}}>
                    <span style={{display:"block",fontSize:11,letterSpacing:1.7,fontWeight:950,color:activeDemo===scene.id?C.accent:"rgba(255,255,255,.36)",marginBottom:7}}>{scene.label}</span>
                    <b style={{display:"block",fontSize:18,lineHeight:1.15,marginBottom:7}}>{scene.title}</b>
                    <span style={{display:"block",fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,.55)"}}>{scene.copy}</span>
                  </span>
                  <span style={{width:40,height:40,borderRadius:14,background:activeDemo===scene.id?C.accent:"rgba(255,255,255,.07)",color:activeDemo===scene.id?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={scene.icon} size={19}/></span>
                </button>
              ))}
            </div>
          </div>
          <div className="landing-cinema-stage landing-cinema-card" style={{minHeight:620,padding:18,background:"linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.03))",border:"1px solid rgba(255,255,255,.12)",borderRadius:34,boxShadow:"0 42px 140px rgba(0,0,0,.42)",transform:`perspective(1200px) rotateY(${parallaxX*2.5}deg) rotateX(${parallaxY*-1.8}deg)`}}>
            <div className="landing-halo" style={{position:"absolute",right:"8%",top:"8%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle, rgba(22,199,78,.3), transparent 68%)",pointerEvents:"none"}}/>
            <div style={{height:46,borderRadius:18,background:"#08090B",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:10,padding:"0 14px",marginBottom:14}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:18,color:"#fff",fontWeight:900}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></span>
              <span style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:7,fontSize:12,fontWeight:900,color:"rgba(255,255,255,.52)"}}><span className="soft-blink" style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/> live preview</span>
            </div>
            <div style={{position:"relative",minHeight:520,borderRadius:26,overflow:"hidden",background:`radial-gradient(circle at ${62+parallaxX*10}% ${22+parallaxY*8}%, rgba(22,199,78,.22), transparent 34%), #101114`,border:"1px solid rgba(255,255,255,.08)",padding:24}}>
              <div className="landing-cinematic-sweep" style={{position:"absolute",inset:"-20% auto -20% -35%",width:"38%",background:"linear-gradient(90deg, transparent, rgba(255,255,255,.09), transparent)",pointerEvents:"none"}}/>
              <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:12,marginBottom:34}}>
                <span style={{width:52,height:52,borderRadius:18,background:C.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={demo.icon} size={24}/></span>
                <span>
                  <span style={{display:"block",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontWeight:950,color:C.accent,marginBottom:5}}>{demo.metric}</span>
                  <b style={{display:"block",fontFamily:"Georgia,serif",fontSize:38,lineHeight:1,color:"#fff",letterSpacing:0}}>{demo.label}</b>
                </span>
              </div>
              <div style={{position:"relative",zIndex:1,maxWidth:570}}>
                <h3 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,4.4vw,64px)",lineHeight:.98,color:"#fff",letterSpacing:0,marginBottom:18}}>{demo.title}</h3>
                <p style={{fontSize:16,lineHeight:1.75,color:"rgba(255,255,255,.58)",maxWidth:500}}>{demo.copy}</p>
              </div>
              <div style={{position:"absolute",left:24,right:24,bottom:24,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {["Profile", "Post", "Connect"].map((label,i)=><span key={label} style={{background:i===1?C.accent:"rgba(255,255,255,.07)",color:i===1?"#fff":"rgba(255,255,255,.64)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:"14px 12px",textAlign:"center",fontSize:13,fontWeight:950}}>{label}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="landing-immersive-stage landing-section" style={{background:"#050506",padding:"128px 52px",position:"relative",overflow:"hidden"}}>
        <div className="landing-journey-grid" style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,0.9fr) minmax(0,1.1fr)",gap:34,alignItems:"start"}}>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:16}}>Scroll Into fear</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(40px,5.2vw,82px)",lineHeight:.96,letterSpacing:0,color:"#fff",marginBottom:18}}>Step into the world where your next move gets clearer.</h2>
            <p style={{fontSize:17,lineHeight:1.82,color:"rgba(255,255,255,.58)",maxWidth:560}}>fear.social is built for the moment before momentum: when you know you want more, but you need people, proof, direction, and one place to begin.</p>
            <div style={{display:"grid",gap:12,marginTop:34}}>
              {journeyRows.map(([num,title,copy])=>(
                <div key={title} className="landing-scroll-step" style={{border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.045)",borderRadius:20,padding:20}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <span style={{fontFamily:"Georgia,serif",fontSize:30,fontWeight:900,color:C.accent,lineHeight:1}}>{num}</span>
                    <div><div style={{fontSize:18,fontWeight:950,color:"#fff",marginBottom:8}}>{title}</div><p style={{fontSize:14,lineHeight:1.68,color:"rgba(255,255,255,.55)"}}>{copy}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-sticky-world" style={{position:"sticky",top:112,minHeight:680,border:"1px solid rgba(255,255,255,.1)",borderRadius:34,background:"radial-gradient(circle at 50% 38%, rgba(22,199,78,.22), transparent 34%), linear-gradient(145deg,#0B0C0E,#12151B)",boxShadow:"0 44px 140px rgba(0,0,0,.42)",overflow:"hidden"}}>
            <div className="landing-scan" style={{position:"absolute",left:0,right:0,top:0,height:"45%",background:"linear-gradient(180deg, transparent, rgba(22,199,78,.12), transparent)",pointerEvents:"none"}}/>
            <div className="landing-orbit-ring landing-orbit" style={{position:"absolute",left:"15%",top:"8%",width:"70%",aspectRatio:"1",border:"1px dashed rgba(255,255,255,.13)",borderRadius:"50%"}}/>
            <div className="landing-world-core" style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:172,height:172,borderRadius:"50%",background:GR,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Georgia,serif",fontSize:34,fontWeight:900,boxShadow:"0 0 70px rgba(22,199,78,.35)"}}>fear.</div>
            {worldNodes.map((node,i)=>(
              <div key={node.label} className="landing-world-node landing-motion-card" style={{"--tilt":`${i%2?2:-2}deg`,position:"absolute",left:node.x,top:node.y,width:210,background:"rgba(255,255,255,.075)",border:"1px solid rgba(255,255,255,.12)",backdropFilter:"blur(16px)",borderRadius:22,padding:16,animationDelay:`-${i}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{width:36,height:36,borderRadius:12,background:"rgba(22,199,78,.16)",color:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={node.icon} size={18}/></span><b style={{color:"#fff",fontSize:16}}>{node.label}</b></div>
                <p style={{fontSize:13,lineHeight:1.55,color:"rgba(255,255,255,.6)"}}>{node.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div id="product-preview" className="landing-product-peek landing-section" style={{padding:"112px 52px",background:"#050506"}}>
        <div className="landing-peek-grid" style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"0.86fr 1.14fr",gap:34,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>What You Can Do Here</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.8vw,72px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1,marginBottom:18}}>Your future needs people, proof, and a place to begin.</h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.55)",lineHeight:1.78,marginBottom:24}}>fear.social helps you post your progress, discover people in your lane, start conversations, join focused groups, and find opportunities that make your next step real.</p>
            <div className="landing-demo-tabs" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {demoTabs.map(tab=><button key={tab.id} onClick={()=>setActiveDemo(tab.id)} className="bs" aria-pressed={activeDemo===tab.id} style={{display:"inline-flex",alignItems:"center",gap:8,border:`1px solid ${activeDemo===tab.id?C.aSoft:"rgba(255,255,255,0.12)"}`,background:activeDemo===tab.id?C.accent:"rgba(255,255,255,0.06)",color:activeDemo===tab.id?"#fff":"rgba(255,255,255,0.72)",borderRadius:999,padding:"10px 13px",fontSize:13,fontWeight:900}}><Icon name={tab.icon} size={15}/>{tab.label}</button>)}
            </div>
          </div>
          <div className="landing-mini-app" style={{background:"#101114",border:"1px solid rgba(255,255,255,0.11)",borderRadius:30,padding:18,boxShadow:"0 34px 110px rgba(0,0,0,0.32)",position:"relative",overflow:"hidden"}}>
            <div className="preview-sweep" style={{position:"absolute",top:0,bottom:0,width:"34%",background:"linear-gradient(90deg, transparent, rgba(22,199,78,0.12), transparent)",pointerEvents:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:16}}>
              <div><div style={{fontSize:11,fontWeight:900,letterSpacing:1.8,textTransform:"uppercase",color:C.accent,marginBottom:6}}>{demo.metric}</div><h3 style={{fontFamily:"Georgia,serif",fontSize:34,lineHeight:1,color:"#fff",letterSpacing:0}}>{demo.title}</h3></div>
              <div style={{width:52,height:52,borderRadius:18,background:C.aLight,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={demo.icon} size={25}/></div>
            </div>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.58)",lineHeight:1.7,marginBottom:18}}>{demo.copy}</p>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,padding:"7px 10px",fontSize:11,fontWeight:900,color:"rgba(255,255,255,0.5)",marginBottom:14}}><Icon name="info" size={13} color={C.accent}/> Sample product preview</div>
            <div style={{display:"grid",gap:10}}>
              {(activeDemo==="feed"?[
                ["Launch","I posted my first portfolio and I am looking for feedback before I apply to local brand roles."],
                ["Ask","Does anyone know a beginner-friendly way to get real experience before landing a first job?"],
                ["Milestone","First career conversation booked. Small, but it feels like my future is starting to move."],
              ]:activeDemo==="discover"?demoPeople:activeDemo==="messages"?[
                ["DM","Hey, saw your ask. I can review the deck tonight."],
                ["DM","Want to join the fear. group call this week?"],
                ["DM","I know someone testing a similar food concept."],
              ]:[
                ["92% match","Campus Business Event Lead · Hybrid"],
                ["86% match","Fashion Pop-Up Assistant · Local"],
                ["81% match","Startup Ops Shadow Day · Remote"],
              ]).map(([label,text],i)=><div key={text} className="landing-mini-card" style={{background:i===0?"rgba(22,199,78,0.12)":"rgba(255,255,255,0.055)",border:`1px solid ${i===0?"rgba(22,199,78,0.24)":"rgba(255,255,255,0.08)"}`,borderRadius:16,padding:14,display:"grid",gridTemplateColumns:"90px minmax(0,1fr)",gap:12,alignItems:"center"}}><span style={{fontSize:11,fontWeight:950,textTransform:"uppercase",letterSpacing:1,color:i===0?C.accent:"rgba(255,255,255,0.44)"}}>{label}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.8)",lineHeight:1.45,overflowWrap:"anywhere"}}>{text}</span></div>)}
            </div>
          </div>
        </div>
      </div>
      <div id="platform" className="landing-platform landing-section" style={{padding:"118px 52px",maxWidth:1180,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:76}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>The Product</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.6vw,72px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1,marginBottom:18}}>Everything you need to stop waiting and start moving.</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.5)",lineHeight:1.75,maxWidth:700,margin:"0 auto"}}>A profile, a feed, direct messages, groups, and opportunity matching, all built for people trying to take the first step into the career, work, and future they want. Guided mentorship will launch with FEAR Pro.</p>
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
      <div className="landing-signal-engine landing-section" style={{padding:"112px 52px",background:"#050506",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,0.9fr) minmax(0,1.1fr)",gap:28,alignItems:"center"}} className="landing-signal-grid">
            <div>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Momentum System</div>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.6vw,70px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1,marginBottom:18}}>The next step gets clearer when the right signals are around you.</h2>
              <p style={{fontSize:16,color:"rgba(255,255,255,0.55)",lineHeight:1.78,marginBottom:22}}>Profiles, posts, matches, notifications, groups, and messages help you see who is active, what is possible, and where your first real opportunity might come from.</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {["Career signals","Warm introductions","Opportunity matches"].map(label=><span key={label} style={{background:"rgba(22,199,78,0.12)",border:"1px solid rgba(22,199,78,0.24)",color:C.accent,borderRadius:999,padding:"9px 12px",fontSize:12,fontWeight:900}}>{label}</span>)}
              </div>
            </div>
            <div style={{display:"grid",gap:12,position:"relative"}}>
              {signalRows.map(([title,copy,handle,name],i)=><div key={title} className="ch landing-mini-card" style={{background:i===1?"rgba(22,199,78,0.12)":"#101114",border:`1px solid ${i===1?"rgba(22,199,78,0.26)":"rgba(255,255,255,0.09)"}`,borderRadius:22,padding:18,display:"grid",gridTemplateColumns:"58px minmax(0,1fr) auto",gap:14,alignItems:"center",transform:i===1?"translateX(18px)":"none"}}><div style={{width:58,height:58,borderRadius:18,background:i===1?C.accent:C.aLight,color:i===1?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:950}}>{name.split(" ").map(w=>w[0]).join("")}</div><div style={{minWidth:0}}><div style={{fontSize:18,fontWeight:950,color:"#fff",marginBottom:5}}>{title}</div><p style={{fontSize:13,color:"rgba(255,255,255,0.58)",lineHeight:1.55,margin:0}}>{copy}</p><div style={{fontSize:12,color:"rgba(255,255,255,0.36)",marginTop:7}}>{name} · {handle} · sample profile</div></div><div className="soft-blink" style={{width:12,height:12,borderRadius:"50%",background:C.accent,boxShadow:"0 0 22px rgba(22,199,78,0.7)"}}/></div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="landing-section" style={{padding:"112px 52px",background:"linear-gradient(180deg,#050506 0%,#0B0C0E 100%)",borderTop:"1px solid rgba(255,255,255,0.08)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"auto -10% -25% -10%",height:360,background:"radial-gradient(circle at 50% 50%, rgba(22,199,78,.14), transparent 68%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1180,margin:"0 auto",position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:28,alignItems:"end",flexWrap:"wrap",marginBottom:36}}>
            <div style={{maxWidth:680}}>
              <div style={{fontSize:11,fontWeight:900,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Daily fear Signals</div>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,4.8vw,74px)",lineHeight:1,color:"#fff",letterSpacing:0}}>A community that keeps giving people a reason to move.</h2>
            </div>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,.56)",maxWidth:390}}>fear.social can use its own account to publish short product videos, first-step prompts, opportunity drops, and community updates inside the app.</p>
          </div>
          <div className="landing-reels-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {reelCards.map(([label,copy,time],i)=>(
              <div key={label} className="landing-magnetic landing-motion-card" style={{"--tilt":`${i===1?1.5:-1.5}deg`,background:"linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035))",border:"1px solid rgba(255,255,255,.1)",borderRadius:28,padding:14,minHeight:420,position:"relative",overflow:"hidden",animationDelay:`-${i*1.4}s`}}>
                <div style={{position:"absolute",inset:14,borderRadius:22,background:i===1?"radial-gradient(circle at 50% 18%, rgba(22,199,78,.34), transparent 30%), #090A0C":"radial-gradient(circle at 50% 14%, rgba(255,255,255,.18), transparent 28%), #090A0C",border:"1px solid rgba(255,255,255,.08)"}}/>
                <div style={{position:"relative",minHeight:392,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:950,color:"#fff"}}><Icon name="sparkle" size={13} color={C.accent}/>{label}</span>
                    <span style={{fontSize:12,color:"rgba(255,255,255,.55)",fontWeight:900}}>{time}</span>
                  </div>
                  <div>
                    <div style={{width:62,height:62,borderRadius:16,background:"#0A0C0E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontSize:21,fontWeight:900,color:"#fff",marginBottom:18,letterSpacing:0}}>fear<span style={{display:"inline-block",width:6,height:6,borderRadius:1,background:C.accent,marginLeft:2,marginTop:14}}/></div>
                    <p style={{fontFamily:"Georgia,serif",fontSize:31,lineHeight:1.05,color:"#fff",letterSpacing:0,fontWeight:900}}>{copy}</p>
                    <div style={{display:"flex",gap:8,marginTop:22}}>
                      {["Like","Save","Share"].map((action,idx)=><span key={action} style={{display:"inline-flex",alignItems:"center",gap:6,border:"1px solid rgba(255,255,255,.12)",background:idx===0?"rgba(22,199,78,.18)":"rgba(255,255,255,.07)",color:idx===0?C.accent:"rgba(255,255,255,.72)",borderRadius:999,padding:"8px 10px",fontSize:12,fontWeight:900}}><Icon name={idx===0?"heart":idx===1?"bookmark":"send"} size={13}/>{action}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="landing-workflow landing-section" style={{padding:"112px 52px",background:"#0B0C0E",borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:26,alignItems:"end",flexWrap:"wrap",marginBottom:38}}>
            <div style={{maxWidth:680}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Your First Move</div>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,4.5vw,66px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:1}}>From wondering what comes next to doing something about it.</h2>
            </div>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.54)",lineHeight:1.75,maxWidth:390}}>Make a profile, post the first thing, meet people, find openings, and let one small action become the beginning of a real path.</p>
          </div>
          <div className="landing-workflow-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {workflowRows.map(([title,desc,icon],i)=><div key={title} className="ch" style={{background:"#101114",border:"1px solid rgba(255,255,255,0.09)",borderRadius:20,padding:22,position:"relative",overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{width:42,height:42,borderRadius:14,background:i===0?C.accent:"rgba(22,199,78,0.12)",color:i===0?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={icon} size={21}/></div><span style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:800,color:"rgba(255,255,255,0.12)"}}>0{i+1}</span></div><div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:10}}>{title}</div><p style={{fontSize:14,color:"rgba(255,255,255,0.55)",lineHeight:1.72}}>{desc}</p></div>)}
          </div>
        </div>
      </div>
      <div style={{background:"#F7F8FA",borderTop:"1px solid #ECEFF3",borderBottom:"1px solid #ECEFF3",padding:"64px 52px"}}>
        <div className="landing-stats" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {statRows.map(([l,n])=>(
            <div key={l} style={{textAlign:"center",padding:"28px 16px",background:"#fff",border:"1px solid #EAECF0",borderRadius:18}}>
              <div className="landing-stat-value" style={{fontFamily:"Georgia,serif",fontSize:42,fontWeight:800,letterSpacing:0,color:"#111318"}}>{n}</div>
              <div className="landing-stat-label" style={{fontSize:12,color:"#687080",marginTop:7,fontWeight:700}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="landing-section" style={{background:"#fff",padding:"110px 52px"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{textAlign:"center",maxWidth:760,margin:"0 auto 48px"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>Built For</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,4.4vw,66px)",fontWeight:800,color:"#111318",letterSpacing:0,lineHeight:1,marginBottom:16}}>For anyone ready to become who they are aiming at.</h2>
            <p style={{fontSize:16,color:"#687080",lineHeight:1.75}}>For students, creators, early professionals, career switchers, builders, and anyone who knows they want more but needs a place to begin.</p>
          </div>
          <div className="landing-proof-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"stretch"}}>
            <div className="landing-community-cards" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {communityCards.map(([title,copy],i)=><div key={title} className="ch" style={{background:"#F7F8FA",border:"1px solid #EAECF0",borderRadius:20,padding:22}}><div style={{width:44,height:44,borderRadius:"50%",background:i===0?C.accent:C.aLight,color:i===0?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:950,marginBottom:18}}>{title.split(" ").map(w=>w[0]).slice(0,2).join("")}</div><div style={{fontSize:17,fontWeight:950,color:"#111318",lineHeight:1.18,marginBottom:10}}>{title}</div><p style={{fontSize:13,color:"#687080",lineHeight:1.65}}>{copy}</p></div>)}
            </div>
            <div style={{background:"#111318",borderRadius:24,padding:24,position:"relative",overflow:"hidden",minHeight:320}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div><div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:6}}>Live Signals</div><div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:800,color:"#fff",letterSpacing:0}}>Momentum should feel close.</div></div>
                <div style={{width:46,height:46,borderRadius:16,background:"rgba(22,199,78,0.14)",color:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="bell" size={22}/></div>
              </div>
              <div style={{display:"grid",gap:10}}>
                {liveSignals.map(([title,label],i)=><div key={title} className="signal-rise" style={{animationDelay:`${i*0.7}s`,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:16,padding:14,display:"flex",gap:12,alignItems:"center"}}><div style={{width:34,height:34,borderRadius:"50%",background:C.aLight,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:950,fontSize:12}}>{label[0]}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:900,color:"#fff",whiteSpace:"normal",overflowWrap:"anywhere",lineHeight:1.3}}>{title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.42)",marginTop:3}}>{label}</div></div><Icon name="sparkle" size={16} color={C.accent}/></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="why-fear" className="landing-why landing-section" style={{background:"linear-gradient(180deg,#050506 0%,#050506 46%,#07100B 78%,#050506 100%)",padding:"104px 52px",borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"0 -18% 0",background:"radial-gradient(ellipse at 58% 88%, rgba(22,199,78,.18), rgba(22,199,78,.08) 32%, transparent 68%)",filter:"blur(34px)",opacity:.92,pointerEvents:"none",WebkitMaskImage:"linear-gradient(180deg, transparent 0%, rgba(0,0,0,.22) 38%, #000 100%)",maskImage:"linear-gradient(180deg, transparent 0%, rgba(0,0,0,.22) 38%, #000 100%)"}}/>
        <div style={{position:"absolute",inset:"18% -25% 0",background:"radial-gradient(ellipse at 35% 100%, rgba(22,199,78,.09), transparent 62%)",filter:"blur(46px)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1080,margin:"0 auto",position:"relative",display:"grid",gridTemplateColumns:"minmax(0,1.05fr) minmax(280px,.95fr)",gap:40,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:16}}>Why the name</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(42px,6vw,84px)",lineHeight:.95,letterSpacing:0,color:"#fff",marginBottom:22}}>False evidence<br/>appearing real.</h2>
            <p style={{fontSize:18,lineHeight:1.75,color:"rgba(255,255,255,.6)",maxWidth:640}}>fear is named for the moment when doubt feels like fact. The outcomes are unknown, the first message feels too exposed, and the next step can look bigger than it really is.</p>
          </div>
          <div className="ch" style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:24,padding:"28px",boxShadow:"0 28px 90px rgba(0,0,0,.24)"}}>
            <div className="why-acronym-row" style={{display:"grid",gap:12,maxWidth:390}}>
              {["False","Evidence","Appearing","Real"].map((word,i)=>(
                <div key={word} style={{display:"grid",gridTemplateColumns:"42px minmax(0,1fr)",gap:14,alignItems:"center",color:"#fff"}}>
                  <span style={{width:42,height:42,borderRadius:14,background:i===0?C.accent:"rgba(22,199,78,.12)",color:i===0?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:950}}>{word[0]}</span>
                  <span style={{fontSize:20,fontWeight:900,letterSpacing:0}}>{word}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:15,lineHeight:1.7,color:"rgba(255,255,255,.58)",margin:"24px 0 0"}}>fear.social is the place to put yourself out there before confidence catches up, find the people and opportunities that make the future feel reachable, and take the first step anyway.</p>
            <button onClick={()=>setScreen("why")} className="bs" style={{marginTop:24,background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"13px 18px",fontSize:14,fontWeight:950}}>Read the story</button>
          </div>
        </div>
      </div>
      <div id="activity" className="landing-launch landing-section" style={{padding:"110px 52px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:14}}>What Changes When You Join</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,4rem,62px)",fontWeight:800,color:"#fff",letterSpacing:0}}>The first step gets less lonely.</h2>
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
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,4.2vw,64px)",fontWeight:800,color:"#111318",letterSpacing:0,lineHeight:1,marginBottom:16}}>Start free. Move with purpose.</h2>
          <p style={{fontSize:16,color:"#687080",lineHeight:1.75,maxWidth:680,margin:"0 auto 56px"}}>Create a profile, find people, post progress, start conversations, save opportunities, and move toward the work and future you want. Upgrade to FEAR Pro when guided mentorship launches.</p>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left"}}>
            {pricingRows.map((p,i)=>(
              <div key={i} className="ch" style={{background:p.grad?"#111318":"#F7F8FA",border:`1px solid ${p.grad?"#111318":"#EAECF0"}`,borderRadius:22,padding:"38px 34px",position:"relative",overflow:"hidden",boxShadow:p.grad?"0 28px 80px rgba(0,0,0,0.18)":"none"}}>
                <div style={{position:"relative"}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:p.grad?C.accent:"#687080",textTransform:"uppercase",marginBottom:10}}>{p.name}</div>
                  <div className="pricing-price-row" style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:8}}><span style={{fontFamily:"Georgia,serif",fontSize:54,fontWeight:800,color:p.grad?"#fff":"#111318"}}>{p.price}</span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.34)":"#687080"}}>/{p.period}</span></div>
                  <div style={{fontSize:13,color:p.grad?"rgba(255,255,255,0.48)":"#687080",lineHeight:1.6,marginBottom:28}}>{p.note}</div>
                  <div className="pricing-feature-list" style={{display:"flex",flexDirection:"column",gap:13,marginBottom:34}}>
                    {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:11}}><span style={{width:20,height:20,borderRadius:"50%",background:p.grad?"rgba(22,199,78,0.18)":"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,flexShrink:0,border:p.grad?"none":"1px solid #EAECF0"}}><Icon name="check" size={12} color={C.accent} strokeWidth={3}/></span><span style={{fontSize:14,color:p.grad?"rgba(255,255,255,0.62)":"#555B66"}}>{f}</span></div>)}
                  </div>
                  <button onClick={()=>setScreen("signup")} className="bs" style={{width:"100%",background:p.grad?"#fff":"#111318",color:p.grad?"#111318":"#fff",border:"none",borderRadius:999,padding:"13px 18px",fontSize:14,fontWeight:900}}>{p.button} →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div id="board" className="landing-board landing-section" style={{background:"#050506",padding:"104px 52px",borderTop:"1px solid rgba(255,255,255,0.08)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:"-18% -10% auto",height:460,background:"radial-gradient(circle at 68% 42%, rgba(22,199,78,.15), transparent 58%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1080,margin:"0 auto",position:"relative",display:"grid",gridTemplateColumns:"minmax(0,.82fr) minmax(420px,1.18fr)",gap:50,alignItems:"center"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid rgba(22,199,78,.28)",background:"rgba(22,199,78,.1)",borderRadius:999,padding:"8px 12px",fontSize:12,fontWeight:950,color:C.accent,marginBottom:18}}>
              <span className="soft-blink" style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/> Coming with fear. Pro
            </div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(44px,6vw,82px)",lineHeight:.95,letterSpacing:0,color:"#fff",marginBottom:18}}>fear<span style={{color:C.accent}}>.</span> board</h2>
            <p style={{fontSize:17,lineHeight:1.75,color:"rgba(255,255,255,.6)",maxWidth:560,marginBottom:26}}>One future workspace to build your personal brand, improve your lifestyle, create the media behind your ideas, build with AI, and stay informed about markets.</p>
            <button onClick={()=>setScreen("board")} className="bs" style={{background:"#fff",color:"#111318",border:"none",borderRadius:999,padding:"14px 20px",fontSize:14,fontWeight:950,whiteSpace:"nowrap"}}>Preview fear. board</button>
          </div>
          <div className="fear-board-tool-grid" aria-label="Upcoming fear board tools">
            {FEAR_BOARD_TOOLS.map(tool=><div key={tool.name} className="fear-board-tool" style={{minHeight:138,background:"rgba(255,255,255,.045)",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,padding:18,textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{width:34,height:34,borderRadius:10,background:"rgba(22,199,78,.12)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:C.accent}}><Icon name={tool.icon} size={17}/></span><b style={{fontSize:16,color:"#fff"}}>{tool.name}</b></div><div style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1.2,color:C.accent,marginBottom:6}}>{tool.label}</div><p style={{fontSize:13,lineHeight:1.55,color:"rgba(255,255,255,.5)"}}>{tool.copy}</p></div>)}
          </div>
        </div>
      </div>
      <div id="cta" className="landing-cta" style={{padding:"118px 52px",textAlign:"center",position:"relative",overflow:"hidden",background:"#050506"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:2.5,color:C.accent,textTransform:"uppercase",marginBottom:18,position:"relative"}}>Community</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(42px,5.2vw,84px)",fontWeight:800,color:"#fff",letterSpacing:0,lineHeight:0.98,marginBottom:24,position:"relative"}}>Your future can start<br/>before you feel ready.</h2>
        <p style={{fontSize:18,color:"rgba(255,255,255,0.54)",lineHeight:1.75,margin:"0 auto 38px",maxWidth:620,position:"relative"}}>Create your account, find your people, and take the step that turns hope into something you can actually build on.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",position:"relative"}}>
          <button onClick={()=>setScreen("signup")} className="bs" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"15px 24px",fontSize:15,fontWeight:900,boxShadow:"0 18px 50px rgba(22,199,78,0.28)"}}>Create free account →</button>
          <button onClick={()=>scrollToSection("pricing")} className="bs" style={{background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.16)",borderRadius:999,padding:"15px 24px",fontSize:15,fontWeight:900}}>See Pro plan</button>
        </div>
      </div>
      <div className="landing-footer" style={{borderTop:"1px solid rgba(255,255,255,0.08)",background:"#050506",padding:"32px 52px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:18,color:"#fff"}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.22)"}}>© 2026 fear.social · The first leap into the future you want.</div>
        <div style={{display:"flex",gap:20}}>
          <button onClick={()=>setScreen("why")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Why fear?</button>
          <button onClick={()=>setScreen("board")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">fear. board</button>
          <button onClick={()=>onOpenPanel("privacy")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Privacy</button>
          <button onClick={()=>onOpenPanel("accessibility")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Accessibility</button>
          <button onClick={()=>notify("Contact: contact@fear.social","info")} style={{background:"none",border:"none",fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}} className="nl bs">Contact</button>
        </div>
      </div>
    </div>
  );
}

function FearBoardComingSoonPage({setScreen}){
  return (
    <main className="fear-board-page" style={{minHeight:"100dvh",background:"radial-gradient(circle at 78% 12%, rgba(22,199,78,.16), transparent 34%), radial-gradient(circle at 8% 80%, rgba(22,199,78,.08), transparent 30%), #050506",color:"#fff",padding:"132px 24px 70px",position:"relative",overflow:"hidden"}}>
      <section style={{width:"min(1120px,100%)",margin:"0 auto",position:"relative",zIndex:1}}>
        <button onClick={()=>setScreen("landing")} className="bs" style={{background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.78)",border:"1px solid rgba(255,255,255,.13)",borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,marginBottom:40}}>Back to fear.social</button>
        <div className="fear-board-page-grid">
          <div className="fear-board-intro" style={{position:"sticky",top:118}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:9,border:"1px solid rgba(22,199,78,.3)",background:"rgba(22,199,78,.1)",borderRadius:999,padding:"9px 14px",fontSize:12,fontWeight:950,color:C.accent,marginBottom:24}}>
              <span className="soft-blink" style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/> Coming soon with fear. Pro
            </div>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(58px,9vw,112px)",lineHeight:.86,letterSpacing:0,marginBottom:28}}>fear<span style={{color:C.accent}}>.</span><br/>board</h1>
            <p style={{fontSize:"clamp(17px,2vw,22px)",lineHeight:1.65,color:"rgba(255,255,255,.66)",maxWidth:500,marginBottom:18}}>The operating layer for what comes after your first step.</p>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,.46)",maxWidth:500,marginBottom:30}}>fear. board will bring personal branding, lifestyle guidance, production, AI building, and market intelligence into one focused workspace. These modules are early product foundations, not live features yet.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button onClick={()=>setScreen("signup")} className="bs" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"14px 22px",fontSize:14,fontWeight:950,boxShadow:"0 18px 50px rgba(22,199,78,.25)"}}>Reserve Pro access</button>
              <button onClick={()=>setScreen("landing")} className="bs" style={{background:"rgba(255,255,255,.08)",color:"#fff",border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"14px 22px",fontSize:14,fontWeight:950}}>Explore fear.social</button>
            </div>
          </div>
          <div>
            <div style={{background:"rgba(255,255,255,.045)",border:"1px solid rgba(255,255,255,.1)",borderRadius:26,padding:"clamp(18px,3vw,30px)",boxShadow:"0 36px 120px rgba(0,0,0,.34)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,paddingBottom:20,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.09)",flexWrap:"wrap"}}><div><div style={{fontSize:11,fontWeight:950,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:5}}>Future workspace</div><div style={{fontSize:19,fontWeight:950}}>Your fear. board</div></div><span style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:999,padding:"7px 10px",fontSize:11,fontWeight:900,color:"rgba(255,255,255,.5)"}}>PRO PREVIEW</span></div>
              <div className="fear-board-suite-grid">
                {FEAR_BOARD_TOOLS.map((tool,index)=><article key={tool.name} className="fear-board-tool" style={{background:index===0?"rgba(22,199,78,.085)":"rgba(255,255,255,.035)",border:`1px solid ${index===0?"rgba(22,199,78,.25)":"rgba(255,255,255,.085)"}`,borderRadius:20,padding:20,minHeight:190}}><div style={{width:40,height:40,borderRadius:12,background:"rgba(22,199,78,.12)",display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,marginBottom:20}}><Icon name={tool.icon} size={20}/></div><div style={{fontSize:11,fontWeight:950,textTransform:"uppercase",letterSpacing:1.4,color:C.accent,marginBottom:7}}>{tool.label}</div><h2 style={{fontSize:22,lineHeight:1.05,letterSpacing:0,marginBottom:10}}>{tool.name}</h2><p style={{fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,.5)"}}>{tool.copy}</p></article>)}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginTop:12}} className="fear-board-principles">
              {["One Pro workspace","Tools that grow with you","Built inside fear.social"].map((item,index)=><div key={item} style={{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:15,fontSize:12,fontWeight:850,color:"rgba(255,255,255,.56)",lineHeight:1.4}}><span style={{display:"block",color:C.accent,fontSize:10,marginBottom:6}}>0{index+1}</span>{item}</div>)}
            </div>
            <div style={{marginTop:12,background:"rgba(22,199,78,.075)",border:"1px solid rgba(22,199,78,.22)",borderRadius:20,padding:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <span style={{width:44,height:44,borderRadius:14,background:"rgba(22,199,78,.14)",color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="brain" size={21}/></span>
              <div style={{flex:"1 1 240px"}}><div style={{fontSize:10,fontWeight:950,letterSpacing:1.5,textTransform:"uppercase",color:C.accent,marginBottom:6}}>Also launching with FEAR Pro</div><h2 style={{fontSize:18,lineHeight:1.15,marginBottom:6}}>FEAR Pro Mentor Program</h2><p style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,.52)"}}>Guided mentor discovery and focused introductions for members ready to turn a question into a useful next step.</p></div>
            </div>
            <div style={{marginTop:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <span style={{width:44,height:44,borderRadius:14,background:"rgba(22,199,78,.12)",color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="calendar" size={21}/></span>
              <div style={{flex:"1 1 240px"}}><div style={{fontSize:10,fontWeight:950,letterSpacing:1.5,textTransform:"uppercase",color:C.accent,marginBottom:6}}>Also launching with FEAR Pro</div><h2 style={{fontSize:18,lineHeight:1.15,marginBottom:6}}>fear.club</h2><p style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,.52)"}}>Curated events, live sessions, and member rooms designed to turn online connection into real momentum.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WhyFearPage({setScreen}){
  const acronym=["False","Evidence","Appearing","Real"];
  return (
    <main className="why-page" style={{minHeight:"100dvh",background:"radial-gradient(circle at 18% 16%, rgba(22,199,78,.16), transparent 30%), radial-gradient(circle at 82% 72%, rgba(22,199,78,.12), transparent 34%), #050506",color:"#fff",padding:"122px 18px 58px",position:"relative",overflow:"hidden"}}>
      <section style={{width:"min(1060px,100%)",margin:"0 auto",position:"relative",zIndex:1}}>
        <button onClick={()=>setScreen("landing")} className="bs" style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.78)",border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,marginBottom:40}}>Back to fear.social</button>
        <div className="why-page-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(280px,420px)",gap:42,alignItems:"start"}}>
          <div>
            <div style={{fontSize:11,fontWeight:950,letterSpacing:2.7,color:C.accent,textTransform:"uppercase",marginBottom:18}}>The reason behind fear</div>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(56px,9vw,118px)",lineHeight:.9,letterSpacing:0,marginBottom:26}}>Your first step is <span style={{color:C.accent}}>fear</span>.</h1>
            <p style={{fontSize:"clamp(18px,2.1vw,24px)",lineHeight:1.62,color:"rgba(255,255,255,.72)",maxWidth:720,margin:"0 0 22px"}}>fear comes from the acronym <strong style={{color:"#fff"}}>False Evidence Appearing Real</strong>.</p>
            <p style={{fontSize:17,lineHeight:1.8,color:"rgba(255,255,255,.58)",maxWidth:760,margin:"0 0 18px"}}>A lot of people never take the first step into the career, community, opportunity, or future they want because the unknown starts to look like proof that they should stay quiet. They do not know what will happen if they post, reach out, apply, ask, build, or put themselves in front of people, so fear fills in the blank.</p>
            <p style={{fontSize:17,lineHeight:1.8,color:"rgba(255,255,255,.58)",maxWidth:760,margin:"0 0 30px"}}>fear.social is built for that exact moment. It gives people a place to be seen, find direction, meet the right people, and take that first visible step without feeling like they have to already be fearless.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button onClick={()=>setScreen("signup")} className="bs" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"14px 22px",fontSize:14,fontWeight:950,boxShadow:"0 18px 50px rgba(22,199,78,.25)"}}>Take your first step</button>
              <button onClick={()=>setScreen("board")} className="bs" style={{background:"rgba(255,255,255,.08)",color:"#fff",border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"14px 22px",fontSize:14,fontWeight:950}}>Preview fear. board</button>
            </div>
          </div>
          <aside className="ch" style={{background:"rgba(255,255,255,.065)",border:"1px solid rgba(255,255,255,.12)",borderRadius:28,padding:"28px",boxShadow:"0 30px 90px rgba(0,0,0,.28)"}}>
            <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:C.accent,textTransform:"uppercase",marginBottom:18}}>F.E.A.R.</div>
            <div style={{display:"grid",gap:14}}>
              {acronym.map((word,i)=>(
                <div key={word} style={{display:"grid",gridTemplateColumns:"48px minmax(0,1fr)",gap:14,alignItems:"center",padding:"12px",borderRadius:18,background:i===0?"rgba(22,199,78,.14)":"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.08)"}}>
                  <span style={{width:48,height:48,borderRadius:16,background:i===0?C.accent:"rgba(22,199,78,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:950,color:i===0?"#fff":C.accent}}>{word[0]}</span>
                  <span style={{fontSize:22,fontWeight:950,color:"#fff",letterSpacing:0}}>{word}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:14,lineHeight:1.75,color:"rgba(255,255,255,.55)",margin:"24px 0 0"}}>The name is a reminder: fear can feel real before it is true. The platform exists to help people move anyway, with community, proof, and opportunity around them.</p>
          </aside>
        </div>
        <section className="why-about-grid" aria-label="About fear.social" style={{marginTop:58,borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:34,display:"grid",gridTemplateColumns:"minmax(0,.58fr) minmax(0,1fr)",gap:28,alignItems:"start"}}>
          <div>
            <div style={{fontSize:11,fontWeight:950,letterSpacing:2.6,color:C.accent,textTransform:"uppercase",marginBottom:12}}>About us</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,5vw,64px)",lineHeight:.98,letterSpacing:0,color:"#fff"}}>Built for the first step.</h2>
          </div>
          <div style={{background:"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.1)",borderRadius:24,padding:"clamp(20px,3vw,30px)"}}>
            <p style={{fontSize:16,lineHeight:1.8,color:"rgba(255,255,255,.66)",margin:0}}>fear.social was founded by <strong style={{color:"#fff"}}>Taylor Brown</strong>, a student at the University of Colorado Boulder, to help people through one of the most common and difficult moments in life: knowing they want more for their future, but not knowing where to begin.</p>
            <p style={{fontSize:16,lineHeight:1.8,color:"rgba(255,255,255,.58)",margin:"16px 0 0"}}>The platform is built for anyone trying to take their first real step into the career field they want. It gives people a place to find direction, meet others facing the same uncertainty, and move toward their goals without feeling like they have to go through the process alone or wait until the fear disappears.</p>
          </div>
        </section>
      </section>
    </main>
  );
}


function SignupPage({setScreen,notify,setProfile,initialMode="signup"}){
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
  const valid=form.name.trim()&&form.username.length>=2&&form.email&&passwordReady&&acceptedTerms;
  const loginValid=login.identifier&&login.password;
  const passwordSetupReady=passwordSetup.password.length>=8&&passwordSetup.password===passwordSetup.confirmPassword;
  const requestCode=async()=>{
    if(!acceptedTerms)return notify("Accept the Terms and Conditions to continue","error");
    if(!valid)return;
    try{
      const nextProfile={name:form.name.trim(),username:form.username,handle:`@${form.username}`,email:form.email.trim().toLowerCase()};
      const saved=await api("/auth/signup",{method:"POST",body:JSON.stringify({email:nextProfile.email,username:form.username,profile:nextProfile,password:form.password,acceptedTerms:true,termsVersion:"2026-07-13-safety"})});
      setProfile(p=>({...p,...saved.profile}));
      setScreen("app");
      notify(saved.emailStatus?.signupConfirmationSent?"Account created. Confirmation email sent.":"Account created. You are signed in.");
    }catch(err){
      notify(err.message||"Could not create account","error");
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
      const saved=await api("/auth/verify",{method:"POST",body:JSON.stringify({email:form.email,code,profile:nextProfile,password:form.password,acceptedTerms:true,termsVersion:"2026-07-13-safety"})});
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
            {["Encrypted session","No card needed","Early access"].map(text=><div key={text} style={{border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 8px",fontSize:11,fontWeight:800,color:C.muted,textAlign:"center",background:"#fff"}}>{text}</div>)}
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
      <button className="signup-brand" onClick={()=>setScreen("landing")} aria-label="Return to fear.social home">fear<span>.</span>social</button>
      <div className="signup-copy" style={{flex:1,background:GR2,display:"flex",alignItems:"center",justifyContent:"center",padding:72}}>
        <div style={{maxWidth:520}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:56,fontWeight:700,color:"#fff",letterSpacing:0,lineHeight:1.02,marginBottom:28}}>Your next move<br/>starts with<br/><span style={{color:C.accent}}>people.</span></div>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.48)",lineHeight:1.85,marginBottom:44}}>Create a profile for where you are going, then meet the people and find the openings that can help you get there.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["user","Make your direction visible"],["network","Find people who understand the move"],["briefcase","Discover jobs, gigs, projects, and volunteer roles"]].map(([icon,text])=>(
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
          <div style={{display:"inline-flex",alignItems:"center",gap:7,color:C.accent,fontSize:10,fontWeight:950,letterSpacing:1.4,textTransform:"uppercase",marginBottom:10}}><span style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/> Early access is live</div>
          <div className="signup-title" style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:C.text,marginBottom:6,letterSpacing:0}}>Create account</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.55}}>Start free. No card. You will enter the platform immediately after creating your account.</div>
          <div className="signup-fast-note" style={{display:"flex",gap:8,alignItems:"center",background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:14,padding:"11px 12px",marginBottom:22,color:C.accent,fontSize:12,fontWeight:900,lineHeight:1.35}}><Icon name="check" size={16} color="currentColor"/> Fast signup with email confirmation sent automatically.</div>
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
              <span style={{fontSize:12,color:C.muted,lineHeight:1.55}}>I agree to the <button type="button" onClick={e=>{e.preventDefault();setShowTerms(true);}} style={{background:"none",border:"none",padding:0,color:C.accent,fontWeight:900,textDecoration:"underline",cursor:"pointer"}}>Terms and Conditions</button>, including the community rules prohibiting abusive, hateful, explicit, harassing, or otherwise objectionable content.</span>
            </label>
            <GBtn full disabled={!valid} onClick={requestCode}>Create account →</GBtn>
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

function PlatformApp({notify,setScreen,signOut,profile,setProfile,accessibility,setAccessibility,themeMode,setThemeMode,cookieConsent,setCookieConsent,onOpenPanel}){
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
  const [connections,setConnections]=useLocalState("fear-connections",{followersByUserId:{},followingByUserId:{}});
  const [accessRequests,setAccessRequests]=useLocalState("fear-access-requests",{incoming:[]});
  const [interfaceSettings,setInterfaceSettings]=useLocalState("fear-interface-settings",{layout:"comfortable",density:"standard",rightRail:true});
  const [connectionState,setConnectionState]=useState(navigator.onLine?"connecting":"offline");
  const [userDeals,setUserDeals]=useLocalState("fear-user-deals",[]);
  const [savedDeals,setSavedDeals]=useLocalState("fear-saved-deals",[]);
  const [filter,setFilter]=useState("All");
  const [feedMode,setFeedMode]=useLocalState("fear-feed-mode","forYou");
  const [composer,setComposer]=useState("");
  const [composerMedia,setComposerMedia]=useState([]);
  const [cameraOpen,setCameraOpen]=useState(false);
  const [postRulesOpen,setPostRulesOpen]=useState(false);
  const [postType,setPostType]=useState("Update");
  const [commentInputs,setCommentInputs]=useState({});
  const [openComments,setOpenComments]=useState({});
  const [editingPost,setEditingPost]=useState(null);
  const [query,setQuery]=useState("");
  const [editProfile,setEditProfile]=useState(false);
  const [selectedProfile,setSelectedProfile]=useState(null);
  const [profileReturnView,setProfileReturnView]=useState("discover");
  const [profileMetric,setProfileMetric]=useState("Posts");
  useEffect(()=>{
    const online=()=>setConnectionState("connecting");
    const offline=()=>setConnectionState("offline");
    const expired=()=>{notify("Your session expired. Log in again to keep your account secure.","error");signOut();};
    window.addEventListener("online",online);
    window.addEventListener("offline",offline);
    window.addEventListener("fear:session-expired",expired);
    return()=>{
      window.removeEventListener("online",online);
      window.removeEventListener("offline",offline);
      window.removeEventListener("fear:session-expired",expired);
    };
  },[notify,signOut]);
  const [activeConversationId,setActiveConversationId]=useState(null);
  const [profileDraft,setProfileDraft]=useState(profile);
  const [blockedUserIds,setBlockedUserIds]=useLocalState("fear-blocked-user-ids",[]);
  useEffect(()=>setProfileDraft(profile),[profile]);
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
    if(data.opportunities)setUserDeals(data.opportunities);
    if(data.notifications)setNotifications(data.notifications);
    if(data.connections)setConnections(data.connections);
    if(data.accessRequests)setAccessRequests(data.accessRequests);
    if(typeof data.unreadNotifications==="number")setUnreadNotifications(data.unreadNotifications);
    if(data.stats)setStats(data.stats);
  },[setAccessRequests,setConnections,setEvents,setGroups,setMentors,setMessages,setNotifications,setPeople,setPosts,setProfile,setStats,setUnreadNotifications,setUserDeals]);
  const callBackend=useCallback(async(path,options={})=>{
    const data=await api(path,options);
    setConnectionState("online");
    applyBackendState(data);
    return data;
  },[applyBackendState]);
  useEffect(()=>{
    let active=true;
    api("/bootstrap").then(data=>{if(active){setConnectionState("online");applyBackendState(data);}}).catch(()=>{if(active){setConnectionState("offline");notify("Offline mode: changes are saved in this browser","info");}});
    return()=>{active=false;};
  },[applyBackendState,notify]);
  useEffect(()=>{
    if(!profile.id||!crypto?.subtle)return;
    let active=true;
    ensureE2EEIdentity(profile.id)
      .then(identity=>identity?.publicKey?api("/account/e2ee-key",{method:"POST",body:JSON.stringify({publicKey:identity.publicKey})}):null)
      .then(data=>{if(active&&data)applyBackendState(data);})
      .catch(()=>notify("E2EE setup is not available in this browser yet.","error"));
    return()=>{active=false;};
  },[applyBackendState,notify,profile.id]);
  const deleteAccount=async()=>{
    const first=window.confirm("Delete your fear.social account? This removes your profile, posts, messages, follows, groups, media, and sessions. This cannot be undone.");
    if(!first)return;
    const confirmation=window.prompt("Type DELETE to permanently delete your account.");
    if(confirmation!=="DELETE"){
      notify("Account deletion cancelled","info");
      return;
    }
    try{
      await api("/account",{method:"DELETE",body:JSON.stringify({confirmation})});
      clearAccountLocalData();
      setProfile({});
      setScreen("landing");
      notify("Your account has been deleted");
    }catch(err){
      notify(err.message||"Could not delete account","error");
    }
  };
  const inviteFriend=async()=>{
    const inviter=String(profile.handle||profile.name||"").replace(/^@/,"").trim();
    const inviteUrl=new URL(window.location.origin+window.location.pathname);
    if(inviter)inviteUrl.searchParams.set("ref",inviter);
    inviteUrl.hash="signup";
    const shareData={
      title:"Join me on fear.social",
      text:"Take your first step toward the career and future you want on fear.social.",
      url:inviteUrl.toString(),
    };
    if(typeof navigator.share==="function"){
      try{
        await navigator.share(shareData);
        notify("Invite ready to send");
        return;
      }catch(err){
        if(err?.name==="AbortError")return;
      }
    }
    try{
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      notify("Invite link copied");
    }catch{
      window.prompt("Copy your fear.social invite link",shareData.url);
    }
  };
  useEffect(()=>{
    if(view==="mentors") setView("feed");
    else if(view==="publicProfile"&&!selectedProfile) setView("discover");
  },[selectedProfile,setView,view]);
  const tabs=[
    ["feed","Feed"],
    ["discover","Discover"],
    ["events","fear.club"],
    ["messages","Messages"],
    ["notifications","Activity"],
    ["groups","Groups"],
    ["opportunities","Deals"],
    ["settings","Settings"],
  ];
  const viewMeta={
    discover:{eyebrow:"People",title:"Find your next connection",copy:"Explore people by direction, field, and the move they are trying to make."},
    messages:{eyebrow:"Conversations",title:"Messages",copy:"Keep every useful introduction and next move in one focused place."},
    notifications:{eyebrow:"Your network",title:"Activity",copy:"Connections, replies, invitations, and requests that need your attention."},
    groups:{eyebrow:"Shared direction",title:"Groups",copy:"Create focused rooms, invite the right people, and keep your community moving."},
    settings:{eyebrow:"Your experience",title:"Settings",copy:"Control your profile, privacy, layout, accessibility, and account preferences."},
  };
  const mobileTabs=[
    ["feed","Feed","home"],
    ["discover","Find","diamond"],
    ["notifications","Activity","heart"],
    ["messages","DMs","mail"],
    ["settings","Settings","settings"],
  ];
  const initials=(profile.name||"Your Name").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()||"YO";
  const followedIds=new Set(people.filter(p=>p.connected).map(p=>p.id));
  const followedHandles=new Set(people.filter(p=>p.connected&&p.handle).map(p=>p.handle));
  const ownPost=p=>(profile.id&&p.userId===profile.id)||(profile.handle&&p.handle===profile.handle);
  const blockedIds=new Set(blockedUserIds);
  const isBlockedUser=p=>Boolean((p?.userId&&blockedIds.has(p.userId))||(p?.id&&blockedIds.has(p.id)));
  const filteredPosts=posts
    .filter(p=>!isBlockedUser(p))
    .map(p=>({...p,comments:(p.comments||[]).filter(comment=>!isBlockedUser(comment))}));
  const algorithmTerms=[profile.industry,profile.goal,profile.lookingFor,profile.headline,profile.bio,profile.location].filter(Boolean).join(" ").toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>3&&!STOP_WORDS.has(term));
  const searchTerm=query.trim().toLowerCase();
  const matchesSearch=(parts=[])=>!searchTerm||parts.filter(Boolean).join(" ").toLowerCase().includes(searchTerm);
  const isOfficialFearPost=p=>Boolean(p.officialFear||p.userId===OFFICIAL_FEAR_USER_ID||p.handle===OFFICIAL_FEAR_HANDLE);
  const isFollowingPost=p=>Boolean(!isOfficialFearPost(p)&&(p.followingAuthor||followedIds.has(p.userId)||followedHandles.has(p.handle)));
  const postRecencyBoost=(post,index)=>{
    const value=String(post.time||"").toLowerCase();
    if(value.includes("just now"))return 18;
    if(value.includes("min"))return 14;
    if(value.includes("hour"))return 10;
    if(value.includes("day"))return 5;
    return Math.max(0,8-Math.min(index,8));
  };
  const postScore=p=>{
    const haystack=`${p.user} ${p.handle} ${p.content} ${p.tag} ${p.type}`.toLowerCase();
    let score=Number(p.likes||0)*2+(p.comments?.length||0)*4+(p.saved?6:0);
    if(ownPost(p))score+=10;
    if(isFollowingPost(p))score+=24;
    if(profile.industry&&p.tag===profile.industry)score+=22;
    if(profile.location&&haystack.includes(String(profile.location).split(",")[0].toLowerCase()))score+=7;
    if((p.media||[]).length)score+=8;
    if(p.type==="Ask")score+=5;
    if(p.type==="Milestone")score+=4;
    if(isOfficialFearPost(p))score+=algorithmTerms.some(term=>haystack.includes(term))?8:2;
    score+=algorithmTerms.reduce((total,term)=>total+(haystack.includes(term)?5:0),0);
    return score;
  };
  const visiblePosts=filteredPosts
    .filter(p=>(filter==="All"||p.tag===filter)&&matchesSearch([p.user,p.handle,p.content,p.tag,p.type,...(p.comments||[]).map(c=>`${c.user} ${c.text}`)]))
    .filter(p=>feedMode==="forYou"||isFollowingPost(p)||ownPost(p))
    .map((p,index)=>({...p,_score:postScore(p)+postRecencyBoost(p,index),_index:index}))
    .sort((a,b)=>feedMode==="forYou"?(b._score-a._score)||(a._index-b._index):a._index-b._index);
  const ownProfilePosts=filteredPosts.filter(ownPost);
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
  const allDeals=[...userDeals,...DEALS];
  const rankedDeals=allDeals.map((deal,index)=>({...deal,...opportunityScore(deal),saved:savedDeals.includes(deal.id),_index:index})).sort((a,b)=>(b.score-a.score)||(a._index-b._index));
  const toggleDealSave=id=>setSavedDeals(ids=>ids.includes(id)?ids.filter(savedId=>savedId!==id):[...ids,id]);
  const signalDealInterest=deal=>notify(`Interest noted for ${deal.title}`);
  const postOpportunity=async draft=>{
    const cleanList=value=>String(value||"").split(/[,\n]+/).map(item=>item.trim()).filter(Boolean).slice(0,8);
    const title=String(draft.title||"").trim();
    const company=String(draft.company||"").trim();
    const desc=String(draft.desc||"").trim();
    if(title.length<4){notify("Give the opportunity a clear title","error");return false;}
    if(company.length<2){notify("Add a company, team, or project name","error");return false;}
    if(desc.length<18){notify("Add a little more detail so people know what they are applying for","error");return false;}
    const skills=cleanList(draft.skills);
    const localDeal={
      id:`local-opp-${Date.now()}`,
      title,
      company,
      type:draft.type||"Opportunity",
      tag:draft.tag||profile.industry||"Exploring",
      budget:draft.budget||"Open",
      location:draft.location||"Remote",
      level:draft.level||"First step",
      skills,
      desc,
      fit:[draft.tag,profile.industry,profile.goal,profile.lookingFor,...skills,title,company,desc].filter(Boolean),
      postedBy:profile.name||"fear.social member",
      postedByHandle:profile.handle||"",
      userPosted:true,
    };
    setUserDeals(deals=>[localDeal,...deals]);
    try{
      const data=await callBackend("/opportunities",{method:"POST",body:JSON.stringify(localDeal)});
      if(data.opportunities)setUserDeals(data.opportunities);
      notify("Opportunity posted to Deals");
    }catch(err){
      notify("Opportunity posted locally. Cloud sync failed.","error");
    }
    return true;
  };
  const unread=unreadNotifications;
  const followerCount=Number(profile.followers||0);
  const ownFollowers=connections.followersByUserId?.[profile.id]||[];
  const ownFollowing=connections.followingByUserId?.[profile.id]||people.filter(p=>p.connected);
  const statCards=[
    ["Posts",fmt(ownProfilePosts.length)],
    ["Followers",fmt(followerCount)],
    ["Following",fmt(ownFollowing.length)],
    ["Saved",fmt(filteredPosts.filter(p=>p.saved).length)],
  ];
  const toPublicProfile=person=>({
    id:person.id||person.userId||"",
    name:person.name||person.user||"Founder",
    handle:person.handle||"@member",
    location:person.location||person.loc||"",
    industry:person.industry||person.tag||"Exploring",
    bio:person.bio||"Figuring out what comes next.",
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
    verified:isVerifiedIdentity(person),
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
  const publicProfilePosts=publicProfile?filteredPosts.filter(p=>(publicProfile.id&&p.userId===publicProfile.id)||(publicProfile.handle&&p.handle===publicProfile.handle)):[];
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
  const addCapturedMedia=item=>{
    if(!item?.url)return notify("Could not capture media","error");
    if(composerMedia.length>=4)return notify("Remove a file before adding more media","error");
    setComposerMedia(media=>[...media,item].slice(0,4));
    setPostType(item.kind==="video"?"Launch":postType);
    notify(item.kind==="video"?"Video captured":"Photo captured");
    setCameraOpen(false);
  };
  const publish=async({confirmed=false}={})=>{
    const media=composerMedia.filter(item=>safeMediaUrl(item.url,item.kind));
    if(!composer.trim()&&media.length===0)return notify("Write something or attach media before publishing","error");
    const issue=moderationIssue(composer);
    if(issue)return notify(`This post was blocked by the safety filter for ${issue}. Edit it before publishing.`,"error");
    if(!confirmed){
      setPostRulesOpen(true);
      return;
    }
    setPostRulesOpen(false);
    const optimistic={
      id:Date.now(),userId:profile.id||"",user:profile.name||"Your Name",handle:profile.handle||"@yourhandle",av:initials,avatarUrl:profile.avatarUrl||"",verified:isVerifiedIdentity(profile),
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
    const person=people.find(p=>p.id===id)||selectedProfile;
    const needsAccess=person?.privateProfile&&!person?.accessGranted&&!person?.connected;
    if(needsAccess){
      setPeople(ps=>ps.map(p=>p.id===id?{...p,accessStatus:"pending",locked:true}:p));
      if(selectedProfile?.id===id)setSelectedProfile(p=>({...p,accessStatus:"pending",locked:true}));
      try{
        await callBackend(`/people/${id}/access-request`,{method:"POST"});
        notify(`Access request sent to ${person.name}`);
      }catch(err){
        notify(err.message||"Could not request access","error");
      }
      return;
    }
    setPeople(ps=>ps.map(p=>p.id===id?{...p,connected:!p.connected,followers:p.connected?p.followers-1:p.followers+1}:p));
    try{await callBackend(`/people/${id}/connect`,{method:"POST"});}catch{}
  };
  const reviewAccessRequest=async(id,action)=>{
    try{
      await callBackend(`/access-requests/${id}/${action}`);
      notify(action==="approve"?"Profile access approved":"Profile access denied");
    }catch(err){
      notify(err.message||"Could not update access request","error");
    }
  };
  const updateProfilePrivacy=async privacy=>{
    const next={...profileDraft,privacy};
    setProfileDraft(next);
    setProfile(p=>({...p,privacy}));
    try{
      const data=await callBackend("/profile",{method:"PUT",body:JSON.stringify({profile:next})});
      if(data.profile)setProfileDraft(p=>({...p,...data.profile}));
      notify(privacy==="private"?"Profile is now private":"Profile is now public");
    }catch(err){
      notify("Privacy saved locally. Cloud sync failed.","error");
    }
  };
  const blockUser=async person=>{
    const id=person?.id||person?.userId;
    if(!id||id===profile.id)return;
    const name=person?.name||person?.user||"this user";
    if(!window.confirm(`Block ${name}? Their posts, comments, profile, and future content will be hidden from you.`))return;
    setBlockedUserIds(ids=>ids.includes(id)?ids:[...ids,id]);
    setPosts(ps=>ps.filter(post=>post.userId!==id).map(post=>({...post,comments:(post.comments||[]).filter(comment=>comment.userId!==id)})));
    setPeople(ps=>ps.filter(p=>p.id!==id));
    if(selectedProfile?.id===id){setSelectedProfile(null);setView("feed");}
    try{
      await callBackend(`/people/${id}/block`,{method:"POST"});
      notify(`${name} blocked`);
    }catch(err){
      notify("Blocked locally. Cloud sync failed.","error");
    }
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
  const leaveGroup=async id=>{
    const group=groups.find(g=>g.id===id);
    if(!group?.member)return;
    if(!window.confirm(`Leave ${group.name}? You can rejoin later if the group is public or you are invited again.`))return;
    const nextCount=Math.max(0,Number(group.memberCount||0)-1);
    setGroups(gs=>gs.map(g=>g.id===id?{...g,member:false,role:"",canInvite:false,canAnnounce:false,memberCount:nextCount,active:`${nextCount} ${nextCount===1?"member":"members"}`}:g));
    try{
      await callBackend(`/groups/${id}/leave`,{method:"POST"});
      notify(`Left ${group.name}`);
    }catch(err){
      notify(err.message||"Left locally. Cloud sync failed.","error");
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
    const issue=moderationIssue(text);
    if(issue)return notify(`This comment was blocked by the safety filter for ${issue}. Edit it before posting.`,"error");
    setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:[...p.comments,{id:`local-comment-${Date.now()}`,userId:profile.id||"",user:profile.name||"You",handle:profile.handle||"@you",av:initials,avatarUrl:profile.avatarUrl||"",verified:isVerifiedIdentity(profile),text,time:"Just now"}]}:p));
    setCommentInputs(ci=>({...ci,[id]:""}));
    try{
      await callBackend(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({text})});
      notify("Comment posted");
    }catch{
      notify("Comment saved locally. Cloud sync failed.","error");
    }
  };
  const reportContent=async(targetType,targetId,label="content")=>{
    if(!targetId)return;
    const reason=window.prompt(`What should fear.social review about this ${label}?`);
    const cleanReason=String(reason||"").trim();
    if(!cleanReason)return;
    try{
      await callBackend("/reports",{method:"POST",body:JSON.stringify({targetType,targetId:String(targetId),reason:cleanReason})});
      notify("Report sent. Our moderation queue is set for 24-hour review.");
    }catch(err){
      notify(err.message||"Could not send report","error");
    }
  };
  const reportPost=post=>reportContent("post",post?.id,"post");
  const beginEditPost=post=>setEditingPost({id:post.id,content:post.content,type:post.type||"Update",tag:post.tag||profile.industry||"Exploring"});
  const cancelEditPost=()=>setEditingPost(null);
  const savePostEdit=async id=>{
    const draft=editingPost;
    if(!draft||draft.id!==id)return;
    const content=draft.content.trim();
    if(!content)return notify("Post cannot be empty","error");
    const issue=moderationIssue(content);
    if(issue)return notify(`This edit was blocked by the safety filter for ${issue}. Edit it before saving.`,"error");
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
    const issue=moderationIssue(text);
    if(issue)return notify(`This message was blocked by the safety filter for ${issue}. Edit it before sending.`,"error");
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
  const deleteChat=async id=>{
    const thread=messages.find(m=>m.id===id);
    if(!thread)return;
    if(!window.confirm(`Delete your chat with ${thread.name}? This removes it from your inbox, but it will not delete the other person's copy.`))return;
    setMessages(ms=>ms.filter(m=>m.id!==id));
    setActiveConversationId(null);
    try{
      const data=await callBackend(`/messages/${id}`,{method:"DELETE"});
      if(data.messages)setMessages(data.messages);
      notify("Chat deleted");
    }catch(err){
      notify(err.message||"Chat deleted locally. Cloud sync failed.","error");
    }
  };
  const syncMessageText=useCallback(async(id,text)=>{
    const messageId=String(id||"");
    const body=String(text||"").trim();
    if(!messageId||!body||messageId.startsWith("local-message-"))return;
    await callBackend(`/messages/${encodeURIComponent(messageId)}/sync`,{method:"POST",body:JSON.stringify({text:body})});
  },[callBackend]);
  const editMessage=async(threadId,messageId,text)=>{
    const body=String(text||"").trim();
    if(!body)return notify("Message cannot be empty","error");
    const issue=moderationIssue(body);
    if(issue)return notify(`This message edit was blocked by the safety filter for ${issue}. Edit it before saving.`,"error");
    const previous=messages;
    setMessages(ms=>ms.map(thread=>thread.id===threadId?{...thread,thread:thread.thread.map(message=>message.id===messageId?{...message,text:body,edited:true,time:message.time||"Just now"}:message)}:thread));
    try{
      const data=await callBackend(`/messages/${encodeURIComponent(messageId)}/edit`,{method:"PUT",body:JSON.stringify({text:body})});
      if(data.messages)setMessages(data.messages);
      notify("Message updated");
    }catch(err){
      setMessages(previous);
      notify(err.message||"Could not edit message","error");
    }
  };
  const deleteMessage=async(threadId,messageId)=>{
    const previous=messages;
    setMessages(ms=>ms.map(thread=>thread.id===threadId?{...thread,thread:thread.thread.filter(message=>message.id!==messageId)}:thread));
    try{
      const data=await callBackend(`/messages/${encodeURIComponent(messageId)}/delete`,{method:"DELETE"});
      if(data.messages)setMessages(data.messages);
      notify("Message deleted from your view");
    }catch(err){
      setMessages(previous);
      notify(err.message||"Could not delete message","error");
    }
  };
  const unsendMessage=async(threadId,messageId)=>{
    if(!window.confirm("Unsend this message for everyone?"))return;
    const previous=messages;
    setMessages(ms=>ms.map(thread=>thread.id===threadId?{...thread,thread:thread.thread.filter(message=>message.id!==messageId)}:thread));
    try{
      const data=await callBackend(`/messages/${encodeURIComponent(messageId)}/unsend`,{method:"DELETE"});
      if(data.messages)setMessages(data.messages);
      notify("Message unsent");
    }catch(err){
      setMessages(previous);
      notify(err.message||"Could not unsend message","error");
    }
  };
  const closeSearch=()=>setQuery("");
  const searchResults=searchTerm?[
    ...people.filter(p=>matchesSearch([p.name,p.handle,p.industry,p.bio,p.headline,p.lookingFor,p.loc,p.location])).slice(0,6).map(p=>({
      id:`person-${p.id}`,
      kind:"Founder",
      icon:"user",
      title:p.name,
      subtitle:[p.handle,p.industry||"Exploring",p.loc||p.location].filter(Boolean).join(" · "),
      meta:p.bio,
      action:()=>{openProfile(p,"discover");closeSearch();}
    })),
    ...posts.filter(p=>matchesSearch([p.user,p.handle,p.content,p.tag,p.type,...(p.comments||[]).map(c=>`${c.user} ${c.text}`)])).slice(0,6).map(p=>({
      id:`post-${p.id}`,
      kind:"Post",
      icon:"comment",
      title:p.user,
      subtitle:[p.type||"Update",p.tag,p.time&&`${p.time} ago`].filter(Boolean).join(" · "),
      meta:p.content||"Photo/video post",
      action:()=>{setView("feed");setFilter("All");closeSearch();}
    })),
    ...groups.filter(g=>matchesSearch([g.name,g.desc,g.kind,g.active,...(g.announcements||[]).map(a=>`${a.title} ${a.body}`)])).slice(0,4).map(g=>({
      id:`group-${g.id}`,
      kind:"Group",
      icon:"network",
      title:g.name,
      subtitle:g.active,
      meta:g.desc,
      action:()=>{setView("groups");closeSearch();}
    })),
    ...rankedDeals.filter(d=>matchesSearch([d.title,d.company,d.type,d.tag,d.location,d.level,d.desc,...(d.skills||[]),...(d.fit||[])])).slice(0,4).map(d=>({
      id:`deal-${d.id}`,
      kind:"Deal",
      icon:"briefcase",
      title:d.title,
      subtitle:[d.company,`${d.score}% match`,d.location].filter(Boolean).join(" · "),
      meta:d.desc,
      action:()=>{setView("opportunities");closeSearch();}
    })),
    ...messages.filter(m=>matchesSearch([m.name,m.handle,...(m.thread||[]).map(message=>typeof message==="string"?message:message?.text),m.draft])).slice(0,4).map(m=>({
      id:`message-${m.id}`,
      kind:"Message",
      icon:"mail",
      title:m.name,
      subtitle:m.handle||"Direct message",
      meta:(m.thread||[]).length?String(typeof m.thread[m.thread.length-1]==="string"?m.thread[m.thread.length-1]:m.thread[m.thread.length-1]?.text||""):"Start the conversation",
      action:()=>{setActiveConversationId(m.id);setView("messages");closeSearch();}
    })),
  ]:[];
  const saveProfile=async()=>{
    const username=cleanUsername(profileDraft.username||profileDraft.handle||profileDraft.name)||cleanUsername(profileDraft.name||"member")||"member";
    const oldProfile=profile;
    const nextDraft={...oldProfile,...profileDraft,username,handle:`@${username}`};
    const issue=moderationIssue([nextDraft.name,nextDraft.headline,nextDraft.bio,nextDraft.lookingFor,nextDraft.goal].filter(Boolean).join("\n"));
    if(issue)return notify(`This profile update was blocked by the safety filter for ${issue}. Edit it before saving.`,"error");
    const applyProfileLocally=next=>{
      setProfile(next);
      setProfileDraft(next);
      setPosts(ps=>ps.map(post=>{
        const isMine=(oldProfile.id&&post.userId===oldProfile.id)||(oldProfile.handle&&post.handle===oldProfile.handle)||(post.handle===next.handle);
        const updatedComments=(post.comments||[]).map(comment=>{
          const commentIsMine=(oldProfile.handle&&comment.handle===oldProfile.handle)||(comment.handle===next.handle);
          return commentIsMine?{...comment,user:next.name,handle:next.handle,av:(next.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase(),avatarUrl:next.avatarUrl||"",verified:isVerifiedIdentity(next)}:comment;
        });
        return isMine?{...post,user:next.name,handle:next.handle,av:(next.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase(),avatarUrl:next.avatarUrl||"",verified:isVerifiedIdentity(next),comments:updatedComments}:{...post,comments:updatedComments};
      }));
      setPeople(ps=>ps.map(person=>person.id===next.id||person.handle===oldProfile.handle?{...person,name:next.name,handle:next.handle,avatarUrl:next.avatarUrl||"",coverUrl:next.coverUrl||"",industry:next.industry,loc:next.location,location:next.location,bio:next.bio,headline:next.headline,lookingFor:next.lookingFor,goal:next.goal}:person));
    };
    applyProfileLocally(nextDraft);
    setEditProfile(false);
    try{
      const data=await callBackend("/profile",{method:"PUT",body:JSON.stringify({profile:nextDraft})});
      const saved={...nextDraft,...(data.profile||{})};
      applyProfileLocally(saved);
      notify("Profile updated");
    }catch{
      notify("Profile saved locally. Cloud sync failed.","error");
    }
  };
  const uploadProfileImage=async(event,key="avatarUrl")=>{
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      const dataUrl=await readImageFile(file,key==="coverUrl"?1400:720,key==="coverUrl"?860000:620000);
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
  const appLayoutClass=`app-view layout-${interfaceSettings.layout||"comfortable"} density-${interfaceSettings.density||"standard"}`;
  return(
    <div className={appLayoutClass} style={{minHeight:"100vh",background:C.bg}}>
      <a className="skip-link" href="#app-main">Skip to main content</a>
      <div className="app-topbar" style={{position:"sticky",top:0,zIndex:200,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(18px)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",minHeight:68,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <button className="app-topbar-logo" aria-label="Go to feed" onClick={()=>setView("feed")} style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:C.text,cursor:"pointer",whiteSpace:"nowrap",background:"none",border:"none",padding:"6px 0",minHeight:36}}>fear<span style={{color:C.accent}}>.</span><span style={{color:C.accent}}>social</span></button>
        <div className="desktop-app-tabs" role="navigation" aria-label="Main app navigation" style={{display:"flex",gap:3,overflowX:"auto",flex:1}}>
          {tabs.map(([id,label])=><button key={id} aria-current={view===id?"page":undefined} onClick={()=>setView(id)} className="bs nl" style={{background:view===id?C.aLight:"transparent",border:"none",borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:view===id?800:600,color:view===id?C.accent:C.muted,whiteSpace:"nowrap"}}>{label}{id==="notifications"&&unread>0?` ${unread}`:""}</button>)}
        </div>
        <input type="search" aria-label="Search people, posts, tags, groups, and deals" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&searchResults[0])searchResults[0].action();if(e.key==="Escape")closeSearch();}} placeholder="Search people, posts, tags" className="if desktop-app-search" style={{width:240,maxWidth:"32vw",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:C.text}}/>
        <button onClick={inviteFriend} className="bs app-invite-button" aria-label="Invite a friend" title="Invite a friend" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",color:C.muted}}><Icon name="send" size={18} color="currentColor"/></button>
        <button onClick={()=>setView("notifications")} className="bs" aria-label={`${unread} unread notifications`} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px",position:"relative",color:view==="notifications"?C.accent:C.muted}}><Icon name="heart" size={18} filled={view==="notifications"} color="currentColor"/>{unread>0&&<span style={{position:"absolute",top:-6,right:-6,minWidth:17,height:17,padding:"0 4px",borderRadius:999,background:C.coral,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}</button>
        <button onClick={()=>setEditProfile(true)} style={{background:"none",border:"none",padding:0}} aria-label="Edit profile"><Av i={initials} src={profile.avatarUrl} size={38} grad online/></button>
        <span className={`app-connection-state ${connectionState}`} aria-live="polite"><i/>{connectionState==="online"?"Online":connectionState==="offline"?"Offline":"Connecting"}</span>
        <button onClick={signOut} className="bs desktop-signout" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,color:C.muted,fontWeight:700}}>Sign out</button>
      </div>
      <main id="app-main" className="app-shell" tabIndex={-1} style={{maxWidth:1320,margin:"0 auto",padding:"28px"}}>
        <div className="mobile-app-search">
          <input type="search" aria-label="Search fear.social" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&searchResults[0])searchResults[0].action();if(e.key==="Escape")closeSearch();}} placeholder="Search people, posts, groups..." className="if" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 14px",fontSize:16,color:C.text,boxShadow:"0 10px 30px rgba(13,15,20,0.04)"}}/>
        </div>
        <div className="mobile-section-tabs" role="navigation" aria-label="More mobile navigation">
          {[["events","fear.club","calendar"],["groups","Groups","network"],["opportunities","Deals","briefcase"]].map(([id,label,icon])=>(
            <button key={id} type="button" className={view===id?"active":""} aria-current={view===id?"page":undefined} onClick={()=>setView(id)}>
              <Icon name={icon} size={15} color="currentColor"/>{label}
            </button>
          ))}
        </div>
        {searchTerm&&<SearchResultsPanel term={query.trim()} results={searchResults} onClear={closeSearch}/>}
        {!searchTerm&&viewMeta[view]&&<AppViewIntro {...viewMeta[view]} />}
        {view==="feed"&&(
          <div className="feed-grid" style={{display:"grid",gridTemplateColumns:interfaceSettings.rightRail===false?"270px minmax(0,1fr)":"270px minmax(0,1fr) 310px",gap:interfaceSettings.density==="compact"?14:22,alignItems:"start"}}>
            <aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:22}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}><Av i={initials} src={profile.avatarUrl} size={54} grad online/><div style={{minWidth:0}}><div style={{fontWeight:900,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}><NameWithVerified name={profile.name||"Your Name"} person={profile} size={15}/></div><div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.handle||"@yourhandle"} · {profile.location||"Location not set"}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{statCards.map(([k,v])=><button key={k} className="uh bs" onClick={()=>{setProfileMetric(k);setView("profile");}} aria-label={`Open your ${k}`} style={{background:C.bg,border:"none",borderRadius:12,padding:12,textAlign:"center",minHeight:58}}><div style={{fontWeight:900,fontSize:18,color:C.text}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{k}</div></button>)}</div>
              </div>
              <div style={{background:GR,borderRadius:18,padding:20,color:"#fff"}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,opacity:.65,marginBottom:8}}>FEAR PRO</div>
                <div style={{fontWeight:900,fontSize:18,marginBottom:7}}>The FEAR Pro launch</div>
                <div style={{fontSize:13,opacity:.72,lineHeight:1.55,marginBottom:10}}>Guided mentorship, fear.club gatherings, and a focused board for brand, lifestyle, production, AI, and market tools.</div>
                <div style={{fontSize:10,fontWeight:850,opacity:.56,lineHeight:1.5,marginBottom:16}}>mentorship · fear.club · agency · style · prod · fearai · finance</div>
                <button onClick={()=>setScreen("board")} className="bs" style={{background:"#fff",border:"none",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.accent,width:"100%"}}>Preview FEAR Pro</button>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>
                <div style={{fontWeight:900,fontSize:14,marginBottom:12}}>Live rooms</div>
                {groups.slice(0,4).map(g=><div key={g.id} className="uh" onClick={()=>setView("groups")} style={{padding:"9px 6px",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{g.name}</div><div style={{fontSize:11,color:C.dim}}>{g.active}</div></div>)}
              </div>
            </aside>
            <main className="feed-main">
              <div className="mobile-profile-summary" style={{display:"none",background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:16,marginBottom:14}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av i={initials} src={profile.avatarUrl} size={46} grad online/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:900,color:C.text}}><NameWithVerified name={profile.name||"Your Name"} person={profile} size={15}/></div>
                    <div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.handle||"@yourhandle"} · {profile.industry||"Exploring"}</div>
                  </div>
                  <button onClick={()=>setEditProfile(true)} style={{background:C.aLight,color:C.accent,border:"none",borderRadius:9,padding:"8px 11px",fontSize:12,fontWeight:900}}>Edit</button>
                </div>
              </div>
              <div className="feed-mode-switch" role="tablist" aria-label="Feed mode" style={{display:"flex",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:6,marginBottom:8}}>
                {[["forYou","For you","Relevant to your goals"],["following","Following","Only people you follow"]].map(([id,label,detail])=><button key={id} role="tab" aria-selected={feedMode===id} onClick={()=>setFeedMode(id)} className="bs" style={{flex:1,border:"none",borderRadius:11,padding:"10px 12px",fontSize:13,fontWeight:950,color:feedMode===id?"#fff":C.muted,background:feedMode===id?C.accent:"transparent",display:"grid",gap:2,placeItems:"center",lineHeight:1.15}}><span style={{display:"inline-flex",alignItems:"center",gap:7}}>{id==="forYou"&&<Icon name="sparkle" size={15} color="currentColor"/>}{label}</span><span style={{fontSize:10,fontWeight:800,opacity:feedMode===id?0.9:0.62}}>{detail}</span></button>)}
              </div>
              <div className="composer-card fs-app-composer" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,padding:20,marginBottom:18}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av i={initials} src={profile.avatarUrl} size={44} grad/>
                  <div style={{flex:1}}>
                    <textarea aria-label="Create a post" value={composer} onChange={e=>setComposer(e.target.value)} placeholder="Share a win, ask for feedback, or post what you're building..." className="if" style={{width:"100%",minHeight:104,resize:"vertical",background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:14,fontSize:14,color:C.text,lineHeight:1.6}}/>
                    <MediaPreviewGrid media={composerMedia} onRemove={removeComposerMedia}/>
                    <div className="composer-actions" style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}>
                      {["Update","Ask","Milestone","Hiring","Launch"].map(t=><button key={t} data-label={t} aria-pressed={postType===t} onClick={()=>setPostType(t)} className="bs post-type-btn" style={{background:postType===t?C.aLight:"#fff",border:`1px solid ${postType===t?C.aSoft:C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:800,color:postType===t?C.accent:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.1}}>{t}</button>)}
                      <button type="button" onClick={()=>setCameraOpen(true)} className="bs composer-media-btn" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,whiteSpace:"nowrap",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}><Icon name="camera" size={15}/> Record</button>
                      <label className="bs composer-media-btn" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.text,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,whiteSpace:"nowrap",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}><Icon name="camera" size={15}/> Upload<input aria-label="Attach photos or videos to post" type="file" accept="image/*,video/*" multiple onChange={addComposerMedia} style={{display:"none"}}/></label>
                      <GBtn sm className="composer-publish-btn" disabled={!composer.trim()&&composerMedia.length===0} onClick={publish} style={{marginLeft:"auto"}}>Publish</GBtn>
                    </div>
                  </div>
                </div>
              </div>
              <div className="filter-row" role="toolbar" aria-label="Filter posts by field" style={{display:"flex",gap:8,marginBottom:16,overflow:"visible",flexWrap:"wrap"}}>{["All","Exploring","Finance","Brand Management","Creative","Food","Health"].map(t=><button key={t} aria-pressed={filter===t} onClick={()=>setFilter(t)} className="bs" style={{background:filter===t?C.accent:"#fff",color:filter===t?"#fff":C.muted,border:`1px solid ${filter===t?C.accent:C.border}`,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:800,whiteSpace:"nowrap"}}>{t}</button>)}</div>
              {visiblePosts.length===0&&<EmptyState title={feedMode==="following"?"No following posts yet":"No real posts yet"} text={feedMode==="following"?"Connect with people in Discover, then their posts will show up here.":"Your Path uses your stated field and goals to organize real posts that may be useful to you."}/>}
              {visiblePosts.map(p=>{
                const isOwner=ownPost(p);
                const isEditing=editingPost?.id===p.id;
                return (
                <article key={p.id} className="ch post-card" style={{background:C.card,border:`1px solid ${p.isNew?C.aSoft:C.border}`,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:20}}>
                    <div className="profile-link" role="button" tabIndex={0} onClick={()=>openProfile(p,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"feed"))} style={{display:"flex",gap:12,alignItems:"start",marginBottom:12}}>
                      <Av i={p.av} src={p.avatarUrl} size={45} grad={p.av===initials} online={Boolean(p.avatarUrl)||["MK","SR",initials].includes(p.av)}/>
                      <div style={{flex:1,minWidth:0}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:C.text,minWidth:0}}><NameWithVerified name={p.user} person={p} size={15}/></b><Tag label={p.type||"Update"} style={{background:C.aLight,color:C.accent}}/><IT label={p.tag}/></div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{p.handle} · {p.time} ago{p.edited?" · edited":""}</div></div>
                      <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                        {isOwner&&<><button onClick={e=>{e.stopPropagation();beginEditPost(p);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.text}}>Edit</button><button onClick={e=>{e.stopPropagation();deletePost(p.id);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.coral}}>Delete</button></>}
                        <button onClick={e=>{e.stopPropagation();reportPost(p);}} className="bs post-report-btn" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.muted}}>Report</button>
                        {!isOwner&&p.userId&&<button onClick={e=>{e.stopPropagation();blockUser(p);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 9px",fontSize:11,fontWeight:900,color:C.coral}}>Block</button>}
                      </div>
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
                      {p.content&&<p style={{fontSize:15,color:C.tSoft,lineHeight:1.75,whiteSpace:["Reel","Daily Drop"].includes(p.type)?"pre-line":"normal"}}>{p.content}</p>}
                      <OfficialReelCard post={p}/>
                      <MediaPreviewGrid media={p.media} onReport={item=>reportContent("media",item.id||p.id,`${item.kind||"media"} attachment`)}/>
                    </>}
                  </div>
                  <div className="post-actions" style={{borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",gap:16,alignItems:"center"}}>
                    <button className="bs" onClick={()=>togglePostAction(p.id,"like")} aria-label={`${p.liked?"Unlike":"Like"} post by ${p.user}`} style={{background:"none",border:"none",fontWeight:800,color:p.liked?C.coral:C.muted,display:"flex",alignItems:"center",gap:6}}><Icon name="heart" size={17} color="currentColor" filled={p.liked}/> Like {fmt(p.likes||0)}</button>
                    <button className="bs" onClick={()=>setOpenComments(o=>({...o,[p.id]:!o[p.id]}))} aria-label={`Comment on post by ${p.user}`} style={{background:"none",border:"none",fontWeight:800,color:openComments[p.id]?C.accent:C.muted,display:"flex",alignItems:"center",gap:6}}><Icon name="comment" size={17} color="currentColor"/> Comment {fmt((p.comments||[]).length)}</button>
                    <button className="bs" onClick={()=>{togglePostAction(p.id,"save");notify(p.saved?"Removed from saved":"Saved post");}} style={{background:"none",border:"none",fontWeight:800,color:p.saved?C.accent:C.muted,marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}><Icon name="bookmark" size={17} color="currentColor" filled={p.saved}/> {p.saved?"Saved":"Save"}</button>
                  </div>
                  {openComments[p.id]&&<div style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:16}}>{p.comments.map((c,i)=><div key={c.id||i} className="profile-link" role="button" tabIndex={0} onClick={()=>openProfile(c,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(c,"feed"))} style={{display:"flex",gap:10,marginBottom:10}}><Av i={c.av} src={c.avatarUrl} size={30}/><div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px",flex:1,minWidth:0}}><div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}><b style={{fontSize:12}}><NameWithVerified name={c.user} person={c} size={13}/></b><button onClick={e=>{e.stopPropagation();reportContent("comment",c.id||`${p.id}-${i}`,"comment");}} className="bs" style={{background:"transparent",border:"none",fontSize:11,fontWeight:900,color:C.muted}}>Report</button></div><p style={{fontSize:13,color:C.tSoft,lineHeight:1.5,overflowWrap:"anywhere"}}>{c.text}</p></div></div>)}<div className="comment-row" style={{display:"flex",gap:8}}><input aria-label={`Write a comment on ${p.user}'s post`} value={commentInputs[p.id]||""} onChange={e=>setCommentInputs(ci=>({...ci,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addComment(p.id)} placeholder="Write a comment..." className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",minWidth:0}}/><GBtn sm onClick={()=>addComment(p.id)}>Send</GBtn></div></div>}
                </article>
              );})}
            </main>
            {interfaceSettings.rightRail!==false&&<aside className="desktop-feed-side" style={{position:"sticky",top:92,display:"flex",flexDirection:"column",gap:14}}>
              <SuggestedPeopleCard people={people} blockedIds={blockedIds} openProfile={openProfile} reportContent={reportContent} blockUser={blockUser} connect={connect} notify={notify}/>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><span style={{width:32,height:32,borderRadius:10,background:C.aLight,color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="calendar" size={16}/></span><div><div style={{fontSize:10,fontWeight:950,letterSpacing:1.2,textTransform:"uppercase",color:C.accent}}>Coming with FEAR Pro</div><b style={{fontSize:16}}>fear.club</b></div></div><p style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:12}}>Curated events, live sessions, and member rooms are on the way.</p><button onClick={()=>setView("events")} className="bs" style={{width:"100%",background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:9,padding:"9px 11px",fontSize:12,fontWeight:900}}>See what is coming</button></div>
            </aside>}
          </div>
        )}
        {view==="discover"&&<Directory hideHeading title="Discover people" eyebrow="Network" items={people.filter(p=>!blockedIds.has(p.id)&&matchesSearch([p.name,p.handle,p.industry,p.bio,p.headline,p.lookingFor,p.loc,p.location]))} render={p=><div key={p.id} className="ch profile-link profile-directory-card" role="button" tabIndex={0} onClick={()=>openProfile(p,"discover")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"discover"))} style={cardStyle}><div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:10,minWidth:0}}><Av i={p.av} src={p.avatarUrl} size={56} online={p.online}/><div style={{flex:"1 1 0",minWidth:0}}><b style={{display:"block",fontSize:18,lineHeight:1.15,overflowWrap:"anywhere",color:C.text}}><NameWithVerified name={p.name} person={p} size={16}/></b><div className="profile-card-meta" style={{fontSize:12,color:C.dim,overflowWrap:"anywhere",marginTop:4}}>{p.handle} · {p.loc||"Location not set"}</div></div></div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}><IT label={p.industry||"Exploring"} style={{maxWidth:"100%"}}/>{p.privateProfile&&<Tag label={p.locked?"Private":"Private access"} style={{background:C.aLight,color:C.accent}}/>}{p.headline&&<Tag label={p.headline} className="industry-tag" style={{"--tag-bg":C.aLight,"--tag-color":C.accent,"--tag-border":"transparent",maxWidth:"100%"}}/>}</div><p className="profile-card-body" style={bodyCopy}>{p.bio}</p>{p.lookingFor&&<div className="profile-card-looking" style={{fontSize:12,color:C.muted,marginTop:12,overflowWrap:"anywhere"}}><b style={{color:C.text}}>Looking for:</b> {p.lookingFor}</div>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginTop:18,minWidth:0,flexWrap:"wrap"}}><span className="profile-card-followers" style={{fontSize:12,color:C.muted,minWidth:120,flex:"1 1 auto",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmt(p.followers)} followers</span><button onClick={e=>{e.stopPropagation();openProfile(p,"discover");}} className="bs profile-card-secondary-btn" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.text}}>View</button><button onClick={e=>{e.stopPropagation();reportContent("user",p.id,`${p.name}'s profile`);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.muted}}>Report</button><button onClick={e=>{e.stopPropagation();blockUser(p);}} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 11px",fontSize:12,fontWeight:900,color:C.coral}}>Block</button><GBtn sm disabled={p.accessStatus==="pending"} onClick={e=>{e.stopPropagation();connect(p.id);}}>{connectionButtonLabel(p)}</GBtn></div></div>}/>}
        {view==="events"&&<FearClubComingSoonView onPreview={()=>setScreen("board")}/>}
        {view==="messages"&&<MessagesView messages={messages} setMessages={setMessages} sendMessage={sendMessage} deleteChat={deleteChat} editMessage={editMessage} deleteMessage={deleteMessage} unsendMessage={unsendMessage} activeConversationId={activeConversationId} onBlockUser={blockUser} onReport={reportContent} profileId={profile.id} syncMessageText={syncMessageText}/>}
        {view==="notifications"&&<NotificationsView notifications={notifications} markRead={markNotificationsRead} openProfile={openProfile}/>}
        {view==="groups"&&<GroupsView groups={groups} people={people} createGroup={createGroup} joinGroup={joinGroup} leaveGroup={leaveGroup} inviteToGroup={inviteToGroup} postAnnouncement={postGroupAnnouncement} reportContent={reportContent}/>}
        {view==="opportunities"&&<OpportunitiesView deals={rankedDeals} savedDeals={savedDeals} toggleSave={toggleDealSave} signalInterest={signalDealInterest} postOpportunity={postOpportunity} profile={profile}/>}
        {view==="settings"&&<SettingsView profile={profile} setView={setView} setEditProfile={setEditProfile} updateProfilePrivacy={updateProfilePrivacy} accessRequests={accessRequests} reviewAccessRequest={reviewAccessRequest} openProfile={person=>openProfile(person,"settings")} openBoard={()=>setScreen("board")} interfaceSettings={interfaceSettings} setInterfaceSettings={setInterfaceSettings} accessibility={accessibility} setAccessibility={setAccessibility} themeMode={themeMode} setThemeMode={setThemeMode} cookieConsent={cookieConsent} setCookieConsent={setCookieConsent} onOpenPanel={onOpenPanel} onDeleteAccount={deleteAccount} inviteFriend={inviteFriend} signOut={signOut}/>}
        {view==="profile"&&<ProfilePanel profile={profile} setEditProfile={setEditProfile} onDeleteAccount={deleteAccount} stats={statCards} posts={ownProfilePosts} followers={ownFollowers} following={ownFollowing} savedPosts={posts.filter(p=>p.saved)} openProfile={person=>openProfile(person,"profile")} initialMetric={profileMetric}/>}
        {view==="publicProfile"&&publicProfile&&<PublicProfilePanel profile={publicProfile} posts={publicProfilePosts} followers={connections.followersByUserId?.[publicProfile.id]||[]} following={connections.followingByUserId?.[publicProfile.id]||[]} onBack={()=>setView(profileReturnView)} onConnect={()=>{connect(publicProfile.id);notify(`${publicProfile.connected?"Disconnected from":"Connected with"} ${publicProfile.name}`);}} onMessage={()=>startMessage(publicProfile)} onReport={()=>reportContent("user",publicProfile.id,`${publicProfile.name}'s profile`)} onBlock={()=>blockUser(publicProfile)} openProfile={person=>openProfile(person,"publicProfile")}/>}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">
        {mobileTabs.map(([id,label,icon])=><button key={id} className={view===id?"active":""} aria-current={view===id?"page":undefined} onClick={()=>setView(id)} aria-label={id==="notifications"?`${label}, ${unread} unread`:label}><span><Icon name={icon} size={18} color="currentColor" filled={id==="notifications"&&unread>0}/></span>{label}{id==="notifications"&&unread>0?` ${unread}`:""}</button>)}
      </nav>
      {cameraOpen&&<CameraCaptureModal onClose={()=>setCameraOpen(false)} onCapture={addCapturedMedia} notify={notify}/>}
      {postRulesOpen&&<PostRulesConfirmModal onClose={()=>setPostRulesOpen(false)} onConfirm={()=>publish({confirmed:true})}/>}
      {editProfile&&(
        <div className="edit-modal" role="dialog" aria-modal="true" aria-label="Edit your profile" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.58)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setEditProfile(false)} onKeyDown={e=>e.key==="Escape"&&setEditProfile(false)}>
          <div className="edit-sheet" style={{background:"#fff",borderRadius:22,padding:28,width:"min(560px,100%)",boxShadow:"0 30px 100px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
            <SectionTitle eyebrow="Profile" title="Edit your profile"/>
            <div style={{height:132,borderRadius:20,background:safeImageUrl(profileDraft.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profileDraft.coverUrl)}")`:GR,border:`1px solid ${C.border}`,marginBottom:56,position:"relative",overflow:"visible",boxShadow:"inset 0 -60px 80px rgba(0,0,0,.18)"}}>
              <div style={{position:"absolute",left:16,bottom:-34}}><Av i={initials} src={profileDraft.avatarUrl} size={78} grad style={{border:"4px solid #fff"}}/></div>
              <div style={{position:"absolute",right:12,top:12,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <label className="bs" style={{background:"rgba(255,255,255,0.94)",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer"}}><Icon name="camera" size={15}/> Change banner<input aria-label="Upload profile banner" type="file" accept="image/*" onChange={e=>uploadProfileImage(e,"coverUrl")} style={{display:"none"}}/></label>
                {profileDraft.coverUrl&&<button type="button" className="bs" onClick={()=>setProfileDraft(p=>({...p,coverUrl:""}))} style={{background:"rgba(13,15,20,.72)",color:"#fff",border:"1px solid rgba(255,255,255,.22)",borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900}}>Remove</button>}
              </div>
              <div style={{position:"absolute",left:100,bottom:-34,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <label className="bs" style={{background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",boxShadow:"0 10px 28px rgba(15,23,42,.12)"}}><Icon name="camera" size={15}/> Change photo<input aria-label="Upload profile picture" type="file" accept="image/*" onChange={e=>uploadProfileImage(e,"avatarUrl")} style={{display:"none"}}/></label>
                {profileDraft.avatarUrl&&<button type="button" className="bs" onClick={()=>setProfileDraft(p=>({...p,avatarUrl:""}))} style={{background:"#fff",color:C.muted,border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900}}>Remove</button>}
              </div>
            </div>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>name<input aria-label="Name" autoComplete="name" value={profileDraft.name||""} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>username<input aria-label="Username" autoComplete="username" value={cleanUsername(profileDraft.username||profileDraft.handle||"")} onChange={e=>setProfileDraft(p=>{const username=cleanUsername(e.target.value);return {...p,username,handle:`@${username}`};})} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/><span style={{display:"block",fontSize:12,color:C.dim,textTransform:"none",fontWeight:600,marginTop:6}}>Your profile URL name is @{cleanUsername(profileDraft.username||profileDraft.handle||"username")}</span></label>
            <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>headline<input aria-label="Headline" value={profileDraft.headline||""} onChange={e=>setProfileDraft(p=>({...p,headline:e.target.value}))} placeholder="Student, designer, first-time operator, career switcher..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {["location","industry"].map(k=><label key={k} style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>{k}<input aria-label={k==="industry"?"Industry":"Location"} autoComplete={k==="location"?"address-level2":undefined} value={profileDraft[k]||""} onChange={e=>setProfileDraft(p=>({...p,[k]:e.target.value}))} placeholder={k==="industry"?"Exploring, Brand Management...":"City, State"} className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",marginBottom:14}}>looking for<input aria-label="Looking for" value={profileDraft.lookingFor||""} onChange={e=>setProfileDraft(p=>({...p,lookingFor:e.target.value}))} placeholder="Collaborators, jobs, clients, guidance..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:C.text}}/></label>
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
const AppViewIntro=({eyebrow,title,copy})=>(
  <header className="app-view-intro">
    <div className="app-view-intro-index" aria-hidden="true"/>
    <div>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
    </div>
    <p>{copy}</p>
  </header>
);
const connectionButtonLabel=person=>person?.locked?(person.accessStatus==="pending"?"Request sent":"Request access"):(person?.connected?"Connected":"Connect");
const followButtonLabel=person=>person?.locked?(person.accessStatus==="pending"?"Requested":"Request"):(person?.connected?"Following":"Follow");
function MediaPreviewGrid({media=[],onRemove,onReport}){
  const safe=(Array.isArray(media)?media:[]).map(item=>({...item,url:safeMediaUrl(item?.url,item?.kind)})).filter(item=>item.url);
  if(safe.length===0)return null;
  return <div className="post-media-grid" style={{display:"grid",gridTemplateColumns:safe.length===1?"1fr":"repeat(2,minmax(0,1fr))",gap:8,marginTop:12}}>{safe.map(item=><MediaPreviewItem key={item.id||item.url} item={item} single={safe.length===1} onRemove={onRemove} onReport={onReport}/>)}</div>;
}
function MediaPreviewItem({item,single,onRemove,onReport}){
  const [videoError,setVideoError]=useState(false);
  return <div style={{position:"relative",border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",background:item.kind==="video"?"#000":C.bg,minHeight:single?260:170}}>
    {item.kind==="video"&&!videoError?<video src={item.url} controls playsInline preload="metadata" onLoadedData={()=>setVideoError(false)} onError={()=>setVideoError(true)} style={{display:"block",width:"100%",height:"100%",maxHeight:420,objectFit:"cover",background:"#000"}}/>:item.kind==="video"?<div style={{minHeight:single?320:190,display:"grid",placeItems:"center",textAlign:"center",padding:24,color:"rgba(255,255,255,.72)",background:"#000"}}>
      <div>
        <div style={{width:54,height:54,borderRadius:"50%",border:"1px solid rgba(255,255,255,.22)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:"#fff"}}><Icon name="camera" size={24}/></div>
        <div style={{fontWeight:950,color:"#fff",marginBottom:6}}>Video attached</div>
        <p style={{fontSize:13,lineHeight:1.55,maxWidth:320}}>This browser cannot preview that video format. MP4 usually previews best. You can remove it and upload/record again.</p>
      </div>
    </div>:<img src={item.url} alt={item.alt||"Post photo"} style={{display:"block",width:"100%",height:"100%",maxHeight:520,objectFit:"cover"}}/>}
    {onRemove&&<button type="button" aria-label="Remove media" onClick={()=>onRemove(item.id)} className="bs" style={{position:"absolute",top:8,right:8,width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.5)",background:"rgba(13,15,20,0.78)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="close" size={16}/></button>}
    {!onRemove&&onReport&&<button type="button" aria-label="Report media" onClick={()=>onReport(item)} className="bs" style={{position:"absolute",top:8,right:8,borderRadius:999,border:"1px solid rgba(255,255,255,0.55)",background:"rgba(13,15,20,0.78)",color:"#fff",padding:"7px 10px",fontSize:11,fontWeight:900}}>Report</button>}
  </div>;
}
function CameraCaptureModal({onClose,onCapture,notify}){
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const recorderRef=useRef(null);
  const chunksRef=useRef([]);
  const stopTimerRef=useRef(null);
  const cancelCaptureRef=useRef(false);
  const [mode,setMode]=useState("photo");
  const [facing,setFacing]=useState("user");
  const [recording,setRecording]=useState(false);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState("");
  const stopStream=useCallback(()=>{
    if(stopTimerRef.current)clearTimeout(stopTimerRef.current);
    stopTimerRef.current=null;
    streamRef.current?.getTracks?.().forEach(track=>track.stop());
    streamRef.current=null;
    setReady(false);
  },[]);
  useEffect(()=>{
    let active=true;
    const start=async()=>{
      setError("");
      setReady(false);
      stopStream();
      try{
        if(!navigator?.mediaDevices?.getUserMedia)throw new Error("Camera capture is not supported in this browser.");
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1080},height:{ideal:1920}},audio:mode==="video"});
        if(!active){
          stream.getTracks().forEach(track=>track.stop());
          return;
        }
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
          await videoRef.current.play().catch(()=>{});
        }
        setReady(true);
      }catch(err){
        setError(err?.message||"Allow camera access to record a post.");
      }
    };
    start();
    return()=>{active=false;stopStream();};
  },[facing,mode,stopStream]);
  const capturePhoto=()=>{
    if(!videoRef.current||!ready)return;
    const video=videoRef.current;
    const canvas=document.createElement("canvas");
    canvas.width=video.videoWidth||1080;
    canvas.height=video.videoHeight||1920;
    const ctx=canvas.getContext("2d");
    ctx.drawImage(video,0,0,canvas.width,canvas.height);
    onCapture({id:`camera_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"image",url:canvas.toDataURL("image/jpeg",0.86),alt:"Camera photo"});
  };
  const startRecording=()=>{
    if(!streamRef.current||recording)return;
    if(typeof MediaRecorder==="undefined")return setError("Video recording is not supported in this browser.");
    const preferred=["video/mp4;codecs=h264,aac","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];
    const mimeType=preferred.find(type=>MediaRecorder.isTypeSupported?.(type))||"";
    cancelCaptureRef.current=false;
    chunksRef.current=[];
    try{
      const recorder=new MediaRecorder(streamRef.current,mimeType?{mimeType}:undefined);
      recorderRef.current=recorder;
      recorder.ondataavailable=event=>{if(event.data?.size)chunksRef.current.push(event.data);};
      recorder.onstop=()=>{
        setRecording(false);
        if(stopTimerRef.current)clearTimeout(stopTimerRef.current);
        stopTimerRef.current=null;
        const blob=new Blob(chunksRef.current,{type:recorder.mimeType||mimeType||"video/webm"});
        chunksRef.current=[];
        if(cancelCaptureRef.current)return;
        if(blob.size>4*1024*1024){
          setError("That clip is over 4 MB. Try a shorter video for now.");
          return;
        }
        const reader=new FileReader();
        reader.onerror=()=>setError("Could not prepare that video.");
        reader.onload=()=>onCapture({id:`camera_${Date.now()}_${Math.random().toString(16).slice(2)}`,kind:"video",url:String(reader.result||""),alt:"Camera video"});
        reader.readAsDataURL(blob);
      };
      recorder.start(250);
      setRecording(true);
      stopTimerRef.current=setTimeout(()=>recorder.state==="recording"&&recorder.stop(),15000);
    }catch(err){
      setError(err?.message||"Could not start recording.");
    }
  };
  const stopRecording=()=>recorderRef.current?.state==="recording"&&recorderRef.current.stop();
  const close=()=>{
    cancelCaptureRef.current=true;
    if(recording)stopRecording();
    stopStream();
    onClose();
  };
  return <div role="dialog" aria-modal="true" aria-label="Record a photo or video" style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={close}>
    <div className="camera-sheet" style={{width:"min(520px,100%)",background:"#0D0F14",border:"1px solid rgba(255,255,255,.12)",borderRadius:24,overflow:"hidden",boxShadow:"0 32px 120px rgba(0,0,0,.45)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div><div style={{fontSize:11,fontWeight:950,letterSpacing:1.8,textTransform:"uppercase",color:C.accent}}>Create in camera</div><div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:900,color:"#fff",letterSpacing:0}}>Record a post</div></div>
        <button onClick={close} aria-label="Close camera" className="bs" style={{width:40,height:40,borderRadius:"50%",border:"1px solid rgba(255,255,255,.16)",background:"rgba(255,255,255,.08)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="close" size={18}/></button>
      </div>
      <div style={{padding:14}}>
        <div style={{position:"relative",borderRadius:20,overflow:"hidden",background:"#000",aspectRatio:"9 / 16",maxHeight:"62vh",margin:"0 auto",border:"1px solid rgba(255,255,255,.12)"}}>
          <video ref={videoRef} muted playsInline autoPlay style={{display:"block",width:"100%",height:"100%",objectFit:"cover",transform:facing==="user"?"scaleX(-1)":"none"}}/>
          {!ready&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24,color:"rgba(255,255,255,.72)",fontSize:14,lineHeight:1.6}}>{error||"Starting camera..."}</div>}
          {recording&&<div style={{position:"absolute",top:14,left:14,display:"inline-flex",alignItems:"center",gap:8,background:"rgba(229,57,53,.92)",color:"#fff",borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:950}}><span style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/> Recording</div>}
        </div>
        {error&&<p role="alert" style={{marginTop:12,color:"#fecaca",fontSize:13,lineHeight:1.5}}>{error}</p>}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
          {["photo","video"].map(next=><button key={next} onClick={()=>!recording&&setMode(next)} className="bs" aria-pressed={mode===next} style={{border:"1px solid rgba(255,255,255,.14)",background:mode===next?C.accent:"rgba(255,255,255,.08)",color:mode===next?"#fff":"rgba(255,255,255,.74)",borderRadius:999,padding:"9px 14px",fontSize:13,fontWeight:950,textTransform:"capitalize"}}>{next}</button>)}
          <button onClick={()=>!recording&&setFacing(facing==="user"?"environment":"user")} className="bs" style={{border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.08)",color:"#fff",borderRadius:999,padding:"9px 14px",fontSize:13,fontWeight:950}}>Flip</button>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
          {mode==="photo"?<button disabled={!ready} onClick={capturePhoto} className="bs" style={{width:72,height:72,borderRadius:"50%",border:"5px solid rgba(255,255,255,.72)",background:ready?"#fff":"rgba(255,255,255,.34)",boxShadow:"0 0 0 8px rgba(255,255,255,.1)",fontSize:0}}>Capture photo</button>:<button disabled={!ready} onClick={recording?stopRecording:startRecording} className="bs" style={{width:72,height:72,borderRadius:"50%",border:"5px solid rgba(255,255,255,.72)",background:recording?C.coral:C.accent,boxShadow:"0 0 0 8px rgba(255,255,255,.1)",color:"#fff",fontSize:11,fontWeight:950}}>{recording?"Stop":"Rec"}</button>}
        </div>
        <p style={{marginTop:14,textAlign:"center",color:"rgba(255,255,255,.48)",fontSize:12,lineHeight:1.5}}>Videos auto-stop after 15 seconds and must stay under 4 MB.</p>
      </div>
    </div>
  </div>;
}

function PostRulesConfirmModal({onClose,onConfirm}){
  const rules=[
    "No abusive, hateful, threatening, explicit, or harassing content.",
    "No doxxing, scams, spam, impersonation, or private information.",
    "Posts can be filtered, reported, removed, or lead to account limits."
  ];
  return (
    <ModalShell title="Ready to post?" eyebrow="Community safety" onClose={onClose}>
      <div style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:18,padding:18,marginBottom:18}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{width:38,height:38,borderRadius:"50%",background:C.accent,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 14px 36px rgba(22,199,78,.24)"}}>
            <Icon name="check" size={19} color="currentColor"/>
          </span>
          <div>
            <b style={{display:"block",fontSize:17,color:C.text,marginBottom:6}}>Keep fear.social useful and safe.</b>
            <p style={{fontSize:14,color:C.tSoft,lineHeight:1.65}}>
              Before this goes live, confirm that it follows the community rules and is something people can safely learn from, respond to, or build on.
            </p>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gap:10,marginBottom:22}}>
        {rules.map(rule=>(
          <div key={rule} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,color:C.muted,lineHeight:1.55}}>
            <Icon name="check" size={16} color={C.accent} style={{marginTop:2}}/>
            <span>{rule}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <GhostBtn onClick={onClose} style={{borderColor:C.border,color:C.text}}>Keep editing</GhostBtn>
        <GBtn onClick={onConfirm}>Post now</GBtn>
      </div>
    </ModalShell>
  );
}

function SuggestedPeopleCard({people,blockedIds,openProfile,reportContent,blockUser,connect,notify}){
  const visible=(people||[]).filter(p=>!blockedIds.has(p.id)).slice(0,4);
  return (
    <div className="suggested-people-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20}}>
      <b className="suggested-people-title" style={{display:"block",fontSize:18,lineHeight:1.1,color:C.text,marginBottom:10}}>New people</b>
      {visible.length===0&&<MiniEmpty text="Real users will appear here after they create accounts."/>}
      {visible.map(p=>(
        <div key={p.id} className="uh profile-link suggested-person-row" role="button" tabIndex={0} onClick={()=>openProfile(p,"feed")} onKeyDown={e=>activateOnEnter(e,()=>openProfile(p,"feed"))} style={{display:"grid",gridTemplateColumns:"36px minmax(0,1fr)",gap:10,alignItems:"start",padding:"12px 4px"}}>
          <Av i={p.av} src={p.avatarUrl} size={36} online={p.online}/>
          <div className="suggested-person-main" style={{minWidth:0,display:"grid",gap:8}}>
            <div className="suggested-person-top" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:8,alignItems:"center"}}>
              <div style={{minWidth:0}}>
                <div className="suggested-person-name" style={{fontSize:13,fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:C.text}}><NameWithVerified name={p.name} person={p} size={14}/></div>
                <div className="suggested-person-meta" style={{fontSize:11,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{p.industry||"Exploring"}</div>
              </div>
              <button className="suggested-follow-btn" disabled={p.accessStatus==="pending"} onClick={e=>{e.stopPropagation();connect(p.id);}} style={{background:p.connected?C.accent:C.aLight,color:p.connected?"#fff":C.accent,border:"none",borderRadius:10,padding:"7px 10px",fontWeight:900,fontSize:12,flexShrink:0,minHeight:34,opacity:p.accessStatus==="pending"?0.76:1}}>{followButtonLabel(p)}</button>
            </div>
            <div className="suggested-person-actions" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:6}}>
              <button onClick={e=>{e.stopPropagation();openProfile(p,"feed");}} style={{background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 8px",fontWeight:900,fontSize:11,minHeight:34}}>View</button>
              <button onClick={e=>{e.stopPropagation();reportContent("user",p.id,`${p.name}'s profile`);}} style={{background:"#fff",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 8px",fontWeight:900,fontSize:11,minHeight:34}}>Report</button>
              <button onClick={e=>{e.stopPropagation();blockUser(p);}} style={{background:"#fff",color:C.coral,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 8px",fontWeight:900,fontSize:11,minHeight:34}}>Block</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OfficialReelCard({post}){
  if(!["Reel","Daily Drop"].includes(post?.type)||post?.handle!=="@fear.social")return null;
  const lines=String(post.content||"").split("\n").map(line=>line.trim()).filter(Boolean);
  const titleLine=lines.find(line=>line.startsWith("Daily fear.social Drop:")||line.startsWith("Daily fear.social Reel:"));
  const title=titleLine?.replace(/^Daily fear\.social (?:Drop|Reel):/,"").trim()||"Daily Drop";
  const quote=lines.find(line=>line.startsWith("Quote:"))?.replace("Quote:","").trim()||"";
  const feature=lines.find(line=>line.startsWith("Why fear.social:"))?.replace("Why fear.social:","").trim()||"fear.social helps you turn first-step ambition into visible momentum.";
  const cta=lines.find(line=>line.startsWith("CTA:"))?.replace("CTA:","").trim()||"Open fear.social and make your next move.";
  return <div aria-label={`Official fear.social Daily Drop: ${title}`} style={{marginTop:14,borderRadius:22,overflow:"hidden",background:GR2,border:`1px solid ${C.aSoft}`,boxShadow:"0 24px 60px rgba(22,199,78,0.14)"}}>
    <div style={{minHeight:430,display:"grid",alignContent:"space-between",padding:24,position:"relative",color:"#fff"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 78% 18%, rgba(22,199,78,.35), transparent 32%), radial-gradient(circle at 18% 82%, rgba(255,255,255,.08), transparent 34%)"}}/>
      <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid rgba(255,255,255,.2)",borderRadius:999,padding:"8px 11px",fontSize:11,fontWeight:950,letterSpacing:1.2,textTransform:"uppercase",background:"rgba(255,255,255,.08)"}}><Icon name="sparkle" size={14} color={C.accent}/> Daily Drop</span>
        <span style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:900}}>fear<span style={{color:C.accent}}>.</span>social</span>
      </div>
      <div style={{position:"relative",zIndex:1,display:"grid",gap:14,maxWidth:520}}>
        <div style={{fontSize:13,fontWeight:950,letterSpacing:1.6,textTransform:"uppercase",color:C.accent}}>Official prompt</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,7vw,58px)",lineHeight:1.02,fontWeight:900,letterSpacing:0}}>{title}</div>
        {quote&&<div style={{padding:"16px 18px",borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.14)",fontFamily:"Georgia,serif",fontSize:24,lineHeight:1.28,color:"#fff"}}>"{quote}"</div>}
        <p style={{fontSize:14,lineHeight:1.55,color:"rgba(255,255,255,.62)",maxWidth:500}}>{feature}</p>
      </div>
      <div style={{position:"relative",zIndex:1,display:"grid",gap:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center",fontSize:13,fontWeight:900,color:"rgba(255,255,255,.74)"}}><span style={{width:34,height:34,borderRadius:"50%",background:C.accent,color:"#071008",display:"flex",alignItems:"center",justifyContent:"center",flex:"0 0 auto"}}><Icon name="zap" size={17} color="currentColor"/></span> {cta}</div>
        <div style={{height:6,borderRadius:999,background:"rgba(255,255,255,.12)",overflow:"hidden"}}><span style={{display:"block",height:"100%",width:"68%",borderRadius:999,background:C.accent}}/></div>
      </div>
    </div>
  </div>;
}
function EmptyState({title,text}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,textAlign:"center",color:C.muted}}><div style={{fontWeight:900,fontSize:18,color:C.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,lineHeight:1.65}}>{text}</div></div>;
}
function MiniEmpty({text}){
  return <div style={{fontSize:12,color:C.dim,lineHeight:1.55,marginTop:10,padding:"10px 0"}}>{text}</div>;
}
function Directory({eyebrow,title,items,render,hideHeading=false}){
  return <div className="directory-wrap">{!hideHeading&&<><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>{eyebrow}</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,marginBottom:24,color:C.text}}>{title}</h1></>}{items.length===0?<EmptyState title="Nothing real here yet" text="This area will stay empty until real records are added in the backend."/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{items.map(render)}</div>}</div>;
}
function FearClubComingSoonView({onPreview}){
  const features=[
    ["calendar","Curated gatherings","Thoughtful events around careers, creative work, opportunity, and the first moves people usually make alone."],
    ["network","Smaller rooms","Focused member sessions designed for useful conversation, shared interests, and introductions that feel natural."],
    ["sparkle","Real connection","A bridge from the people you meet on fear.social to the relationships and momentum you can build beyond the feed."],
  ];
  return <div className="directory-wrap fear-club-view" style={{maxWidth:1040}}>
    <section style={{position:"relative",overflow:"hidden",background:GR2,border:"1px solid rgba(22,199,78,.24)",borderRadius:24,padding:"clamp(26px,5vw,52px)",color:"#fff",boxShadow:"0 28px 90px rgba(0,0,0,.18)"}}>
      <div aria-hidden="true" style={{position:"absolute",width:360,height:360,borderRadius:"50%",right:-130,bottom:-220,background:"radial-gradient(circle, rgba(22,199,78,.32), transparent 68%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:720}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(22,199,78,.12)",border:"1px solid rgba(22,199,78,.3)",borderRadius:999,padding:"8px 11px",fontSize:11,fontWeight:950,letterSpacing:1.2,textTransform:"uppercase",color:"#8BFFAD",marginBottom:22}}><span style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/>Coming soon with FEAR Pro</span>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(48px,8vw,88px)",lineHeight:.9,letterSpacing:0,color:"#fff",marginBottom:22}}>fear<span style={{color:C.accent}}>.</span>club</h1>
        <p style={{fontSize:"clamp(17px,2vw,21px)",lineHeight:1.62,color:"rgba(255,255,255,.72)",maxWidth:680,marginBottom:14}}>The part of fear.social built to bring the right people into the same room.</p>
        <p style={{fontSize:14,lineHeight:1.72,color:"rgba(255,255,255,.5)",maxWidth:650,marginBottom:28}}>fear.club will introduce curated events, live sessions, and focused member rooms as part of the FEAR Pro launch. It is a preview today, and no event registration or payment is active yet.</p>
        <button onClick={onPreview} className="bs" style={{background:"#fff",color:"#0D0F14",border:"none",borderRadius:999,padding:"13px 18px",fontSize:13,fontWeight:950,display:"inline-flex",alignItems:"center",gap:8}}>Preview FEAR Pro <Icon name="send" size={15}/></button>
      </div>
    </section>
    <div className="directory-grid fear-club-features" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:14}}>
      {features.map(([icon,title,copy])=><article key={title} className="ch fear-club-feature" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,minWidth:0}}><span style={{width:40,height:40,borderRadius:13,background:C.aLight,color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:17}}><Icon name={icon} size={19}/></span><h2 style={{fontSize:18,lineHeight:1.15,color:C.text,marginBottom:8}}>{title}</h2><p style={{fontSize:13,lineHeight:1.62,color:C.muted}}>{copy}</p></article>)}
    </div>
  </div>;
}
function SearchResultsPanel({term,results,onClear}){
  const visible=results.slice(0,12);
  return <section aria-label={`Search results for ${term}`} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:18,marginBottom:20,boxShadow:"0 18px 54px rgba(13,15,20,0.06)"}}><div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}><div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:900,letterSpacing:1.8,textTransform:"uppercase",color:C.accent,marginBottom:5}}>Search</div><h2 style={{fontFamily:"Georgia,serif",fontSize:28,lineHeight:1.05,letterSpacing:0,color:C.text,overflowWrap:"anywhere"}}>{visible.length?`${visible.length} results for "${term}"`:`No results for "${term}"`}</h2></div><button onClick={onClear} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"9px 13px",fontSize:12,fontWeight:900,color:C.text,display:"inline-flex",alignItems:"center",gap:7}}><Icon name="close" size={14}/> Clear</button></div>{visible.length===0?<EmptyState title="Nothing matched yet" text="Try a person, field, tag, post topic, group, message, or opportunity."/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>{visible.map(result=><button key={result.id} onClick={result.action} className="ch" style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:14,textAlign:"left",display:"grid",gridTemplateColumns:"38px minmax(0,1fr)",gap:12,color:C.text,minWidth:0}}><span style={{width:38,height:38,borderRadius:12,background:C.aLight,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={result.icon} size={18}/></span><span style={{minWidth:0}}><span style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:950,textTransform:"uppercase",letterSpacing:1,color:C.accent}}>{result.kind}</span><span style={{fontSize:12,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{result.subtitle}</span></span><span style={{display:"block",fontSize:15,fontWeight:950,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{result.title}</span><span style={{fontSize:13,color:C.muted,lineHeight:1.45,marginTop:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{result.meta}</span></span></button>)}</div>}</section>;
}
function GroupsView({groups,people,createGroup,joinGroup,leaveGroup,inviteToGroup,postAnnouncement,reportContent}){
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
  return (
    <div className="directory-wrap">
      <div className="view-local-heading" style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:18,marginBottom:22,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Rooms</div>
          <h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,color:C.text}}>Groups</h1>
        </div>
        <div style={{fontSize:13,color:C.muted,maxWidth:430,lineHeight:1.6}}>Create focused rooms, invite members, and keep everyone aligned with announcements.</div>
      </div>

      <div className="composer-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:18}}>
        <div className="groups-create-grid" style={{display:"grid",gridTemplateColumns:"minmax(180px,0.8fr) minmax(220px,1.2fr) auto",gap:10,alignItems:"end"}}>
          <label style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1,color:C.muted}}>
            Group name
            <input aria-label="Group name" value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} placeholder="NYC creatives, Finance starters..." className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:C.text}}/>
          </label>
          <label style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1,color:C.muted}}>
            Purpose
            <input aria-label="Group purpose" value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="What should people use this group for?" className="if" style={{display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:C.text}}/>
          </label>
          <GBtn onClick={submitGroup} style={{height:42,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="network" size={16} color="#fff"/> Create group</GBtn>
        </div>
      </div>

      <div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
        {usableGroups.map(group=>{
          const selectedInvite=inviteDraft[group.id]||"";
          const announce=announcementDraft[group.id]||{title:"",body:""};
          return (
            <article key={group.id} className="ch" style={{...cardStyle,padding:0,borderColor:group.official?C.aSoft:C.border}}>
              <div style={{padding:20,background:group.official?GR:"transparent",color:group.official?"#fff":C.text}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <b style={{fontSize:22,overflowWrap:"anywhere"}}>{group.name}</b>
                      {group.official&&<Tag label="Official" style={{background:"rgba(255,255,255,0.18)",color:"#fff"}}/>}
                      {group.invited&&<Tag label="Invited" style={{background:"#fff",color:C.accent}}/>}
                    </div>
                    <div style={{fontSize:12,opacity:group.official?0.82:1,color:group.official?"rgba(255,255,255,0.78)":C.muted,marginTop:5}}>{group.active}</div>
                  </div>
                  <div style={{width:44,height:44,borderRadius:14,background:group.official?"rgba(255,255,255,0.14)":C.aLight,color:group.official?"#fff":C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={group.official?"sparkle":"network"} size={22} color="currentColor"/>
                  </div>
                </div>
                <p style={{fontSize:14,lineHeight:1.65,marginTop:14,color:group.official?"rgba(255,255,255,0.82)":C.tSoft}}>{group.desc}</p>
              </div>

              <div style={{padding:20,display:"grid",gap:16}}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!group.member&&<GBtn onClick={()=>joinGroup(group.id)}>{group.invited?"Accept invite":"Join group"}</GBtn>}
                  {group.member&&<button onClick={()=>leaveGroup?.(group.id)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:12,fontWeight:900,color:C.coral}}>Leave group</button>}
                  <button onClick={()=>reportContent?.("group",group.id,`${group.name} group`)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:12,fontWeight:900,color:C.muted}}>Report group</button>
                </div>

                {group.canInvite&&(
                  <div style={{display:"grid",gap:9}}>
                    <div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>Invite users</div>
                    <div style={{display:"flex",gap:8}}>
                      <select aria-label={`Choose a person to invite to ${group.name}`} value={selectedInvite} onChange={e=>setInviteDraft(d=>({...d,[group.id]:e.target.value}))} className="if" style={{flex:1,minWidth:0,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text,background:"#fff"}}>
                        <option value="">Choose a person</option>
                        {invitePeople.map(person=><option key={person.id} value={person.id}>{person.name} · {person.industry||"Exploring"}</option>)}
                      </select>
                      <button onClick={()=>selectedInvite&&inviteToGroup(group.id,[selectedInvite])} className="bs" style={{border:"none",background:C.aLight,color:C.accent,borderRadius:10,padding:"10px 13px",fontSize:12,fontWeight:900,whiteSpace:"nowrap"}}>Invite</button>
                    </div>
                    {invitePeople.length===0&&<MiniEmpty text="More invite options will appear as real users join."/>}
                  </div>
                )}

                {group.canAnnounce&&(
                  <div style={{display:"grid",gap:9}}>
                    <div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>Announcement</div>
                    <input aria-label={`Announcement title for ${group.name}`} value={announce.title} onChange={e=>setAnnouncementDraft(d=>({...d,[group.id]:{...announce,title:e.target.value}}))} placeholder={group.official?"New fear feature, launch note...":"Announcement title"} className="if" style={{border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text}}/>
                    <textarea aria-label={`Announcement body for ${group.name}`} value={announce.body} onChange={e=>setAnnouncementDraft(d=>({...d,[group.id]:{...announce,body:e.target.value}}))} placeholder="Share the update with this group..." className="if" style={{border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.text,minHeight:86,resize:"vertical",lineHeight:1.5}}/>
                    <GBtn sm onClick={()=>{postAnnouncement(group.id,announce);setAnnouncementDraft(d=>({...d,[group.id]:{title:"",body:""}}));}}>Post announcement</GBtn>
                  </div>
                )}

                <div>
                  <div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:9}}>Latest announcements</div>
                  {(group.announcements||[]).length===0?(
                    <MiniEmpty text={group.official?"Admin feature updates will appear here.":"No announcements yet."}/>
                  ):(
                    <div style={{display:"grid",gap:8}}>
                      {group.announcements.map(a=>(
                        <div key={a.id} style={{border:`1px solid ${C.border}`,borderRadius:12,padding:12,background:C.bg}}>
                          <div style={{fontWeight:900,color:C.text,marginBottom:5,overflowWrap:"anywhere"}}>{a.title}</div>
                          <p style={{fontSize:13,lineHeight:1.55,color:C.tSoft,overflowWrap:"anywhere"}}>{a.body}</p>
                          <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
                            <div style={{fontSize:11,color:C.dim}}>{a.author} · {a.time} ago</div>
                            <button onClick={()=>reportContent?.("message",a.id||`${group.id}-announcement`,"group announcement")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 8px",fontSize:11,fontWeight:900,color:C.muted}}>Report</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
function OpportunitiesView({deals,savedDeals,toggleSave,signalInterest,postOpportunity,profile}){
  const [mode,setMode]=useState("matched");
  const [kind,setKind]=useState("All");
  const [draft,setDraft]=useState({title:"",company:"",type:"Gig",tag:profile?.industry||"Exploring",budget:"",location:"Remote",level:"First step",skills:"",desc:""});
  const types=["All",...Array.from(new Set(["Job","Gig","Volunteer","Opportunity",...deals.map(deal=>deal.type).filter(Boolean)]))];
  const visible=deals.filter(deal=>(kind==="All"||deal.type===kind)&&(mode!=="saved"||savedDeals.includes(deal.id)));
  const top=deals[0];
  const fieldStyle={display:"block",fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.muted};
  const inputStyle={display:"block",width:"100%",marginTop:7,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:C.text,background:"#fff"};
  const update=(key,value)=>setDraft(current=>({...current,[key]:value}));
  const submit=async()=>{
    const posted=await postOpportunity(draft);
    if(posted)setDraft({title:"",company:"",type:"Gig",tag:profile?.industry||"Exploring",budget:"",location:"Remote",level:"First step",skills:"",desc:""});
  };
  return <div className="directory-wrap"><section className="market-hero" style={{borderRadius:24,padding:"28px clamp(18px,4vw,38px)",color:"#fff",marginBottom:18,overflow:"hidden",position:"relative"}}><div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-end",flexWrap:"wrap",position:"relative",zIndex:1}}><div style={{maxWidth:720}}><div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",opacity:.74,marginBottom:10}}>Deals</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:42,letterSpacing:0,lineHeight:1.02}}>Opportunity matches built around your first move.</h1><p style={{fontSize:15,lineHeight:1.7,opacity:.78,marginTop:14}}>Jobs, gigs, volunteer roles, internships, collaborations, and first-step openings are ranked by your profile field, goals, location, and what you say you are looking for.</p></div>{top&&<div style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:18,padding:16,minWidth:220}}><div style={{fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:1.2,opacity:.7}}>Strongest overlap</div><div style={{fontSize:28,fontWeight:950,marginTop:4}}>{top.score}%</div><div style={{fontSize:13,opacity:.82,marginTop:4}}>{top.title}</div></div>}</div></section><section className="composer-card" aria-label="Post a job gig or volunteer opportunity" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:20,marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap",marginBottom:16}}><div><div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:7}}>Post an opportunity</div><h2 style={{fontSize:22,lineHeight:1.12,color:C.text}}>Share a job, gig, volunteer role, internship, collab, or first-step opening.</h2></div><Tag label="Member posted" style={{background:C.aLight,color:C.accent}}/></div><div className="opportunity-form-grid" style={{display:"grid",gridTemplateColumns:"1.15fr .85fr .55fr .75fr",gap:10,alignItems:"end"}}><label style={fieldStyle}>Title<input aria-label="Opportunity title" value={draft.title} onChange={e=>update("title",e.target.value)} placeholder="Volunteer mentor, Pop-up helper..." className="if" style={inputStyle}/></label><label style={fieldStyle}>Company or project<input aria-label="Company or project" value={draft.company} onChange={e=>update("company",e.target.value)} placeholder="Your nonprofit, studio, team..." className="if" style={inputStyle}/></label><label style={fieldStyle}>Type<select aria-label="Opportunity type" value={draft.type} onChange={e=>update("type",e.target.value)} className="if" style={inputStyle}><option>Job</option><option>Gig</option><option>Volunteer</option><option>Opportunity</option><option>Internship</option><option>Collab</option></select></label><label style={fieldStyle}>Field<input aria-label="Opportunity field" value={draft.tag} onChange={e=>update("tag",e.target.value)} placeholder="Brand Management" className="if" style={inputStyle}/></label></div><div className="opportunity-form-grid" style={{display:"grid",gridTemplateColumns:".85fr .85fr .85fr 1.45fr",gap:10,alignItems:"end",marginTop:10}}><label style={fieldStyle}>Pay or terms<input aria-label="Pay or terms" value={draft.budget} onChange={e=>update("budget",e.target.value)} placeholder="Volunteer, paid, stipend..." className="if" style={inputStyle}/></label><label style={fieldStyle}>Location<input aria-label="Opportunity location" value={draft.location} onChange={e=>update("location",e.target.value)} placeholder="Remote, Local, Hybrid..." className="if" style={inputStyle}/></label><label style={fieldStyle}>Level<input aria-label="Opportunity level" value={draft.level} onChange={e=>update("level",e.target.value)} placeholder="Beginner friendly" className="if" style={inputStyle}/></label><label style={fieldStyle}>Skills<input aria-label="Opportunity skills" value={draft.skills} onChange={e=>update("skills",e.target.value)} placeholder="community, events, design, research" className="if" style={inputStyle}/></label></div><label style={{...fieldStyle,marginTop:10}}>Description<textarea aria-label="Opportunity description" value={draft.desc} onChange={e=>update("desc",e.target.value)} placeholder="What will this person do, who is it best for, and how should they get started?" className="if" style={{...inputStyle,minHeight:94,resize:"vertical",lineHeight:1.55}}/></label><div className="opportunity-form-actions" style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginTop:14,flexWrap:"wrap"}}><p style={{fontSize:12,color:C.dim,lineHeight:1.5,maxWidth:620}}>Posted opportunities appear in Deals and are matched to members by field, skills, location, level, and profile goals.</p><GBtn onClick={submit} style={{display:"inline-flex",alignItems:"center",gap:8}}><Icon name="briefcase" size={16} color="#fff"/> Post opportunity</GBtn></div></section><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:16}}><div style={{display:"flex",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:6}}>{[["matched","Relevant"],["saved","Saved"]].map(([id,label])=><button key={id} onClick={()=>setMode(id)} className="bs" style={{border:"none",borderRadius:10,padding:"9px 13px",fontSize:13,fontWeight:900,background:mode===id?C.accent:"transparent",color:mode===id?"#fff":C.muted}}>{label}</button>)}</div><div className="filter-row" style={{display:"flex",gap:8,flexWrap:"wrap"}}>{types.map(type=><button key={type} onClick={()=>setKind(type)} className="bs" style={{background:kind===type?C.aLight:"#fff",color:kind===type?C.accent:C.muted,border:`1px solid ${kind===type?C.aSoft:C.border}`,borderRadius:999,padding:"8px 13px",fontSize:12,fontWeight:900}}>{type}</button>)}</div></div>{visible.length===0?<EmptyState title={mode==="saved"?"No saved opportunities yet":kind==="Volunteer"?"No volunteer openings yet":"No matches yet"} text={mode==="saved"?"Save a few listings and they will live here.":kind==="Volunteer"?"Volunteer roles posted by members will appear here.":"Add more to your profile so fear can tune your opportunity feed."}/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>{visible.map(deal=><article key={deal.id} className="ch" style={{...cardStyle,padding:0,borderColor:deal.userPosted?C.aSoft:C.border}}><div style={{padding:20,borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div style={{minWidth:0}}><div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}><IT label={deal.tag}/><Tag label={deal.type} style={{background:C.aLight,color:C.accent}}/>{deal.userPosted&&<Tag label="Posted by member" style={{background:C.aLight,color:C.accent}}/>}</div><h2 style={{fontSize:21,lineHeight:1.12,color:C.text,overflowWrap:"anywhere"}}>{deal.title}</h2><div style={{fontSize:12,color:C.dim,marginTop:7}}>{deal.company} · {deal.budget} · {deal.location}</div>{deal.postedBy&&<div style={{fontSize:12,color:C.muted,marginTop:6}}>Posted by {deal.postedBy}{deal.postedByHandle?` · ${deal.postedByHandle}`:""}</div>}</div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:22,fontWeight:950,color:C.accent,lineHeight:1}}>{deal.score}%</div><div style={{fontSize:10,color:C.muted,fontWeight:900,textTransform:"uppercase",marginTop:4}}>profile overlap</div></div></div><div className="match-meter" style={{marginTop:16}}><span style={{width:`${deal.score}%`}}/></div></div><div style={{padding:20}}><p style={{fontSize:14,color:C.tSoft,lineHeight:1.7}}>{deal.desc}</p><div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:14}}>{(deal.reasons?.length?deal.reasons:["useful first-step signal"]).map(reason=><span key={reason} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:999,padding:"7px 9px",fontSize:11,fontWeight:800,color:C.muted}}>{reason}</span>)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:18,flexWrap:"wrap"}}><GBtn sm onClick={()=>signalInterest(deal)} style={{display:"inline-flex",alignItems:"center",gap:7}}><Icon name="send" size={14} color="#fff"/> I'm interested</GBtn><button onClick={()=>toggleSave(deal.id)} className="bs" style={{background:deal.saved?C.aLight:"#fff",border:`1px solid ${deal.saved?C.aSoft:C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:900,color:deal.saved?C.accent:C.text,display:"inline-flex",gap:7,alignItems:"center"}}><Icon name="bookmark" size={15} color="currentColor" filled={deal.saved}/>{deal.saved?"Saved":"Save"}</button></div></div></article>)}</div>}</div>;
}
function SettingsView({profile,setView,setEditProfile,updateProfilePrivacy,accessRequests,reviewAccessRequest,openProfile,openBoard,interfaceSettings,setInterfaceSettings,accessibility,setAccessibility,themeMode,setThemeMode,cookieConsent,setCookieConsent,onOpenPanel,onDeleteAccount,inviteFriend,signOut}){
  const isPrivate=(profile.privacy||"public")==="private";
  const incoming=Array.isArray(accessRequests?.incoming)?accessRequests.incoming:[];
  const pending=incoming.filter(request=>request.status==="pending");
  const settingCard=(title,copy,children)=>(
    <section className="ch" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,minWidth:0}}>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:20,lineHeight:1.15,color:C.text,marginBottom:6}}>{title}</h2>
        {copy&&<p style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{copy}</p>}
      </div>
      {children}
    </section>
  );
  const switchRow=(checked,onClick,title,copy,icon="check")=>(
    <button role="switch" aria-checked={checked} onClick={onClick} className="bs" style={{width:"100%",display:"flex",gap:13,alignItems:"center",textAlign:"left",background:checked?C.aLight:"#fff",border:`1px solid ${checked?C.aSoft:C.border}`,borderRadius:14,padding:14,marginBottom:10}}>
      <span style={{width:40,height:40,borderRadius:13,background:checked?C.accent:C.bg,color:checked?"#fff":C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={icon} size={18} color="currentColor"/></span>
      <span style={{flex:1,minWidth:0}}><b style={{display:"block",color:C.text,fontSize:14,marginBottom:3}}>{title}</b><span style={{display:"block",color:C.muted,fontSize:12,lineHeight:1.45}}>{copy}</span></span>
      <span aria-hidden="true" style={{width:44,height:24,borderRadius:999,background:checked?C.accent:"#D7DCE5",position:"relative",flexShrink:0}}><span style={{position:"absolute",top:3,left:checked?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .15s"}}/></span>
    </button>
  );
  const segmented=(label,value,options,onChange)=>(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:900,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{label}</div>
      <div style={{display:"flex",gap:6,background:C.bg,border:`1px solid ${C.border}`,borderRadius:13,padding:5,flexWrap:"wrap"}}>
        {options.map(option=><button key={option.value} onClick={()=>onChange(option.value)} className="bs" style={{flex:"1 1 120px",border:"none",borderRadius:9,padding:"9px 10px",fontSize:12,fontWeight:900,color:value===option.value?"#fff":C.muted,background:value===option.value?C.accent:"transparent"}}>{option.label}</button>)}
      </div>
    </div>
  );
  return <div className="directory-wrap" style={{maxWidth:1040}}>
    <div className="view-local-heading" style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"end",flexWrap:"wrap",marginBottom:22}}>
      <div>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Settings</div>
        <h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:42,letterSpacing:0,lineHeight:1.02,color:C.text}}>Personalize fear.social.</h1>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.7,marginTop:10,maxWidth:700}}>Control how the app feels, how your profile appears, who can see private details, and where legal and account tools live.</p>
      </div>
      <button onClick={()=>setView("profile")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontSize:13,fontWeight:900,color:C.text}}>View profile</button>
    </div>
    <div className="settings-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16}}>
      <section className="ch" style={{gridColumn:"1/-1",background:GR2,border:"1px solid rgba(22,199,78,.24)",borderRadius:18,padding:20,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 420px"}}><div style={{fontSize:10,fontWeight:950,letterSpacing:1.7,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Coming with FEAR Pro</div><h2 style={{fontSize:22,lineHeight:1.1,marginBottom:7}}>The FEAR Pro launch</h2><p style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,.6)",maxWidth:660}}>Get guided mentor introductions, fear.club gatherings, and tools for your brand, lifestyle, production, AI ideas, and market awareness.</p></div>
        <button onClick={openBoard} className="bs" style={{background:"#fff",color:C.text,border:"none",borderRadius:999,padding:"11px 16px",fontSize:13,fontWeight:950}}>Preview FEAR Pro</button>
      </section>
      {settingCard("Appearance","Change the theme and readability settings for this browser.",<>
        {switchRow(themeMode==="dark",()=>setThemeMode(themeMode==="dark"?"light":"dark"),themeMode==="dark"?"Dark mode":"Light mode","Switch the full interface between dark and light mode.",themeMode==="dark"?"moon":"sun")}
        {switchRow(Boolean(accessibility.largeText),()=>setAccessibility(s=>({...s,largeText:!s.largeText})),"Larger text","Increase text and form control sizing across the app.","eye")}
        {switchRow(Boolean(accessibility.highContrast),()=>setAccessibility(s=>({...s,highContrast:!s.highContrast})),"Higher contrast","Boost color contrast for easier scanning.","check")}
        {switchRow(Boolean(accessibility.reduceMotion),()=>setAccessibility(s=>({...s,reduceMotion:!s.reduceMotion})),"Reduce motion","Turn off animated transitions where possible.","zap")}
      </>)}
      {settingCard("Layout","Choose how much UI you want on screen while you work.",<>
        {segmented("Layout format",interfaceSettings.layout||"comfortable",[{value:"comfortable",label:"Comfortable"},{value:"focus",label:"Focus"}],layout=>setInterfaceSettings(s=>({...s,layout,rightRail:layout==="focus"?false:s.rightRail})))}
        {segmented("Density",interfaceSettings.density||"standard",[{value:"standard",label:"Standard"},{value:"compact",label:"Compact"}],density=>setInterfaceSettings(s=>({...s,density})))}
        {switchRow(interfaceSettings.rightRail!==false,()=>setInterfaceSettings(s=>({...s,rightRail:s.rightRail===false})), "Right rail on feed","Show new people and FEAR Pro previews beside the feed on desktop.","network")}
      </>)}
      {settingCard("Profile and privacy","Control your public presence and private-profile access.",<>
        {switchRow(!isPrivate,()=>updateProfilePrivacy(isPrivate?"public":"private"),isPrivate?"Private profile":"Public profile",isPrivate?"People must request access before they can see full profile details and posts.":"Your profile details and posts can be discovered by other members.","lock")}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
          <GBtn sm onClick={()=>setEditProfile(true)} style={{display:"inline-flex",alignItems:"center",gap:7}}><Icon name="user" size={14} color="#fff"/> Edit profile</GBtn>
          <button onClick={()=>setView("profile")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontWeight:900,color:C.text}}>Profile dashboard</button>
        </div>
        <div style={{marginTop:18,borderTop:`1px solid ${C.border}`,paddingTop:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12}}>
            <b style={{fontSize:15,color:C.text}}>Access requests</b>
            <span style={{background:pending.length?C.aLight:C.bg,color:pending.length?C.accent:C.muted,border:`1px solid ${pending.length?C.aSoft:C.border}`,borderRadius:999,padding:"5px 9px",fontSize:11,fontWeight:900}}>{pending.length} pending</span>
          </div>
          {incoming.length===0?<MiniEmpty text="Private profile access requests will appear here."/>:<div style={{display:"grid",gap:10}}>{incoming.slice(0,6).map(request=><div key={request.id} style={{display:"flex",gap:10,alignItems:"center",background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:12}}>
            <button onClick={()=>openProfile(request.requester)} aria-label={`Open ${request.requester.name}`} style={{background:"none",border:"none",padding:0}}><Av i={request.requester.av} src={request.requester.avatarUrl} size={40}/></button>
            <div style={{flex:1,minWidth:0}}><b style={{display:"block",fontSize:13,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{request.requester.name}</b><span style={{display:"block",fontSize:12,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{request.requester.handle} · {request.status}</span></div>
            {request.status==="pending"?<div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><GBtn sm onClick={()=>reviewAccessRequest(request.id,"approve")}>Approve</GBtn><button onClick={()=>reviewAccessRequest(request.id,"deny")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 10px",fontSize:12,fontWeight:900,color:C.coral}}>Deny</button></div>:<span style={{fontSize:11,fontWeight:900,color:C.muted,textTransform:"capitalize"}}>{request.status}</span>}
          </div>)}</div>}
        </div>
      </>)}
      {settingCard("Legal and data","Quick access to privacy, terms, cookies, and safety documents.",<>
        <div style={{display:"grid",gap:9}}>
          <button onClick={()=>onOpenPanel?.("privacy")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.text}}>Privacy Policy</button>
          <button onClick={()=>onOpenPanel?.("terms")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.text}}>Terms and Conditions</button>
          <button onClick={()=>onOpenPanel?.("cookies")} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.text}}>Cookie settings</button>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:14}}>
          <b style={{fontSize:14,color:C.text}}>Cookie preference</b>
          <p style={{fontSize:12,color:C.muted,lineHeight:1.55,margin:"5px 0 10px"}}>Current choice: {cookieConsent.choice||"not selected"}. Essential storage keeps login and preferences working.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>setCookieConsent({choice:"essential",analytics:false,marketing:false})} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,color:C.text}}>Essential only</button>
            <button onClick={()=>setCookieConsent({choice:"all",analytics:true,marketing:true})} className="bs" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,color:C.accent}}>Allow optional</button>
          </div>
        </div>
      </>)}
      {settingCard("Account","Session and account controls.",<>
        <div style={{display:"grid",gap:10}}>
          <button onClick={inviteFriend} className="bs" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.accent,display:"flex",alignItems:"center",gap:10}}><Icon name="send" size={17} color="currentColor"/> Invite a friend</button>
          <button onClick={signOut} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.text}}>Sign out</button>
          <button onClick={onDeleteAccount} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:13,textAlign:"left",fontWeight:900,color:C.coral}}>Delete account</button>
        </div>
        <p style={{fontSize:12,color:C.muted,lineHeight:1.6,marginTop:12}}>Deleting your account removes profile data, posts, messages, follows, media, and sessions where feasible.</p>
      </>)}
    </div>
  </div>;
}

function NotificationsView({notifications,markRead,openProfile}){
  const unread=notifications.filter(n=>!n.read).length;
  return <div className="directory-wrap" style={{maxWidth:760}}><div className="view-local-heading" style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:14,marginBottom:22}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.accent,marginBottom:8}}>Activity</div><h1 className="directory-title" style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:0,lineHeight:1.05,color:C.text}}>Notifications</h1></div>{unread>0&&<button onClick={()=>markRead()} className="bs" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"9px 13px",fontSize:12,fontWeight:900,color:C.accent}}>Mark all read</button>}</div><div role="status" aria-live="polite" style={{position:"absolute",left:-9999}}>{unread} unread notifications</div>{notifications.length===0?<EmptyState title="No notifications yet" text="New follows, comments, and messages will appear here."/>:<div style={{display:"grid",gap:10}}>{notifications.map(n=><div key={n.id} className={n.read?"":"activity-unread"} style={{background:C.card,border:`1px solid ${n.read?C.border:C.aSoft}`,borderRadius:18,padding:16,display:"flex",gap:13,alignItems:"center",minWidth:0}}><button onClick={()=>n.actor&&openProfile(n.actor,"notifications")} aria-label={n.actor?`Open ${n.actor.name}`:"Notification"} style={{background:"none",border:"none",padding:0}}><Av i={n.actor?.av||"FS"} src={n.actor?.avatarUrl} size={44} grad={!n.actor}/></button><div style={{flex:1,minWidth:0}}><div style={{fontWeight:n.read?700:900,color:C.text,lineHeight:1.35,overflowWrap:"anywhere"}}>{n.body}</div><div style={{fontSize:12,color:C.dim,marginTop:4,textTransform:"capitalize"}}>{n.type} · {n.time} ago</div></div>{!n.read&&<button onClick={()=>markRead(n.id)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"8px 10px",fontSize:12,fontWeight:900,color:C.text,flexShrink:0}}>Read</button>}</div>)}</div>}</div>;
}
function MessagesView({messages,setMessages,sendMessage,deleteChat,editMessage,deleteMessage,unsendMessage,activeConversationId,onBlockUser,onReport,profileId,syncMessageText}){
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
      e2eePublicKey:source.e2eePublicKey||null,
      thread:Array.isArray(source.thread)?source.thread.filter(Boolean):[],
      draft:source.draft||"",
    };
  });
  const [active,setActive]=useState(safeMessages[0]?.id);
  const [decrypted,setDecrypted]=useState({});
  const [editing,setEditing]=useState(null);
  const syncedMessageIdsRef=useRef(new Set());
  useEffect(()=>{if(activeConversationId&&safeMessages.some(m=>m.id===activeConversationId))setActive(activeConversationId);},[activeConversationId,messages]);
  useEffect(()=>{if(!safeMessages.some(m=>m.id===active))setActive(safeMessages[0]?.id);},[active,messages]);
  useEffect(()=>{
    if(!profileId)return;
    let cancelled=false;
    (async()=>{
      const next={};
      for(const thread of safeMessages){
        for(let i=0;i<thread.thread.length;i+=1){
          const msg=thread.thread[i];
          const raw=typeof msg==="string"?msg:msg?.text;
          if(!parseE2EEPayload(raw))continue;
          const key=typeof msg==="string"?`${thread.id}-${i}`:msg.id||`${thread.id}-${i}`;
          const readable=await decryptE2EEMessage(profileId,msg,thread);
          next[key]=readable;
          const messageId=typeof msg==="object"?msg?.id:"";
          if(messageId&&readable&&!readable.startsWith("Encrypted message unavailable")&&!readable.startsWith("Decrypting")&&!syncedMessageIdsRef.current.has(messageId)){
            syncedMessageIdsRef.current.add(messageId);
            syncMessageText?.(messageId,readable).catch(()=>syncedMessageIdsRef.current.delete(messageId));
          }
        }
      }
      if(!cancelled)setDecrypted(current=>({...current,...next}));
    })();
    return()=>{cancelled=true;};
  },[messages,profileId,syncMessageText]);
  const thread=safeMessages.find(m=>m.id===active)||safeMessages[0];
  const messageKey=(msg,threadId,i)=>typeof msg==="string"?`${threadId}-${i}`:msg.id||`${threadId}-${i}`;
  const messageText=(msg,threadId="",i=0)=>{
    const raw=typeof msg==="string"?msg:String(msg?.text||"");
    if(parseE2EEPayload(raw))return decrypted[messageKey(msg,threadId,i)]||"Decrypting encrypted message...";
    return raw;
  };
  const messageAuthor=msg=>typeof msg==="string"?"them":msg?.author||"them";
  const canEditMessage=(msg,text)=>messageAuthor(msg)==="you"&&typeof msg==="object"&&msg.id&&!String(msg.id).startsWith("local-message-")&&text&&!text.startsWith("Decrypting")&&!text.startsWith("Encrypted message unavailable");
  const saveMessageEdit=async(threadId,msg)=>{
    if(!editing||editing.id!==msg.id)return;
    await editMessage?.(threadId,msg.id,editing.text);
    setEditing(null);
  };
  if(safeMessages.length===0)return <div className="directory-wrap"><EmptyState title="Your inbox is ready" text="Start from a profile when you find someone worth talking to. Your conversations will stay available across your devices."/></div>;
  return (
    <div className="directory-wrap">
      <div className="dm-e2ee-note" style={{background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:14,padding:"10px 12px",marginBottom:16,color:C.accent,fontSize:12,fontWeight:900,lineHeight:1.45}}>DMs now sync through your fear.social account, so your conversations are available when you log in from your phone, laptop, or another browser.</div>
      <div className="messages-grid" style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:18,minHeight:"70vh"}}>
        <div className="message-list" role="tablist" aria-label="Message conversations" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:12}}>
          {safeMessages.map(m=>(
            <button key={m.id} role="tab" aria-selected={active===m.id} data-active={active===m.id?"true":"false"} onClick={()=>setActive(m.id)} className="uh dm-thread-button" style={{width:"100%",display:"flex",gap:12,alignItems:"center",padding:12,border:"1px solid transparent",background:active===m.id?C.aLight:"transparent",borderRadius:12,textAlign:"left"}}>
              <Av i={m.av} src={m.avatarUrl} size={40} online={m.online}/>
              <div className="dm-thread-copy" style={{minWidth:0}}>
                <div className="dm-thread-name" style={{fontWeight:900,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}><NameWithVerified name={m.name} person={m} size={14}/></div>
                <div className="dm-thread-preview" style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{messageText(m.thread[m.thread.length-1],m.id,(m.thread.length||1)-1)||"Start the conversation"}</div>
              </div>
            </button>
          ))}
        </div>
        {thread&&(
          <div className="message-panel" role="tabpanel" aria-label={`Conversation with ${thread.name}`} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:20,display:"flex",flexDirection:"column"}}>
            <div className="message-panel-header" style={{display:"flex",gap:12,alignItems:"center",paddingBottom:14,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap"}}>
              <Av i={thread.av} src={thread.avatarUrl} size={44} online={thread.online}/>
              <div style={{flex:1,minWidth:0}}>
                <b><NameWithVerified name={thread.name} person={thread} size={15}/></b>
                <div style={{fontSize:12,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{thread.online?"Online now":thread.handle||"Direct message"}</div>
              </div>
              <div className="message-panel-actions" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <button onClick={()=>deleteChat?.(thread.id)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 10px",fontSize:12,fontWeight:900,color:C.coral}}>Delete chat</button>
                <button onClick={()=>onReport?.("chat_thread",thread.id,`chat with ${thread.name}`)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 10px",fontSize:12,fontWeight:900,color:C.muted}}>Report chat</button>
                {thread.userId&&<button onClick={()=>onBlockUser?.(thread)} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 10px",fontSize:12,fontWeight:900,color:C.coral}}>Block</button>}
              </div>
            </div>
            <div className="message-feed" aria-live="polite" style={{flex:1,padding:"20px 0",display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
              {thread.thread.length===0&&<div style={{alignSelf:"center",textAlign:"center",color:C.muted,fontSize:14,marginTop:40}}>Say hello and make the first step easy.</div>}
              {thread.thread.map((msg,i)=>{
                const mine=messageAuthor(msg)==="you";
                const messageId=messageKey(msg,thread.id,i);
                const text=messageText(msg,thread.id,i);
                const editable=canEditMessage(msg,text);
                const persistent=typeof msg==="object"&&msg.id&&!String(msg.id).startsWith("local-message-");
                const isEditing=editing?.id===messageId;
                return (
                  <div key={messageId} className="message-row" style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"70%",display:"grid",gap:4,justifyItems:mine?"end":"start"}}>
                    <div className="message-bubble" style={{background:mine?C.accent:C.bg,color:mine?"#fff":C.text,borderRadius:14,padding:"10px 13px",fontSize:14,lineHeight:1.5,overflowWrap:"anywhere",minWidth:isEditing?260:0}}>
                      {isEditing?(
                        <div style={{display:"grid",gap:8}}>
                          <textarea aria-label="Edit message" value={editing.text} onChange={e=>setEditing(current=>current?.id===messageId?{...current,text:e.target.value}:current)} rows={3} className="if" style={{width:"100%",resize:"vertical",border:`1px solid ${C.aSoft}`,borderRadius:10,padding:"9px 10px",fontSize:14,lineHeight:1.4,color:C.text,background:"#fff"}}/>
                          <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                            <button onClick={()=>setEditing(null)} className="bs" style={{background:"transparent",border:"none",padding:"5px 6px",fontSize:11,fontWeight:900,color:C.muted}}>Cancel</button>
                            <button onClick={()=>saveMessageEdit(thread.id,msg)} className="bs" style={{background:"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:900,color:C.accent}}>Save</button>
                          </div>
                        </div>
                      ):(
                        <>
                          {text}
                          {msg?.edited&&<span style={{display:"block",fontSize:10,fontWeight:900,opacity:.72,marginTop:4}}>Edited</span>}
                        </>
                      )}
                    </div>
                    {!isEditing&&<div className="message-actions" style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:mine?"flex-end":"flex-start"}}>
                      {editable&&<button onClick={()=>setEditing({id:messageId,text})} className="bs" style={{background:"transparent",border:"none",padding:"2px 0",fontSize:11,fontWeight:900,color:C.dim}}>Edit</button>}
                      {persistent&&<button onClick={()=>deleteMessage?.(thread.id,messageId)} className="bs" style={{background:"transparent",border:"none",padding:"2px 0",fontSize:11,fontWeight:900,color:C.dim}}>Delete</button>}
                      {mine&&persistent&&<button onClick={()=>unsendMessage?.(thread.id,messageId)} className="bs" style={{background:"transparent",border:"none",padding:"2px 0",fontSize:11,fontWeight:900,color:C.coral}}>Unsend</button>}
                      <button onClick={()=>onReport?.("message",messageId,"message")} className="bs" style={{background:"transparent",border:"none",padding:"2px 0",fontSize:11,fontWeight:900,color:C.dim}}>Report</button>
                    </div>}
                  </div>
                );
              })}
            </div>
            <div className="message-compose" style={{display:"flex",gap:10}}>
              <input aria-label={`Message ${thread.name}`} value={thread.draft||""} onChange={e=>setMessages(ms=>ms.map(m=>m.id===thread.id?{...m,draft:e.target.value}:m))} onKeyDown={e=>e.key==="Enter"&&sendMessage(thread.id)} placeholder={`Message ${thread.name}`} className="if" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",minWidth:0}}/>
              <GBtn onClick={()=>sendMessage(thread.id)} style={{display:"inline-flex",alignItems:"center",gap:8}}><Icon name="send" size={15} color="#fff"/> Send</GBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const ProfileStatButton=({label,value,active,onClick})=>(
  <button onClick={onClick} aria-pressed={active} className="bs profile-stat-button" style={{...cardStyle,padding:18,borderRadius:16,textAlign:"left",background:active?C.aLight:C.card,border:`1px solid ${active?C.aSoft:C.border}`,color:C.text}}>
    <div style={{fontSize:25,fontWeight:900,color:active?C.accent:C.text,lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value}</div>
    <div style={{fontSize:12,color:active?C.accent:C.muted,marginTop:6,fontWeight:900}}>{label}</div>
  </button>
);

function ProfileMetricSection({active,posts=[],people=[],emptyName="this profile",openProfile}){
  if(active==="Posts")return <ProfilePostsSection posts={posts} emptyTitle="No posts yet" emptyText={`${emptyName} has not published any posts yet.`}/>;
  if(active==="Saved")return <ProfilePostsSection posts={posts} emptyTitle="No saved posts yet" emptyText="Saved posts will appear here after you save them from the feed."/>;
  return <section style={{marginTop:18}}><SectionHead eyebrow="Network" title={active} count={`${fmt(people.length)} people`}/>{people.length===0?<EmptyState title={`No ${active.toLowerCase()} yet`} text={`${emptyName} does not have anyone to show here yet.`}/>:<div className="directory-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>{people.map(person=><button key={`${active}-${person.id}`} onClick={()=>openProfile?.(person)} className="ch profile-link" style={{...cardStyle,padding:16,borderRadius:18,textAlign:"left",display:"flex",gap:12,alignItems:"center",minWidth:0}}><Av i={person.av} src={person.avatarUrl} size={44}/><span style={{minWidth:0}}><b style={{display:"block",color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}><NameWithVerified name={person.name} person={person} size={14}/></b><span style={{display:"block",fontSize:12,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:3}}>{[person.handle,person.industry||person.loc].filter(Boolean).join(" · ")}</span></span></button>)}</div>}</section>;
}

const SectionHead=({eyebrow,title,count})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,marginBottom:12,flexWrap:"wrap"}}>
    <div>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:1.8,textTransform:"uppercase",color:C.accent,marginBottom:6}}>{eyebrow}</div>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:30,lineHeight:1.05,letterSpacing:0,color:C.text}}>{title}</h2>
    </div>
    <span style={{background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900}}>{count}</span>
  </div>
);

function ProfilePanel({profile,setEditProfile,onDeleteAccount,stats,posts=[],followers=[],following=[],savedPosts=[],openProfile,initialMetric="Posts"}){
  const normalizedMetric=initialMetric==="RSVPs"?"Posts":initialMetric;
  const [activeMetric,setActiveMetric]=useState(normalizedMetric);
  useEffect(()=>setActiveMetric(initialMetric==="RSVPs"?"Posts":initialMetric),[initialMetric]);
  const profileInitials=(profile.name||"YO").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  const detailRows=[["First step",profile.goal],["Looking for",profile.lookingFor],["Field",profile.industry||"Exploring"]].filter(([,v])=>v);
  const metricPeople={Followers:followers,Following:following};
  const metricPosts={Posts:posts,Saved:savedPosts};
  return <div className="directory-wrap" style={{maxWidth:860}}>
    <div className="profile-hero" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,overflow:"hidden",marginBottom:12,boxShadow:"0 18px 44px rgba(15,23,42,0.04)"}}>
      <div style={{height:146,background:safeImageUrl(profile.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profile.coverUrl)}")`:GR}}/>
      <div style={{padding:"0 28px 26px"}}>
        <div className="profile-hero-row" style={{display:"grid",gridTemplateColumns:"104px minmax(0,1fr) auto",alignItems:"end",gap:18,marginTop:-38}}>
          <Av i={profileInitials} src={profile.avatarUrl} size={104} style={{background:"#fff",color:C.accent,border:"6px solid #fff",boxShadow:"0 12px 28px rgba(15,23,42,0.12)"}}/>
          <div className="profile-hero-copy" style={{minWidth:0,paddingTop:44}}>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:0,overflowWrap:"anywhere",color:C.text,lineHeight:1.02}}><NameWithVerified name={profile.name||"Your Name"} person={profile} size={20} nameStyle={{whiteSpace:"normal",overflow:"visible"}}/></h1>
            <div style={{color:C.muted,overflowWrap:"anywhere",marginTop:7,fontSize:14,fontWeight:700}}>{profileMeta(profile)}</div>
          </div>
          <button onClick={()=>setEditProfile(true)} className="bs profile-edit-button" style={{background:C.accent,color:"#fff",border:"none",borderRadius:999,padding:"11px 17px",fontWeight:900,alignSelf:"center",whiteSpace:"nowrap"}}>Edit profile</button>
        </div>
        {profile.headline&&<div style={{fontSize:16,fontWeight:900,color:C.text,marginTop:18,overflowWrap:"anywhere"}}>{profile.headline}</div>}
        <p style={{marginTop:14,maxWidth:760,lineHeight:1.65,color:C.tSoft,overflowWrap:"anywhere",fontSize:15}}>{profile.bio||"Figuring out what comes next."}</p>
        {profile.website&&<a href={profile.website} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.accent,fontWeight:900,fontSize:13,marginTop:12,textDecoration:"none",overflowWrap:"anywhere"}}><Icon name="link" size={15}/> {profile.website.replace(/^https?:\/\//,"")}</a>}
        <div className="profile-detail-row" style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>{detailRows.map(([k,v])=><span key={k} className="profile-detail-chip" style={{background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}: {v}</span>)}</div>
      </div>
    </div>
    <div className="profile-stats" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>{stats.map(([k,v])=><ProfileStatButton key={k} label={k} value={v} active={activeMetric===k} onClick={()=>setActiveMetric(k)}/>)}</div>
    <ProfileMetricSection active={activeMetric} posts={metricPosts[activeMetric]||[]} people={metricPeople[activeMetric]||[]} emptyName="You" openProfile={openProfile}/>
    <section className="profile-danger-zone" aria-label="Delete account" style={{marginTop:20,background:"#fff",border:`1px solid ${C.border}`,borderRadius:18,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{minWidth:0,maxWidth:560}}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:1.6,textTransform:"uppercase",color:C.coral,marginBottom:6}}>Danger zone</div>
          <h2 style={{fontSize:20,lineHeight:1.15,color:C.text}}>Delete your account</h2>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.6,marginTop:8}}>Permanently removes your profile, posts, messages, follows, group membership, media, and active sessions. This cannot be undone.</p>
        </div>
        <button onClick={onDeleteAccount} className="bs" style={{background:C.coral,color:"#fff",border:"none",borderRadius:999,padding:"11px 15px",fontSize:13,fontWeight:950,whiteSpace:"nowrap"}}>Delete account</button>
      </div>
    </section>
  </div>;
}
function PublicProfilePanel({profile,posts=[],followers=[],following=[],onBack,onConnect,onMessage,onReport,onBlock,openProfile}){
  const [activeMetric,setActiveMetric]=useState("Posts");
  const locked=Boolean(profile.locked);
  const profileInitials=(profile.av||(profile.name||"FO").split(" ").map(s=>s[0]).slice(0,2).join("")).toUpperCase()||"FO";
  const stats=[
    ["Posts",fmt(posts.length)],
    ["Followers",fmt(followers.length||profile.followers)],
    ["Following",fmt(following.length)],
    ["Field",profile.industry||"Exploring"],
  ];
  const details=[["First step",profile.goal],["Looking for",profile.lookingFor],["Headline",profile.headline]].filter(([,v])=>v);
  return <div className="directory-wrap" style={{maxWidth:860}}>
    <button onClick={onBack} className="bs" style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:999,padding:"9px 14px",fontSize:13,fontWeight:900,color:C.text,marginBottom:14,display:"inline-flex",alignItems:"center",gap:8}}><Icon name="close" size={14}/> Back</button>
    <div className="profile-hero" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,overflow:"hidden",marginBottom:12,boxShadow:"0 18px 44px rgba(15,23,42,0.04)"}}>
      <div style={{height:146,background:safeImageUrl(profile.coverUrl)?`center / cover no-repeat url("${safeImageUrl(profile.coverUrl)}")`:GR}}/>
      <div style={{padding:"0 28px 26px"}}>
        <div className="profile-hero-row" style={{display:"grid",gridTemplateColumns:"104px minmax(0,1fr) auto",alignItems:"end",gap:18,marginTop:-38}}>
          <Av i={profileInitials} src={profile.avatarUrl} size={104} style={{background:"#fff",color:C.accent,border:"6px solid #fff",boxShadow:"0 12px 28px rgba(15,23,42,0.12)"}} online/>
          <div className="profile-hero-copy" style={{minWidth:0,paddingTop:44}}>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:0,overflowWrap:"anywhere",color:C.text,lineHeight:1.02}}><NameWithVerified name={profile.name} person={profile} size={20} nameStyle={{whiteSpace:"normal",overflow:"visible"}}/></h1>
            <div style={{color:C.muted,overflowWrap:"anywhere",marginTop:7,fontSize:14,fontWeight:700}}>{profileMeta(profile)}</div>
          </div>
          {profile.id&&<div className="profile-action-row" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end",alignSelf:"center"}}>
            {!locked&&<button onClick={onMessage} className="bs" style={{background:"#fff",color:C.text,border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontWeight:900,display:"inline-flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}><Icon name="send" size={15}/> Message</button>}
            <GBtn onClick={onConnect} disabled={profile.accessStatus==="pending"} style={{background:profile.connected||profile.accessStatus==="pending"?"#fff":GR,color:profile.connected||profile.accessStatus==="pending"?C.accent:"#fff",boxShadow:"none",whiteSpace:"nowrap"}}>{connectionButtonLabel(profile)}</GBtn>
            <button onClick={onReport} className="bs" style={{background:"#fff",color:C.muted,border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontWeight:900,whiteSpace:"nowrap"}}>Report</button>
            <button onClick={onBlock} className="bs" style={{background:"#fff",color:C.coral,border:`1px solid ${C.border}`,borderRadius:999,padding:"10px 14px",fontWeight:900,whiteSpace:"nowrap"}}>Block</button>
          </div>}
        </div>
        {locked&&<div style={{marginTop:18,background:C.aLight,border:`1px solid ${C.aSoft}`,borderRadius:16,padding:16,display:"flex",gap:12,alignItems:"center"}}><span style={{width:42,height:42,borderRadius:14,background:C.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="lock" size={19} color="currentColor"/></span><div><b style={{display:"block",color:C.text,marginBottom:4}}>This profile is private.</b><span style={{fontSize:13,color:C.muted,lineHeight:1.5}}>Request access to see full profile details, posts, and activity after this member approves you.</span></div></div>}
        {profile.headline&&<div style={{fontSize:16,fontWeight:900,color:C.text,marginTop:18,overflowWrap:"anywhere"}}>{profile.headline}</div>}
        <p style={{marginTop:14,maxWidth:760,lineHeight:1.65,color:C.tSoft,overflowWrap:"anywhere",fontSize:15}}>{profile.bio}</p>
        {profile.website&&<a href={profile.website} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.accent,fontWeight:900,fontSize:13,marginTop:12,textDecoration:"none",overflowWrap:"anywhere"}}><Icon name="link" size={15}/> {profile.website.replace(/^https?:\/\//,"")}</a>}
        <div className="profile-detail-row" style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>{details.map(([k,v])=><span key={k} className="profile-detail-chip" style={{background:C.aLight,color:C.accent,border:`1px solid ${C.aSoft}`,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:900,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}: {v}</span>)}</div>
      </div>
    </div>
    <div className="profile-stats" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>{stats.map(([k,v])=><ProfileStatButton key={k} label={k} value={v} active={activeMetric===k} onClick={()=>setActiveMetric(k)}/>)}</div>
    {locked?<EmptyState title="Private profile" text="Posts and activity will appear after this member approves your access request."/>:activeMetric==="Field"?<section style={{marginTop:18}}><SectionHead eyebrow="Profile" title="Field" count={profile.industry||"Exploring"}/><div style={{...cardStyle,padding:20,borderRadius:18}}><IT label={profile.industry||"Exploring"}/><p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginTop:12}}>This profile is currently building around {profile.industry||"Exploring"}.</p></div></section>:<ProfileMetricSection active={activeMetric} posts={posts} people={activeMetric==="Followers"?followers:following} emptyName={profile.name||"This member"} openProfile={openProfile}/>}
  </div>;
}
function ProfilePostsSection({posts=[],emptyTitle,emptyText}){
  const safePosts=Array.isArray(posts)?posts:[];
  return <section aria-label="Profile posts" style={{marginTop:18}}>
    <SectionHead eyebrow="Profile" title="Posts" count={`${fmt(safePosts.length)} posts`}/>
    {safePosts.length===0?<EmptyState title={emptyTitle} text={emptyText}/>:<div style={{display:"grid",gap:12}}>{safePosts.map(post=><article key={post.id} className="ch post-card" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden"}}>
      <div style={{padding:20}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,minWidth:0}}>
          <Av i={post.av} src={post.avatarUrl} size={44}/>
          <div style={{minWidth:0,flex:1}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:C.text,minWidth:0}}><NameWithVerified name={post.user} person={post} size={15}/></b><Tag label={post.type||"Update"} style={{background:C.aLight,color:C.accent}}/><IT label={post.tag}/></div>
            <div style={{fontSize:12,color:C.dim,marginTop:2}}>{post.handle} · {post.time} ago{post.edited?" · edited":""}</div>
          </div>
        </div>
        {post.content&&<p style={{fontSize:15,color:C.tSoft,lineHeight:1.75,whiteSpace:["Reel","Daily Drop"].includes(post.type)?"pre-line":"normal",overflowWrap:"anywhere"}}>{post.content}</p>}
        <OfficialReelCard post={post}/>
        <MediaPreviewGrid media={post.media}/>
      </div>
      <div className="post-actions" style={{borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",gap:16,alignItems:"center",color:C.muted,fontSize:13,fontWeight:900}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:6}}><Icon name="heart" size={17} color="currentColor" filled={post.liked}/> {fmt(post.likes||0)}</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:6}}><Icon name="comment" size={17} color="currentColor"/> {fmt((post.comments||[]).length)}</span>
        {post.saved&&<span style={{display:"inline-flex",alignItems:"center",gap:6,marginLeft:"auto",color:C.accent}}><Icon name="bookmark" size={17} color="currentColor" filled/> Saved</span>}
      </div>
    </article>)}</div>}
  </section>;
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
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18}}>Last updated July 13, 2026. These Terms govern access to and use of fear.social. They are a practical operating baseline and should be reviewed by legal counsel before broad public launch.</p>
      {section("Acceptance of Terms and Community Rules","By creating an account, checking the agreement box, accessing the platform, posting, commenting, messaging, uploading media, or using any fear.social feature, you agree to these Terms, the Privacy Policy, and all community and safety rules shown in the product. You explicitly agree not to post, upload, message, or promote abusive, hateful, harassing, threatening, sexually explicit, exploitative, illegal, fraudulent, or otherwise objectionable content. If you do not agree, do not create an account or use the service.")}
      {section("Purpose of the Platform","fear.social is designed to help people take practical first steps into careers, projects, networking, mentorship, professional collaboration, and the future they want to build. The service may include profiles, posts, comments, messaging, notifications, directories, events, rooms, opportunities, and future paid tools.")}
      {section("Eligibility and COPPA","You must be legally able to agree to these Terms. fear.social is not directed to children under 13, and children under 13 may not create accounts or submit personal information. If we learn that a child under 13 provided personal information without required verifiable parental consent, we may close the account and delete the information. If you are under the age of majority where you live, use the service only with permission from a parent or guardian.")}
      {section("Accounts and Security","You are responsible for accurate account information, keeping your password secure, and activity that happens through your account. Do not impersonate anyone, create misleading accounts, sell or transfer accounts without permission, or use another person's account. Notify contact@fear.social if you believe your account has been compromised.")}
      {section("User Content and License","You keep ownership of content you post, upload, message, or submit, including text, profile details, photos, videos, comments, opportunities, group announcements, and direct messages. You grant fear.social a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, display, process, transmit, adapt for formatting, and distribute that content as needed to operate, improve, protect, and promote the service. You represent that you have the rights needed to share your content and that your content does not violate another person's privacy, publicity, copyright, trademark, or other rights.")}
      {section("Platform Intellectual Property","fear.social owns the platform code, product design, software, interface, databases, workflows, copy, branding, logos, trade dress, and other platform materials except user content and third-party materials. The fear.social name, logo, and marks should be protected through trademark filings and brand usage controls. You may not copy, modify, reverse engineer, sell, scrape, frame, or present fear.social platform materials, branding, or code as your own without written permission.")}
      {section("Copyright, Trademark, and IP Complaints","If you believe content on fear.social infringes your copyright, trademark, privacy, publicity, or other rights, contact contact@fear.social with the specific URL or content, your contact information, proof of rights, and a statement explaining the issue. For copyright notices, include enough information for us to identify the copyrighted work and the allegedly infringing material, a good-faith statement, an accuracy statement, and your physical or electronic signature. We may remove or restrict disputed content, notify the user, preserve records, terminate repeat infringers, or request more information before acting.")}
      {section("Direct Messages and Communications","Direct messages are part of the service and are stored so conversations can be delivered and synced across browsers and devices when you log in. Message text is stored for conversation delivery, moderation, abuse prevention, account support, and product reliability. Some older messages may still contain legacy browser-encrypted payloads; when a participant's device can decrypt one, fear.social may save a synced readable copy so the conversation remains available on that user's other devices. Do not use messages for harassment, spam, scams, unlawful offers, or unwanted solicitation.")}
      {section("Community Conduct","Do not harass, threaten, exploit, spam, deceive, discriminate against, or abuse other users. Do not post or send content that is hateful, sexually exploitative, pornographic, violent, illegal, invasive of privacy, infringing, defamatory, malicious, fraudulent, predatory, or designed to manipulate users or the platform. Do not post another person's private information, intimate imagery, financial information, credentials, or content involving minors in an unsafe or exploitative way.")}
      {section("Prohibited Uses and Content","You may not scrape the service, attack the infrastructure, bypass security, upload malware, reverse engineer non-public systems, automate abusive activity, interfere with other users, misrepresent business opportunities, or use fear.social for unlawful, fraudulent, exploitative, abusive, hateful, threatening, sexually explicit, harassing, spammy, or harmful purposes. Content that targets protected classes, encourages self-harm, threatens violence, sexually exploits anyone, doxxes users, impersonates others, or attempts to evade moderation may be removed and may result in account limits or bans.")}
      {section("Security Testing and Reports","If you believe you found a vulnerability, report it to contact@fear.social with steps to reproduce, affected URLs, timestamps, and any request IDs. Do not access other users' data, run denial-of-service testing, spam the service, or publicly disclose an issue before we have had a reasonable chance to investigate and fix it.")}
      {section("Content Filtering, Reports, Blocks, and 24-Hour Review","fear.social may use automated filters and manual review queues to catch and hide highly objectionable content before or shortly after it goes live. Users can report posts, comments, media, profiles, messages, groups, opportunities, or other content that may violate these Terms. Users can block abusive users; blocking hides that user's historical and future posts and comments from the blocking user's feed where technically feasible. Open reports are routed to a moderation queue intended for review and action within 24 hours. We may remove content, limit distribution, suspend accounts, ban users, preserve evidence, contact affected users, notify service providers, or report matters to law enforcement when appropriate. Reporting content does not guarantee removal, and not reporting content does not mean fear.social endorses it.")}
      {section("Opportunities and User Interactions","Users are responsible for evaluating collaborators, mentors, jobs, gigs, investments, services, advice, and opportunities they discover through fear.social. We do not guarantee any user's identity, qualifications, results, funding, employment, partnership, or career or business outcome.")}
      {section("No Professional Advice","fear.social does not provide legal, financial, tax, investment, medical, employment, or other professional advice. Content on the platform is for general community and informational purposes. Verify important decisions with qualified professionals.")}
      {section("Payments and Future Paid Plans","Some features may later require payment, subscription, checkout, or separate terms. fear. board and planned modules such as fear.agency, fear.style, fear.prod, fearai, and fear.finance are product previews and are not currently available unless the service clearly says otherwise. Names, features, pricing, billing cycles, refunds, trials, plan limits, and availability may change before or after launch. Final paid terms and charges will be presented before purchase.")}
      {section("Email, Verification, and Notifications","By signing up, you agree that fear.social may send verification, security, account, signup, transactional, and service-related emails to the email address on your account, including from contact@fear.social. You may also receive in-app notifications for follows, messages, comments, account activity, and platform updates.")}
      {section("Privacy and Data","Your use of fear.social is also governed by the Privacy Policy. The platform may collect account details, profile information, posts, messages, comments, activity data, device/session data, and other information needed to provide and secure the service.")}
      {section("Moderation, Bans, and Section 230","fear.social hosts user-generated content and may moderate in good faith. We may remove content, limit visibility, suspend features, ban users, revoke access, delete accounts, preserve evidence, or report activity when we believe it is necessary to protect users, comply with law, enforce these Terms, respond to complaints, or maintain platform integrity. Under laws such as 47 U.S.C. § 230, platforms may receive protection from being treated as the publisher or speaker of third-party user content and may receive protection for good-faith restriction of objectionable material. These Terms do not waive any protections, defenses, immunities, safe harbors, or limitations available to fear.social.")}
      {section("Third-Party Links and Services","The platform may link to third-party websites, tools, profiles, payment systems, or services. fear.social is not responsible for third-party content, policies, availability, security, or transactions. Use third-party services at your own risk.")}
      {section("Service Changes and Availability","fear.social is an evolving product. Features may be changed, limited, paused, removed, or unavailable. Beta features may contain errors or downtime. We do not guarantee uninterrupted access, message delivery timing, data availability, or that all features will remain free or unchanged.")}
      {section("Disclaimers","The service is provided as is and as available, without warranties of any kind to the fullest extent permitted by law. fear.social does not guarantee business success, employment, funding, user behavior, opportunity quality, identity verification, message delivery, uninterrupted access, or the accuracy, safety, legality, or usefulness of user-generated content.")}
      {section("Limitation of Liability","To the fullest extent permitted by law, fear.social and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, lost profits, lost opportunities, lost data, reputational harm, user conduct, third-party content, or harm arising from use of or inability to use the service. Where liability cannot be excluded, liability is limited to the maximum extent allowed by applicable law.")}
      {section("Indemnity","You agree to defend, indemnify, and hold harmless fear.social and its operators from claims, damages, liabilities, losses, and expenses arising from your content, your use of the service, your violation of these Terms, or your violation of another person's rights.")}
      {section("Disputes and Governing Law","Contact contact@fear.social first so we can try to resolve disputes informally. To the fullest extent permitted by law, disputes will be handled individually rather than as a class or representative action, and you agree to the exclusive jurisdiction and venue of courts located in the United States unless a different venue is required by applicable consumer law. Some jurisdictions do not allow certain dispute, warranty, or liability limits, so some provisions may not apply to you.")}
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
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18}}>Last updated July 13, 2026. This policy describes how fear.social collects, uses, stores, shares, and protects information. It is a practical baseline informed by privacy laws such as the California Consumer Privacy Act as amended by the CPRA, and should be reviewed by legal counsel before broad public launch.</p>
      {section("Information We Collect","When someone signs up, joins the waitlist, posts, comments, messages, follows users, joins groups, posts opportunities, uploads photos or videos, records camera media, RSVPs, requests mentors, or edits a profile, fear.social may collect the information they provide. This can include name, username, email address, password hash, profile details, location text, industry, bio, website links, photos, videos, post text, comments, direct messages, group activity, opportunity listings, notifications, support requests, and account activity. We also collect technical and security information such as session tokens, timestamps, device/browser information, IP-derived security signals, cookie/local-storage preferences, and logs needed to keep the service working.")}
      {section("Sensitive Information","fear.social is not designed to collect government IDs, payment card numbers, health records, precise geolocation, biometric identifiers, or sensitive demographic information. Do not post sensitive personal information in profiles, posts, messages, groups, comments, photos, or videos. If future features require sensitive information, we should provide a separate notice and collect only what is necessary.")}
      {section("How We Use Information","We use information to create and secure accounts, verify email addresses, operate profiles, feeds, posts, media, messages, groups, notifications, opportunities, and search, personalize rankings and recommendations, send requested registration and waitlist notices, prevent spam and abuse, moderate content, investigate reports, improve reliability, respond to user requests, comply with law, and protect users and the platform.")}
      {section("Direct Messages: Storage, Visibility, and Review","Direct messages are stored in fear.social systems so conversations can be delivered, synced, and displayed to conversation participants on any browser or device where they log in. Message text, participants, timestamps, reports, and delivery records may be processed for reliability, moderation, abuse prevention, safety review, support, and legal compliance. Some legacy messages may still have encrypted payloads from an earlier browser-key system; when a participant can decrypt one, a synced readable copy may be saved so the conversation remains available across devices.")}
      {section("Photos, Videos, and Camera Capture","If you upload media or use the in-app camera, your browser may request camera and microphone permission. Captured photos and videos are attached to your post only after you choose to capture and publish them. Media may be stored and displayed in the app as part of your post, profile, message, or other feature. You can delete posts where available or request account deletion by contacting contact@fear.social.")}
      {section("California Privacy Rights","California residents may have rights to know what personal information is collected, access specific pieces of information, delete personal information, correct inaccurate information, opt out of sale or sharing, limit certain uses of sensitive personal information, and avoid discrimination for exercising privacy rights. fear.social does not currently sell personal information or share it for cross-context behavioral advertising. To exercise privacy rights, email contact@fear.social with the request and enough information to verify your account. Some deletion requests may be limited by legal, security, fraud-prevention, backup, dispute, or operational exceptions.")}
      {section("How Users Can Delete or Correct Data","Users can edit profile information in the app, delete their own posts where the feature is available, and delete their account from their profile danger zone. Users can also request access, correction, export, or deletion help by contacting contact@fear.social. We may need to verify identity before fulfilling access, correction, or deletion requests. If an account is deleted, profile content, posts, messages, follows, group membership, media, and active sessions are removed where feasible, but some records may be retained for security, legal compliance, abuse prevention, backups, dispute resolution, or audit purposes.")}
      {section("Cookies and Local Storage","fear.social uses essential local storage and cookies for sign-in state, session continuity, cookie preference storage, accessibility preferences, theme settings, and basic app functionality. Optional analytics or marketing cookies should remain off unless those services are added and consent is collected where required. Browser settings may let you clear local storage, but doing so may sign you out or reset preferences.")}
      {section("Sharing and Processors","Information may be processed by infrastructure and service providers used to run the site, including Cloudflare services for hosting, database, serverless functions, security, and delivery, and email providers used for verification or transactional messages. We may disclose information if required by law, to enforce Terms, to investigate abuse or security issues, to respond to user requests, to protect users or the public, or as part of a merger, acquisition, financing, or business transfer with appropriate protections.")}
      {section("Public Content and Other Users","Profiles, posts, comments, groups, opportunities, follower activity, and other social features may be visible to other users or the public depending on product settings. Direct messages are intended for the conversation participants but may be stored and reviewed when needed for safety, support, abuse prevention, or legal compliance. Do not share information you are not comfortable making available through the service.")}
      {section("Encryption and Security Standards","fear.social uses HTTPS/TLS for data in transit and relies on Cloudflare-hosted infrastructure, database access controls, security headers, email verification, password hashing, session controls, restricted browser permissions, rate limits, and moderation tooling. Direct messages are synced through fear.social systems so users can access conversations across browsers and devices; they are not currently marketed as end-to-end encrypted. Some legacy encrypted DM payloads may remain during transition, but posts, profiles, media, comments, groups, opportunities, notifications, DMs, and metadata should be treated as stored platform data protected by operational security controls rather than device-only E2EE.")}
      {section("Security and Retention","No internet service can guarantee perfect security, so security is maintained as an ongoing process. We retain information as long as needed to operate the service, provide requested features, maintain records, resolve disputes, prevent abuse, comply with law, and protect users and the platform.")}
      {section("Children and COPPA","fear.social is not directed to children under 13 and does not knowingly collect personal information from children under 13. COPPA imposes requirements on online services directed to children under 13 or services with actual knowledge that they collect personal information from children under 13. If we learn that a child under 13 has provided personal information without required verifiable parental consent, we will take steps to delete it. Parents or guardians can contact contact@fear.social to request removal.")}
      {section("Changes and Contact","We may update this Privacy Policy as the product, law, or data practices change. Material updates may be shown in the app or sent by email. Questions, privacy requests, deletion requests, child privacy concerns, or security reports can be sent to contact@fear.social.")}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:24}}>
        <GBtn onClick={onClose}>Done</GBtn>
        <GhostBtn onClick={onOpenAccessibility}>Accessibility settings</GhostBtn>
      </div>
    </ModalShell>
  );
}

function AccessibilityPanel({settings,setSettings,themeMode,setThemeMode,onClose}){
  const toggle=(key)=>setSettings(s=>({...s,[key]:!s[key]}));
  const row=(key,title,text)=>(
    <button role="switch" aria-checked={settings[key]} onClick={()=>toggle(key)} className="bs" style={{width:"100%",display:"flex",alignItems:"center",gap:14,textAlign:"left",background:settings[key]?C.aLight:"#fff",border:`1.5px solid ${settings[key]?C.aSoft:C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
      <span aria-hidden="true" style={{width:44,height:24,borderRadius:999,background:settings[key]?C.accent:"#D7DCE5",position:"relative",flexShrink:0}}><span style={{position:"absolute",top:3,left:settings[key]?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .15s"}}/></span>
      <span><b style={{display:"block",color:C.text,fontSize:15,marginBottom:3}}>{title}</b><span style={{display:"block",color:C.muted,fontSize:13,lineHeight:1.5}}>{text}</span></span>
    </button>
  );
  const darkMode=themeMode==="dark";
  const themeRow=(
    <button role="switch" aria-checked={darkMode} onClick={()=>setThemeMode(darkMode?"light":"dark")} className="bs" style={{width:"100%",display:"flex",alignItems:"center",gap:14,textAlign:"left",background:darkMode?C.aLight:"#fff",border:`1.5px solid ${darkMode?C.aSoft:C.border}`,borderRadius:14,padding:16,marginBottom:12}}>
      <span aria-hidden="true" style={{width:44,height:24,borderRadius:999,background:darkMode?C.accent:"#D7DCE5",position:"relative",flexShrink:0}}><span style={{position:"absolute",top:3,left:darkMode?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .15s"}}/></span>
      <span style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><Icon name={darkMode?"moon":"sun"} size={18} color={darkMode?C.accent:C.muted}/><span><b style={{display:"block",color:C.text,fontSize:15,marginBottom:3}}>{darkMode?"Dark mode":"Light mode"}</b><span style={{display:"block",color:C.muted,fontSize:13,lineHeight:1.5}}>Switches the full site between light and dark display modes.</span></span></span>
    </button>
  );
  return (
    <ModalShell title="Accessibility Settings" eyebrow="Display" onClose={onClose}>
      <p style={{fontSize:14,color:C.tSoft,lineHeight:1.7,marginBottom:18}}>These settings are saved in this browser and can be changed any time.</p>
      {themeRow}
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
  const initialScreen=consumeOAuthToken()||routeHash.startsWith("#app")?"app":routeHash.startsWith("#login")?"login":routeHash.startsWith("#signup")?"signup":routeHash.startsWith("#board")||routeHash.startsWith("#agency")?"board":routeHash.startsWith("#why-fear")?"why":"landing";
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
    bio:"Figuring out what comes next.",
    avatarUrl:"",
  });
  const setScreen=useCallback((next)=>{
    setScreenState(next);
    window.scrollTo({top:0,left:0,behavior:"auto"});
    const nextHash=next==="app"?"#app":next==="login"?"#login":next==="signup"?"#signup":next==="board"?"#board":next==="why"?"#why-fear":"";
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
  useEffect(()=>{
    window.scrollTo({top:0,left:0,behavior:"auto"});
  },[screen]);
  useEffect(()=>{
    const bg=screen==="app"
      ? (themeMode==="light"?C.bg:"#050506")
      : (screen==="landing"||screen==="board"||screen==="why")
        ? (themeMode==="light"?"#F7F8FA":"#050506")
        : C.dark;
    document.documentElement.style.background=bg;
    document.body.style.background=bg;
  },[screen,themeMode]);
  const a11yClass=[`theme-${themeMode}`,accessibility.largeText&&"a11y-large-text",accessibility.highContrast&&"a11y-high-contrast",accessibility.reduceMotion&&"a11y-reduce-motion"].filter(Boolean).join(" ");
  return(
    <>
      <style>{css}</style>
      <ToastCtx toasts={toasts} remove={remove}/>
      <div className={a11yClass} style={{minHeight:"100vh",background:screen==="app"&&themeMode==="light"?C.bg:C.dark}}>
        <FlowWaveScene screen={screen} reducedMotion={accessibility.reduceMotion}/>
        {screen!=="signup"&&screen!=="login"&&screen!=="app"&&(
          <Navbar setScreen={setScreen} notify={notify} onOpenPanel={setOpenPanel} forceVisible={screen==="board"||screen==="why"}/>
        )}
        {screen==="landing"&&(
          <LandingExperience setScreen={setScreen} notify={notify} onOpenPanel={setOpenPanel}/>
        )}
        {screen==="board"&&<FearBoardComingSoonPage setScreen={setScreen}/>}
        {screen==="why"&&<WhyFearPage setScreen={setScreen}/>}
        {(screen==="signup"||screen==="login")&&<SignupPage setScreen={setScreen} notify={notify} setProfile={setProfile} initialMode={screen==="login"?"login":"signup"}/>}
        {screen==="app"&&<PlatformApp notify={notify} setScreen={setScreen} signOut={signOut} profile={profile} setProfile={setProfile} accessibility={accessibility} setAccessibility={setAccessibility} themeMode={themeMode} setThemeMode={setThemeMode} cookieConsent={cookieConsent} setCookieConsent={setCookieConsent} onOpenPanel={setOpenPanel}/>}
        <CookieConsent consent={cookieConsent} setConsent={setCookieConsent} onManage={()=>setOpenPanel("cookies")}/>
        {openPanel==="terms"&&<TermsConditionsPanel onClose={()=>setOpenPanel(null)}/>}
        {openPanel==="privacy"&&<PrivacyPolicyPanel onClose={()=>setOpenPanel(null)} onOpenAccessibility={()=>setOpenPanel("accessibility")}/>}
        {openPanel==="accessibility"&&<AccessibilityPanel settings={accessibility} setSettings={setAccessibility} themeMode={themeMode} setThemeMode={setThemeMode} onClose={()=>setOpenPanel(null)}/>}
        {openPanel==="cookies"&&<CookieSettingsPanel consent={cookieConsent} setConsent={setCookieConsent} onClose={()=>setOpenPanel(null)}/>}
      </div>
    </>
  );
}
