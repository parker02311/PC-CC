<h1 align="center"> <img src="/Website/app/icon0.svg" alt="Icon" height=35 width=35 style="vertical-align: middle;" /> Planet Coaster : Coaster Converter</h1>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<div align="center">

  ![Contains Hacks](https://img.shields.io/badge/Contains-Hacks-389ad5?style=for-the-badge&labelColor=31c4f3)

</div>

---

# Mod Importer

This mod allows you to import a Lua file containing coaster data into Planet Coaster 2.

## Installation

> [!WARNING]
> This mod requires [ACSE](https://www.nexusmods.com/planetcoaster2/mods/1) to work. Make sure you have it installed before proceeding.

1. Download the latest release from the [Releases page](https://github.com/parker02311/PC-CC/releases/latest).
2. Extract the contents of the ZIP file into your `Planet Coaster 2/Win64/ovldata`.

Modding is not supported by Frontier, so use this mod at your own risk. It may cause unexpected behavior in the game.

# NL2 CSV Converter

We have a website that allows you to convert NL2 CSV files to Lua files that can be imported into Planet Coaster 2.

## Usage
1. Go to the [Website](https://pccc.redon.tech).
2. Upload your NL2 CSV file. (If you do not own a professional copy of NL2, you can use the NL2 CSV Exporter)
3. The website will process the file and provide you with a Lua file.
4. Follow the instructions provided by the website to add the Lua file to your game.

# Development

## Building the Mod

To build the mod you must have Cobra Tools installed.

1. Package the UI (only necessary if you have made changes to the UI):
   - Open a terminal in the `Mod_Importer/Main` directory.
   - Run `python PPUIPkgFile.py -i ImporterUI.ppuipkg`
2. Run `Cobra Tools/ovl_tool_gui.py`
3. In the GUI go Edit -> Preferences `Flatten LUA subfolders` option to `True`.
4. Go File -> New and select the `Mod_Importer/Main` folder.
5. Click File -> Save

## Local Website Development

To run the NL2 CSV to Lua converter website locally, you need to have Node.js installed.

1. Open a terminal in the `Website` directory.
2. Run `npm install` to install the required dependencies.
3. Run `npm run dev` to start the development server.

The website will automatically build when the repository updates. However, it is recommended to run `npm run build` to ensure that type/lint checks pass before committing changes.

# Credits

Massive thank you to **Inaki** for the original effort to create a PC1 importer, which this mod is based on.

Another massive thank you to **Distantz** for creating the original NL2 CSV to Lua python converter which the website is based on.

And of course, thank you to **coppertime** and the rest of the modding community for their support and listening to my weeks of trying to figure out crashes.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/evanpipta"><img src="https://avatars.githubusercontent.com/u/9023427?v=4?s=100" width="100px;" alt="Evan Pipta"/><br /><sub><b>Evan Pipta</b></sub></a><br /><a href="#ideas-evanpipta" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-evanpipta" title="Design">🎨</a> <a href="https://github.com/parker02311/PC-CC/commits?author=evanpipta" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->