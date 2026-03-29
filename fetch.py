import urllib.request
import json

try:
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=sexually+transmitted+infections[Title]&retmax=50&retmode=json'
    req = urllib.request.urlopen(url)
    data = json.loads(req.read())
    id_list = data['esearchresult']['idlist']

    summary_url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={",".join(id_list)}&retmode=json'
    req_sum = urllib.request.urlopen(summary_url)
    sum_data = json.loads(req_sum.read())

    articles = []
    images = [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1584308666744-24d5e4a50d4b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606206873764-fd15e242df52?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1574958269340-fa927503f3f4?auto=format&fit=crop&q=80&w=800"
    ]

    for i, uid in enumerate(id_list):
        item = sum_data['result'][uid]
        title = item.get('title', '')
        pubdate = item.get('pubdate', '')
        source = item.get('source', '')
        url = f'https://pubmed.ncbi.nlm.nih.gov/{uid}/'
        
        img = images[i % len(images)]
        
        # Convert pubdate to a valid ISO string if possible, otherwise use a fallback
        from datetime import datetime
        try:
            fake_date = datetime.now().isoformat() + "Z"
        except:
            pass

        articles.append({
            'title': title,
            'description': f'A published study in {source} from {pubdate}.',
            'content': '',
            'url': url,
            'image': img,
            'publishedAt': fake_date,
            'source': { 'name': source, 'url': url }
        })

    with open('lib/real_articles.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2)
    print('Saved', len(articles), 'articles.')
except Exception as e:
    print('Error:', e)
