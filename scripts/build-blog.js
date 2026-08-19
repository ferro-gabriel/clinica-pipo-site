// Gera as páginas do blog (blog-post-*.html e a grade de posts em blog.html)
// a partir dos arquivos Markdown em content/blog/. Roda automaticamente no
// deploy (GitHub Actions) sempre que um post é criado/editado pelo painel (/admin).
//
// Uso: node scripts/build-blog.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SITE_URL = 'https://clinicadeautismopipo.com.br';
const WHATSAPP = '5547999631084';

const header = fs.readFileSync(path.join(TEMPLATES_DIR, 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(TEMPLATES_DIR, 'footer.html'), 'utf8');

function slugify(filename) {
  return path.basename(filename, '.md');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Converte o markdown do corpo do post para o HTML usado no site,
// trocando blockquotes por <div class="article-quote"> (o destaque visual do tema).
function renderBody(markdown) {
  const html = marked.parse(markdown);
  return html.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g, '<div class="article-quote">$1</div>');
}

function loadPosts() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const slug = slugify(file);
      // gray-matter converte "date: 2026-07-02" num objeto Date; normaliza de volta para YYYY-MM-DD.
      const isoDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
      return {
        slug,
        file: `blog-post-${slug}.html`,
        title: data.title,
        description: data.description,
        date: isoDate,
        dateLabel: formatDate(data.date),
        readTime: data.readTime,
        tag: data.tag,
        tagColor: data.tagColor,
        cover: data.cover,
        authorName: data.authorName,
        authorRole: data.authorRole,
        authorBio: data.authorBio,
        authorPhoto: data.authorPhoto,
        bodyHtml: renderBody(content),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function relatedCard(post) {
  return `        <a href="${post.file}" class="blog-card">
          <figure class="blog-card-photo"><img src="${post.cover}" alt="${post.title}" loading="lazy" /></figure>
          <div class="blog-card-body">
            <span class="blog-card-tag" style="background:${post.tagColor}22;color:${post.tagColor}">${post.tag}</span>
            <h4 class="blog-card-title">${post.title}</h4>
          </div>
        </a>`;
}

function buildPostPage(post, allPosts) {
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const relatedHtml = related.map(relatedCard).join('\n');
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}/${post.cover}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Clínica de Autismo Pipo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-pipo-cor-horizontal.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/${post.file}` },
  });

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${post.title} | Blog Pipo</title>
<meta name="description" content="${post.description}" />
<link rel="canonical" href="${SITE_URL}/${post.file}" />
<meta property="og:url" content="${SITE_URL}/${post.file}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Clínica de Autismo Pipo" />
<meta property="og:title" content="${post.title} | Blog Pipo" />
<meta property="og:description" content="${post.description}" />
<meta property="og:image" content="${SITE_URL}/${post.cover}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${post.title} | Blog Pipo" />
<meta name="twitter:description" content="${post.description}" />
<meta name="twitter:image" content="${SITE_URL}/${post.cover}" />
<link rel="icon" type="image/png" href="assets/mascote-rosto.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/styles.css" />
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>

${header}
<main>
  <div class="section-inner section-inner-narrow">
    <p class="page-breadcrumb"><a href="index.html">Início</a> / <a href="blog.html">Blog</a> / ${post.title}</p>
  </div>
  <article class="article-section">
    <div class="section-inner section-inner-narrow">
      <div class="article-header">
        <span class="blog-card-tag" style="background:${post.tagColor}1f;color:${post.tagColor}">${post.tag}</span>
        <h1 class="article-title">${post.title}</h1>
        <div class="article-meta">
          <span><svg width="16" height="16"><use href="#icon-user"/></svg> ${post.authorName}</span>
          <span><svg width="16" height="16"><use href="#icon-calendar"/></svg> ${post.dateLabel}</span>
          <span><svg width="16" height="16"><use href="#icon-clock"/></svg> ${post.readTime}</span>
        </div>
      </div>
      <figure class="article-cover"><img src="${post.cover}" alt="${post.title}" /></figure>
      <div class="article-body">
${post.bodyHtml}
      </div>

      <div class="article-cta">
        <h3>Ficou com dúvidas sobre este tema?</h3>
        <p>Nossa equipe pode conversar com você sobre avaliação e terapias para o seu caso.</p>
        <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener noreferrer" class="btn btn-yellow btn-upper">Falar no WhatsApp <svg class="icon" width="16" height="16"><use href="#icon-arrow-right"/></svg></a>
      </div>

      <div class="article-author">
        <img src="${post.authorPhoto}" alt="${post.authorName}" />
        <div>
          <h4>${post.authorName}</h4>
          <p>${post.authorRole}</p>
          <p>${post.authorBio}</p>
        </div>
      </div>

      <div class="article-related">
        <h3>Continue lendo</h3>
        <div class="blog-grid">
${relatedHtml}</div>
      </div>
    </div>
  </article>
</main>
${footer}`;
}

function blogCard(post) {
  return `      <a href="${post.file}" class="blog-card">
        <figure class="blog-card-photo"><img src="${post.cover}" alt="${post.title}" loading="lazy" /></figure>
        <div class="blog-card-body">
          <span class="blog-card-tag" style="background:${post.tagColor}22;color:${post.tagColor}">${post.tag}</span>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${post.description}</p>
          <div class="blog-card-meta">
            <span><svg width="14" height="14"><use href="#icon-calendar"/></svg> ${post.dateLabel}</span>
            <span><svg width="14" height="14"><use href="#icon-clock"/></svg> ${post.readTime}</span>
          </div>
        </div>
      </a>`;
}

function updateBlogIndex(posts) {
  const blogIndexPath = path.join(ROOT, 'blog.html');
  let html = fs.readFileSync(blogIndexPath, 'utf8');
  const startMarker = '<!-- BLOG_GRID_START -->';
  const endMarker = '<!-- BLOG_GRID_END -->';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1) {
    console.error('Marcadores BLOG_GRID_START/END não encontrados em blog.html — grade não atualizada.');
    return;
  }
  const cardsHtml = posts.map(blogCard).join('\n');
  html = html.slice(0, start + startMarker.length) + '\n' + cardsHtml + '\n      ' + html.slice(end);
  fs.writeFileSync(blogIndexPath, html, 'utf8');
}

// Lista todas as páginas do site (as que já existiam + os posts gerados) para o sitemap.xml.
function generateSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const staticPages = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.html') && !f.startsWith('blog-post-'))
    .sort();

  const urls = staticPages.map((file) => {
    const loc = file === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${file}`;
    return { loc, lastmod: today };
  });
  posts.forEach((post) => {
    urls.push({ loc: `${SITE_URL}/${post.file}`, lastmod: post.date });
  });

  const body = urls
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml atualizado com ${urls.length} página(s).`);
}

function main() {
  const posts = loadPosts();
  posts.forEach((post) => {
    const html = buildPostPage(post, posts);
    fs.writeFileSync(path.join(ROOT, post.file), html, 'utf8');
    console.log('gerado:', post.file);
  });
  updateBlogIndex(posts);
  console.log(`blog.html atualizado com ${posts.length} post(s).`);
  generateSitemap(posts);
}

main();
