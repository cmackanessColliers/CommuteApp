import React from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import PDFContent from './PDFContent';

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
  chartImages
} = {}) {
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    console.error('Popup blocked. Enable popups for this site.');
    return;
  }

  // Basic HTML shell so React can mount cleanly
  newWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          html, body, #root { height: 100%; margin: 0; }
          body { overflow: hidden; background: #f2f2f2; }
          /* Make the PDFViewer fill the tab */
          .pdf-root, .pdf-root > div { height: 100%; }
        </style>
      </head>
      <body>
        <div id="root" class="pdf-root"></div>
      </body>
    </html>
  `);
  newWindow.document.close();

  const container = newWindow.document.getElementById('root');
  const root = createRoot(container);

  // Render the PDF viewer into the new tab
  root.render(
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
    />
  );

  // Optional: clean up when the new tab/window is closed
  const cleanup = () => root.unmount();
  newWindow.addEventListener('beforeunload', cleanup);
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
  chartImages: PropTypes.array.isRequired
};
