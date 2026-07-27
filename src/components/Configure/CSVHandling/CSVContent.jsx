import { Activity, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  CalciteInput,
  CalciteLabel,
  CalciteAlert,
  CalciteButton,
  CalciteDialog,
  CalciteSheet,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteCombobox,
  CalciteComboboxItem,
} from "@esri/calcite-components-react";

import useAppStateStore from "../../../stores/AppStateStore";
import useUIStore from "../../../stores/UIStore";
import { generateFeaturesFromFileData, preprocessCSV } from "../../../helpers/utils";
import CSVTemplateDownloader from "./CsvTemplateDownloader";

// Role configuration to reduce switch statement repetition
const ROLE_CONFIG = {
  Site: {
    fileNameKey: "siteFileName",
    setFileNameKey: "setSiteFileName",
    layerSetter: "setBaselineLayer",
    layerGetter: "baselineLayer",
    wrapInArray: false,
  },
  Employee: {
    fileNameKey: "employeeFileName",
    setFileNameKey: "setEmployeeFileName",
    layerSetter: "setLayer",
    layerGetter: "layer",
    wrapInArray: false,
  },
};

function CSVContent({ role }) {
  // Use reactive hooks for file names so component re-renders on changes
  const siteFileName = useUIStore((state) => state.siteFileName);
  const employeeFileName = useUIStore((state) => state.employeeFileName);
  const {
    setSiteFileName,
    setEmployeeFileName,
  } = useUIStore.getState();

  const map = useAppStateStore((state) => state.map);
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const layer = useAppStateStore((state) => state.layer);
  const setLayer = useAppStateStore((state) => state.setLayer);
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const inputRef = useRef(null);

  const roleStateMap = {
    Site: { fileName: siteFileName },
    Employee: { fileName: employeeFileName },
  };

  useEffect(() => {
    if (!layer && role === "Employee") {
      removeCSVLayer("Employee");
    }
  }, [layer]);

  useEffect(() => {
    if (!baselineLayer && role === "Site") {
      removeCSVLayer("Site");
    }
  }, [baselineLayer]);


  async function addCSVLayer(file, map, role, layer, loadingHandler) {
    const config = ROLE_CONFIG[role];
    if (!config) {
      throw new Error(`Role not recognized: ${role}`);
    }

    try {
      const processedFile = await preprocessCSV(file);
      console.time("leverage Atlas");
      const [fileFeatureLayer, fileName] = await generateFeaturesFromFileData(
        processedFile,
        role,
      );
      await fileFeatureLayer.load();
      console.timeEnd("leverage Atlas");

      const featureCount = await fileFeatureLayer
        .queryFeatures()
        .then((res) => res?.features?.length);
      console.log(`${featureCount} features loaded for role ${role}`);

      // Use role config to set layer and filename
      const setterMap = {
        setBaselineLayer,
        setLayer,
      };
      const fileNameSetterMap = {
        setSiteFileName,
        setEmployeeFileName,
      };

      const layerSetter = setterMap[config.layerSetter];
      const fileNameSetter = fileNameSetterMap[config.setFileNameKey];

      const layerToSet = config.wrapInArray
        ? [fileFeatureLayer]
        : fileFeatureLayer;
      layerSetter(layerToSet);
      fileNameSetter(fileName);

      return;
    } catch (err) {
      console.error(err);
      setAlertVisible(true);
      removeCSVLayer(role);
      throw new Error("Something happened while loading CSV: ", err);
    } finally {
      loadingHandler(false);
    }
  }

  async function removeCSVLayer(role) {
    // console.log("Removing CSV Layer");
    const config = ROLE_CONFIG[role];
    if (!config) {
      throw new Error(`Role not recognized: ${role}`);
    }

    const setterMap = {
      setBaselineLayer,
      setLayer,
    };
    const fileNameSetterMap = {
      setSiteFileName,
      setEmployeeFileName,
    };

    const layerSetter = setterMap[config.layerSetter];
    const fileNameSetter = fileNameSetterMap[config.setFileNameKey];

    layerSetter(null);
    fileNameSetter(null);
  }

  return (
    <div
      slot="content"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <CalciteLabel style={{ width: "100%" }}>
        CSV Layer
        {roleStateMap[role]?.fileName !== null && (
          <>
            <CalciteLabel scale="s">
              <div
                style={{
                  border: "1px solid var(--calcite-ui-border-1)",
                  borderRadius: "var(--root-border-radius)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CalciteButton
                  scale="s"
                  appearance="transparent"
                  onClick={() => removeCSVLayer(role)}
                >
                  X
                </CalciteButton>
                {roleStateMap[role]?.fileName}
              </div>
            </CalciteLabel>
          </>
        )}
        {roleStateMap[role]?.fileName === null && (
          <CalciteInput
            ref={inputRef}
            style={{ width: "100%" }}
            scale="s"
            clearable
            type="file"
            single
            loading={loadingCsv}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onCalciteInputInput={(e) => {
              if (!e.target.value) {
                // console.log("No Files");
                removeCSVLayer(role);
                return;
              }
              setLoadingCsv(true);
              addCSVLayer(
                e.target.files[0],
                map,
                role,
                layer,
                setLoadingCsv,
              );
            }}
          ></CalciteInput>
        )}
      </CalciteLabel>
      <FieldMappingContent role={role} />
      <CalciteAlert
        slot="content"
        icon="exclamation-mark-circle"
        kind="danger"
        label="CSV Upload Error"
        open={alertVisible}
        onCalciteAlertClose={() => {
          setAlertVisible(false);
        }}
      >
        <div slot="title">Error Uploading File</div>
        <div slot="message">
          <div>
            There was an error uploading this file check for below issues
          </div>
          <ul>
            <li>
              The file is not a csv, you will need to convert Excel files to csv
            </li>
            <li>
              Unclear location fields: Do not prefix addresses, latitude,
              longitude, or other location fields
            </li>
            <li>
              Conflicting location fields, the only location information should
              be the information for the site
            </li>
          </ul>
          <CSVTemplateDownloader />
        </div>
      </CalciteAlert>
    </div>
  );
}

CSVContent.propTypes = {
  role: PropTypes.string,
};

export default CSVContent;

function FieldMappingContent({ role }) {
  const [localMapping, setLocalMapping] = useState(null);
  const fieldMappingData = useAppStateStore(
    (state) => state.fieldMappingData,
  );
  const fieldMappingResolver = useAppStateStore(
    (state) => state.fieldMappingResolver,
  );
  const fieldMappingDialogVisible = useAppStateStore(
    (state) => state.fieldMappingDialogVisible,
  );
  const fieldMappingRole = useAppStateStore(
    (state) => state.fieldMappingRole,
  );

  // Only render this dialog if it's for this specific role
  const isActiveDialog = fieldMappingDialogVisible && fieldMappingRole === role;

  // Initialize local mapping when dialog data arrives
  useEffect(() => {
    if (fieldMappingData && isActiveDialog) {
      console.log(
        "Initializing field mapping dialog with data: ",
        fieldMappingData.fields,
      );
      setLocalMapping({
        addressFields: fieldMappingData.addressFields,
        coordinateFieldName: fieldMappingData.coordinateFieldName,
        coordinateFieldType: fieldMappingData.coordinateFieldType,
        latitudeFieldName: fieldMappingData.latitudeFieldName,
        longitudeFieldName: fieldMappingData.longitudeFieldName,
        locationType: fieldMappingData.locationType,
        fields: fieldMappingData.fields,
      });
    }
  }, [fieldMappingData, isActiveDialog]);

  const handleConfirm = () => {
    if (fieldMappingResolver && localMapping) {
      // Resolve the promise with the mapped fields
      fieldMappingResolver(localMapping);
    }
    // Clean up and close the dialog
    const { cleanupFieldMapping } = useAppStateStore.getState();
    cleanupFieldMapping();
    setLocalMapping(null);
  };

  const handleCancel = () => {
    // Reject the promise so CSV loading doesn't hang
    if (fieldMappingResolver) {
      fieldMappingResolver(null); // Or could reject: new Error("User cancelled field mapping")
    }
    // Clean up and close the dialog
    const { cleanupFieldMapping } = useAppStateStore.getState();
    cleanupFieldMapping();
    setLocalMapping(null);
  };

  // Don't render if this isn't the active dialog for this role
  if (!isActiveDialog || !fieldMappingData || !localMapping) {
    return null;
  }

  return (
    <CalciteDialog
      modal
      width="s"
      heading="Field Mapping"
      description="Confirm or adjust the automatically detected field mappings:"
      open={isActiveDialog}
      closeDisabled
      outsideCloseDisabled
      style={{ "--calcite-dialog-min-size-y": "600px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div style={{ flexGrow: "1", marginBottom: "16px", fontSize: "14px" }}>
          <CalciteLabel layout="inline">
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                justifyItems: "start",
                alignItems: "center",
                paddingLeft: "2rem",
              }}
            >
              <strong>Location Type:</strong>
              <CalciteDropdown>
                <CalciteButton
                  slot="trigger"
                  appearance="outline"
                  scale="m"
                  style={{ width: "100%" }}
                >
                  {localMapping.locationType ||
                    "Select location type (address or coordinates)"}
                </CalciteButton>
                <CalciteDropdownItem
                  onCalciteDropdownItemSelect={() =>
                    setLocalMapping((prevMapping) => ({
                      ...prevMapping,
                      locationType: "address",
                    }))
                  }
                >
                  address
                </CalciteDropdownItem>
                <CalciteDropdownItem
                  onCalciteDropdownItemSelect={() =>
                    setLocalMapping((prevMapping) => ({
                      ...prevMapping,
                      locationType: "coordinates",
                    }))
                  }
                >
                  coordinates
                </CalciteDropdownItem>
              </CalciteDropdown>
            </div>
          </CalciteLabel>

          {localMapping.locationType === "coordinates" && (
            <>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>Latitude Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.latitudeFieldName || "Not detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            latitudeFieldName: null,
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            latitudeFieldName: name,
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>Longitude Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.longitudeFieldName || "Not detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            longitudeFieldName: null,
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            longitudeFieldName: name,
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
            </>
          )}

          {localMapping.locationType === "address" && (
            <div>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>Address Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.addressFields?.["Address"] ||
                        "None detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["Address"]: null,
                            },
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["Address"]: name,
                            },
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>City Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.addressFields?.["City"] || "None detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["City"]: null,
                            },
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["City"]: name,
                            },
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>State Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.addressFields?.["State"] || "None detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["State"]: null,
                            },
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["State"]: name,
                            },
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
              <CalciteLabel layout="inline">
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    justifyItems: "start",
                    alignItems: "center",
                    paddingLeft: "2rem",
                  }}
                >
                  <strong>Zip Column:</strong>
                  <CalciteDropdown>
                    <CalciteButton
                      width="full"
                      slot="trigger"
                      appearance="outline"
                      scale="m"
                    >
                      {localMapping.addressFields?.["Zip"] || "None detected"}
                    </CalciteButton>
                      <CalciteDropdownItem
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["Zip"]: null,
                            },
                          }))
                        }
                      >
                        None
                      </CalciteDropdownItem>
                    {localMapping.fields?.map(({ name, alias }, index) => (
                      <CalciteDropdownItem
                        key={index}
                        onCalciteDropdownItemSelect={() =>
                          setLocalMapping((prevMapping) => ({
                            ...prevMapping,
                            addressFields: {
                              ...prevMapping.addressFields,
                              ["Zip"]: name,
                            },
                          }))
                        }
                      >
                        {alias || name}
                      </CalciteDropdownItem>
                    ))}
                  </CalciteDropdown>
                </div>
              </CalciteLabel>
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <CalciteButton onClick={handleConfirm}>Confirm</CalciteButton>
          <CalciteButton appearance="outline" onClick={handleCancel}>
            Cancel
          </CalciteButton>
        </div>
      </div>
    </CalciteDialog>
  );
}

FieldMappingContent.propTypes = {
  role: PropTypes.string,
};
