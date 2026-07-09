import {
  CalciteBlock,
  CalciteCardGroup,
  CalciteCard,
} from "@esri/calcite-components-react";
import { useState, useEffect, useRef } from "react";
import useAppStateStore from "../../stores/AppStateStore";
import SymbolColorCard from "./SymbolColorCard";
function SetCustomSymbology() {
  // const { layersToUse, buildingField, dispatcherSiteSelection } =
  //   useSiteSelection();
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const buildingField = useAppStateStore((state) => state.buildingField);
  const setBuildingField = useAppStateStore((state) => state.setBuildingField);
  const commuteTimeSymbol = useAppStateStore((state) => state.commuteTimeSymbol);
  const setCommuteTimeSymbol = useAppStateStore((state) => state.setCommuteTimeSymbol);
  const [showPopover, setShowPopover] = useState(false);

  const handleColorChange = (index, newColor) => {
    const updatedSymbols = commuteTimeSymbol.map((item, idx) =>
      idx === index
        ? { ...item, color: newColor }
        : item
    );
    // console.log("Updated Symbols:", updatedSymbols);
    setCommuteTimeSymbol(updatedSymbols);
  };


  return (
    <>
      <CalciteBlock
        slot="content"
        heading="Adjust Commute Time Symbology Please"
        collapsible
        expanded
        icon-start="palette-check"
      >
        <CalciteCardGroup>
          {commuteTimeSymbol.map((bin, index) => (
            <SymbolColorCard 
              key={index}
              label={bin.time}
              color={bin.color}
              onColorChange={(newColor) => handleColorChange(index, newColor)}
            />
          ))}
        </CalciteCardGroup>
      </CalciteBlock>

    </>
  );
}

export default SetCustomSymbology;
