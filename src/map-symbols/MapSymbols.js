import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";

const siteSymbol = {
  type: "CIMPointSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Z",
      size: 12,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 100,
        ymax: 100,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [74.1, 46.1],
                [74.1, 46.1],
                [88.4, 46.3],
                [88.4, 9.5],
                [65.8, 9.5],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [36.7, 10],
                [36.7, 10],
                [14.1, 10],
                [14.1, 63.3],
                [27.8, 71.3],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [36.7, 10.1],
                [65.8, 10.1],
                [65.8, 84.4],
                [36.7, 84.4],
                [36.7, 10.1],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [46.4, 10],
                [56.1, 10],
                [56.1, 19.7],
                [46.4, 19.7],
                [46.4, 10],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [76.9, 55.4],
                [76.9, 46.1],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
      clippingPath: {
        type: "CIMClippingPath",
        clippingType: "Intersect",
        path: {
          rings: [
            [
              [0, 0],
              [100, 0],
              [100, 100],
              [0, 100],
              [0, 0],
            ],
          ],
        },
      },
      offsetX: 0,
      offsetY: 17,
    },
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPoint: {
        x: 0,
        y: -0.5,
      },
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 25,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 21,
        ymax: 21,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [17.17, 14.33],
                [16.97, 12.96],
                [16.38, 11.37],
                [12.16, 3.98],
                [11.2, 1.94],
                [10.5, 0],
                [9.8, 1.96],
                [8.84, 4.02],
                [4.61, 11.41],
                [4.02, 12.98],
                [3.83, 14.33],
                [3.96, 15.63],
                [4.34, 16.88],
                [4.95, 18.03],
                [5.78, 19.04],
                [6.8, 19.88],
                [7.95, 20.49],
                [9.2, 20.87],
                [10.5, 21],
                [11.8, 20.87],
                [13.05, 20.5],
                [14.2, 19.88],
                [15.22, 19.05],
                [16.05, 18.03],
                [16.66, 16.88],
                [17.04, 15.63],
                [17.17, 14.33],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [110, 110, 110, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [37, 64, 143, 175],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
    },
  ],
  animations: [],
};

const employeeSymbol = {
  type: "CIMPointSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Z",
      size: 10,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 100,
        ymax: 100,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [50.78, 45.11],
                [67.08, 45.11],
                [67.08, 16.21],
                [50.78, 16.21],
                [50.78, 45.11],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [80.2, 48.2],
                [80.2, 16.2],
                [18.6, 16.2],
                [18.6, 48.2],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [31.48, 45.11],
                [41.28, 45.11],
                [41.28, 35.31],
                [31.48, 35.31],
                [31.48, 45.11],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [12.2, 55.3],
                [49.4, 86.7],
                [86.5, 55.3],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 1,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
      clippingPath: {
        type: "CIMClippingPath",
        clippingType: "Intersect",
        path: {
          rings: [
            [
              [0, 0],
              [100, 0],
              [100, 100],
              [0, 100],
              [0, 0],
            ],
          ],
        },
      },
      offsetY: 17,
    },
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPoint: {
        x: 0,
        y: -0.5,
      },
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 25,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 21,
        ymax: 21,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [17.17, 14.33],
                [16.97, 12.96],
                [16.38, 11.37],
                [12.16, 3.98],
                [11.2, 1.94],
                [10.5, 0],
                [9.8, 1.96],
                [8.84, 4.02],
                [4.61, 11.41],
                [4.02, 12.98],
                [3.83, 14.33],
                [3.96, 15.63],
                [4.34, 16.88],
                [4.95, 18.03],
                [5.78, 19.04],
                [6.8, 19.88],
                [7.95, 20.49],
                [9.2, 20.87],
                [10.5, 21],
                [11.8, 20.87],
                [13.05, 20.5],
                [14.2, 19.88],
                [15.22, 19.05],
                [16.05, 18.03],
                [16.66, 16.88],
                [17.04, 15.63],
                [17.17, 14.33],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [110, 110, 110, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [28, 84, 244, 175],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
    },
  ],
  animations: [],
};

