const dns = require('dns').promises;
const net = require('net');
const { chromium } = require('playwright');
const cheerio = require('cheerio');

const isPrivateIP = (ip) => {
  if (!net.isIP(ip)) return false;
  
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 127) return true; // 127.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16
    if (parts[0] === 0) return true; // 0.0.0.0/8
    if (parts[0] >= 224) return true; // Multicast 224+
    return false;
  }
  
  if (net.isIPv6(ip)) {
    const lowerIp = ip.toLowerCase();
    if (lowerIp === '::1') return true;
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true;
    if (lowerIp.startsWith('fe8') || lowerIp.startsWith('fe9') || lowerIp.startsWith('fea') || lowerIp.startsWith('feb')) return true;
    if (lowerIp.startsWith('::ffff:')) {
      return isPrivateIP(ip.substring(7));
    }
    return false;
  }
  return false;
};

const resolveAndCheckSSRF = async (urlString) => {
  try {
    const parsed = new URL(urlString);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    
    if (isPrivateIP(parsed.hostname)) return false;
    
    const unsafeHostnames = ['localhost'];
    if (unsafeHostnames.includes(parsed.hostname.toLowerCase())) return false;
    if (parsed.hostname.endsWith('.local') || parsed.hostname.endsWith('.internal')) return false;

    // Resolve IP
    const lookup = await dns.lookup(parsed.hostname);
    if (isPrivateIP(lookup.address)) return false;

    return true;
  } catch (error) {
    return false; // Deny if invalid URL or DNS failure
  }
};

const scrapeWebsite = async (url) => {
  if (!(await resolveAndCheckSSRF(url))) {
    throw new Error('Unsafe or invalid URL provided.');
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Intercept and protect against SSRF redirects
    await context.route('**/*', async (route) => {
      const reqUrl = route.request().url();
      const isSafe = await resolveAndCheckSSRF(reqUrl);
      if (!isSafe) {
        await route.abort('accessdenied');
      } else {
        await route.continue();
      }
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await page.goto(url, { waitUntil: 'networkidle' });

    const html = await page.content();
    const $ = cheerio.load(html);

    $('script, style, noscript, svg, nav, footer, header, iframe, audio, video').remove();
    const title = $('title').text().trim() || null;
    
    $('p, div, h1, h2, h3, h4, h5, h6, li, br').each(function() {
        $(this).append('\n');
    });

    let text = $('body').text();
    text = text.replace(/\r/g, '\n');
    text = text.split('\n').map(line => line.trim()).join('\n');
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return {
      title,
      text,
      sourceUrl: url,
    };
  } catch (error) {
    throw new Error(`Website could not be processed. ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  isPrivateIP,
  resolveAndCheckSSRF,
  scrapeWebsite,
};
