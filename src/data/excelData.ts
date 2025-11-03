import type { FuelPriceRecord } from "../lib/types";

/**
 * Parse a CSV line handling quoted fields that may contain commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Convert date from "2025-06-20" format to "dd-mm-yyyy" format
 */
function convertDateFormat(dateStr: string): string {
  if (!dateStr) return '';
  
  // If already in dd-mm-yyyy format, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Convert from yyyy-mm-dd to dd-mm-yyyy
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  return dateStr;
}

/**
 * Fetch and parse the RSP CSV data
 */
export async function fetchRSPData(): Promise<FuelPriceRecord[]> {
  try {
    const response = await fetch('/rsp.csv');
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Skip the header row
    const dataLines = lines.slice(1);
    
    const data: FuelPriceRecord[] = dataLines.map(line => {
      const fields = parseCSVLine(line);
      
      return {
        country: fields[0] || '',
        year: fields[1] || '',
        month: fields[2] || '',
        calendarDay: convertDateFormat(fields[3] || ''),
        product: fields[4]?.trim() || '',
        city: fields[5] || '',
        rsp: parseFloat(fields[6]) || 0,
      };
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching RSP data:', error);
    throw error;
  }
}

/**
 * Synchronous version using import (if CSV is bundled with Vite)
 * Note: This requires the CSV content to be imported as a string
 */
export function parseRSPDataFromString(csvContent: string): FuelPriceRecord[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  // Skip the header row
  const dataLines = lines.slice(1);
  
  const data: FuelPriceRecord[] = dataLines.map(line => {
    const fields = parseCSVLine(line);
    
    return {
      country: fields[0] || '',
      year: fields[1] || '',
      month: fields[2] || '',
      calendarDay: convertDateFormat(fields[3] || ''),
      product: fields[4]?.trim() || '',
      city: fields[5] || '',
      rsp: parseFloat(fields[6]) || 0,
    };
  });
  
  return data;
}

/**
 * Get filtered data by product type
 */
export function filterByProduct(data: FuelPriceRecord[], product: 'Petrol' | 'Diesel'): FuelPriceRecord[] {
  return data.filter(item => item.product === product);
}

/**
 * Get filtered data by city
 */
export function filterByCity(data: FuelPriceRecord[], city: string): FuelPriceRecord[] {
  return data.filter(item => item.city === city);
}

/**
 * Get unique cities from the dataset
 */
export function getUniqueCities(data: FuelPriceRecord[]): string[] {
  const cities = new Set(data.map(item => item.city));
  return Array.from(cities);
}

/**
 * Get unique products from the dataset
 */
export function getUniqueProducts(data: FuelPriceRecord[]): string[] {
  const products = new Set(data.map(item => item.product));
  return Array.from(products);
}

