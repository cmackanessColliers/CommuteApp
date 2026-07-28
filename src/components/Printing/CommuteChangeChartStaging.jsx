import { useState, useEffect, useRef } from "react";
import CommuteChangeChart from "./CommuteChangeChart";
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

const CommuteChangeChartStaging = ({chartData, selectedSiteName}) => {

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
        ? `${baseColor}`
        : `${baseColor}${dimAlpha}`;
    });

    const borderColor = Array.from({ length: count }, (_, idx) => {
      if (highlightIndex === null) return baseColor;
      return idx === highlightIndex ? highlightFill : baseColor;
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
    const labels = chartData.Commutewithin5.labels || [];
    const borderWidth = 1;
    const similarData = (chartData.Commutewithin5?.data || []).map(v => v === 0 ? null : v);
    const longerData = (chartData.CommuteLongerBy5?.data || []).map(v => v === 0 ? null : v);
    const shorterData = (chartData.CommuteShorterBy5?.data || []).map(v => v === 0 ? null : v);

    const highlightIndex = selectedSiteName ? labels.indexOf(selectedSiteName) : -1;
    const similarStyles = makeIndexedStyles({
      labels,
      highlightIndex,
      baseColor: MEDIUMBLUEGREY,
    });

    const longerStyles = makeIndexedStyles({
      labels,
      highlightIndex,
      baseColor: ORANGE,
    });

    const shorterStyles = makeIndexedStyles({
      labels,
      highlightIndex,
      baseColor: MEDIUMBLUE,
    });

    const datasets = [
      {
        type: "bar",
        label: "Minimal: Similar Commute Time",
        data: similarData,
        yAxisID: "y",
        ...similarStyles,
        borderRadius: 3,
        hoverBackgroundColor: similarStyles.backgroundColor,
        hoverBorderColor: similarStyles.borderColor,
        hoverBorderWidth: similarStyles.borderWidth,
      },
      {
        type: "bar",
        label: "Negative: 5+ Mins Slower",
        data: longerData,
        yAxisID: "y",
        ...longerStyles,
        borderRadius: 3,
        hoverBackgroundColor: longerStyles.backgroundColor,
        hoverBorderColor: longerStyles.borderColor,
        hoverBorderWidth: longerStyles.borderWidth,
      },
      {
        type: "bar",
        label: "Positive: 5+ Mins Faster",
        data: shorterData,
        yAxisID: "y",
        ...shorterStyles,
        borderRadius: 3,
        hoverBackgroundColor: shorterStyles.backgroundColor,
        hoverBorderColor: shorterStyles.borderColor,
        hoverBorderWidth: shorterStyles.borderWidth,
      },
    ];

    setChartConfig({
      labels,
      datasets,
    });
  }, [chartData, selectedSiteName]);



  return (
    chartConfig ? (
        <CommuteChangeChart 
          chartData={chartConfig}
        />
    ) : null
  );
};

CommuteChangeChartStaging.propTypes = {
  chartData: PropTypes.object.isRequired,
  selectedSiteName: PropTypes.string.isRequired,
};

export default CommuteChangeChartStaging;
