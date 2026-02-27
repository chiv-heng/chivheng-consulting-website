// ─── Configuration ──────────────────────────────────────────────────────────
var SENDER_EMAIL = 'hello@chivheng.consulting'; // Must be a send-as alias in Gmail
var SENDER_NAME = 'Chiv Heng Consulting';
var WORKSHOPS_SHEET = 'Workshops';
var SIGNUP_SHEET = 'Sign-up';
var WAITLIST_SHEET = 'Waitlist';

// ─── doGet: Return workshop sessions ────────────────────────────────────────
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WORKSHOPS_SHEET);
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return jsonResponse({ sessions: [] });
  }

  // Columns A–I: Workshop Title, Session, Date, Time, Duration, Location, Seats, Registered, Status
  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var tz = Session.getScriptTimeZone();
  var sessions = data
    .filter(function (row) {
      return row[0] !== '';
    })
    .map(function (row) {
      var title = row[0];
      var sessionLabel = row[1];
      var date = row[2] ? new Date(row[2]) : null;
      var time = row[3] instanceof Date
        ? Utilities.formatDate(row[3], tz, 'h:mm a')
        : String(row[3]);
      var duration = String(row[4]);
      var location = row[5];
      var seats = row[6];
      var registered = row[7];
      var status = row[8];

      // Build end time from time + duration for display
      var endTime = '';
      if (row[3] instanceof Date && duration) {
        var endDate = new Date(row[3].getTime());
        var durMatch = duration.match(/([\d.]+)\s*(hour|minute|min)/i);
        if (durMatch) {
          var ms = parseFloat(durMatch[1]) * (durMatch[2].toLowerCase().startsWith('min') ? 60000 : 3600000);
          endDate.setTime(endDate.getTime() + ms);
          endTime = Utilities.formatDate(endDate, tz, 'h:mm a');
        }
      }

      // Display name: "AI For Good - Thu 3/12 - 4:00 PM - 6:00 PM"
      var displayName = title;
      if (date) {
        var dayOfWeek = Utilities.formatDate(date, tz, 'EEE');
        var monthDay = Utilities.formatDate(date, tz, 'M/d');
        displayName += ' - ' + dayOfWeek + ' ' + monthDay;
      }
      if (time) {
        displayName += ' - ' + time;
        if (endTime) displayName += ' - ' + endTime;
      }

      // Unique key for COUNTIF and lookups: "title — session"
      var name = title + ' — ' + sessionLabel;

      return {
        title: title,
        session: sessionLabel,
        name: name,
        displayName: displayName,
        seats: seats,
        registered: registered,
        status: status,
        date: date ? Utilities.formatDate(date, tz, 'yyyy-MM-dd') : '',
        time: time,
        endTime: endTime,
        duration: duration,
        location: location,
      };
    });

  return jsonResponse({ sessions: sessions });
}

// ─── doPost: Handle form submissions ────────────────────────────────────────
function doPost(e) {
  try {
    var rowData = {};
    if (e.postData && e.postData.contents) {
      rowData = JSON.parse(e.postData.contents);
    }

    // Honeypot check
    if (rowData.website) {
      return jsonResponse({ result: 'success' });
    }

    var tabName = rowData.form_type || 'Interest';
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Sign-up: check capacity before accepting
    if (tabName === SIGNUP_SHEET) {
      var workshopSession = rowData.workshop;
      var sessionInfo = getSessionInfo(workshopSession);

      if (!sessionInfo) {
        return jsonResponse({ result: 'error', error: 'Session not found: ' + workshopSession });
      }

      var remaining = sessionInfo.seats - sessionInfo.registered;

      if (remaining <= 0) {
        // Add to waitlist instead
        var waitlistSheet = spreadsheet.getSheetByName(WAITLIST_SHEET);
        if (waitlistSheet) {
          waitlistSheet.appendRow([
            new Date(),
            rowData.name || '',
            rowData.email || '',
            rowData.role || '',
            rowData.organization || '',
            workshopSession,
            '',
          ]);
        }
        return jsonResponse({ result: 'waitlisted' });
      }
    }

    // Append to the appropriate sheet
    var sheet = spreadsheet.getSheetByName(tabName);
    if (!sheet) {
      return jsonResponse({ result: 'error', error: 'Tab not found: ' + tabName });
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function (header) {
      return header === 'timestamp' ? new Date() : rowData[header] || '';
    });
    sheet.appendRow(newRow);

    // Send confirmation email for sign-ups
    if (tabName === SIGNUP_SHEET && rowData.email) {
      try {
        sendConfirmationEmail(rowData, sessionInfo);
      } catch (emailErr) {
        Logger.log('Confirmation email failed: ' + emailErr.toString());
      }
    }

    return jsonResponse({ result: 'success', row: sheet.getLastRow() });
  } catch (error) {
    return jsonResponse({ result: 'error', error: error.toString() });
  }
}

