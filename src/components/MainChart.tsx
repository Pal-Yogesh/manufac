
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getFilterOptions, calculateMonthlyAverageRsp } from '../lib/fuel-data-helpers';
import FuelPriceChart from './FuelPriceChart';
import { EChartsOption } from 'echarts';

export default function MainChart() {
  const [filterOptions, setFilterOptions] = useState<{
    cities: string[];
    products: string[];
    years: number[];
  }>({ cities: [], products: [], years: [] });
  
  const [city, setCity] = useState('');
  const [product, setProduct] = useState('');
  const [year, setYear] = useState<number>(0);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ months: string[]; averages: number[] }>({
    months: [],
    averages: []
  });

  // Load filter options on mount
  useEffect(() => {
    getFilterOptions().then(options => {
      setFilterOptions(options);
      setCity(options.cities[0] || '');
      setProduct(options.products[0] || '');
      setYear(options.years[0] || 0);
      setLoading(false);
    });
  }, []);

  // Load monthly data when filters change
  useEffect(() => {
    if (!city || !product || !year) {
      setMonthlyData({ months: [], averages: [] });
      return;
    }
    
    calculateMonthlyAverageRsp(city, product, year).then(data => {
      setMonthlyData(data);
    });
  }, [city, product, year]);

  useEffect(() => {
    const newOption: EChartsOption = {
      title: {
        text: `Monthly Average RSP for ${product} in ${city} (${year})`,
        left: 'center',
        textStyle: {
          color: 'hsl(var(--foreground))',
          fontWeight: 'normal',
          fontSize: 16,
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        valueFormatter: (value) => `₹${(value as number).toFixed(2)} / Litre`,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: monthlyData.months,
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Avg. RSP (INR/L)',
        axisLabel: {
          formatter: '₹{value}',
        },
      },
      series: [
        {
          name: 'Average RSP',
          type: 'bar',
          barWidth: '60%',
          data: monthlyData.averages.map(avg => parseFloat(avg.toFixed(2))),
          itemStyle: {
            color: 'hsl(var(--primary))',
            borderRadius: [4, 4, 0, 0]
          },
        },
      ],
      animationDuration: 500,
      backgroundColor: 'transparent',
    };
    setChartOption(newOption);
  }, [monthlyData, city, product, year]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 font-body">
        <Card className="w-full max-w-5xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-primary">FuelVis</CardTitle>
            <CardDescription className="text-center">
              Retail Selling Price (RSP) of Petrol and Diesel in Metro Cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-lg text-muted-foreground">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 font-body">
      <Card className="w-full max-w-5xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">FuelVis</CardTitle>
          <CardDescription className="text-center">
            Retail Selling Price (RSP) of Petrol and Diesel in Metro Cities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.products.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <FuelPriceChart option={chartOption} className="w-full h-[50vh]" />
          
        </CardContent>
      </Card>
    </main>
  );
}
