
import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { contentApi } from './services/api';

// ─── CYBERPUNK DESIGN TOKENS ──────────────────────────────────────────────────
const C = {
  bg:        '#04040f',
  bgCard:    '#080818',
  bgHover:   '#0e0e28',
  cyan:      '#00f5ff',
  magenta:   '#ff00cc',
  yellow:    '#f5e642',
  green:     '#39ff14',
  orange:    '#ff6b1a',
  text:      '#c8d0f0',
  muted:     '#4a4a7a',
  border:    '#1c1c3a',
  glowCyan:  '0 0 12px #00f5ff88, 0 0 30px #00f5ff33',
  glowMag:   '0 0 12px #ff00cc88, 0 0 30px #ff00cc33',
  glowYell:  '0 0 12px #f5e64288, 0 0 30px #f5e64233',
};

const CATS = [
  { id:'fitness',       name:'Fitness',        icon:'⚡', color: '#39ff14' },
  { id:'coding',        name:'Coding',         icon:'⌬', color: '#00f5ff' },
  { id:'food',          name:'Food',           icon:'◉', color: '#ff6b1a' },
  { id:'travel',        name:'Travel',         icon:'◎', color: '#f5e642' },
  { id:'design',        name:'Design',         icon:'◈', color: '#ff00cc' },
  { id:'fashion',       name:'Fashion',        icon:'◇', color: '#cc88ff' },
  { id:'business',      name:'Business',       icon:'▣', color: '#f5e642' },
  { id:'education',     name:'Education',      icon:'◬', color: '#00f5ff' },
  { id:'entertainment', name:'Entertainment',  icon:'▶', color: '#ff00cc' },
  { id:'other',         name:'Other',          icon:'◌', color: '#4a4a7a' },
];

const PLATFORM_CONFIG = {
  instagram:  { label: 'Instagram', color: '#e1306c', bg: '#e1306c22' },
  youtube:    { label: 'YouTube',   color: '#ff0000', bg: '#ff000022' },
  twitter:    { label: 'Twitter/X', color: '#1da1f2', bg: '#1da1f222' },
  facebook:   { label: 'Facebook',  color: '#1877f2', bg: '#1877f222' },
  blog:       { label: 'Blog',      color: '#39ff14', bg: '#39ff1422' },
  other:      { label: 'Link',      color: '#4a4a7a', bg: '#4a4a7a22' },
};

