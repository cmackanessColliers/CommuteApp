import { useState, useEffect, useRef } from "react";
import PieChart from "./PieChart";
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

const PieChartStaging = ({printChartData}) => {
  const colorArray = [DEEPBLUE, DARKBLUE, MEDIUMBLUE, LIGHTBLUE, PALEBLUE, ORANGE, MEDIUMBLUEGREY, DARKBLUEGREY, LIGHTBLUEGREY, PALEBLUEGREY, COLLIERSLIGHTBLUE, TEAL]
  const [chartConfig, setChartConfig] = useState(null)  
  const highlightColor = COLLIERSYELLOW;

  useEffect(() => {
    if (!printChartData) return;
    const data = {
      labels: printChartData.xValues,
      datasets: [{
        label: "Commuters by Time Range",
        data: printChartData.yValues,
        backgroundColor: printChartData.barColors,
        hoverOffset: 4
      }]
    }
    setChartConfig(data);
  }, [printChartData]);



  return(
    chartConfig ? (
        <PieChart 
          chartData={chartConfig}
        />
    ) : null
  );
};

PieChartStaging.propTypes = {
  printChartData: PropTypes.object.isRequired,
};

export default PieChartStaging;
