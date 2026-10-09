const icons = {
  back: `<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  bag: `<svg viewBox="0 0 24 24"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24"><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13"/><path d="M15 11h7v4h-7a2 2 0 1 1 0-4Z"/></svg>`,
  card: `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
  grid: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>`,
  error: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>`
};

const merchants = [
  { id:'basha', name:'Basha Bakery & Restaurant', category:'Food & Drinks', detail:'Restaurant & bakery · Wilkinson Road', photo:0, real:true },
  { id:'atelier', name:'Freetown Fashion Edit', category:'Fashion', detail:'Illustrative boutique concept', photo:4 },
  { id:'glow', name:'Glow Beauty Studio', category:'Beauty', detail:'Illustrative beauty concept', photo:5 },
  { id:'tech', name:'Salone Tech Corner', category:'Electronics', detail:'Illustrative electronics concept', photo:6 },
  { id:'home', name:'Krio Home Collective', category:'Lifestyle', detail:'Illustrative lifestyle concept', photo:7 },
  { id:'table', name:'The Local Table', category:'Food & Drinks', detail:'Illustrative café concept', photo:2 },
  { id:'weekend', name:'Freetown Weekends', category:'Experiences', detail:'Illustrative experiences concept', photo:3 }
];

const products = [
  { id:'burger', name:'Basha Special Burger', category:'Burgers', price:315, photo:0, description:'Double grilled patties, double cheese, double eggs, lettuce, tomatoes and classic sauce.' },
  { id:'chicken-burger', name:'Mighty Chicken Burger', category:'Burgers', price:260, photo:0, description:'Breaded chicken breast, cheddar, dill pickles, lettuce and garlic mayo.' },
  { id:'pepperoni', name:'Pepperoni Pizza', category:'Pizza', price:180, photo:1, description:'Small pizza with tomato sauce, mozzarella and pepperoni slices.' },
  { id:'chicken-pizza', name:'Chicken Pizza', category:'Pizza', price:160, photo:1, description:'Small pizza with tomato sauce, mozzarella and sliced chicken breast.' },
  { id:'special-rice', name:'Basha Special Rice', category:'Meals', price:280, photo:2, description:'Yellow rice with onions, tomatoes, chicken, meat, shrimp and fish.' },
  { id:'grilled-chicken', name:'Grilled Chicken', category:'Meals', price:310, photo:2, description:'Chicken breast with salad and a choice of mashed potatoes, rice or fries.' },
  { id:'iced-caramel', name:'Iced Caramel Coffee', category:'Drinks', price:80, photo:3, description:'Small iced coffee with caramel.' },
  { id:'biscoff-latte', name:'Biscoff Latte', category:'Drinks', price:100, photo:3, description:'Hot latte with Biscoff flavour.' }
];

const state = { route:'home', history:[], category:'All', search:'', menu:'Popular', cart:{}, mode:'collection', modal:null, selectedQty:1, processing:false, paymentError:false, order:null, activeTab:'shops' };
const app = document.querySelector('#app');
const money = n => `Le${Number(n).toFixed(2)}`;
const cartCount = () => Object.values(state.cart).reduce((a,b)=>a+b,0);
const subtotal = () => products.reduce((sum,p)=>sum + p.price*(state.cart[p.id]||0),0);
const itemById = id => products.find(p=>p.id===id);

function nav(route, data={}) { state.history.push({route:state.route, data:state.data}); state.route=route; state.data=data; state.modal=null; render(); scrollTop(); }
function back() { const previous=state.history.pop(); if(previous){ state.route=previous.route; state.data=previous.data; } else { state.route='home'; } state.modal=null; render(); scrollTop(); }
function scrollTop(){ app.querySelector('.screen')?.scrollTo?.(0,0); }
function toast(message){ const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),1800); }

