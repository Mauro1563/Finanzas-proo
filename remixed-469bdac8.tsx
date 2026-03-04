import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

const ThemeCtx = createContext(null);
const useThm = () => useContext(ThemeCtx);

const DARK = { bg:"#08061100",bg2:"#080611",l1:"#0e0c1a",l2:"#141224",card:"#1a172c",cardH:"#201d35",bd:"#2c2945",bdL:"#3d3960",gold:"#f0a500",goldL:"#ffcc5c",green:"#22c98a",red:"#f05a5a",blue:"#5490f0",purple:"#9d6ef5",txt:"#f0ecff",sub:"#b8b3d8",mut:"#706d96",wh:"#ffffff",nb:"rgba(8,6,17,.93)",sh:"rgba(0,0,0,.4)",dark:true };
const LITE = { bg:"#f4f2ff",bg2:"#f4f2ff",l1:"#ffffff",l2:"#ede9ff",card:"#ffffff",cardH:"#f0edff",bd:"#ddd9f5",bdL:"#c0bae8",gold:"#b86e00",goldL:"#e08a00",green:"#0a8a5c",red:"#c42d2d",blue:"#2458b8",purple:"#6b3dd4",txt:"#1a1533",sub:"#2d2952",mut:"#8078a8",wh:"#1a1533",nb:"rgba(244,242,255,.95)",sh:"rgba(80,60,160,.08)",dark:false };

const TABS=[{id:"dash",lb:"Resumen",ic:"◈",s:"Inicio"},{id:"cards",lb:"Tarjetas",ic:"▣",s:"Tarjetas"},{id:"income",lb:"Ingresos",ic:"↑",s:"Ingresos"},{id:"exp",lb:"Gastos",ic:"↓",s:"Gastos"},{id:"debts",lb:"Deudas",ic:"◎",s:"Deudas"},{id:"plan",lb:"Plan",ic:"⊛",s:"Plan"},{id:"cal",lb:"Agenda",ic:"▦",s:"Agenda"}];
const CURR=[{s:"$",n:"Dólar USD"},{s:"MX$",n:"Peso MX"},{s:"€",n:"Euro"},{s:"£",n:"Libra"},{s:"COP$",n:"Peso CO"},{s:"ARS$",n:"Peso AR"},{s:"CLP$",n:"Peso CL"},{s:"S/",n:"Sol PE"},{s:"R$",n:"Real BR"}];
const GRADS={gold:"135deg,#7a4f00,#c47e00,#f0c040",blue:"135deg,#0d1f4a,#1a3a8a,#3a70d0",purple:"135deg,#2a0d5a,#5a20b0,#9060e0",teal:"135deg,#012a30,#0a6a6a,#20c0b0",green:"135deg,#012a18,#0a6a40,#20c080",dark:"135deg,#0a0820,#1a1640,#2e2860",red:"135deg,#3a0808,#8a1818,#c03030",silver:"135deg,#303050,#505075,#8080a8"};
const MOS=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const INIT={currency:"$",incomes:[],fixedExp:[],varExp:[],debts:[],cards:[],method:"avalanche",payments:{},tab:"dash"};

const uid=()=>Math.random().toString(36).slice(2,9);
const n=v=>Number(v)||0;
const fm=(v,s="$")=>`${s}${Math.abs(n(v)).toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const pc=v=>`${(v*100).toFixed(1)}%`;

const mkCSS=T=>`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:${T.bg2};color:${T.txt};font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${T.bd};border-radius:99px}
input,select{background:${T.l1};color:${T.txt};border:1.5px solid ${T.bd};border-radius:10px;padding:10px 14px;font-family:'Inter',sans-serif;font-size:14px;outline:none;width:100%;transition:border-color .18s,box-shadow .18s}
input:focus,select:focus{border-color:${T.gold};box-shadow:0 0 0 3px ${T.gold}1a}
input::placeholder{color:${T.mut}}button{cursor:pointer;font-family:'Inter',sans-serif;border:none;outline:none}
select option{background:${T.l2}}
table{border-collapse:collapse;width:100%}
th{text-align:left;color:${T.mut};font-size:10px;text-transform:uppercase;letter-spacing:.09em;padding:10px 14px;border-bottom:1px solid ${T.bd};font-weight:600}
td{padding:11px 14px;border-bottom:1px solid ${T.bd}20;font-size:14px;vertical-align:middle}
tr:last-child td{border-bottom:none}tr:hover td{background:${T.gold}07}
.bg{font-family:'Bricolage Grotesque',sans-serif;font-weight:700}
.dp{font-family:'Bricolage Grotesque',sans-serif;font-weight:800}
.mn{font-family:'JetBrains Mono',monospace}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pi{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
.fu{animation:fu .28s cubic-bezier(.22,1,.36,1) both}
.pi{animation:pi .2s cubic-bezier(.22,1,.36,1) both}
@media(max-width:768px){td,th{padding:8px 10px;font-size:12px}}
`;

// ── Atoms ──
function Card({ch,style={},onClick,glow}){
  const T=useThm();const[h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{background:h?T.cardH:T.card,border:`1.5px solid ${h?(glow?T.gold+"55":T.bdL):T.bd}`,borderRadius:18,padding:22,
      boxShadow:h?`0 10px 36px ${T.sh}`:`0 2px 14px ${T.sh}`,transition:"all .2s",cursor:onClick?"pointer":"default",...style}}>{ch}</div>;
}
function Btn({ch,onClick,v="pri",sm,disabled,full,style={}}){
  const T=useThm();const[h,setH]=useState(false);
  const V={pri:{bg:`linear-gradient(135deg,${T.gold},${T.goldL})`,col:T.dark?"#08061180":"#fff"},
    ghost:{bg:"transparent",col:T.mut,brd:`1.5px solid ${T.bd}`},
    danger:{bg:`${T.red}14`,col:T.red,brd:`1.5px solid ${T.red}28`},
    ok:{bg:`${T.green}14`,col:T.green,brd:`1.5px solid ${T.green}28`},
    gold:{bg:`${T.gold}14`,col:T.gold,brd:`1.5px solid ${T.gold}40`},
    blue:{bg:`${T.blue}14`,col:T.blue,brd:`1.5px solid ${T.blue}28`}};
  const s=V[v]||V.pri;
  return <button disabled={disabled} onClick={onClick} onMouseEnter={()=>!disabled&&setH(true)} onMouseLeave={()=>setH(false)}
    style={{background:disabled?T.bd:s.bg,color:disabled?T.mut:s.col,border:s.brd||"none",borderRadius:10,fontWeight:600,
      padding:sm?"5px 12px":"10px 20px",fontSize:sm?12:14,opacity:disabled?.4:1,width:full?"100%":"auto",
      transform:h&&!disabled?"translateY(-1px)":"none",transition:"all .15s",whiteSpace:"nowrap",
      boxShadow:h&&!disabled&&v==="pri"?`0 4px 16px ${T.gold}44`:"none",...style}}>{ch}</button>;
}
const Bdg=({ch,c,sm})=>{const T=useThm();const x=c||T.gold;return <span style={{background:`${x}18`,color:x,border:`1.5px solid ${x}28`,borderRadius:99,padding:sm?"1px 7px":"3px 10px",fontSize:sm?10:11,fontWeight:700,display:"inline-block",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{ch}</span>;};
const Bar=({val,max,col,h=7})=>{const T=useThm();const c=col||T.gold;return <div style={{background:`${c}16`,borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,Math.max(0,(n(val)/Math.max(n(max),1))*100))}%`,height:"100%",background:`linear-gradient(90deg,${c}88,${c})`,borderRadius:99,transition:"width .5s"}}/></div>;};
function Fld({lb,type="text",val,onChange,ph,min,max,step,opts,hint,sfx}){
  const T=useThm();
  return <div style={{marginBottom:14}}>
    <label className="bg" style={{display:"block",fontSize:10,color:T.mut,marginBottom:5,textTransform:"uppercase",letterSpacing:".07em"}}>{lb}</label>
    <div style={{position:"relative"}}>
      {opts?<select value={val} onChange={e=>onChange(e.target.value)}>{opts.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}</select>
        :<input type={type} value={val} onChange={e=>onChange(e.target.value)} placeholder={ph} min={min} max={max} step={step} style={sfx?{paddingRight:42}:{}}/>}
      {sfx&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:11,color:T.mut,fontFamily:"'JetBrains Mono',monospace"}}>{sfx}</span>}
    </div>
    {hint&&<p style={{fontSize:11,color:T.mut,marginTop:3,lineHeight:1.4}}>{hint}</p>}
  </div>;
}
const Empty=({ic,tx,cta,onCta})=>{const T=useThm();return <div style={{textAlign:"center",padding:"36px 16px",color:T.mut}}><div style={{fontSize:38,marginBottom:10,opacity:.4}}>{ic}</div><p style={{fontSize:13,marginBottom:cta?14:0,lineHeight:1.6}}>{tx}</p>{cta&&<Btn ch={cta} v="gold" sm onClick={onCta}/>}</div>;};
const SHd=({ti,su,mb})=>{const T=useThm();return <div style={{marginBottom:mb?16:26}}><h2 className="dp" style={{fontSize:mb?22:28,color:T.wh,marginBottom:4,letterSpacing:"-.02em"}}>{ti}</h2>{su&&<p style={{color:T.mut,fontSize:13}}>{su}</p>}</div>;};
const Dv=()=>{const T=useThm();return <div style={{borderTop:`1px solid ${T.bd}`,margin:"14px 0"}}/>;};

