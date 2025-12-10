import puppeteer from 'puppeteer';

export class DolarScraperService {
    async scrapeDolarData() {
        console.log('Launching browser...');
        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ],
            ignoreDefaultArgs: ['--enable-automation']
        });

        try {
            const page = await browser.newPage();
            // Set a realistic User Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            console.log('Navigating to Infobae...');
            await page.goto('https://www.infobae.com/economia/divisas/dolar-hoy/', {
                waitUntil: 'networkidle2',
                timeout: 90000
            });

            console.log('Waiting for currency data to load...');
            await page.waitForSelector('.foreign-item-ctn', { timeout: 30000 });

            console.log('Extracting data...');
            const currencies = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.foreign-item-ctn'));
                return items.map(item => {
                    const titleElement = item.querySelector('.box-info-title');
                    const title = titleElement ? titleElement.textContent?.trim() || 'N/A' : 'N/A';

                    let compraStr = 'N/A';
                    let ventaStr = 'N/A';

                    const valueElements = item.querySelectorAll('.box-info-sub-content');
                    valueElements.forEach(valEl => {
                        const valueTypeElement = valEl.querySelector('.box-info-value');
                        const valueElement = valEl.querySelector('.fc-val');
                        if (valueTypeElement && valueElement) {
                            const valueType = valueTypeElement.textContent?.trim();
                            const value = valueElement.textContent?.trim();
                            if (valueType === 'Compra') {
                                compraStr = value || 'N/A';
                            } else if (valueType === 'Venta') {
                                ventaStr = value || 'N/A';
                            }
                        }
                    });

                    // Variation
                    const percentElement = item.querySelector('.box-info-percent');
                    const variation = percentElement ? percentElement.textContent?.trim() || '0,00%' : '0,00%';

                    // Class variation (up/down)
                    let class_variation = 'equal';
                    const iconImg = percentElement?.querySelector('img');
                    if (iconImg) {
                        const src = iconImg.getAttribute('src') || '';
                        if (src.includes('up')) class_variation = 'up';
                        else if (src.includes('down')) class_variation = 'down';
                    }

                    return {
                        title,
                        compraStr,
                        ventaStr,
                        variation,
                        class_variation
                    };
                });
            });

            const parseValue = (val: string) => {
                if (!val || val === 'N/A') return null;
                let clean = val.replace(/[^\d,.-]/g, '');
                clean = clean.replace(/\./g, '');
                clean = clean.replace(',', '.');
                const num = parseFloat(clean);
                return isNaN(num) ? null : num;
            };

            const result = currencies.map((c: any) => ({
                title: c.title,
                compra: parseValue(c.compraStr),
                venta: parseValue(c.ventaStr),
                variation: c.variation,
                class_variation: c.class_variation,
                date: new Date().toISOString()
            }));

            return result;

        } catch (error) {
            console.error('Error in scraper:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
