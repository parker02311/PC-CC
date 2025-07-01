/**
 * CSV to Planet Coaster track data converter
 * 
 * This module converts No Limits 2 CSV track data to Planet Coaster Lua format.
 * It handles coordinate system transformation and orientation calculations.
 * 
 * Coordinate System Transformation:
 * - No Limits 2: Z forward, Y up, X left
 * - Target system: X forward, Y right, Z up
 * - Planet Coaster: X forward, Z up, Y right (with Y/Z swapped in output)
 * 
 * Author: Distantz, 2024
 * Edited by: Parker, 2025
 */

const GLOBAL_UP = [0, 0, 1]; // Z-up coordinate system

// Lua header
const HEADER = `
--[[
         _                _                     _                _      
        /\\ \\            /\\ \\      _           /\\ \\             /\\ \\     
       /  \\ \\          /  \\ \\    /\\_\\        /  \\ \\           /  \\ \\    
      / /\\ \\ \\        / /\\ \\ \\   \\/_/       / /\\ \\ \\         / /\\ \\ \\   
     / / /\\ \\_\\      / / /\\ \\ \\            / / /\\ \\ \\       / / /\\ \\ \\  
    / / /_/ / /     / / /  \\ \\_\\          / / /  \\ \\_\\     / / /  \\ \\_\\ 
   / / /__\\/ /     / / /    \\/_/         / / /    \\/_/    / / /    \\/_/ 
  / / /_____/     / / /            _    / / /            / / /          
 / / /           / / /________   /_/\\  / / /________    / / /________   
/ / /           / / /_________\\  \\_\\/ / / /_________\\  / / /_________\\  
\\/_/            \\/____________/       \\/____________/  \\/____________/  

Converted From CSV Using Planet Coaster : Coaster Converter

Maintainer
    Parker02311
Original Creator
    Distantz
]]

`;

/**
 * Calculate the magnitude (length) of a 3D vector
 */
function vectorMagnitude(vector) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

/**
 * Normalize a 3D vector to unit length
 */
function normalizeVector(vector) {
    const magnitude = vectorMagnitude(vector);
    if (magnitude === 0) return [0, 0, 0];
    return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude];
}

/**
 * Calculate dot product of two 3D vectors
 */
function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Calculate cross product of two 3D vectors
 */
function crossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

/**
 * Convert forward and up vectors to Euler angles (yaw, pitch, roll).
 * 
 * @param {number[]} forward - Normalized forward direction vector
 * @param {number[]} up - Normalized up direction vector
 * @returns {number[]} Array of [yaw, pitch, roll] angles in radians
 */
function vectorsToEuler(forward, up) {
    // Normalize input vectors to ensure unit length
    forward = normalizeVector(forward);
    up = normalizeVector(up);

    // Calculate yaw (rotation around Z-axis) from forward vector's X,Y components
    const yaw = Math.atan2(forward[1], forward[0]);

    // Calculate pitch (rotation around Y-axis) from forward vector's Z component
    const pitch = Math.atan2(-forward[2], Math.sqrt(forward[0] * forward[0] + forward[1] * forward[1]));

    // Calculate roll (rotation around X-axis) using cross product and dot product
    const right = crossProduct(up, forward); // Calculate right vector
    const cosRoll = dotProduct(GLOBAL_UP, up); // Cosine of roll angle
    const sign = -dotProduct(right, GLOBAL_UP); // Sign correction for roll
    const roll = Math.atan2(sign, cosRoll);

    return [yaw, pitch, roll];
}

/**
 * Apply a rotation around the Z-axis to a 3D vector.
 * 
 * This function rotates the X and Y components of the input vector by the specified angle,
 * while keeping the Z component unchanged.
 * 
 * @param {number[]} vector - Input 3D vector to rotate [x, y, z]
 * @param {number} angle - Rotation angle in radians
 * @returns {number[]} Rotated 3D vector
 */
function getRotatedVector(vector, angle) {
    // Apply 2D rotation matrix to X,Y components
    const xNew = vector[0] * Math.sin(angle) - vector[1] * Math.cos(angle);
    const yNew = vector[0] * Math.cos(angle) + vector[1] * Math.sin(angle);
    return [xNew, yNew, vector[2]];
}

/**
 * Convert position, forward, and up vectors to relative positions and yaw-pitch-roll angles.
 * 
 * This function takes a list of position, forward, and up vector tuples and converts them
 * to relative positions and Euler angles. The first point becomes the origin and reference
 * orientation for all subsequent points.
 * 
 * @param {Array} posForwardsUps - Array of [position, forward, up] vector arrays
 * @returns {Array} Array of [relative_position, yaw_pitch_roll] arrays
 */
