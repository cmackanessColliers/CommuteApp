import { CalciteButton, CalciteBlock } from "@esri/calcite-components-react";
import CSVDownloader from "react-csv-downloader";

const CSVTemplateDownloader = () => {
  const PropertyFields = [
    { id: "building", displayName: "building" },
    { id: "address", displayName: "address" },
    { id: "City", displayName: "City" },
    { id: "State", displayName: "State" },
    { id: "Latitude", displayName: "Latitude" },
    { id: "Longitude", displayName: "Longitude" },
    { id: "Zip", displayName: "Zip" },
    { id: "site_image", displayName: "site_image" },
    { id: "AnnualLeaseRate", displayName: "AnnualLeaseRate" },
    { id: "AnnualOPEX", displayName: "AnnualOPEX" },
    { id: "AnnualDrayage", displayName: "AnnualDrayage" },
    { id: "PropertyTax", displayName: "PropertyTax" },
    { id: "CorporateIncomeTax", displayName: "CorporateIncomeTax" },
  ];

  const propertyDatas = [
    {
      building: "Example Building Name",
      address: "123 Example Address Lane",
      City: "Cityville",
      State: "Statesylvania",
      Latitude: 40.25593785,
      Longitude: -74.40905283,
      Zip: "12345",
      site_image:
        "https://phillyindustrialspace.com/wp-content/uploads/2025/01/Blogs-1.png",
      AnnualLeaseRate: "OPTIONAL",
      AnnualOPEX: "OPTIONAL",
      AnnualDrayage: "OPTIONAL",
      PropertyTax: "OPTIONAL",
      CorporateIncomeTax: "OPTIONAL",
    },
  ];

  const EmployeeFields = [
    { id: "Office", displayName: "Office" },
    { id: "City", displayName: "City" },
    { id: "State", displayName: "State" },
    { id: "Zip", displayName: "Zip" },
    { id: "EmployeeCount", displayName: "EmployeeCount" },
  ];

  const employeeDatas = [
    {
      Office: "Example Office Name",
      City: "Cityville",
      State: "Statesylvania",
      Zip: "12345",
      EmployeeCount: 5,
    },
  ];

  const asyncComputePropertyDatas = async () => {
    return Promise.resolve(propertyDatas);
  };

  const asyncComputeEmployeeDatas = async () => {
    return Promise.resolve(employeeDatas);
  };

  return (
    <CalciteBlock
      heading="Download CSV Templates"
      scale="s"
      collapsible
      description="For Property and Employee data"
      icon-start="download"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          margin: "0.5rem 0",
        }}
      >
        <CSVDownloader
          filename="Property Template"
          separator=","
          columns={PropertyFields}
          datas={asyncComputePropertyDatas}
          text="Using Async Callback to Compute Datas"
          style={{ marginInline: "auto", marginRight: "10px" }}
        >
          <CalciteButton
            scale="s"
            iconStart="organization"
            appearance="outline"
          >
            {" "}
            Properties
          </CalciteButton>
        </CSVDownloader>

        <CSVDownloader
          filename="Employee Template"
          separator=","
          columns={EmployeeFields}
          datas={asyncComputeEmployeeDatas}
          text="Using Async Callback to Compute Datas"
          style={{ marginInline: "auto", marginLeft: "10px" }}
        >
          <CalciteButton scale="s" iconStart="users" appearance="outline">
            Employees
          </CalciteButton>
        </CSVDownloader>
      </div>
    </CalciteBlock>
  );
};

export default CSVTemplateDownloader;
