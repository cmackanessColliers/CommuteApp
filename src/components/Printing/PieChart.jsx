import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "@react-pdf/renderer";
import { Pie } from "react-chartjs-2";
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
  Legend
);



function PieChart({ chartData }) {
  
  const options = useMemo(() => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          padding: 10,
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