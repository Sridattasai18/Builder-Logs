/* ─── STORAGE KEYS ─── */
const KEY_PROJECTS = 'builderlog_projects';
const KEY_TAGS     = 'builderlog_tags';
const KEY_THEME    = 'builderlog_theme';

/* ─── DATA HELPERS ─── */
const getProjects   = () => JSON.parse(localStorage.getItem(KEY_PROJECTS) || '[]');
const setProjects   = v  => localStorage.setItem(KEY_PROJECTS, JSON.stringify(v));
const getGlobalTags = () => JSON.parse(localStorage.getItem(KEY_TAGS) || 'null');
const setGlobalTags = v  => localStorage.setItem(KEY_TAGS, JSON.stringify(v));

/* ─── SEED DATA ─── */
if (!getProjects().length) {
  setProjects([{
    id:          'calorie-tracker',
    title:       'Calorie Tracker',
    category:    'Mobile App',
    tags:        ['AI', 'Voice', 'Health', 'Indian Food'],
    description: 'A voice-first calorie tracker for Indian home-cooked food. Uses LLMs to estimate calories from natural speech.',
    date:        '2026-03-01',
    content:     ''
  }]);
}

/* Seed global tag list from all project tags if not yet stored */
if (!getGlobalTags()) {
  const all = [...new Set(getProjects().flatMap(p => (p.tags || []).map(t => t.toLowerCase())))];
  setGlobalTags(all);
}

/* ─── TAG COLOR PALETTE ─── */
const TAG_COLOR_MAP = [
  { keywords: ['health','fitness','wellness','exercise','nutrition'],
    light: { bg: '#dcfce7', text: '#166534' }, dark: { bg: '#14532d', text: '#86efac' } },
  { keywords: ['ai','ml','machine learning','deep learning','llm','gpt'],
    light: { bg: '#f3e8ff', text: '#6b21a8' }, dark: { bg: '#3b0764', text: '#d8b4fe' } },
  { keywords: ['voice','speech','audio','tts','stt'],
    light: { bg: '#dbeafe', text: '#1e40af' }, dark: { bg: '#1e3a5f', text: '#93c5fd' } },
  { keywords: ['indian food','food','recipe','cooking','nutrition','calorie'],
    light: { bg: '#ffedd5', text: '#9a3412' }, dark: { bg: '#431407', text: '#fdba74' } },
  { keywords: ['web','frontend','backend','html','css','js','javascript','api'],
    light: { bg: '#ccfbf1', text: '#115e59' }, dark: { bg: '#134e4a', text: '#5eead4' } },
  { keywords: ['mobile','app','ios','android','react native','flutter'],
    light: { bg: '#fce7f3', text: '#9d174d' }, dark: { bg: '#500724', text: '#f9a8d4' } },
];
const TAG_DEFAULT_LIGHT = { bg: '#f1f0ee', text: '#57534e' };
const TAG_DEFAULT_DARK  = { bg: '#2c2a27', text: '#a8a29e' };

function getTagColors(tagName) {
  const lower  = tagName.toLowerCase();
  const isDark = document.body.classList.contains('dark');
  for (const entry of TAG_COLOR_MAP) {
    if (entry.keywords.some(k => lower.includes(k) || k.includes(lower)))
      return isDark ? entry.dark : entry.light;
  }
  return isDark ? TAG_DEFAULT_DARK : TAG_DEFAULT_LIGHT;
}

function tagHTML(name) {
  const c = getTagColors(name);
  return `<span class="tag" style="background:${c.bg};color:${c.text}">${name}</span>`;
}

/* ─── DATE FORMATTING ─── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T12:00:00Z`);
    if (!isNaN(d))
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

/* ─── VIEW SWITCHING ─── */
function showView(name) {
  document.getElementById('v-dashboard').style.display = name === 'dashboard' ? 'block' : 'none';
  document.getElementById('v-reader').style.display    = name === 'reader'    ? 'block' : 'none';
  document.getElementById('v-editor').style.display    = name === 'editor'    ? 'block' : 'none';
  document.getElementById('btn-new').style.display     = name === 'dashboard' ? '' : 'none';
  window.scrollTo(0, 0);
}

