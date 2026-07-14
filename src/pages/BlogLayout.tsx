import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


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

  // Load docs structure
  useEffect(() => {
    fetch('/docs.json')
      .then(res => res.json())
      .then((data: DocCategory[]) => {
        setCategories(data);
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

  // Find active doc
  const activeDoc = categories.flatMap(c => c.items).find(i => i.id === id);

  // Load specific doc content
  useEffect(() => {
    if (!activeDoc) return;
    
    setLoadingContent(true);
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
            id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            text: match[1]
          });
        }
        setHeadings(extracted);
        setLoadingContent(false);
      })
      .catch(err => {
        console.error('Failed to load doc content', err);
        setPostContent('# Error loading document');
        setLoadingContent(false);
      });
  }, [activeDoc]);

  if (loadingDocs) {
    return <div className="loading"><div className="loading-spinner">Loading docs...</div></div>;
  }

  // Custom renderer for headings to add IDs for the TOC
  const components = {
    h2: ({node, ...props}: any) => {
      const id = props.children[0]?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return <h2 id={id} {...props} />;
    }
  };

  return (
    <div className="doc-layout">
      <aside className="doc-sidebar">
        {categories.map(cat => (
          <div key={cat.category} className="doc-category">
            <h4 className="doc-category-title">{cat.category}</h4>
            <ul className="doc-nav-list">
              {cat.items.map(item => (
                <li key={item.id}>
                  <Link 
                    to={`/post/${item.id}`} 
                    className={`doc-nav-link ${item.id === id ? 'active' : ''}`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      
      <main className="doc-main">
        <div className="doc-content-container">
          {loadingContent ? (
            <div className="loading"><div className="loading-spinner">Loading article...</div></div>
          ) : activeDoc ? (
            <article className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {postContent}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="empty-state">Select a topic from the left menu.</div>
          )}
        </div>
      </main>

      <aside className="doc-toc">
        {headings.length > 0 && (
          <div className="toc-container">
            <h4 className="toc-title">On this page</h4>
            <ul className="toc-list">
              {headings.map(h => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="toc-link">{h.text}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
