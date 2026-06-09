import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

export async function BaselineSymbolRenderer(baselineInfo) {

  
  const baselineExpr = `$feature.${baselineInfo.oidField.toLowerCase()} == ${baselineInfo.keyFeature}, 'Baseline'`
  const compareExpr = `$feature.${baselineInfo.oidField.toLowerCase()} != ${baselineInfo.keyFeature}, 'Comparison'`
      
  const valueExprList = [baselineExpr,compareExpr]
  const valueExprListString = `When(${valueExprList.join(" , ")}, 'other')`
  console.log("Value Expression: ", valueExprListString)

  const siteSymbol = new UniqueValueRenderer({
      // field: symbolField,
      valueExpression: valueExprListString,
      valueExpressionTitle: "Baseline Status",
      defaultSymbol: new SimpleFillSymbol({ // Symbol for values not in uniqueValueInfos
          color: "#353E59",
          outline: {
            color: "#000000ff",
            width: 1
          }
      }),
      uniqueValueInfos: [
        {
          value: "Baseline", 
          label: "Baseline",
          symbol: {
            type: "simple-marker",
            style: "diamond",
            color: "#1C54F4",
            size: "16px",
            outline: {
              color: "#ffffff",
              width: 2
            }
          },
        },
        {
          value: "Comparison", 
          label: "Comparison",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#25408F",
            size: "15px",
            outline: {
              color: "#ffffff",
              width: 1
            }
          }
        },
        {
          value: "other", 
          label: "other",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#DBE5FF",
            size: "15px",
            outline: {
              color: "#000000ff",
              width: 1
            }
          }
        }
      ]
  });
  return siteSymbol
}
