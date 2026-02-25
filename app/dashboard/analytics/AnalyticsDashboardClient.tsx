// dashboard/analytics/AnalyticsDashboardClient.tsx

// analytics dashboard client component - for fetching and displaying analytics data and attendance by subject
"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AnalyticsDashboardClient() {
  const [data, setData] = useState<{ labels: string[], data: number[] } | null>(null)
  const [summary, setSummary] = useState<{ totalStudents: number, totalSlots: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics")
        if (res.ok) {
          const json = await res.json()
          setData(json.charts.attendanceBySubject)
          setSummary(json.summary)
        }
      } catch (e) {
        console.error("Failed to load analytics", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Total Attendances',
        data: data?.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#cbd5e1' } },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center shadow-lg">
          <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Total Enrolled Students</p>
          <div className="text-4xl font-extrabold text-white mt-2">{summary?.totalStudents || 0}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center shadow-lg">
          <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Active Timetable Slots</p>
          <div className="text-4xl font-extrabold text-white mt-2">{summary?.totalSlots || 0}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Attendance by Subject</h3>
        <div className="relative h-96 w-full">
          {data?.labels.length === 0 ? (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500">Not enough data to graph</div>
          ) : (
             <Bar options={options} data={chartData} />
          )}
        </div>
      </div>
    </div>
  )
}