const inboundSymbol = {
  type: "CIMPointSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Z",
      size: 10,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 100,
        ymax: 100,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [46.6, 60],
                [46.6, 15.2],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [46.64, 83.53],
                [46.64, 70.37],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [62.8, 31.1],
                [62.8, 31.1],
                [46.8, 14.4],
                [30.3, 30.3],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
      clippingPath: {
        type: "CIMClippingPath",
        clippingType: "Intersect",
        path: {
          rings: [
            [
              [0, 0],
              [100, 0],
              [100, 100],
              [0, 100],
              [0, 0],
            ],
          ],
        },
      },
      offsetY: 16,
    },
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPoint: {
        x: 0,
        y: -0.5,
      },
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 25,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 21,
        ymax: 21,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [17.17, 14.33],
                [16.97, 12.96],
                [16.38, 11.37],
                [12.16, 3.98],
                [11.2, 1.94],
                [10.5, 0],
                [9.8, 1.96],
                [8.84, 4.02],
                [4.61, 11.41],
                [4.02, 12.98],
                [3.83, 14.33],
                [3.96, 15.63],
                [4.34, 16.88],
                [4.95, 18.03],
                [5.78, 19.04],
                [6.8, 19.88],
                [7.95, 20.49],
                [9.2, 20.87],
                [10.5, 21],
                [11.8, 20.87],
                [13.05, 20.5],
                [14.2, 19.88],
                [15.22, 19.05],
                [16.05, 18.03],
                [16.66, 16.88],
                [17.04, 15.63],
                [17.17, 14.33],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [110, 110, 110, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [255, 212, 0, 175],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
    },
  ],
  animations: [],
};

const outboundSymbol = {
  type: "CIMPointSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Z",
      size: 10,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 100,
        ymax: 100,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [47.5, 38.3],
                [47.5, 83.1],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [47.51, 14.75],
                [47.51, 27.9],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
        {
          type: "CIMMarkerGraphic",
          geometry: {
            paths: [
              [
                [31.3, 67.2],
                [31.3, 67.2],
                [47.4, 83.9],
                [63.9, 68],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Miter",
                lineStyle3D: "Strip",
                miterLimit: 4,
                width: 2,
                height3D: 1,
                anchor3D: "Center",
                color: [255, 255, 255, 255],
              },
            ],
            angleAlignment: "Map",
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
      clippingPath: {
        type: "CIMClippingPath",
        clippingType: "Intersect",
        path: {
          rings: [
            [
              [0, 0],
              [100, 0],
              [100, 100],
              [0, 100],
              [0, 0],
            ],
          ],
        },
      },
      offsetY: 15,
    },
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPoint: {
        x: 0,
        y: -0.5,
      },
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 25,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 21,
        ymax: 21,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [17.17, 14.33],
                [16.97, 12.96],
                [16.38, 11.37],
                [12.16, 3.98],
                [11.2, 1.94],
                [10.5, 0],
                [9.8, 1.96],
                [8.84, 4.02],
                [4.61, 11.41],
                [4.02, 12.98],
                [3.83, 14.33],
                [3.96, 15.63],
                [4.34, 16.88],
                [4.95, 18.03],
                [5.78, 19.04],
                [6.8, 19.88],
                [7.95, 20.49],
                [9.2, 20.87],
                [10.5, 21],
                [11.8, 20.87],
                [13.05, 20.5],
                [14.2, 19.88],
                [15.22, 19.05],
                [16.05, 18.03],
                [16.66, 16.88],
                [17.04, 15.63],
                [17.17, 14.33],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [110, 110, 110, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [250, 102, 9, 175],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: false,
      respectFrame: true,
    },
  ],
  animations: [],
};

const defaultRouteSymbol = {
  type: "CIMLineSymbol",
  symbolLayers: [
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Bevelled",
          offset: 2,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: true,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [232, 190, 255, 255],
    },
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Mitered",
          offset: -2,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: true,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [223, 115, 255, 255],
    },
  ],
  animations: [],
};