function showDashboard() {
  document.body.classList.remove('manage-tags');
  managingTags = false;
  document.getElementById('manage-btn').textContent = '\u2699 Tags';
  showView('dashboard');
  renderTagBar();
  renderCards();
}

/* ─── TAG MANAGEMENT ─── */
let activeFilter = 'all';
let managingTags = false;

function toggleManageTags() {
  managingTags = !managingTags;
  document.body.classList.toggle('manage-tags', managingTags);
  document.getElementById('manage-btn').textContent = managingTags ? '\u2713 Done' : '\u2699 Tags';
}

function addTag() {
  const input = document.getElementById('tag-add-input');
  const val   = input.value.trim().toLowerCase();
  if (!val) return;
  const tags = getGlobalTags() || [];
  if (!tags.includes(val)) { tags.push(val); setGlobalTags(tags); }
  input.value = '';
  renderTagBar();
}

function deleteTag(tag) {
  setGlobalTags((getGlobalTags() || []).filter(t => t !== tag));
  if (activeFilter === tag) activeFilter = 'all';
  renderTagBar();
  renderCards();
}

function renderTagBar() {
  const tags  = getGlobalTags() || [];
  const pills = [{ label: 'All', value: 'all', cls: 'pill-all' },
                 ...tags.map(t => ({ label: t, value: t, cls: '' }))];

  document.getElementById('tag-filters').innerHTML = pills.map(p => {
    let style = '';
    if (p.cls !== 'pill-all' && p.value !== activeFilter) {
      const c = getTagColors(p.label);
      style = `style="background:${c.bg};color:${c.text};border-color:${c.bg}"`;
    }
    return `<button class="filter-pill ${p.cls} ${p.value === activeFilter ? 'active' : ''}"
                    ${style} onclick="setFilter('${p.value}')">
              ${p.label}
              ${p.cls !== 'pill-all'
                ? `<span class="pill-del" onclick="event.stopPropagation();deleteTag('${p.value}')">\u2715</span>`
                : ''}
            </button>`;
  }).join('');
}

function setFilter(tag) {
  activeFilter = tag;
  renderTagBar();
  renderCards();
}

