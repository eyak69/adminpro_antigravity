import { Request, Response } from "express";
import { DolarScraperService } from "../../application/services/dolar-scraper.service";

const scraperService = new DolarScraperService();

// Simple in-memory cache
let cache: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class DolarController {
    async scrape(req: Request, res: Response) {
        try {
            const now = Date.now();

            if (cache && (now - lastCacheTime < CACHE_TTL)) {
                console.log('Serving Dolar data from cache');
                return res.json(cache);
            }

            console.log('Cache expired or empty. Scraping new Dolar data...');
            const data = await scraperService.scrapeDolarData();

            cache = data;
            lastCacheTime = now;

            res.json(data);
        } catch (error) {
            console.error("Error scraping dolar:", error);
            res.status(500).json({ message: "Error scraping data", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
}