// ─── Session lookup ─────────────────────────────────────────────────────────
function getSessionInfo(sessionName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WORKSHOPS_SHEET);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  // Columns A–I: Workshop Title, Session, Date, Time, Duration, Location, Seats, Registered, Status
  var tz = Session.getScriptTimeZone();
  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var name = row[0] + ' — ' + row[1];
    if (name === sessionName) {
      return {
        title: row[0],
        session: row[1],
        name: name,
        seats: row[6],
        registered: row[7],
        status: row[8],
        date: row[2] ? new Date(row[2]) : null,
        time: row[3] instanceof Date
          ? Utilities.formatDate(row[3], tz, 'h:mm a')
          : String(row[3]),
        duration: String(row[4]),
        location: String(row[5]),
      };
    }
  }
  return null;
}

// ─── Confirmation Email ─────────────────────────────────────────────────────
function sendConfirmationEmail(data, session) {
  var dateStr = session.date
    ? Utilities.formatDate(session.date, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy')
    : 'TBD';

  var subject = 'You\'re registered: ' + session.name;

  var htmlBody = buildEmailTemplate({
    heading: 'You\'re In!',
    preheader: 'Your workshop registration is confirmed.',
    body: '<p>Hi ' + escapeHtml(data.name) + ',</p>'
      + '<p>You\'re registered for <strong>' + escapeHtml(session.name) + '</strong>. Here are the details:</p>'
      + '<table style="width:100%;border-collapse:collapse;margin:20px 0;">'
      + emailDetailRow('Date', dateStr)
      + emailDetailRow('Time', session.time)
      + emailDetailRow('Duration', session.duration)
      + emailDetailRow('Location', session.location)
      + '</table>'
      + '<p>Space is intentionally small to keep things interactive. If your plans change, please let me know so someone on the waitlist can take your spot.</p>'
      + '<p>Looking forward to it,<br>Chiv</p>',
  });

  var icsBlob = generateICS(session);

  GmailApp.sendEmail(data.email, subject, '', {
    htmlBody: htmlBody,
    from: SENDER_EMAIL,
    name: SENDER_NAME,
    attachments: [icsBlob],
  });
}

// ─── Reminder Emails (run via daily time-driven trigger) ────────────────────
function sendReminderEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var workshopsSheet = ss.getSheetByName(WORKSHOPS_SHEET);
  var signupSheet = ss.getSheetByName(SIGNUP_SHEET);

  if (!workshopsSheet || !signupSheet) return;

  var now = new Date();
  var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  var dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find sessions happening in 24–48 hours
  var workshopData = workshopsSheet.getRange(2, 1, workshopsSheet.getLastRow() - 1, 9).getValues();
  var upcomingSessions = [];

  // Columns A–I: Workshop Title, Session, Date, Time, Duration, Location, Seats, Registered, Status
  var tz = Session.getScriptTimeZone();
  for (var i = 0; i < workshopData.length; i++) {
    var row = workshopData[i];
    if (!row[2] || row[8] === 'CLOSED') continue;
    var sessionDate = new Date(row[2]);
    if (sessionDate >= tomorrow && sessionDate <= dayAfter) {
      upcomingSessions.push({
        title: row[0],
        session: row[1],
        name: row[0] + ' — ' + row[1],
        date: sessionDate,
        time: row[3] instanceof Date
          ? Utilities.formatDate(row[3], tz, 'h:mm a')
          : String(row[3]),
        duration: String(row[4]),
        location: String(row[5]),
      });
    }
  }

  if (upcomingSessions.length === 0) return;

  // Get all sign-up data
  var signupData = signupSheet.getRange(2, 1, signupSheet.getLastRow() - 1, signupSheet.getLastColumn()).getValues();
  var signupHeaders = signupSheet.getRange(1, 1, 1, signupSheet.getLastColumn()).getValues()[0];

  var emailCol = signupHeaders.indexOf('email');
  var nameCol = signupHeaders.indexOf('name');
  var workshopCol = signupHeaders.indexOf('workshop');
  // Track which rows have already been reminded (using Script Properties)
  var props = PropertiesService.getScriptProperties();

  for (var s = 0; s < upcomingSessions.length; s++) {
    var session = upcomingSessions[s];
    var dateStr = Utilities.formatDate(session.date, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy');

    for (var r = 0; r < signupData.length; r++) {
      var signup = signupData[r];
      if (signup[workshopCol] !== session.name) continue;

      var email = signup[emailCol];
      var reminderKey = 'reminder_' + session.name + '_' + email;

      // Skip if already reminded
      if (props.getProperty(reminderKey)) continue;

      var name = signup[nameCol];
      var subject = 'Reminder: ' + session.name + ' is tomorrow!';

      var htmlBody = buildEmailTemplate({
        heading: 'See You Tomorrow!',
        preheader: 'Your workshop is coming up.',
        body: '<p>Hi ' + escapeHtml(name) + ',</p>'
          + '<p>This is a friendly reminder that <strong>' + escapeHtml(session.name) + '</strong> is tomorrow.</p>'
          + '<table style="width:100%;border-collapse:collapse;margin:20px 0;">'
          + emailDetailRow('Date', dateStr)
          + emailDetailRow('Time', session.time)
          + emailDetailRow('Location', session.location)
          + '</table>'
          + '<p>If you can no longer make it, please reply and let me know so I can offer your seat to someone on the waitlist.</p>'
          + '<p>See you there,<br>Chiv</p>',
      });

      try {
        GmailApp.sendEmail(email, subject, '', {
          htmlBody: htmlBody,
          from: SENDER_EMAIL,
          name: SENDER_NAME,
        });
        props.setProperty(reminderKey, 'sent');
      } catch (err) {
        Logger.log('Reminder failed for ' + email + ': ' + err.toString());
      }
    }
  }
}

// ─── Waitlist Promotion ─────────────────────────────────────────────────────
function handleWaitlistPromotion(sessionName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var waitlistSheet = ss.getSheetByName(WAITLIST_SHEET);
  if (!waitlistSheet || waitlistSheet.getLastRow() < 2) return;

  var sessionInfo = getSessionInfo(sessionName);
  if (!sessionInfo) return;

  var remaining = sessionInfo.seats - sessionInfo.registered;
  if (remaining <= 0) return;

  // Waitlist columns: timestamp, name, email, role, organization, workshop, notified
  var data = waitlistSheet.getRange(2, 1, waitlistSheet.getLastRow() - 1, 7).getValues();

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[5] !== sessionName || row[6] === 'YES') continue;

    var email = row[2];
    var name = row[1];
    var dateStr = sessionInfo.date
      ? Utilities.formatDate(sessionInfo.date, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy')
      : 'TBD';

    var subject = 'A spot opened up: ' + sessionName;

    var htmlBody = buildEmailTemplate({
      heading: 'Good News!',
      preheader: 'A spot opened up in the workshop.',
      body: '<p>Hi ' + escapeHtml(name) + ',</p>'
        + '<p>A spot just opened up in <strong>' + escapeHtml(sessionName) + '</strong>!</p>'
        + '<table style="width:100%;border-collapse:collapse;margin:20px 0;">'
        + emailDetailRow('Date', dateStr)
        + emailDetailRow('Time', sessionInfo.time)
        + emailDetailRow('Location', sessionInfo.location)
        + '</table>'
        + '<p>If you\'d like to claim this spot, please reply to this email and I\'ll get you registered.</p>'
        + '<p>— Chiv</p>',
    });

    try {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: htmlBody,
        from: SENDER_EMAIL,
        name: SENDER_NAME,
      });

      // Mark as notified (column G = index 7)
      waitlistSheet.getRange(i + 2, 7).setValue('YES');
    } catch (err) {
      Logger.log('Waitlist email failed for ' + email + ': ' + err.toString());
    }

    // Only promote one person at a time
    break;
  }
}

