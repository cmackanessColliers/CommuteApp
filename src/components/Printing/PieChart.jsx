import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "@react-pdf/renderer";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  PieController, 
  ArcElement,  
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);



function PieChart({ chartData }) {
  
  const options = useMemo(() => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      datalabels: {
        color: "#fff",
        display: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value !== 0;   // ✅ hide labels when value is 0
        },
        font: { weight: "bold", size: 9 }
      },
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          font: {size:9},
          filter: (legendItem, data) => {
            return data.datasets[0].data[legendItem.index] !== 0;
          }
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  }), []);

  return <Pie data={chartData} options={options} />;
}


PieChart.propTypes = {
  chartData: PropTypes.object.isRequired,
};

export default PieChart;