import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SHAMELA_MCP_URL = 'https://mcp.shamela.ws';

// Myanmar & English to Arabic search keyword mapper
const TERM_MAP: Record<string, string> = {
  'ဗုခါရီ': 'البخاري',
  'မွတ်စလင်မ်': 'مسلم',
  'သဖ်ဆီးရ်': 'تفسير',
  'ဟဒီးဆ်': 'حديث',
  'ကုရ်အာန်': 'القرآن',
  'ဖိကဟ်': 'الفقه',
  'အကီဒဟ်': 'العقيدة',
  'ဆီရသ်': 'السيرة',
  'သမိုင်း': 'التاريخ',
  'ဆွလားတ်': 'الصلاة',
  'ဆွလသ်': 'الصلاة',
  'နမားဇ်': 'الصلاة',
  'နမတ်စ်': 'الصلاة',
  'ဇကားသ်': 'الزكاة',
  'ဥပုသ်': 'الصوم',
  'ဆွောင်မ်': 'الصوم',
  'ဟဂ်ျ': 'الحج',
  'ဟဂျ်': 'الحج',
  'ဒုအာ': 'الدعاء',
  'ဒိုအာ': 'الدعاء',
  'ဇိကိရ်': 'الذكر',
  'ဝိုဒူ': 'الوضوء',
  'ဝုဒူ': 'الوضوء',
  'ဝုသွူ': 'الوضوء',
  'သောင်ဟီးဒ်': 'التوحيد',
  'အိဗ်နုကစီးရ်': 'ابن كثير',
  'နဝဝီ': 'النووي',
  'သိုင်မီယဟ်': 'ابن تيمية',
  'အဘူဒါဝူးဒ်': 'أبو داود',
  'တိရ်မိဇီ': 'الترمذي',
  'နစာအီ': 'النسائي',
  'အိဗ်နုမာဂျဟ်': 'ابن ماجه',
  'မာလိက်': 'مالك',
  'ရှာဖိအီ': 'الشافعي',
  'အဘူဟနီဖဟ်': 'أبو حنيفة',
  'အဟ်မဒ်': 'أحمد بن حنبل',
  // Common transliterations
  'bukhari': 'البخاري',
  'muslim': 'صحيح مسلم',
  'tafsir': 'تفسير',
  'hadith': 'حديث',
  'fiqh': 'فقه',
  'aqeedah': 'عقيدة',
  'aqidah': 'عقيدة',
  'salah': 'صلاة',
  'salat': 'صلاة',
  'zakah': 'زكاة',
  'zakat': 'زكاة',
  'sawm': 'صوم',
  'hajj': 'حج',
  'wudu': 'وضوء',
  'nawawi': 'النووي',
  'ibn kathir': 'ابن كثير',
  'ibn taymiyyah': 'ابن تيمية',
};

