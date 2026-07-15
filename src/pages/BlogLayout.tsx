import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  file: string;
}

interface DocCategory {
  category: string;
  items: DocItem[];
}

export default function BlogLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Load docs structure
  useEffect(() => {
    fetch('/docs.json')
      .then(res => res.json())
      .then((data: DocCategory[]) => {
        setCategories(data);
        // Expand all categories by default
        const initialExpanded: Record<string, boolean> = {};
        data.forEach(c => initialExpanded[c.category] = true);
        setExpandedCats(initialExpanded);
        
        setLoadingDocs(false);
        // Default to first doc if no id
        if (!id && data.length > 0 && data[0].items.length > 0) {
          navigate(`/post/${data[0].items[0].id}`, { replace: true });
        }
      })
      .catch(err => {
        console.error('Failed to load docs structure', err);
        setLoadingDocs(false);
      });
  }, [id, navigate]);

  // Find active doc and category
  const activeCategoryObj = categories.find(c => c.items.some(i => i.id === id));
  const activeDoc = activeCategoryObj?.items.find(i => i.id === id);

  // Load specific doc content
  useEffect(() => {
    if (!activeDoc) return;
    
    setLoadingContent(true);
    setHeadings([]); // Clear old TOC
    
    // Reset scroll position to top when switching pages
    const mainContainer = document.querySelector('.doc-main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
    
    fetch(activeDoc.file)
      .then(res => res.text())
      .then(text => {
        setPostContent(text);
        
        // Extract headings for Table of Contents (H2s)
        const headingRegex = /^## (.*$)/gim;
        const extracted = [];
        let match;
        while ((match = headingRegex.exec(text)) !== null) {
          extracted.push({
            id: match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            text: match[1].trim()
          });
        }
        setHeadings(extracted);
        if (extracted.length > 0) {
          setActiveHeading(extracted[0].id);
        }
        setLoadingContent(false);
      })
      .catch(err => {
        console.error('Failed to load doc content', err);
        setPostContent('# Error loading document');
        setLoadingContent(false);
      });
  }, [activeDoc]);

  // Scrollspy effect
  useEffect(() => {
    const mainContainer = document.querySelector('.doc-main');
    if (!mainContainer || headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      let currentActive = headings[0]?.id || '';
      
      for (const el of headingElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          // 120px offset to account for sticky header and padding
          if (rect.top <= 120) {
            currentActive = el.id;
          }
        }
      }
      setActiveHeading(currentActive);
    };

    mainContainer.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 100);

    return () => mainContainer.removeEventListener('scroll', handleScroll);
  }, [headings, postContent]); // re-run when content or headings change

  // Calculate read time
  const wordCount = postContent.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200) || 1;

  const toggleCategory = (catName: string) => {
    setExpandedCats(prev => ({...prev, [catName]: !prev[catName]}));
  };

  if (loadingDocs) {
    return <div className="loading"><div className="loading-spinner">Loading docs...</div></div>;
  }

  // Custom renderer for headings to add IDs for the TOC and Syntax Highlighting for code
  const components = {
    h2: ({node, ...props}: any) => {
      const text = String(props.children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return <h2 id={id} {...props} />;
    },
    code({node, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ background: 'transparent', padding: 0, margin: 0 }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="doc-layout">
      {/* Mobile Overlay */}
      <div 
        className="mobile-overlay" 
        onClick={() => document.body.classList.remove('sidebar-open')}
      ></div>

      <aside className="doc-sidebar">
        {categories.map(cat => (
          <div key={cat.category} className="doc-category">
            <div 
              className="doc-category-header" 
              onClick={() => toggleCategory(cat.category)}
            >
              <div className="doc-category-title-wrap">
                {expandedCats[cat.category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <h4 className="doc-category-title">{cat.category}</h4>
              </div>
              <span className="doc-category-badge">{cat.items.length}</span>
            </div>
            
            {expandedCats[cat.category] && (
              <ul className="doc-nav-list">
                {cat.items.map(item => (
                  <li key={item.id}>
                    <Link 
                      to={`/post/${item.id}`} 
                      className={`doc-nav-link ${item.id === id ? 'active' : ''}`}
                      onClick={() => document.body.classList.remove('sidebar-open')}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </aside>
      
      <main className="doc-main">
        <div className="doc-content-container">
          {loadingContent ? (
            <div className="loading"><div className="loading-spinner">Loading article...</div></div>
          ) : activeDoc ? (
            <>
              {/* Breadcrumbs */}
              <div className="breadcrumbs">
                Home / {activeCategoryObj?.category} / <span className="current">{activeDoc.title}</span>
              </div>
              
              <article className="markdown-body">
                {/* Custom Article Header matching UI reference */}
                <div className="article-header">
                  <div className="read-time">
                    <Clock size={14} /> {readTime} phút đọc
                  </div>
                  <h1>{activeDoc.title}</h1>
                </div>

                {/* Remove the first H1 if it exists so we don't duplicate */}
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {postContent.replace(/^# .*\n/, '')}
                </ReactMarkdown>
              </article>
            </>
          ) : (
            <div className="empty-state">Select a topic from the left menu.</div>
          )}
        </div>
      </main>

      <aside className="doc-toc">
        {headings.length > 0 && (
          <div className="toc-container">
            <h4 className="toc-title">ON THIS PAGE</h4>
            <ul className="toc-list">
              {headings.map(h => (
                <li key={h.id}>
                  <a 
                    href={`#${h.id}`} 
                    className={`toc-link ${activeHeading === h.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(h.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