function bottomNav(){ return `<nav class="bottom-nav" aria-label="Main navigation">
  ${[['wallet','wallet','Wallet'],['cards','card','Cards'],['services','grid','Services'],['shops','bag','Shops']].map(([id,icon,label])=>`<button class="nav-item ${state.activeTab===id?'active':''}" data-tab="${id}"><span class="nav-icon">${icons[icon]}</span><span>${label}</span></button>`).join('')}
</nav>`; }
function header(title, subtitle='', action=''){ return `<header class="topbar"><div><h1>${title}</h1>${subtitle?`<p class="subtitle">${subtitle}</p>`:''}</div>${action}</header>`; }
function backButton(){ return `<button class="icon-btn" data-action="back" aria-label="Go back">${icons.back}</button>`; }
function cartButton(){ return `<button class="icon-btn" data-action="cart" aria-label="Open cart">${icons.bag}${cartCount()?`<b class="cart-badge">${cartCount()}</b>`:''}</button>`; }

function home(){
  const q=state.search.trim().toLowerCase();
  const list=merchants.filter(m => (state.category==='All'||m.category===state.category) && (!q || `${m.name} ${m.category} ${products.map(p=>p.name).join(' ')}`.toLowerCase().includes(q)));
  return `<section class="screen">${header('Shops','Discover something good',cartButton())}
    <label class="search">${icons.search}<input id="search" type="search" placeholder="Search shops, categories or food" value="${state.search}" aria-label="Search marketplace">${state.search?'<button class="clear-search" data-action="clear-search">Clear</button>':''}</label>
    <article class="drop-card"><div class="drop-photo"></div><div class="drop-copy"><span class="chip">Vult Drop · Concept</span><h2>Basha burger moment</h2><p>Featured Basha Special Burger</p><div class="price-row"><span class="price">Le285.00</span><span class="old-price">Le315.00</span></div><button class="mini-btn" data-action="drop">View Drop</button></div></article>
    <div class="section-head"><h2>Explore</h2><span>Curated categories</span></div>
    <div class="chips">${['All','Food & Drinks','Fashion','Beauty','Electronics','Lifestyle','Experiences'].map(c=>`<button class="chip ${state.category===c?'active':''}" data-category="${c}">${c}</button>`).join('')}</div>
    <div class="section-head"><h2>Popular shops</h2><span>${list.length} concepts</span></div>
    ${list.length?`<div class="merchant-grid">${list.map(merchantCard).join('')}</div>`:`<div class="empty"><div class="small-icon">${icons.search}</div><h2>No shops found</h2><p class="muted">Try a different search or clear your filters.</p><button class="secondary" data-action="reset-filters">Clear search</button></div>`}
    <div class="demo-bar"><button data-action="reset">Reset prototype</button></div>${bottomNav()}</section>`;
}
function merchantCard(m){ return `<button class="card merchant-card" data-merchant="${m.id}"><div class="photo photo-${m.photo}"></div><div class="card-copy"><h3>${m.name}</h3><p>${m.category} · ${m.detail}</p>${m.real?'':`<span class="concept">Illustrative concept</span>`}</div></button>`; }

function storefront(){ const categories=['Popular','Burgers','Pizza','Meals','Drinks']; const shown=state.menu==='Popular'?products.filter(p=>['burger','pepperoni','special-rice','iced-caramel'].includes(p.id)):products.filter(p=>p.category===state.menu);
 return `<section class="screen no-tabs"><div class="hero photo-0"><div class="hero-actions">${backButton()}${cartButton()}</div><div class="hero-title"><h1>Basha Bakery & Restaurant</h1><p>Restaurant & bakery · 73 Wilkinson Road, Freetown</p></div></div>
  <p class="muted">International favourites, bakery classics and local dishes from Basha’s published menu.</p><div class="notice">Independent concept prototype. No Vult partnership or live ordering is implied. Menu prices were verified from Basha’s public website.</div>
  <div class="menu-tabs"><div class="chips">${categories.map(c=>`<button class="chip ${state.menu===c?'active':''}" data-menu="${c}">${c}</button>`).join('')}</div></div>
  <div class="product-list">${shown.map(productCard).join('')}</div>
  ${cartCount()?`<button class="floating-cart" data-action="cart"><span>${cartCount()} ${cartCount()===1?'item':'items'}</span><strong>View cart · ${money(subtotal())}</strong></button>`:''}
  ${state.modal?productSheet(state.modal):''}</section>`; }
