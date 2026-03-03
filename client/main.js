/**
 * client/main.js
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

const csInterface = new CSInterface();

document.addEventListener('DOMContentLoaded', () => {
    const seqSelect = document.getElementById('sequenceSelect');
    const refreshBtn = document.getElementById('refreshSequences');
    const importBtn = document.getElementById('importBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const srtFileInput = document.getElementById('srtFile');
    const statusDiv = document.getElementById('status');

    function showStatus(msg, isError = false) {
        statusDiv.innerText = msg;
        statusDiv.style.color = isError ? '#ff4d4d' : '#4dff88';
    }

    // Check if we just reloaded
    if (sessionStorage.getItem('panelReloaded') === 'true') {
        showStatus('Panel reloaded.');
        sessionStorage.removeItem('panelReloaded');
    }

    function loadSequences() {
        showStatus('Loading sequences...');
        csInterface.evalScript('srtImporter.getSequences()', (result) => {
            try {
                if (result === "EvalScript error.") {
                    showStatus('Error: EvalScript failed. Make sure a project is open.', true);
                    return;
                }
                const sequences = JSON.parse(result);
                seqSelect.innerHTML = '';
                
                if (sequences.length === 0) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.innerText = 'No sequences in project';
                    seqSelect.appendChild(opt);
                } else {
                    sequences.forEach(seq => {
                        const opt = document.createElement('option');
                        opt.value = seq.id;
                        opt.innerText = seq.name;
                        seqSelect.appendChild(opt);
                    });
                    showStatus('Sequences loaded.');
                }
            } catch (e) {
                showStatus('Error loading sequences: ' + e.message, true);
                console.error("Result was:", result);
            }
        });
    }

    function timeToSeconds(timeStr) {
        // SRT format: HH:MM:SS,mmm
        const parts = timeStr.trim().replace(',', '.').split(':');
        const h = parseFloat(parts[0]) || 0;
        const m = parseFloat(parts[1]) || 0;
        const s = parseFloat(parts[2]) || 0;
        return (h * 3600) + (m * 60) + s;
    }

    function parseSRT(data) {
        // Normalize newlines and split by double newline
        const normalizedData = data.replace(/\r\n/g, '\n').trim();
        const blocks = normalizedData.split(/\n\n+/);
        const markers = [];

        blocks.forEach(block => {
            const lines = block.split('\n');
            let timeLine = "";
            let textStartIdx = 0;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('-->')) {
                    timeLine = lines[i];
                    textStartIdx = i + 1;
                    break;
                }
            }

            if (timeLine) {
                const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
                if (timeMatch) {
                    const start = timeToSeconds(timeMatch[1]);
                    const end = timeToSeconds(timeMatch[2]);
                    const text = lines.slice(textStartIdx).join(' ').trim();
                    
                    if (text || start !== end) {
                        markers.push({
                            start: start,
                            duration: Math.max(0, end - start),
                            text: text || "Subtitle"
                        });
                    }
                }
            }
        });
        return markers;
    }

    refreshBtn.addEventListener('click', loadSequences);
    
    reloadBtn.addEventListener('click', () => {
        sessionStorage.setItem('panelReloaded', 'true');
        location.reload();
    });

    importBtn.addEventListener('click', () => {
        const file = srtFileInput.files[0];
        const sequenceID = seqSelect.value;
        const colorIndex = document.getElementById('colorSelect').value;

        if (!file) {
            showStatus('Select an SRT file first!', true);
            return;
        }

        if (!sequenceID) {
            showStatus('Select a sequence!', true);
            return;
        }

        // Verify filename matches sequence name using native confirm dialog
        const sequenceName = seqSelect.options[seqSelect.selectedIndex].text;
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

        if (fileName !== sequenceName) {
            const confirmMsg = "The SRT filename ('" + fileName + "') does not match the sequence name ('" + sequenceName + "').\n\nDo you want to continue?";
            // Escape for ExtendScript
            const escapedMsg = confirmMsg.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
            const confirmScript = "srtImporter.confirmDialog('" + escapedMsg + "')";
            
            csInterface.evalScript(confirmScript, (result) => {
                // ExtendScript confirm returns boolean true/false, which evalScript returns as string "true"/"false"
                if (result === "true") {
                    startImport(file, sequenceID, colorIndex);
                } else if (result === "EvalScript error." || result === "undefined") {
                    // Fallback to browser confirm if ExtendScript fails
                    if (confirm(confirmMsg)) {
                        startImport(file, sequenceID, colorIndex);
                    }
                }
            });
        } else {
            startImport(file, sequenceID, colorIndex);
        }
    });

    function startImport(file, sequenceID, colorIndex) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const markers = parseSRT(content);

            if (markers.length === 0) {
                showStatus('Error: SRT file is empty or in wrong format.', true);
                return;
            }

            showStatus('Importing ' + markers.length + ' markers...');
            
            // Escape single quotes for ExtendScript string passing
            const markersJson = JSON.stringify(markers).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const script = "srtImporter.addMarkers('" + sequenceID + "', '" + markersJson + "', " + colorIndex + ")";
            
            csInterface.evalScript(script, (result) => {
                showStatus(result);
            });
        };
        reader.readAsText(file);
    }

    // Initial load
    setTimeout(loadSequences, 1000); // Wait a bit for CSInterface to be ready
});