// ─── ICS Calendar Invite Generator ──────────────────────────────────────────
function generateICS(session) {
  var start = new Date(session.date);
  var timeParts = session.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeParts) {
    var hours = parseInt(timeParts[1]);
    var minutes = parseInt(timeParts[2]);
    var ampm = timeParts[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    start.setHours(hours, minutes, 0, 0);
  }

  // Parse duration (e.g., "2 hours", "1.5 hours", "90 minutes")
  var durationMs = 2 * 60 * 60 * 1000; // default 2 hours
  var durMatch = String(session.duration).match(/([\d.]+)\s*(hour|minute|min)/i);
  if (durMatch) {
    var val = parseFloat(durMatch[1]);
    if (durMatch[2].toLowerCase().startsWith('min')) {
      durationMs = val * 60 * 1000;
    } else {
      durationMs = val * 60 * 60 * 1000;
    }
  }

  var end = new Date(start.getTime() + durationMs);

  var ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chiv Heng Consulting//Workshop//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'DTSTART:' + formatICSDate(start),
    'DTEND:' + formatICSDate(end),
    'SUMMARY:' + session.name,
    'LOCATION:' + (session.location || ''),
    'DESCRIPTION:Workshop hosted by Chiv Heng Consulting. Questions? Email hello@chivheng.consulting',
    'STATUS:CONFIRMED',
    'UID:' + Utilities.getUuid() + '@chivheng.consulting',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return Utilities.newBlob(ics, 'text/calendar', 'workshop-invite.ics');
}

