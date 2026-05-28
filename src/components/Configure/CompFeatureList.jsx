
import {
  CalciteCardGroup,
  CalciteCard,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteButton,
  CalciteInput
} from "@esri/calcite-components-react";

import { useState, useRef } from "react";
import useAppStateStore from "../../stores/AppStateStore";

function CompFeatureList() {
  const layer = useAppStateStore((state) => state.layer);
  const setCompareFeatures = useAppStateStore((state) => state.setCompareFeatures);
  const compareFeatures = useAppStateStore((state) => state.compareFeatures);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  
  async function removeFeature(feature, index) {
    await layer.applyEdits({ deleteFeatures: [feature] });

    const updatedFeatures = compareFeatures.filter((_, i) => i !== index);
    setCompareFeatures(updatedFeatures);
  }

  async function renameFeature(feature, name, index) {
    const updatedFeature = {
      ...feature,
      attributes: {
        ...feature.attributes,
        name: name
      }
    };

    await layer.applyEdits({ updateFeatures: [updatedFeature] });

    const updatedFeatures = compareFeatures.map((f, i) =>
      i === index ? updatedFeature : f
    );

    setCompareFeatures(updatedFeatures);
    setRenamingIndex(null);
    setRenameValue("")
  }

  return (
    <CalciteCardGroup style={{display:"flex", flexDirection:"column", height:"100%", width:"100%", gap:"10px", marginInline:"auto",}}>
      {compareFeatures?.map((feature, index) => (
        <CalciteCard key={index} style={{width:"98%"}}>
          <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>  
            <div style={{width:"40%"}}>{feature.attributes.name}</div>
            <CalciteDropdown
              open={openIndex === index}
              onCalciteDropdownOpen={() => setOpenIndex(index)}
              onCalciteDropdownClose={() => setOpenIndex(null)}
              overlayPositioning="fixed"
            >
              <CalciteButton slot="trigger" appearance="outline" style={{ height:"25px", alignSelf:"center", marginRight:"5px"}}>
                Options
              </CalciteButton>

              <CalciteDropdownItem
                onClick={() => setRenamingIndex(index)}
              >
                Rename
              </CalciteDropdownItem>

              <CalciteDropdownItem
                onClick={() => removeFeature(feature, index)}
              >
                Delete
              </CalciteDropdownItem>
            </CalciteDropdown>

            {/* Rename Input */}
            {renamingIndex === index && (
              <div style={{display:"flex", flexDirection:"row", gap:"2px"}}>
                <CalciteInput
                  placeholder="Enter new name"
                  value={renameValue}
                  onCalciteInputInput={(e) => setRenameValue(e.target.value)}
                >
                  <CalciteButton slot="action" iconStart="check-circle-f"
                    onClick={()=>{
                      renameFeature(feature, renameValue, index)
                      setOpenIndex(null)
                      setRenamingIndex(null)
                    }}
                  ></CalciteButton>
                </CalciteInput>
              </div>
            )}
          </div>
        </CalciteCard>
      ))}
    </CalciteCardGroup>
  );
}

export default CompFeatureList;