function productCard(p){ return `<article class="card product" data-product="${p.id}"><div class="photo photo-${p.photo}"></div><div class="card-copy"><h3>${p.name}</h3><p>${p.description}</p><div class="product-foot"><strong class="price">${money(p.price)}</strong><button class="add" data-add="${p.id}" aria-label="Add ${p.name}">+</button></div></div></article>`; }
function productSheet(id){ const p=itemById(id); return `<div class="modal-backdrop" data-action="close-modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="${p.name}" onclick="event.stopPropagation()"><div class="handle"></div><div class="detail-photo photo photo-${p.photo}"></div><div class="detail-head"><div><h2>${p.name}</h2><p class="muted">${p.description}</p></div><strong class="price">${money(p.price)}</strong></div><div class="sheet-actions"><div class="stepper"><button data-detail-step="-1">−</button><span>${state.selectedQty}</span><button data-detail-step="1">+</button></div><button class="primary" data-detail-add="${p.id}">Add · ${money(p.price*state.selectedQty)}</button></div></div></div>`; }

function preview(){ const m=merchants.find(x=>x.id===state.data.id); return `<section class="screen no-tabs"><header class="topbar">${backButton()}${cartButton()}</header><div class="detail-photo photo photo-${m.photo}"></div><p class="eyebrow">Illustrative merchant preview</p><h1>${m.name}</h1><p class="subtitle">${m.category}</p><div class="notice">This preview demonstrates marketplace breadth. The business, products and participation are conceptual.</div><div class="section-head"><h2>Preview selection</h2><span>Not available to order</span></div><div class="preview-products"><article class="card"><div class="photo photo-${m.photo}"></div><div class="card-copy"><h3>Curated favourite</h3><p>Illustrative product preview</p></div></article><article class="card"><div class="photo photo-${(m.photo+1)%8}"></div><div class="card-copy"><h3>New arrival</h3><p>Illustrative product preview</p></div></article></div><button class="secondary" data-action="back" style="margin-top:24px">Back to Shops</button></section>`; }

function drop(){ const p=itemById('burger'); return `<section class="screen no-tabs"><header class="topbar">${backButton()}${cartButton()}</header><div class="detail-photo photo photo-0"></div><p class="eyebrow">Vult Drop · Concept offer</p><h1>Basha burger moment</h1><p class="subtitle">Basha Bakery & Restaurant</p><div class="price-row"><span class="price" style="font-size:24px">Le285.00</span><span class="old-price">${money(p.price)}</span></div><p>One Basha Special Burger at the concept promotional price. Available for collection in this prototype only.</p><div class="notice">Illustrative Vult promotion. No real order, reservation or merchant notification will be created.</div><div class="payment-actions"><button class="primary" data-action="add-drop">Add offer to cart</button><button class="secondary" data-action="storefront">Explore Basha menu</button></div></section>`; }

