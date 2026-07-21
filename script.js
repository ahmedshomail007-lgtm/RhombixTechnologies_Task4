// Global Application State & Expanded Articles
const state = {
    currentView: 'home',
    activeArticleId: null,
    isAdminAuthenticated: false,
    selectedCoverDataUrl: null,
    showingBookmarksOnly: false,
    theme: 'dark',
    bookmarkedPostIds: new Set(),
    posts: [
        {
            id: 'post-1',
            title: 'Building Low-Latency Telecom Networks & Routing Engine Logs',
            category: 'Telecom',
            author: 'Alex Hale',
            avatarColor: '#4f46e5',
            date: 'July 20, 2026',
            readTime: '6 min read',
            likes: 42,
            tags: ['telecom', 'node', 'performance'],
            excerpt: 'How we optimized call routing, reduced Post-Dial Delay (PDD), and investigated live Answer Success Rate (ASR) metrics.',
            content: `<p>In telecommunications routing and backend operations, minimizing Post-Dial Delay (PDD) and maintaining high Answer Success Rates (ASR) is critical for system reliability.</p><p>When processing large volumes of routing logs, synchronous handling introduces processing delays. By decoupling message ingestion through worker queues and analyzing raw routing packets in memory, response latency drops significantly.</p><h3>Key Key Performance Indicators (KPIs):</h3><ul><li><strong>ASR (Answer Success Rate):</strong> Increased by 14% across trunk groups.</li><li><strong>PDD (Post Dial Delay):</strong> Reduced under 450ms globally.</li><li><strong>ACD (Average Call Duration):</strong> Tracked dynamically to detect routing loops.</li></ul>`,
            coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
            comments: [
                { id: 'c1', author: 'Farwa Z.', date: '2 hours ago', text: 'Great analysis on reducing PDD! Caching the route maps makes complete sense.' }
            ]
        },
        {
            id: 'post-2',
            title: 'Design Systems for Scale: UI Prototyping in Figma',
            category: 'Design',
            author: 'Izza D.',
            avatarColor: '#ec4899',
            date: 'July 18, 2026',
            readTime: '4 min read',
            likes: 89,
            tags: ['figma', 'ui-ux', 'design-systems'],
            excerpt: 'Standardizing tokenized variables, auto-layout variants, and dark theme contrast ratios for enterprise dashboards.',
            content: `<p>Maintaining consistency across enterprise software suites requires a resilient design system anchored in robust Figma component libraries.</p><p>By leveraging Figma token variables for color spacing and dark mode mappings, design teams eliminate redundant specifications during engineer handoff.</p>`,
            coverImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
            comments: []
        },
        {
            id: 'post-3',
            title: 'State Driven Architectures with React & Express',
            category: 'Architecture',
            author: 'Haroon Z.',
            avatarColor: '#d97706',
            date: 'July 15, 2026',
            readTime: '8 min read',
            likes: 67,
            tags: ['react', 'express', 'mern'],
            excerpt: 'Best practices for organizing dynamic tab components, accordion views, and scalable API data contracts.',
            content: `<p>Building scalable MERN stack web applications demands clean component hierarchy and isolated state management.</p><p>Using explicit state interfaces prevents unnecessary re-renders when maintaining client dashboards, tabs, and interactive data grid tools.</p>`,
            coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            comments: [
                { id: 'c3', author: 'Gaurang S.', date: '1 day ago', text: 'Extremely clean structure. The breakdown of API contracts is very clear.' }
            ]
        },
        {
            id: 'post-4',
            title: 'Microservices Communication Protocols: gRPC vs REST',
            category: 'Engineering',
            author: 'Talha M.',
            avatarColor: '#10b981',
            date: 'July 10, 2026',
            readTime: '5 min read',
            likes: 31,
            tags: ['microservices', 'grpc', 'backend'],
            excerpt: 'A benchmark comparison of Protocol Buffers over HTTP/2 versus traditional JSON payload interfaces.',
            content: `<p>When inter-service network volume grows into millions of daily calls, traditional JSON over HTTP/1.1 creates significant serializing bottlenecks.</p><p>gRPC utilizes Protocol Buffers to compress structured binary messages, lowering network overhead and payload size up to 70%.</p>`,
            coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            comments: []
        }
    ]
};

// Core Application Routines
function initApp() {
    renderFeed(state.posts);
    updateAdminMetrics();
    attachEventListeners();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerText = state.theme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }
}

