const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const site=window.VEDA_SITE||{};
const phone=site.phone||'918903204050';
const wa=(msg)=>`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

function initMenu(){
  const toggle=$('#menu-toggle');
  const nav=$('#site-nav');
  if(!toggle||!nav) return;
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.textContent=open?'✕':'☰';
  });
}

function findProducts(query){
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const products=[...(site.products1||[]),...(site.products2||[])];
  return products.filter(item=>{
    const text=[item.title,item.subtitle,item.tag,item.description].join(' ').toLowerCase();
    return words.every(word=>text.includes(word));
  });
}

function initSearch(){
  const triggers=$$('.search-icon');
  if(!triggers.length) return;
  const dialog=document.createElement('dialog');
  dialog.className='search-dialog';
  dialog.setAttribute('aria-labelledby','search-title');
  dialog.innerHTML=`<div class="search-heading"><h2 id="search-title">Find your furniture</h2><button class="search-close" type="button" aria-label="Close search">&#215;</button></div>
    <label for="furniture-search">Search both collections</label>
    <input id="furniture-search" type="search" placeholder="Try beds, swings, teak or dining…" autocomplete="off">
    <p class="search-status" role="status" aria-live="polite"></p>
    <div class="search-results"></div>`;
  document.body.append(dialog);
  const input=$('input',dialog);
  const status=$('.search-status',dialog);
  const results=$('.search-results',dialog);
  let opener;
  const update=()=>{
    const matches=findProducts(input.value);
    status.textContent=matches.length
      ? `${matches.length} ${matches.length===1?'design':'designs'}${input.value.trim()?' found':' to explore'}`
      : 'No furniture found. Try a broader term such as wood, chair or bed.';
    results.replaceChildren(...matches.map(item=>{
      const link=document.createElement('a');
      link.className='search-result';
      link.href=`${item.page}#${item.id}`;
      const img=document.createElement('img');
      img.src=item.leftImage;
      img.alt='';
      img.loading='lazy';
      const copy=document.createElement('span');
      const title=document.createElement('strong');
      title.textContent=item.title;
      const tag=document.createElement('small');
      tag.textContent=item.tag;
      copy.append(title,tag);
      link.append(img,copy);
      link.addEventListener('click',()=>{
        dialog.close();
        if(item.page===location.pathname.split('/').pop()){
          const target=document.getElementById(item.id);
          if(target){target.classList.add('visible');target.scrollIntoView({block:'start'});}
        }
      });
      return link;
    }));
  };
  triggers.forEach(trigger=>trigger.addEventListener('click',()=>{
    opener=trigger;
    update();
    dialog.showModal();
    input.focus();
  }));
  input.addEventListener('input',update);
  $('.search-close',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog) return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close();
  });
  dialog.addEventListener('close',()=>opener?.focus());
}

