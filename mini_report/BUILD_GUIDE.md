# Building and Running the Mini Report LaTeX File

This guide explains how to build and properly compile the `mini_report.tex` file for the Kuma project.

## Prerequisites

### Required Software

1. **LaTeX Distribution** (choose one based on your OS):
   - **Linux (Ubuntu/Debian)**: TeX Live
   - **macOS**: MacTeX
   - **Windows**: MiKTeX or TeX Live

2. **PDF Viewer**: Any PDF viewer (evince, okular, Adobe Reader, etc.)

3. **Text Editor** (optional but recommended):
   - VS Code with LaTeX Workshop extension
   - TeXstudio
   - Overleaf (online)

## Installation Instructions

### Linux (Ubuntu/Debian)

```bash
# Install full TeX Live distribution
sudo apt update
sudo apt install texlive-full

# Or install minimal version with required packages
sudo apt install texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-science
```

### macOS

```bash
# Install MacTeX using Homebrew
brew install --cask mactex

# Or download from: https://www.tug.org/mactex/
```

### Windows

1. Download MiKTeX from: https://miktex.org/download
2. Run the installer and follow the setup wizard
3. Choose "Install missing packages on-the-fly: Yes"

## Building the Document

### Method 1: Using Command Line (Recommended)

Navigate to the mini_report directory:

```bash
cd /home/himanshu/Desktop/Kuma/mini_report
```

#### Basic Compilation

```bash
# First pass - generates auxiliary files
pdflatex mini_report.tex

# Second pass - resolves cross-references
pdflatex mini_report.tex

# Third pass - finalizes table of contents and references
pdflatex mini_report.tex
```

**Why multiple passes?**
- 1st pass: Generates `.aux`, `.toc`, `.lof`, `.lot` files
- 2nd pass: Resolves cross-references and citations
- 3rd pass: Ensures all references are correct

#### Full Build with Bibliography

```bash
# Compile LaTeX
pdflatex mini_report.tex

# Process bibliography (if you add citations)
bibtex mini_report

# Recompile to include bibliography
pdflatex mini_report.tex
pdflatex mini_report.tex
```

#### Using latexmk (Automated Build)

```bash
# Install latexmk if not already installed
sudo apt install latexmk  # Linux
brew install latexmk      # macOS

# Build with automatic dependency resolution
latexmk -pdf mini_report.tex

# Build and continuously watch for changes
latexmk -pdf -pvc mini_report.tex
```

### Method 2: Using VS Code with LaTeX Workshop

1. **Install VS Code Extension**:
   - Open VS Code
   - Install "LaTeX Workshop" extension by James Yu

2. **Open the file**:
   ```bash
   code mini_report.tex
   ```

3. **Build**:
   - Press `Ctrl+Alt+B` (or `Cmd+Option+B` on macOS)
   - Or click the green play button in the top right
   - Or use Command Palette: `Ctrl+Shift+P` → "LaTeX Workshop: Build LaTeX project"

4. **View PDF**:
   - Press `Ctrl+Alt+V` (or `Cmd+Option+V` on macOS)
   - Or click the magnifying glass icon

### Method 3: Using TeXstudio

1. **Install TeXstudio**:
   ```bash
   sudo apt install texstudio  # Linux
   brew install --cask texstudio  # macOS
   ```

2. **Open the file**:
   - Launch TeXstudio
   - File → Open → Select `mini_report.tex`

3. **Build**:
   - Press `F5` (Build & View)
   - Or Tools → Build & View
   - Or click the green arrow button

### Method 4: Using Overleaf (Online)

1. Go to https://www.overleaf.com
2. Create a free account
3. Create a new project → Upload Project
4. Upload `mini_report.tex` and `Logo.png`
5. Click "Recompile" button

## Viewing the Output

After successful compilation, open the generated PDF:

```bash
# Linux
xdg-open mini_report.pdf
# or
evince mini_report.pdf

# macOS
open mini_report.pdf

# Windows
start mini_report.pdf
```

## Common Issues and Solutions

### Issue 1: Missing Packages

**Error**: `! LaTeX Error: File 'package.sty' not found.`

**Solution**:
```bash
# Linux - Install missing package
sudo apt install texlive-latex-extra texlive-fonts-extra

# Or install specific package
sudo apt-cache search texlive | grep <package-name>
sudo apt install <package-name>
```

### Issue 2: Logo Not Found

**Error**: `! LaTeX Error: File 'Logo' not found.`

**Solution**:
- Ensure `Logo.png` is in the same directory as `mini_report.tex`
- The file references `Logo` without extension (LaTeX auto-detects `.png`, `.pdf`, `.jpg`)

### Issue 3: Compilation Hangs

**Solution**:
- Press `X` or `Ctrl+C` to stop
- Check for syntax errors in the `.tex` file
- Look at the `.log` file for detailed error messages

### Issue 4: References Not Showing

**Solution**:
- Run `pdflatex` multiple times (at least 2-3 times)
- This resolves cross-references and table of contents

### Issue 5: Bibliography Not Appearing

**Solution**:
```bash
pdflatex mini_report.tex
bibtex mini_report
pdflatex mini_report.tex
pdflatex mini_report.tex
```

## Cleaning Build Files

To remove auxiliary files and keep only source and PDF:

```bash
# Manual cleanup
rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.synctex.gz

# Using latexmk
latexmk -c  # Clean auxiliary files
latexmk -C  # Clean all including PDF
```

## Quick Reference Commands

```bash
# Quick build (3 passes)
pdflatex mini_report.tex && pdflatex mini_report.tex && pdflatex mini_report.tex

# Build and view
pdflatex mini_report.tex && xdg-open mini_report.pdf

# Full build with bibliography
pdflatex mini_report.tex && bibtex mini_report && pdflatex mini_report.tex && pdflatex mini_report.tex

# Automated build with latexmk
latexmk -pdf mini_report.tex

# Watch mode (auto-rebuild on changes)
latexmk -pdf -pvc mini_report.tex
```

## File Structure

After building, you'll see these files:

```
mini_report/
├── mini_report.tex       # Source LaTeX file
├── Logo.png              # College logo image
├── mini_report.pdf       # Output PDF (generated)
├── mini_report.aux       # Auxiliary file (generated)
├── mini_report.log       # Build log (generated)
├── mini_report.toc       # Table of contents (generated)
├── mini_report.lof       # List of figures (generated)
├── mini_report.lot       # List of tables (generated)
├── mini_report.out       # Hyperref output (generated)
└── mini_report.synctex.gz # SyncTeX data (generated)
```

## Next Steps

1. **Fill in the placeholders**: The document has many `[Add content here]` sections that need to be filled
2. **Add figures**: Uncomment and add actual diagram images
3. **Complete tables**: Fill in the performance metrics tables
4. **Add code snippets**: Include relevant code examples
5. **Review and proofread**: Check for typos and formatting issues

## Tips for Editing

1. **Incremental builds**: Build frequently to catch errors early
2. **Comment sections**: Use `%` to comment out sections you're not working on
3. **Version control**: Commit changes to Git regularly
4. **Backup**: Keep backups of your work
5. **Use templates**: The structure is already set up, just fill in content

## Getting Help

- **LaTeX Documentation**: https://www.latex-project.org/help/documentation/
- **Stack Exchange**: https://tex.stackexchange.com/
- **Overleaf Guides**: https://www.overleaf.com/learn

---

**Note**: The document is currently a template with placeholders. You'll need to fill in the actual content for your Kuma project, including abstracts, implementation details, screenshots, and results.
