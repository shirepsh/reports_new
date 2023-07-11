import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { TokenContext } from "../Context/TokenContext";
import { Link, useParams, useLocation } from "react-router-dom";
import { MYSERVER } from "../env";
import "./ParkingLotDetails.css";
import filtersImage from "../static/filters.jpg";
import backwards from "../static/backwards.png";
import "jspdf-autotable";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ParkingLotDetails = () => {

// ##################################################################################################################################################################################
  const { parking_lot_id } = useParams();
  const [parkingLotData, setParkingLotData] = useState([]);
  const [parkingLotName, setParkingLotName] = useState("");
  const [error, setError] = useState(null);

  const [filteredData, setFilteredData] = useState([]);

  // use context for the user token
  const { token, setToken } = useContext(TokenContext);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // 2 filters: machine name, type
  const [filterType, setFilterType] = useState("");
  const [filterName, setFilterName] = useState("");
  const [machineNames, setMachineNames] = useState([]);
  const [selectedMachineNames, setSelectedMachineNames] = useState([]);
  const [selectAllMachines, setSelectAllMachines] = useState(false);

  // set current date and difine filter for Date
  const currentMonth = moment().startOf("month");
  const firstDayOfMonth = currentMonth.format("YYYY-MM-DD");
  const lastDayOfMonth = currentMonth.endOf("month").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  // set message if there is no data for the current month
  const [DateMessage, setDateMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleMessageChange = (event) => {
    setDateMessage(event.target.value);
  };

  const handleSendMessage = () => {
    console.log("Sending message:", DateMessage);
    setShowMessage(true);
  };

  // for navigte pages
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = Object.values(filteredData)
    .flatMap((machine) => machine.operation_details)
    .slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(
    Object.values(filteredData).flatMap((machine) => machine.operation_details)
      .length / recordsPerPage
  );

  // for the filters button
  const [showFilters, setShowFilters] = useState(false);

  // disply extand data
  const [expandedOperations, setExpandedOperations] = useState([]);

  // console.log("filteredData", filteredData)
  console.log("expandedOperations", expandedOperations)

  // config of the token for validation
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ###############################################################################################################################################################################

  // call to the function fetchParkingLotData when the component is reload
  useEffect(() => {
    fetchParkingLotData();
    setParkingLotName(searchParams.get("name"));
  }, []);

  const fetchParkingLotData = async () => {
    try {
      const response = await axios.get(
        `${MYSERVER}parking_lot_data/${parking_lot_id}/`,
        config
      );
      const data = response.data;

      // Filter the data based on the selected date range
      const filteredData = Object.values(data).reduce((acc, machine) => {
        const filteredOperations = machine.operation_details.filter(
          (operation) => {
            const operationDate = new Date(operation.date);
            return (
              operationDate >= new Date(startDate) &&
              operationDate <= new Date(endDate)
            );
          }
        );

        if (filteredOperations.length > 0) {
          acc[machine.machine_id] = {
            ...machine,
            operation_details: filteredOperations,
          };
        }

        return acc;
      }, {});

      setParkingLotData(data);
      setFilteredData(filteredData);

      // Check if there are no matching operations for the current month
      if (Object.keys(filteredData).length === 0) {
        setDateMessage("אין תנועות לחודש הנוכחי");
        setShowMessage(true);
      } else {
        setShowMessage(false);
      }

      // Extract and set the machine names
      const names = Object.values(data).map((machine) => machine.display_name);
      setMachineNames(names);
    } catch (error) {
      console.error(error);
      setError("Error fetching parking lot details");
    }
  };

  // #############################################################################################################################################################################

  // function for filter by TYPE
  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  // funtion to filter by DATE
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  // function to filter by NAME
  const handleMachineSelection = (event) => {
    const machineName = event.target.value;
    if (event.target.checked) {
      if (machineName === "all") {
        setSelectAllMachines(true);
        setSelectedMachineNames(
          Object.values(parkingLotData).map((machine) => machine.display_name)
        );
      } else {
        setSelectedMachineNames((prevSelectedMachineNames) => [
          ...prevSelectedMachineNames,
          machineName,
        ]);
        setSelectAllMachines(false);
      }
    } else {
      if (machineName === "all") {
        setSelectAllMachines(false);
        setSelectedMachineNames([]);
      } else {
        setSelectedMachineNames((prevSelectedMachineNames) =>
          prevSelectedMachineNames.filter((name) => name !== machineName)
        );
      }
    }
  };

  // function to search data by the given filters
  const handleSearch = () => {
    // Convert start and end dates to JavaScript Date objects
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    // Filter the operations based on the selected filters
    const filteredData = Object.values(parkingLotData).reduce(
      (acc, machine) => {
        const filteredOperations = machine.operation_details.filter(
          (operation) => {
            const operationDate = new Date(operation.date);
            const matchesName =
              selectedMachineNames.length === 0 ||
              selectedMachineNames.includes(machine.display_name);

            return (
              (filterType === "" || operation.type === filterType) &&
              matchesName &&
              (!startDateObj || operationDate >= startDateObj) &&
              (!endDateObj || operationDate <= endDateObj)
            );
          }
        );

        if (filteredOperations.length > 0) {
          acc[machine.machine_id] = {
            ...machine,
            operation_details: filteredOperations,
          };
        }

        return acc;
      },
      {}
    );

    // Update the filtered data state
    setFilteredData(filteredData);
  };

  // ##################################################################################################################################################################################

  // function to move to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // function to backwords to the previos page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // function for the current page
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // function for setting the pages numbers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={currentPage === i ? "active" : ""}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // ###############################################################################################################################################################################

  //  reset data button
  const handleReset = () => {
    setFilterType("");
    setFilterName("");
    setStartDate("");
    setEndDate("");
    setFilteredData(parkingLotData); // Reset filteredData to the original data
  };

  // ##############################################################################################################################################################################
  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Adjust the table width and height to fit the page
    const margin = 10;
    const tableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const tableHeight = doc.internal.pageSize.getHeight() - margin * 2 - 10; // Account for page margins and extra space

    // Generate the table data
    const tableData = Object.values(filteredData)
      .flatMap(machine => machine.operation_details.map(operation => ({ ...machine, ...operation })));

    // Define the columns for the table
    const columns = ['Machine ID', 'Display Name', 'Operation ID', 'Type', 'Date', 'Total'];

    // Define the rows for the table
    const rows = tableData.map(({ machine_id, display_name, operation_id, type, date, total }) => [
      machine_id,
      display_name,
      operation_id,
      type,
      date,
      total
    ]);

    // Set the table style
    const tableStyle = { fontSize: 10 };

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: margin,
      tableWidth,
      tableHeight,
      styles: tableStyle
    });

    doc.save('filtered_data.pdf');
  };

  //  ###############################################################################################################################################################################

  //  call to the 2 export buttons (global and generic)
  const renderExportButton = () => {
    if (Object.keys(filteredData).length > 0 && currentRecords.length > 0) {
      return (
        <div className="export-button-container">
          <button className="export-button" onClick={handleExportPDF}>
            ייצוא דוח כללי
          </button> <br /><br />
          <button className="export-button" onClick={exportGlobalPDF}>
            ייצוא דוח מפורט
          </button>
        </div>
      );
    }
    return null;
  };

  // #############################################################################################################################################################################
  function exportGlobalPDF() {
    const doc = new jsPDF();
    const OperData = [];

    Object.values(filteredData).forEach(machine => {
      machine.operation_details.forEach(operation => {
        operation.hoopers.forEach(hooper => {
          const dataRow = {
            machineName: machine.display_name,
            // machineId: machine.machine_id,
            operationId: operation.operation_id,
            type: operation.type,
            shift_id: operation.shift_id,
            date: operation.date,
            hooperId: hooper.hooper_id,
            value: hooper.value,
            count: hooper.count,
            totalValue: hooper.total,
            total: operation.total,
            currency: hooper.currency
          };
          OperData.push(dataRow);
        });
      });
    });

    const headers = [
      'name',
      // 'Machine ID',
      'Operation ID',
      'Type',
      'Shift ID',
      'Date',
      'Hooper ID',
      'Value',
      'Count',
      'Sum',
      'Total',
      'Currency'
    ];

    const data = OperData.map(item => [
      item.machineName,
      // item.machineId,
      item.operationId,
      item.type,
      item.shift_id,
      item.date,
      item.hooperId,
      item.value,
      item.count,
      item.totalValue,
      item.total,
      item.currency
    ]);

    const tableProps = {
      startY: 20,
      margin: { top: 20 },
    };

    doc.autoTable(headers, data, tableProps);

    doc.save('data.pdf');
  }


  // #################################################################################################################################################################################
  console.log("ff", filteredData)

  return (
    <div className="parking-lot-details-container">
      <h2 className="Label"> דוחות</h2>
      <h2 className="Label">{parkingLotName} חניון </h2>

      {/* navigate to the parking lot component */}
      <div className="filter-container">
        <Link to="/MyParkingLots">
          <img alt="backwards" className="backwards" src={backwards}></img>
        </Link>

        <img
          alt="Filters"
          className="filter-image"
          src={filtersImage}
          onClick={() => setShowFilters(!showFilters)}
        />
        <br />
      </div>

      {/* button for the optional filters */}
      {showFilters && (
        <div className="filter-modal">
          <div >
            <button className="close-button" onClick={() => setShowFilters(false)}>
              X
            </button>
            <label htmlFor="startDate">:מתאריך</label>
            <br />
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
            />{" "}
            <br />
            <label htmlFor="endDate">:עד תאריך</label>
            <br />
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>{" "}
          <br />
          <div>
            <label htmlFor="filterType">:מיין לפי סוג פעולה</label>
            <br />
            <select
              id="filterType"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {Array.from(
                new Set(
                  Object.values(parkingLotData).flatMap((machine) =>
                    machine.operation_details.map((operation) => operation.type)
                  )
                )
              ).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            {" "}
            <br />
            <div>
              <label>:מיין לפי שם מכונה</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    value="all"
                    checked={selectAllMachines}
                    onChange={handleMachineSelection}
                  />
                  All &nbsp;
                </label>
                {Object.values(parkingLotData).map((machine) => (
                  <label key={machine.machine_id}>
                    <input
                      type="checkbox"
                      value={machine.display_name}
                      checked={selectedMachineNames.includes(
                        machine.display_name
                      )}
                      onChange={handleMachineSelection}
                    />
                    {machine.display_name}
                    &nbsp;
                  </label>
                ))}
              </div>
            </div>
          </div>{" "}
          <br />

          {/* Buttons for search and reset */}
          <div className="button-container">
            <button
              className="search-button"
              onClick={() => {
                handleSearch();
                setShowMessage(false);
                setShowFilters(false);
              }}
            >
              Search 
            </button>
            <span className="button-separator"></span>
            <button
              className="reset-button"
              onClick={() => {
                handleReset();
                setShowFilters(false);
              }}
            >
              Reset
            </button>
          </div>
          <br />
        </div>
      )}

      {/* eport to PDF button */}
      {renderExportButton()}

      {/* display the current page and his followings */}
      <div className="pagination-container">
        {totalPages > 0 && (
          <div className="pagination">
            {currentPage !== 1 && <button onClick={handlePrevPage}>&lt;</button>}
            {renderPageNumbers()}
            {currentPage !== totalPages && (
              <button onClick={handleNextPage}>&gt;</button>
            )}
          </div>
        )}
      </div>
      <br />

      <div>{showMessage && <p id="dateMessageElement">{DateMessage}</p>}</div>

      {/* display the data or msg */}
      {Object.keys(filteredData).length === 0 ? (
        <p>אין תוצאות, אנא חפש נתונים אחרים</p>
      ) : (
        <div className="details-container">
          <table id='data-table' className="details-table">
            <thead>
              <tr>
                <th></th>
                <th>Machine name</th>
                <th>Machine ID</th>
                <th>Operation ID</th>
                <th>Type</th>
                <th>Shift id</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((operation) =>
                Object.values(filteredData).map((machine) =>
                  machine.operation_details.map(
                    (op) =>
                      op.operation_id === operation.operation_id && (
                        <React.Fragment key={op.operation_id}>
                          <tr>
                            <td>
                              {/* + button to display all the expanded data */}
                              <button
                                onClick={() =>
                                  setExpandedOperations(
                                    (prevExpandedOperations) =>
                                      prevExpandedOperations.includes(
                                        op.operation_id
                                      )
                                        ? prevExpandedOperations.filter(
                                          (id) => id !== op.operation_id
                                        )
                                        : [
                                          ...prevExpandedOperations,
                                          op.operation_id,
                                        ]
                                  )
                                }
                              >
                                {expandedOperations.includes(op.operation_id)
                                  ? "-"
                                  : "+"}
                              </button>
                            </td>
                            <td>{machine.display_name}</td>
                            <td>{machine.machine_id}</td>
                            <td>{op.operation_id}</td>
                            <td>{op.type}</td>
                            <td>{op.shift_id}</td>
                            <td>{op.date}</td>
                            <td>{op.total}</td>
                          </tr>
                          {expandedOperations.includes(op.operation_id) && (
                            <tr>
                              <td colSpan="10">
                                <table className="expanded_data">
                                  <thead>
                                    <tr>
                                      <th>Hooper ID</th>
                                      <th>Value</th>
                                      <th>Count</th>
                                      <th>Total</th>
                                      <th>Currency</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {op.hoopers.map((hooper) => (
                                      <tr key={hooper.id}>
                                        <td>{hooper.hooper_id}</td>
                                        <td>{hooper.value}</td>
                                        <td>{hooper.count}</td>
                                        <td>{hooper.total}</td>
                                        <td>{hooper.currency}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* display the current page and his followings */}
      <div className="pagination-container">
        {totalPages > 0 && (
          <div className="pagination">
            {currentPage !== 1 && <button onClick={handlePrevPage}>&lt;</button>}
            {renderPageNumbers()}
            {currentPage !== totalPages && (
              <button onClick={handleNextPage}>&gt;</button>
            )}
          </div>
        )}
      </div>
      <br />
    </div>
  );
};

export default ParkingLotDetails;
