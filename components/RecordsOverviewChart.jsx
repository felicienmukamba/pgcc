// components/RecordsOverviewChart.jsx
"use client"

import * as React from "react" 
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, Line, LineChart } from "recharts" 
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select" 
import { Button } from "@/components/ui/button" 

// Configuration des couleurs et libellés du graphique
const chartConfig = {
  citizens: { label: "Citoyens", color: "hsl(var(--chart-1))", },
  births: { label: "Naissances", color: "hsl(var(--chart-2))", },
  consultations: { label: "Consultations", color: "hsl(var(--chart-3))", },
}

// Types de graphiques disponibles
const chartTypes = [
    { value: "bar", label: "Barres" },
    { value: "line", label: "Lignes" },
]

// Configuration des éléments de données à tracer
const dataElementsConfig = [
    { key: "citizens", color: "var(--color-citizens)" },
    { key: "births", color: "var(--color-births)" },
    { key: "consultations", color: "var(--color-consultations)" },
];


/**
 * Gère la logique de rendu d'un graphique Barres ou Lignes.
 */
function renderChartContent(data, chartType, dataKey, granularity, isLoading) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] w-full">
                <p className="text-sm text-indigo-500 animate-pulse">Chargement des données...</p>
            </div>
        )
    }

    const currentData = data.map(d => ({
        ...d,
        key: granularity === 'month' ? d.month : d.year, 
    }));
    
    // Props communes
    const commonProps = {
      accessibilityLayer: true,
      data: currentData,
      className: "w-full",
    }

    // Config dynamique pour Bar/Line
    const isBar = chartType === "bar";
    const ChartComponent = isBar ? BarChart : LineChart;
    const DataElement = isBar ? Bar : Line;
    
    const extraProps = isBar 
        ? { radius: [4, 4, 0, 0] } 
        : { type: "monotone", strokeWidth: 2, dot: { r: 4 }, activeDot: { r: 6 } };
    
    const colorProp = isBar ? 'fill' : 'stroke';


    return (
        <ChartComponent {...commonProps}>
            <XAxis
              dataKey="key" 
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => granularity === 'month' ? value.slice(0, 3) : value} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataElementsConfig.map(item => {
                
                // CRÉATION DE L'OBJET DE PROPRIÉTÉS DYNAMIQUES AVEC LA SYNTAXE JAVASCRIPT VALIDE
                const dynamicColorProp = {
                    [colorProp]: item.color, 
                };
                
                return (
                    <DataElement 
                        key={item.key}
                        dataKey={item.key} 
                        {...dynamicColorProp} // PROPAGATION DANS LE JSX (CORRIGÉ)
                        {...extraProps}
                    />
                );
            })}
        </ChartComponent>
    )
}


/**
 * Composant de graphique principal.
 */
export function RecordsOverviewChart({ annualData, initialMonthlyData, availableYears, currentYear }) {
  
  // États locaux
  const [hasMounted, setHasMounted] = React.useState(false); 
  const [chartType, setChartType] = React.useState("bar"); 
  const [granularity, setGranularity] = React.useState('year'); 
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  
  // État des données et du chargement
  const [chartData, setChartData] = React.useState(annualData);
  const [isLoading, setIsLoading] = React.useState(false);


  // S'assurer que le composant n'est rendu que côté client (SSR Safety)
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fonction de simulation pour la récupération de données mensuelles
  const fetchMonthlyData = React.useCallback(async (year) => {
      if (year === currentYear) {
          setChartData(initialMonthlyData);
          return;
      }
      
      // ⚠️ REMPLACEZ CETTE SIMULATION PAR VOTRE VRAIE LOGIQUE DE SERVER ACTION/API ⚠️
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const months = ["JAN", "FEB", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"];
      const randomData = months.map(m => ({
          month: m,
          citizens: Math.floor(Math.random() * 500) + 100,
          births: Math.floor(Math.random() * 200) + 50,
          consultations: Math.floor(Math.random() * 300) + 75,
      }));
      
      setChartData(randomData);
      setIsLoading(false);

  }, [currentYear, initialMonthlyData]);


  // Effet pour gérer le changement de granularité ou d'année
  React.useEffect(() => {
    if (!hasMounted) return;

    if (granularity === 'year') {
      setChartData(annualData);
    } else if (granularity === 'month') {
      fetchMonthlyData(selectedYear);
    }
  }, [granularity, selectedYear, hasMounted, annualData, fetchMonthlyData]);


  // Texte dynamiques pour l'en-tête
  const titleText = granularity === 'year' 
    ? "Tendances des enregistrements (Annuel)" 
    : `Tendances des enregistrements pour ${selectedYear} (Mensuel)`;
    
  const descriptionText = granularity === 'year' 
    ? `Dossiers créés sur les ${availableYears.length} dernières années.`
    : `Dossiers créés chaque mois de l'année ${selectedYear}.`;


  if (!hasMounted) {
    return (
        <Card className="col-span-4 shadow-lg min-h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Chargement du graphique...</p>
        </Card>
    ); 
  }

  return (
    <Card className="col-span-4 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2"> 
          <div>
            <CardTitle>{titleText}</CardTitle>
            <CardDescription className="mt-1">{descriptionText}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-3">
            
            {/* 1. Sélecteur d'Année (Affiché en mode Mensuel) */}
            {granularity === 'month' && (
                <Select 
                    onValueChange={setSelectedYear} 
                    defaultValue={selectedYear}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* 2. Bouton de bascule Annuel/Mensuel */}
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                    setGranularity(granularity === 'year' ? 'month' : 'year');
                    if (granularity === 'year') {
                        // S'assure que l'année en cours est sélectionnée si on passe en vue mensuelle
                        setSelectedYear(currentYear); 
                    }
                }}
            >
                {granularity === 'year' ? 'Voir par Mois' : 'Voir Annuel'}
            </Button>
            
            {/* 3. Sélecteur de Type de Graphique */}
            <Select onValueChange={setChartType} defaultValue={chartType}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    {chartTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          {renderChartContent(chartData, chartType, "key", granularity, isLoading)}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}