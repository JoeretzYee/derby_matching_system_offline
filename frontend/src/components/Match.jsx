import React, { useEffect, useState } from "react";
import axiosInstance from "../axios";
import formatDateMatching from "../utils/FormatDateMatch";
import * as XLSX from "xlsx";

function Match({ data, eventId, type, eventGivenTake, date, eventName }) {
  const [excludedPairs, setExcludedPairs] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/excluded/?event_id=${eventId}`).then((response) => {
      setExcludedPairs(response.data);
    });
  }, []);

  console.log(`Match exludedpairs: ${excludedPairs.length}`);

  if (!data || data.length === 0) return;
  const matchedChickens = new Set();
  const results = [];

  data?.forEach((entry) => {
    entry.chicken_entries?.forEach((chicken) => {
      const chickenKey = `${entry.entry_name}-${chicken.chickenName}`; // Use chickenName for uniqueness
      if (matchedChickens.has(chickenKey)) return; // Skip if already matched

      let isMatched = false;

      for (const otherEntry of data) {
        if (entry.entry_name === otherEntry.entry_name) continue; // Skip matching with itself

        // Check if the pair is excluded
        const isExcluded = excludedPairs?.some((pair) =>
          pair.excluded.some(
            (ex) =>
              (ex.entry1 === entry.entry_name &&
                ex.entry2 === otherEntry.entry_name) ||
              (ex.entry1 === otherEntry.entry_name &&
                ex.entry2 === entry.entry_name)
          )
        );

        if (isExcluded) continue; // Skip excluded pair

        for (const otherChicken of otherEntry.chicken_entries || []) {
          const otherChickenKey = `${otherEntry.entry_name}-${otherChicken.chickenName}`; // Use chickenName for uniqueness
          if (matchedChickens.has(otherChickenKey)) continue; // Skip if already matched

          const weight1 = parseFloat(chicken.weight);
          const weight2 = parseFloat(otherChicken.weight);
          const weightDifference = Math.abs(weight1 - weight2);

          if (weightDifference <= eventGivenTake) {
            // Create a match
            results.push({
              fightNumber: results.length + 1,
              entryName: entry.entry_name,
              ownerName: entry.owner_name,
              chickenName: chicken.chickenName || "none",
              weight: weight1,
              matchedEntryName: otherEntry.entry_name,
              matchedOwnerName: otherEntry.owner_name,
              matchedChickenName: otherChicken.chickenName || "none",
              matchedWeight: weight2,
            });

            matchedChickens.add(chickenKey);
            matchedChickens.add(otherChickenKey);
            isMatched = true;
            break; // Exit inner loop when match is found
          }
        }

        if (isMatched) break; // Exit outer loop if a match is found
      }

      // If no match was found, mark as standby
      if (!isMatched) {
        results.push({
          fightNumber: results.length + 1,
          entryName: `${entry.entry_name} (standby)`,
          ownerName: entry.owner_name,
          chickenName: chicken.chickenName || "none",
          weight: parseFloat(chicken.weight),
          matchedEntryName: "",
          matchedOwnerName: "",
          matchedChickenName: "",
          matchedWeight: "",
        });
      }
    });
  });
  //export to excel
  const exportToExcel = () => {
    const formattedDate = formatDateMatching(date);
    // Event details (without "Promoted by" for now)
    const eventDetails = [
      { label: "Event Name", value: `${eventName}` },
      { label: "Location", value: "Nabunturan Super Sports Center" },
      { label: "Date", value: formattedDate },
      { label: "Type", value: type },
      { label: `${type} Fight List`, value: "" },
    ];

    // Prepare event details as an array of arrays for Excel formatting
    const eventHeader = eventDetails.map((item) => [item.label, item.value]);

    // Define custom headers for the table format
    const headers = [
      "Fight #",
      "Entry Name",
      "Owner Name",
      "Wing/Leg #",
      "Weight",
      "Matched Entry Name",
      "Matched Owner Name",
      "Matched Wing/Leg #",
      "Matched Weight",
    ];

    // Prepare the results for export with correct field names
    const formattedResults = results.map((result) => ({
      fightNumber: result.fightNumber,
      entryName: result.entryName,
      ownerName: result.ownerName,
      chickenName: result.chickenName,
      weight: result.weight,
      matchedEntryName: result.matchedEntryName,
      matchedOwnerName: result.matchedOwnerName,
      matchedChickenName: result.matchedChickenName,
      matchedWeight: result.matchedWeight,
    }));

    // Create the Excel sheet and add event details at the top
    const ws = XLSX.utils.aoa_to_sheet(eventHeader);

    // Add a blank row after the event details for spacing
    const blankRow = new Array(headers.length).fill(""); // Empty row for spacing
    XLSX.utils.sheet_add_aoa(ws, [blankRow], { origin: -1 });

    // Add the table headers below the event details
    const headerRow = [headers];
    XLSX.utils.sheet_add_aoa(ws, headerRow, { origin: -1 });

    // Add the formatted match results below the table headers
    XLSX.utils.sheet_add_json(ws, formattedResults, {
      origin: -1,
      skipHeader: true,
    });

    // Add a blank row after the match results for spacing
    XLSX.utils.sheet_add_aoa(ws, [blankRow], { origin: -1 });

    // Add the "Promoted by" section after the table list
    const promotedBy = [["Promoted by", "Boss Jing"]];
    XLSX.utils.sheet_add_aoa(ws, promotedBy, { origin: -1 });

    // Calculate column widths based on the content (headers and data)
    const columnWidths = headers.map((header, index) => {
      // Initialize width as the length of the header text
      let maxWidth = header.length;

      // Check the corresponding column in results
      formattedResults.forEach((result) => {
        const value = String(result[Object.keys(result)[index]]);
        if (value.length > maxWidth) {
          maxWidth = value.length; // Update if a longer value is found
        }
      });

      return { wch: maxWidth + 2 }; // Adding extra space for flexibility
    });

    // Apply column widths to the sheet
    ws["!cols"] = columnWidths;

    // Create a new workbook and append the sheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Results`);

    // Write the workbook to a file
    XLSX.writeFile(wb, `${type}_match_results.xlsx`);
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-end ">
        <button className="btn btn-sm btn-success " onClick={exportToExcel}>
          Generate
        </button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Fight #</th>
            <th>Entry Name</th>
            <th>Owner Name</th>
            <th>Wing/Leg #</th>
            <th>Weight</th>
            <th>Matched Entry Name</th>
            <th>Matched Owner Name</th>
            <th>Matched Wing/Leg #</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No {type} Fight Included in the Event
              </td>
            </tr>
          ) : (
            results.map((result, index) => (
              <tr key={index}>
                <td>{result.fightNumber}</td>
                <td>{result.entryName}</td>
                <td>{result.ownerName}</td>
                <td>{result.chickenName}</td>
                <td>{result.weight}</td>
                <td>{result.matchedEntryName}</td>
                <td>{result.matchedOwnerName}</td>
                <td>{result.matchedChickenName}</td>
                <td>{result.matchedWeight}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

export default Match;
