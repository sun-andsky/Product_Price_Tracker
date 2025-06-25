// PriceHistoryGraph.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./PriceHistoryGraph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceHistoryGraph = ({ priceHistory }) => {
  // ✅ Validate incoming data
  if (!Array.isArray(priceHistory) || priceHistory.length === 0) {
    return <p className="no-data">No price history available.</p>;
  }

  // ✅ Clean and parse
  const cleanedData = priceHistory
    .map((item) => {
      const rawPrice = item?.Price ?? item?.price;
      const rawTimestamp = item?.Timestamp ?? item?.timestamp;

      if (!rawPrice || !rawTimestamp) return null;

      // Remove ₹ and commas from price
      const priceNumber = parseFloat(
        rawPrice.toString().replace(/[₹,]/g, "")
      );
      const dateLabel = new Date(rawTimestamp).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (isNaN(priceNumber)) return null;

      return {
        date: dateLabel,
        price: priceNumber,
      };
    })
    .filter(Boolean); // remove nulls

  if (cleanedData.length === 0) {
    return <p className="no-data">No price history available.</p>;
  }

  // ✅ Chart.js data
  const data = {
    labels: cleanedData.map((item) => item.date),
    datasets: [
      {
        label: "Price (₹)",
        data: cleanedData.map((item) => item.price),
        
        backgroundColor: "rgb(0, 77, 159)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  // ✅ Chart.js options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Product Price History",
        color: "#002a5e",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `₹${context.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Price (₹)",
        },
        ticks: {
          callback: (value) => `₹${value.toLocaleString("en-IN")}`,
        },
        min:
          Math.min(...cleanedData.map((d) => d.price)) - 200,
        max:
          Math.max(...cleanedData.map((d) => d.price)) + 200,
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="price-history-container">
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceHistoryGraph;
