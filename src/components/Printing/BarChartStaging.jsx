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

const BarChartStaging = ({chartData, selectedSiteName}) => {

  const colorArray = [DEEPBLUE, MEDIUMBLUE, DARKBLUE, LIGHTBLUE, PALEBLUE, ORANGE, MEDIUMBLUEGREY, DARKBLUEGREY, LIGHTBLUEGREY, PALEBLUEGREY, COLLIERSLIGHTBLUE, TEAL]
  const [chartConfig, setChartConfig] = useState(null)  
  const highlightColor = COLLIERSYELLOW;

  
  function makeIndexedStyles({
    labels,
    highlightIndex,
    baseColor,
    dimAlpha = TRANSPARENCY50,
    highlightFill = COLLIERSYELLOW,
    highlightBorder = "#1d1d1d",
    highlightBorderWidth = 3,
    defaultBorderWidth = 1,
  }) {
    const count = labels.length;

    const backgroundColor = Array.from({ length: count }, (_, idx) => {
      if (highlightIndex === null) return baseColor;
      return idx === highlightIndex
        ? highlightFill
        : `${baseColor}${dimAlpha}`;
    });

    const borderColor = Array.from({ length: count }, (_, idx) => {
      if (highlightIndex === null) return baseColor;
      return idx === highlightIndex ? highlightBorder : baseColor;
    });

    const borderWidth = Array.from({ length: count }, (_, idx) =>
      highlightIndex !== null && idx === highlightIndex
        ? highlightBorderWidth
        : defaultBorderWidth
    );

    return { backgroundColor, borderColor, borderWidth };
  }


  useEffect(() => {
    if (!chartData) return;
    const labels = chartData.AvgDist.labels || [];

    const borderWidth = 1;
    const distData = (chartData.AvgDist && chartData.AvgDist.data) || [];
    const timeData = (chartData.AvgTime && chartData.AvgTime.data) || [];
    const highlightIndex =
          selectedSiteName ? labels.indexOf(selectedSiteName) : -1;
    const distStyles = makeIndexedStyles({
      labels,
      highlightIndex,
      baseColor: DEEPBLUE,
    });

    const timeStyles = makeIndexedStyles({
      labels,
      highlightIndex,
      baseColor: MEDIUMBLUE,
    });

    const datasets = [
      {
        type: "bar",
        label: "Average Commute Distance",
        data: distData,
        yAxisID: "y",
        ...distStyles,
        borderRadius: 3,
        hoverBackgroundColor: distStyles.backgroundColor,
        hoverBorderColor: distStyles.borderColor,
        hoverBorderWidth: distStyles.borderWidth,
      },
      {
        type: "bar",
        label: "Average Commute Time",
        data: timeData,
        yAxisID: "y2",
        ...timeStyles,
        borderRadius: 3,
        hoverBackgroundColor: timeStyles.backgroundColor,
        hoverBorderColor: timeStyles.borderColor,
        hoverBorderWidth: timeStyles.borderWidth,
      },
    ];

    setChartConfig({
      labels,
      datasets,
    });
  }, [chartData, selectedSiteName]);



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
  selectedSiteName: PropTypes.string.isRequired,
};

export default BarChartStaging;
