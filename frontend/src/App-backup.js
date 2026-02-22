// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Plus, Trash2, ExternalLink, BarChart3, Heart, Share2 } from 'lucide-react';
// import ContentCard from './components/ContentCard';
// import CategoryFilter from './components/CategoryFilter';
// import SearchBar from './components/SearchBar';
// import StatsCard from './components/StatsCard';
// import { contentApi } from './services/api';
// import './App.css';

// function App() {
//   const [contents, setContents] = useState([]);
//   const [filteredContents, setFilteredContents] = useState([]);
//   const [stats, setStats] = useState({ total_contents: 0, category_counts: {} });
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [showAddLink, setShowAddLink] = useState(false);
//   const [showStats, setShowStats] = useState(false);
//   const [newLink, setNewLink] = useState('');
//   const [userPhone] = useState('+918088655740'); // Your actual WhatsApp number without whatsapp: prefix

//   const categories = [
//     { id: 'all', name: 'All', icon: '📚' },
//     { id: 'fitness', name: 'Fitness', icon: '💪' },
//     { id: 'coding', name: 'Coding', icon: '💻' },
//     { id: 'food', name: 'Food', icon: '🍕' },
//     { id: 'travel', name: 'Travel', icon: '✈️' },
//     { id: 'design', name: 'Design', icon: '🎨' },
//     { id: 'fashion', name: 'Fashion', icon: '👗' },
//     { id: 'business', name: 'Business', icon: '💼' },
//     { id: 'education', name: 'Education', icon: '📚' },
//     { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
//     { id: 'other', name: 'Other', icon: '📌' }
//   ];

//   useEffect(() => {
//     loadContents();
//     loadStats();
//   }, []);

//   useEffect(() => {
//     filterContents();
//   }, [contents, searchQuery, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

//   const loadContents = async () => {
//     try {
//       setLoading(true);
//       const response = await contentApi.getContents(userPhone);
//       console.log('Frontend received data:', response); // Debug log
//       setContents(response.contents || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error loading contents:', error);
//       setContents([]);
//       setLoading(false);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const statsData = await contentApi.getUserStats(userPhone);
//       setStats(statsData || { total_contents: 0, category_counts: {} });
//     } catch (error) {
//       console.error('Error loading stats:', error);
//       setStats({ total_contents: 0, category_counts: {} });
//     }
//   };

//   const filterContents = () => {
//     let filtered = contents;

//     // Filter by category
//     if (selectedCategory !== 'all') {
//       filtered = filtered.filter(content => content.category === selectedCategory);
//     }

//     // Filter by search query
//     if (searchQuery) {
//       filtered = filtered.filter(content =>
//         content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         content.ai_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         content.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//       );
//     }

//     setFilteredContents(filtered);
//   };

//   const handleDelete = async (contentId) => {
//     if (window.confirm('Are you sure you want to delete this content?')) {
//       try {
//         await contentApi.deleteContent(contentId);
//         loadContents();
//         loadStats();
//       } catch (error) {
//         console.error('Error deleting content:', error);
//       }
//     }
//   };

//   const handleAddLink = async () => {
//     if (!newLink.trim()) {
//       alert('Please enter a valid URL');
//       return;
//     }
    
//     try {
//       // Simulate adding a link (in real app, this would call an API)
//       alert('Link added! In production, this would save to your collection.');
//       setNewLink('');
//       setShowAddLink(false);
//       loadContents();
//       loadStats();
//     } catch (error) {
//       console.error('Error adding link:', error);
//     }
//   };