/* ─── CARDS ─── */
function renderCards() {
  const grid      = document.getElementById('cards-grid');
  const searchVal = (document.getElementById('search-input').value || '').trim().toLowerCase();
  const sortVal   = document.getElementById('sort-select').value;
  let   projects  = getProjects();

  // Tag filter
  if (activeFilter !== 'all')
    projects = projects.filter(p => (p.tags || []).map(t => t.toLowerCase()).includes(activeFilter));

  // Search (title + description + tags)
  if (searchVal)
    projects = projects.filter(p =>
      [p.title, p.description, (p.tags || []).join(' ')].join(' ').toLowerCase().includes(searchVal)
    );

  // Sort
  projects = [...projects];
  if (sortVal === 'newest') projects.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  if (sortVal === 'oldest') projects.sort((a,b) => (a.date||'').localeCompare(b.date||''));
  if (sortVal === 'az')     projects.sort((a,b) => (a.title||'').localeCompare(b.title||''));

  // Empty state
  if (!projects.length) {
    const filtered = activeFilter !== 'all' || searchVal;
    grid.innerHTML = filtered
      ? `<div class="empty-state">
           <div class="empty-state-icon">\uD83D\uDD0D</div>
           <div class="empty-state-title">No matching logs</div>
           <p class="empty-state-sub">Try a different search term or tag filter.</p>
         </div>`
      : `<div class="empty-state">
           <div class="empty-state-icon">\uD83D\uDCD3</div>
           <div class="empty-state-title">No logs yet &mdash; start your first one</div>
           <p class="empty-state-sub">Capture your builds, ideas, and decisions in one place.</p>
           <button class="empty-state-btn" onclick="openEditor()">\u2736 Start your first log</button>
         </div>`;
    return;
  }

  grid.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <button class="btn btn-sm btn-secondary card-edit-btn"
              onclick="event.stopPropagation();openEditor('${p.id}')">Edit</button>
      <div class="card-category">${p.category || 'Project'}</div>
      <div class="card-title">${p.title}</div>
      <p class="card-desc">${p.description || ''}</p>
      <div class="card-footer">
        <div class="card-tags">${(p.tags || []).map(tagHTML).join('')}</div>
        <div class="card-links">
          ${p.github ? `<a class="card-link-btn" href="${p.github}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="GitHub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>` : ''}
          ${p.deploy ? `<a class="card-link-btn" href="${p.deploy}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Live Demo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>` : ''}
        </div>
        <span class="card-date">${formatDate(p.date)}</span>
      </div>`;

    card.onclick   = () => openReader(p.id);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
    grid.appendChild(card);
  });
}

/* ─── READER ─── */
let currentId = null;

function openReader(id) {
  const p = getProjects().find(x => x.id === id);
  if (!p) return;
  currentId = id;

  document.getElementById('reader-meta').innerHTML = `
    <div class="rcat">${p.category || 'Project'}</div>
    <h1>${p.title}</h1>
    <div class="rdate">${formatDate(p.date)}</div>
    <div class="rtags">${(p.tags || []).map(tagHTML).join('')}</div>`;

  const isHTML = p.contentType === 'html';
  document.getElementById('reader-body').innerHTML =
    p.content
      ? isHTML
        ? `<div class="html-content">${p.content}</div>`
        : marked.parse(p.content)
      : '<div style="text-align:center;padding:48px 20px;color:var(--muted)">' +
        '<p style="font-size:1.05rem;margin-bottom:6px">No content yet.</p>' +
        '<p style="font-size:.88rem">Open <strong>Edit</strong> to type, paste, or upload a .md file.</p>' +
        '</div>';

  document.getElementById('r-edit-btn').onclick = () => openEditor(id);
  document.getElementById('r-pdf-btn').onclick  = () => exportPDF(p);

  showView('reader');
}

function exportPDF(p) {
  html2pdf().set({
    margin:      [12,12,12,12],
    filename:    (p.title||'log').replace(/\s+/g,'-').toLowerCase()+'.pdf',
    image:       { type:'jpeg', quality:0.98 },
    html2canvas: { scale:2 },
    jsPDF:       { unit:'mm', format:'a4', orientation:'portrait' }
  }).from(document.getElementById('reader-body')).save();
}

/* ─── EDITOR ─── */
let editingId = null;

function openEditor(id) {
  ['f-id','f-title','f-cat','f-tags','f-desc','f-github','f-deploy'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('f-date').value     = new Date().toISOString().slice(0,10);
  document.getElementById('f-content-type').value = 'markdown';
  document.getElementById('md-textarea').value = '';
  document.getElementById('md-preview').innerHTML =
    '<p style="color:var(--muted);font-style:italic">Start typing to see a live preview\u2026</p>';
  document.getElementById('word-count').textContent = '';
  document.getElementById('ed-del-btn').style.display = 'none';
  updateEditorMode();

  if (id) {
    const p = getProjects().find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('ed-title').textContent = 'Edit Log';
    document.getElementById('f-id').value           = p.id;
    document.getElementById('f-title').value        = p.title       || '';
    document.getElementById('f-cat').value          = p.category    || '';
    document.getElementById('f-tags').value         = (p.tags||[]).join(', ');
    document.getElementById('f-date').value         = p.date        || '';
    document.getElementById('f-desc').value         = p.description || '';
    document.getElementById('f-github').value        = p.github      || '';
    document.getElementById('f-deploy').value        = p.deploy      || '';
    document.getElementById('f-content-type').value = p.contentType || 'markdown';
    document.getElementById('md-textarea').value    = p.content     || '';
    updatePreview();
    document.getElementById('ed-del-btn').style.display = 'inline-flex';
  } else {
    editingId = null;
    document.getElementById('ed-title').textContent = 'New Log';
  }

  showView('editor');
  document.getElementById('f-title').focus();
}

function saveProject() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { alert('Title is required.'); return; }

  const rawMd      = document.getElementById('md-textarea').value;
  const manualDesc = document.getElementById('f-desc').value.trim();
  const autoDesc   = rawMd.replace(/[#>*_\-`]/g,'').trim().slice(0,160);
  const tags       = document.getElementById('f-tags').value.split(',').map(t=>t.trim()).filter(Boolean);

  const contentType = document.getElementById('f-content-type').value;
  const entry = {
    id:          editingId || Date.now().toString(),
    title,
    category:    document.getElementById('f-cat').value.trim() || 'Project',
    tags,
    description: manualDesc || autoDesc,
    date:        document.getElementById('f-date').value.trim(),
    github:      document.getElementById('f-github').value.trim() || null,
    deploy:      document.getElementById('f-deploy').value.trim() || null,
    content:     rawMd,
    contentType: contentType || 'markdown',
  };

  const projects = getProjects();
  if (editingId) {
    const idx = projects.findIndex(x => x.id === editingId);
    if (idx !== -1) projects[idx] = entry; else projects.unshift(entry);
  } else {
    projects.unshift(entry);
  }
  setProjects(projects);

  // Merge new tags into global list
  const gt = getGlobalTags() || [];
  tags.forEach(t => { if (!gt.includes(t.toLowerCase())) gt.push(t.toLowerCase()); });
  setGlobalTags(gt);

  showDashboard();
}

