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

  if (!data || data.length === 0) return;
  const matchedChickens = new Set(); // Track matched chickens
  const results = []; // Store final matches

  // Phase 1: Process exact matches first
  data?.forEach((entry) => {
    entry.chicken_entries?.forEach((chicken) => {
      const chickenKey = `${entry.entry_name}-${chicken.chickenName}`;
      if (matchedChickens.has(chickenKey)) return;

      for (const otherEntry of data) {
        if (entry.entry_name === otherEntry.entry_name) continue;

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
        if (isExcluded) continue;

        for (const otherChicken of otherEntry.chicken_entries || []) {
          const otherChickenKey = `${otherEntry.entry_name}-${otherChicken.chickenName}`;
          if (matchedChickens.has(otherChickenKey)) continue;

          const weight1 = parseFloat(chicken.weight);
          const weight2 = parseFloat(otherChicken.weight);
          if (weight1 === weight2) {
            // Add exact match to results
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

            // Mark both chickens as matched
            matchedChickens.add(chickenKey);
            matchedChickens.add(otherChickenKey);
            return; // Move to next chicken after exact match
          }
        }
      }
    });
  });

  // Phase 2: Process non-exact matches for remaining chickens
  data?.forEach((entry) => {
    entry.chicken_entries?.forEach((chicken) => {
      const chickenKey = `${entry.entry_name}-${chicken.chickenName}`;
      if (matchedChickens.has(chickenKey)) return;

      let bestMatch = null;
      let smallestDifference = Infinity;

      for (const otherEntry of data) {
        if (entry.entry_name === otherEntry.entry_name) continue;

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
        if (isExcluded) continue;

        for (const otherChicken of otherEntry.chicken_entries || []) {
          const otherChickenKey = `${otherEntry.entry_name}-${otherChicken.chickenName}`;
          if (matchedChickens.has(otherChickenKey)) continue;

          const weight1 = parseFloat(chicken.weight);
          const weight2 = parseFloat(otherChicken.weight);
          const weightDifference = Math.abs(weight1 - weight2);

          // Find the closest match within allowed difference
          if (
            weightDifference <= eventGivenTake &&
            weightDifference < smallestDifference
          ) {
            bestMatch = {
              entryName: entry.entry_name,
              ownerName: entry.owner_name,
              chickenName: chicken.chickenName || "none",
              weight: weight1,
              matchedEntryName: otherEntry.entry_name,
              matchedOwnerName: otherEntry.owner_name,
              matchedChickenName: otherChicken.chickenName || "none",
              matchedWeight: weight2,
            };
            smallestDifference = weightDifference;
          }
        }
      }

      if (bestMatch) {
        results.push({
          fightNumber: results.length + 1,
          ...bestMatch,
        });

        // Mark both chickens as matched
        matchedChickens.add(chickenKey);
        matchedChickens.add(
          `${bestMatch.matchedEntryName}-${bestMatch.matchedChickenName}`
        );
      } else {
        // No match found, mark as standby
        results.push({
          fightNumber: results.length + 1,
          entryName: `${entry.entry_name} (standby)`,
          ownerName: entry.owner_name,
          chickenName: chicken.chickenName || "none",
          weight: parseFloat(chicken.weight),
          matchedEntryName: null,
          matchedOwnerName: null,
          matchedChickenName: null,
          matchedWeight: null,
        });
      }
    });
  });

  // const matchedChickens = new Set(); // Track matched chickens
  // const results = []; // Store final matches

  // data?.forEach((entry) => {
  //   entry.chicken_entries?.forEach((chicken) => {
  //     const chickenKey = `${entry.entry_name}-${chicken.chickenName}`;

  //     // Skip if already matched
  //     if (matchedChickens.has(chickenKey)) return;

  //     let bestMatch = null;
  //     let smallestDifference = Infinity;

  //     // Keep track of an exact match if found
  //     let exactMatchFound = false;

  //     outerLoop: for (const otherEntry of data) {
  //       if (entry.entry_name === otherEntry.entry_name) continue; // Prevent self-matching

  //       const isExcluded = excludedPairs?.some((pair) =>
  //         pair.excluded.some(
  //           (ex) =>
  //             (ex.entry1 === entry.entry_name &&
  //               ex.entry2 === otherEntry.entry_name) ||
  //             (ex.entry1 === otherEntry.entry_name &&
  //               ex.entry2 === entry.entry_name)
  //         )
  //       );

  //       if (isExcluded) continue;

  //       for (const otherChicken of otherEntry.chicken_entries || []) {
  //         const otherChickenKey = `${otherEntry.entry_name}-${otherChicken.chickenName}`;

  //         if (matchedChickens.has(otherChickenKey)) continue;

  //         const weight1 = parseFloat(chicken.weight);
  //         const weight2 = parseFloat(otherChicken.weight);
  //         const weightDifference = Math.abs(weight1 - weight2);

  //         // Handle exact match immediately
  //         if (weightDifference === 0) {
  //           bestMatch = {
  //             entryName: entry.entry_name,
  //             ownerName: entry.owner_name,
  //             chickenName: chicken.chickenName || "none",
  //             weight: weight1,
  //             matchedEntryName: otherEntry.entry_name,
  //             matchedOwnerName: otherEntry.owner_name,
  //             matchedChickenName: otherChicken.chickenName || "none",
  //             matchedWeight: weight2,
  //           };

  //           // Mark both chickens as matched immediately
  //           matchedChickens.add(chickenKey);
  //           matchedChickens.add(otherChickenKey);

  //           results.push({
  //             fightNumber: results.length + 1,
  //             ...bestMatch,
  //           });

  //           exactMatchFound = true;
  //           break outerLoop; // Stop searching entirely for this chicken
  //         }

  //         // Update the best match if no exact match is found
  //         if (
  //           weightDifference <= eventGivenTake &&
  //           weightDifference < smallestDifference
  //         ) {
  //           bestMatch = {
  //             entryName: entry.entry_name,
  //             ownerName: entry.owner_name,
  //             chickenName: chicken.chickenName || "none",
  //             weight: weight1,
  //             matchedEntryName: otherEntry.entry_name,
  //             matchedOwnerName: otherEntry.owner_name,
  //             matchedChickenName: otherChicken.chickenName || "none",
  //             matchedWeight: weight2,
  //           };

  //           smallestDifference = weightDifference;
  //         }
  //       }
  //     }

  //     if (!exactMatchFound && bestMatch) {
  //       results.push({
  //         fightNumber: results.length + 1,
  //         ...bestMatch,
  //       });

  //       // Mark both chickens as matched
  //       matchedChickens.add(chickenKey);
  //       matchedChickens.add(
  //         `${bestMatch.matchedEntryName}-${bestMatch.matchedChickenName}`
  //       );
  //     } else if (!bestMatch) {
  //       results.push({
  //         fightNumber: results.length + 1,
  //         entryName: `${entry.entry_name} (standby)`,
  //         ownerName: entry.owner_name,
  //         chickenName: chicken.chickenName || "none",
  //         weight: parseFloat(chicken.weight),
  //         matchedEntryName: null,
  //         matchedOwnerName: null,
  //         matchedChickenName: null,
  //         matchedWeight: null,
  //       });
  //     }
  //   });
  // });
  let results2 = [...results];
  // rearrange results2
  function rearrangeMatches(results) {
    const entryGroups = {};
    const rearrangedResults = [];

    results.forEach((match) => {
      const entryName = match.entryName;
      if (!entryGroups[entryName]) entryGroups[entryName] = [];
      entryGroups[entryName].push(match);
    });

    const entries = Object.keys(entryGroups);

    let attempts = 0; // Safeguard to prevent infinite loops

    while (Object.values(entryGroups).some((group) => group.length > 0)) {
      let entryAdded = false;

      for (const entry of entries) {
        if (
          entryGroups[entry]?.length > 0 &&
          !recentEntries(rearrangedResults, entry, 9)
        ) {
          rearrangedResults.push(entryGroups[entry].shift());
          entryAdded = true;
          break;
        }
      }

      if (!entryAdded) {
        const fallbackEntry = entries.find(
          (entry) => entryGroups[entry]?.length > 0
        );
        if (fallbackEntry) {
          rearrangedResults.push(entryGroups[fallbackEntry].shift());
        }
      }

      // Prevent potential infinite loops
      if (++attempts > results.length * 2) break;
    }

    return rearrangedResults;
  }

  function recentEntries(results, entryName, gap) {
    const start = Math.max(0, results.length - gap);
    for (let i = start; i < results.length; i++) {
      if (results[i].entryName === entryName) {
        return true;
      }
    }
    return false;
  }

  results2 = rearrangeMatches([...results]);
  results2.forEach((match, index) => {
    match.fightNumber = index + 1;
  });

  //original
  // const matchedChickens = new Set(); // Track matched chickens
  // const results = []; // Store final matches

  // data?.forEach((entry) => {
  //   entry.chicken_entries?.forEach((chicken) => {
  //     const chickenKey = `${entry.entry_name}-${chicken.chickenName}`;

  //     // Skip if already matched
  //     if (matchedChickens.has(chickenKey)) return;

  //     let bestMatch = null; // Store the best match (smallest weight difference)
  //     let smallestDifference = Infinity; // Track the smallest weight difference

  //     // Iterate through all other entries and chickens to find the best match
  //     for (const otherEntry of data) {
  //       if (entry.entry_name === otherEntry.entry_name) continue; // Skip self

  //       // Check if the pair is excluded
  //       const isExcluded = excludedPairs?.some((pair) =>
  //         pair.excluded.some(
  //           (ex) =>
  //             (ex.entry1 === entry.entry_name &&
  //               ex.entry2 === otherEntry.entry_name) ||
  //             (ex.entry1 === otherEntry.entry_name &&
  //               ex.entry2 === entry.entry_name)
  //         )
  //       );

  //       if (isExcluded) continue; // Skip excluded pair

  //       for (const otherChicken of otherEntry.chicken_entries || []) {
  //         const otherChickenKey = `${otherEntry.entry_name}-${otherChicken.chickenName}`;

  //         // Skip if already matched
  //         if (matchedChickens.has(otherChickenKey)) continue;

  //         const weight1 = parseFloat(chicken.weight);
  //         const weight2 = parseFloat(otherChicken.weight);
  //         const weightDifference = Math.abs(weight1 - weight2);

  //         // Check if the weight difference is within the allowed limit
  //         if (
  //           weightDifference <= eventGivenTake &&
  //           weightDifference < smallestDifference
  //         ) {
  //           // Update the best match
  //           bestMatch = {
  //             entryName: entry.entry_name,
  //             ownerName: entry.owner_name,
  //             chickenName: chicken.chickenName || "none",
  //             weight: weight1,
  //             matchedEntryName: otherEntry.entry_name,
  //             matchedOwnerName: otherEntry.owner_name,
  //             matchedChickenName: otherChicken.chickenName || "none",
  //             matchedWeight: weight2,
  //           };

  //           smallestDifference = weightDifference; // Update the smallest difference
  //           //exit outer loop early if an exact match is found
  //           if (smallestDifference === 0) break;
  //         }
  //       }
  //     }

  //     // If a best match is found, add it to the results
  //     if (bestMatch) {
  //       results.push({
  //         fightNumber: results.length + 1,
  //         ...bestMatch,
  //       });

  //       // Mark both chickens as matched
  //       matchedChickens.add(chickenKey);
  //       matchedChickens.add(
  //         `${bestMatch.matchedEntryName}-${bestMatch.matchedChickenName}`
  //       );
  //     } else {
  //       // If no match is found, mark as standby
  //       results.push({
  //         fightNumber: results.length + 1,
  //         entryName: `${entry.entry_name} (standby)`,
  //         ownerName: entry.owner_name,
  //         chickenName: chicken.chickenName || "none",
  //         weight: parseFloat(chicken.weight),
  //         matchedEntryName: null,
  //         matchedOwnerName: null,
  //         matchedChickenName: null,
  //         matchedWeight: null,
  //       });
  //     }
  //   });
  // });

  const shuffleResults = (results) => {
    const shuffled = [...results];

    // Fisher-Yates shuffle with a check for consecutive entryName duplicates
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));

      // Swap the elements
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Check for consecutive duplicates and reshuffle if necessary
    for (let i = 1; i < shuffled.length; i++) {
      if (shuffled[i].entryName === shuffled[i - 1].entryName) {
        // Find a swap candidate that breaks the consecutive pattern
        let swapIndex = i;
        while (
          swapIndex < shuffled.length &&
          shuffled[swapIndex].entryName === shuffled[i - 1].entryName
        ) {
          swapIndex++;
        }
        if (swapIndex < shuffled.length) {
          [shuffled[i], shuffled[swapIndex]] = [
            shuffled[swapIndex],
            shuffled[i],
          ];
        }
      }
    }

    return shuffled;
  };

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
    const shuffledResults = shuffleResults(results);

    // Prepare the results for export with correct field names
    const formattedResults = results2.map((result) => ({
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
            results2.map((result, index) => (
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