function cart(){ const entries=Object.entries(state.cart).filter(([,q])=>q>0); if(!entries.length) return `<section class="screen no-tabs"><header class="topbar">${backButton()}</header><div class="state-screen"><div class="small-icon">${icons.bag}</div><h1>Your cart is empty</h1><p class="muted">Browse Basha’s menu and add something good.</p><button class="primary" data-action="storefront">Browse the menu</button></div></section>`;
 return `<section class="screen no-tabs"><header class="topbar">${backButton()}<button class="text-button" data-action="clear-cart">Clear</button></header>${header('Review order','Basha Bakery & Restaurant')}
  <div>${entries.map(([id,q])=>{const p=itemById(id);return `<div class="cart-row"><div class="photo photo-${p.photo}"></div><div><div class="cart-row-head"><h3>${p.name}</h3><button class="remove" data-remove="${id}">Remove</button></div><div class="cart-row-foot"><div class="stepper"><button data-step="${id}:-1">−</button><span>${q}</span><button data-step="${id}:1">+</button></div><strong>${money(p.price*q)}</strong></div></div></div>`}).join('')}</div>
  <div class="section-head"><h2>How will you get it?</h2></div><div class="choice-grid"><button class="choice ${state.mode==='collection'?'active':''}" data-mode="collection"><strong>Collection</strong><small>From Basha · demo only</small></button><button class="choice ${state.mode==='delivery'?'active':''}" data-mode="delivery"><strong>Delivery</strong><small>Illustrative · Le25.00</small></button></div>
  ${summary()}<button class="primary" data-action="payment">Continue to payment</button><div class="notice">No real order will be sent. Delivery coverage and fee are illustrative.</div></section>`; }
function summary(){ const delivery=state.mode==='delivery'?25:0; return `<div class="summary"><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal())}</strong></div><div class="summary-line"><span>${state.mode==='delivery'?'Illustrative delivery':'Collection'}</span><strong>${money(delivery)}</strong></div><div class="summary-line total"><span>Total</span><span>${money(subtotal()+delivery)}</span></div></div>`; }

function payment(){ const total=subtotal()+(state.mode==='delivery'?25:0); if(state.paymentError) return failure(); return `<section class="screen no-tabs"><header class="topbar">${backButton()}</header>${header('Pay with Vult','One confirmation. No card details needed.')}
  <div class="payment-method"><div class="vult-mark">V</div><div class="grow"><strong>Vult account</strong><p class="subtitle">Secure in-app payment · simulated</p></div>${icons.check}</div>${summary()}
  <div class="notice">Prototype only. Confirming below does not charge an account or notify Basha.</div><div class="payment-actions"><button class="primary" data-action="confirm" ${state.processing?'disabled':''}>${state.processing?'<span class="spinner"></span>':`Confirm payment · ${money(total)}`}</button><button class="text-button" data-action="fail">Demo payment failure</button></div></section>`; }
function failure(){ return `<section class="screen no-tabs"><div class="state-screen"><div class="state-icon danger">${icons.error}</div><h1>Payment not completed</h1><p class="muted">This simulated payment was declined. Nothing was charged and no order was created.</p><div class="payment-actions"><button class="primary" data-action="retry">Try again</button><button class="secondary" data-action="cart">Return to cart</button></div></div></section>`; }
function confirmation(){ const o=state.order; return `<section class="screen no-tabs"><div class="state-screen"><div class="state-icon">${icons.check}</div><p class="eyebrow">Simulation complete</p><h1>Payment successful</h1><p class="muted">Your demo order with Basha is confirmed for ${o.mode}.</p><span class="order-ref">${o.ref}</span><div class="summary" style="text-align:left">${o.items.map(i=>`<div class="summary-line"><span>${i.qty}× ${i.name}</span><strong>${money(i.price*i.qty)}</strong></div>`).join('')}<div class="summary-line total"><span>Total</span><span>${money(o.total)}</span></div></div><div class="notice">Demonstration only. No payment occurred and Basha did not receive this order.</div><button class="primary" data-action="finish">Return to Shops</button></div></section>`; }
function placeholder(){ return `<section class="screen"><div class="placeholder"><div class="small-icon">${icons[state.activeTab==='wallet'?'wallet':state.activeTab==='cards'?'card':'grid']}</div><h1>${state.activeTab[0].toUpperCase()+state.activeTab.slice(1)}</h1><p class="muted">Existing Vult destination represented for navigation context. This focused prototype does not redesign it.</p><button class="secondary" data-tab="shops">Return to Shops</button></div>${bottomNav()}</section>`; }