function deleteProject() {
  if (!editingId || !confirm('Delete this log permanently?')) return;
  setProjects(getProjects().filter(x => x.id !== editingId));
  editingId = null;
  showDashboard();
}

/* Live preview + word count */
function updateEditorMode() {
  const contentType = document.getElementById('f-content-type').value;
  const mdSection = document.querySelector('.editor-panes');
  const uploadSection = document.getElementById('f-upload').parentElement;
  const textarea = document.getElementById('md-textarea');
  
  if (contentType === 'html') {
    mdSection.style.display = 'grid';
    uploadSection.style.display = 'none';
    document.querySelector('.pane-label-row .pane-label').textContent = 'HTML';
    textarea.placeholder = 'Write or paste your HTML code here...\n\n<h2>My Component</h2>\n<p>Interactive HTML content</p>';
  } else {
    mdSection.style.display = 'grid';
    uploadSection.style.display = 'block';
    document.querySelector('.pane-label-row .pane-label').textContent = 'Markdown';
    textarea.placeholder = 'Write your log in Markdown…\n\n## Round 1\n\n> **You:** What should I build?\n\n> **AI:** Let\'s figure it out…';
  }
  updatePreview();
}

function updatePreview() {
  const md = document.getElementById('md-textarea').value;
  const contentType = document.getElementById('f-content-type').value;
  const wordCountEl = document.getElementById('word-count');
  
  if (contentType === 'html') {
    document.getElementById('md-preview').innerHTML = md
      ? `<div class="html-content">${md}</div>`
      : '<p style="color:var(--muted);font-style:italic">Start typing to see a live preview\u2026</p>';
    wordCountEl.textContent = '';
  } else {
    document.getElementById('md-preview').innerHTML = md
      ? marked.parse(md)
      : '<p style="color:var(--muted);font-style:italic">Start typing to see a live preview\u2026</p>';
    const plain = md.replace(/```[\s\S]*?```/g,'').replace(/[#>*_\-`\[\]()]/g,'').trim();
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const mins  = Math.max(1, Math.round(words / 200));
    wordCountEl.textContent =
      words ? `${words.toLocaleString()} word${words!==1?'s':''} \u00b7 ${mins} min read` : '';
  }
}
document.getElementById('md-textarea').addEventListener('input', updatePreview);

/* File upload */
document.getElementById('f-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = ev => {
    document.getElementById('md-textarea').value = ev.target.result;
    
    // Auto-detect content type based on file extension
    if (file.name.endsWith('.html')) {
      document.getElementById('f-content-type').value = 'html';
      updateEditorMode();
    }
    
    updatePreview();
    if (!document.getElementById('f-title').value)
      document.getElementById('f-title').value =
        file.name.replace(/\.(md|txt|html)$/,'').replace(/[-_]/g,' ');
  };
  fr.readAsText(file);
});

/* ─── TAG AUTOCOMPLETE ─── */
let suggestionFocusIdx = -1;