function initStorySlideshow(selector='.story-photo',hero=false){
  const figure=$(selector);
  if(!figure) return;
  const original=$('img',figure);
  const caption=$(hero?'figcaption strong':'figcaption',figure);
  const slides=hero?[
    ['sofa-tile-1.jpg','Hand-carved teak sofa with tile inlay','Carved teak. A story in every detail.','products-1.html#sofa-tile'],
    ['diwan-1.jpg','Carved wooden diwan in a Chettinad courtyard','A beautiful place to slow down.','products-1.html#diwan'],
    ['carved-bed-1.jpg','Chettinad carved wooden bed','End your day surrounded by heritage.','products-2.html#carved-bed'],
    ['dining-set-1.jpg','Handcrafted wooden dining furniture','Gather around something timeless.','products-2.html#dining-set']
  ]:[
    ['main-doors-1.jpg','Intricately carved Chettinad wooden entrance','Beautiful before you even step inside.'],
    ['sofa-tile-1.jpg','Hand-carved teak sofa with tile inlay','A warm welcome. A seat with a story.'],
    ['diwan-1.jpg','Carved wooden diwan in a Chettinad courtyard','Slow down. Settle into tradition.'],
    ['carved-bed-1.jpg','Chettinad carved wooden bed','Heritage that feels right at home.'],
    ['dining-set-1.jpg','Handcrafted wooden dining furniture','Make room for moments together.']
  ];
  figure.setAttribute('aria-label','Furniture slideshow');
  figure.classList.add('furniture-slideshow');
  const images=slides.map(([file,alt],index)=>{
    const img=index===0?original:new Image();
    img.src=`assets/img/products/${file}`;
    img.alt=alt;
    img.classList.add('story-slide');
    img.classList.toggle('is-active',index===0);
    img.setAttribute('aria-hidden',String(index!==0));
    if(index) figure.insertBefore(img,$('figcaption',figure));
    return img;
  });
  const controls=document.createElement('div');
  controls.className='story-controls';
  const pause=document.createElement('button');
  pause.type='button';
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playing=!reducedMotion;
  let current=0;
  let timer;
  let hovered=false;
  let focused=false;
  function show(index){
    if(!images[index].complete||!images[index].naturalWidth) return;
    current=index;
    images.forEach((img,i)=>{
      img.classList.toggle('is-active',i===current);
      img.setAttribute('aria-hidden',String(i!==current));
    });
    caption.textContent=slides[current][2];
    if(hero){
      const link=$('figcaption a',figure);
      link.href=slides[current][3];
      link.setAttribute('aria-label',`Explore ${slides[current][1]}`);
    }
    dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  }
  function schedule(){
    clearInterval(timer);
    if(playing&&!hovered&&!focused&&!document.hidden){
      timer=setInterval(()=>show((current+1)%slides.length),2800);
    }
  }
  const dots=slides.map((slide,i)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.className='story-dot';
    dot.setAttribute('aria-label',`Show image ${i+1}: ${slide[1]}`);
    dot.setAttribute('aria-pressed',String(i===0));
    dot.addEventListener('click',()=>{show(i);schedule();});
    controls.append(dot);
    return dot;
  });
  function updatePause(){
    pause.textContent=playing?'Pause':'Play';
    pause.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');
  }
  pause.className='story-pause';
  pause.addEventListener('click',()=>{playing=!playing;updatePause();schedule();});
  updatePause();
  controls.append(pause);
  figure.append(controls);
  function move(direction){
    show((current+direction+slides.length)%slides.length);
    schedule();
  }
  [-1,1].forEach(direction=>{
    const button=document.createElement('button');
    button.type='button';
    button.className=`story-arrow ${direction<0?'story-previous':'story-next'}`;
    button.textContent=direction<0?'‹':'›';
    button.setAttribute('aria-label',direction<0?'Previous image':'Next image');
    button.addEventListener('click',()=>move(direction));
    figure.append(button);
  });
  figure.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();move(event.key==='ArrowLeft'?-1:1);
    }
  });
  let touchStart;
  figure.addEventListener('touchstart',event=>{
    const touch=event.changedTouches[0];
    touchStart={x:touch.clientX,y:touch.clientY};
  },{passive:true});
  figure.addEventListener('touchend',event=>{
    if(!touchStart) return;
    const touch=event.changedTouches[0];
    const dx=touch.clientX-touchStart.x;
    const dy=touch.clientY-touchStart.y;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)) move(dx<0?1:-1);
    touchStart=null;
  },{passive:true});
  figure.addEventListener('mouseenter',()=>{hovered=true;schedule();});
  figure.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  figure.addEventListener('focusin',()=>{focused=true;schedule();});
  figure.addEventListener('focusout',event=>{if(!figure.contains(event.relatedTarget)){focused=false;schedule();}});
  document.addEventListener('visibilitychange',schedule);
  schedule();
}

function initEntranceJourney(){
  const hero=$('.entrance-hero');
  if(!hero) return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes=[
    ['main-doors','A grand welcome'],['diwan','Into the courtyard'],
    ['sofa-tile','A place to come together'],['carved-bed','Your quiet retreat'],
    ['dining-set','Moments around the table']
  ].map(([id,label])=>({product:[...(site.products1||[]),...(site.products2||[])].find(p=>p.id===id),label})).filter(s=>s.product);
  const original=$('.entrance-image',hero);
  const images=scenes.map(({product},i)=>{
    const img=i?new Image():original;
    img.src=product.leftImage;img.alt=product.title;
    img.className='entrance-image journey-image';
    img.classList.toggle('journey-active',i===0);
    img.setAttribute('aria-hidden',String(i!==0));
    if(i) hero.insertBefore(img,$('.entrance-shade',hero));
    return img;
  });
  const controls=document.createElement('div');controls.className='journey-controls';
  controls.setAttribute('role','group');controls.setAttribute('aria-label','Chettinad photo journey');
  let current=0,timer,playing=!reduced,focused=false,visible=true;
  function show(index){
    if(!images[index].complete||!images[index].naturalWidth) return;
    current=index;
    images.forEach((img,i)=>{img.classList.toggle('journey-active',i===index);img.setAttribute('aria-hidden',String(i!==index));});
    $('.entrance-label span',hero).textContent=`0${index+1} / ${scenes[index].label}`;
    const link=$('.entrance-label a',hero);
    link.href=`${scenes[index].product.page}#${scenes[index].product.id}`;
    link.textContent='Explore this piece ↗';
    dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
  }
  function schedule(){clearInterval(timer);if(playing&&!focused&&visible&&!document.hidden) timer=setInterval(()=>show((current+1)%scenes.length),2400);}
  const dots=scenes.map((scene,i)=>{
    const button=document.createElement('button');button.type='button';
    button.className='journey-dot';button.setAttribute('aria-label',`Show ${scene.label}`);
    button.setAttribute('aria-pressed',String(i===0));
    button.addEventListener('click',()=>{show(i);schedule();});controls.append(button);return button;
  });
  const pause=document.createElement('button');pause.type='button';pause.className='journey-pause';
  function update(){pause.textContent=playing?'Pause journey':'Play journey';}
  pause.addEventListener('click',()=>{playing=!playing;update();schedule();});update();controls.append(pause);hero.append(controls);
  controls.addEventListener('focusin',()=>{focused=true;schedule();});
  controls.addEventListener('focusout',event=>{if(!controls.contains(event.relatedTarget)){focused=false;schedule();}});
  document.addEventListener('visibilitychange',schedule);
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(hero);
  schedule();
}