function extractKeywords(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const keywords: string[] = [];

  // Check dictionary
  for (const [key, arTerm] of Object.entries(TERM_MAP)) {
    if (lower.includes(key.toLowerCase()) || trimmed.includes(key)) {
      if (!keywords.includes(arTerm)) {
        keywords.push(arTerm);
      }
    }
  }

  // If query already contains Arabic or other search phrase
  if (!keywords.includes(trimmed)) {
    keywords.unshift(trimmed);
  }

  return keywords.slice(0, 4);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Shamela Real-time Search Endpoint
  app.post('/api/shamela/search', async (req: Request, res: Response) => {
    try {
      const { query, category_id, difficulty = 'easy' } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const keywords = extractKeywords(query);

      const mcpPayload: any = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'shamela_find',
          arguments: {
            keywords: keywords,
            difficulty: difficulty,
          },
        },
      };

      if (category_id && Number(category_id) > 0) {
        mcpPayload.params.arguments.category_ids = [Number(category_id)];
      }

      const mcpResponse = await fetch(SHAMELA_MCP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(mcpPayload),
      });

      if (!mcpResponse.ok) {
        throw new Error(`Shamela MCP returned status ${mcpResponse.status}`);
      }

      const data = await mcpResponse.json();
      if (!data.result || !data.result.content || !data.result.content[0]?.text) {
        return res.json({
          query,
          keywords,
          totalSources: 0,
          totalBooks: 0,
          sources: [],
          books: [],
          notice: 'No response content from Shamela',
        });
      }

      const parsed = JSON.parse(data.result.content[0].text);

      // Extract Sources
      const rawSources = parsed.evidence?.sources || [];
      const sources = rawSources.map((s: any) => {
        // e.g. markdown: "[مسند الشهاب (٢/ ١٩٥)](https://shamela.ws/book/13163/1779)"
        const markdown = s.citation?.markdown || '';
        const match = markdown.match(/\[(.*?)\]\((.*?)\)/);
        const cleanCitation = match ? match[1] : markdown;
        const shamelaUrl = match ? match[2] : `https://shamela.ws/book/${s.book_id}/${s.page_id}`;

        // extract book title from citation if available, e.g. "مسند الشهاب (٢/ ١٩٥)" -> "مسند الشهاب"
        let bookTitle = cleanCitation.split('(')[0]?.trim() || '';

        return {
          bookId: s.book_id,
          pageId: s.page_id,
          citationMarkdown: markdown,
          shamelaUrl,
          cleanCitation,
          bookTitle,
          text: s.text || '',
        };
      });

      // Extract Books from layers
      const books: any[] = [];
      const seenBookIds = new Set<number>();

      if (Array.isArray(parsed.layers)) {
        for (const layer of parsed.layers) {
          if (Array.isArray(layer.results)) {
            for (const b of layer.results) {
              if (!seenBookIds.has(b.book_id)) {
                seenBookIds.add(b.book_id);
                books.push({
                  bookId: b.book_id,
                  title: b.title || `كتاب #${b.book_id}`,
                  author: b.author || '',
                  pageId: b.page_id,
                  otherPages: b.other_pages || [],
                  shamelaUrl: `https://shamela.ws/book/${b.book_id}/${b.page_id}`,
                  opened: b.opened,
                });
              }
            }
          }
        }
      }

      return res.json({
        query,
        keywords,
        totalSources: sources.length,
        totalBooks: books.length,
        sources,
        books,
        notice: parsed.notice || '',
      });
    } catch (err: any) {
      console.error('Shamela search error:', err);
      return res.status(500).json({
        error: 'Failed to search Shamela',
        message: err.message || 'Unknown error',
      });
    }
  });

  // 3. Shamela Open Page Content Endpoint
  app.post('/api/shamela/page', async (req: Request, res: Response) => {
    try {
      const { book_id, page_id } = req.body;
      if (!book_id || !page_id) {
        return res.status(400).json({ error: 'book_id and page_id are required' });
      }

      const mcpResponse = await fetch(SHAMELA_MCP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'shamela_open',
            arguments: {
              book_id: Number(book_id),
              page_id: Number(page_id),
              max_chars: 12000,
            },
          },
        }),
      });

      const data = await mcpResponse.json();
      if (!data.result || !data.result.content || !data.result.content[0]?.text) {
        return res.status(404).json({ error: 'Page content not found' });
      }

      const parsed = JSON.parse(data.result.content[0].text);

      const markdown = parsed.citation?.markdown || '';
      const match = markdown.match(/\[(.*?)\]\((.*?)\)/);
      const cleanCitation = match ? match[1] : markdown;
      const shamelaUrl = match ? match[2] : `https://shamela.ws/book/${book_id}/${page_id}`;

      return res.json({
        bookId: parsed.book_id,
        pageId: parsed.page_id,
        text: parsed.text || '',
        citation: cleanCitation,
        shamelaUrl,
        navigation: {
          previousPageId: parsed.navigation?.previous_page_id || null,
          nextPageId: parsed.navigation?.next_page_id || null,
        },
      });
    } catch (err: any) {
      console.error('Shamela page read error:', err);
      return res.status(500).json({
        error: 'Failed to load Shamela page',
        message: err.message,
      });
    }
  });

  // 4. Vite Middlewares (Dev) or Static Assets (Prod)
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shamela App] Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
