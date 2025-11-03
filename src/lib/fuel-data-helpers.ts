import { fetchRSPData } from "../data/excelData";
import type { FuelPriceRecord } from "./types";

interface ProcessedRecord extends FuelPriceRecord {
    calendarYear: number;
    monthNumber: number;
}

let cachedData: ProcessedRecord[] | null = null;
let dataPromise: Promise<ProcessedRecord[]> | null = null;

/**
 * Fetch and process data with caching
 */
export const loadFuelData = async (): Promise<ProcessedRecord[]> => {
    // Return cached data if available
    if (cachedData) {
        return cachedData;
    }

    // Return existing promise if one is already in progress
    if (dataPromise) {
        return dataPromise;
    }

    // Fetch and process data
    dataPromise = fetchRSPData().then(data => {
        // Pre-process data to extract year and month number
        const processed = data.map(record => {
            // calendarDay is "dd-mm-yyyy"
            const dateParts = record.calendarDay.split('-').map(Number);
            return {
                ...record,
                calendarYear: dateParts[2],
                monthNumber: dateParts[1],
            };
        });
        
        cachedData = processed;
        return processed;
    });

    return dataPromise;
};

/**
 * Get filter options from the loaded data
 */
export const getFilterOptions = async () => {
    const processedData = await loadFuelData();
    
    const cities = new Set<string>();
    const products = new Set<string>();
    const years = new Set<number>();

    processedData.forEach(record => {
        cities.add(record.city);
        products.add(record.product);
        years.add(record.calendarYear);
    });

    return {
        cities: Array.from(cities).sort(),
        products: Array.from(products).sort(),
        years: Array.from(years).sort((a, b) => b - a), // Sort years descending
    };
};

/**
 * Calculate monthly average RSP for a given city, product, and year
 */
export const calculateMonthlyAverageRsp = async (city: string, product: string, year: number) => {
    const processedData = await loadFuelData();
    
    const filteredData = processedData.filter(record => 
        record.city === city &&
        record.product === product &&
        record.calendarYear === year
    );

    const monthlyData: { [key: number]: { total: number; count: number } } = {};

    filteredData.forEach(record => {
        const month = record.monthNumber;
        if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += record.rsp || 0; // Treat missing/null rsp as 0
        monthlyData[month].count++;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const averages = Array(12).fill(0);

    for (const month in monthlyData) {
        const monthIndex = parseInt(month, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            if (monthlyData[month].count > 0) {
                 averages[monthIndex] = monthlyData[month].total / monthlyData[month].count;
            }
        }
    }
    
    return {
        months: monthNames,
        averages: averages,
    };
};
