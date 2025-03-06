// First, let's install the required packages
// npm install google-spreadsheet dotenv

// Create a .env file with your Google API credentials
// GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=your-private-key
// GOOGLE_SHEET_ID=your-sheet-id

import { getCollection } from "astro:content";
import { readFile } from "fs/promises";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dotenv from "dotenv";
import config from "@util/themeConfig";


// Load environment variables
dotenv.config();

// Function to fetch data from Google Sheets
async function getGoogleSheetsData() {
  try {

        // Authenticate with the Google Sheets API
        await doc.useServiceAccountAuth({
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        
    // Initialize the Google Sheets document
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, {});
    

    // Load the document properties and worksheets
    await doc.loadInfo();
    
    // Assuming the first sheet contains your directory data
    const sheet = doc.sheetsByIndex[0];
    
    // Load all rows from the sheet
    const rows = await sheet.getRows();
    
    // Map the rows to the expected format for your directory
    return rows.map(row => ({
      title: row.title || '',
      description: row.description || '',
      tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
      // For card_image, you might need to store URLs in your sheet
      card_image: row.card_image || '',
      links: row.links ? JSON.parse(row.links) : [],
      // You can add any additional fields you need here
    }));
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return [];
  }
}

// Improved getListings function with caching
let cachedListings = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getListings() {
  const currentTime = Date.now();
  
  let listings = [];
  
  try {
    if (config.directory.data.source === "json") {
      listings = JSON.parse(await readFile("data/directory.json", "utf-8"));
    } else {
      listings = await getCollection("directory");
    }
    
    // Update cache
    cachedListings = listings;
    lastFetchTime = currentTime;
    
    return listings;
  } catch (error) {
    console.error('Error getting listings:', error);
  }
}