import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import useFetch from "../hooks/useFetch";
import Sidebar from "../components/Sidebar";
import { LoadingDialog } from "../components/Dialog";

interface ChatbotStats {
  totalQueries: number;
  averageResponseTime: number;
  successRate: number;
  activeUsers: number;
  topQuestions: Array<{ question: string; count: number }>;
  timeSeriesData: Array<{
    date: string;
    queries: number;
    avgResponseTime: number;
  }>;
}

const ChatbotDashboard = () => {
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get } = useFetch();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure dates are in YYYY-MM-DD format
      const formattedParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy: "day",
      };

      console.log("Sending params:", formattedParams);
      const response = await get("/v1/chatbot/stats", formattedParams);

      if (response.result && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const renderContent = () => {
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (!stats) {
      return <div className="text-center text-red-500">No data available</div>;
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Chatbot Statistics</h1>
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Queries</h3>
            <p className="text-2xl font-bold">{stats.totalQueries}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Average Response Time</h3>
            <p className="text-2xl font-bold">
              {stats.averageResponseTime.toFixed(2)}s
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Success Rate</h3>
            <p className="text-2xl font-bold">
              {stats.successRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Active Users</h3>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Queries Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Queries Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MM/dd")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      format(new Date(date), "MMM dd, yyyy")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke="#8884d8"
                    name="Number of Queries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Response Time Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MM/dd")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      format(new Date(date), "MMM dd, yyyy")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#82ca9d"
                    name="Average Response Time (s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top 10 Questions</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topQuestions}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="question"
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  name="Number of Times Asked"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sidebar activeItem="chatbot-dashboard" renderContent={renderContent()} />
      <LoadingDialog isVisible={loading} />
    </>
  );
};

export default ChatbotDashboard;