function navigate(targetView) {
    state.currentView = targetView;
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetPanel = document.getElementById(`${targetView}-view`);
    if (targetPanel) targetPanel.classList.remove('hidden');

    const activeNavBtn = document.querySelector(`.nav-btn[data-target="${targetView}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFeed(postsToRender) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (postsToRender.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);"><h3>No articles found matching criteria</h3></div>`;
        return;
    }

    container.innerHTML = postsToRender.map(post => `
        <article class="post-card">
            <div class="card-banner" style="background-image: url('${post.coverImage}');">
                <span class="category-pill">${post.category}</span>
            </div>
            <div class="card-body">
                <div class="post-meta">${post.date} • ${post.readTime}</div>
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.excerpt)}</p>
                <div class="tag-cloud">
                    ${post.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
                </div>
            </div>
            <div class="card-footer">
                <div class="author-info">
                    <div class="avatar" style="background: ${post.avatarColor}">
                        ${post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>${post.author}</span>
                </div>
                <button class="btn-read" data-read-id="${post.id}">Read →</button>
            </div>
        </article>
    `).join('');
}

function applySearchAndFilter() {
    const query = (document.getElementById('search-input')?.value || '').toLowerCase();
    const category = document.getElementById('category-filter')?.value || 'ALL';

    const filtered = state.posts.filter(post => {
        const matchesQuery = post.title.toLowerCase().includes(query) ||
                             post.excerpt.toLowerCase().includes(query) ||
                             post.tags.some(t => t.toLowerCase().includes(query));
        const matchesCategory = category === 'ALL' || post.category === category;
        const matchesBookmark = !state.showingBookmarksOnly || state.bookmarkedPostIds.has(post.id);
        return matchesQuery && matchesCategory && matchesBookmark;
    });

    renderFeed(filtered);
}

function openArticle(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    state.activeArticleId = postId;
    const view = document.getElementById('article-view');
    const likesCountEl = document.getElementById('article-likes-count');
    if (likesCountEl) likesCountEl.innerText = post.likes;

    view.innerHTML = `
        <img class="article-hero-img" src="${post.coverImage}" alt="${escapeHtml(post.title)}">
        <div class="reader-header">
            <span class="category-pill">${post.category}</span>
            <h1>${escapeHtml(post.title)}</h1>
            <div class="reader-meta">
                <div class="author-info">
                    <div class="avatar" style="background: ${post.avatarColor}">
                        ${post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <strong>${post.author}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${post.date} • ${post.readTime}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="reader-body">${post.content}</div>
    `;

    renderComments(post.comments);
    navigate('reader');
}

function renderComments(comments) {
    const list = document.getElementById('comments-list');
    const count = document.getElementById('comment-count');
    if (count) count.innerText = comments.length;
    if (!list) return;

    if (comments.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted);">No comments yet. Start the conversation!</p>`;
        return;
    }

    list.innerHTML = comments.map(c => `
        <div class="comment-card">
            <div class="comment-header">
                <strong>${escapeHtml(c.author)}</strong>
                <span class="comment-date">${c.date}</span>
            </div>
            <p>${escapeHtml(c.text)}</p>
        </div>
    `).join('');
}

