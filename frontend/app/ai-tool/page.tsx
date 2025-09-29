"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { 
  UploadCloud, 
  HelpCircle, 
  Bot, 
  Code, 
  CheckCircle, 
  FileText, 
  Sparkles,
  Database,
  ArrowRight,
  Copy,
  Check,
  Clock,
  Download,
  Brain,
  Zap,
  Target,
  BarChart3,
  Info,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingUp,
  Wand2,
  RefreshCw,
  Share,
  MessageCircle,
  Star,
  Lightbulb,
  PieChart,
  Activity,
  Bookmark,
  History,
  Trash2,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Menu
} from "lucide-react";

type ResultState = {
  sql_query: string;
  explanation: string;
  result: Record<string, any>[];
};

type QueryHistory = {
  id: string;
  query: string;
  timestamp: Date;
  sql: string;
  explanation: string;
  result: Record<string, any>[];
  favorite?: boolean;
};

type DataPreview = {
  totalRows: number;
  columns: string[];
  numericStats: Record<string, {min: number, max: number, avg: number}>;
  preview: any[];
};

export default function AIToolPage() {
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"default" | "loading" | "success" | "error">("default");
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [showSqlExplanation, setShowSqlExplanation] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [queryOptimization, setQueryOptimization] = useState<string>("");
  const [similarQueries, setSimilarQueries] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<QueryHistory | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // Load query history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('sql-query-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setQueryHistory(historyWithDates);
      } catch (error) {
        console.error('Error parsing saved history:', error);
      }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; // FIX: Get the first File from FileList
      setSelectedFile(file); // FIX: Set the File object, not FileList
      
      // Preview data
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ""));
          const dataRows = lines.slice(1, 6).map(line => {
            const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ""));
            return Object.fromEntries(headers.map((h: string, i: number) => [h, values[i]]));
          });
          
          // Calculate numeric stats
          const numericStats: Record<string, {min: number, max: number, avg: number}> = {};
          headers.forEach((header: string) => {
            const values = dataRows.map(row => parseFloat(row[header])).filter(v => !isNaN(v));
            if (values.length > 0) {
              numericStats[header] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
              };
            }
          });
          
          setDataPreview({
            totalRows: lines.length - 1,
            columns: headers,
            numericStats,
            preview: dataRows
          });

          // Generate AI insights
          generateAIInsights(headers, numericStats);
        }
      };
      reader.readAsText(file); // FIX: Pass the File object, not FileList
    }
  };

  const generateAIInsights = (columns: string[], numericStats: Record<string, any>) => {
    const insights = [];
    
    // Data type insights
    if (Object.keys(numericStats).length > columns.length * 0.5) {
      insights.push("🔢 Your dataset is numeric-heavy - perfect for statistical analysis and calculations!");
    }
    
    // Column name insights
    if (columns.some(col => col.toLowerCase().includes('date'))) {
      insights.push("📅 Time-based analysis available - you can explore trends over time!");
    }
    
    if (columns.some(col => col.toLowerCase().includes('price') || col.toLowerCase().includes('amount'))) {
      insights.push("💰 Financial data detected - revenue analysis and profit calculations possible!");
    }
    
    if (columns.some(col => col.toLowerCase().includes('category') || col.toLowerCase().includes('type'))) {
      insights.push("📊 Categorical data found - great for grouping and comparative analysis!");
    }

    // Numeric insights
    Object.entries(numericStats).forEach(([col, stats]) => {
      const range = stats.max - stats.min;
      if (range > stats.avg * 10) {
        insights.push(`📈 ${col} shows high variability - consider outlier analysis!`);
      }
    });

    insights.push("🎯 Pro tip: Try asking for correlations between different columns!");
    
    setAiInsights(insights.slice(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedFile) {
      alert("Please upload a file and ask a question.");
      return;
    }
    setStatus("loading");
    setResult(null);
    setError(null);
    setLoadingStep(0);
    setFeedback(null);
    setSelectedHistoryItem(null);

    // Generate similar queries and optimization tips
    generateSimilarQueries(query);
    generateQueryOptimization(query);

    // Simulate loading steps
    const steps = ["Understanding context", "Generating SQL", "Validating query"];
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => prev < steps.length - 1 ? prev + 1 : prev);
    }, 800);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("query", query);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process-query/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "An error occurred");
      }

      const data: ResultState = await response.json();
      setResult(data);
      setStatus("success");
      
      // Save to history with complete details
      const historyItem: QueryHistory = {
        id: Date.now().toString(),
        query: query,
        timestamp: new Date(),
        sql: data.sql_query,
        explanation: data.explanation,
        result: data.result,
        favorite: false
      };
      
      setQueryHistory(prev => {
        const updated = [historyItem, ...prev];
        localStorage.setItem('sql-query-history', JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    } finally {
      clearInterval(stepInterval);
    }
  };

  const generateSimilarQueries = (originalQuery: string) => {
    const variations = [
      originalQuery.replace('top 5', 'top 10'),
      originalQuery.replace('show', 'find').replace('display', 'get'),
      originalQuery + ' and sort by date',
      originalQuery.replace('all', 'distinct'),
      'Count ' + originalQuery.toLowerCase().replace('show', '').replace('find', '')
    ];
    setSimilarQueries(variations.slice(0, 3));
  };

  const generateQueryOptimization = (query: string) => {
    if (query.toLowerCase().includes('all')) {
      setQueryOptimization("💡 Consider using LIMIT to improve performance on large datasets");
    } else if (query.toLowerCase().includes('group')) {
      setQueryOptimization("⚡ GROUP BY queries benefit from indexing on grouped columns");
    } else if (query.toLowerCase().includes('join')) {
      setQueryOptimization("🔗 JOIN operations perform better with proper foreign key relationships");
    } else {
      setQueryOptimization("✨ This query looks well-optimized for your dataset size!");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exportToCSV = () => {
    if (!result?.result) return;
    
    const headers = Object.keys(result.result[0]);
    const csvContent = [
      headers.join(','),
      ...result.result.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!result?.result) return;
    
    const jsonContent = JSON.stringify(result.result, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareQuery = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'SQL Query Result',
          text: `Query: ${query}\nSQL: ${result.sql_query}`,
          url: window.location.href
        });
      } catch (err) {
        copyToClipboard(`Query: ${query}\nSQL: ${result.sql_query}\nResults: ${result.result.length} rows`);
        alert('Query details copied to clipboard!');
      }
    } else if (result) {
      const shareText = `
🔍 Natural Language Query:
${query}

📝 AI Explanation:
${result.explanation}

🔧 Generated SQL Query:
${result.sql_query}

📊 Query Results:
${result.result?.length || 0} rows returned

📅 Generated: ${new Date().toLocaleString()}

---
${result.result?.length > 0 ? 
  `Sample Data:\n${JSON.stringify(result.result.slice(0, 3), null, 2)}` : 
  'No data returned'}

Generated by ClarifAI SQL Tool 🚀
      `.trim();
      
      copyToClipboard(shareText);
      alert('Complete query details copied to clipboard!');
    }
  };

  const toggleFavorite = (id: string) => {
    setQueryHistory(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      );
      localStorage.setItem('sql-query-history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setQueryHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('sql-query-history', JSON.stringify(updated));
      return updated;
    });
    
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  };

  const clearHistory = () => {
    setQueryHistory([]);
    setSelectedHistoryItem(null);
    localStorage.removeItem('sql-query-history');
  };

  const openHistoryDetails = (item: QueryHistory) => {
    setSelectedHistoryItem(item);
    setQuery(item.query);
    setResult({
      sql_query: item.sql,
      explanation: item.explanation,
      result: item.result
    });
    setStatus("success");
    setIsHistoryPanelOpen(false); // Close panel after selection
  };

  const getQueryComplexity = (sql: string) => {
    const complexity = sql.split(' ').length;
    if (complexity < 10) return { level: 'Simple', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    if (complexity < 20) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { level: 'Complex', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  };

  const getDynamicSuggestions = () => {
    if (!dataPreview) return [
      "Show top 10 records by value",
      "Count total rows in dataset", 
      "Find average of numeric columns",
      "Group by category and count",
      "Show records from last month",
      "Find duplicate entries"
    ];

    const suggestions = [];
    const { columns, numericStats } = dataPreview;
    
    // Date-based suggestions
    const dateColumns = columns.filter(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') || 
      col.toLowerCase().includes('created')
    );
    if (dateColumns.length > 0) {
      suggestions.push(`Show records from ${dateColumns[0]} in last month`);
      suggestions.push(`Group by ${dateColumns[0]} and count records`);
    }

    // Numeric column suggestions
    const numericColumns = Object.keys(numericStats);
    if (numericColumns.length > 0) {
      suggestions.push(`Find top 5 records by ${numericColumns[0]}`);
      suggestions.push(`Calculate average ${numericColumns[0]}`);
      suggestions.push(`Show min and max ${numericColumns[0]}`);
    }

    // Category/text suggestions
    const textColumns = columns.filter(col => 
      !Object.keys(numericStats).includes(col) && 
      !dateColumns.includes(col)
    );
    if (textColumns.length > 0) {
      suggestions.push(`Count records by ${textColumns[0]}`);
      suggestions.push(`Show unique values in ${textColumns[0]}`);
    }

    // General suggestions
    suggestions.push("Show total row count");
    suggestions.push("Find duplicate entries");

    return suggestions.slice(0, 6);
  };

  const explainSQL = (sql: string) => {
    const parts = sql.toLowerCase();
    const explanation = [];
    
    if (parts.includes('select')) {
      const selectMatch = parts.match(/select\s+(.*?)\s+from/);
      if (selectMatch) {
        if (selectMatch[1].includes('*')) {
          explanation.push("🔍 SELECT *: Retrieves ALL columns from the table");
        } else if (selectMatch[1].includes('count')) {
          explanation.push("📊 SELECT COUNT(): Counts the number of rows that match the criteria");
        } else if (selectMatch[1].includes('avg')) {
          explanation.push("📈 SELECT AVG(): Calculates the average value of a numeric column");
        } else if (selectMatch[1].includes('max')) {
          explanation.push("📊 SELECT MAX(): Finds the highest value in a column");
        } else if (selectMatch[1].includes('min')) {
          explanation.push("📊 SELECT MIN(): Finds the lowest value in a column");
        } else {
          explanation.push(`🔍 SELECT: Chooses specific columns (${selectMatch[1].trim()}) to display in results`);
        }
      }
    }
    
    if (parts.includes('from')) {
      const fromMatch = parts.match(/from\s+(\w+)/);
      if (fromMatch) {
        explanation.push(`📊 FROM ${fromMatch[1]}: Specifies '${fromMatch[1]}' as the source table for data`);
      }
    }
    
    if (parts.includes('where')) {
      const whereMatch = parts.match(/where\s+(.*?)(?:\s+group|\s+order|\s+limit|$)/);
      if (whereMatch) {
        explanation.push(`🎯 WHERE ${whereMatch[1].trim()}: Filters rows based on the condition '${whereMatch[1].trim()}'`);
      }
    }
    
    if (parts.includes('group by')) {
      const groupMatch = parts.match(/group by\s+(\w+)/);
      if (groupMatch) {
        explanation.push(`📋 GROUP BY ${groupMatch[1]}: Groups rows with the same '${groupMatch[1]}' value together`);
      }
    }
    
    if (parts.includes('order by')) {
      const orderMatch = parts.match(/order by\s+(\w+)(?:\s+(desc|asc))?/);
      if (orderMatch) {
        const direction = orderMatch[2] === 'desc' ? 'descending (highest first)' : 'ascending (lowest first)';
        explanation.push(`↕️ ORDER BY ${orderMatch[1]} ${orderMatch[2] || 'ASC'}: Sorts results by '${orderMatch[1]}' in ${direction} order`);
      }
    }
    
    if (parts.includes('limit')) {
      const limitMatch = parts.match(/limit\s+(\d+)/);
      if (limitMatch) {
        explanation.push(`📏 LIMIT ${limitMatch[1]}: Restricts the output to only the first ${limitMatch[1]} rows`);
      }
    }

    if (parts.includes('join')) {
      explanation.push("🔗 JOIN: Combines data from multiple tables based on related columns");
    }

    if (parts.includes('having')) {
      explanation.push("🎯 HAVING: Filters grouped results (used with GROUP BY)");
    }
    
    return explanation;
  };

  const filteredHistory = queryHistory.filter(item =>
    item.query.toLowerCase().includes(searchHistory.toLowerCase()) ||
    item.sql.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* History Panel Overlay */}
      {isHistoryPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsHistoryPanelOpen(false)}
        />
      )}

      {/* Sliding History Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-bold">Query History</h2>
              <p className="text-orange-100 text-sm">{queryHistory.length} queries saved</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryPanelOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Panel Content */}
        <div className="flex flex-col h-full">
          {/* Search and Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-10 h-9 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            {queryHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Clear All History
              </Button>
            )}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4">
            {queryHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 group hover:shadow-md relative ${
                      selectedHistoryItem?.id === item.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div onClick={() => openHistoryDetails(item)} className="flex-1 pr-8">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed mb-2">
                        {item.query}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.timestamp.toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-2 py-1 rounded-full">
                            {item.result?.length || 0} rows
                          </span>
                          {item.favorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-yellow-50"
                      >
                        <Star className={`w-3 h-3 ${item.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No queries yet</p>
                <p className="text-sm text-gray-400">Your query history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Header with History Toggle */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-700 shadow-lg mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI-Powered SQL Generator</span>
          </div>

          {/* History Toggle Button */}
          <Button
            onClick={() => setIsHistoryPanelOpen(true)}
            className="absolute top-0 right-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
          >
            <History className="w-4 h-4 mr-2" />
            History ({queryHistory.length})
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Transform Questions into SQL
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload your CSV, ask questions in plain English, and get instant SQL queries with results.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl shadow-lg">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Upload Data</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">CSV files up to 100MB</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Drop CSV here</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">or click to browse</p>
                      </div>
                    )}
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange} 
                      accept=".csv" 
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Query Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Ask Question</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Natural language queries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Example: Show me the top 5 properties with highest booking rates"
                  className="w-full h-24 resize-none text-sm p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>AI will generate optimized SQL automatically</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          {dataPreview && (
            <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg">
                    <Eye className="w-4 h-4" />
                  </div>
                  Data Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dataPreview.totalRows.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Rows</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{dataPreview.columns.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Columns</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Object.keys(dataPreview.numericStats).length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Numeric Fields</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Columns:</strong> {dataPreview.columns.join(', ')}
                </div>
                
                {Object.keys(dataPreview.numericStats).length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Numeric Stats:</strong> {Object.entries(dataPreview.numericStats).map(([col, stats]) => 
                      `${col} (avg: ${stats.avg}, min: ${stats.min}, max: ${stats.max})`
                    ).join(', ')}
                  </div>
                )}

                {/* AI Insights */}
                {aiInsights.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Insights
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {aiInsights.map((insight, i) => (
                        <li key={i} className="text-yellow-700 dark:text-yellow-300">{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dynamic Sample Queries */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
              ✨ {dataPreview ? 'Smart suggestions for your data' : 'Try these sample queries'}
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {getDynamicSuggestions().map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={handleSubmit} 
              disabled={status === "loading" || !query.trim() || !selectedFile} 
              size="lg" 
              className="px-8 py-3 text-base font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 hover:from-purple-700 hover:via-blue-600 hover:to-teal-600 text-white border-0 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === "loading" ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating SQL...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate SQL with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Similar Queries Suggestions */}
          {similarQueries.length > 0 && query && (
            <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  You might also like
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {similarQueries.map((similar, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(similar)}
                      className="w-full text-left justify-start text-xs hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-600 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      {similar}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {status !== "default" && (
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 py-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span>AI Results</span>
                  {status === "success" && (
                    <div className="ml-auto flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold">Complete</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareQuery}
                        className="h-7 px-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <Share className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                      {/* Feedback buttons */}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFeedback('positive')}
                          className={`h-7 px-2 ${feedback === 'positive' ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${feedback === 'positive' ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFeedback('negative')}
                          className={`h-7 px-2 ${feedback === 'negative' ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
                        >
                          <ThumbsDown className={`w-3 h-3 ${feedback === 'negative' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {status === "loading" && (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI is analyzing your data...</h3>
                      
                      <div className="max-w-md mx-auto space-y-3">
                        {["🧠 Understanding context", "⚡ Generating SQL", "🔍 Validating query"].map((step, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className={loadingStep >= i ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>
                              {step}
                            </span>
                            {loadingStep > i ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : loadingStep === i ? (
                              <div className="w-4 h-4 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {status === "error" && (
                  <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Processing Error</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                
                {status === "success" && result && (
                  <div className="space-y-6">
                    {/* Query Optimization Tip */}
                    {queryOptimization && (
                      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg">
                            <Zap className="w-4 h-4" />
                          </div>
                          Performance Tip
                        </h3>
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{queryOptimization}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Explanation */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg">
                          <Bot className="w-4 h-4" />
                        </div>
                        AI Explanation
                      </h3>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>

                    {/* Generated SQL */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-700 relative">
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg">
                          <Code className="w-4 h-4" />
                        </div>
                        Generated SQL Query
                        <div className="ml-auto flex gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getQueryComplexity(result.sql_query).color}`}>
                            {getQueryComplexity(result.sql_query).level}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSqlExplanation(!showSqlExplanation)}
                            className="h-7 px-2 text-xs border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                          >
                            <Info className="w-3 h-3 mr-1" />
                            Explain
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(result.sql_query)}
                            className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 text-blue-600" />
                                <span className="text-blue-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </h3>

                      {showSqlExplanation && (
                        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Detailed SQL Breakdown:</h4>
                          <ul className="space-y-1 text-sm">
                            {explainSQL(result.sql_query).map((explanation, i) => (
                              <li key={i} className="text-yellow-700 dark:text-yellow-300">{explanation}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-blue-400 text-sm font-mono leading-relaxed">
                          <code>{result.sql_query}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <div className="p-2 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl shadow-lg">
                          <Database className="w-4 h-4" />
                        </div>
                        Query Results
                        <div className="ml-auto flex gap-2">
                          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-600">
                            {result.result.length} rows
                          </div>
                          <Button variant="outline" size="sm" onClick={exportToCSV} className="h-7 px-2 text-xs border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <Download className="w-3 h-3 mr-1" />
                            CSV
                          </Button>
                          <Button variant="outline" size="sm" onClick={exportToJSON} className="h-7 px-2 text-xs border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <Download className="w-3 h-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </h3>
                      
                      <div id="results-table" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {result.result.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700 border-b border-gray-300 dark:border-gray-600">
                                  {Object.keys(result.result[0]).map(key => (
                                    <th key={key} className="px-3 py-2 text-left font-semibold text-gray-800 dark:text-gray-100 text-xs">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {result.result.map((row, i) => (
                                  <tr 
                                    key={i} 
                                    className={`${
                                      i % 2 === 0 
                                        ? 'bg-white dark:bg-slate-800' 
                                        : 'bg-blue-50 dark:bg-slate-700'
                                    } hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors border-b border-gray-200 dark:border-gray-600`}
                                  >
                                    {Object.values(row).map((val: any, j) => (
                                      <td key={j} className="px-3 py-2 text-gray-800 dark:text-gray-200 text-xs font-medium">
                                        {val}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-2">No Results Found</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Your query didn't return any data.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