function Modal({onClose,children}){
  const T=useThm();
  return <div style={{position:"fixed",inset:0,background:T.dark?"rgba(8,6,17,.88)":"rgba(20,16,48,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(10px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>{children}</div>;
}
function EditMod({title,fields,data,onSave,onClose}){
  const T=useThm();const[form,setForm]=useState({...data});const sf=k=>v=>setForm(p=>({...p,[k]:v}));
  return <Modal onClose={onClose}><div className="pi" style={{background:T.card,border:`1.5px solid ${T.bdL}`,borderRadius:20,padding:26,width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(0,0,0,.7)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h3 className="bg" style={{fontSize:16,color:T.wh}}>{title}</h3>
      <button onClick={onClose} style={{background:"transparent",color:T.mut,fontSize:20,padding:"2px 6px"}}>✕</button>
    </div>
    {fields.map(f=><Fld key={f.k} lb={f.lb} type={f.type||"text"} val={form[f.k]||""} onChange={sf(f.k)} ph={f.ph} min={f.min} step={f.step} opts={f.opts} hint={f.hint} sfx={f.sfx}/>)}
    <div style={{display:"flex",gap:10,marginTop:8}}><Btn ch="Cancelar" v="ghost" onClick={onClose} full/><Btn ch="💾 Guardar" onClick={()=>onSave(form)} full/></div>
  </div></Modal>;
}
function PayMod({title,current,cur,onPay,onClose}){
  const T=useThm();const[amt,setAmt]=useState("");const a=n(amt);const nb=Math.max(0,n(current)-a);
  return <Modal onClose={onClose}><div className="pi" style={{background:T.card,border:`1.5px solid ${T.green}44`,borderRadius:20,padding:26,width:"100%",maxWidth:380,boxShadow:"0 24px 64px rgba(0,0,0,.7)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <h3 className="bg" style={{fontSize:16,color:T.wh}}>{title}</h3>
      <button onClick={onClose} style={{background:"transparent",color:T.mut,fontSize:20,padding:"2px 6px"}}>✕</button>
    </div>
    <div style={{background:T.l1,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
      <div style={{fontSize:11,color:T.mut,marginBottom:3}}>Saldo actual</div>
      <div className="dp mn" style={{fontSize:26,color:T.gold}}>{fm(current,cur)}</div>
    </div>
    <Fld lb="Monto del pago" type="number" val={amt} onChange={setAmt} ph="0.00" sfx={cur}/>
    {a>0&&<div style={{background:`${T.green}0e`,border:`1.5px solid ${T.green}28`,borderRadius:12,padding:"12px 16px",marginBottom:14}}>
      <div style={{fontSize:11,color:T.mut,marginBottom:3}}>Nuevo saldo</div>
      <div className="dp mn" style={{fontSize:22,color:T.green}}>{fm(nb,cur)}</div>
      {nb===0&&<div style={{fontSize:12,color:T.green,marginTop:4,fontWeight:600}}>🎉 ¡Deuda liquidada!</div>}
    </div>}
    <div style={{display:"flex",gap:10}}><Btn ch="Cancelar" v="ghost" onClick={onClose} full/><Btn ch="✓ Registrar Pago" v="ok" onClick={()=>{onPay(a);onClose();}} full disabled={a<=0}/></div>
  </div></Modal>;
}

function Toast({items}){
  const T=useThm();
  return <div style={{position:"fixed",bottom:84,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
    {items.map(t=><div key={t.id} className="pi" style={{background:T.card,border:`1.5px solid ${t.c}44`,borderRadius:12,padding:"10px 16px",fontSize:13,color:t.c,fontWeight:600,boxShadow:`0 8px 28px ${T.sh}`,display:"flex",alignItems:"center",gap:8}}>{t.ic} {t.msg}</div>)}
  </div>;
}

function FinLogo({size=36,onCard=false}){
  const id=onCard?"oc":"hd";
  return(
    <svg width={size} height={size} viewBox="0 0 44 44" style={{flexShrink:0,display:"block",filter:onCard?"none":"drop-shadow(0 4px 12px rgba(240,165,0,.55))"}}>
      <defs>
        <linearGradient id={`lg1${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1535"/><stop offset="100%" stopColor="#0e0c1a"/>
        </linearGradient>
        <linearGradient id={`lg2${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffcc5c"/><stop offset="55%" stopColor="#f0a500"/><stop offset="100%" stopColor="#c47e00"/>
        </linearGradient>
        <linearGradient id={`lg3${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c98a"/><stop offset="100%" stopColor="#0a7a50"/>
        </linearGradient>
        <radialGradient id={`rg1${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c040" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#f0a500" stopOpacity="0"/>
        </radialGradient>
        <filter id={`gw${id}`}>
          <feGaussianBlur stdDeviation="1.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo hexagonal redondeado */}
      <rect width="44" height="44" rx="11" fill={onCard?"rgba(255,255,255,.15)":(`url(#lg1${id})`)}/>
      {/* Borde dorado */}
      <rect width="44" height="44" rx="11" fill="none" stroke={`url(#lg2${id})`} strokeWidth={onCard?"1":"1.5"} opacity={onCard?.5:.8}/>

      {/* Halo radial central */}
      {!onCard&&<circle cx="22" cy="22" r="18" fill={`url(#rg1${id})`}/>}

      {/* ── Gráfica de barras central ── */}
      <rect x="11" y="32" width="4"   height="5"  rx="1.2" fill={`url(#lg3${id})`} opacity=".85"/>
      <rect x="17" y="27" width="4"   height="10" rx="1.2" fill={`url(#lg3${id})`} opacity=".9"/>
      <rect x="23" y="21" width="4"   height="16" rx="1.2" fill={`url(#lg2${id})`}/>
      <rect x="29" y="15" width="4"   height="22" rx="1.2" fill={`url(#lg2${id})`}/>

      {/* Línea de tendencia */}
      <polyline points="13,31 19,25.5 25,19.5 31,13"
        fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={onCard?.55:.75}/>
      <circle cx="31" cy="13" r="2.5" fill="white" opacity={onCard?.65:.9} filter={`url(#gw${id})`}/>

      {/* ── Símbolos de monedas orbitando ── */}
      {/* $ — arriba izq */}
      <circle cx="7" cy="7" r="5.5" fill={onCard?"rgba(255,255,255,.12)":`url(#lg2${id})`} opacity={onCard?.7:.9}/>
      <text x="7" y="9.5" textAnchor="middle" fontSize="5.8" fontWeight="900" fill={onCard?"white":"#0e0c1a"} fontFamily="Arial,sans-serif" opacity=".95">$</text>

      {/* € — arriba der */}
      <circle cx="37" cy="7" r="5.5" fill={onCard?"rgba(255,255,255,.12)":"#5490f0"} opacity={onCard?.7:.9}/>
      <text x="37" y="9.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="white" fontFamily="Arial,sans-serif" opacity=".95">€</text>

      {/* £ — abajo izq */}
      <circle cx="7" cy="37" r="5.5" fill={onCard?"rgba(255,255,255,.12)":"#9d6ef5"} opacity={onCard?.7:.85}/>
      <text x="7" y="39.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="white" fontFamily="Arial,sans-serif" opacity=".95">£</text>

      {/* ₿ — abajo der */}
      <circle cx="37" cy="37" r="5.5" fill={onCard?"rgba(255,255,255,.12)":"#f0a500"} opacity={onCard?.7:.9}/>
      <text x="37.3" y="39.6" textAnchor="middle" fontSize="5.8" fontWeight="900" fill={onCard?"white":"#0e0c1a"} fontFamily="Arial,sans-serif" opacity=".95">₿</text>
    </svg>
  );
}
function useMob(){const[m,setM]=useState(()=>window.innerWidth<768);useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);return m;}

// ── Visual Card ──
function VCard({card,cur,onPay,onEdit,onDel}){
  const T=useThm();const[h,setH]=useState(false);
  const grad=`linear-gradient(${GRADS[card.color]||GRADS.blue})`;
  const isC=card.type==="credito";const bal=n(card.balance),lim=n(card.limit);
  const used=isC&&lim>0?Math.min(1,bal/lim):0;
  return <div>
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:grad,borderRadius:18,padding:20,position:"relative",overflow:"hidden",minHeight:155,
        boxShadow:h?"0 18px 50px rgba(0,0,0,.55)":"0 6px 24px rgba(0,0,0,.4)",
        transform:h?"translateY(-4px) scale(1.01)":"none",transition:"all .28s",marginBottom:10}}>
      <div style={{position:"absolute",top:-24,right:-24,width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
      <div style={{position:"absolute",bottom:-14,right:28,width:65,height:65,borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,position:"relative"}}>
        <div><div style={{fontSize:9,color:"rgba(255,255,255,.6)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:2}}>{isC?"Crédito":"Débito"}</div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{card.bank}</div></div>
        <FinLogo size={28} onCard={true}/>
      </div>
      <div className="mn" style={{fontSize:12,color:"rgba(255,255,255,.65)",letterSpacing:".18em",marginBottom:14}}>•••• •••• •••• {card.last4||"••••"}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div><div style={{fontSize:9,color:"rgba(255,255,255,.55)",marginBottom:1}}>TITULAR</div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{card.name}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"rgba(255,255,255,.55)",marginBottom:1}}>{isC?"DEUDA":"SALDO"}</div><div className="mn" style={{fontSize:14,fontWeight:700,color:"#fff"}}>{fm(bal,cur)}</div></div>
      </div>
      {isC&&lim>0&&<div style={{marginTop:10}}>
        <div style={{height:3,background:"rgba(255,255,255,.18)",borderRadius:99,overflow:"hidden"}}>
          <div style={{width:`${used*100}%`,height:"100%",background:used>.8?"#f05a5a":used>.5?"#f0c040":"rgba(255,255,255,.75)",borderRadius:99}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,.5)"}}>Usado {(used*100).toFixed(0)}%</span>
          <span style={{fontSize:8,color:"rgba(255,255,255,.5)"}}>Lím. {fm(lim,cur)}</span>
        </div>
      </div>}
      {card.dueDay&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.28)",borderRadius:6,padding:"2px 7px",fontSize:9,color:"rgba(255,255,255,.75)",fontFamily:"'JetBrains Mono',monospace"}}>Día {card.dueDay}</div>}
    </div>
    <div style={{display:"flex",gap:7}}><Btn ch={isC?"💸 Pagar":"↔ Actualizar"} v={isC?"ok":"blue"} sm onClick={onPay} style={{flex:1}}/><Btn ch="✎" v="gold" sm onClick={onEdit}/><Btn ch="✕" v="danger" sm onClick={onDel}/></div>
  </div>;
}

// ── PDF EXPORT ──
async function genPDF(state,totals){
  if(!window.jspdf){await new Promise((ok,fail)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";s.onload=ok;s.onerror=()=>fail(new Error("No se pudo cargar jsPDF"));document.head.appendChild(s);});}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});
  const W=210,M=16;let y=0;const c=state.currency||"$";const f=v=>fm(v,c);
  const BG=[8,6,17],SR=[22,20,38],SR2=[30,26,50],BD=[44,41,69],GO=[240,165,0],GN=[34,201,138],RE=[240,90,90],BL=[84,144,240],TX=[240,236,255],MU=[112,109,150];
  const bg=()=>{doc.setFillColor(...BG);doc.rect(0,0,W,297,"F");};
  const np=()=>{doc.addPage();bg();y=18;};
  const ck=(r=10)=>{if(y+r>278)np();};
  const sec=(t)=>{ck(14);doc.setFillColor(...SR2);doc.roundedRect(M-2,y-5,W-(M-2)*2,10,2,2,"F");doc.setFillColor(...GO);doc.rect(M-2,y-5,3,10,"F");doc.setFont("helvetica","bold").setFontSize(9).setTextColor(...GO);doc.text(t.toUpperCase(),M+6,y+1);y+=13;};
  const row=(l,v,vc,b=false)=>{ck(7);doc.setFont("helvetica",b?"bold":"normal").setFontSize(9).setTextColor(...MU);doc.text(String(l),M+4,y);doc.setFont("helvetica","bold").setTextColor(...(vc||TX));doc.text(String(v),W-M,y,{align:"right"});y+=7;};
  const dv=()=>{ck(4);doc.setDrawColor(...BD).setLineWidth(.2);doc.line(M,y,W-M,y);y+=5;};
  const{totalIncome:ti,totalFixed:tf,totalVariable:tv,totalDebt:td,totalMinPay:tm,disponible:dis,sortedDebts:sd}=totals;
  const te=tf+tv+tm;
  bg();
  doc.setFillColor(...SR2);doc.rect(0,0,W,50,"F");doc.setFillColor(...GO);doc.rect(0,50,W,2,"F");
  // PDF logo — icono con barras + símbolos moneda
  doc.setFillColor(14,12,26);doc.roundedRect(M,13,22,22,3,3,"F");
  doc.setDrawColor(...GO);doc.setLineWidth(.6);doc.roundedRect(M,13,22,22,3,3,"S");
  // barras
  doc.setFillColor(34,201,138);doc.roundedRect(M+2,30,2.5,4,.5,.5,"F");doc.roundedRect(M+6,27,2.5,7,.5,.5,"F");
  doc.setFillColor(...GO);doc.roundedRect(M+10,23,2.5,11,.5,.5,"F");doc.roundedRect(M+14,19,2.5,15,.5,.5,"F");
  // línea tendencia
  doc.setDrawColor(255,255,255);doc.setLineWidth(.7);doc.line(M+3.3,32,M+7.3,27.5);doc.line(M+7.3,27.5,M+11.3,23.5);doc.line(M+11.3,23.5,M+15.2,19.8);
  doc.setFillColor(255,255,255);doc.circle(M+15.2,19.8,.9,"F");
  // monedas mini — $ € £ ₿
  const sym=[{x:M-3,y:13,l:"$",c:GO},{x:M+22,y:13,l:"€",c:[84,144,240]},{x:M-3,y:35,l:"£",c:[157,110,245]},{x:M+22,y:35,l:"₿",c:GO}];
  sym.forEach(s=>{doc.setFillColor(...s.c);doc.circle(s.x,s.y,3.5,"F");doc.setFont("helvetica","bold").setFontSize(5).setTextColor(...BG);doc.text(s.l,s.x,s.y+1.8,{align:"center"});});
  doc.setFont("helvetica","bold").setFontSize(22).setTextColor(...GO);doc.text("FinanzasPro",M+23,20);
  doc.setFont("helvetica","normal").setFontSize(8).setTextColor(...MU);doc.text("Control Financiero Personal — Mauricio",M+23,28);
  const fecha=new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});
  doc.text(fecha,W-M,20,{align:"right"});doc.text("Moneda: "+c,W-M,28,{align:"right"});
  doc.text("Método: "+(state.method==="avalanche"?"Avalancha":"Bola de Nieve"),W-M,36,{align:"right"});
  y=62;
  const kw=(W-M*2-9)/4;
  [{l:"Ingresos",v:f(ti),c:GN},{l:"Gastos",v:f(te),c:RE},{l:"Disponible",v:f(dis),c:dis>=0?GN:RE},{l:"Deuda Total",v:f(td),c:GO}].forEach((k,i)=>{
    const x=M+i*(kw+3);doc.setFillColor(...SR2);doc.roundedRect(x,y,kw,18,2,2,"F");doc.setDrawColor(...BD).setLineWidth(.25);doc.roundedRect(x,y,kw,18,2,2,"S");
    doc.setFont("helvetica","normal").setFontSize(7).setTextColor(...MU);doc.text(k.l,x+kw/2,y+6,{align:"center"});
    doc.setFont("helvetica","bold").setFontSize(9).setTextColor(...k.c);doc.text(k.v,x+kw/2,y+13,{align:"center"});
  });y+=24;
  if(state.incomes.length>0){sec("INGRESOS");state.incomes.forEach(i=>row(`${i.name} [${i.type}]${i.day?` día ${i.day}`:""}`,f(i.amount),GN));dv();row("TOTAL",f(ti),GN,true);y+=4;}
  if(state.fixedExp.length>0){sec("GASTOS FIJOS");state.fixedExp.forEach(e=>row(e.name+(e.day?` vence día ${e.day}`:""),f(e.amount),RE));y+=4;}
  if(state.varExp.length>0){sec("GASTOS VARIABLES");state.varExp.forEach(e=>row(`${e.name} [${e.category}]`,f(e.amount),RE));dv();row("TOTAL GASTOS",f(tf+tv),RE,true);y+=4;}
  const cards=state.cards||[];
  if(cards.length>0){
    sec("TARJETAS");
    cards.filter(x=>x.type==="credito").forEach(x=>{const us=n(x.limit)>0?n(x.balance)/n(x.limit):0;row(`${x.bank} ···${x.last4||"••••"} [Crédito] día ${x.dueDay||"—"}`,`Deuda: ${f(x.balance)} | Límite: ${f(x.limit)} | ${(us*100).toFixed(0)}%`,us>.8?RE:GO);});
    cards.filter(x=>x.type==="debito").forEach(x=>row(`${x.bank} ···${x.last4||"••••"} [Débito]`,`Saldo: ${f(x.balance)}`,GN));y+=4;
  }
  if(sd.length>0){
    sec("DEUDAS — ORDEN ESTRATÉGICO");
    sd.forEach((d,i)=>{
      ck(12);const init=n(d.initialBalance)||n(d.balance)||1;const paid=Math.max(0,init-n(d.balance));
      doc.setFont("helvetica",i===0?"bold":"normal").setFontSize(9).setTextColor(...(i===0?GO:TX));
      doc.text(`${i===0?"★":i+1}. ${d.name}`,M+4,y);doc.setTextColor(...RE);doc.text(`${f(d.balance)}`,M+80,y);
      doc.setTextColor(...(n(d.rate)>30?RE:GN));doc.text(`${d.rate}%`,M+120,y);doc.setTextColor(...MU);doc.text(`Mín: ${f(d.minPayment)}`,M+140,y);y+=5;
      const bw=W-M*2-8;doc.setFillColor(...BD);doc.roundedRect(M+4,y,bw,2.5,1,1,"F");
      const pw=Math.min(bw,bw*(paid/init));if(pw>0){doc.setFillColor(...GN);doc.roundedRect(M+4,y,pw,2.5,1,1,"F");}
      doc.setFont("helvetica","normal").setFontSize(7).setTextColor(...MU);doc.text(`${pc(Math.max(0,paid)/init)} pagado`,W-M,y+2,{align:"right"});y+=9;
    });
    dv();row("DEUDA TOTAL",f(td),GO,true);y+=4;
  }
  sec("PLAN DE LIQUIDACIÓN");
  const bala=Math.max(0,dis);row("Bala extra disponible / mes",f(bala),GO,true);
  if(bala>0&&sd.length>0){const top=sd[0];row("Deuda prioritaria",top.name,GO);row("Tasa",top.rate+"%",RE);const ms=Math.ceil(n(top.balance)/Math.max(bala+n(top.minPayment),1));row("Estimado para liquidar",`${ms} meses (~${(ms/12).toFixed(1)} años)`,GN,true);}
  const pgs=doc.getNumberOfPages();
  for(let p=1;p<=pgs;p++){doc.setPage(p);doc.setFillColor(...SR2);doc.rect(0,289,W,8,"F");doc.setFillColor(...GO);doc.rect(0,289,W,.8,"F");doc.setFont("helvetica","normal").setFontSize(7).setTextColor(...MU);doc.text("FinanzasPro — Mauricio | "+fecha,M,294);doc.text(`Pág. ${p} / ${pgs}`,W-M,294,{align:"right"});}
  doc.save(`finanzaspro-${new Date().toISOString().slice(0,10)}.pdf`);
}

// ═══════════════════════════
//  APP
// ═══════════════════════════
export default function App(){
  const mob=useMob();
  const[s,setS]=useState(INIT);
  const[dark,setDark]=useState(true);
  const[ready,setReady]=useState(false);
  const[pdfB,setPdfB]=useState(false);
  const[showCur,setShowCur]=useState(false);
  const[toasts,setToasts]=useState([]);
  const curRef=useRef(null);
  const T=dark?DARK:LITE;

  const toast=useCallback((msg,c,ic="✓")=>{const id=uid();setToasts(t=>[...t,{id,msg,c:c||T.green,ic}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);},[T]);

  useEffect(()=>{(async()=>{try{if(window.storage){const r=await window.storage.get("fpro7");if(r?.value)setS({...INIT,...JSON.parse(r.value)});}else{const d=localStorage.getItem("fpro7");if(d)setS({...INIT,...JSON.parse(d)});}}catch(_){}setReady(true);})();},[]);
  useEffect(()=>{if(!ready)return;const data=JSON.stringify(s);if(window.storage)window.storage.set("fpro7",data).catch(()=>{});else try{localStorage.setItem("fpro7",data);}catch(_){};},[s,ready]);
  useEffect(()=>{if(!showCur)return;const h=e=>{if(curRef.current&&!curRef.current.contains(e.target))setShowCur(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[showCur]);

  const upd=useCallback(p=>setS(prev=>({...prev,...p})),[]);
  const cur=s.currency||"$";
  const ti=s.incomes.reduce((a,i)=>a+n(i.amount),0);
  const tf=s.fixedExp.reduce((a,e)=>a+n(e.amount),0);
  const tv=s.varExp.reduce((a,e)=>a+n(e.amount),0);
  const td=s.debts.reduce((a,d)=>a+n(d.balance),0);
  const tm=s.debts.reduce((a,d)=>a+n(d.minPayment),0);
  const te=tf+tv+tm;
  const dis=ti-te;
  const sd=[...s.debts].sort((a,b)=>s.method==="avalanche"?n(b.rate)-n(a.rate):n(a.balance)-n(b.balance));
  const totals={totalIncome:ti,totalFixed:tf,totalVariable:tv,totalDebt:td,totalMinPay:tm,totalExpenses:te,disponible:dis,sortedDebts:sd};

  const handlePDF=async()=>{setPdfB(true);toast("Generando PDF…",T.gold,"📄");try{await genPDF(s,totals);toast("PDF descargado ✅",T.green,"📥");}catch(e){alert("Error: "+e.message);}finally{setPdfB(false);};};

  if(!ready)return <ThemeCtx.Provider value={T}><style>{mkCSS(T)}</style><div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg2}}><p className="dp" style={{fontSize:26,color:T.gold}}>Cargando…</p></div></ThemeCtx.Provider>;

  const pp={s,upd,cur,mob,toast,...totals};
  const btnBase={background:T.l1,border:`1.5px solid ${T.bd}`,borderRadius:10,color:T.txt,fontSize:13,fontWeight:600,transition:"all .2s",display:"flex",alignItems:"center",gap:6};

  return(
    <ThemeCtx.Provider value={T}>
      <style>{mkCSS(T)}</style>
      <div style={{minHeight:"100vh",background:T.bg2,paddingBottom:mob?72:0,transition:"background .3s"}}>
        {/* HEADER */}
        <header style={{position:"sticky",top:0,zIndex:200,background:T.nb,borderBottom:`1px solid ${T.bd}`,backdropFilter:"blur(20px)",padding:mob?"0 12px":"0 24px",height:mob?56:62,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"background .3s"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <FinLogo size={36}/>
            <div><div className="bg" style={{fontSize:mob?15:17,color:T.wh,lineHeight:1.1}}>FinanzasPro</div>{!mob&&<div style={{fontSize:9,color:T.mut,letterSpacing:".09em",textTransform:"uppercase"}}>Mauricio · Control Financiero</div>}</div>
          </div>
          {/* Desktop tabs */}
          {!mob&&<nav style={{display:"flex",gap:2,background:T.l1,borderRadius:13,padding:3}}>{TABS.map(t=><button key={t.id} onClick={()=>upd({tab:t.id})} style={{background:s.tab===t.id?T.card:"transparent",color:s.tab===t.id?T.gold:T.mut,border:s.tab===t.id?`1.5px solid ${T.bdL}`:"1.5px solid transparent",borderRadius:10,padding:"6px 11px",fontSize:11,fontWeight:600,transition:"all .18s",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{t.ic} {t.lb}</button>)}</nav>}
          {/* Controls */}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>setDark(d=>!d)} style={{...btnBase,padding:mob?"7px":"7px 12px"}}>{dark?"☀️":"🌙"}{!mob&&<span style={{fontSize:11,color:T.mut}}>{dark?"Claro":"Oscuro"}</span>}</button>
            <div ref={curRef} style={{position:"relative"}}>
              <button onClick={()=>setShowCur(v=>!v)} style={{...btnBase,padding:mob?"5px 9px":"6px 13px",color:T.gold,fontFamily:"'JetBrains Mono',monospace"}}>{cur}<span style={{fontSize:8,opacity:.6}}>▼</span></button>
              {showCur&&<div className="pi" style={{position:"absolute",top:"calc(100% + 7px)",right:0,zIndex:999,background:T.l2,border:`1.5px solid ${T.bdL}`,borderRadius:13,overflow:"hidden",minWidth:180,boxShadow:`0 18px 50px ${T.sh}`}}>
                {CURR.map(cc=><button key={cc.s} onClick={()=>{upd({currency:cc.s});setShowCur(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",background:cur===cc.s?`${T.gold}14`:"transparent",color:cur===cc.s?T.gold:T.txt,fontSize:13,fontFamily:"'Inter',sans-serif"}}>
                  <span className="mn" style={{minWidth:32,fontSize:11,color:T.gold}}>{cc.s}</span><span style={{color:T.mut,fontSize:11}}>{cc.n}</span>{cur===cc.s&&<span style={{marginLeft:"auto",color:T.gold}}>✓</span>}
                </button>)}
              </div>}
            </div>
            <Btn ch={pdfB?"⏳":"↓ PDF"} onClick={handlePDF} disabled={pdfB} style={{fontSize:12,padding:mob?"6px 10px":"7px 16px"}}/>
          </div>
        </header>

        {/* MAIN */}
        <main className="fu" key={s.tab} style={{maxWidth:mob?"100%":1200,margin:"0 auto",padding:mob?"14px 12px":"26px 22px"}}>
          {s.tab==="dash"&&<Dash {...pp}/>}
          {s.tab==="cards"&&<Cards {...pp}/>}
          {s.tab==="income"&&<Income {...pp}/>}
          {s.tab==="exp"&&<Expenses {...pp}/>}
          {s.tab==="debts"&&<Debts {...pp}/>}
          {s.tab==="plan"&&<Plan {...pp}/>}
          {s.tab==="cal"&&<Cal {...pp}/>}
        </main>

        {/* MOBILE NAV */}
        {mob&&<nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:300,background:T.nb,borderTop:`1px solid ${T.bd}`,backdropFilter:"blur(20px)",display:"flex",height:66}}>
          {TABS.map(t=>{const a=s.tab===t.id;return <button key={t.id} onClick={()=>upd({tab:t.id})} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"transparent",color:a?T.gold:T.mut,fontSize:9,fontWeight:a?700:500,borderTop:a?`2px solid ${T.gold}`:"2px solid transparent",paddingTop:2,fontFamily:"'Bricolage Grotesque',sans-serif"}}><span style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace"}}>{t.ic}</span><span>{t.s}</span></button>;})}
        </nav>}
        <Toast items={toasts}/>
      </div>
    </ThemeCtx.Provider>
  );
}

// ═══════════════════════════
//  DASHBOARD
// ═══════════════════════════
function Dash({s,upd,cur,mob,totalIncome:ti,totalFixed:tf,totalVariable:tv,totalDebt:td,disponible:dis,sortedDebts:sd,totalMinPay:tm,totalExpenses:te}){
  const T=useThm();const cards=s.cards||[];
  const sR=ti>0?dis/ti:0,dR=ti>0?tm/ti:0,eR=ti>0?te/ti:0;
  const hi=[{lb:"Ahorro",v:sR,g:sR>=.15,d:pc(sR),go:"≥15%"},{lb:"Deuda/Ingreso",v:dR,g:dR<=.3,d:pc(dR),go:"≤30%"},{lb:"Gastos/Ingreso",v:eR,g:eR<=.8,d:pc(eR),go:"≤80%"}];
  const score=ti===0?null:hi.filter(x=>x.g).length===3?{t:"Excelente 🏆",c:T.green}:hi.filter(x=>x.g).length===2?{t:"Bueno 👍",c:T.gold}:hi.filter(x=>x.g).length===1?{t:"Regular ⚠️",c:T.gold}:{t:"Crítico 🚨",c:T.red};
  const tcd=cards.filter(c=>c.type==="credito").reduce((a,c)=>a+n(c.balance),0);
  const sts=[{lb:"Ingreso",v:fm(ti,cur),c:T.green,bg:T.green,tab:"income",sub:`${s.incomes.length} fuentes`},{lb:"Gastos",v:fm(te,cur),c:T.red,bg:T.red,tab:"exp",sub:ti>0?pc(eR):"—"},{lb:"Disponible",v:fm(dis,cur),c:dis>=0?T.green:T.red,bg:dis>=0?T.green:T.red,tab:null,sub:dis>=0?"Libre":"Déficit"},{lb:"Tarjetas",v:fm(tcd,cur),c:T.purple,bg:T.purple,tab:"cards",sub:`${cards.length} registradas`},{lb:"Deuda",v:fm(td,cur),c:T.gold,bg:T.gold,tab:"debts",sub:`${sd.length} deudas`}];
  return <div>
    <div style={{marginBottom:mob?16:24}}>
      <h1 className="dp" style={{fontSize:mob?24:38,color:T.wh,letterSpacing:"-.03em",marginBottom:6,lineHeight:1.1}}>Tu Panorama<br/><span style={{color:T.gold}}>Financiero</span></h1>
      <p style={{color:T.mut,fontSize:mob?12:14}}>{ti===0?"Registra tus datos para comenzar tu diagnóstico.":`${s.incomes.length} ingresos · ${sd.length} deudas · ${cards.length} tarjetas · ${s.fixedExp.length+s.varExp.length} gastos`}</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":`repeat(${Math.min(sts.length,5)},1fr)`,gap:mob?9:12,marginBottom:mob?12:18}}>
      {sts.slice(0,mob?4:5).map(st=><Card key={st.lb} ch={<><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${st.bg}00,${st.bg}77,${st.bg}00)`}}/><div className="bg" style={{fontSize:10,color:T.mut,marginBottom:7,textTransform:"uppercase",letterSpacing:".07em"}}>{st.lb}</div><div className="dp mn" style={{fontSize:mob?15:20,color:st.c,marginBottom:4,lineHeight:1}}>{st.v}</div><div style={{fontSize:11,color:T.mut}}>{st.sub}</div>{st.tab&&<div style={{marginTop:7,fontSize:10,color:T.gold,opacity:.6}}>Ver →</div>}</>}
        onClick={st.tab?()=>upd({tab:st.tab}):undefined} hover style={{padding:mob?13:20,position:"relative",overflow:"hidden"}}/>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"3fr 2fr",gap:mob?10:14,marginBottom:mob?10:14}}>
      <Card ch={<><div className="bg" style={{fontSize:14,marginBottom:18,color:T.txt}}>Distribución del Ingreso</div>
        {ti===0?<Empty ic="📊" tx="Agrega ingresos para ver tu distribución" cta="+ Ingresos" onCta={()=>upd({tab:"income"})}/>
          :[{lb:"Fijos",v:tf,c:T.blue},{lb:"Variables",v:tv,c:T.purple},{lb:"Deudas",v:tm,c:T.red},{lb:"Disponible",v:Math.max(0,dis),c:T.green}].map(r=><div key={r.lb} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,color:T.sub}}>{r.lb}</span><span className="mn" style={{fontSize:13,color:r.c,fontWeight:500}}>{fm(r.v,cur)}</span></div><Bar val={r.v} max={ti} col={r.c}/></div>)}
        {dis<0&&ti>0&&<div style={{marginTop:12,padding:"9px 13px",background:`${T.red}10`,borderRadius:10,border:`1px solid ${T.red}22`,fontSize:12,color:T.red}}>⚠️ Déficit de <strong>{fm(Math.abs(dis),cur)}</strong></div>}</>}/>
      <Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div className="bg" style={{fontSize:14,color:T.txt}}>Salud Financiera</div>{score&&<Bdg ch={score.t} c={score.c}/>}</div>
        {ti===0?<Empty ic="❤️" tx="Agrega ingresos para tu diagnóstico"/>:hi.map(h=><div key={h.lb} style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div><div style={{fontSize:12,color:T.sub,fontWeight:500}}>{h.lb}</div><div style={{fontSize:10,color:T.mut}}>{h.go}</div></div><Bdg ch={h.d} c={h.g?T.green:T.red}/>
          </div><Bar val={Math.min(h.v,1)} max={1} col={h.g?T.green:T.red} h={5}/></div>)}
        <div style={{marginTop:8,padding:"9px 12px",background:T.l1,borderRadius:10,fontSize:11,color:T.mut,lineHeight:1.5}}>💡 <span style={{color:T.gold}}>Meta:</span> Ahorra ≥15% · Deuda/Ingreso ≤30%</div></>}/>
    </div>
    {cards.length>0&&<Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div className="bg" style={{fontSize:14}}>▣ Tarjetas</div><Btn ch="Ver todas →" v="ghost" sm onClick={()=>upd({tab:"cards"})}/></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":`repeat(${Math.min(cards.length,4)},1fr)`,gap:9}}>
        {cards.slice(0,4).map(card=>{const isC=card.type==="credito";const used=isC&&n(card.limit)>0?n(card.balance)/n(card.limit):0;return <div key={card.id} style={{background:`linear-gradient(${GRADS[card.color]||GRADS.blue})`,borderRadius:12,padding:13,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-10,right:-10,width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
          <div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginBottom:2}}>{card.bank}</div>
          <div className="mn" style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:6}}>{fm(n(card.balance),cur)}</div>
          {isC&&n(card.limit)>0&&<Bar val={used} max={1} col={used>.8?"#f05a5a":"rgba(255,255,255,.65)"} h={3}/>}
          <div style={{fontSize:9,color:"rgba(255,255,255,.5)",marginTop:4}}>···· {card.last4||"••••"}</div>
        </div>;})}
      </div></>} style={{marginBottom:mob?10:14}}/>}
    {sd.length>0&&<Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div className="bg" style={{fontSize:14}}>Deudas — {s.method==="avalanche"?"⛰ Avalancha":"❄ Bola de Nieve"}</div><Btn ch="Ver →" v="ghost" sm onClick={()=>upd({tab:"debts"})}/></div>
      <div style={{overflowX:"auto"}}><table><thead><tr><th>#</th><th>Deuda</th><th>Saldo</th><th>Tasa</th><th>Progreso</th></tr></thead><tbody>
        {sd.slice(0,mob?3:5).map((d,i)=>{const init=n(d.initialBalance)||n(d.balance)||1;const paid=init-n(d.balance);return <tr key={d.id}><td className="mn" style={{color:i===0?T.gold:T.mut,fontWeight:700,fontSize:12}}>{i===0?"★":i+1}</td><td style={{fontWeight:600}}>{d.name}</td><td className="mn" style={{color:T.gold}}>{fm(d.balance,cur)}</td><td><Bdg ch={`${d.rate}%`} c={n(d.rate)>30?T.red:n(d.rate)>15?T.gold:T.green}/></td><td style={{minWidth:100}}><Bar val={paid} max={init} col={T.green} h={5}/><div style={{fontSize:10,color:T.mut,marginTop:2}}>{pc(Math.max(0,paid)/init)}</div></td></tr>;})}
      </tbody></table></div></>} style={{marginBottom:mob?10:14}}/>}
    {ti===0&&sd.length===0&&(s.cards||[]).length===0&&<Card ch={<div style={{textAlign:"center",padding:mob?24:44}}>
      <div style={{fontSize:48,marginBottom:14}}>🚀</div>
      <h2 className="dp" style={{fontSize:22,color:T.wh,marginBottom:8}}>¡Empieza tu diagnóstico!</h2>
      <p style={{color:T.mut,marginBottom:22,fontSize:13,maxWidth:340,margin:"0 auto 22px"}}>Registra tus finanzas para obtener un plan de libertad financiera personalizado.</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}><Btn ch="💰 Ingresos" onClick={()=>upd({tab:"income"})}/><Btn ch="💳 Tarjetas" v="gold" onClick={()=>upd({tab:"cards"})}/><Btn ch="🏦 Deudas" v="ghost" onClick={()=>upd({tab:"debts"})}/></div>
    </div>} style={{border:`1.5px dashed ${T.gold}40`}}/>}
  </div>;
}

// ═══════════════════════════
//  TARJETAS
// ═══════════════════════════
function Cards({s,upd,cur,mob,toast}){
  const T=useThm();const cards=s.cards||[];
  const blank={name:"",bank:"",type:"credito",last4:"",limit:"",balance:"",dueDay:"",color:"blue"};
  const[form,setF]=useState(blank);const[payId,setPay]=useState(null);const[editId,setEdit]=useState(null);
  const ff=k=>v=>setF(p=>({...p,[k]:v}));const valid=form.name.trim()&&form.bank.trim();
  const cred=cards.filter(c=>c.type==="credito"),deb=cards.filter(c=>c.type==="debito");
  const EF=[{k:"name",lb:"Titular",ph:"Mauricio García"},{k:"bank",lb:"Banco",ph:"BBVA, Banamex…"},{k:"type",lb:"Tipo",opts:[{v:"credito",l:"💳 Crédito"},{v:"debito",l:"💰 Débito"}]},{k:"last4",lb:"Últimos 4 dígitos",ph:"1234"},{k:"limit",lb:"Límite / N/A",type:"number",ph:"0.00"},{k:"balance",lb:"Deuda / Saldo actual",type:"number",ph:"0.00"},{k:"dueDay",lb:"Día de corte",type:"number",ph:"1–31"},{k:"color",lb:"Color",opts:Object.keys(GRADS).map(k=>({v:k,l:k.charAt(0).toUpperCase()+k.slice(1)}))}];
  const add=()=>{if(!valid)return;upd({cards:[...cards,{...form,id:uid(),balance:n(form.balance),limit:n(form.limit)}]});setF(blank);toast("Tarjeta agregada",T.green,"💳");};
  const del=id=>{upd({cards:cards.filter(c=>c.id!==id)});toast("Eliminada",T.red,"🗑");};
  const saveE=(id,d)=>{upd({cards:cards.map(c=>c.id===id?{...c,...d,balance:n(d.balance),limit:n(d.limit)}:c)});setEdit(null);toast("Actualizada",T.gold,"✓");};
  const regPay=(id,a)=>{upd({cards:cards.map(c=>c.id===id?{...c,balance:Math.max(0,n(c.balance)-a)}:c)});toast(`Pago ${fm(a,cur)} registrado`,T.green,"💸");};
  const ei=cards.find(c=>c.id===editId),pi=cards.find(c=>c.id===payId);
  return <div>
    <SHd ti="▣ Mis Tarjetas" su="Administra tus tarjetas de crédito y débito" mb={mob}/>
    {cards.length>0&&<div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:mob?9:12,marginBottom:mob?12:20}}>
      {[{lb:"Línea Crédito",v:fm(cred.reduce((a,c)=>a+n(c.limit),0),cur),c:T.blue},{lb:"Deuda Total",v:fm(cred.reduce((a,c)=>a+n(c.balance),0),cur),c:T.red},{lb:"Crédito Libre",v:fm(cred.reduce((a,c)=>a+Math.max(0,n(c.limit)-n(c.balance)),0),cur),c:T.green},{lb:"Saldo Débito",v:fm(deb.reduce((a,c)=>a+n(c.balance),0),cur),c:T.gold}].map(k=><Card key={k.lb} ch={<div style={{textAlign:"center"}}><div className="dp mn" style={{fontSize:mob?15:19,color:k.c,marginBottom:4}}>{k.v}</div><div className="bg" style={{fontSize:10,color:T.mut,textTransform:"uppercase",letterSpacing:".07em"}}>{k.lb}</div></div>} style={{padding:mob?12:18}}/>)}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 2fr",gap:mob?10:18}}>
      <Card ch={<><div className="bg" style={{fontSize:14,marginBottom:18,color:T.wh}}>Agregar Tarjeta</div>
        <Fld lb="Titular" val={form.name} onChange={ff("name")} ph="Mauricio García"/>
        <Fld lb="Banco" val={form.bank} onChange={ff("bank")} ph="BBVA, Banamex…"/>
        <Fld lb="Tipo" val={form.type} onChange={ff("type")} opts={[{v:"credito",l:"💳 Crédito"},{v:"debito",l:"💰 Débito"}]}/>
        <Fld lb="Últimos 4 dígitos" val={form.last4} onChange={ff("last4")} ph="1234"/>
        {form.type==="credito"&&<Fld lb="Límite de crédito" type="number" val={form.limit} onChange={ff("limit")} ph="0.00" sfx={cur}/>}
        <Fld lb={form.type==="credito"?"Deuda actual":"Saldo disponible"} type="number" val={form.balance} onChange={ff("balance")} ph="0.00" sfx={cur}/>
        <Fld lb="Día de corte" type="number" val={form.dueDay} onChange={ff("dueDay")} ph="1–31"/>
        <div style={{marginBottom:14}}>
          <label className="bg" style={{display:"block",fontSize:10,color:T.mut,marginBottom:8,textTransform:"uppercase",letterSpacing:".07em"}}>Color de tarjeta</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(GRADS).map(([id,g])=><button key={id} onClick={()=>ff("color")(id)} style={{width:28,height:16,borderRadius:5,background:`linear-gradient(${g})`,border:`2.5px solid ${form.color===id?"#fff":"transparent"}`,transform:form.color===id?"scale(1.2)":"scale(1)",transition:"transform .15s"}}/>)}
          </div>
        </div>
        <Btn ch="+ Agregar Tarjeta" onClick={add} full disabled={!valid}/></>}/>
      <div>{cards.length===0?<Card ch={<Empty ic="💳" tx="Sin tarjetas registradas. Agrega tu primera."/>}/>:
        <div style={{display:"grid",gridTemplateColumns:mob||cards.length===1?"1fr":"1fr 1fr",gap:mob?10:14}}>
          {cards.map(card=><VCard key={card.id} card={card} cur={cur} onPay={()=>setPay(card.id)} onEdit={()=>setEdit(card.id)} onDel={()=>del(card.id)}/>)}
        </div>}
      </div>
    </div>
    {editId&&ei&&<EditModal title="Editar Tarjeta" fields={EF} data={ei} onSave={d=>saveE(editId,d)} onClose={()=>setEdit(null)}/>}
    {payId&&pi&&<PayMod title={`${pi.type==="credito"?"Pagar":"Actualizar"} — ${pi.bank} ···${pi.last4||"••••"}`} current={pi.balance} cur={cur} onPay={a=>regPay(pi.id,a)} onClose={()=>setPay(null)}/>}
  </div>;
}

// ═══════════════════════════
//  INGRESOS
// ═══════════════════════════
function Income({s,upd,cur,mob,totalIncome:ti,toast}){
  const T=useThm();const blank={name:"",amount:"",type:"fijo",day:""};
  const[form,setF]=useState(blank);const[editId,setEdit]=useState(null);const ff=k=>v=>setF(p=>({...p,[k]:v}));
  const valid=form.name.trim()&&form.amount;
  const TC={fijo:T.green,variable:T.gold,extra:T.purple};
  const FDS=[{k:"name",lb:"Concepto",ph:"Ej: Sueldo"},{k:"amount",lb:"Monto mensual",type:"number",ph:"0.00",sfx:cur},{k:"type",lb:"Tipo",opts:[{v:"fijo",l:"Fijo"},{v:"variable",l:"Variable"},{v:"extra",l:"Extra/Esporádico"}]},{k:"day",lb:"Día de cobro",type:"number",ph:"1–31"}];
  const add=()=>{if(!valid)return;upd({incomes:[...s.incomes,{...form,id:uid(),amount:n(form.amount)}]});setF(blank);toast("Ingreso agregado",T.green,"💰");};
  const del=id=>{upd({incomes:s.incomes.filter(i=>i.id!==id)});};
  const save=(id,d)=>{upd({incomes:s.incomes.map(i=>i.id===id?{...i,...d,amount:n(d.amount)}:i)});setEdit(null);toast("Actualizado",T.gold,"✓");};
  const ei=s.incomes.find(i=>i.id===editId);
  return <div>
    <SHd ti="💰 Ingresos" su="Registra todas tus fuentes de dinero" mb={mob}/>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 2fr",gap:mob?10:18}}>
      <Card ch={<><div className="bg" style={{fontSize:14,marginBottom:18,color:T.wh}}>Agregar Ingreso</div>
        {FDS.map(f=><Fld key={f.k} lb={f.lb} type={f.type||"text"} val={form[f.k]||""} onChange={ff(f.k)} ph={f.ph} sfx={f.sfx} opts={f.opts}/>)}<Btn ch="+ Agregar" onClick={add} full disabled={!valid}/></>}/>
      <Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div className="bg" style={{fontSize:15,color:T.txt}}>Mis Ingresos ({s.incomes.length})</div>
        <div className="dp mn" style={{fontSize:22,color:T.green}}>{fm(ti,cur)}</div></div>
        {s.incomes.length===0?<Empty ic="💵" tx="Sin ingresos registrados"/>:mob?s.incomes.map(i=><div key={i.id} style={{padding:"11px 0",borderBottom:`1px solid ${T.bd}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{i.name}</div><div style={{display:"flex",gap:5}}><Bdg ch={i.type} c={TC[i.type]||T.gold}/>{i.day&&<span style={{fontSize:11,color:T.mut,alignSelf:"center"}}>día {i.day}</span>}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span className="mn" style={{color:T.green,fontWeight:700,fontSize:14}}>{fm(i.amount,cur)}</span><Btn ch="✎" v="blue" sm onClick={()=>setEdit(i.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(i.id)}/></div>
          </div></div>):<table><thead><tr><th>Concepto</th><th>Monto</th><th>Tipo</th><th>Día</th><th></th></tr></thead><tbody>
            {s.incomes.map(i=><tr key={i.id}><td style={{fontWeight:600}}>{i.name}</td><td className="mn" style={{color:T.green}}>{fm(i.amount,cur)}</td><td><Bdg ch={i.type} c={TC[i.type]||T.gold}/></td><td style={{color:T.mut}}>Día {i.day||"—"}</td><td><div style={{display:"flex",gap:5}}><Btn ch="✎ Editar" v="blue" sm onClick={()=>setEdit(i.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(i.id)}/></div></td></tr>)}
          </tbody></table>}</>}/>
    </div>
    {editId&&ei&&<EditModal title="Editar Ingreso" fields={FDS} data={ei} onSave={d=>save(editId,d)} onClose={()=>setEdit(null)}/>}
  </div>;
}

// ═══════════════════════════
//  GASTOS
// ═══════════════════════════
function Expenses({s,upd,cur,mob,totalFixed:tf,totalVariable:tv,toast}){
  const T=useThm();const[tab,setTab]=useState("f");const blank={name:"",amount:"",day:"",category:"vivienda"};
  const[form,setF]=useState(blank);const[editId,setEdit]=useState(null);const ff=k=>v=>setF(p=>({...p,[k]:v}));
  const isF=tab==="f";const items=isF?s.fixedExp:s.varExp;const total=isF?tf:tv;
  const cats=isF?["vivienda","servicios","transporte","seguros","educación","salud","otro"]:["alimentos","gasolina","entretenimiento","salud","ropa","imprevistos","otro"];
  const valid=form.name.trim()&&form.amount;
  const FDS=[{k:"name",lb:"Concepto",ph:isF?"Ej: Renta":"Ej: Supermercado"},{k:"amount",lb:"Monto",type:"number",ph:"0.00",sfx:cur},{k:"category",lb:"Categoría",opts:cats.map(c=>({v:c,l:c.charAt(0).toUpperCase()+c.slice(1)}))},{k:"day",lb:"Día de vencimiento",type:"number",ph:"1–31"}];
  const add=()=>{if(!valid)return;const e={...form,id:uid(),amount:n(form.amount)};isF?upd({fixedExp:[...s.fixedExp,e]}):upd({varExp:[...s.varExp,e]});setF({name:"",amount:"",day:"",category:isF?"vivienda":"alimentos"});toast("Gasto agregado",T.red,"📋");};
  const del=(id,f)=>{f?upd({fixedExp:s.fixedExp.filter(e=>e.id!==id)}):upd({varExp:s.varExp.filter(e=>e.id!==id)});};
  const save=(id,d,f)=>{f?upd({fixedExp:s.fixedExp.map(e=>e.id===id?{...e,...d,amount:n(d.amount)}:e)}):upd({varExp:s.varExp.map(e=>e.id===id?{...e,...d,amount:n(d.amount)}:e)});setEdit(null);toast("Actualizado",T.gold,"✓");};
  const ei=items.find(e=>e.id===editId);
  return <div>
    <SHd ti="📋 Gastos" su="Controla y categoriza tus gastos mensuales" mb={mob}/>
    <div style={{display:"flex",gap:9,marginBottom:18,flexWrap:"wrap"}}>
      {[{id:"f",lb:"Gastos Fijos",t:tf,c:T.blue},{id:"v",lb:"Variables",t:tv,c:T.purple}].map(bt=><button key={bt.id} onClick={()=>{setTab(bt.id);setF({name:"",amount:"",day:"",category:bt.id==="f"?"vivienda":"alimentos"});}} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 16px",borderRadius:11,background:tab===bt.id?`${bt.c}14`:T.card,border:`1.5px solid ${tab===bt.id?bt.c+"44":T.bd}`,color:tab===bt.id?bt.c:T.mut,fontWeight:700,fontSize:12,transition:"all .18s",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{bt.lb}<span className="mn" style={{fontSize:11,opacity:.8}}>{fm(bt.t,cur)}</span></button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 2fr",gap:mob?10:18}}>
      <Card ch={<><div className="bg" style={{fontSize:14,marginBottom:18,color:T.wh}}>Agregar {isF?"Gasto Fijo":"Variable"}</div>
        {FDS.filter(f=>isF||f.k!=="day").map(f=><Fld key={f.k} lb={f.lb} type={f.type||"text"} val={form[f.k]||""} onChange={ff(f.k)} ph={f.ph} sfx={f.sfx} opts={f.opts}/>)}
        <Btn ch="+ Agregar" onClick={add} full disabled={!valid}/></>}/>
      <Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div className="bg" style={{fontSize:15,color:T.txt}}>{isF?"Fijos":"Variables"} ({items.length})</div>
        <div className="dp mn" style={{fontSize:22,color:T.red}}>{fm(total,cur)}</div></div>
        {items.length===0?<Empty ic="📋" tx="Sin gastos registrados"/>:mob?items.map(e=><div key={e.id} style={{padding:"11px 0",borderBottom:`1px solid ${T.bd}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{e.name}</div><div style={{display:"flex",gap:5}}><Bdg ch={e.category} c={T.blue}/>{isF&&e.day&&<span style={{fontSize:11,color:T.mut,alignSelf:"center"}}>vence día {e.day}</span>}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span className="mn" style={{color:T.red,fontWeight:700,fontSize:14}}>{fm(e.amount,cur)}</span><Btn ch="✎" v="blue" sm onClick={()=>setEdit(e.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(e.id,isF)}/></div>
          </div></div>):<table><thead><tr><th>Concepto</th><th>Cat.</th><th>Monto</th>{isF&&<th>Vence</th>}<th></th></tr></thead><tbody>
            {items.map(e=><tr key={e.id}><td style={{fontWeight:600}}>{e.name}</td><td><Bdg ch={e.category} c={T.blue}/></td><td className="mn" style={{color:T.red}}>{fm(e.amount,cur)}</td>{isF&&<td style={{color:T.mut}}>{e.day?`Día ${e.day}`:"—"}</td>}<td><div style={{display:"flex",gap:5}}><Btn ch="✎ Editar" v="blue" sm onClick={()=>setEdit(e.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(e.id,isF)}/></div></td></tr>)}
          </tbody></table>}</>}/>
    </div>
    {editId&&ei&&<EditModal title={`Editar ${isF?"Fijo":"Variable"}`} fields={FDS.filter(f=>isF||f.k!=="day")} data={ei} onSave={d=>save(editId,d,isF)} onClose={()=>setEdit(null)}/>}
  </div>;
}

// ═══════════════════════════
//  DEUDAS
// ═══════════════════════════
function Debts({s,upd,cur,mob,sortedDebts:sd,totalDebt:td,disponible:dis,toast}){
  const T=useThm();const[payId,setPay]=useState(null);const[editId,setEdit]=useState(null);
  const blank={name:"",balance:"",initialBalance:"",rate:"",minPayment:"",dueDay:"",type:"tarjeta",penalty:"no"};
  const[form,setF]=useState(blank);const ff=k=>v=>setF(p=>({...p,[k]:v}));const valid=form.name.trim()&&form.balance;
  const bala=Math.max(0,dis);
  const FDS=[{k:"name",lb:"Nombre / Acreedor",ph:"Ej: Tarjeta Banamex"},{k:"type",lb:"Tipo",opts:["tarjeta","préstamo","hipoteca","auto","otro"].map(v=>({v,l:v.charAt(0).toUpperCase()+v.slice(1)}))},{k:"initialBalance",lb:"Saldo inicial",type:"number",ph:"0.00",hint:"Para calcular % pagado"},{k:"balance",lb:"Saldo actual",type:"number",ph:"0.00"},{k:"rate",lb:"Tasa anual",type:"number",ph:"45.5",step:"0.1",sfx:"%"},{k:"minPayment",lb:"Pago mínimo mensual",type:"number",ph:"0.00"},{k:"dueDay",lb:"Día de vencimiento",type:"number",ph:"1–31"},{k:"penalty",lb:"Penalización pago anticipado",opts:[{v:"no",l:"No"},{v:"si",l:"Sí"}]}];
  const add=()=>{if(!valid)return;upd({debts:[...s.debts,{...form,id:uid(),balance:n(form.balance),initialBalance:n(form.initialBalance||form.balance),rate:n(form.rate),minPayment:n(form.minPayment)}]});setF(blank);toast("Deuda agregada",T.gold,"🏦");};
  const del=id=>{upd({debts:s.debts.filter(d=>d.id!==id)});toast("Eliminada",T.red,"🗑");};
  const save=(id,d)=>{upd({debts:s.debts.map(x=>x.id===id?{...x,...d,balance:n(d.balance),rate:n(d.rate),minPayment:n(d.minPayment)}:x)});setEdit(null);toast("Actualizada",T.gold,"✓");};
  const regPay=(id,a)=>{upd({debts:s.debts.map(d=>d.id===id?{...d,balance:Math.max(0,n(d.balance)-a)}:d)});toast(`Pago ${fm(a,cur)} registrado`,T.green,"💸");};
  const ei=s.debts.find(d=>d.id===editId),pi=s.debts.find(d=>d.id===payId);
  return <div>
    <SHd ti="🏦 Deudas" su="Registra, paga y monitorea cada deuda" mb={mob}/>
    <Card ch={<div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
      <div><div className="bg" style={{fontSize:10,color:T.mut,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Método de Pago</div>
        <div style={{display:"flex",gap:8}}>{[{id:"avalanche",lb:"⛰ Avalancha",d:"Mayor tasa primero"},{id:"snowball",lb:"❄ Bola de Nieve",d:"Menor saldo primero"}].map(m=><button key={m.id} onClick={()=>upd({method:m.id})} style={{background:s.method===m.id?`${T.gold}14`:T.l1,color:s.method===m.id?T.gold:T.mut,border:`1.5px solid ${s.method===m.id?T.gold+"44":T.bd}`,borderRadius:10,padding:"9px 14px",textAlign:"left",fontFamily:"'Inter',sans-serif",transition:"all .18s"}}><div style={{fontWeight:700,fontSize:12,fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:2}}>{m.lb}</div><div style={{fontSize:10,color:T.mut}}>{m.d}</div></button>)}</div></div>
      <div style={{flex:1,minWidth:160,background:T.l1,borderRadius:10,padding:"10px 14px"}}>
        <div style={{fontSize:11,color:T.mut,marginBottom:5}}>{s.method==="avalanche"?"Mínimos a todas + bala extra a la de mayor tasa.":"Liquida la más pequeña y acumula pagos."}</div>
        <div style={{fontSize:13,fontWeight:600,color:T.gold}}>💡 Bala extra: <span className="mn">{fm(bala,cur)}/mes</span></div>
      </div>
    </div>} style={{marginBottom:16}}/>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 2fr",gap:mob?10:18}}>
      <Card ch={<><div className="bg" style={{fontSize:14,marginBottom:18,color:T.wh}}>Agregar Deuda</div>
        {FDS.map(f=><Fld key={f.k} lb={f.lb} type={f.type||"text"} val={form[f.k]||""} onChange={ff(f.k)} ph={f.ph} min={f.min} step={f.step} opts={f.opts} hint={f.hint} sfx={f.sfx}/>)}
        <Btn ch="+ Agregar Deuda" onClick={add} full disabled={!valid}/></>}/>
      <Card ch={<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div className="bg" style={{fontSize:15,color:T.txt}}>Mis Deudas ({sd.length})</div>
        <div className="dp mn" style={{fontSize:22,color:T.gold}}>{fm(td,cur)}</div></div>
        {sd.length===0
          ? <Empty ic="✅" tx="¡Sin deudas! 🎉"/>
          : mob
            ? sd.map((d,i)=>{const init=n(d.initialBalance)||n(d.balance)||1;const paid=init-n(d.balance);return <div key={d.id} style={{padding:"13px 0",borderBottom:`1px solid ${T.bd}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div><div style={{fontWeight:700,fontSize:13,color:i===0?T.gold:T.txt,marginBottom:4}}>{i===0?"★ ":""}{d.name}</div><div style={{display:"flex",gap:5}}><Bdg ch={d.type} c={T.blue}/><Bdg ch={`${d.rate}%`} c={n(d.rate)>30?T.red:n(d.rate)>15?T.gold:T.green}/></div></div>
                  <div style={{textAlign:"right"}}><div className="mn" style={{color:T.gold,fontWeight:700,fontSize:14}}>{fm(d.balance,cur)}</div><div style={{fontSize:11,color:T.mut}}>mín. {fm(d.minPayment,cur)}</div></div>
                </div><Bar val={paid} max={init} col={T.green} h={5}/>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:9,gap:6}}><Btn ch="💸 Pagar" v="ok" sm onClick={()=>setPay(d.id)}/><Btn ch="✎" v="blue" sm onClick={()=>setEdit(d.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(d.id)}/></div>
              </div>;})
            : <div style={{overflowX:"auto"}}><table><thead><tr><th>#</th><th>Acreedor</th><th>Saldo</th><th>Tasa</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>
                {sd.map((d,i)=>{const init=n(d.initialBalance)||n(d.balance)||1;const paid=init-n(d.balance);return <tr key={d.id}><td className="mn" style={{color:i===0?T.gold:T.mut,fontWeight:700,fontSize:12}}>{i===0?"★":i+1}</td><td style={{fontWeight:600,color:i===0?T.gold:T.txt}}>{d.name}</td><td className="mn" style={{color:T.gold}}>{fm(d.balance,cur)}</td><td><Bdg ch={`${d.rate}%`} c={n(d.rate)>30?T.red:n(d.rate)>15?T.gold:T.green}/></td><td style={{minWidth:100}}><Bar val={paid} max={init} col={T.green} h={5}/><div style={{fontSize:10,color:T.mut,marginTop:2}}>{pc(Math.max(0,paid)/init)}</div></td><td><div style={{display:"flex",gap:5}}><Btn ch="💸 Pagar" v="ok" sm onClick={()=>setPay(d.id)}/><Btn ch="✎" v="blue" sm onClick={()=>setEdit(d.id)}/><Btn ch="✕" v="danger" sm onClick={()=>del(d.id)}/></div></td></tr>;})}
              </tbody></table></div>
        }</>}/>
    </div>
    {editId&&ei&&<EditModal title="Editar Deuda" fields={FDS} data={ei} onSave={d=>save(editId,d)} onClose={()=>setEdit(null)}/>}
    {payId&&pi&&<PayMod title={`Pagar — ${pi.name}`} current={pi.balance} cur={cur} onPay={a=>regPay(pi.id,a)} onClose={()=>setPay(null)}/>}
  </div>;
}

// ═══════════════════════════
//  PLAN
// ═══════════════════════════
function Plan({s,cur,mob,sortedDebts:sd,disponible:dis}){
  const T=useThm();const bala=Math.max(0,dis);const tdNow=sd.reduce((a,d)=>a+n(d.balance),0);
  const proj=()=>{if(!sd.length)return[];let ds=sd.map(d=>({...d,bal:n(d.balance),min:n(d.minPayment),rate:n(d.rate)}));let ex=bala;const out=[];
    for(let m=0;m<30;m++){ds=ds.map(d=>({...d,bal:d.bal<=0?0:Math.max(0,d.bal*(1+d.rate/100/12)-d.min)}));let rem=ex;for(let i=0;i<ds.length&&rem>0;i++){if(ds[i].bal>0){const p=Math.min(rem,ds[i].bal);ds[i]={...ds[i],bal:ds[i].bal-p};rem-=p;if(ds[i].bal<=0&&i<ds.length-1)ex+=ds[i].min;}}const tot=ds.reduce((a,d)=>a+d.bal,0);out.push({m:m+1,tot});if(tot<=0)break;}return out;};
  const prj=proj();const freeAt=prj.findIndex(m=>m.tot<=0)+1;
  return <div>
    <SHd ti="🎯 Plan Estratégico" su="Tu hoja de ruta hacia la libertad financiera" mb={mob}/>
    {sd.length>0&&<div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)",gap:mob?9:12,marginBottom:mob?12:20}}>
      {[{lb:"Deuda Hoy",v:fm(tdNow,cur),c:T.red,ic:"📉"},{lb:"Bala Extra / Mes",v:fm(bala,cur),c:T.gold,ic:"🎯"},{lb:freeAt>0?"Libertad en":"Necesitas más bala",v:freeAt>0?`~${(freeAt/12).toFixed(1)} años (${freeAt}m)`:"Sin proyección",c:T.green,ic:"🏆"}].map(k=><Card key={k.lb} ch={<div style={{textAlign:"center"}}><div style={{fontSize:mob?28:38,marginBottom:9}}>{k.ic}</div><div className="dp mn" style={{fontSize:mob?15:20,color:k.c,marginBottom:4}}>{k.v}</div><div className="bg" style={{fontSize:10,color:T.mut}}>{k.lb}</div></div>} style={{padding:mob?14:24}}/>)}
    </div>}
    {prj.length>0&&<Card ch={<><div className="bg" style={{fontSize:14,marginBottom:14}}>Proyección Mes a Mes</div>
      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:100,paddingBottom:4}}>
        {prj.slice(0,22).map((m,i)=>{const h=tdNow>0?(m.tot/tdNow)*100:0;const col=h>70?T.red:h>30?T.gold:T.green;return <div key={i} title={`Mes ${m.m}: ${fm(m.tot,cur)}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",height:`${Math.max(2,h)}%`,background:col,borderRadius:"3px 3px 0 0",opacity:.85}}/><div style={{fontSize:7,color:T.mut,writingMode:"vertical-rl",transform:"rotate(180deg)"}}>M{m.m}</div></div>;})}
      </div></> } style={{marginBottom:mob?12:16}}/>}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:mob?9:12,marginBottom:mob?12:16}}>
      {[{ms:"1",ic:"🔍",t:"Diagnóstico",d:"Completa todos tus datos con números reales. Cancela suscripciones innecesarias. Identifica los 3 gastos más altos."},
        {ms:"2",ic:"💥",t:"Primer Impacto",d:`Lanza tu bala extra (${fm(bala,cur)}/mes) sobre la deuda prioritaria. Crea un fondo de emergencia de 1 mes.`},
        {ms:"3–4",ic:"🚀",t:"Aceleración",d:"Busca ingreso adicional. El 100% de ese dinero va a deudas. Si liquidas una, redirige su pago a la siguiente."},
        {ms:"5–6",ic:"📊",t:"Revisión y Ajuste",d:"Evalúa tu progreso. ¿Cuánto bajó tu deuda? Si hay liquidez extra, haz un pago extraordinario."},
        {ms:"7–9",ic:"⚡",t:"Momentum",d:"Deberías tener al menos una deuda liquidada. Sube tu fondo de emergencia a 2–3 meses."},
        {ms:"10–12",ic:"🏁",t:"Recta Final",d:"Consolida hábitos. Proyecta tu fecha exacta de libertad. Planifica tu primer objetivo post-deuda."}
      ].map((st,i)=><Card key={i} ch={<div style={{display:"flex",gap:11,alignItems:"flex-start"}}><span style={{fontSize:20,flexShrink:0}}>{st.ic}</span><div><div style={{display:"flex",gap:7,marginBottom:5,alignItems:"center"}}><Bdg ch={`Mes ${st.ms}`} c={T.gold}/><span className="bg" style={{fontSize:12}}>{st.t}</span></div><p style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{st.d}</p></div></div>} style={{borderLeft:`3px solid ${T.gold}44`,padding:mob?13:18}}/>)}
    </div>
    <Card ch={<><div className="bg" style={{fontSize:15,marginBottom:16}}>📏 Reglas de Disciplina</div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:9}}>
        {[{i:"1️⃣",t:"Pago Primero",d:"Al cobrar, lo primero que sale es pago de deudas y ahorro. Lo que queda es para vivir."},
          {i:"⏰",t:"Regla 24h",d:"Para compras no planeadas, espera 24h. El 70% de las veces ya no las querrás."},
          {i:"💡",t:"Ingreso Extra",d:"Dinero inesperado: 70% a deudas/ahorro, 30% para ti."},
          {i:"🛡️",t:"Fondo Emergencia",d:"3–6 meses de gastos mínimos, intocables. Sin este colchón cualquier imprevisto te regresa a deuda."}
        ].map(r=><div key={r.t} style={{background:T.l1,borderRadius:11,padding:14,border:`1px solid ${T.bd}`}}><div style={{fontSize:20,marginBottom:7}}>{r.i}</div><div className="bg" style={{fontSize:12,color:T.gold,marginBottom:4}}>{r.t}</div><p style={{fontSize:11,color:T.mut,lineHeight:1.6}}>{r.d}</p></div>)}
      </div></>}/>
  </div>;
}

// ═══════════════════════════
//  AGENDA / CALENDARIO
// ═══════════════════════════
function Cal({s,upd,cur,mob}){
  const T=useThm();const now=new Date();const[vm,setVm]=useState(now.getMonth());const[vy,setVy]=useState(now.getFullYear());
  const evs=[
    ...s.fixedExp.filter(e=>e.day).map(e=>({day:n(e.day),lb:e.name,amt:e.amount,c:T.blue,tp:"Gasto Fijo"})),
    ...(s.cards||[]).filter(c=>c.dueDay).map(c=>({day:n(c.dueDay),lb:`${c.bank} ···${c.last4||"••••"}`,amt:c.type==="credito"?c.balance:0,c:T.purple,tp:"Tarjeta"})),
    ...s.debts.filter(d=>d.dueDay).map(d=>({day:n(d.dueDay),lb:d.name,amt:d.minPayment,c:T.red,tp:"Deuda"})),
    ...s.incomes.filter(i=>i.day).map(i=>({day:n(i.day),lb:i.name,amt:i.amount,c:T.green,tp:"Ingreso"})),
  ].sort((a,b)=>a.day-b.day);
  const dim=new Date(vy,vm+1,0).getDate();const fd=new Date(vy,vm,1).getDay();
  const pM=()=>vm===0?(setVm(11),setVy(y=>y-1)):setVm(m=>m-1);const nM=()=>vm===11?(setVm(0),setVy(y=>y+1)):setVm(m=>m+1);
  const key=(d,l)=>`${vy}-${vm}-${d}-${l}`;const isDone=(d,l)=>!!s.payments[key(d,l)];
  const tog=(d,l)=>upd({payments:{...s.payments,[key(d,l)]:!isDone(d,l)}});
  const toPay=evs.filter(e=>e.tp!=="Ingreso").reduce((a,e)=>a+n(e.amt),0);
  const toCob=evs.filter(e=>e.tp==="Ingreso").reduce((a,e)=>a+n(e.amt),0);
  return <div>
    <SHd ti="▦ Agenda de Pagos" su="Visualiza vencimientos y cobros del mes" mb={mob}/>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"3fr 2fr",gap:mob?10:18}}>
      <Card ch={<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><Btn ch="← Ant." v="ghost" sm onClick={pM}/><div className="dp" style={{fontSize:19,color:T.wh}}>{MOS[vm]} {vy}</div><Btn ch="Sig. →" v="ghost" sm onClick={nM}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>{["D","L","M","X","J","V","S"].map(d=><div key={d} className="bg" style={{textAlign:"center",fontSize:9,color:T.mut,padding:"2px 0"}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:dim}).map((_,i)=>{
            const day=i+1;const dEvs=evs.filter(e=>e.day===day);const isT=day===now.getDate()&&vm===now.getMonth()&&vy===now.getFullYear();
            return <div key={day} style={{minHeight:mob?50:65,background:isT?`${T.gold}12`:T.l1,border:`1.5px solid ${isT?T.gold+"55":T.bd+"44"}`,borderRadius:9,padding:"3px 3px"}}>
              <div className="mn" style={{fontSize:9,fontWeight:700,marginBottom:2,color:isT?T.gold:T.mut,textAlign:"center"}}>{day}</div>
              {dEvs.map((ev,j)=>{const done=isDone(day,ev.lb);return <div key={j} onClick={()=>tog(day,ev.lb)} style={{background:done?`${T.green}18`:`${ev.c}14`,color:done?T.green:ev.c,border:`1px solid ${done?T.green:ev.c}28`,borderRadius:3,padding:"1px 3px",marginBottom:2,fontSize:8,lineHeight:1.5,cursor:"pointer",textDecoration:done?"line-through":"none",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{done?"✓":""}{ev.lb.slice(0,mob?5:8)}</div>;})}
            </div>;})}
        </div>
        <p style={{marginTop:9,fontSize:11,color:T.mut}}>💡 Toca un evento para marcarlo como completado</p>
      </>}/>
      <Card ch={<><div className="bg" style={{fontSize:15,marginBottom:16}}>Eventos — {MOS[vm].slice(0,3)}</div>
        {evs.length===0?<Empty ic="📅" tx="Agrega días de vencimiento en gastos, tarjetas y deudas"/>:<>
          <div style={{maxHeight:340,overflowY:"auto",marginBottom:14}}>
            {evs.map((ev,i)=>{const done=isDone(ev.day,ev.lb);return <div key={i} onClick={()=>tog(ev.day,ev.lb)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 11px",borderRadius:10,marginBottom:5,background:done?`${T.green}0c`:T.l1,border:`1.5px solid ${done?T.green+"28":T.bd+"33"}`,cursor:"pointer",opacity:done?.7:1,transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}><div className="mn" style={{width:26,height:26,borderRadius:7,background:`${ev.c}18`,color:ev.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{ev.day}</div>
                <div><div style={{fontSize:13,fontWeight:600,textDecoration:done?"line-through":"none",marginBottom:1}}>{ev.lb}</div><div style={{fontSize:10,color:T.mut}}>{ev.tp}</div></div></div>
              <div style={{textAlign:"right"}}><div className="mn" style={{fontSize:12,color:ev.c,fontWeight:600}}>{fm(ev.amt,cur)}</div><div style={{fontSize:10,color:done?T.green:T.mut}}>{done?"✓ Listo":"Pendiente"}</div></div>
            </div>;})}
          </div>
          <Dv/>
          {[{lb:"A pagar",v:toPay,c:T.red},{lb:"A cobrar",v:toCob,c:T.green},{lb:"Balance",v:toCob-toPay,c:(toCob-toPay)>=0?T.green:T.red}].map(r=><div key={r.lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13,color:T.sub}}>{r.lb}</span><span className="mn" style={{fontSize:13,color:r.c,fontWeight:700}}>{fm(r.v,cur)}</span></div>)}
        </>}</>}/>
    </div>
  </div>;
}