function updateAdminMetrics() {
    const postsEl = document.getElementById('stat-total-posts');
    const commentsEl = document.getElementById('stat-total-comments');
    const catEl = document.getElementById('stat-total-categories');

    if (postsEl) postsEl.innerText = state.posts.length;
    if (commentsEl) commentsEl.innerText = state.posts.reduce((acc, p) => acc + p.comments.length, 0);
    if (catEl) catEl.innerText = new Set(state.posts.map(p => p.category)).size;

    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = state.posts.map(post => `
        <tr>
            <td><strong>${escapeHtml(post.title)}</strong></td>
            <td><span class="category-pill">${post.category}</span></td>
            <td>❤️ ${post.likes}</td>
            <td>${post.comments.length}</td>
            <td>${post.date}</td>
            <td><button class="btn-danger-sm delete-btn" data-delete-id="${post.id}">Delete</button></td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function attachEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-toggle-btn')) {
            toggleTheme();
            return;
        }

        const navBtn = e.target.closest('.nav-btn');
        if (navBtn && !navBtn.id.includes('filter-bookmarks')) {
            const target = navBtn.getAttribute('data-target');
            if (target) navigate(target);
            return;
        }

        if (e.target.closest('#filter-bookmarks-btn')) {
            state.showingBookmarksOnly = !state.showingBookmarksOnly;
            e.target.closest('#filter-bookmarks-btn').classList.toggle('active', state.showingBookmarksOnly);
            applySearchAndFilter();
            return;
        }

        const readBtn = e.target.closest('.btn-read');
        if (readBtn) {
            const id = readBtn.getAttribute('data-read-id');
            if (id) openArticle(id);
            return;
        }

        if (e.target.closest('#like-article-btn')) {
            const post = state.posts.find(p => p.id === state.activeArticleId);
            if (post) {
                post.likes++;
                document.getElementById('article-likes-count').innerText = post.likes;
                updateAdminMetrics();
            }
            return;
        }

        if (e.target.closest('#bookmark-article-btn')) {
            if (state.activeArticleId) {
                if (state.bookmarkedPostIds.has(state.activeArticleId)) {
                    state.bookmarkedPostIds.delete(state.activeArticleId);
                    alert('Removed from bookmarks');
                } else {
                    state.bookmarkedPostIds.add(state.activeArticleId);
                    alert('Saved to bookmarks!');
                }
            }
            return;
        }

        if (e.target.closest('#share-article-btn')) {
            navigator.clipboard.writeText(window.location.href);
            alert('Article link copied to clipboard!');
            return;
        }

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-delete-id');
            if (id && confirm('Delete this article?')) {
                state.posts = state.posts.filter(p => p.id !== id);
                applySearchAndFilter();
                updateAdminMetrics();
            }
            return;
        }

        if (e.target.closest('#brand-logo') || e.target.closest('#back-to-feed-btn') || e.target.closest('#cancel-create-btn')) {
            navigate('home');
            return;
        }

        const formatBtn = e.target.closest('.editor-toolbar button');
        if (formatBtn) {
            const cmd = formatBtn.getAttribute('data-cmd');
            const value = formatBtn.getAttribute('data-value') || null;
            document.execCommand(cmd, false, value);
            return;
        }

        if (e.target.closest('#remove-img-btn')) {
            state.selectedCoverDataUrl = null;
            document.getElementById('post-image-file').value = '';
            document.getElementById('image-preview-wrapper').classList.add('hidden');
        }
    });

    document.getElementById('search-input')?.addEventListener('input', applySearchAndFilter);
    document.getElementById('category-filter')?.addEventListener('change', applySearchAndFilter);

    document.getElementById('post-image-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            state.selectedCoverDataUrl = event.target.result;
            const preview = document.getElementById('image-preview');
            const wrapper = document.getElementById('image-preview-wrapper');
            if (preview && wrapper) {
                preview.src = state.selectedCoverDataUrl;
                wrapper.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('comment-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('comment-author').value;
        const text = document.getElementById('comment-text').value;

        const post = state.posts.find(p => p.id === state.activeArticleId);
        if (post) {
            post.comments.push({ id: 'c_' + Date.now(), author, date: 'Just now', text });
            renderComments(post.comments);
            updateAdminMetrics();
            document.getElementById('comment-text').value = '';
            document.getElementById('comment-author').value = '';
        }
    });

    document.getElementById('create-post-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const editor = document.getElementById('rich-editor');

        if (!editor.textContent.trim()) {
            alert('Article content cannot be empty.');
            return;
        }

        const fallbackImages = {
            Engineering: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            Design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
            Architecture: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            Telecom: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
            Career: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
        };

        const newPost = {
            id: 'post-' + Date.now(),
            title: title,
            category: category,
            author: 'Engineering Team',
            avatarColor: '#10b981',
            date: 'Today',
            readTime: '3 min read',
            likes: 0,
            tags: tags.length ? tags : ['general'],
            excerpt: editor.textContent.trim().substring(0, 110) + '...',
            content: editor.innerHTML,
            coverImage: state.selectedCoverDataUrl || fallbackImages[category] || fallbackImages.Engineering,
            comments: []
        };

        state.posts.unshift(newPost);
        renderFeed(state.posts);
        updateAdminMetrics();

        e.target.reset();
        editor.innerHTML = '';
        state.selectedCoverDataUrl = null;
        document.getElementById('image-preview-wrapper').classList.add('hidden');
        navigate('home');
    });

    document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass').value;
        if (pass === 'admin123') {
            state.isAdminAuthenticated = true;
            document.getElementById('admin-auth-card').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            updateAdminMetrics();
        } else {
            alert('Invalid Passcode. Use "admin123"');
        }
    });

    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
        state.isAdminAuthenticated = false;
        document.getElementById('admin-pass').value = '';
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('admin-auth-card').classList.remove('hidden');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}