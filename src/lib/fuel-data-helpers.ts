import { fuelPriceData } from "../data/fuelData";

// Pre-process data to extract year and month number
const processedData = fuelPriceData.map(record => {
    // calendarDay is "dd-mm-yyyy"
    const dateParts = record.calendarDay.split('-').map(Number);
    return {
        ...record,
        calendarYear: dateParts[2],
        month: dateParts[1],
    };
});

export const getFilterOptions = () => {
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

export const calculateMonthlyAverageRsp = (city: string, product: string, year: number) => {
    const filteredData = processedData.filter(record => 
        record.city === city &&
        record.product === product &&
        record.calendarYear === year
    );

    const monthlyData: { [key: number]: { total: number; count: number } } = {};

    filteredData.forEach(record => {
        const month = record.month;
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