const inboundRouteSymbol = {
  type: "CIMLineSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: false,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 8,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 17,
        ymax: 17,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [0, 0.65],
                [8.5, 16.35],
                [17, 0.65],
                [0, 0.65],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [0, 0, 0, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [28, 84, 244, 255],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
      color: [0, 7, 89, 255],
      markerPlacement: {
        type: "CIMMarkerPlacementAlongLineSameSize",
        angleToLine: true,
        offset: -3,
        controlPointsPlacement: "NoConstraint",
        customEndingOffset: 0,
        endings: "WithHalfGap",
        offsetAlongLine: 0,
        placementTemplate: [100],
      },
      rotation: 90,
      offsetY: 0,
      rotateClockwise: true,
    },
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 8,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 17,
        ymax: 17,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [0, 0.65],
                [8.5, 16.35],
                [17, 0.65],
                [0, 0.65],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [0, 0, 0, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [0, 7, 89, 255],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
      color: [0, 7, 89, 255],
      markerPlacement: {
        type: "CIMMarkerPlacementAlongLineSameSize",
        angleToLine: true,
        offset: 3,
        controlPointsPlacement: "WithHalfGap",
        customEndingOffset: 0,
        endings: "WithMarkers",
        offsetAlongLine: 0,
        placementTemplate: [100],
      },
      rotation: 90,
      offsetY: 0,
      rotateClockwise: false,
    },
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Bevelled",
          offset: 3,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: true,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [0, 7, 89, 255],
    },
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Mitered",
          offset: -3,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: false,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [28, 84, 244, 255],
    },
  ],
  animations: [],
};

const outboundRouteSymbol = {
  type: "CIMLineSymbol",
  symbolLayers: [
    {
      type: "CIMVectorMarker",
      enable: true,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 8,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 17,
        ymax: 17,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [0, 0.65],
                [8.5, 16.35],
                [17, 0.65],
                [0, 0.65],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [0, 0, 0, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [28, 84, 244, 255],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
      color: [0, 7, 89, 255],
      markerPlacement: {
        type: "CIMMarkerPlacementAlongLineSameSize",
        angleToLine: true,
        offset: -3,
        controlPointsPlacement: "NoConstraint",
        customEndingOffset: 0,
        endings: "WithHalfGap",
        offsetAlongLine: 0,
        placementTemplate: [100],
      },
      rotation: 90,
      offsetY: 0,
      rotateClockwise: true,
    },
    {
      type: "CIMVectorMarker",
      enable: false,
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 8,
      billboardMode3D: "FaceNearPlane",
      frame: {
        xmin: 0,
        ymin: 0,
        xmax: 17,
        ymax: 17,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [0, 0.65],
                [8.5, 16.35],
                [17, 0.65],
                [0, 0.65],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 0,
                color: [0, 0, 0, 255],
              },
              {
                type: "CIMSolidFill",
                enable: true,
                color: [0, 7, 89, 255],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
      color: [0, 7, 89, 255],
      markerPlacement: {
        type: "CIMMarkerPlacementAlongLineSameSize",
        angleToLine: true,
        offset: 3,
        controlPointsPlacement: "WithHalfGap",
        customEndingOffset: 0,
        endings: "WithMarkers",
        offsetAlongLine: 0,
        placementTemplate: [100],
      },
      rotation: 90,
      offsetY: 0,
      rotateClockwise: false,
    },
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Bevelled",
          offset: 3,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: false,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [0, 7, 89, 255],
    },
    {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Mitered",
          offset: -3,
          option: "Fast",
        },
        {
          type: "CIMGeometricEffectDashes",
          lineDashEnding: "NoConstraint",
          controlPointEnding: "NoConstraint",
        },
      ],
      enable: true,
      colorLocked: true,
      capStyle: "Square",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 2,
      color: [28, 84, 244, 255],
    },
  ],
  animations: [],
};

const routesSymbols = {
  type: "unique-value",
  field: "travel_direction",
  defaultSymbol: new CIMSymbol({
    data: {
      type: "CIMSymbolReference",
      symbol: defaultRouteSymbol,
    },
  }),
  uniqueValueInfos: [
    {
      value: "From Candidate",
      symbol: new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: outboundRouteSymbol,
        },
      }),
    },
    {
      value: "To Candidate",
      symbol: new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: inboundRouteSymbol,
        },
      }),
    },
  ],
};

const tradeAreaSymbol = new SimpleRenderer({
  type: "simple",
  symbol: {
    type: "simple-fill",
    color: [28, 84, 244, 0.25],
    outline: {
      color: [255, 255, 255, 0.25],
      width: "1px",
    },
  },
});

export { siteSymbol, employeeSymbol, inboundSymbol, outboundSymbol, routesSymbols, tradeAreaSymbol };
