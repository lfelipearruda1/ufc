const Charts = {
  CAT: ['#d63031','#74b9ff','#00b894','#fdcb6e','#fd79a8','#a29bfe','#55efc4','#e17055'],

  calcStats(vals) {
    if (!vals.length) return null;
    const s = [...vals].sort((a,b)=>a-b), n = s.length;
    const mean = s.reduce((a,b)=>a+b,0)/n;
    const median = n%2 ? s[~~(n/2)] : (s[n/2-1]+s[n/2])/2;
    const f={};
    s.forEach(v=>f[v]=(f[v]||0)+1);
    const mf=Math.max(...Object.values(f));
    const mode=Object.keys(f).filter(k=>+f[k]===mf).map(Number);
    const variance=s.reduce((a,v)=>a+(v-mean)**2,0)/n;
    return {mean,median,mode,variance,stdDev:Math.sqrt(variance),min:s[0],max:s[n-1],n};
  },

  _stats(st, unit='') {
    if (!st) return '';
    return `<div class="chart-stats">
      <span><b class="si">μ</b>${st.mean.toFixed(1)}${unit}</span>
      <span><b class="si">Md</b>${st.median.toFixed(1)}${unit}</span>
      <span><b class="si">Mo</b>${st.mode.join('/')}${unit}</span>
      <span><b class="si">σ</b>${st.stdDev.toFixed(2)}</span>
      <span><b class="si">σ²</b>${st.variance.toFixed(2)}</span>
    </div>`;
  },

  bar(el, data) {
    const W=480,H=220,mt=18,mr=16,mb=60,ml=36;
    const pw=W-ml-mr, ph=H-mt-mb;
    const max=Math.max(...data.map(d=>d.value),1);
    const bw=pw/data.length*0.60, gap=pw/data.length;
    const st=this.calcStats(data.map(d=>d.value));
    const my=mt+ph-(st.mean/max)*ph;
    let o='';
    for(let i=1;i<=4;i++){
      const y=mt+ph*(1-i/4);
      o+=`<line x1="${ml}" y1="${y}" x2="${ml+pw}" y2="${y}" stroke="#222" stroke-width="1"/>`;
      o+=`<text x="${ml-4}" y="${y+4}" text-anchor="end" font-size="9" fill="#555">${Math.round(max*i/4)}</text>`;
    }
    o+=`<line x1="${ml}" y1="${my}" x2="${ml+pw}" y2="${my}" stroke="#d63031" stroke-width="1" stroke-dasharray="5 3" opacity=".6"/>`;
    o+=`<text x="${ml+pw+3}" y="${my+4}" font-size="8" fill="#d63031">μ</text>`;
    data.forEach((d,i)=>{
      const x=ml+gap*i+(gap-bw)/2, bh=(d.value/max)*ph, y=mt+ph-bh;
      o+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${this.CAT[i%8]}" rx="2" class="c-bar"><title>${d.label}: ${d.value}</title></rect>`;
      if(d.value>0) o+=`<text x="${(x+bw/2).toFixed(1)}" y="${(y-4).toFixed(1)}" text-anchor="middle" font-size="9" fill="#bbb" font-weight="600">${d.value}</text>`;
      const lx=ml+gap*i+gap/2;
      const lbl=d.label.length>9?d.label.slice(0,9)+'…':d.label;
      o+=`<text x="${lx.toFixed(1)}" y="${H-8}" text-anchor="end" font-size="9" fill="#555" transform="rotate(-38 ${lx.toFixed(1)} ${H-8})">${lbl}</text>`;
    });
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">${o}</svg>${this._stats(st)}`;
  },

  donut(el, data, opts={}) {
    const W=320,H=230,cx=115,cy=115,ro=90,ri=52;
    const total=data.reduce((a,d)=>a+d.value,0)||1;
    let angle=-Math.PI/2, o='', leg='';
    data.forEach((d,i)=>{
      const a=(d.value/total)*Math.PI*2, ea=angle+a;
      const c=this.CAT[i%8];
      const x1=cx+ro*Math.cos(angle), y1=cy+ro*Math.sin(angle);
      const x2=cx+ro*Math.cos(ea),    y2=cy+ro*Math.sin(ea);
      const x3=cx+ri*Math.cos(ea),    y3=cy+ri*Math.sin(ea);
      const x4=cx+ri*Math.cos(angle), y4=cy+ri*Math.sin(angle);
      const lg=a>Math.PI?1:0, pct=Math.round(d.value/total*100);
      o+=`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${ro},${ro} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${ri},${ri} 0 ${lg},0 ${x4.toFixed(1)},${y4.toFixed(1)} Z" fill="${c}" class="c-slice"><title>${d.label}: ${d.value} (${pct}%)</title></path>`;
      leg+=`<g transform="translate(0,${i*30})"><rect width="9" height="9" rx="2" fill="${c}"/><text x="14" y="9" font-size="11" fill="#ccc">${d.label}</text><text x="14" y="21" font-size="9" fill="#555">${pct}% · ${d.value}</text></g>`;
      angle=ea;
    });
    const cl=opts.centerLabel!=null?opts.centerLabel:total;
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      ${o}
      <circle cx="${cx}" cy="${cy}" r="${ri-1}" fill="oklch(12% 0.010 15)"/>
      <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="22" font-weight="800" fill="#eee">${cl}</text>
      <text x="${cx}" y="${cy+15}" text-anchor="middle" font-size="9" fill="#555">${opts.centerSub||'total'}</text>
      <g transform="translate(228,${H/2-data.length*15})">${leg}</g>
    </svg>`;
  },

  line(el, data) {
    if(data.length<2){el.innerHTML='<div class="no-data">Dados insuficientes</div>';return;}
    const W=480,H=190,mt=16,mr=20,mb=36,ml=36;
    const pw=W-ml-mr, ph=H-mt-mb;
    const max=Math.max(...data.map(d=>d.value),1);
    const xs=i=>ml+i*(pw/(data.length-1));
    const ys=v=>mt+ph-(v/max)*ph;
    const pts=data.map((d,i)=>({x:xs(i),y:ys(d.value),v:d.value,l:d.label}));
    // linear regression
    const n=data.length, si=n*(n-1)/2, sv=pts.reduce((a,p)=>a+p.v,0);
    const siv=pts.reduce((a,p,i)=>a+i*p.v,0), si2=n*(n-1)*(2*n-1)/6;
    const slope=(n*siv-si*sv)/(n*si2-si*si||1);
    const ic=(sv-slope*si)/n;
    const ty1=ys(ic), ty2=ys(ic+slope*(n-1));
    const area='M'+ml+','+ys(0)+' '+pts.map(p=>`L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+` L${ml+pw},${ys(0)} Z`;
    const ln='M'+pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
    let o='';
    for(let i=0;i<=4;i++){
      const y=mt+ph*(1-i/4);
      o+=`<line x1="${ml}" y1="${y}" x2="${ml+pw}" y2="${y}" stroke="#222" stroke-width="1"/>`;
      o+=`<text x="${ml-4}" y="${y+4}" text-anchor="end" font-size="9" fill="#555">${Math.round(max*i/4)}</text>`;
    }
    const step=Math.max(1,Math.ceil(n/7));
    pts.forEach((p,i)=>{
      if(i%step===0||i===n-1) o+=`<text x="${p.x.toFixed(1)}" y="${H-mb+mt+2}" text-anchor="middle" font-size="9" fill="#555">${p.l}</text>`;
      o+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#d63031" class="c-dot"><title>${p.l}: ${p.v}</title></circle>`;
    });
    const st=this.calcStats(data.map(d=>d.value));
    const tdir=slope<-0.5?'↓ tendência de queda':slope>0.5?'↑ tendência de alta':'→ estável';
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
      ${o}
      <path d="${area}" fill="#d63031" opacity=".07"/>
      <path d="${ln}" fill="none" stroke="#d63031" stroke-width="2"/>
      <line x1="${ml}" y1="${ty1.toFixed(1)}" x2="${ml+pw}" y2="${ty2.toFixed(1)}" stroke="#d63031" stroke-width="1" stroke-dasharray="6 4" opacity=".4"/>
    </svg>
    <div class="chart-stats">
      <span><b class="si">μ</b>${st.mean.toFixed(1)}</span>
      <span><b class="si">Md</b>${st.median.toFixed(1)}</span>
      <span><b class="si">σ</b>${st.stdDev.toFixed(2)}</span>
      <span class="stat-trend">${tdir}</span>
    </div>`;
  },

  radar(el, data) {
    if(!data.length){el.innerHTML='<div class="no-data">Sem dados</div>';return;}
    const W=280,H=260,cx=140,cy=128,r=95;
    const n=data.length, max=Math.max(...data.map(d=>d.value),1);
    const ang=i=>-Math.PI/2+(2*Math.PI/n)*i;
    const px=(i,f)=>cx+r*f*Math.cos(ang(i));
    const py=(i,f)=>cy+r*f*Math.sin(ang(i));
    let o='';
    [.25,.5,.75,1].forEach(f=>{
      const pts=Array.from({length:n},(_,i)=>`${px(i,f).toFixed(1)},${py(i,f).toFixed(1)}`).join(' ');
      o+=`<polygon points="${pts}" fill="none" stroke="#222" stroke-width="1"/>`;
    });
    for(let i=0;i<n;i++){
      o+=`<line x1="${cx}" y1="${cy}" x2="${px(i,1).toFixed(1)}" y2="${py(i,1).toFixed(1)}" stroke="#222" stroke-width="1"/>`;
      const lx=px(i,1.22), ly=py(i,1.22);
      const lbl=data[i].label.length>10?data[i].label.slice(0,10)+'…':data[i].label;
      o+=`<text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="middle" font-size="9" fill="#666">${lbl}</text>`;
    }
    const dpts=data.map((d,i)=>`${px(i,d.value/max).toFixed(1)},${py(i,d.value/max).toFixed(1)}`).join(' ');
    o+=`<polygon points="${dpts}" fill="#d63031" fill-opacity=".2" stroke="#d63031" stroke-width="2"/>`;
    data.forEach((d,i)=>{
      const f=d.value/max;
      o+=`<circle cx="${px(i,f).toFixed(1)}" cy="${py(i,f).toFixed(1)}" r="4" fill="#d63031"><title>${d.label}: ${d.value}</title></circle>`;
    });
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${o}</svg>`;
  },

  hbar(el, data) {
    const rows=data.slice(0,10);
    const W=480, rowH=26, mt=8, mr=52, ml=130, mb=8;
    const H=mt+mb+rows.length*rowH;
    const pw=W-ml-mr, max=Math.max(...rows.map(d=>d.value),1);
    const st=this.calcStats(rows.map(d=>d.value));
    let o='';
    rows.forEach((d,i)=>{
      const y=mt+i*rowH, bw=(d.value/max)*pw;
      o+=`<rect x="${ml}" y="${y+4}" width="${bw.toFixed(1)}" height="${rowH-8}" fill="#d63031" rx="2" opacity="${(.65+.35*(d.value/max)).toFixed(2)}" class="c-bar"><title>${d.label}: ${d.value}</title></rect>`;
      o+=`<text x="${(ml+bw+5).toFixed(1)}" y="${(y+rowH/2+4).toFixed(1)}" font-size="10" fill="#aaa" font-weight="600">${d.value}</text>`;
      o+=`<text x="${ml-6}" y="${(y+rowH/2+4).toFixed(1)}" text-anchor="end" font-size="10" fill="#777">${d.label.length>16?d.label.slice(0,16)+'…':d.label}</text>`;
    });
    const mx=ml+(st.mean/max)*pw;
    o+=`<line x1="${mx.toFixed(1)}" y1="${mt}" x2="${mx.toFixed(1)}" y2="${H-mb}" stroke="#d63031" stroke-width="1" stroke-dasharray="4 3" opacity=".5"/>`;
    o+=`<text x="${mx.toFixed(1)}" y="${mt-1}" text-anchor="middle" font-size="8" fill="#d63031">μ</text>`;
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${o}</svg>${this._stats(st,' vit.')}`;
  }
};
