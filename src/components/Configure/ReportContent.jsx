import { 
  CalcitePanel,
  CalciteBlock,
  CalciteLabel,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteList,
  CalciteListItem,
  CalciteButton,
  CalciteAction,
  CalciteShellPanel,
  CalciteActionBar,
  CalciteActionGroup,
  CalcitePopover,
 } from "@esri/calcite-components-react";


function ReportContent() {

  return (
    <CalcitePanel>
        <div style={{height:"100%", width:"100%", backgroundColor: "#000759"}}>
          <h1 style={{color: "white"}}>It is working</h1>
          
        </div>
    </CalcitePanel>
  );
};

export default ReportContent;