function onTagsInput(input) {
  const parts  = input.value.split(',');
  const typed  = parts[parts.length - 1].trim().toLowerCase();
  if (!typed) { closeSuggestions(); return; }
  const used   = parts.slice(0,-1).map(t=>t.trim().toLowerCase());
  const matches = (getGlobalTags()||[]).filter(t => t.includes(typed) && !used.includes(t));
  const box    = document.getElementById('tag-suggestions');
  if (!matches.length) { closeSuggestions(); return; }
  suggestionFocusIdx = -1;
  box.innerHTML = matches.slice(0,6).map(t => {
    const c = getTagColors(t);
    return `<div class="tag-sug-item" onmousedown="pickSuggestion('${t}')">
      ${t}
      <span class="tag-sug-badge" style="background:${c.bg};color:${c.text}">${t}</span>
    </div>`;
  }).join('');
  box.classList.add('open');
}

function onTagsKeydown(e) {
  const box   = document.getElementById('tag-suggestions');
  const items = box.querySelectorAll('.tag-sug-item');
  if (!box.classList.contains('open') || !items.length) return;
  if (e.key==='ArrowDown')  { e.preventDefault(); suggestionFocusIdx = Math.min(suggestionFocusIdx+1, items.length-1); }
  else if (e.key==='ArrowUp') { e.preventDefault(); suggestionFocusIdx = Math.max(suggestionFocusIdx-1, -1); }
  else if ((e.key==='Enter'||e.key==='Tab') && suggestionFocusIdx>=0) {
    e.preventDefault(); pickSuggestion(items[suggestionFocusIdx].dataset.val); return;
  } else if (e.key==='Escape') { closeSuggestions(); return; }
  items.forEach((el,i) => el.classList.toggle('focused', i===suggestionFocusIdx));
}

function pickSuggestion(tag) {
  const input = document.getElementById('f-tags');
  const parts = input.value.split(',');
  parts[parts.length-1] = ' ' + tag;
  input.value = parts.join(',').replace(/^,\s*/,'') + ', ';
  input.focus(); closeSuggestions();
}

function closeSuggestions() {
  document.getElementById('tag-suggestions').classList.remove('open');
  suggestionFocusIdx = -1;
}

/* ─── KEYBOARD SHORTCUTS ─── */
document.addEventListener('keydown', e => {
  const inEditor = document.getElementById('v-editor').style.display !== 'none';
  const inReader = document.getElementById('v-reader').style.display !== 'none';
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    if (inEditor) { e.preventDefault(); saveProject(); }
  }
  if (e.key === 'Escape') {
    const a = document.activeElement;
    if (!(a && (a.tagName==='INPUT'||a.tagName==='TEXTAREA'))) {
      if (inEditor || inReader) showDashboard();
    }
  }
});

/* ─── EXPORT / IMPORT JSON ─── */
function exportJSON() {
  const data = { exported: new Date().toISOString(), version: 1,
                 projects: getProjects(), tags: getGlobalTags() || [] };
  const a = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),
    download: `builderlog-backup-${new Date().toISOString().slice(0,10)}.json`
  });
  a.click(); URL.revokeObjectURL(a.href);
}

function importJSON(input) {
  const file = input.files[0]; if (!file) return;
  const fr = new FileReader();
  fr.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data.projects)) throw new Error('Invalid format');
      const existing = getProjects();
      const existIds = new Set(existing.map(p=>p.id));
      const incoming = data.projects.filter(p=>p.id&&p.title);
      const newItems = incoming.filter(p=>!existIds.has(p.id));
      setProjects([...existing, ...newItems]);
      const gt = getGlobalTags() || [];
      (data.tags||[]).forEach(t=>{ if(!gt.includes(t)) gt.push(t); });
      setGlobalTags(gt);
      alert(newItems.length
        ? `Imported ${newItems.length} new log${newItems.length!==1?'s':''}!`
        : 'No new logs to import (all IDs already exist).');
      showDashboard();
    } catch(err) { alert('Import failed: ' + err.message); }
    input.value = '';
  };
  fr.readAsText(file);
}

/* ─── DARK MODE ─── */
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '\u263C' : '\u263E';
}

themeToggle.onclick = () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem(KEY_THEME, dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '\u263C' : '\u263E';
  renderTagBar();
  renderCards();
};

applyTheme(localStorage.getItem(KEY_THEME) === 'dark');

/* ─── FOOTER HIDE ON SCROLL ─── */
let lastScroll = 0;
const footer = document.querySelector('footer');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  footer.classList.toggle('hidden', current > lastScroll && current > 80);
  lastScroll = current;
});

/* ─── INIT ─── */
showDashboard();
