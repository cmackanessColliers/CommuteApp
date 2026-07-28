import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from "prop-types";
import { Page, Text, View, Document, Image, Font, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import {Table, TR, TH, TD} from '@ag-media/react-pdf-table';
import ColliersLogo from "../../images/ColliersLogo.png"
import SkyView from "../../images/CitySkyView.png"
import { formatter, intFormatter, nFormatter, negativeToParentheses, numFormatter } from "../../helpers/utils";
import { PDFDownloadLink } from '@react-pdf/renderer';


export default function PDFContent({ 
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
}) {  

  const styles = StyleSheet.create({
    page: { backgroundColor: '#ffffff', color:"#000759", flexDirection: 'column', border:"1px solid white" },
    header: { position:"absolute", width:"100%", Zindex:"10", backgroundColor:"#25408F"},
    title: { 
      fontSize: 18, 
      fontWeight: 'bold',
      padding:"10px",
      color:"white",
      top:"4px"
    },
    subheader: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    tableheader: {
      fontSize: 13,
      backgroundColor: "#CCCDD5",
      padding: "2px",
      textAlign: "center",
      justifyContent:"center",
    },
    submarketHeader: {
      fontSize: "12px",
      backgroundColor: "#25408F",
      color: "white",
      padding: "2px",
      marginLeft:"-0.25%",
      width:"100.5%",
    },  
    tableBody: {
      fontSize: 10,
      padding: "5px",
      border: "1px solid #000759",
      textAlign:"center",
      justifyContent:"center"
    },
    tableRow: {
      padding:"0px", 
      margin:"0px",
    },
    centerText: {
      justifyContent:"center"
    },
  });

  Font.registerHyphenationCallback((word) => {
    return [word];
  });
  // Create Document Component
  const MyDocument = () => (
    <Document>
      <Page size="A4" orientation='landscape'>
        <View style={{position:"absolute", height:"7in", width:"4in", backgroundColor:"#000759", Zindex:"9999", left:".5in", display:"flex"}}>
          <View style={{width:"93%", height:"125%", top:"-.2in", border:"1.25px solid white", left:"3.5%"}}>
            <View style={{display:"flex", position:"absolute", top:"2.5in", flexDirection:"column", color:"white", gap:"15px"}}>
              <View style={{left:".3in",}}>
                <Text style={{textAlign:"center", fontSize:"14px"}}>June 2026</Text>
              </View>
              <View style={{left:".3in", marginBottom:"2px"}}>
                <Text style={{fontSize:"35px"}}>Commuter Analysis</Text>
              </View>
              <View style={{left:".3in",marginBottom:"10px"}}>
                <Text style={{fontSize:"14px", color:"#9becf7" }}>Colliers Research</Text>
              </View>
              <View style={{left:".3in", marginTop:"5px"}}>
                <Image
                  source={ColliersLogo}
                  style={{ width: "100px", height: "80px", objectFit:"contain"}}
                />
              </View>
            </View>
          </View>
          <View style={{ position:"absolute", bottom:".02in", height:"20px", width:"1.5in", textAlign:"center", backgroundColor:"#000759", left:".5in"}}>
            <Text style={{color:"white", fontSize:"10px"}}>Accelerating Success</Text>
          </View>
        </View>
        <View style={{ height:"99.9%", width:"100%", alignSelf:"center", zIndex:"8"}}>
          <Image
            source={SkyView}
            style={{ width: "100%", height: "100%", objectFit:"cover"}}
          />
        </View>
      </Page>
      {Object.values(commuteGraphics).map((feature, index) => (
        <Page size="A4" orientation='landscape' style={styles.page} key={index}>
          <View style={{position:"absolute", height:"99.8%", width:"100%", alignSelf:"center"}}>
            <Image
              source={imageArray.find(img => img?.oid === feature.objectid).dataUrl}
              style={{ width: "100%", height: "100%", objectFit:"cover"}}
            />
          </View>
          <View style={styles.header}>
            <View style={{display:"flex", flexDirection:"row", gap:"10px", backgroundColor:"#25408F"}}>
              {(feature?.Baseline && feature?.Baseline === "Baseline") && (
                <Text style={{backgroundColor:"#000759", borderRadius:"50px", color:"white", border:"1.5px solid white", fontSize:"14px", padding:"10px", width:"1.75in", textAlign:"center", top:"6px", left:"3px", height:".5in"}}>Baseline Site</Text>
              )}
              <Text style={styles.title}>{`${feature[buildingField]} Commute Report`}</Text>
            </View>
            <View style={{display:"flex", padding:"5px"}}>
              <Image source={ColliersLogo} style={{height:"38px", width:"59px", position:"absolute", left:"91%", top:"-35px", objectFit:"contain", borderRadius:"2px"}} />
            </View>
          </View>
          <View style={{height:"2.75in", width:"3in", backgroundColor:"white", border:"1px solid #aeafb6", position:"absolute", Zindex:"10", bottom:".15in", left:".1in"}}>
            <Text style={{fontSize:"13px", textAlign:"center", marginBottom:"-10px", marginTop:"8px"}}>Commute Time Range</Text>
            <Image source={chartImages[`${feature.objectid}`]} style={{width:"100%", height:"80%", objectFit:"contain"}}></Image>
            <View style={{display:"flex", flexDirection:"column", marginTop:"-9px"}}>
              <View style={styles.tableheader}>
                <Text style={{fontSize:"12px", textAlign:"center"}}>Average Commute</Text>
              </View>
              <View style={{display:"flex", flexDirection:"row"}}>
                <View style={{fontSize: 13, padding: "2px", border: "1px solid #000759",textAlign:"center", width:"50%", backgroundColor:"white"}}>
                  <Text style={{fontSize:"12px", textAlign:"center"}}>Time: {intFormatter.format(feature.AverageCommuteTime)} min</Text>
                </View>
                <View style={{fontSize: 13, padding: "2px", border: "1px solid #000759",textAlign:"center", width:"50%", backgroundColor:"white"}}>
                  <Text style={{fontSize:"12px", textAlign:"center"}}>Distance: {feature.AverageCommuteDist} mi</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{height:"2.6in", width:"2.35in", backgroundColor:"white", border:"1px solid #aeafb6", position:"absolute", Zindex:"10", bottom:".15in", left:"9.25in"}}>
            <View style={{display:"flex", flexDirection:"column", justifyContent:'center', gap:"2px", marginTop:"3px"}}>
              <View style={{ display:"flex", flexDirection:"column", marginBottom:"3px", textAlign:"center", fontWeight:"bold" }}>
                <Text style={{fontSize:"7px"}}>Employee Commute Time Range</Text>
                <Text style={{fontSize:"7px"}}>(No. of Employees/Avg Time)</Text>
              </View>
              {(() => {
                  const found = Object.values(commuteGraphics).find(
                    (graphic) => feature[buildingField] === graphic[buildingField]
                  );
                  if (!found) return null;
                  return (
                    <>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[0].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>30 Mins or Less</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_Under30} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[1].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>31 to 45 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_31_45} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[2].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>46 to 60 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_46_60} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[3].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>61 to 90 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_61_90} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[4].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>91 to 120 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_91_120} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px"}}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[5].color, borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>121 to 3 hours</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${found.CommuteTime_121_3} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor: commuteTimeSymbol[5].color, transform:"rotate(45deg)", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"6px"}}>Exclude (3 hrs+ or no public Commute Info)</Text>
                      </View>
                    </>
                  );
                })()}
            </View>
            <View style={{display:"flex", flexDirection:"column", justifyContent:'center', gap:"2px", marginTop:"4px"}}>
              <View style={{ display:"flex", flexDirection:"column", marginBottom:"3px", textAlign:"center"}}>
                <Text style={{fontSize:"7px", fontWeight:"bold" }}>Multiple Employees Per Zip (2+ employees)</Text>
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"6px", height:"10px", alignItems:"center" }}>
                <View style={{height:"6px", width:"6px", backgroundColor:"white", borderRadius:"20px", marginRight:"5px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>1-4 Employees Per Zip</Text>
                {multiEmployeeDict.OneToFour.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${multiEmployeeDict.OneToFour.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px", height:"11px", alignItems:"center" }}>
                <View style={{height:"8px", width:"8px", backgroundColor:"white", borderRadius:"20px", marginRight:"5px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>5-9 Employees Per Zip</Text>
                {multiEmployeeDict.FiveToNine.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${multiEmployeeDict.FiveToNine.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"4px", height:"12px", alignItems:"center"}}>
                <View style={{height:"10px", width:"10px", backgroundColor:"white", borderRadius:"20px", marginRight:"4px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>10-15 Employees Per Zip</Text>
                {multiEmployeeDict.TenToFifteen.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${multiEmployeeDict.TenToFifteen.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"3px", height:"12px", alignItems:"center" }}>
                <View style={{height:"12px", width:"12px", backgroundColor:"white", borderRadius:"20px", marginRight:"4px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>{'>15 Employees Per Zip'}</Text>
                {multiEmployeeDict.FifteenPlus.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#696969"}}>{`(${multiEmployeeDict.FifteenPlus.length} Zip Codes)`}</Text>
                )}
              </View>
            </View>
            <View style={{height:".5px", width:"95%", marginLeft:"auto", marginRight:"auto", backgroundColor:"#000759", marginTop:"7px", marginBottom:"4px"}}></View>
            <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
              
              {(feature?.Baseline && feature?.Baseline === "Baseline") && (
                <View style={{height:"10px", width:"10px", backgroundColor:"#1C54F4", transform:"rotate(45deg)", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
              )}
              {(!feature?.Baseline || feature?.Baseline !== "Baseline") && (
                <View style={{height:"10px", width:"10px", backgroundColor:"#000759", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
              )}
              <Text style={{fontSize:"10px"}}>{feature[buildingField]}</Text>
            </View>
          </View>
        </Page>
      ))}
      <Page size="A4" orientation='landscape' style={styles.page}>
        <View style={{display:"flex", flexDirection:"column"}}>
          <View style={{top:".5in", left:"5%", color:"#000759", width:"90%", height:".65in", borderBottom:"5px solid #000759", fontWeight:"light"}}>
            <Text style={{fontSize:"30"}}>Drive Time Comparison</Text>
          </View>
          <View style={{display:"flex", flexDirection:"column", height:"6.75in", width:"100%", top:".6in"}}>
            <View style={{height:"100%", width:"100%", display:"flex", flexDirection:"row",}}>
              <View style={{ height:"100%", width:"100%", display:"flex", marginTop:"15px", marginLeft:"5%", marginRight:"5%"}}>
                <View style={{fontWeight:"bold", color:"#353E59", fontSize:"12", alignSelf:"center", marginBottom:"25px"}}><Text>Number of Employees by Drive Time</Text></View>
                <Table  weightings={[.09,.09,.09,.09,.09,.09,.09,.09,.09,.09,.09,]} style={{width:"100%", border:"1px solid #000759", justifySelf:"center", alignSelf:"center", marginBottom:"auto"}}>
                  <TH>
                    <TD style={{backgroundColor:"#000759", color:"white", padding:"5px", textAlign:"center", justifyContent:"center", fontSize:"10px"}}>Drive Time (Mins)</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={{backgroundColor:"#000759", color:"white", padding:"5px", textAlign:"center", justifyContent:"center", fontSize:"10px"}}>{feature[buildingField]}</TD>
                      ))
                    }
                  </TH>
                  <TR>
                    <TD style={styles.tableBody}>{"<30 mins"}</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={styles.tableBody}>{feature.CommuteTime_Under30}</TD>
                      ))
                    }
                  </TR>
                  <TR>
                    <TD style={styles.tableBody}>{"31-60 mins"}</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={styles.tableBody}>{feature.CommuteTime_31_45}</TD>
                      ))
                    }
                  </TR>
                  <TR>
                    <TD style={styles.tableBody}>{"61-90 mins"}</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={styles.tableBody}>{feature.CommuteTime_61_90}</TD>
                      ))
                    }
                  </TR>
                  <TR>
                    <TD style={styles.tableBody}>{"91-120 mins"}</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={styles.tableBody}>{feature.CommuteTime_91_120}</TD>
                      ))
                    }
                  </TR>
                  <TR>
                    <TD style={styles.tableBody}>{"121-3 hours"}</TD>
                    {Object.values(commuteGraphics)
                      .slice(0,10)
                      .map((feature, index) => (
                        <TD style={styles.tableBody}>{feature.CommuteTime_121_3}</TD>
                      ))
                    }
                  </TR>
                </Table>
              </View>
            </View>
            <View style={{height:"100%", width:"100%", display:"flex", flexDirection:"row"}}>
              <View style={{height:"100%", width:"100%"}}>
                <Text style={{fontSize:"13px", textAlign:"center", marginBottom:"-10px", marginTop:"8px", marginBottom:"5px"}}>Average Commute Time & Distance</Text>
                <Image source={chartImages["Summary"]} style={{width:"100%", height:"90%", objectFit:"contain"}}></Image>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );

  return(
      <div style={{textAlign:"center",  backgroundColor:"#CCCDD5", height:"70px", width:"300px", border:"2px solid white", borderRadius:"20px", justifyContent:"center", alignContent:"center", marginInline:"auto", color:"white"}}>
        <PDFDownloadLink
          document={<MyDocument />}
          fileName="commute-report.pdf"
        >
          {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
        </PDFDownloadLink>
      </div>
  );
}

PDFContent.propTypes = {
  baselineFeatures: PropTypes.object.isRequired,
  imageArray: PropTypes.array.isRequired,
  empCommuteFeatures: PropTypes.object.isRequired,
  commuteGraphics: PropTypes.object.isRequired,
  buildingField: PropTypes.string.isRequired,
  nameField : PropTypes.string.isRequired,
  countField : PropTypes.string.isRequired,
  multiEmployeeDict: PropTypes.string.isRequired,
  chartImages: PropTypes.array.isRequired,
  commuteTimeSymbol: PropTypes.array.isRequired,
};
