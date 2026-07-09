import React from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import PDFContent from './PDFContent';
import { 
  CalciteButton,
} from "@esri/calcite-components-react";
/**
 * Opens a new tab and renders <PDFViewer><MyDocument/></PDFViewer> inside it.
 * @param {Object} opts
 * @param {string} [opts.title='PDF Preview'] - Title for the new tab.
 */
export function openPdfInNewTab({ 
  title = 'PDF Preview', 
  baselineFeatures, 
  imageArray, 
  empCommuteFeatures, 
  commuteGraphics,
  buildingField,
  nameField,
  countField,
  multiEmployeeDict,
  chartImages,
  commuteTimeSymbol
} = {}) {


  let container = document.getElementById('pdf-root');

  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'pdf-root';
    document.body.appendChild(container);
  }

  // Create a root and render
  const root = createRoot(container);
  root.render(
    <div style={{position:"fixed", top: "50%", left:"50%", transform:"translate(-50%, -50%)", zIndex:"99999", overflow:"auto", height:"30%", width:"30%", backgroundColor:"#CCCDD5"}}>
      <div className="pdf-preview-header">
        <div style={{display:"flex", flexDirection:"row", alignContent:"center", justifyContent:"center"}}>
          <CalciteButton style={{marginInline:"auto"}} appearance="outline-fill" iconStart="x-circle" onClick={() => root.unmount()}>
            Close
          </CalciteButton>
        </div>
      </div>
      <div style={{position:"absolute", top: "60%", left:"50%", transform:"translate(-50%, -50%)", backgroundColor:"#CCCDD5"}}>
        <PDFContent
          baselineFeatures={baselineFeatures}
          imageArray={imageArray}
          empCommuteFeatures={empCommuteFeatures}
          commuteGraphics={commuteGraphics}
          buildingField={buildingField}
          nameField={nameField}
          countField={countField}
          multiEmployeeDict={multiEmployeeDict}
          chartImages={chartImages}
          commuteTimeSymbol={commuteTimeSymbol}
        />
      </div>
    </div>
  );

}


openPdfInNewTab.propTypes = {
  title: PropTypes.string.isRequired,
  baselineFeatures: PropTypes.object.isRequired,
  imageArray:PropTypes.array.isRequired,
  empCommuteFeatures: PropTypes.object.isRequired,
  commuteGraphics: PropTypes.object.isRequired,
  buildingField: PropTypes.string.isRequired,
  nameField: PropTypes.string.isRequired,
  countField: PropTypes.string.isRequired,
  multiEmployeeDict: PropTypes.string.isRequired,
  chartImages: PropTypes.array.isRequired,
  commuteTimeSymbol: PropTypes.array.isRequired,
};