function initRoomExplorer(){
  const root=$('#room-explorer');
  if(!root) return;
  const rooms=[
    {id:'main-doors',name:'The Entrance',title:'A welcome worth remembering.',description:'Set the tone with richly carved wooden doors inspired by the grandeur of Chettinad homes.',browse:'Explore entrance doors'},
    {id:'sofa-tile',name:'Living Room',title:'Stay a little longer.',description:'A carved teak sofa, a quiet conversation, a place to come together. Bring Chettinad character to the heart of your home.',browse:'Discover heritage seating'},
    {id:'carved-bed',name:'Bedroom',title:'Your own quiet retreat.',description:'Rest among warm wood and graceful carvings. Discover beds that bring a sense of tradition to your everyday sanctuary.',browse:'Find your carved bed'},
    {id:'dining-set',name:'Dining',title:'Where everyday becomes together.',description:'Make space for shared meals and long conversations with handcrafted wooden dining furniture.',browse:'Explore dining furniture'}
  ];
  const products=[...(site.products1||[]),...(site.products2||[])];
  const tabs=$$('[data-room]',root);
  const image=$('#room-image');
  const panel=$('#room-scene');
  const hotspot=$('.room-hotspot',root);
  const carvingHotspot=$('.room-carving-hotspot',root);
  const card=$('#room-product');
  const carvingCard=$('#room-carving');
  const closeCarving=()=>{
    carvingCard.hidden=true;
    carvingHotspot.setAttribute('aria-expanded','false');
  };
  let request=0;
  const select=index=>{
    const room=rooms[index];
    const product=products.find(item=>item.id===room.id);
    if(!product) return;
    carvingHotspot.hidden=index!==0;
    closeCarving();
    tabs.forEach((tab,i)=>{
      tab.setAttribute('aria-selected',String(i===index));
      tab.tabIndex=i===index?0:-1;
    });
    panel.setAttribute('aria-labelledby',tabs[index].id);
    $('#room-number').textContent=`0${index+1} / ${room.name}`;
    $('#room-title').textContent=room.title;
    $('#room-description').textContent=room.description;
    $('#room-product-name').textContent=product.title;
    const href=`${product.page}#${product.id}`;
    $('#room-product-link').href=href;
    $('#room-browse').href=href;
    $('#room-browse').textContent=`${room.browse} ↗`;
    hotspot.setAttribute('aria-expanded','false');
    hotspot.setAttribute('aria-label',`Discover ${product.title}`);
    card.hidden=true;
    const token=++request;
    panel.classList.add('is-loading');
    const preload=new Image();
    preload.onload=()=>{
      if(token!==request) return;
      image.src=product.leftImage;
      image.alt=product.title;
      panel.classList.remove('is-loading');
    };
    preload.onerror=()=>{if(token===request) panel.classList.remove('is-loading');};
    preload.src=product.leftImage;
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next===undefined) return;
      event.preventDefault();select(next);tabs[next].focus();
    });
  });
  hotspot.addEventListener('click',()=>{
    closeCarving();
    card.hidden=!card.hidden;
    hotspot.setAttribute('aria-expanded',String(!card.hidden));
  });
  carvingHotspot.addEventListener('click',()=>{
    card.hidden=true;
    hotspot.setAttribute('aria-expanded','false');
    carvingCard.hidden=!carvingCard.hidden;
    carvingHotspot.setAttribute('aria-expanded',String(!carvingCard.hidden));
  });
  carvingCard.querySelector('a').addEventListener('click',closeCarving);
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!carvingCard.hidden){closeCarving();carvingHotspot.focus();}
    if(event.key==='Escape'&&!card.hidden){card.hidden=true;hotspot.setAttribute('aria-expanded','false');hotspot.focus();}
  });
  select(0);
}

