import os
import json
import glob
import re

def clean_title(title):
    title = re.sub(r'[*_`]', '', title).strip()
    return title

def parse_confluence_summary(filepath):
    sections = []
    current_sec = None
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line_str = line.strip()
            if line_str.startswith('### '):
                if current_sec and current_sec['items']:
                    sections.append(current_sec)
                current_sec = {'title': clean_title(line_str[4:]), 'items': []}
            elif line_str.startswith('- ['):
                m = re.match(r'-\s+\[(.*?)\]\((.*?)\)', line_str)
                if m:
                    if not current_sec:
                        current_sec = {'title': 'General', 'items': []}
                    current_sec['items'].append({
                        'title': clean_title(m.group(1)),
                        'path': m.group(2)
                    })
    if current_sec and current_sec['items']:
        sections.append(current_sec)
    return sections

def parse_gitbook_summary(filepath):
    sections = []
    current_sec = {'title': 'General', 'items': []}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line_str = line.strip()
            if line_str.startswith('## '):
                if current_sec and current_sec['items']:
                    sections.append(current_sec)
                current_sec = {'title': clean_title(line_str[3:]), 'items': []}
            elif line_str.startswith('* [') or line_str.startswith('- ['):
                m = re.match(r'[\*\-]\s+\[(.*?)\]\((.*?)\)', line_str)
                if m:
                    title, rel_path = m.group(1), m.group(2)
                    current_sec['items'].append({
                        'title': clean_title(title),
                        'path': rel_path
                    })
    if current_sec and current_sec['items']:
        sections.append(current_sec)
    return sections

def build_manifest():
    manifest = {
        'sources': {
            'gitbook': {
                'title': 'GitBook Docs',
                'description': 'Clean, modular documentation formatted for GitBook spaces and sync.',
                'subspaces': {
                    'user': {
                        'title': 'User Guide',
                        'base': 'docs/gitbook/user',
                        'readme': 'docs/gitbook/user/README.md',
                        'sections': parse_gitbook_summary('docs/gitbook/user/SUMMARY.md')
                    },
                    'developer': {
                        'title': 'Developer Reference',
                        'base': 'docs/gitbook/developer',
                        'readme': 'docs/gitbook/developer/README.md',
                        'sections': parse_gitbook_summary('docs/gitbook/developer/SUMMARY.md')
                    }
                }
            },
            'confluence': {
                'title': 'Confluence Wiki',
                'description': 'Comprehensive corporate knowledge base and operational wiki with metadata labels.',
                'subspaces': {
                    'user': {
                        'title': 'User Guide',
                        'base': 'docs/confluence/user',
                        'readme': 'docs/confluence/user/index.md',
                        'sections': parse_confluence_summary('docs/confluence/user/index.md')
                    },
                    'developer': {
                        'title': 'Developer Reference',
                        'base': 'docs/confluence/developer',
                        'readme': 'docs/confluence/developer/index.md',
                        'sections': parse_confluence_summary('docs/confluence/developer/index.md')
                    }
                }
            }
        }
    }
    
    # Pre-index all documents for lightning-fast search
    search_index = []
    
    for source_id, source_info in manifest['sources'].items():
        for subspace_id, subspace_info in source_info['subspaces'].items():
            base_dir = subspace_info['base']
            # Add readme/index
            readme_path = subspace_info['readme']
            if os.path.exists(readme_path):
                with open(readme_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                # Clean headers and preview
                clean_content = re.sub(r'#+\s*', '', content)
                clean_content = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_content)
                search_index.append({
                    'source': source_id,
                    'subspace': subspace_id,
                    'section': 'Overview',
                    'title': subspace_info['title'] + ' Overview',
                    'path': 'README.md' if 'README.md' in readme_path else 'index.md',
                    'filePath': readme_path.replace('\\', '/'),
                    'snippet': clean_content[:260].replace('\n', ' ').strip()
                })
            
            for sec in subspace_info['sections']:
                for item in sec['items']:
                    full_p = os.path.join(base_dir, item['path'])
                    snippet = ""
                    if os.path.exists(full_p):
                        with open(full_p, 'r', encoding='utf-8', errors='ignore') as f:
                            c = f.read()
                        clean_c = re.sub(r'<!--.*?-->', '', c, flags=re.DOTALL)
                        clean_c = re.sub(r'#+\s*', '', clean_c)
                        clean_c = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_c)
                        clean_c = re.sub(r'<[^>]+>', ' ', clean_c)
                        snippet = ' '.join(clean_c.split())[:280]
                    
                    search_index.append({
                        'source': source_id,
                        'subspace': subspace_id,
                        'section': sec['title'],
                        'title': item['title'],
                        'path': item['path'],
                        'filePath': full_p.replace('\\', '/'),
                        'snippet': snippet
                    })

    os.makedirs('data', exist_ok=True)
    with open('data/manifest.json', 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    with open('data/search-index.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=2)

    # Generate data.js so index.html works with BOTH file:// (double-click) and http:// (Render/web server)
    with open('data/data.js', 'w', encoding='utf-8') as f:
        f.write('window.__DOCS_MANIFEST__ = ' + json.dumps(manifest) + ';\n')
        f.write('window.__DOCS_SEARCH_INDEX__ = ' + json.dumps(search_index) + ';\n')

    # Build standalone dist directory for Render staticPublishPath: dist
    build_dist()

def build_dist():
    import shutil
    dist_dir = 'dist'
    os.makedirs(dist_dir, exist_ok=True)
    
    # Copy root index.html
    shutil.copy('index.html', os.path.join(dist_dir, 'index.html'))
    
    # Copy assets
    if os.path.exists('assets'):
        dest_assets = os.path.join(dist_dir, 'assets')
        if os.path.exists(dest_assets):
            shutil.rmtree(dest_assets)
        shutil.copytree('assets', dest_assets)
        
    # Copy data
    if os.path.exists('data'):
        dest_data = os.path.join(dist_dir, 'data')
        if os.path.exists(dest_data):
            shutil.rmtree(dest_data)
        shutil.copytree('data', dest_data)
        
    # Copy docs
    if os.path.exists('docs'):
        dest_docs = os.path.join(dist_dir, 'docs')
        if os.path.exists(dest_docs):
            shutil.rmtree(dest_docs)
        shutil.copytree('docs', dest_docs)

    print("Dist directory prepared for production deployment.")

if __name__ == '__main__':
    build_manifest()

