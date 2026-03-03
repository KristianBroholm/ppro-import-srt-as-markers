/**
 * host/script.jsx
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var srtImporter = {
    getSequences: function() {
        var sequences = [];
        var project = app.project;
        if (project) {
            for (var i = 0; i < project.sequences.numSequences; i++) {
                var seq = project.sequences[i];
                sequences.push({
                    name: seq.name,
                    id: seq.sequenceID
                });
            }
        }
        return JSON.stringify(sequences);
    },

    confirmDialog: function(message) {
        // This uses the native ExtendScript confirm dialog
        return confirm(message);
    },

    addMarkers: function(sequenceID, markersData, colorIndex) {
        var project = app.project;
        var targetSequence = null;

        // Find the sequence by ID
        for (var i = 0; i < project.sequences.numSequences; i++) {
            if (project.sequences[i].sequenceID === sequenceID) {
                targetSequence = project.sequences[i];
                break;
            }
        }

        if (!targetSequence) {
            return "Sequence not found";
        }

        var markers = targetSequence.markers;
        var markersList = JSON.parse(markersData);
        var count = 0;

        for (var j = 0; j < markersList.length; j++) {
            var m = markersList[j];
            // Premiere Pro uses seconds for markers
            var startTime = Number(m.start);
            var duration = Number(m.duration);
            
            var newMarker = markers.createMarker(startTime);
            newMarker.name = m.text;
            newMarker.comments = m.text;
            
            // Setting the end time explicitly in seconds from sequence start
            if (duration > 0) {
                newMarker.end = startTime + duration;
            }
            
            if (colorIndex !== undefined) {
                newMarker.setColorByIndex(Number(colorIndex));
            }
            
            count++;
        }

        return "Success: " + count + " markers added.";
    }
};
