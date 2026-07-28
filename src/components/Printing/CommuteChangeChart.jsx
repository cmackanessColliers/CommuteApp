import PropTypes from "prop-types";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
);


// VARIABLES FOR THEME CONSISTANCY
const DEEPBLUE = "#000759";
const DARKBLUE = "#25408F";
const MEDIUMBLUE = "#1C54F4";
const LIGHTBLUE = "#4D93FF";
const PALEBLUE = "#C3E6FF";
const ORANGE = "#FA6609"
const MEDIUMBLUEGREY = "#7B8BBD";
const TRANSPARENCY75 = "BF";
const TRANSPARENCY50 = "80";
const TRANSPARENCY25 = "40";

function CommuteChangeChart(chartData) {
  const Options = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: 10
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxHeight:'2'
        }
      },
      datalabels: {
        color: "#ffffff",
        font: {
          size: 10,
        },
        display: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value != null && value !== 0;
        },
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        stacked: true,
        skipNull: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        position: "left",
      },
    },
  }

  return (
    <div style={{display:'flex', height:'100%', justifyContent:'center',alignContent:"center", width:'100%'}}>
      <Chart
        id="chart"
        data={chartData.chartData}
        options={Options}
      ></Chart>
    </div>
  );
}

CommuteChangeChart.propTypes = {
  chartData: PropTypes.object.isRequired
};

export default CommuteChangeChart;