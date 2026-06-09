import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from "prop-types";
import { Page, Text, View, Document, Image, Font, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import {Table, TR, TH, TD} from '@ag-media/react-pdf-table';
import ColliersLogo from "../../images/ColliersLogo.png"
import { formatter, intFormatter, nFormatter, negativeToParentheses, numFormatter } from "../../helpers/utils";



export default function PDFContent({ 
  baselineFeatures, 
  imageArray, 
  empCommuteFeatures, 
  commuteGraphics,
  buildingField,
  nameField, 
  countField,
  multiEmployeeDict,
  chartImages
}) {  

  const styles = StyleSheet.create({
    page: { backgroundColor: '#ffffff', color:"#000759", flexDirection: 'column' },
    header: { position:"absolute", top:".2in", left:"0.15in", width:"100%", Zindex:"10"},
    title: { 
      fontSize: 18, 
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    tableheader: {
      fontSize: 13,
      backgroundColor: "#CCCDD5",
      padding: "2px",
      border: "1px solid #000759",
      textAlign: "center",
      justifyContent:"center",
      fontWeight: "bold",
      padding:"10px"
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
      fontSize: 13,
      padding: "2px",
      border: "1px solid #000759",
      textAlign:"center"
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
      {baselineFeatures.map((feature, index) => (
        <Page size="A4" orientation='landscape' style={styles.page} key={index}>
          <View style={{position:"absloute", height:"100%", width:"100%", alignSelf:"center", backgroundColor:"green"}}>
            <Image
              source={imageArray.find(img => img?.oid === feature.attributes.objectid).dataUrl}
              style={{ width: "100%", height: "100%", objectFit:"cover"}}
            />
          </View>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{`${feature.attributes[buildingField]} Commute Report`}</Text>
            </View>
            <View>
              <Image source={ColliersLogo} style={{height:"40px",width:"60px", position:"absolute", left:"90%", top:"-.4in", objectFit:"contain",}} />
            </View>
          </View>
          <View style={{height:"3.25in", width:"3in", backgroundColor:"white", border:"1px solid #aeafb6", position:"absolute", Zindex:"10", bottom:".1in", left:".1in"}}>
            <Text style={{fontSize:"13px", textAlign:"center"}}>Commute Time Range</Text>
            <Image source={chartImages[`${feature.attributes.objectid}`]} style={{width:"100%", height:"100%", objectFit:"contain"}}></Image>
          </View>
          <View style={{height:"2.25in", width:"2.35in", backgroundColor:"white", border:"1px solid #aeafb6", position:"absolute", Zindex:"10", bottom:".15in", left:"9.25in"}}>
            <View style={{display:"flex", flexDirection:"column", justifyContent:'center', gap:"2px", marginTop:"3px"}}>
              <View style={{ display:"flex", flexDirection:"column", marginBottom:"3px", textAlign:"center", fontWeight:"bold" }}>
                <Text style={{fontSize:"7px"}}>Employee Commute Time Range</Text>
                <Text style={{fontSize:"7px"}}>(No. of Employees/Avg Time)</Text>
              </View>
              {(() => {
                  const found = Object.values(commuteGraphics).find(
                    (graphic) => feature.attributes[buildingField] === graphic[buildingField]
                  );
                  if (!found) return null;
                  return (
                    <>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#2AB6A9", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>30 Mins or Less</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_Under30} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#1C54F4", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>31 to 45 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_31_45} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#4D93FF", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>46 to 60 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_46_60} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#9C45AE", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>61 to 90 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_61_90} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#FA6609", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>91 to 120 mins</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_91_120} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px"}}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#ED1B34", borderRadius:"20px", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
                        <Text style={{fontSize:"7px"}}>121 to 3 hours</Text>
                        <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${found.CommuteTime_121_3} employees)`}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px" }}>
                        <View style={{height:"7px", width:"7px", backgroundColor:"#ED1B34", transform:"rotate(45deg)", marginRight:"5px", border:"1px solid white", alignSelf:"center"}}></View>
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
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${multiEmployeeDict.OneToFour.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"5px", height:"11px", alignItems:"center" }}>
                <View style={{height:"8px", width:"8px", backgroundColor:"white", borderRadius:"20px", marginRight:"5px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>5-9 Employees Per Zip</Text>
                {multiEmployeeDict.FiveToNine.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${multiEmployeeDict.FiveToNine.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"4px", height:"12px", alignItems:"center"}}>
                <View style={{height:"10px", width:"10px", backgroundColor:"white", borderRadius:"20px", marginRight:"4px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>10-15 Employees Per Zip</Text>
                {multiEmployeeDict.TenToFifteen.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${multiEmployeeDict.TenToFifteen.length} Zip Codes)`}</Text>
                )}
              </View>
              <View style={{ display:"flex", flexDirection:"row", marginLeft:"3px", height:"12px", alignItems:"center" }}>
                <View style={{height:"12px", width:"12px", backgroundColor:"white", borderRadius:"20px", marginRight:"4px", border:"1px solid #CCCDD5", alignSelf:"center"}}></View>
                <Text style={{fontSize:"7px"}}>{'>15 Employees Per Zip'}</Text>
                {multiEmployeeDict.FifteenPlus.length > 0 && (
                  <Text style={{fontSize:"7px", marginLeft:'auto', marginRight:"auto", color:"#a7a7a8"}}>{`(${multiEmployeeDict.FifteenPlus.length} Zip Codes)`}</Text>
                )}
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );

  return(
    <div style={{height:"100vh", width:"100vw"}}>
      <PDFViewer style={{width:"100%", height:"100%"}}>
        <MyDocument />
      </PDFViewer>
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
  chartImages: PropTypes.array.isRequired
};
