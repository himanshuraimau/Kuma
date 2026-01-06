#!/bin/bash
# Clean and rebuild LaTeX document

echo "Cleaning auxiliary files..."
rm -f mini_report.aux mini_report.toc mini_report.lof mini_report.lot mini_report.out mini_report.log mini_report.bbl mini_report.blg

echo "First compilation pass..."
pdflatex -interaction=nonstopmode mini_report.tex > /dev/null

echo "Second compilation pass (for cross-references)..."
pdflatex -interaction=nonstopmode mini_report.tex > /dev/null

echo "Third compilation pass (for table of contents)..."
pdflatex -interaction=nonstopmode mini_report.tex

echo ""
echo "Build complete! Check mini_report.pdf"
