import {
  CalcitePopover,
  CalciteColorPicker,
  CalciteCard,
  CalciteBlock,
  CalciteLabel,
  CalciteSlider
} from "@esri/calcite-components-react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
// import useSiteSelectionStore from "../../../stores/SiteSelectionStore";

function SymbolColorCard({ label, color, onColorChange }) {
  const [useColor, setUseColor] = useState(color);
  const [showPopover, setShowPopover] = useState(false);

  const handleSymbolChange = (newColor) => {
    const next = newColor;
    setUseColor(next);
    onColorChange?.(newColor);
  };

  return (
    <>
      <CalciteCard 
        id={`${label}SymbolCard`}
        thumbnailPosition="block-start" 
        style={{width:"100%"}}
        onClick={() => setShowPopover(!showPopover)}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
          <div style={{height:"20px", width:"20px", backgroundColor:useColor, alignContent:"center"}}></div>
          <span style={{alignContent:"center", lineHeight:"20px", fontSize:"14px"}}> {label} </span>
        </div>
      </CalciteCard>
      {showPopover && (
        <CalcitePopover
          heading="Symbology"
          referenceElement={`${label}SymbolCard`}
          closable
          open
          placement="left"
          overlayPositioning="fixed"
          autoClose={false}
          triggerDisabled
          onCalcitePopoverBeforeClose={() => {
            setShowPopover(false)
          }}
        >
          <div style={{overflow:"auto", maxHeight:"400px"}}> 
            <CalciteBlock heading="Select Color" 
              expanded
            >
              <CalciteColorPicker
                value={useColor}
                onCalciteColorPickerChange={(e) => handleSymbolChange(e.target.value)}
                format="hex"
                alpha={false}
              />
            </CalciteBlock>
          </div>
        </CalcitePopover>
      )}
    </>
  );
}

SymbolColorCard.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onColorChange: PropTypes.func,
};

export default SymbolColorCard;
