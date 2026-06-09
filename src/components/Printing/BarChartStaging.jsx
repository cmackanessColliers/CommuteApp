import { useState, useEffect, useRef } from "react";
import BarChart from "./BarChart";
import PropTypes from "prop-types";
const DEEPBLUE = "#000759";
const DARKBLUE = "#25408F";
const MEDIUMBLUE = "#1C54F4";
const LIGHTBLUE = "#4D93FF";
const PALEBLUE = "#C3E6FF";
const ORANGE = "#FA6609"
const MEDIUMBLUEGREY = "#7B8BBD";
const DARKBLUEGREY = "#56648F";
const LIGHTBLUEGREY = "#ACBBE8"
const PALEBLUEGREY = "#DBE5FF"
const COLLIERSLIGHTBLUE = "#0C9ED9"
const TEAL = "#2AB6A9"
const COLLIERSYELLOW = "#FFD400"
const TRANSPARENCY75 = "BF";
const TRANSPARENCY50 = "80";
const TRANSPARENCY25 = "40";

const BarChartStaging = ({chartData}) => {

  const colorArray = [DEEPBLUE, MEDIUMBLUE, DARKBLUE, LIGHTBLUE, PALEBLUE, ORANGE, MEDIUMBLUEGREY, DARKBLUEGREY, LIGHTBLUEGREY, PALEBLUEGREY, COLLIERSLIGHTBLUE, TEAL]
  const [chartConfig, setChartConfig] = useState(null)  
  const highlightColor = COLLIERSYELLOW;

  useEffect(() => {
    if (!chartData) return;
    const labels = chartData.AvgDist.labels || [];

    const borderWidth = 1;
    const distData = (chartData.AvgDist && chartData.AvgDist.data) || [];
    const timeData = (chartData.AvgTime && chartData.AvgTime.data) || [];

    const datasets = [
      {
        type: "bar",
        label: "Average Commute Distance",
        data: distData,
        yAxisID: "y",
        borderColor: DEEPBLUE,
        backgroundColor: DEEPBLUE,
        borderWidth: borderWidth,
        // Optional: add rounded corners to make the highlight pop
        borderRadius: 3,
      }, 
      {
        type: "bar",
        label: "Average Commute Time",
        data: timeData,
        yAxisID: "y2",
        borderColor: MEDIUMBLUE,
        backgroundColor: MEDIUMBLUE,
        borderWidth: borderWidth,
        // Optional: add rounded corners to make the highlight pop
        borderRadius: 3,
      }
    ];
    setChartConfig({
      labels,
      datasets,
    });
  }, [chartData]);



  return (
    chartConfig ? (
        <BarChart 
          chartData={chartConfig}
        />
    ) : null
  );
};

BarChartStaging.propTypes = {
  chartData: PropTypes.object.isRequired,
};

export default BarChartStaging;
