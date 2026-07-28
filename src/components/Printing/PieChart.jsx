import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "@react-pdf/renderer";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  DoughnutController, 
  ArcElement,  
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  DoughnutController,
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
        color: "#ffffff00",
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
          font: {size:12},
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

  return <Doughnut data={chartData} options={options} />;
}


PieChart.propTypes = {
  chartData: PropTypes.object.isRequired,
};

export default PieChart;