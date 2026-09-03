/* Shared helpers used by index.html, project.html, and page.html.
   Content is fetched at runtime from the /content/*.json files in this
   same repo, so editing those files (via /admin) updates the live site
   automatically after Netlify redeploys — no rebuild step required. */

async function fetchJSON(path){
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(path + sep + '_=' + Date.now()); // cache-bust
  if(!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

function escapeHTML(str){
  return String(str == null ? '' : str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

function formatDate(d){
  if(!d) return '';
  const dt = new Date(d);
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

function footerContactHTML(site){
  const parts = [];
  if(site.email) parts.push(`<a href="mailto:${escapeHTML(site.email)}">${escapeHTML(site.email)}</a>`);
  if(site.location) parts.push(escapeHTML(site.location));
  if(site.linkedin) parts.push(`<a href="${escapeHTML(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if(site.github) parts.push(`<a href="${escapeHTML(site.github)}" target="_blank" rel="noopener">GitHub</a>`);
  if(site.resume) parts.push(`<a href="${escapeHTML(site.resume)}" target="_blank" rel="noopener">Resume</a>`);
  return parts.join(' &nbsp;&middot;&nbsp; ');
}

/* Small built-in markdown renderer — no external library needed.
   Supports: paragraphs, ## and ### headings, **bold**, *italics*,
   [link](url), and "- " bullet lists. Covers everything the CMS's
   markdown editor produces for a personal portfolio. */
function renderMarkdown(md){
  if(!md) return '';
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let paragraphBuffer = [];

  function inline(text){
    text = escapeHTML(text);
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return text;
  }
  function flushParagraph(){
    if(paragraphBuffer.length){
      html += '<p>' + inline(paragraphBuffer.join(' ')) + '</p>';
      paragraphBuffer = [];
    }
  }
  function closeList(){
    if(inList){ html += '</ul>'; inList = false; }
  }

  lines.forEach(line => {
    const trimmed = line.trim();
    if(trimmed === ''){ flushParagraph(); closeList(); return; }
    const h2 = trimmed.match(/^##\s+(.*)/);
    const h3 = trimmed.match(/^###\s+(.*)/);
    const li = trimmed.match(/^[-*]\s+(.*)/);
    if(h2){ flushParagraph(); closeList(); html += '<h2>' + inline(h2[1]) + '</h2>'; }
    else if(h3){ flushParagraph(); closeList(); html += '<h3>' + inline(h3[1]) + '</h3>'; }
    else if(li){ flushParagraph(); if(!inList){ html += '<ul>'; inList = true; } html += '<li>' + inline(li[1]) + '</li>'; }
    else { closeList(); paragraphBuffer.push(trimmed); }
  });
  flushParagraph();
  closeList();
  return html;
}

function renderTags(tags){
  if(!tags || !tags.length) return '';
  const items = tags.map(t => escapeHTML(typeof t === 'string' ? t : (t.tag || '')));
  return '<div class="tag-row">' + items.map(t => `<span class="tag">${t}</span>`).join('') + '</div>';
}

function renderAttachments(items){
  if(!items || !items.length) return '';
  const rows = items
    .filter(a => a && a.file)
    .map(a => {
      const label = a.label || decodeURIComponent(String(a.file).split('/').pop());
      return `<li><a href="${escapeHTML(a.file)}" target="_blank" rel="noopener">${escapeHTML(label)}</a></li>`;
    })
    .join('');
  if(!rows) return '';
  return `<div class="attachments"><h3>Attachments</h3><ul class="attachment-list">${rows}</ul></div>`;
}

function coverHTML(item, size){
  const cls = size === 'large' ? 'cover cover-large' : 'cover';
  if(item.cover){
    return `<div class="${cls}"><img src="${escapeHTML(item.cover)}" alt="${escapeHTML(item.title)}" loading="lazy"></div>`;
  }
  const initial = (item.title || '?').trim().charAt(0).toUpperCase();
  return `<div class="${cls} cover-placeholder"><span>${escapeHTML(initial)}</span></div>`;
}

function projectCardHTML(item){
  return `
    <a class="project-card" href="/project.html?slug=${encodeURIComponent(item.slug)}">
      ${coverHTML(item)}
      <div class="project-card-body">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.summary || '')}</p>
        ${renderTags(item.tags)}
      </div>
    </a>
  `;
}

/* Projects are split into two homepage sections by their "category"
   field (Engineering / Hobby, set in the editor). Each category has its
   own <section> + grid in index.html; a category with no items yet is
   hidden rather than shown empty. */
function renderProjectGrid(items){
  const categories = [
    { key: 'Engineering', sectionId: 'projects', gridId: 'project-grid-engineering' },
    { key: 'Hobby', sectionId: 'hobbies', gridId: 'project-grid-hobby' }
  ];
  const firstGrid = document.getElementById(categories[0].gridId);
  if(!firstGrid) return;

  if(!items || !items.length){
    firstGrid.innerHTML = '<p class="empty">No projects yet — add your first one from /admin.</p>';
    categories.slice(1).forEach(cat => {
      const section = document.getElementById(cat.sectionId);
      if(section) section.hidden = true;
    });
    return;
  }

  categories.forEach(cat => {
    const grid = document.getElementById(cat.gridId);
    const section = document.getElementById(cat.sectionId);
    if(!grid) return;
    const catItems = items.filter(item => (item.category === 'Hobby' ? 'Hobby' : 'Engineering') === cat.key);
    if(!catItems.length){
      if(section) section.hidden = true;
      return;
    }
    if(section) section.hidden = false;
    const sorted = catItems.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    grid.innerHTML = sorted.map(projectCardHTML).join('');
  });
}

async function initNav(site){
  const nav = document.getElementById('site-nav');
  const logo = document.querySelector('.logo');
  if(logo && site) logo.textContent = site.name || 'Home';
  if(!nav) return;
  const links = ['<a href="/#projects">Projects</a>'];
  try{
    const pages = await fetchJSON('/content/pages.json');
    (pages.items || []).filter(p => p.nav).forEach(p => {
      links.push(`<a href="/page.html?slug=${encodeURIComponent(p.slug)}">${escapeHTML(p.title)}</a>`);
    });
  }catch(e){ /* pages.json may not exist yet — nav still works without it */ }
  links.push('<a href="/#contact">Contact</a>');
  nav.innerHTML = links.join('');
}