function render(){ const views={home,storefront,preview,drop,cart,payment,confirmation,placeholder}; app.innerHTML=views[state.route](); bind(); }
function bind(){
  app.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>action(el.dataset.action)));
  app.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>{state.activeTab=el.dataset.tab;state.route=state.activeTab==='shops'?'home':'placeholder';state.history=[];render()}));
  app.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>{state.category=el.dataset.category;render()}));
  app.querySelectorAll('[data-menu]').forEach(el=>el.addEventListener('click',()=>{state.menu=el.dataset.menu;render()}));
  app.querySelectorAll('[data-merchant]').forEach(el=>el.addEventListener('click',()=>el.dataset.merchant==='basha'?nav('storefront'):nav('preview',{id:el.dataset.merchant})));
  app.querySelectorAll('[data-product]').forEach(el=>el.addEventListener('click',e=>{if(!e.target.closest('[data-add]')){state.modal=el.dataset.product;state.selectedQty=1;render()}}));
  app.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();add(el.dataset.add,1)}));
  app.querySelectorAll('[data-detail-step]').forEach(el=>el.addEventListener('click',()=>{state.selectedQty=Math.max(1,Math.min(10,state.selectedQty+Number(el.dataset.detailStep)));render()}));
  app.querySelectorAll('[data-detail-add]').forEach(el=>el.addEventListener('click',()=>{add(el.dataset.detailAdd,state.selectedQty);state.modal=null;render()}));
  app.querySelectorAll('[data-step]').forEach(el=>el.addEventListener('click',()=>{const [id,d]=el.dataset.step.split(':');state.cart[id]=Math.max(0,(state.cart[id]||0)+Number(d));render()}));
  app.querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{delete state.cart[el.dataset.remove];render()}));
  app.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{state.mode=el.dataset.mode;render()}));
  const search=app.querySelector('#search'); if(search) search.addEventListener('input',e=>{state.search=e.target.value;render();requestAnimationFrame(()=>{const s=app.querySelector('#search');s?.focus();s?.setSelectionRange(state.search.length,state.search.length)})});
}
function add(id,qty){ state.cart[id]=(state.cart[id]||0)+qty; toast(`${qty} × ${itemById(id).name} added`); render(); }
function action(a){
  if(a==='back') return back(); if(a==='cart') return nav('cart'); if(a==='drop') return nav('drop'); if(a==='storefront') return nav('storefront');
  if(a==='close-modal'){state.modal=null;return render()} if(a==='clear-search'){state.search='';return render()} if(a==='reset-filters'){state.search='';state.category='All';return render()}
  if(a==='clear-cart'){state.cart={};return render()} if(a==='payment') return nav('payment'); if(a==='fail'){state.paymentError=true;return render()} if(a==='retry'){state.paymentError=false;return render()}
  if(a==='add-drop'){state.cart.burger=(state.cart.burger||0)+1;toast('Concept offer added');return nav('cart')}
  if(a==='confirm'){ if(state.processing)return; state.processing=true;render(); setTimeout(()=>{const items=Object.entries(state.cart).map(([id,qty])=>({...itemById(id),qty}));state.order={ref:`VULT-DEMO-${String(Date.now()).slice(-6)}`,items,total:subtotal()+(state.mode==='delivery'?25:0),mode:state.mode};state.cart={};state.processing=false;state.history=[];state.route='confirmation';render()},1100);return; }
  if(a==='finish'){state.route='home';state.history=[];state.order=null;state.activeTab='shops';return render()}
  if(a==='reset'){state.route='home';state.history=[];state.category='All';state.search='';state.menu='Popular';state.cart={};state.mode='collection';state.modal=null;state.processing=false;state.paymentError=false;state.order=null;state.activeTab='shops';toast('Prototype reset');return render()}
}

render();