function pfuToRelPosYpr(posForwardsUps) {
    const posYpr = [];

    // Extract the first point as reference origin and orientation
    const firstPos = posForwardsUps[0][0];
    // firstP, firstR
    const [firstY] = vectorsToEuler(posForwardsUps[0][1], posForwardsUps[0][2]);

    // Process each point relative to the first point
    for (const [pos, forward, up] of posForwardsUps) {
        // Calculate relative position from first point, rotated by first yaw
        const relativePos = [pos[0] - firstPos[0], pos[1] - firstPos[1], pos[2] - firstPos[2]];
        const relPos = getRotatedVector(relativePos, firstY);

        // Calculate Euler angles for current orientation
        const [y, p, r] = vectorsToEuler(forward, up);

        // Make yaw relative to first point's yaw
        const yprArray = [y - firstY, p, r];

        posYpr.push([relPos, yprArray]);
    }

    return posYpr;
}

/**
 * Parse CSV content to extract position, forward, and up vectors.
 * 
 * This function reads tab-delimited CSV content containing track data and extracts the
 * position coordinates and orientation vectors for each track point. It performs
 * coordinate system transformation from No Limits 2 format to the desired format.
 * 
 * No Limits 2 coordinate system: Z forward, Y up, X left
 * Target coordinate system: X forward, Y right, Z up
 * 
 * @param {string} csvContent - Content of the CSV file to parse
 * @returns {Array} Array of [position, forward, up] vector arrays for each track point
 */
function getPosForwardsUps(csvContent) {
    const posForwardsUps = [];
    const lines = csvContent.split('\n');

    // Skip the header row + first 0,0,0 pos
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = line.split('\t');
        if (row.length < 13) continue;

        // Extract position coordinates from CSV columns and transform coordinate system
        // NL2 format: row[1]=Y, row[2]=Z, row[3]=X
        // Target format: X forward (from NL2 Z), Y right (from NL2 X), Z up (from NL2 Y)
        const pos = [parseFloat(row[3]), parseFloat(row[1]), parseFloat(row[2])];

        // Extract forward vector and transform coordinate system
        // NL2 format: row[4]=Y, row[5]=Z, row[6]=X
        // Target format: forward vector transformation
        const front = [parseFloat(row[6]), parseFloat(row[4]), parseFloat(row[5])];

        // Extract up vector and transform coordinate system
        // NL2 format: row[10]=Y, row[11]=Z, row[12]=X
        // Target format: up vector transformation
        const up = [parseFloat(row[12]), parseFloat(row[10]), parseFloat(row[11])];

        posForwardsUps.push([pos, front, up]);
    }

    return posForwardsUps;
}

/**
 * Convert CSV file content to Planet Coaster Lua format
 * 
 * @param {string} csvContent - Content of the No Limits 2 CSV file
 * @param {string} originalFilename - Original filename for reference
 * @returns {string} Lua formatted track data
 */
export function convertCsvToLua(csvContent) {
    try {
        // Parse the CSV content and extract position, forward, and up vectors
        const posForwardsUps = getPosForwardsUps(csvContent);

        if (posForwardsUps.length === 0) {
            throw new Error('No valid track data found in CSV file');
        }

        console.log(`Loaded ${posForwardsUps.length} points from CSV file!`);

        // Convert absolute positions/orientations to relative positions and Euler angles
        const relPosYprs = pfuToRelPosYpr(posForwardsUps);
        console.log(`Converted ${relPosYprs.length} points to relative coordinates!`);

        const lines = [];
        // Format each point as Planet Coaster Lua table entry
        // Planet Coaster format: {pos = {x, z, y}, rot = {-yaw, pitch, roll}, twist = 0.0}
        // Note: Y and Z coordinates are swapped, and yaw is negated for Planet Coaster
        for (const [relPos, ypr] of relPosYprs) {
            lines.push(
                `{pos = {${relPos[0]}, ${relPos[2]}, ${relPos[1]}}, rot = {${-(ypr[0])}, ${ypr[1]}, ${ypr[2]}}, twist = 0.0},\n`
            );
        }

        // Build the complete Lua file content
        const luaContent = HEADER + "return {\n" + lines.join('') + "}";

        console.log(`Successfully converted track data!`);
        console.log(`File contains ${lines.length} track points ready for Planet Coaster!`);

        return luaContent;
    } catch (error) {
        console.error('Error converting CSV to Lua:', error);
        throw error;
    }
}
