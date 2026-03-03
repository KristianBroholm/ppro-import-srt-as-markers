# SRT to Markers for Premiere Pro

A lightweight Adobe Premiere Pro extension designed to quickly import `.srt` subtitle files as markers onto a sequence timeline.

## Features

- **Automated Parsing:** Converts standard SRT timecode and text into sequence markers.
- **Duration Support:** Accurately sets marker duration to match the length of the subtitle block.
- **Color Customization:** Choose from all 8 standard Premiere Pro marker colors (Green, Red, Purple, Orange, Yellow, White, Blue, Cyan).
- **Intelligent Validation:**
  - Automatically lists all sequences in the current project.
  - Compares SRT filename with the selected sequence name and issues a **native Premiere Pro confirmation prompt** if they don't match.
- **Robust Labeling:** Subtitle text is applied to both the marker **Name** and **Comments** for maximum visibility in the timeline and Markers panel.
- **Developer Friendly:** Includes "Refresh" and "Reload Panel" buttons for quick UI updates and debugging.

## Usage

1. **Open the Extension:** Go to `Window > Extensions > SRT to Markers`.
2. **Select Sequence:** Pick the target sequence from the dropdown menu. Use the **Refresh** button if you've recently added new sequences to the project.
3. **Choose SRT File:** Select your `.srt` file.
4. **Select Color:** Pick the desired marker color.
5. **Import:** Click **Import as markers**. 
   - If the filename doesn't match the sequence name, you will be prompted to confirm.
6. **Verify:** Your markers will appear on the selected sequence at the exact timecodes specified in the SRT.

## Technical Details

- **Frontend:** HTML5, CSS3, and JavaScript (ES6).
- **Backend:** ExtendScript (JSX) using the Premiere Pro Object Model.
- **Communication:** Uses `CSInterface.js` for bidirectional communication between the panel and the Premiere Pro host.
- **Compatibility:** Optimized for Premiere Pro v24+, with backwards compatibility for the `setColorByIndex` API.

## Project Structure

- `client/`: UI layer (HTML, CSS, and Panel Logic).
- `host/`: ExtendScript logic for interacting with the Premiere Pro project and timeline.
- `CSXS/`: Manifest file defining extension properties and host application requirements.
- `css/`: Styling for the panel interface.

## License

MIT
