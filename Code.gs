/**
 * ==========================================================================
 * RESIDENT-VERSE : GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Handles incoming POST requests from the Resident-Verse web app
 * and automatically logs each resident profile into a Google Sheet.
 * ==========================================================================
 */

// Global Sheet Configuration
const SHEET_NAME = "Resident Responses";

/**
 * Main HTTP POST handler for Google Apps Script Web App
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Acquire lock for up to 10 seconds to prevent race conditions & duplicate rows
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse("error", "Server busy. Please try again.");
  }

  try {
    const sheet = getOrCreateSheet();
    let data;

    // Parse incoming JSON body or Form data
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error("No data payload received.");
    }

    // Format & sanitize incoming data values
    const timestamp = new Date();
    const name = sanitize(data.name);
    const preferredName = sanitize(data.preferredName);
    const hometown = sanitize(data.hometown);
    const major = sanitize(data.major);
    const year = sanitize(data.year);
    const classThought = sanitize(data.classThought);
    const organizations = sanitize(data.organizations);
    
    // Process Array values safely (e.g. Interests, Event Preferences)
    const interests = Array.isArray(data.interests) ? data.interests.join(", ") : sanitize(data.interests);
    const otherHobby = sanitize(data.otherHobby);
    const eventPreferences = Array.isArray(data.eventPreferences) ? data.eventPreferences.join(", ") : sanitize(data.eventPreferences);
    const eventSuggestion = sanitize(data.eventSuggestion);
    const additionalMessage = sanitize(data.additionalMessage);

    // Append single new row to Google Sheet
    sheet.appendRow([
      timestamp,
      name,
      preferredName,
      hometown,
      major,
      year,
      classThought,
      organizations,
      interests,
      otherHobby,
      eventPreferences,
      eventSuggestion,
      additionalMessage
    ]);

    return createJsonResponse("success", "Resident profile logged successfully.");

  } catch (error) {
    return createJsonResponse("error", error.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to ensure headers exist and return the target worksheet
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Create Header Row if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Name",
      "Preferred Name",
      "Hometown",
      "Major",
      "Year",
      "Class Thought",
      "Clubs / Orgs / Sports / Jobs",
      "Interests",
      "Other Hobbies",
      "Preferred Community Events",
      "Event Suggestion",
      "Anything Else"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#121420").setFontColor("#00f0ff");
  }

  return sheet;
}

/**
 * Sanitize helper to prevent "undefined" or null values in sheet
 */
function sanitize(val) {
  if (val === undefined || val === null || val === "undefined" || val === "null") {
    return "";
  }
  return String(val).trim();
}

/**
 * JSON Response Formatter with CORS headers
 */
function createJsonResponse(status, message) {
  const response = {
    status: status,
    message: message,
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional GET handler for testing endpoint in browser
 */
function doGet(e) {
  return createJsonResponse("online", "Resident-Verse Apps Script Backend is Active.");
}
