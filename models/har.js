// Third party modules
const moment = require('moment');
const fetch = require('node-fetch');
const format = require('pg-format');
// User defined module
const db = require('../db/db'); // holds database pool connnection

class Har {
  static async process(data) {
    let har = data;
    let entries = har.entries;

    for (let entry of entries) {
      // Sanitize Content-Type
      // For Content-Type keep only the first part
      // Request
      if (entry.requestContentType) {
        let requestContentType = entry.requestContentType;
        entry.requestContentType = requestContentType.split(',')[0];
      }
      // Response
      if (entry.responseContentType) {
        let responseContentType = entry.responseContentType;
        entry.responseContentType = responseContentType.split(',')[0];
      }

      // Get cache-control directives
      // Request
      if (entry.requestCacheControl) {
        let str = entry.requestCacheControl;
        const words = str.split(',');

        // Initialize entries
        entry['requestMaxAge'] = null;
        entry['requestMaxStale'] = null;
        entry['requestMinFresh'] = null;
        entry['requestNoCache'] = false;
        entry['requestNoStore'] = false;

        for (let elem of words) {
          if (elem.includes('=')) {
            const words = elem.split('=');
            if (words.includes('max-age')) {
              entry['requestMaxAge'] = parseInt(words[1]);
            } else if (words.includes('max-stale')) {
              entry['requestMaxStale'] = parseInt(words[1]);
            } else if (words.includes('min-fresh')) {
              entry['requestMinFresh'] = parseInt(words[1]);
            }
          } else {
            // Check for no-cache directive
            if (elem.includes('no-cache')) {
              entry['requestNoCache'] = true;
            }
            // Check for no-store directive
            if (elem.includes('no-store')) {
              entry['requestNoStore'] = true;
            }
          }
        }
      }
      // Response
      if (entry.responseCacheControl) {
        const str = entry.responseCacheControl;
        const words = str.split(',');

        // Initialize entries
        entry['responseMaxAge'] = null;
        entry['responseNoCache'] = false;
        entry['responseNoStore'] = false;
        entry['responsePublic'] = false;
        entry['responsePrivate'] = false;

        for (let elem of words) {
          if (elem.includes('=')) {
            const words = elem.split('=');
            if (words.includes('max-age')) {
              entry['responseMaxAge'] = parseInt(words[1]);
            }
          } else {
            // Check for no-cache directive
            if (elem === 'no-cache') {
              entry['responseNoCache'] = true;
            }
            // Check for no-store directive
            if (elem === 'no-store') {
              entry['responseNoStore'] = true;
            }
            // Check for public directive
            if (elem === 'public') {
              entry['responsePublic'] = true;
            }
            // Check for private directive
            if (elem === 'private') {
              entry['responsePrivate'] = true;
            }
          }
        }
      }
    }

    const ipAddresses = []; // Array that contains all server IP addresses

    for (const entry of entries) {
      ipAddresses.push(entry.serverIPAddress);
    }

    // Get array with unique ip addresses
    const uniqueIpAddresses = Array.from(new Set(ipAddresses));
    // Object that maps each unique ip address to their lat an lon values
    let ipAddressLatLon = {};

    if (true) {
      // Switch geo-ip API on/off
      for (const ipAddress of uniqueIpAddresses) {
        try {
          let result = await fetch(
            `https://api.ipdata.co/${ipAddress}?api-key=850bbb9d5e09fa94e97510e0d725e3cad6a795ddfa74315a4ec28f1a`
          );

          let data = await result.json();

          ipAddressLatLon[ipAddress] = {
            lat: data.latitude,
            lon: data.longitude,
          };

          if (
            Object.keys(ipAddressLatLon).length === uniqueIpAddresses.length
          ) {
            for (let entry of entries) {
              for (const ipAddress in ipAddressLatLon) {
                if (entry.serverIPAddress === ipAddress) {
                  entry['serverLat'] = ipAddressLatLon[ipAddress].lat;
                  entry['serverLon'] = ipAddressLatLon[ipAddress].lon;
                }
              }
            }

            return har;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  static async upload(data, userId) {
    let entries = data.entries;

    const entryArr = [];
    const requestArr = [];
    const responseArr = [];

    for (let entry of entries) {
      if (entry.serverIPAddress !== '') {
        // Entry array
        // Check for empty values
        // entry.startedDateTime = new Date(entry.startedDateTime);
        entryArr.push([
          moment(entry.startedDateTime).utc().toISOString(),
          entry.serverIPAddress,
          entry.wait,
          data.userISP,
          data.userCity,
          data.userLat,
          data.userLon,
          entry.serverLat,
          entry.serverLon,
          moment().utc().toISOString(), // get current datetime in UTC format
          userId,
        ]);

        // Request array
        // Check for empty values
        entry['requestContentType'] = entry.requestContentType
          ? entry.requestContentType
          : null;
        entry['requerstMaxAge'] = entry.requerstMaxAge
          ? entry.requerstMaxAge
          : null;
        entry['requestPragma'] = entry.requestPragma
          ? entry.requestPragma
          : null;
        entry['requestHost'] = entry.requestHost ? entry.requestHost : null;
        entry['requestMaxStale'] = entry.requestMaxStale
          ? entry.requestMaxStale
          : null;
        entry['requestMinFresh'] = entry.requestMinFresh
          ? entry.requestMinFresh
          : null;
        entry['requestHost'] = entry.requestHost ? entry.requestHost : null;
        entry['requestNoCache'] = entry.requestNoCache
          ? entry.requestNoCache
          : null;
        entry['requestNoStore'] = entry.requestNoStore
          ? entry.requestNoStore
          : null;
        entry['requestMethod'] = entry.requestMethod
          ? entry.requestMethod
          : null;

        requestArr.push([
          entry.requestContentType,
          entry.requerstMaxAge,
          entry.requestPragma,
          entry.requestHost,
          entry.requestMaxStale,
          entry.requestMinFresh,
          entry.requestNoCache,
          entry.requestNoStore,
          entry.requestMethod,
        ]);

        // Response array
        // Check for empty values
        entry['responseContentType'] = entry.responseContentType
          ? entry.responseContentType
          : null;
        entry['responseStatusText'] =
          entry.responseStatusText !== '' ? entry.responseStatusText : null;
        entry['responseMaxAge'] = entry.responseMaxAge
          ? entry.responseMaxAge
          : null;
        entry['responseNoCache'] = entry.responseNoCache
          ? entry.responseNoCache
          : null;
        entry['responseNoStore'] = entry.responseNoStore
          ? entry.responseNoStore
          : null;
        entry['responsePublic'] = entry.responsePublic
          ? entry.responsePublic
          : null;
        entry['responsePrivate'] = entry.responsePrivate
          ? entry.responsePrivate
          : null;
        entry['responseExpires'] = entry.responseExpires
          ? entry.responseExpires
          : null;
        entry['responseAge'] = entry.responseAge ? entry.responseAge : null;
        entry['responseLastModified'] = entry.responseLastModified
          ? entry.responseLastModified
          : null;

        responseArr.push([
          entry.responseStatus,
          entry.responseStatusText,
          entry.responseContentType,
          entry.responseMaxAge,
          entry.responseNoCache,
          entry.responseNoStore,
          entry.responsePublic,
          entry.responsePrivate,
          moment(entry.responseExpires, 'ddd, DD MMM YYYY HH:mm:ss')
            .utc()
            .toISOString(),
          entry.responseAge,
          moment(entry.responseLastModified, 'ddd, DD MMM YYYY HH:mm:ss')
            .utc()
            .toISOString(),
        ]);
      }
    }

    const client = await db.connect();
    try {
      // INSERT into entries table
      const sqlEntries = format(
        `INSERT INTO entries (started_datetime, server_ip_address, wait, isp, user_city, user_lat, user_lon, server_lat, server_lon, created_at,user_id)
        VALUES %L
        RETURNING id`,
        entryArr
      );
      let res = await client.query(sqlEntries);

      // INSERT into requests table
      // Add foreign key to last table column
      for (let i = 0; i < res.rowCount; i++) {
        requestArr[i].unshift(res.rows[i].id);
      }
      const sqlRequests = format(
        `INSERT INTO requests (entry_id, content_type, max_age, pragma, host, max_stale, min_fresh, no_cache, no_store, method)
        VALUES %L
        RETURNING entry_id`,
        requestArr
      );
      res = await client.query(sqlRequests);

      // INSERT into responses table
      // Add foreign key to last table column
      for (let i = 0; i < res.rowCount; i++) {
        responseArr[i].unshift(res.rows[i].entry_id);
      }
      const sqlResponses = format(
        `INSERT INTO responses (entry_id, status, status_text, content_type, max_age, no_cache, no_store, public, private, expires, age, last_modified)
        VALUES %L
        RETURNING entry_id`,
        responseArr
      );
      res = await client.query(sqlResponses);

      return true;
    } finally {
      client.release();
    }
  }
}

module.exports = Har;