function stampMarkup(){
  return `<span class="veda-stamp"><img src="assets/img/veda-badge.svg" alt="Veda Wood Co symbol"></span>`;
}

function renderFeatured(collection='all'){
  const root=$('#featured-collection');
  if(!root) return;
  const all=[...(site.products1||[]), ...(site.products2||[])].filter(item=>collection==='all'||item.page===collection);
  const count=$('#collection-count');
  if(count) count.textContent=`${all.length} handcrafted designs to discover`;
  root.innerHTML=all.map(item=>`
    <article class="feature-card reveal">
      <div class="feature-card__image">
        <img src="${item.leftImage}" alt="${item.title}" loading="lazy">
      </div>
      <div class="feature-card__body">
        <p class="mini-label">${item.tag}</p>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
        <a class="text-link" href="${item.page}#${item.id}">View details</a>
      </div>
    </article>`).join('');
}

function createProductSection(item){
  const images=[item.leftImage,item.rightImage].filter(Boolean);
  const split=item.description.indexOf('. ');
  const introduction=split<0?item.description:item.description.slice(0,split+1);
  const remainder=split<0?'':item.description.slice(split+2);
  return `<article id="${item.id}" class="catalogue-item reveal">
    <div class="catalogue-gallery">
      <div class="catalogue-main"><img src="${images[0]}" alt="${item.title} - view 1" loading="lazy"></div>
      ${images.length>1?`<div class="catalogue-thumbnails" role="group" aria-label="${item.title} photos">${images.map((src,i)=>`<button type="button" data-product-image="${src}" data-view="${i+1}" aria-label="Show view ${i+1}" aria-pressed="${i===0}"><img src="${src}" alt="" loading="lazy"><span>View ${i+1}</span></button>`).join('')}</div>`:''}
    </div>
    <div class="catalogue-copy">
      <span class="catalogue-category">${item.tag}</span>
      <h2>${item.title}</h2>
      <p class="catalogue-subtitle">${item.subtitle}</p>
      <p class="catalogue-introduction">${introduction}</p>
      ${remainder?`<details class="catalogue-description"><summary>Read more about this piece</summary><p>${remainder}</p></details>`:''}
      <div class="catalogue-enquiry"><a class="btn btn-primary" target="_blank" rel="noopener" href="${wa(`Hello Veda Wood Co, I would like to enquire about ${item.title}. Please share more details, sizes, and quotation.`)}">Enquire about this piece <span aria-hidden="true">↗</span></a><p>Ask us for available sizes, details &amp; a quotation.</p></div>
    </div>
  </article>`;
}

function renderProductPage(){
  const holder=$('#product-list');
  if(!holder) return;
  const which=holder.dataset.page;
  const data=which==='2' ? site.products2||[] : site.products1||[];
  holder.innerHTML=data.map(item=>createProductSection(item)).join('');
  holder.addEventListener('click',event=>{
    const button=event.target.closest('[data-product-image]');
    if(!button) return;
    const gallery=button.closest('.catalogue-gallery');
    const image=$('.catalogue-main img',gallery);
    image.src=button.dataset.productImage;
    image.alt=`${data.find(item=>item.id===button.closest('article').id).title} - view ${button.dataset.view}`;
    $$('[data-product-image]',gallery).forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  });
}

function setYear(){ const y=$('#year'); if(y) y.textContent=new Date().getFullYear(); }

function initForm(){
  const form=$('#enquiry-form');
  if(!form) return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const d=new FormData(form);
    const subject=encodeURIComponent(`Veda Wood Co Enquiry - ${d.get('interest')}`);
    const body=encodeURIComponent([
      `Name: ${d.get('name')}`,
      `Phone: ${d.get('phone')}`,
      `Email: ${d.get('email')}`,
      `Interested in: ${d.get('interest')}`,
      '',
      `Message: ${d.get('message')}`
    ].join('\n'));
    window.location.href=`mailto:${site.email}?subject=${subject}&body=${body}`;
  });
}

function revealOnScroll(){
  const elems=$$('.reveal');
  if(!('IntersectionObserver' in window)) { elems.forEach(el=>el.classList.add('visible')); return; }
  const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){ entry.target.classList.add('visible'); obs.unobserve(entry.target); }
  }),{threshold:.08});
  elems.forEach(el=>obs.observe(el));
}

initMenu();
initSearch();
initStorySlideshow();
initRoomExplorer();
initEntranceJourney();
renderFeatured();
$$('[data-collection]').forEach(button=>button.addEventListener('click',()=>{
  $$('[data-collection]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  renderFeatured(button.dataset.collection);
  revealOnScroll();
}));
renderProductPage();
initForm();
setYear();
revealOnScroll();