//   const handleShare = async (content) => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: content.title,
//           text: content.ai_summary,
//           url: content.url
//         });
//       } catch (error) {
//         console.log('Error sharing:', error);
//       }
//     } else {
//       // Fallback: copy to clipboard
//       navigator.clipboard.writeText(content.url);
//       alert('Link copied to clipboard!');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-whatsapp-500 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold">SS</span>
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold text-gray-900">Social Saver</h1>
//                 <p className="text-sm text-gray-500">Your personal knowledge base</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button 
//                 className="btn btn-secondary flex items-center space-x-2"
//                 onClick={() => setShowAddLink(true)}
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Link</span>
//               </button>
//               <button 
//                 className="btn btn-secondary flex items-center space-x-2"
//                 onClick={() => setShowStats(!showStats)}
//               >
//                 <BarChart3 className="w-4 h-4" />
//                 <span>Stats</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <StatsCard
//             title="Total Saved"
//             value={stats.total_contents}
//             icon="📚"
//             color="blue"
//           />
//           {Object.entries(stats.category_counts).slice(0, 3).map(([category, count]) => {
//             const categoryInfo = categories.find(c => c.id === category);
//             return (
//               <StatsCard
//                 key={category}
//                 title={categoryInfo?.name || category}
//                 value={count}
//                 icon={categoryInfo?.icon || '📌'}
//                 color="green"
//               />
//             );
//           })}
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//           <div className="flex flex-col lg:flex-row gap-4">
//             <div className="flex-1">
//               <SearchBar
//                 value={searchQuery}
//                 onChange={setSearchQuery}
//                 placeholder="Search your saved content..."
//               />
//             </div>
//             <div className="flex items-center space-x-2">
//               <Filter className="w-5 h-5 text-gray-400" />
//               <CategoryFilter
//                 categories={categories}
//                 selectedCategory={selectedCategory}
//                 onSelectCategory={setSelectedCategory}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Content Grid */}
//         <div className="space-y-6">
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//               <p className="mt-4 text-gray-500">Loading your saved content...</p>
//             </div>
//           ) : filteredContents.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Heart className="w-10 h-10 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 {searchQuery || selectedCategory !== 'all' ? 'No matching content found' : 'No content saved yet'}
//               </h3>
//               <p className="text-gray-500 mb-6">
//                 {searchQuery || selectedCategory !== 'all' 
//                   ? 'Try adjusting your search or filters' 
//                   : 'Start saving content from WhatsApp to build your knowledge base'
//                 }
//               </p>
//               {!searchQuery && selectedCategory === 'all' && (
//                 <div className="bg-whatsapp-50 border border-whatsapp-200 rounded-lg p-4">
//                   <p className="text-sm text-whatsapp-800">
//                     <strong>How to save content:</strong> Forward any Instagram, Twitter, or blog link to your WhatsApp bot number
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredContents.map((content) => (
//                 <ContentCard
//                   key={content.id}
//                   content={content}
//                   onDelete={() => handleDelete(content.id)}
//                   onShare={() => handleShare(content)}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Add Link Modal */}
//       {showAddLink && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Add New Link</h3>
//             <input
//               type="url"
//               placeholder="https://instagram.com/p/..."
//               value={newLink}
//               onChange={(e) => setNewLink(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp-500 mb-4"
//             />
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowAddLink(false)}
//                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddLink}
//                 className="px-4 py-2 bg-whatsapp-500 text-white rounded-md hover:bg-whatsapp-600"
//               >
//                 Add Link
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats Modal */}
//       {showStats && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Total Saved:</span>
//                 <span className="font-semibold">{stats.total_contents}</span>
//               </div>
//               {Object.entries(stats.category_counts).map(([category, count]) => (
//                 <div key={category} className="flex justify-between">
//                   <span className="text-gray-600 capitalize">{category}:</span>
//                   <span className="font-semibold">{count}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => setShowStats(false)}
//                 className="px-4 py-2 bg-whatsapp-500 text-white rounded-md hover:bg-whatsapp-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


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
  .slide-up { animation:slide-up 0.3s ease forwards; }
  .card-anim { transition:all 0.2s ease; }
  .card-anim:hover { transform:translateY(-3px); }
  .neon-text { color:#00f5ff; text-shadow:0 0 10px #00f5ff88; font-family:'Orbitron',monospace; }
  .neon-mag  { color:#ff00cc; text-shadow:0 0 10px #ff00cc88; font-family:'Orbitron',monospace; }
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
  const [contents, setContents]     = useState([]);
  const [stats, setStats]           = useState({total_contents:0,category_counts:{}});
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('home');
  const [activeCat, setActiveCat]   = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
  // Auto-refresh so new WhatsApp saves appear without manual reload
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
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
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
                      background:'transparent',border:`1px solid ${activeCat===cat.id?cat.color:C.border}`,
                      color:activeCat===cat.id?cat.color:C.muted,
                      padding:'5px 12px',fontFamily:'Orbitron,monospace',fontSize:9,letterSpacing:1,
                      cursor:'pointer',transition:'all 0.2s',
                      clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
                      background: activeCat===cat.id ? cat.color+'22':'transparent',
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
                  {label:'TOTAL SAVED',  value:stats.total_contents,                                    color:C.cyan},
                  {label:'CATEGORIES',   value:Object.keys(stats.category_counts).length,               color:C.magenta},
                  {label:'PLATFORMS',    value:Object.keys(platCounts).length,                          color:C.green},
                  {label:'THIS WEEK',    value:thisWeek,                                                 color:C.yellow},
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
                {/* Pie */}
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
                {/* Bar */}
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