const PIE_COLORS = ['#00f5ff','#ff00cc','#39ff14','#f5e642','#ff6b1a','#cc88ff','#ff6b6b','#1da1f2'];

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#04040f; font-family:'Share Tech Mono',monospace; color:#c8d0f0; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#04040f; }
  ::-webkit-scrollbar-thumb { background:#00f5ff44; border-radius:2px; }
  .cyber-grid {
    background-image:
      linear-gradient(#00f5ff08 1px,transparent 1px),
      linear-gradient(90deg,#00f5ff08 1px,transparent 1px);
    background-size:40px 40px;
  }
  @keyframes slide-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px #00f5ff44} 50%{box-shadow:0 0 22px #00f5ff88,0 0 44px #00f5ff22} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes flicker {
    0%,100%{opacity:1} 10%{opacity:0.8} 20%{opacity:1} 30%{opacity:0.9}
    40%{opacity:1} 60%{opacity:0.85} 70%{opacity:1}
  }
  @keyframes modal-in {
    from{opacity:0;transform:scale(0.92) translateY(20px)}
    to{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes border-spin {
    to { transform: rotate(360deg); }
  }
  .slide-up { animation:slide-up 0.3s ease forwards; }
  .card-anim { transition:all 0.2s ease; }
  .card-anim:hover { transform:translateY(-3px); }
  .neon-text { color:#00f5ff; text-shadow:0 0 10px #00f5ff88; font-family:'Orbitron',monospace; }
  .neon-mag  { color:#ff00cc; text-shadow:0 0 10px #ff00cc88; font-family:'Orbitron',monospace; }
  .neon-yell { color:#f5e642; text-shadow:0 0 10px #f5e64288; font-family:'Orbitron',monospace; }
  .tag {
    display:inline-flex;align-items:center;gap:4px;
    padding:2px 8px;border-radius:2px;font-size:11px;
    font-family:'Share Tech Mono',monospace;border:1px solid;letter-spacing:0.5px;
  }
  .btn-cyber {
    background:transparent;border:1px solid #00f5ff;color:#00f5ff;
    padding:7px 16px;font-family:'Orbitron',monospace;font-size:10px;
    letter-spacing:1px;cursor:pointer;transition:all 0.2s;
    clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
  }
  .btn-cyber:hover,.btn-cyber.active { background:#00f5ff22; box-shadow:0 0 12px #00f5ff88,0 0 30px #00f5ff33; }
  .btn-mag { border-color:#ff00cc !important; color:#ff00cc !important; }
  .btn-mag:hover,.btn-mag.active { background:#ff00cc22 !important; box-shadow:0 0 12px #ff00cc88 !important; }
  .btn-yell { border-color:#f5e642 !important; color:#f5e642 !important; }
  .btn-yell:hover,.btn-yell.active { background:#f5e64222 !important; box-shadow:0 0 12px #f5e64288 !important; }
  .inspo-btn {
    background: transparent;
    border: 1px solid #f5e642;
    color: #f5e642;
    padding: 7px 16px;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
    position: relative;
    overflow: hidden;
  }
  .inspo-btn:hover {
    background: #f5e64222;
    box-shadow: 0 0 12px #f5e64288, 0 0 30px #f5e64233;
    animation: flicker 0.4s ease;
  }
  .inspo-btn::before {
    content: '';
    position: absolute;
    top: -1px; left: -100%;
    width: 60%; height: calc(100% + 2px);
    background: linear-gradient(90deg, transparent, #f5e64233, transparent);
    transition: left 0.4s ease;
  }
  .inspo-btn:hover::before { left: 150%; }
  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(4,4,15,0.92);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .modal-box {
    animation: modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
    max-width: 560px; width: 100%;
  }
  input::placeholder { color:#4a4a7a; }
  input:focus { outline:none; }
`;

// ─── UTILS ─────────────────────────────────────────────────────────────────────
const timeAgo = d => {
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if(m<1) return 'just now';
  if(m<60) return `${m}m ago`;
  const h=Math.floor(m/60);
  if(h<24) return `${h}h ago`;
  const dy=Math.floor(h/24);
  return dy<7?`${dy}d ago`:new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
};
const fmtDt = d => new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true});
const catColor = id => CATS.find(c=>c.id===id)?.color || C.muted;

// ─── RANDOM INSPIRATION MODAL ─────────────────────────────────────────────────
function InspirationModal({ contents, onClose }) {
  const [item, setItem]     = useState(null);
  const [rolling, setRolling] = useState(false);
  const intervalRef = React.useRef(null);   // store interval so we can clear on unmount

  const pickRandom = useCallback(() => {
    if (!contents.length) return;
    // Clear any existing roll before starting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRolling(true);
    let count = 0;
    const max = 8;
    intervalRef.current = setInterval(() => {
      const rand = contents[Math.floor(Math.random() * contents.length)];
      setItem(rand);
      count++;
      if (count >= max) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRolling(false);
      }
    }, 80);
  }, [contents]);

  // Pick one immediately on open; clean up interval on unmount
  useEffect(() => {
    pickRandom();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pickRandom]);

  if (!item) return null;

  const color  = catColor(item.category);
  const plat   = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:16,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:32, height:32, border:`2px solid ${C.yellow}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:C.glowYell, fontSize:16,
              clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
              background:`${C.yellow}22`,
            }}>✦</div>
            <div>
              <div className="neon-yell" style={{fontSize:13, letterSpacing:3}}>
                RANDOM INSPIRATION
              </div>
              <div style={{fontSize:9, color:C.muted, letterSpacing:2}}>
                FROM YOUR KNOWLEDGE BASE
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:18,
              transition:'color 0.2s'}}
            onMouseEnter={e=>e.target.style.color=C.magenta}
            onMouseLeave={e=>e.target.style.color=C.muted}>✕
          </button>
        </div>

        {/* Card */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${rolling ? C.yellow+'88' : color+'88'}`,
          borderLeft: `4px solid ${rolling ? C.yellow : color}`,
          boxShadow: rolling
            ? `0 0 30px ${C.yellow}33, -3px 0 0 ${C.yellow}`
            : `0 0 30px ${color}22, -3px 0 0 ${color}`,
          borderRadius:2, padding:20,
          transition:'all 0.1s ease',
          opacity: rolling ? 0.7 : 1,
          position: 'relative', overflow:'hidden',
        }}>
          {/* Corner accent */}
          <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderStyle:'solid',
            borderWidth:'0 22px 22px 0',borderColor:`transparent ${color}66 transparent transparent`}}/>

          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center',marginBottom:12}}>
            <span className="tag" style={{color:plat.color,borderColor:plat.color+'55',background:plat.bg}}>
              {plat.label}
            </span>
            <span className="tag" style={{color,borderColor:color+'55',background:color+'15'}}>
              {item.category}
            </span>
            <span style={{marginLeft:'auto',fontSize:10,color:C.muted}}>
              {timeAgo(item.created_at)}
            </span>
          </div>

          <div style={{fontFamily:'Orbitron,monospace',fontSize:13,color:'#e8eaff',
            lineHeight:1.6, marginBottom:10}}>
            {item.title || 'Instagram Content'}
          </div>

          {item.ai_summary && (
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:12,
              borderLeft:`2px solid ${color}44`, paddingLeft:10}}>
              {item.ai_summary}
            </div>
          )}

          {item.tags?.length > 0 && (
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:14}}>
              {item.tags.map(t=>(
                <span key={t} className="tag"
                  style={{color:C.muted,borderColor:C.border,fontSize:10}}>#{t}</span>
              ))}
            </div>
          )}

          <a href={item.url} target="_blank" rel="noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:6,
              color:C.cyan, fontSize:11, textDecoration:'none', letterSpacing:1,
              padding:'6px 14px', border:`1px solid ${C.cyan}44`,
              background:`${C.cyan}11`, transition:'all 0.2s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${C.cyan}22`;e.currentTarget.style.boxShadow=C.glowCyan;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${C.cyan}11`;e.currentTarget.style.boxShadow='none';}}>
            OPEN LINK ↗
          </a>
        </div>

        {/* Roll again button */}
        <div style={{display:'flex',justifyContent:'center',marginTop:16,gap:12}}>
          <button className="inspo-btn" onClick={pickRandom} disabled={rolling}
            style={{opacity: rolling ? 0.6 : 1, fontSize:11, padding:'10px 28px'}}>
            {rolling ? '◈ ROLLING...' : '✦ ROLL AGAIN'}
          </button>
          <button className="btn-cyber" onClick={onClose} style={{fontSize:10}}>
            CLOSE
          </button>
        </div>

        <div style={{textAlign:'center',marginTop:12,fontSize:10,color:C.muted}}>
          {contents.length} items in your knowledge base
        </div>
      </div>
    </div>
  );
}

// ─── CONTENT CARD ──────────────────────────────────────────────────────────────
function ContentCard({ content, onDelete }) {
  const plat  = PLATFORM_CONFIG[content.platform] || PLATFORM_CONFIG.other;
  const color = catColor(content.category);
  const [h, setH] = useState(false);
  return (
    <div
      className="card-anim"
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: h ? C.bgHover : C.bgCard,
        border:`1px solid ${h?color+'88':C.border}`,
        borderLeft:`3px solid ${color}`,
        boxShadow: h ? `0 0 20px ${color}22,-2px 0 0 ${color}` : 'none',
        borderRadius:2, padding:16,
        display:'flex', flexDirection:'column', gap:10,
        position:'relative', overflow:'hidden',
      }}
    >
      <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderStyle:'solid',
        borderWidth:'0 18px 18px 0',borderColor:`transparent ${color}55 transparent transparent`}}/>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        <span className="tag" style={{color:plat.color,borderColor:plat.color+'55',background:plat.bg}}>
          {plat.label}
        </span>
        <span className="tag" style={{color,borderColor:color+'55',background:color+'15'}}>
          {content.category}
        </span>
      </div>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#e8eaff',lineHeight:1.5}}>
        {content.title||'Instagram Content'}
      </div>
      {content.ai_summary&&(
        <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{content.ai_summary}</div>
      )}
      {content.tags?.length>0&&(
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {content.tags.map(t=>(
            <span key={t} className="tag" style={{color:C.muted,borderColor:C.border,fontSize:10}}>#{t}</span>
          ))}
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
        <div style={{fontSize:10,color:C.muted}}>
          <span style={{color:color+'aa'}}>▸ </span>
          {content.created_at?fmtDt(content.created_at):''}
          <span style={{marginLeft:6,color:C.muted+'88'}}>({timeAgo(content.created_at)})</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <a href={content.url} target="_blank" rel="noreferrer"
            style={{color:C.cyan,fontSize:10,textDecoration:'none',letterSpacing:1}}>
            OPEN ↗
          </a>
          <button onClick={e=>{e.stopPropagation();onDelete();}}
            style={{background:'none',border:'none',color:C.magenta+'88',cursor:'pointer',fontSize:10}}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY TILE ─────────────────────────────────────────────────────────────
function CategoryTile({ cat, count, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      className="card-anim"
      onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: h ? cat.color+'18' : C.bgCard,
        border:`1px solid ${h?cat.color:cat.color+'33'}`,
        boxShadow: h ? `0 0 22px ${cat.color}22` : 'none',
        borderRadius:2, padding:'20px 16px',
        display:'flex', flexDirection:'column', gap:8,
        cursor:'pointer',
        clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
      }}
    >
      <div style={{fontSize:28,lineHeight:1}}>{cat.icon}</div>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:cat.color,letterSpacing:1}}>
        {cat.name.toUpperCase()}
      </div>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:28,color:'#e8eaff',fontWeight:900,
        textShadow:`0 0 15px ${cat.color}66`}}>
        {count}
      </div>
      <div style={{fontSize:10,color:C.muted}}>items saved</div>
    </div>
  );
}

const CustomTooltip = ({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:C.bgCard,border:`1px solid ${C.cyan}44`,padding:'8px 12px',
      fontFamily:'Share Tech Mono,monospace',fontSize:12}}>
      <p style={{color:C.cyan}}>{label||payload[0]?.name}</p>
      <p style={{color:C.text}}>{payload[0]?.value} items</p>
    </div>
  );
};

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [contents, setContents]       = useState([]);
  const [stats, setStats]             = useState({total_contents:0,category_counts:{}});
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState('home');
  const [activeCat, setActiveCat]     = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInspo, setShowInspo]     = useState(false);   // ← NEW
  const userPhone = '+918088655740';

  const loadAll = useCallback(async()=>{
    try {
      setLoading(true);
      const [cr, sr] = await Promise.all([
        contentApi.getContents(userPhone),
        contentApi.getUserStats(userPhone),
      ]);
      setContents(cr.contents||[]);
      setStats(sr||{total_contents:0,category_counts:{}});
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ loadAll(); },[loadAll]);
  useEffect(()=>{ const t=setInterval(loadAll,15000); return()=>clearInterval(t); },[loadAll]);

  const del = async id => {
    if(!window.confirm('Delete?')) return;
    try{ await contentApi.deleteContent(id); loadAll(); }catch(e){}
  };

  // Derived
  const filtered = (() => {
    let items = [...contents];
    if(view==='category' && activeCat && activeCat!=='all')
      items = items.filter(c=>c.category===activeCat);
    if(view==='search' && searchQuery)
      items = items.filter(c=>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase())||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())||
        c.ai_summary?.toLowerCase().includes(searchQuery.toLowerCase())||
        c.tags?.some(t=>t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    return items;
  })();

  const pieData = Object.entries(stats.category_counts).filter(([,v])=>v>0).map(([name,value])=>({name,value}));
  const barData = Object.entries(stats.category_counts).filter(([,v])=>v>0).sort(([,a],[,b])=>b-a)
    .map(([name,value])=>({name:name.slice(0,5).toUpperCase(),value,fullName:name}));
  const platCounts = contents.reduce((a,c)=>{a[c.platform]=(a[c.platform]||0)+1;return a;},{});
  const thisWeek = contents.filter(c=>new Date(c.created_at)>new Date(Date.now()-7*864e5)).length;

  return(
    <>
      <style>{globalStyles}</style>

      {/* ── RANDOM INSPIRATION MODAL ── */}
      {showInspo && contents.length > 0 && (
        <InspirationModal contents={contents} onClose={()=>setShowInspo(false)}/>
      )}

      {/* Scanlines */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:9999,
        backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)'}}/>

      <div className="cyber-grid" style={{minHeight:'100vh'}}>

        {/* HEADER */}
        <header style={{background:`${C.bg}ee`,backdropFilter:'blur(10px)',
          borderBottom:`1px solid ${C.cyan}33`,position:'sticky',top:0,zIndex:100,padding:'0 24px'}}>
          <div style={{maxWidth:1400,margin:'0 auto',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setView('home')}>
              <div style={{width:36,height:36,border:`2px solid ${C.cyan}`,display:'flex',alignItems:'center',
                justifyContent:'center',boxShadow:C.glowCyan,
                clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',background:C.cyan+'22'}}>
                <span style={{color:C.cyan,fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:12}}>SS</span>
              </div>
              <div>
                <div className="neon-text" style={{fontSize:15,letterSpacing:3}}>SOCIAL SAVER</div>
                <div style={{fontSize:9,color:C.muted,letterSpacing:2}}>KNOWLEDGE_BASE v1.0</div>
              </div>
            </div>
            <nav style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className={`btn-cyber${view==='home'?' active':''}`} onClick={()=>setView('home')}>HOME</button>
              <button className={`btn-cyber${view==='stats'?' active':''}`} onClick={()=>setView('stats')}>STATS</button>
              <button className={`btn-cyber btn-mag${view==='search'?' active':''}`} onClick={()=>setView('search')}>SEARCH</button>

              {/* ── RANDOM INSPIRATION BUTTON ── */}
              <button
                className="inspo-btn"
                onClick={() => contents.length > 0 ? setShowInspo(true) : null}
                title={contents.length === 0 ? 'Save some links first!' : 'Get random inspiration'}
                style={{ opacity: contents.length === 0 ? 0.4 : 1 }}
              >
                ✦ INSPIRE ME
              </button>

              <div style={{color:C.green,fontSize:10,fontFamily:'Orbitron,monospace',marginLeft:12,padding:'4px 10px',
                border:`1px solid ${C.green}44`,background:C.green+'11'}}>
                <span style={{color:C.muted}}>SAVED: </span>
                <span style={{color:C.cyan,fontWeight:700}}>{stats.total_contents}</span>
              </div>
            </nav>
          </div>
        </header>

        <main style={{maxWidth:1400,margin:'0 auto',padding:'24px 24px 60px'}}>

          {/* ── HOME ── */}
          {view==='home'&&(
            <div className="slide-up">
              {/* Hero */}
              <div style={{background:`linear-gradient(135deg,${C.cyan}0d,${C.magenta}0d)`,
                border:`1px solid ${C.cyan}33`,borderRadius:2,padding:'20px 24px',marginBottom:28,
                display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <div className="neon-text" style={{fontSize:20,letterSpacing:2,marginBottom:4}}>YOUR CONTENT MATRIX</div>
                  <div style={{color:C.muted,fontSize:11}}>
                    Send Instagram · YouTube · Twitter · Facebook links to WhatsApp → they appear here automatically
                  </div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                  {/* Inspire Me also appears in hero for discoverability */}
                  <button
                    className="inspo-btn"
                    onClick={() => contents.length > 0 ? setShowInspo(true) : null}
                    style={{
                      opacity: contents.length === 0 ? 0.4 : 1,
                      fontSize:11, padding:'10px 20px',
                    }}
                  >
                    ✦ INSPIRE ME
                  </button>
                  {Object.entries(platCounts).map(([pl,cnt])=>{
                    const p=PLATFORM_CONFIG[pl]||PLATFORM_CONFIG.other;
                    return(
                      <div key={pl} style={{padding:'6px 14px',border:`1px solid ${p.color}44`,background:p.bg,borderRadius:2}}>
                        <div style={{fontSize:9,color:p.color,letterSpacing:1}}>{p.label.toUpperCase()}</div>
                        <div style={{fontSize:22,fontFamily:'Orbitron,monospace',color:'#e8eaff',fontWeight:700}}>{cnt}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Folders */}
              <div style={{marginBottom:32}}>
                <SectionTitle color={C.cyan} label="CATEGORY FOLDERS" />
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:12}}>
                  {CATS.map(cat=>(
                    <CategoryTile key={cat.id} cat={cat}
                      count={stats.category_counts[cat.id]||0}
                      onClick={()=>{setActiveCat(cat.id);setView('category');}}/>
                  ))}
                </div>
              </div>

              {/* Recent Saves */}
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <SectionTitle color={C.magenta} label="RECENT SAVES" />
                  <button className="btn-cyber" onClick={()=>{setActiveCat('all');setView('category');}}>
                    VIEW ALL →
                  </button>
                </div>
                {loading ? <Spinner/> : contents.length===0 ? <Empty/> : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
                    {contents.slice(0,6).map(c=><ContentCard key={c.id} content={c} onDelete={()=>del(c.id)}/>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CATEGORY VIEW ── */}
          {view==='category'&&(
            <div className="slide-up">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
                <button onClick={()=>setView('home')}
                  style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:11}}>← HOME</button>
                <span style={{color:C.border}}>|</span>
                <span className="neon-text" style={{fontSize:13,letterSpacing:2}}>
                  {CATS.find(c=>c.id===activeCat)?.name?.toUpperCase()||'ALL CONTENT'}
                </span>
                <span style={{marginLeft:'auto',color:C.muted,fontSize:11}}>{filtered.length} ITEMS</span>
              </div>
              {/* Cat filter pills */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
                <button className={`btn-cyber${activeCat==='all'?' active':''}`}
                  onClick={()=>setActiveCat('all')} style={{fontSize:9}}>◈ ALL</button>
                {CATS.map(cat=>(
                  <button key={cat.id} onClick={()=>setActiveCat(cat.id)}
                    style={{
                      background: activeCat===cat.id ? cat.color+'22' : 'transparent',
                      border: `1px solid ${activeCat===cat.id ? cat.color : C.border}`,
                      color: activeCat===cat.id ? cat.color : C.muted,
                      padding:'5px 12px', fontFamily:'Orbitron,monospace', fontSize:9, letterSpacing:1,
                      cursor:'pointer', transition:'all 0.2s',
                      clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
                    }}>
                    {cat.icon} {cat.name.toUpperCase()}
                  </button>
                ))}
              </div>
              {loading?<Spinner/>:filtered.length===0?<Empty/>:(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
                  {filtered.map(c=><ContentCard key={c.id} content={c} onDelete={()=>del(c.id)}/>)}
                </div>
              )}
            </div>
          )}

          {/* ── STATS ── */}
          {view==='stats'&&(
            <div className="slide-up">
              <SectionTitle color={C.yellow} label="ANALYTICS MATRIX" style={{marginBottom:28}}/>

              {/* Big numbers */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14,marginBottom:28}}>
                {[
                  {label:'TOTAL SAVED',  value:stats.total_contents, color:C.cyan},
                  {label:'CATEGORIES',   value:Object.keys(stats.category_counts).length, color:C.magenta},
                  {label:'PLATFORMS',    value:Object.keys(platCounts).length, color:C.green},
                  {label:'THIS WEEK',    value:thisWeek, color:C.yellow},
                ].map(s=>(
                  <div key={s.label} style={{background:C.bgCard,border:`1px solid ${s.color}44`,
                    borderTop:`2px solid ${s.color}`,padding:'20px 16px',borderRadius:2}}>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:10}}>{s.label}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:38,color:s.color,fontWeight:900,
                      textShadow:`0 0 20px ${s.color}66`}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
                <div style={{background:C.bgCard,border:`1px solid ${C.cyan}22`,borderRadius:2,padding:20}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:C.cyan,letterSpacing:2,marginBottom:14}}>
                    CATEGORY DISTRIBUTION
                  </div>
                  {pieData.length>0?(
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={38}
                          dataKey="value" paddingAngle={3}>
                          {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} opacity={0.85}/>)}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend formatter={v=><span style={{color:C.text,fontSize:10,fontFamily:'Share Tech Mono,monospace'}}>{v}</span>}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ):<NoData/>}
                </div>
                <div style={{background:C.bgCard,border:`1px solid ${C.magenta}22`,borderRadius:2,padding:20}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:C.magenta,letterSpacing:2,marginBottom:14}}>
                    SAVES BY CATEGORY
                  </div>
                  {barData.length>0?(
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={barData} margin={{top:0,right:10,left:-20,bottom:0}}>
                        <XAxis dataKey="name" tick={{fill:C.muted,fontSize:9,fontFamily:'Share Tech Mono,monospace'}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:C.muted,fontSize:9,fontFamily:'Share Tech Mono,monospace'}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="value" radius={[2,2,0,0]}>
                          {barData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ):<NoData/>}
                </div>
              </div>

              {/* Platform progress bars */}
              <div style={{background:C.bgCard,border:`1px solid ${C.green}22`,borderRadius:2,padding:20,marginBottom:20}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:C.green,letterSpacing:2,marginBottom:16}}>
                  PLATFORM BREAKDOWN
                </div>
                <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                  {Object.entries(platCounts).map(([pl,cnt])=>{
                    const p=PLATFORM_CONFIG[pl]||PLATFORM_CONFIG.other;
                    const pct=Math.round((cnt/stats.total_contents)*100)||0;
                    return(
                      <div key={pl} style={{flex:'1 1 160px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                          <span style={{fontSize:11,color:p.color}}>{p.label}</span>
                          <span style={{fontSize:11,color:C.muted}}>{cnt} ({pct}%)</span>
                        </div>
                        <div style={{height:4,background:C.border,borderRadius:2}}>
                          <div style={{height:'100%',width:`${pct}%`,background:p.color,borderRadius:2,
                            boxShadow:`0 0 6px ${p.color}88`,transition:'width 1s ease'}}/>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(platCounts).length===0&&<NoData/>}
                </div>
              </div>

              {/* Activity log */}
              <div style={{background:C.bgCard,border:`1px solid ${C.yellow}22`,borderRadius:2,padding:20}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:C.yellow,letterSpacing:2,marginBottom:14}}>
                  RECENT ACTIVITY LOG
                </div>
                {contents.slice(0,8).map(c=>{
                  const color=catColor(c.category);
                  return(
                    <div key={c.id} style={{display:'flex',gap:12,alignItems:'center',padding:'7px 0',
                      borderBottom:`1px solid ${C.border}`}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}`,flexShrink:0}}/>
                      <span style={{fontSize:10,color:C.muted,width:130,flexShrink:0}}>{fmtDt(c.created_at)}</span>
                      <span className="tag" style={{color,borderColor:color+'44',background:color+'15',fontSize:9,flexShrink:0}}>
                        {c.category}
                      </span>
                      <span style={{fontSize:11,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {c.title||'Instagram Content'}
                      </span>
                    </div>
                  );
                })}
                {contents.length===0&&<NoData/>}
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {view==='search'&&(
            <div className="slide-up">
              <SectionTitle color={C.magenta} label="SEARCH MATRIX" style={{marginBottom:16}}/>
              <div style={{position:'relative',marginBottom:16}}>
                <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',
                  color:C.cyan,fontFamily:'Orbitron,monospace',fontSize:12}}>▸</span>
                <input autoFocus value={searchInput}
                  onChange={e=>setSearchInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')setSearchQuery(searchInput);}}
                  placeholder="TYPE AND PRESS ENTER TO SEARCH..."
                  style={{width:'100%',padding:'14px 14px 14px 36px',background:C.bgCard,
                    border:`1px solid ${C.cyan}44`,borderBottom:`2px solid ${C.cyan}`,
                    color:C.text,fontFamily:'Share Tech Mono,monospace',fontSize:14,borderRadius:2,caretColor:C.cyan}}/>
              </div>
              {searchQuery&&(
                <div style={{marginBottom:16,fontSize:11,color:C.muted}}>
                  RESULTS FOR: <span style={{color:C.cyan}}>"{searchQuery}"</span>
                  <span style={{marginLeft:8}}>— {filtered.length} FOUND</span>
                  <button onClick={()=>{setSearchQuery('');setSearchInput('');}}
                    style={{background:'none',border:'none',color:C.magenta,cursor:'pointer',marginLeft:12,fontSize:11}}>
                    CLEAR ✕
                  </button>
                </div>
              )}
              {filtered.length===0&&searchQuery?(
                <div style={{textAlign:'center',padding:60,color:C.muted}}>
                  <div style={{fontSize:32,marginBottom:8}}>◌</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:12}}>NO RESULTS IN MATRIX</div>
                </div>
              ):(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
                  {filtered.map(c=><ContentCard key={c.id} content={c} onDelete={()=>del(c.id)}/>)}
                </div>
              )}
            </div>
          )}

        </main>

        <footer style={{borderTop:`1px solid ${C.cyan}22`,padding:'10px 24px',
          display:'flex',justifyContent:'space-between',alignItems:'center',color:C.muted,fontSize:10}}>
          <span style={{fontFamily:'Orbitron,monospace',letterSpacing:2}}>SOCIAL_SAVER_BOT</span>
          <span>Send any link on WhatsApp → appears here automatically (refreshes every 15s)</span>
          <span style={{color:C.green}}>● ONLINE</span>
        </footer>
      </div>
    </>
  );
}

// ─── MICRO COMPONENTS ──────────────────────────────────────────────────────────
function SectionTitle({color,label}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
      <div style={{width:3,height:18,background:color,boxShadow:`0 0 12px ${color}88`}}/>
      <span style={{fontFamily:'Orbitron,monospace',fontSize:11,color,letterSpacing:3}}>{label}</span>
    </div>
  );
}
function Empty(){
  return(
    <div style={{textAlign:'center',padding:60,color:C.muted}}>
      <div style={{fontSize:44,marginBottom:10,opacity:0.3}}>◌</div>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:13,marginBottom:8}}>NO DATA IN MATRIX</div>
      <div style={{fontSize:11}}>Send Instagram · YouTube · Twitter · Facebook links to WhatsApp to begin.</div>
    </div>
  );
}
function Spinner(){
  return(
    <div style={{textAlign:'center',padding:60,color:C.cyan}}>
      <div style={{fontSize:36,animation:'spin 2s linear infinite',display:'inline-block'}}>◈</div>
      <div style={{marginTop:12,fontSize:10,fontFamily:'Orbitron,monospace',letterSpacing:2}}>LOADING MATRIX...</div>
    </div>
  );
}
function NoData(){
  return <div style={{color:C.muted,fontSize:11,padding:'16px 0',textAlign:'center'}}>NO DATA YET</div>;
}
