
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getFilterOptions, calculateMonthlyAverageRsp } from '../lib/fuel-data-helpers';
import FuelPriceChart from './FuelPriceChart';
import { EChartsOption } from 'echarts';

const filterOptions = getFilterOptions();

export default function MainChart() {
  const [city, setCity] = useState(filterOptions.cities[0]);
  const [product, setProduct] = useState(filterOptions.products[0]);
  const [year, setYear] = useState(filterOptions.years[0]);
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  const monthlyData = useMemo(() => {
    if (!city || !product || !year) {
        return { months: [], averages: [] };
    }
    return calculateMonthlyAverageRsp(city, product, year);
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
