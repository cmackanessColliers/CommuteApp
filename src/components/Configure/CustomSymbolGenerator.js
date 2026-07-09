import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";

export default async function createEMPCommuteRenderer(commuteTimes) {
  const uniqueValueInfos = commuteTimes.map(({ time, color, minTime, maxTime }) => ({
      minValue: minTime,
      maxValue: maxTime,
      label: time,
      symbol:{
          type: "simple-marker",
          style: "circle",
          color: color,
          outline: {
            width: 1, 
            color:"white"
          }
      },
    }))

  return {
    type: "class-breaks",
    field: "travelTime",
    classBreakInfos: [
      ...uniqueValueInfos,
      {
        minValue: 181,
        maxValue: 500,
        label: "Exclude (3 hours+ commute or no public commute info)",
        symbol: {
          type: "simple-marker",
          style: "triangle",
          size: 10,
          color: [237, 27, 52],
          outline: {
            width: 1,
            color: "white"
          }
        }
      }
    ]
  };
}