function formatICSDate(date) {
  return Utilities.formatDate(date, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
}

// ─── Email Template ─────────────────────────────────────────────────────────
function buildEmailTemplate(options) {
  return '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"></head>'
    + '<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Arial,Helvetica,sans-serif;">'
    + '<div style="display:none;max-height:0;overflow:hidden;">' + escapeHtml(options.preheader) + '</div>'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;padding:40px 20px;">'
    + '<tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;">'
    // Header bar
    + '<tr><td style="background-color:#2B4C7E;padding:24px 32px;">'
    + '<h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:600;">' + escapeHtml(options.heading) + '</h1>'
    + '</td></tr>'
    // Body
    + '<tr><td style="padding:32px;color:#333333;font-size:15px;line-height:1.6;">'
    + options.body
    + '</td></tr>'
    // Footer
    + '<tr><td style="padding:20px 32px;background-color:#F5F3F0;border-top:1px solid #E8E5E0;">'
    + '<p style="margin:0;font-size:13px;color:#888888;">Chiv Heng Consulting &middot; Rhode Island</p>'
    + '</td></tr>'
    + '</table>'
    + '</td></tr></table></body></html>';
}

function emailDetailRow(label, value) {
  return '<tr>'
    + '<td style="padding:8px 12px;border-bottom:1px solid #F0EDE8;color:#888888;font-size:13px;width:100px;">' + escapeHtml(label) + '</td>'
    + '<td style="padding:8px 12px;border-bottom:1px solid #F0EDE8;color:#333333;font-size:15px;">' + escapeHtml(value || '') + '</td>'
    + '</tr>';
}

// ─── Utilities ──────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
