const Charts = {
  CAT: ['#d63031','#74b9ff','#00b894','#fdcb6e','#fd79a8','#a29bfe','#55efc4','#e17055'],

  _svg(w, h, inner) {
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block;overflow:visible">${inner}</svg>`;
  },

  _abbrDiv(label) {
    return String(label || '')
      .replace(/^Peso\s+/i, '')
      .replace(/^Categoria\s+/i, '')
      .replace(/^Divis[ãa]o\s+/i, '')
      .trim();
  },

  bar(el, data) {
    const W = 520, H = 260, mt = 16, mr = 16, mb = 72, ml = 36;
    const pw = W - ml - mr, ph = H - mt - mb;
    const max = Math.max(...data.map(d => d.value), 1);
    const bw = pw / data.length * 0.62;
    const gap = pw / data.length;
    let o = '';

    for (let i = 1; i <= 4; i++) {
      const y = mt + ph * (1 - i / 4);
      o += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="#222" stroke-width="1"/>`;
      o += `<text x="${ml - 5}" y="${y + 3}" text-anchor="end" font-size="8" fill="#444" opacity="0.55">${Math.round(max * i / 4)}</text>`;
    }

    data.forEach((d, i) => {
      const x = ml + gap * i + (gap - bw) / 2;
      const bh = (d.value / max) * ph;
      const y = mt + ph - bh;
      const short = this._abbrDiv(d.label);
      o += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${this.CAT[i % 8]}" rx="2" class="c-bar"><title>${d.label}: ${d.value} atletas</title></rect>`;
      if (d.value > 0) {
        o += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" font-size="9" fill="#bbb" font-weight="600">${d.value}</text>`;
      }
      o += `<text x="${(ml + gap * i + gap / 2).toFixed(1)}" y="${H - mb + 14}" text-anchor="middle" font-size="8.5" fill="#777">${short}</text>`;
    });

    el.innerHTML = this._svg(W, H, o);
  },

  donut(el, data, opts = {}) {
    const W = 280, H = 190, cx = 140, cy = 88, ro = 76, ri = 46;
    const total = data.reduce((a, d) => a + d.value, 0) || 1;
    let angle = -Math.PI / 2, o = '';

    data.forEach((d, i) => {
      const a = (d.value / total) * Math.PI * 2;
      const ea = angle + a;
      const c = this.CAT[i % 8];
      const x1 = cx + ro * Math.cos(angle), y1 = cy + ro * Math.sin(angle);
      const x2 = cx + ro * Math.cos(ea), y2 = cy + ro * Math.sin(ea);
      const x3 = cx + ri * Math.cos(ea), y3 = cy + ri * Math.sin(ea);
      const x4 = cx + ri * Math.cos(angle), y4 = cy + ri * Math.sin(angle);
      const lg = a > Math.PI ? 1 : 0;
      const pct = Math.round(d.value / total * 100);
      o += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${ro},${ro} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${ri},${ri} 0 ${lg},0 ${x4.toFixed(1)},${y4.toFixed(1)} Z" fill="${c}" class="c-slice"><title>${d.label}: ${d.value} atletas (${pct}%)</title></path>`;
      angle = ea;
    });

    const cl = opts.centerLabel != null ? opts.centerLabel : total;
    const svg = this._svg(W, H, `
      ${o}
      <circle cx="${cx}" cy="${cy}" r="${ri - 1}" fill="oklch(12% 0.010 15)"/>
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="32" font-weight="800" fill="#eee">${cl}</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="10" fill="#555">${opts.centerSub || 'atletas'}</text>
    `);

    const leg = data.map((d, i) => {
      const pct = Math.round(d.value / total * 100);
      const unit = d.value === 1 ? 'atleta' : 'atletas';
      return `<div class="donut-legend-item">
        <span class="donut-legend-swatch" style="background:${this.CAT[i % 8]}"></span>
        <span class="donut-legend-text"><strong>${d.label}</strong> — ${d.value} ${unit} (${pct}%)</span>
      </div>`;
    }).join('');

    el.innerHTML = `<div class="donut-wrap">${svg}<div class="donut-legend">${leg}</div></div>`;
  },

  line(el, data) {
    if (data.length < 2) { el.innerHTML = '<div class="no-data">Dados insuficientes</div>'; return; }
    const W = 420, H = 210, mt = 12, mr = 12, mb = 40, ml = 32;
    const pw = W - ml - mr, ph = H - mt - mb;
    const max = Math.max(...data.map(d => d.value), 1);
    const xs = i => ml + i * (pw / (data.length - 1));
    const ys = v => mt + ph - (v / max) * ph;
    const pts = data.map((d, i) => ({ x: xs(i), y: ys(d.value), v: d.value, l: d.label }));
    const area = 'M' + ml + ',' + ys(0) + ' ' + pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${ml + pw},${ys(0)} Z`;
    const ln = 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
    let o = '';

    for (let i = 0; i <= 4; i++) {
      const y = mt + ph * (1 - i / 4);
      o += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="#222" stroke-width="1"/>`;
      o += `<text x="${ml - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="#444" opacity="0.55">${Math.round(max * i / 4)}</text>`;
    }

    const step = Math.max(1, Math.ceil(data.length / 7));
    pts.forEach((p, i) => {
      if (i % step === 0 || i === data.length - 1) {
        o += `<text x="${p.x.toFixed(1)}" y="${H - mb + 14}" text-anchor="middle" font-size="8.5" fill="#777">${p.l}</text>`;
      }
      o += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#d63031" class="c-dot"><title>${p.l}: ${p.v} eventos</title></circle>`;
    });

    const svg = this._svg(W, H, `
      ${o}
      <path d="${area}" fill="#d63031" opacity=".08"/>
      <path d="${ln}" fill="none" stroke="#d63031" stroke-width="2.5"/>
    `);

    const aside = [...data].reverse().map(d => {
      const n = d.value;
      const txt = n === 1 ? '1 evento' : `${n} eventos`;
      return `<div class="line-aside-row">
        <span class="line-aside-period">Em ${d.label}</span>
        <span class="line-aside-val">${txt}</span>
      </div>`;
    }).join('');

    el.innerHTML = `<div class="line-chart-layout">
      <div class="line-chart-graph">${svg}</div>
      <aside class="line-chart-aside">
        <p class="line-aside-heading">Por mês</p>
        <div class="line-aside-list">${aside}</div>
      </aside>
    </div>`;
  },

  segments(el, data) {
    if (!data.length) { el.innerHTML = '<div class="no-data">Sem dados</div>'; return; }
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const max = Math.max(...sorted.map(d => d.value), 1);
    const total = sorted.reduce((a, d) => a + d.value, 0) || 1;

    el.innerHTML = `<div class="seg-list">${sorted.map((d, i) => {
      const pct = Math.round(d.value / total * 100);
      const w = (d.value / max * 100).toFixed(1);
      return `<div class="seg-row">
        <span class="seg-label" title="${d.label}">${d.label}</span>
        <div class="seg-track"><div class="seg-fill" style="width:${w}%;background:${this.CAT[i % 8]}"></div></div>
        <span class="seg-value">${d.value} <span>(${pct}%)</span></span>
      </div>`;
    }).join('')}</div>`;
  },

  hbar(el, data) {
    const rows = data.slice(0, 10);
    const W = 520, rowH = 32, mt = 8, mr = 40, ml = 118, mb = 8;
    const H = mt + mb + rows.length * rowH;
    const pw = W - ml - mr;
    const max = Math.max(...rows.map(d => d.value), 1);
    let o = '';

    rows.forEach((d, i) => {
      const y = mt + i * rowH;
      const bw = (d.value / max) * pw;
      o += `<rect x="${ml}" y="${y + 7}" width="${bw.toFixed(1)}" height="${rowH - 14}" fill="#d63031" rx="2" opacity="${(.55 + .45 * (d.value / max)).toFixed(2)}" class="c-bar"><title>${d.label}: ${d.value} vitórias</title></rect>`;
      o += `<text x="${(ml + bw + 6).toFixed(1)}" y="${(y + rowH / 2 + 4).toFixed(1)}" font-size="10" fill="#aaa" font-weight="600">${d.value}</text>`;
      o += `<text x="${ml - 6}" y="${(y + rowH / 2 + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${d.label}</text>`;
    });

    el.innerHTML = this._svg(W, H, o);
  },

  radar(el, data) {
    if (!data.length) {
      el.innerHTML = '<div class="no-data">Sem dados</div>';
      return;
    }
    const W = 280, H = 240, cx = 140, cy = 118, raio = 78;
    const max = Math.max(...data.map(item => item.value), 1);
    const anguloInicial = -Math.PI / 2;
    let grade = '';
    let poligono = '';

    for (let nivel = 1; nivel <= 4; nivel++) {
      const r = (raio * nivel) / 4;
      const pontos = data.map((_, indice) => {
        const angulo = anguloInicial + (indice * 2 * Math.PI) / data.length;
        return `${(cx + r * Math.cos(angulo)).toFixed(1)},${(cy + r * Math.sin(angulo)).toFixed(1)}`;
      });
      grade += `<polygon points="${pontos.join(' ')}" fill="none" stroke="#222" stroke-width="1"/>`;
    }

    const pontosValor = data.map((item, indice) => {
      const angulo = anguloInicial + (indice * 2 * Math.PI) / data.length;
      const distancia = (item.value / max) * raio;
      return {
        x: cx + distancia * Math.cos(angulo),
        y: cy + distancia * Math.sin(angulo),
        label: item.label,
        value: item.value,
      };
    });

    poligono = pontosValor.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    let eixos = '';
    let rotulos = '';

    data.forEach((item, indice) => {
      const angulo = anguloInicial + (indice * 2 * Math.PI) / data.length;
      const x = cx + raio * Math.cos(angulo);
      const y = cy + raio * Math.sin(angulo);
      eixos += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#333" stroke-width="1"/>`;
      rotulos += `<text x="${(cx + (raio + 16) * Math.cos(angulo)).toFixed(1)}" y="${(cy + (raio + 16) * Math.sin(angulo)).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="#888">${item.label}</text>`;
    });

    el.innerHTML = this._svg(W, H, `
      ${grade}
      ${eixos}
      <polygon points="${poligono}" fill="#d63031" fill-opacity="0.25" stroke="#d63031" stroke-width="2"/>
      ${pontosValor.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#d63031"><title>${p.label}: ${p.value.toFixed(2)}</title></circle>`).join('')}
      ${rotulos}
    `);
  }
};
