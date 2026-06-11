import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "@react-pdf/renderer";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,  
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);


function PrintChart({ chartData }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [imageHref, setImageHref] = useState(null);


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
        font: { weight: "bold", size: 30 }
      },
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          font: {size:25},
          // filter: (legendItem, data) => {
          //   return data.datasets[0].data[legendItem.index] !== 0;
          // }
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  }), []);


  useEffect(() => {
    // Create chart on a hidden canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pick a deterministic export size (e.g., 1000x500) for crisp PDF output.
    // Tweak as needed or pass via props.
    const width = 500;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Clean up any prior chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Build Chart.js instance
    chartRef.current = new ChartJS(canvas, {
      type: "pie",
      data: chartData
    });

    // Once the chart is rendered, export to image link
    // Use requestAnimationFrame to ensure the first draw completed.
    const raf = requestAnimationFrame(async () => {
      try {
        const base64 = chartRef.current.toBase64Image("image/png", 1.0);
        // Convert base64 → Blob → object URL
        const res = await fetch(base64);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        console.log("Chart Link: ",url)
        setImageHref(url);
      } catch (e) {
        console.error("Failed to export chart image", e);
        setImageHref(null);
      }
    });

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(raf);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (imageHref) {
        URL.revokeObjectURL(imageHref);
      }
    };
    // Re-generate image whenever the data or options change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, options]);

  // While the image is being generated, you can return a placeholder
  if (!imageHref) {
    // Return nothing (PDF will skip) or a tiny spacer image if you prefer.
    return <></>;
  }

  // IMPORTANT: @react-pdf/renderer expects `src`, not `source`.
  return <Image id="chartImage" src={imageHref} />;
}

PrintChart.propTypes = {
  chartData: PropTypes.object.isRequired,
};

export default PrintChart;